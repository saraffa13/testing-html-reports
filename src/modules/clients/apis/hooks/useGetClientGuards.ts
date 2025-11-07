import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../../../apis/base";

export const useGetClientGuards = (clientId: string) => {
  const { get } = useApi;
  return useQuery({
    queryKey: ["guards", clientId],
    queryFn: async () => {
      return get(`/guard-references/client/guards/{clientId}?clientId=${clientId}`);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
};

export const useGetClientAreaOfficers = (clientId: string) => {
  const { get } = useApi;
  return useQuery({
    queryKey: ["areaOfficers", clientId],
    queryFn: async () => {
      return get(`/guard-references/areaOfficers/{clientId}?clientId=${clientId}`);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
};
