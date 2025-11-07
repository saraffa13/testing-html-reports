import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../../../apis/base";

export const useGetClientSiteById = (siteId: string) => {
  const { get } = useApi;
  return useQuery({
    queryKey: ["clientSite", siteId],
    queryFn: async () => {
      const res = await get(`/client-sites/sites/${siteId}`);
      return res;
    },
    enabled: !!siteId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
