import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../apis/base";

export const useShiftUpdate = () => {
  const { patch } = useApi;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shiftId, data }: { shiftId: string; data: any }) => {
      return patch(`/sites/shifts/${shiftId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSites"] });
      queryClient.invalidateQueries({ queryKey: ["clientSitesWithCounts"] });
      queryClient.invalidateQueries({ queryKey: ["clientSiteById"] });
    },
  });
};
