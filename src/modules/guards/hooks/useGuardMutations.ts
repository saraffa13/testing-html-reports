// File: src/hooks/useGuardMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { guardService } from "../services/guard.service";
import type { CreateGuardResponse, GuardFormData } from "../types/guard.types";

export const useGuardMutations = () => {
  const queryClient = useQueryClient();

  // Create guard mutation with proper cache invalidation
  const createGuardMutation = useMutation({
    mutationFn: (formData: GuardFormData) => guardService.createGuard(formData),

    onMutate: async (formData) => {
      // Extract agency ID from company ID
      const agencyId = formData.employmentDetails.companyId;

      console.log("🔄 Starting guard creation process...", {
        guardName: `${formData.personalDetails.firstName} ${formData.personalDetails.lastName}`,
        agencyId,
        phone: formData.contactDetails.mobileNumber,
        email: formData.personalDetails.email,
        hasPhoto: !!formData.personalDetails.profilePhoto,
        selectedDocuments: formData.documentVerification.documents.filter((doc) => doc.isSelected).length,
      });

      // Validate form data before submission
      const validationErrors = guardService.validateFormData(formData);
      if (validationErrors.length > 0) {
        console.error("❌ Validation errors:", validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      return { formData, agencyId };
    },

    onSuccess: async (data: CreateGuardResponse, _formData) => {
      // Extract agency ID for cache operations

      console.log("✅ Guard created successfully:", {
        id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        status: data.status,
        email: data.email,
        phone: data.phoneNumber,
        createdAt: data.createdAt,
      });

      // 🔥 CRITICAL: Invalidate ALL guards-related queries to force refresh
      console.log("🔄 Invalidating guards cache to refresh the table...");

      // Invalidate all guards queries
      await queryClient.invalidateQueries({ queryKey: ["guards"] });

      // Also invalidate any specific queries that might exist
      queryClient.removeQueries({ queryKey: ["guards"] });

      // Add the new guard to the cache immediately for faster UI update
      queryClient.setQueryData(["guard", data.id], data);

      console.log("🎉 Guard registration completed and cache invalidated!");
    },

    onError: (error: any, formData) => {
      const agencyId = formData.employmentDetails.companyId;

      console.error("❌ Failed to create guard:", {
        error: error.message,
        guardName: `${formData.personalDetails.firstName} ${formData.personalDetails.lastName}`,
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

      console.log("🔄 Guard creation process completed", {
        success: !!data,
        error: error?.message,
        guardName: `${formData.personalDetails.firstName} ${formData.personalDetails.lastName}`,
        agencyId,
      });
    },
  });

  // Update guard mutation (placeholder for future implementation)
  const updateGuardMutation = useMutation({
    mutationFn: ({}: { id: string; formData: Partial<GuardFormData>; agencyId: string }) => {
      throw new Error("Update guard functionality not implemented yet");
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guards"] });
      queryClient.invalidateQueries({ queryKey: ["guard", variables.id] });
    },
  });

  // Delete/Remove guard mutation (placeholder for future implementation)
  const deleteGuardMutation = useMutation({
    mutationFn: ({}: { id: string; agencyId: string }) => {
      throw new Error("Delete guard functionality not implemented yet");
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guards"] });
      queryClient.removeQueries({ queryKey: ["guard", variables.id] });
    },
  });

  return {
    // Create Guard
    createGuard: createGuardMutation.mutate,
    createGuardAsync: createGuardMutation.mutateAsync,
    isCreatingGuard: createGuardMutation.isPending,
    createGuardError: createGuardMutation.error,
    createGuardSuccess: createGuardMutation.isSuccess,
    createGuardData: createGuardMutation.data,
    resetCreateGuard: createGuardMutation.reset,

    // Update Guard (for future use)
    updateGuard: updateGuardMutation.mutate,
    updateGuardAsync: updateGuardMutation.mutateAsync,
    isUpdatingGuard: updateGuardMutation.isPending,
    updateGuardError: updateGuardMutation.error,
    updateGuardSuccess: updateGuardMutation.isSuccess,
    updateGuardData: updateGuardMutation.data,
    resetUpdateGuard: updateGuardMutation.reset,

    // Delete Guard (for future use)
    deleteGuard: deleteGuardMutation.mutate,
    deleteGuardAsync: deleteGuardMutation.mutateAsync,
    isDeletingGuard: deleteGuardMutation.isPending,
    deleteGuardError: deleteGuardMutation.error,
    deleteGuardSuccess: deleteGuardMutation.isSuccess,
    resetDeleteGuard: deleteGuardMutation.reset,

    // General utilities
    isLoading: createGuardMutation.isPending || updateGuardMutation.isPending || deleteGuardMutation.isPending,
    hasError: !!createGuardMutation.error || !!updateGuardMutation.error || !!deleteGuardMutation.error,

    // Reset all mutations
    resetAll: () => {
      createGuardMutation.reset();
      updateGuardMutation.reset();
      deleteGuardMutation.reset();
    },
  };
};
