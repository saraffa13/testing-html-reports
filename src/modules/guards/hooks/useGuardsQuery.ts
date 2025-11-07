// File: src/hooks/useGuardsQuery.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { guardsAPIService, type Guard } from "../services/guards-api.service";

// Query keys for guards
export const guardsQueryKeys = {
  all: ["guards"] as const,
  lists: () => [...guardsQueryKeys.all, "list"] as const,
  list: (params?: { page?: number; limit?: number; search?: string }) => [...guardsQueryKeys.lists(), params] as const,
  details: () => [...guardsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...guardsQueryKeys.details(), id] as const,
};

// Hook to get all guards with pagination
export const useGuardsQuery = (params?: { page?: number; limit?: number; search?: string; enabled?: boolean }) => {
  return useQuery({
    queryKey: guardsQueryKeys.list(params),
    queryFn: () => guardsAPIService.getGuards(params),
    enabled: params?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // ✅ Changed to false to prevent unnecessary refetches
    refetchOnReconnect: false, // ✅ Added to prevent refetch on network reconnect
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook to get a single guard by ID
export const useGuardQuery = (id: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: guardsQueryKeys.detail(id || ""),
    queryFn: () => guardsAPIService.getGuardById(id!),
    enabled: !!id && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual guards
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // ✅ Prevent unnecessary refetches
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false; // Don't retry if guard not found
      }
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false; // Don't retry on auth errors
      }
      return failureCount < 2;
    },
  });
};

// Hook to search guards
export const useGuardsSearch = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...guardsQueryKeys.lists(), "search", searchTerm],
    queryFn: () => guardsAPIService.searchGuards(searchTerm),
    enabled: enabled && !!searchTerm.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // ✅ Prevent unnecessary refetches
  });
};

// Custom hook to manage guards data with local state
export const useGuardsWithState = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isRefetching } = useGuardsQuery({
    enabled: true, // Only enable when explicitly needed
  });

  // Extract data with defaults
  const guards = data?.guards || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 0;

  // Memoized refresh function
  const refreshGuards = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Memoized invalidate function
  const invalidateGuards = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: guardsQueryKeys.all });
  }, [queryClient]);

  // Memoized get guard by name
  const getGuardByName = React.useCallback(
    (name: string): Guard | undefined => {
      const formattedSearchName = name.toLowerCase();

      let guard = guards.find((g) => g.name.toLowerCase() === formattedSearchName);

      if (!guard) {
        guard = guards.find((g) => {
          const guardNameUrl = g.name.toLowerCase().replace(/\s+/g, "-");
          return guardNameUrl === formattedSearchName || formattedSearchName.includes(guardNameUrl);
        });
      }

      return guard;
    },
    [guards]
  );

  // Memoized get guard by ID
  const getGuardById = React.useCallback(
    async (id: string): Promise<Guard> => {
      // First try to find in current data
      const guardInList = guards.find((g) => g.id === id);
      if (guardInList) {
        return guardInList;
      }

      // If not found, fetch from API
      return await guardsAPIService.getGuardById(id);
    },
    [guards]
  );

  return {
    guards,
    loading: isLoading,
    error: error?.message || null,
    total,
    currentPage,
    totalPages,
    isRefetching,
    refreshGuards,
    invalidateGuards,
    getGuardByName,
    getGuardById,
  };
};
