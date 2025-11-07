// File: src/hooks/useGuardAssignments.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { assignmentService, type FormattedAssignment } from "../services/assignment.service";

// Query keys for guard assignments
export const assignmentQueryKeys = {
  all: ["guardAssignments"] as const,
  assignments: (guardId: string) => [...assignmentQueryKeys.all, guardId] as const,
};

// Hook for getting guard assignments
export const useGuardAssignments = (guardId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: assignmentQueryKeys.assignments(guardId || ""),
    queryFn: () => {
      if (!guardId) {
        throw new Error("Guard ID is required");
      }

      if (!assignmentService.validateGuardId(guardId)) {
        throw new Error("Invalid guard ID format");
      }

      return assignmentService.getGuardAssignments(guardId);
    },
    enabled: enabled && !!guardId && assignmentService.validateGuardId(guardId),
    staleTime: 10 * 60 * 1000, // 10 minutes - assignments don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Only refetch if data is stale
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors or validation errors
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.message?.includes("Invalid guard ID") ||
        error?.message?.includes("required")
      ) {
        return false;
      }

      // Don't retry on 404 - just return empty assignments
      if (error?.response?.status === 404) {
        return false;
      }

      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for assignment utilities
export const useGuardAssignmentUtils = () => {
  const queryClient = useQueryClient();

  const prefetchGuardAssignments = async (guardId: string) => {
    if (!assignmentService.validateGuardId(guardId)) {
      console.warn("Invalid guard ID for prefetch:", guardId);
      return;
    }

    await queryClient.prefetchQuery({
      queryKey: assignmentQueryKeys.assignments(guardId),
      queryFn: () => assignmentService.getGuardAssignments(guardId),
      staleTime: 10 * 60 * 1000,
    });
  };

  const invalidateGuardAssignments = (guardId: string) => {
    queryClient.invalidateQueries({
      queryKey: assignmentQueryKeys.assignments(guardId),
    });
  };

  const removeGuardAssignmentsFromCache = (guardId: string) => {
    queryClient.removeQueries({
      queryKey: assignmentQueryKeys.assignments(guardId),
    });
  };

  const getGuardAssignmentsFromCache = (guardId: string): FormattedAssignment[] | undefined => {
    return queryClient.getQueryData<FormattedAssignment[]>(assignmentQueryKeys.assignments(guardId));
  };

  const clearAllAssignmentCache = () => {
    queryClient.removeQueries({
      queryKey: assignmentQueryKeys.all,
    });
  };

  return {
    prefetchGuardAssignments,
    invalidateGuardAssignments,
    removeGuardAssignmentsFromCache,
    getGuardAssignmentsFromCache,
    clearAllAssignmentCache,
  };
};
