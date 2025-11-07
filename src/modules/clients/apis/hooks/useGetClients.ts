import { useQuery } from "@tanstack/react-query";
import { getClients, getClientsCounts } from "../services/client";

export const useGetClientsCount = (id: string, opAgencyId: string) => {
  return useQuery({
    queryKey: ["clients", opAgencyId],
    queryFn: () => getClientsCounts(id, opAgencyId),
    enabled: !!opAgencyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useGetClients = (opAgencyId: string) => {
  return useQuery({
    queryKey: ["clients", opAgencyId],
    queryFn: () => getClients(opAgencyId),
    enabled: !!opAgencyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
