import { useQuery } from "@tanstack/react-query";
import { getClientSites, getClientSitesWithCounts } from "../services/clientSite";

export const useGetClientSites = (clientId: string, page?: number, limit?: number) => {
  return useQuery({
    queryKey: ["clientSites", clientId, page, limit],
    queryFn: () => getClientSites(clientId, page, limit),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes for real-time data
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useGetClientSitesWithCounts = (clientId: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["clientSitesWithCounts", clientId, page, limit],
    queryFn: () => getClientSitesWithCounts(clientId, page, limit),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
