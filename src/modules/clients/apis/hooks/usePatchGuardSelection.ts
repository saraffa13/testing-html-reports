import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../apis/base";

export const usePatchGuardSelection = () => {
  const { patch } = useApi;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shiftPostId, assignments }: { shiftPostId: string; assignments: any[] }) => {
      return patch(`/sites/guard-selections/replacement?shiftPostId=${shiftPostId}`, { assignments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSites"] });
      queryClient.invalidateQueries({ queryKey: ["clientSitesWithCounts"] });
    },
  });
};
