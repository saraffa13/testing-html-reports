// File: src/hooks/useGuardTypes.ts
import { useQuery } from "@tanstack/react-query";
import { guardTypesService } from "../services/guard.service";

// 🔥 UPDATED: GuardType interface to match actual API response
export interface GuardType {
  id: string;
  typeName: string; // 🔥 FIX: Changed from 'name' to 'typeName'
  agencyId: string;
  createdAt: string;
  updatedAt: string;
  // Note: isActive field doesn't exist in API response, so we'll treat all as active
}

interface UseGuardTypesOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number; // Updated from cacheTime to gcTime (TanStack Query v5)
}

export const useGuardTypes = (agencyId: string, options: UseGuardTypesOptions = {}) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes (updated from cacheTime)
  } = options;

  return useQuery<GuardType[], Error>({
    queryKey: ["guardTypes", agencyId],
    queryFn: () => guardTypesService.getGuardTypes(agencyId),
    enabled: enabled && !!agencyId,
    staleTime,
    gcTime, // Updated from cacheTime
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Export the service for direct use if needed
export { guardTypesService };
