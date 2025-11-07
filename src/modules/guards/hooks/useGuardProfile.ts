// File: src/hooks/useGuardProfile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guardProfileService, type GuardProfileUpdateRequest } from "../services/guard-profile.service";
import type { APIGuard } from "../services/guards-api.service";

// Query keys for guard profile
export const guardProfileQueryKeys = {
  all: ["guardProfile"] as const,
  profile: (guardId: string, agencyId: string) => [...guardProfileQueryKeys.all, guardId, agencyId] as const,
};

// Hook for getting guard profile with caching
export const useGuardProfile = (guardId: string | null, agencyId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: guardProfileQueryKeys.profile(guardId || "", agencyId || ""),
    queryFn: () => guardProfileService.getGuardProfile(guardId!, agencyId!),
    enabled: enabled && !!guardId && !!agencyId,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for longer
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Only refetch if data is stale
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (guard not found) or auth errors
      if (error?.response?.status === 404 || error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for updating guard profile with section-specific validation
export const useUpdateGuardProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      guardId,
      agencyId,
      updateData,
    }: {
      guardId: string;
      agencyId: string;
      updateData: GuardProfileUpdateRequest;
    }) => {
      // Only validate the sections being updated
      const validationErrors = guardProfileService.validateUpdateData(updateData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      return guardProfileService.updateGuardProfile(guardId, agencyId, updateData);
    },

    onMutate: async ({ guardId, agencyId, updateData }) => {
      console.log(`🔄 Starting profile update for guard: ${guardId}`, updateData);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: guardProfileQueryKeys.profile(guardId, agencyId),
      });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<APIGuard>(guardProfileQueryKeys.profile(guardId, agencyId));

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

        queryClient.setQueryData(guardProfileQueryKeys.profile(guardId, agencyId), optimisticProfile);
      }

      return { previousProfile, guardId, agencyId };
    },

    onSuccess: (updatedProfile, { guardId, agencyId }) => {
      console.log(`✅ Profile updated successfully for guard: ${guardId}`);
      console.log(`📝 Updated profile data:`, updatedProfile);

      // Immediately update the cache with the server response (this is the most important part)
      queryClient.setQueryData(guardProfileQueryKeys.profile(guardId, agencyId), updatedProfile);

      // Don't invalidate the profile query immediately - let the user see the update first
      // Instead, invalidate related queries after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["guards"] }); // Refresh guards list
      }, 500);
    },

    onError: (error: any, { guardId, agencyId }, context) => {
      console.error(`❌ Failed to update profile for guard: ${guardId}`, error);

      // Rollback optimistic update
      if (context?.previousProfile) {
        queryClient.setQueryData(guardProfileQueryKeys.profile(guardId, agencyId), context.previousProfile);
      }
    },

    // Remove onSettled to prevent immediate cache invalidation
    // onSettled: (_data, _error, { guardId, agencyId }) => {
    //   // This was causing the issue - invalidating too early
    // },
  });
};

// Specialized hooks for different profile sections with section-specific validation
export const useUpdatePersonalDetails = () => {
  const updateProfile = useUpdateGuardProfile();

  return {
    updatePersonalDetails: (guardId: string, agencyId: string, personalDetails: any) => {
      console.log("🔄 Updating personal details:", personalDetails);

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
          "Widow/Widower": "WIDOWED",
        };
        cleanPersonalDetails.martialStatus = statusMapping[maritalStatus] || maritalStatus;
      }

      const updateData: GuardProfileUpdateRequest = {
        personalDetails: cleanPersonalDetails,
      };

      // Add family members if any exist
      if (Object.keys(familyMembers).length > 0) {
        updateData.familyMembers = familyMembers;
        console.log("📝 Including family members in update:", familyMembers);
      }

      console.log("📤 Final update data:", updateData);

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

export const useUpdateContactDetails = () => {
  const updateProfile = useUpdateGuardProfile();

  return {
    updateContactDetails: (guardId: string, agencyId: string, contactDetails: any) => {
      console.log("🔄 Updating contact details:", contactDetails);

      const updateData: GuardProfileUpdateRequest = {
        contactDetails: contactDetails,
      };

      console.log("📤 Final update data:", updateData);

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

export const useUpdateEmergencyContact = () => {
  const updateProfile = useUpdateGuardProfile();

  return {
    updateEmergencyContact: (guardId: string, agencyId: string, emergencyContact: any) => {
      console.log("🔄 Updating emergency contact:", emergencyContact);

      const updateData: GuardProfileUpdateRequest = {
        emergencyContact: emergencyContact,
      };

      console.log("📤 Final update data:", updateData);

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

export const useUpdateEmploymentDetails = () => {
  const updateProfile = useUpdateGuardProfile();

  return {
    updateEmploymentDetails: (guardId: string, agencyId: string, employmentDetails: any) => {
      console.log("🔄 Updating employment details:", employmentDetails);

      // Note: Employment details might need to be handled differently
      // since they're related to the employments array, not direct guard fields
      const updateData: GuardProfileUpdateRequest = {
        employmentDetails: employmentDetails,
      };

      console.log("📤 Final update data:", updateData);

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

// Utility hook for profile cache management
export const useGuardProfileUtils = () => {
  const queryClient = useQueryClient();

  const prefetchGuardProfile = async (guardId: string, agencyId: string) => {
    await queryClient.prefetchQuery({
      queryKey: guardProfileQueryKeys.profile(guardId, agencyId),
      queryFn: () => guardProfileService.getGuardProfile(guardId, agencyId),
      staleTime: 10 * 60 * 1000,
    });
  };

  const invalidateGuardProfile = (guardId: string, agencyId: string) => {
    queryClient.invalidateQueries({
      queryKey: guardProfileQueryKeys.profile(guardId, agencyId),
    });
  };

  const removeGuardProfileFromCache = (guardId: string, agencyId: string) => {
    queryClient.removeQueries({
      queryKey: guardProfileQueryKeys.profile(guardId, agencyId),
    });
  };

  const getGuardProfileFromCache = (guardId: string, agencyId: string): APIGuard | undefined => {
    return queryClient.getQueryData<APIGuard>(guardProfileQueryKeys.profile(guardId, agencyId));
  };

  const clearAllProfileCache = () => {
    queryClient.removeQueries({
      queryKey: guardProfileQueryKeys.all,
    });
  };

  return {
    prefetchGuardProfile,
    invalidateGuardProfile,
    removeGuardProfileFromCache,
    getGuardProfileFromCache,
    clearAllProfileCache,
  };
};
