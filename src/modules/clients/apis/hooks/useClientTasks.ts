import { useQuery } from "@tanstack/react-query";
import { getClientTasks, type TasksFilters } from "../services/tasks";

export const useGetTasksByClientId = (
  agencyId: string,
  clientId: string,
  siteId?: string,
  additionalFilters?: Omit<TasksFilters, "agencyId" | "clientId" | "siteId">,
  enabled: boolean = true
) => {
  const filters: TasksFilters = {
    agencyId,
    clientId,
    ...(siteId && siteId !== "ALL SITES" && { siteId }),
    ...additionalFilters,
  };

  return useQuery({
    queryKey: ["tasks", "byClient", agencyId, clientId, siteId, additionalFilters],
    queryFn: () => getClientTasks(filters),
    enabled: enabled && !!agencyId && !!clientId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
