// File: src/hooks/useOfficerProfile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { officerProfileService, type OfficerProfileUpdateRequest } from "../service/officer-profile.service";
import { officersAPIService, type APIOfficerProfile } from "../service/officers-api.service";

// Query keys for officer profile - using guard ID now
export const officerProfileQueryKeys = {
  all: ["officerProfile"] as const,
  profile: (guardId: string, agencyId: string) => [...officerProfileQueryKeys.all, guardId, agencyId] as const,
};

// Hook for getting officer profile with direct guard ID usage
export const useOfficerProfile = (guardId: string | null, agencyId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: officerProfileQueryKeys.profile(guardId || "", agencyId || ""),
    queryFn: async () => {
      console.log("🔄 Officer profile query starting with GUARD ID:", guardId);

      if (!guardId || !agencyId) {
        throw new Error("Guard ID and Agency ID are required");
      }

      // Use the guard ID directly - no conversion needed
      return await officersAPIService.getOfficerProfile(guardId, agencyId);
    },
    enabled: enabled && !!guardId && !!agencyId,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for longer
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Only refetch if data is stale
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (officer not found) or auth errors
      if (error?.response?.status === 404 || error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for updating officer profile with section-specific validation
export const useUpdateOfficerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      guardId,
      agencyId,
      updateData,
    }: {
      guardId: string;
      agencyId: string;
      updateData: OfficerProfileUpdateRequest;
    }) => {
      // Only validate the sections being updated
      const validationErrors = officerProfileService.validateUpdateData(updateData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      return officerProfileService.updateOfficerProfile(guardId, agencyId, updateData);
    },

    onMutate: async ({ guardId, agencyId, updateData }) => {
      console.log(`🔄 Starting officer profile update for guard: ${guardId}`, updateData);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: officerProfileQueryKeys.profile(guardId, agencyId),
      });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<APIOfficerProfile>(
        officerProfileQueryKeys.profile(guardId, agencyId)
      );

      // Optimistically update the cache
      if (previousProfile) {
        const optimisticProfile = { ...previousProfile };

        // Apply optimistic updates based on updateData
        if (updateData.personalDetails) {
          Object.assign(optimisticProfile, updateData.personalDetails);
        }

        if (updateData.contactDetails?.phoneNumber) {
          optimisticProfile.phoneNumber = updateData.contactDetails.phoneNumber;
        }

        queryClient.setQueryData(officerProfileQueryKeys.profile(guardId, agencyId), optimisticProfile);
      }

      return { previousProfile, guardId, agencyId };
    },

    onSuccess: (updatedProfile, { guardId, agencyId }) => {
      console.log(`✅ Officer profile updated successfully for guard: ${guardId}`);
      console.log(`📝 Updated officer profile data:`, updatedProfile);

      // Immediately update the cache with the server response (this is the most important part)
      queryClient.setQueryData(officerProfileQueryKeys.profile(guardId, agencyId), updatedProfile);

      // Don't invalidate the profile query immediately - let the user see the update first
      // Instead, invalidate related queries after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["officers"] }); // Refresh officers list
      }, 500);
    },

    onError: (error: any, { guardId, agencyId }, context) => {
      console.error(`❌ Failed to update officer profile for guard: ${guardId}`, error);

      // Rollback optimistic update
      if (context?.previousProfile) {
        queryClient.setQueryData(officerProfileQueryKeys.profile(guardId, agencyId), context.previousProfile);
      }
    },

    // Remove onSettled to prevent immediate cache invalidation
    // onSettled: (_data, _error, { guardId, agencyId }) => {
    //   // This was causing the issue - invalidating too early
    // },
  });
};

// Specialized hooks for different profile sections with section-specific validation
export const useUpdateOfficerPersonalDetails = () => {
  const updateProfile = useUpdateOfficerProfile();

  return {
    updatePersonalDetails: (guardId: string, agencyId: string, personalDetails: any) => {
      console.log("🔄 Updating officer personal details:", personalDetails);

      // Create family members data if names are provided
      const familyMembers: any = {};
      if (personalDetails.fatherName) familyMembers.fatherName = personalDetails.fatherName;
      if (personalDetails.motherName) familyMembers.motherName = personalDetails.motherName;
      if (personalDetails.spouseName) familyMembers.spouseName = personalDetails.spouseName;

      // Remove family member fields from personal details
      const { fatherName, motherName, spouseName, maritalStatus, ...cleanPersonalDetails } = personalDetails;

      // Map marital status to API format
      if (maritalStatus) {
        const statusMapping: { [key: string]: string } = {
          Single: "SINGLE",
          Married: "MARRIED",
          Divorced: "DIVORCED",
          Widowed: "WIDOWED",
        };
        cleanPersonalDetails.martialStatus = statusMapping[maritalStatus] || maritalStatus;
      }

      const updateData: OfficerProfileUpdateRequest = {
        personalDetails: cleanPersonalDetails,
      };

      // Add family members if any exist
      if (Object.keys(familyMembers).length > 0) {
        updateData.familyMembers = familyMembers;
        console.log("📝 Including family members in officer update:", familyMembers);
      }

      console.log("📤 Final officer update data:", updateData);

      return updateProfile.mutateAsync({
        guardId,
        agencyId,
        updateData,
      });
    },
    isLoading: updateProfile.isPending,
    error: updateProfile.error,
    isSuccess: updateProfile.isSuccess,
    reset: updateProfile.reset,
  };
};

