import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../../../apis/base";

export interface GuardType {
  id: string;
  typeName: string;
  agencyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuardTypesResponse {
  success: boolean;
  data: GuardType[];
  timestamp: string;
}

const getGuardTypes = async (agencyId: string): Promise<GuardTypesResponse> => {
  const { get } = useApi;
  return get(`/settings/guard-types/${agencyId}`);
};

export const useGuardTypes = (agencyId?: string) => {
  return useQuery({
    queryKey: ["guardTypes", agencyId],
    queryFn: () => getGuardTypes(agencyId!),
    enabled: !!agencyId,
    staleTime: 30 * 60 * 1000, // 30 minutes - guard types don't change often
    refetchOnWindowFocus: false,
  });
};
