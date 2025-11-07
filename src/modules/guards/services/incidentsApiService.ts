// File: services/incidentsApiService.ts
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../../config/axios";
import { formatDateStartForBackend, formatDateEndForBackend } from "@modules/clients/utils/dateFormatUtils";

// API Response interfaces
export interface ApiIncident {
  id: string;
  status: "OPEN" | "CLOSED";
  type: string;
  description?: string;
  reportedAt: string;
  resolvedAt?: string;
  areaOfficerId: string;
  clientId: string;
  siteId: string;
  evidenceUrls?: string[];
  location?: string;
  severity?: string;
  reportedBy?: string;
}

interface ApiIncidentsResponse {
  success: boolean;
  data: {
    incidents: ApiIncident[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  timestamp: string;
}

// Transform API incident type to internal incident type
const mapApiTypeToInternalType = (
  apiType: string
): "fire" | "theft" | "medical" | "property_damage" | "fight" | "substance" | "lights_on" | "other" => {
  const typeMap: Record<
    string,
    "fire" | "theft" | "medical" | "property_damage" | "fight" | "substance" | "lights_on" | "other"
  > = {
    FIRE: "fire",
    FIRE_HAZARD: "fire",
    THEFT: "theft",
    SECURITY: "theft",
    MEDICAL: "medical",
    MEDICAL_EMERGENCY: "medical",
    PROPERTY_DAMAGE: "property_damage",
    DAMAGE: "property_damage",
    FIGHT: "fight",
    ALTERCATION: "fight",
    SUBSTANCE: "substance",
    SUBSTANCE_ABUSE: "substance",
    LIGHTING: "lights_on",
    LIGHTS: "lights_on",
    OTHER: "other",
  };

  return typeMap[apiType.toUpperCase()] || "other";
};

// Transform API response to internal IncidentReport format
const transformApiIncidentToInternal = (apiIncident: ApiIncident) => {
  return {
    id: apiIncident.id,
    type: mapApiTypeToInternalType(apiIncident.type),
    latestAlert: new Date(apiIncident.reportedAt)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", ""),
    evidenceCount: apiIncident.evidenceUrls?.length || 0,
    evidenceUrls: apiIncident.evidenceUrls,
    description: apiIncident.description,
  };
};

// API call function
const fetchIncidents = async (areaOfficerId: string) => {
  if (!areaOfficerId) {
    throw new Error("Area Officer ID (Guard ID) is required");
  }

  console.log(`🔄 Fetching all incidents from API for areaOfficerId: ${areaOfficerId}`);

  // Build query parameters - only guard ID and pagination
  const queryParams = new URLSearchParams();
  queryParams.append("areaOfficerId", areaOfficerId);
  queryParams.append("page", "1");
  queryParams.append("limit", "1000"); // Get all incidents for the guard

  const queryString = queryParams.toString();
  const url = `/incidents?${queryString}`;

  const response = await authApi.get<ApiIncidentsResponse>(url);

  if (!response.data.success) {
    throw new Error("Failed to fetch incidents");
  }

  // Handle the correct response structure - incidents are in response.data.data.incidents
  const incidentsData = response.data.data?.incidents || [];

  console.log(
    `✅ Successfully fetched ${Array.isArray(incidentsData) ? incidentsData.length : "unknown"} incidents for areaOfficerId: ${areaOfficerId}`,
    {
      responseStructure: {
        hasData: !!response.data.data,
        hasIncidents: !!response.data.data?.incidents,
        incidentsType: Array.isArray(response.data.data?.incidents) ? "array" : typeof response.data.data?.incidents,
        incidentsLength: Array.isArray(response.data.data?.incidents) ? response.data.data.incidents.length : "N/A",
        pagination: response.data.data?.pagination,
      },
    }
  );

  // Ensure we have an array to work with
  if (!Array.isArray(incidentsData)) {
    console.warn(`⚠️ Incidents API returned non-array data for areaOfficerId: ${areaOfficerId}`, incidentsData);
    return [];
  }

  // Transform API data to internal format
  return incidentsData.map(transformApiIncidentToInternal);
};

// TanStack Query Keys
export const incidentsQueryKeys = {
  all: ["incidents"] as const,
  areaOfficer: (areaOfficerId: string) => [...incidentsQueryKeys.all, "areaOfficer", areaOfficerId] as const,
  areaOfficerWithParams: (areaOfficerId: string, dateFrom?: string, dateTo?: string, status?: string) =>
    [...incidentsQueryKeys.areaOfficer(areaOfficerId), "params", dateFrom, dateTo, status] as const,
};

// Custom hook for fetching incidents with TanStack Query
export const useIncidents = (areaOfficerId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: incidentsQueryKeys.areaOfficer(areaOfficerId || ""),
    queryFn: () => fetchIncidents(areaOfficerId!),
    enabled: enabled && !!areaOfficerId,
    staleTime: 2 * 60 * 1000, // 2 minutes - incidents change more frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Utility functions
export const useIncidentsUtils = () => {
  // Helper function to get date range strings for API calls (same as defaults)
  const getDateRangeForView = (selectedDate: Date, viewType: "DAY" | "WEEK" | "MONTH" | "CUSTOM") => {
    const date = new Date(selectedDate);

    switch (viewType) {
      case "DAY":
      case "CUSTOM":
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        return {
          fromDate: formatDateStartForBackend(dayStart),
          toDate: formatDateEndForBackend(dayEnd)
        };

      case "WEEK":
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        return {
          fromDate: formatDateStartForBackend(startOfWeek),
          toDate: formatDateEndForBackend(endOfWeek),
        };

      case "MONTH":
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        return {
          fromDate: formatDateStartForBackend(startOfMonth),
          toDate: formatDateEndForBackend(endOfMonth),
        };

      default:
        const defaultStart = new Date(date);
        defaultStart.setHours(0, 0, 0, 0);
        const defaultEnd = new Date(date);
        defaultEnd.setHours(23, 59, 59, 999);
        return {
          fromDate: formatDateStartForBackend(defaultStart),
          toDate: formatDateEndForBackend(defaultEnd)
        };
    }
  };

  // Filter incidents by date for legacy compatibility
  const getIncidentsForDate = (incidents: any[], date: Date) => {
    const targetDateStr = date.toISOString().split("T")[0];
    return incidents.filter((incident) => {
      // Parse the latestAlert field which is formatted like "23/01/25 04:35 PM"
      const alertDateParts = incident.latestAlert.split(" ")[0].split("/");
      if (alertDateParts.length === 3) {
        // Convert DD/MM/YY to YYYY-MM-DD format
        const day = alertDateParts[0].padStart(2, "0");
        const month = alertDateParts[1].padStart(2, "0");
        const year = `20${alertDateParts[2]}`; // Assuming 2000s
        const incidentDateStr = `${year}-${month}-${day}`;
        return incidentDateStr === targetDateStr;
      }
      return false;
    });
  };

  return {
    getDateRangeForView,
    getIncidentsForDate,
  };
};
