import { useQuery } from "@tanstack/react-query";
import { getClientById } from "../services/client";

export const useGetClientById = (clientId: string) => {
  return useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClientById(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