export const useUpdateOfficerContactDetails = () => {
  const updateProfile = useUpdateOfficerProfile();

  return {
    updateContactDetails: (guardId: string, agencyId: string, contactDetails: any) => {
      console.log("🔄 Updating officer contact details:", contactDetails);

      const updateData: OfficerProfileUpdateRequest = {
        contactDetails: contactDetails,
      };

      console.log("📤 Final officer contact update data:", updateData);

      return updateProfile.mutateAsync({
        guardId,
        agencyId,
        updateData,
      });
    },
    isLoading: updateProfile.isPending,
    error: updateProfile.error,
    isSuccess: updateProfile.isSuccess,
    reset: updateProfile.reset,
  };
};

export const useUpdateOfficerEmergencyContact = () => {
  const updateProfile = useUpdateOfficerProfile();

  return {
    updateEmergencyContact: (guardId: string, agencyId: string, emergencyContact: any) => {
      console.log("🔄 Updating officer emergency contact:", emergencyContact);

      const updateData: OfficerProfileUpdateRequest = {
        emergencyContact: emergencyContact,
      };

      console.log("📤 Final officer emergency contact update data:", updateData);

      return updateProfile.mutateAsync({
        guardId,
        agencyId,
        updateData,
      });
    },
    isLoading: updateProfile.isPending,
    error: updateProfile.error,
    isSuccess: updateProfile.isSuccess,
    reset: updateProfile.reset,
  };
};

export const useUpdateOfficerEmploymentDetails = () => {
  const updateProfile = useUpdateOfficerProfile();

  return {
    updateEmploymentDetails: (guardId: string, agencyId: string, employmentDetails: any) => {
      console.log("🔄 Updating officer employment details:", employmentDetails);

      // Note: Employment details might need to be handled differently
      // since they're related to the employments array, not direct officer fields
      const updateData: OfficerProfileUpdateRequest = {
        employmentDetails: employmentDetails,
      };

      console.log("📤 Final officer employment update data:", updateData);

      return updateProfile.mutateAsync({
        guardId,
        agencyId,
        updateData,
      });
    },
    isLoading: updateProfile.isPending,
    error: updateProfile.error,
    isSuccess: updateProfile.isSuccess,
    reset: updateProfile.reset,
  };
};

// Utility hook for officer profile cache management
export const useOfficerProfileUtils = () => {
  const queryClient = useQueryClient();

  const prefetchOfficerProfile = async (guardId: string, agencyId: string) => {
    await queryClient.prefetchQuery({
      queryKey: officerProfileQueryKeys.profile(guardId, agencyId),
      queryFn: () => officersAPIService.getOfficerProfile(guardId, agencyId),
      staleTime: 10 * 60 * 1000,
    });
  };

  const invalidateOfficerProfile = (guardId: string, agencyId: string) => {
    queryClient.invalidateQueries({
      queryKey: officerProfileQueryKeys.profile(guardId, agencyId),
    });
  };

  const removeOfficerProfileFromCache = (guardId: string, agencyId: string) => {
    queryClient.removeQueries({
      queryKey: officerProfileQueryKeys.profile(guardId, agencyId),
    });
  };

  const getOfficerProfileFromCache = (guardId: string, agencyId: string): APIOfficerProfile | undefined => {
    return queryClient.getQueryData<APIOfficerProfile>(officerProfileQueryKeys.profile(guardId, agencyId));
  };

  const clearAllOfficerProfileCache = () => {
    queryClient.removeQueries({
      queryKey: officerProfileQueryKeys.all,
    });
  };

  return {
    prefetchOfficerProfile,
    invalidateOfficerProfile,
    removeOfficerProfileFromCache,
    getOfficerProfileFromCache,
    clearAllOfficerProfileCache,
  };
};
