import { useQuery } from "@tanstack/react-query";
import { getClientIncidentReport } from "../services/incidentReport";

export const useClientIncidentReport = (params: { clientId: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ["clientIncidentReport", params],
    queryFn: () => getClientIncidentReport(params),
    enabled: !!params.clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};
