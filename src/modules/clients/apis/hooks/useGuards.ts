import { useQuery } from "@tanstack/react-query";
import { getGuards, type GuardsResponse } from "../services/guards";

export const useGetGuards = (params: {
  page?: number;
  limit?: number;
  guardId?: string;
  agencyId?: string;
  userType?: "GUARD" | "AREA_OFFICER";
  status?: string;
  gender?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery<GuardsResponse, Error>({
    queryKey: ["guards", params],
    queryFn: () => getGuards(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Specific hook for area officers
export const useGetAreaOfficers = (params?: { page?: number; limit?: number; agencyId?: string; search?: string }) => {
  return useGetGuards({
    ...params,
    userType: "AREA_OFFICER",
  });
};
