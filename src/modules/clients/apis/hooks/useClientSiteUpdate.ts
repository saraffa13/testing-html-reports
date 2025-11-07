import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../apis/base";

export const useClientSiteUpdate = () => {
  const { patch } = useApi;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, data }: { siteId: string; data: any }) => {
      return patch(`/sites/${siteId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSites"] });
      queryClient.invalidateQueries({ queryKey: ["clientSitesWithCounts"] });
    },
  });
};
