import { useMutation } from "@tanstack/react-query";
import { createClientUniform, type CreateUniformRequest, type UniformResponse } from "../services/clientUniforms";

export const useCreateClientUniform = (onSuccess?: (data: UniformResponse) => void) => {
  return useMutation<UniformResponse, Error, CreateUniformRequest>({
    mutationFn: createClientUniform,
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Failed to create client uniform:", error);
    },
  });
};
