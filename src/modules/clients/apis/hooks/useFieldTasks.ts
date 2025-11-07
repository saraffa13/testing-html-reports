import { useQuery } from "@tanstack/react-query";
import { getFieldTasks, type FieldTasksFilters } from "../services/fieldTasks";

export const useGetFieldTasksByClientId = (
  clientId: string,
  siteId?: string,
  additionalFilters?: Omit<FieldTasksFilters, "clientId" | "siteId">,
  enabled: boolean = true
) => {
  const filters: FieldTasksFilters = {
    clientId,
    ...(siteId && siteId !== "ALL SITES" && { siteId }),
    ...additionalFilters,
  };

  return useQuery({
    queryKey: ["fieldTasks", "byClient", clientId, siteId, additionalFilters],
    queryFn: () => getFieldTasks(filters),
    enabled: enabled && !!clientId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useGetFieldTasksBySiteId = (
  clientId: string,
  siteId: string,
  additionalFilters?: Omit<FieldTasksFilters, "clientId" | "siteId">,
  enabled: boolean = true
) => {
  const filters: FieldTasksFilters = {
    clientId,
    siteId,
    ...additionalFilters,
  };

  return useQuery({
    queryKey: ["fieldTasks", "bySite", clientId, siteId, additionalFilters],
    queryFn: () => getFieldTasks(filters),
    enabled: enabled && !!clientId && !!siteId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useGetFieldTasksByGuardId = (
  guardId: string,
  additionalFilters?: Omit<FieldTasksFilters, "guardId">,
  enabled: boolean = true
) => {
  const filters: FieldTasksFilters = {
    guardId,
    ...additionalFilters,
  };

  return useQuery({
    queryKey: ["fieldTasks", "byGuard", guardId, additionalFilters],
    queryFn: () => getFieldTasks(filters),
    enabled: enabled && !!guardId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
