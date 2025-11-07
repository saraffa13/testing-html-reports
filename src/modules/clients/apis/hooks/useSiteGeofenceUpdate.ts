import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSiteGeofence } from "../services/clientSite";

export const useSiteGeofenceUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ siteId, data }: { siteId: string; data: any }) => {
      return updateSiteGeofence(siteId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSites"] });
      queryClient.invalidateQueries({ queryKey: ["clientSitesWithCounts"] });
    },
  });
};
