import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClient } from "../services/client";

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: FormData }) => updateClient(clientId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch client data
      queryClient.invalidateQueries({ queryKey: ["client", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["clientSites", variables.clientId] });
    },
    onError: (error) => {
      console.error("Failed to update client:", error);
    },
  });
};
