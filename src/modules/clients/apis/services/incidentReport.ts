import { useApi } from "../../../../apis/base";

export interface IncidentReport {
  id: string;
  status: "OPEN" | "CLOSED";
  dateAndTime: string;
  closedAt?: string | null;
  areaOfficerId: string;
  siteId: string;
  events: string[];
  client: {
    id: string;
    clientName: string;
    clientLogo: string;
  };
  site: {
    id: string;
    siteName: string;
  };
}

export interface IncidentReportResponse {
  success: boolean;
  data: IncidentReport[];
  timestamp: string;
}

export const getClientIncidentReport = async (params: {
  clientId: string;
  startDate?: string;
  endDate?: string;
}): Promise<IncidentReportResponse> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();

  // Add all parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/incidents${queryString}`);
};
