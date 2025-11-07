import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../apis/base";

export const usePostUpdate = () => {
  const { patch } = useApi;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: any }) => {
      return patch(`/sites/posts/${postId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSites"] });
      queryClient.invalidateQueries({ queryKey: ["clientSitesWithCounts"] });
      queryClient.invalidateQueries({ queryKey: ["clientSiteById"] });
    },
  });
};
