// File: src/modules/officers/hooks/useAreasAndManagers.ts
import { useQuery } from "@tanstack/react-query";
import { areasAPIService } from "../service/areas-api.service";

// Query keys for areas and managers
export const areasQueryKeys = {
  all: ["areas"] as const,
  areas: (agencyId: string) => [...areasQueryKeys.all, "areas", agencyId] as const,
  managers: (agencyId: string) => [...areasQueryKeys.all, "managers", agencyId] as const,
  managersByArea: (agencyId: string, areaId: string) => [...areasQueryKeys.all, "managers", agencyId, areaId] as const,
};

// Hook for getting areas
export const useAreas = (agencyId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: areasQueryKeys.areas(agencyId || ""),
    queryFn: async () => {
      if (!agencyId) {
        throw new Error("Agency ID is required");
      }
      return await areasAPIService.getAreas(agencyId);
    },
    enabled: enabled && !!agencyId,
    staleTime: 5 * 60 * 1000, // 5 minutes - areas don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no areas configured) or auth errors
      if (error?.response?.status === 404 || error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for getting area managers
export const useAreaManagers = (agencyId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: areasQueryKeys.managers(agencyId || ""),
    queryFn: async () => {
      if (!agencyId) {
        throw new Error("Agency ID is required");
      }
      return await areasAPIService.getAreaManagers(agencyId);
    },
    enabled: enabled && !!agencyId,
    staleTime: 5 * 60 * 1000, // 5 minutes - managers don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no managers configured) or auth errors
      if (error?.response?.status === 404 || error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for getting area managers filtered by area
export const useAreaManagersByArea = (agencyId: string | null, areaId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: areasQueryKeys.managersByArea(agencyId || "", areaId || ""),
    queryFn: async () => {
      if (!agencyId || !areaId) {
        throw new Error("Agency ID and Area ID are required");
      }
      return await areasAPIService.getAreaManagersByArea(agencyId, areaId);
    },
    enabled: enabled && !!agencyId && !!areaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Custom hook that combines areas and managers with loading states
export const useAreasAndManagers = (agencyId: string | null) => {
  const { data: areas = [], isLoading: areasLoading, error: areasError, refetch: refetchAreas } = useAreas(agencyId);

  const {
    data: managers = [],
    isLoading: managersLoading,
    error: managersError,
    refetch: refetchManagers,
  } = useAreaManagers(agencyId);

  return {
    // Areas
    areas,
    areasLoading,
    areasError,
    refetchAreas,

    // Managers
    managers,
    managersLoading,
    managersError,
    refetchManagers,

    // Combined states
    isLoading: areasLoading || managersLoading,
    hasError: !!areasError || !!managersError,
    error: areasError || managersError,

    // Helper functions
    getAreaName: (areaId: string) => {
      const area = areas.find((a) => a.id === areaId);
      return area?.name || "";
    },

    getManagerName: (managerId: string) => {
      const manager = managers.find((m) => m.id === managerId);
      return manager?.fullName || "";
    },

    getManagersByArea: (areaId: string) => {
      return managers.filter((m) => m.areaId === areaId);
    },

    // Refetch both
    refetchAll: () => {
      refetchAreas();
      refetchManagers();
    },
  };
};
