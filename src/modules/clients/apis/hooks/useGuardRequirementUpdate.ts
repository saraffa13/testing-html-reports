import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../apis/base";

export const useGuardRequirementUpdate = () => {
  const { patch } = useApi;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requirementId, data }: { requirementId: string; data: any }) => {
      return patch(`/sites/guard-requirements/${requirementId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSites"] });
      queryClient.invalidateQueries({ queryKey: ["clientSitesWithCounts"] });
      queryClient.invalidateQueries({ queryKey: ["guardRequirements"] });
    },
  });
};
