import { useMutation } from "@tanstack/react-query";
import { createSite } from "../services/clientSite";
import type { CreateSiteSuccessResponse } from "../../components/forms/add_client_site/types";

export const useCreateSite = (onSuccess: (data: CreateSiteSuccessResponse) => void) => {
  return useMutation({
    mutationFn: createSite,
    retry: 0,
    onSuccess: (data) => {
      console.log("Site created successfully:", data);
      onSuccess(data);
    },
    onError: (error) => {
      console.error("Error creating site:", error);
      // Don't show alert here - let component handle error display
    },
  });
};
