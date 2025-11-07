// File: src/hooks/useOfficerMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { officerService } from "../service/officer.service";
import type { CreateOfficerResponse, OfficerFormData } from "../types/officers.types";

export const useOfficerMutations = () => {
  const queryClient = useQueryClient();

  // Create officer mutation with proper cache invalidation
  const createOfficerMutation = useMutation({
    mutationFn: (formData: OfficerFormData) => officerService.createOfficer(formData),

    onMutate: async (formData) => {
      // Extract agency ID from company ID
      const agencyId = formData.employmentDetails.companyId;

      console.log("🔄 Starting officer creation process...", {
        officerName: `${formData.personalDetails.firstName} ${formData.personalDetails.lastName}`,
        agencyId,
        phone: formData.contactDetails.mobileNumber,
        email: formData.personalDetails.email,
        designation: formData.employmentDetails.designation,
        assignedArea: formData.employmentDetails.assignedDutyArea,
        areaManager: formData.employmentDetails.areaManager,
        hasPhoto: !!formData.personalDetails.profilePhoto,
        selectedDocuments: formData.documentVerification.documents.filter((doc) => doc.isSelected).length,
        userType: "AREA_OFFICER", // 🔥 Will be enforced in service layer
      });

      // Validate form data before submission
      const validationErrors = officerService.validateFormData(formData);
      if (validationErrors.length > 0) {
        console.error("❌ Validation errors:", validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      return { formData, agencyId };
    },

    onSuccess: async (data: CreateOfficerResponse, _formData) => {
      // Extract agency ID for cache operations

      console.log("✅ Officer created successfully:", {
        id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        status: data.status,
        userType: data.userType, // 🔥 Should be AREA_OFFICER
        email: data.email,
        phone: data.phoneNumber,
        createdAt: data.createdAt,
      });

      // 🔥 CRITICAL: Verify that the created officer has the correct userType
      if (data.userType !== "AREA_OFFICER") {
        console.error("❌ CRITICAL ERROR: Officer was not created with AREA_OFFICER userType!", {
          expectedUserType: "AREA_OFFICER",
          actualUserType: data.userType,
          officerId: data.id,
        });
      } else {
        console.log("✅ VERIFIED: Officer created with correct userType (AREA_OFFICER)");
      }

      // 🔥 CRITICAL: Invalidate ALL officers-related queries to force refresh
      console.log("🔄 Invalidating officers cache to refresh the table...");

      // Invalidate all officers queries
      await queryClient.invalidateQueries({ queryKey: ["officers"] });

      // Also invalidate any specific queries that might exist
      queryClient.removeQueries({ queryKey: ["officers"] });

      // Add the new officer to the cache immediately for faster UI update
      queryClient.setQueryData(["officer", data.id], data);

      console.log("🎉 Officer registration completed and cache invalidated!");
    },

    onError: (error: any, formData, _context) => {
      const agencyId = formData.employmentDetails.companyId;

      console.error("❌ Failed to create officer:", {
        error: error.message,
        officerName: `${formData.personalDetails.firstName} ${formData.personalDetails.lastName}`,
        agencyId,
      });

      // Log specific error details for debugging
      if (error.response) {
        console.error("Response Error Details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }
    },

    onSettled: (data, error, formData) => {
      const agencyId = formData.employmentDetails.companyId;

      console.log("🔄 Officer creation process completed", {
        success: !!data,
        error: error?.message,
        officerName: `${formData.personalDetails.firstName} ${formData.personalDetails.lastName}`,
        agencyId,
      });
    },
  });

  // Update officer mutation (placeholder for future implementation)
  const updateOfficerMutation = useMutation({
    mutationFn: ({}: { id: string; formData: Partial<OfficerFormData>; agencyId: string }) => {
      throw new Error("Update officer functionality not implemented yet");
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["officers"] });
      queryClient.invalidateQueries({ queryKey: ["officer", variables.id] });
    },
  });

  // Delete/Remove officer mutation (placeholder for future implementation)
  const deleteOfficerMutation = useMutation({
    mutationFn: ({}: { id: string; agencyId: string }) => {
      throw new Error("Delete officer functionality not implemented yet");
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["officers"] });
      queryClient.removeQueries({ queryKey: ["officer", variables.id] });
    },
  });

  return {
    // Create Officer
    createOfficer: createOfficerMutation.mutate,
    createOfficerAsync: createOfficerMutation.mutateAsync,
    isCreatingOfficer: createOfficerMutation.isPending,
    createOfficerError: createOfficerMutation.error,
    createOfficerSuccess: createOfficerMutation.isSuccess,
    createOfficerData: createOfficerMutation.data,
    resetCreateOfficer: createOfficerMutation.reset,

    // Update Officer (for future use)
    updateOfficer: updateOfficerMutation.mutate,
    updateOfficerAsync: updateOfficerMutation.mutateAsync,
    isUpdatingOfficer: updateOfficerMutation.isPending,
    updateOfficerError: updateOfficerMutation.error,
    updateOfficerSuccess: updateOfficerMutation.isSuccess,
    updateOfficerData: updateOfficerMutation.data,
    resetUpdateOfficer: updateOfficerMutation.reset,

    // Delete Officer (for future use)
    deleteOfficer: deleteOfficerMutation.mutate,
    deleteOfficerAsync: deleteOfficerMutation.mutateAsync,
    isDeletingOfficer: deleteOfficerMutation.isPending,
    deleteOfficerError: deleteOfficerMutation.error,
    deleteOfficerSuccess: deleteOfficerMutation.isSuccess,
    resetDeleteOfficer: deleteOfficerMutation.reset,

    // General utilities
    isLoading: createOfficerMutation.isPending || updateOfficerMutation.isPending || deleteOfficerMutation.isPending,
    hasError: !!createOfficerMutation.error || !!updateOfficerMutation.error || !!deleteOfficerMutation.error,

    // Reset all mutations
    resetAll: () => {
      createOfficerMutation.reset();
      updateOfficerMutation.reset();
      deleteOfficerMutation.reset();
    },
  };
};
