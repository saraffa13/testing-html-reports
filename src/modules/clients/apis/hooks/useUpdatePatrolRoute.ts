import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CheckpointFiles,
  CreatePatrolRouteData,
  CreatePatrolRouteResponse,
  UpdatePatrolRouteData,
  UpdatePatrolRouteResponse,
} from "../services/patrolRouteService";
import { createPatrolRoute, updatePatrolRouteWithCheckpoints } from "../services/patrolRouteService";

export const useCreatePatrolRoute = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatePatrolRouteResponse, Error, { data: CreatePatrolRouteData; files: CheckpointFiles }>({
    mutationFn: ({ data, files }) => createPatrolRoute(data, files),
    onSuccess: (response, { data }) => {
      // Invalidate and refetch site data to get updated patrol routes
      queryClient.invalidateQueries({ queryKey: ["site", data.siteId] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });

      console.log("Patrol route created successfully:", response);
    },
    onError: (error) => {
      console.error("Failed to create patrol route:", error);
    },
  });
};

export const useUpdatePatrolRoute = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdatePatrolRouteResponse, Error, { data: UpdatePatrolRouteData; files: CheckpointFiles }>({
    mutationFn: ({ data, files }) => updatePatrolRouteWithCheckpoints(data, files),
    onSuccess: (response, { data }) => {
      // Invalidate and refetch site data to get updated patrol routes
      queryClient.invalidateQueries({ queryKey: ["site", data.siteId] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });

      console.log("Patrol route updated successfully:", response);
    },
    onError: (error) => {
      console.error("Failed to update patrol route:", error);
    },
  });
};
