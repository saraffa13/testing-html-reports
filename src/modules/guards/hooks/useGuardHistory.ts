// File: src/modules/guards/hooks/useGuardHistory.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { guardHistoryService, type FormattedHistoryRecord } from "../services/guard-history.service";

// Query keys for guard history
export const guardHistoryQueryKeys = {
  all: ["guardHistory"] as const,
  history: (guardId: string) => [...guardHistoryQueryKeys.all, guardId] as const,
};

// Hook for getting guard history with caching
export const useGuardHistory = (guardId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: guardHistoryQueryKeys.history(guardId || ""),
    queryFn: () => {
      if (!guardId) {
        throw new Error("Guard ID is required");
      }

      if (!guardHistoryService.validateGuardId(guardId)) {
        throw new Error("Invalid guard ID format");
      }

      return guardHistoryService.getGuardHistory(guardId);
    },
    enabled: enabled && !!guardId && guardHistoryService.validateGuardId(guardId),
    staleTime: 10 * 60 * 1000, // 10 minutes - history doesn't change often
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

      // Don't retry on 404 - just return empty history
      if (error?.response?.status === 404) {
        return false;
      }

      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for history utilities
export const useGuardHistoryUtils = () => {
  const queryClient = useQueryClient();

  const prefetchGuardHistory = async (guardId: string) => {
    if (!guardHistoryService.validateGuardId(guardId)) {
      console.warn("Invalid guard ID for prefetch:", guardId);
      return;
    }

    await queryClient.prefetchQuery({
      queryKey: guardHistoryQueryKeys.history(guardId),
      queryFn: () => guardHistoryService.getGuardHistory(guardId),
      staleTime: 10 * 60 * 1000,
    });
  };

  const invalidateGuardHistory = (guardId: string) => {
    queryClient.invalidateQueries({
      queryKey: guardHistoryQueryKeys.history(guardId),
    });
  };

  const removeGuardHistoryFromCache = (guardId: string) => {
    queryClient.removeQueries({
      queryKey: guardHistoryQueryKeys.history(guardId),
    });
  };

  const getGuardHistoryFromCache = (guardId: string): FormattedHistoryRecord[] | undefined => {
    return queryClient.getQueryData<FormattedHistoryRecord[]>(guardHistoryQueryKeys.history(guardId));
  };

  const clearAllHistoryCache = () => {
    queryClient.removeQueries({
      queryKey: guardHistoryQueryKeys.all,
    });
  };

  // Helper functions for data manipulation
  const categorizeHistory = (history: FormattedHistoryRecord[]) => {
    return guardHistoryService.categorizeHistoryRecords(history);
  };

  const sortHistory = (history: FormattedHistoryRecord[]) => {
    return guardHistoryService.sortHistoryRecords(history);
  };

  const getHistoryStats = (history: FormattedHistoryRecord[]) => {
    const totalRecords = history.length;
    const uniqueClients = new Set(history.map((record) => record.client)).size;
    const uniqueSites = new Set(history.map((record) => record.site)).size;

    // Calculate date range
    const sortedHistory = sortHistory(history);
    const earliestDate = sortedHistory[sortedHistory.length - 1]?.startDate;
    const latestDate = sortedHistory[0]?.startDate;

    return {
      totalRecords,
      uniqueClients,
      uniqueSites,
      dateRange: {
        earliest: earliestDate,
        latest: latestDate,
      },
    };
  };

  return {
    prefetchGuardHistory,
    invalidateGuardHistory,
    removeGuardHistoryFromCache,
    getGuardHistoryFromCache,
    clearAllHistoryCache,
    categorizeHistory,
    sortHistory,
    getHistoryStats,
  };
};
