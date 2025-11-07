import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../apis/base";

export interface ReplaceGuardRequest {
  guardId?: string;
  alertnessChallenge?: boolean;
  occurenceCount?: number;
  patrolling?: boolean;
}

export interface ReplaceGuardResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
  };
}

export const useReplaceGuard = () => {
  const { patch } = useApi;
  const queryClient = useQueryClient();

  return useMutation<ReplaceGuardResponse, Error, { guardSelectionId: string; data: ReplaceGuardRequest }>({
    mutationFn: async ({ guardSelectionId, data }) => {
      return patch(`/client-sites/guard-selection/${guardSelectionId}`, data);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["clientSites"] });
      queryClient.invalidateQueries({ queryKey: ["clientSitesWithCounts"] });
      queryClient.invalidateQueries({ queryKey: ["guardSelections"] });
    },
  });
};
