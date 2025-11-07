import { useMutation } from "@tanstack/react-query";
import { createClient } from "../services/client";

export const useCreateClient = (onSuccess: () => void) => {
  return useMutation({
    mutationFn: createClient,
    onSuccess,
    onError: (error) => {
      console.error("Error creating client:", error);
      alert("There was an error submitting the form. Please try again.");
    },
  });
};
