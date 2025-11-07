// File: services/officerIncidentsApiService.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../config/axios";
import { formatDateStartForBackend, formatDateEndForBackend } from "@modules/clients/utils/dateFormatUtils";
import type {
  OfficerIncidentReport,
  OfficerIncidentStatus,
  OfficerIncidentType,
} from "../components/OfficerInsights/OfficerPerformanceWindow-SubComponents/officer-incident-tasks-types";

// API Response interfaces for Guard incidents
export interface GuardApiIncident {
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

interface GuardApiIncidentsResponse {
  success: boolean;
  data: {
    incidents: GuardApiIncident[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  timestamp: string;
}

// Transform Guard API incident type to Officer incident type
const mapGuardTypeToOfficerType = (guardType: string): OfficerIncidentType => {
  const typeMap: Record<string, OfficerIncidentType> = {
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

  return typeMap[guardType.toUpperCase()] || "other";
};

// Transform Guard incident status to Officer status
const mapGuardStatusToOfficerStatus = (guardStatus: string): OfficerIncidentStatus => {
  return guardStatus.toUpperCase() === "CLOSED" ? "CLOSED" : "OPEN";
};

// Generate incident title based on type
const getIncidentTitle = (type: OfficerIncidentType): string => {
  const titleMap: Record<OfficerIncidentType, string> = {
    fire: "Fire Hazard Alert",
    theft: "Security Incident",
    medical: "Medical Emergency",
    property_damage: "Property Damage Report",
    fight: "Altercation Report",
    substance: "Substance Issue",
    lights_on: "Lighting Issue",
    other: "Incident Report",
  };

  return titleMap[type] || "Incident Report";
};

// Get client and site names (these would ideally come from the API but we'll use defaults)
const getClientSiteInfo = (incident: GuardApiIncident) => {
  // In a real implementation, you might have lookup tables or additional API calls
  const clientNames: Record<string, string> = {
    client1: "Axis Bank",
    client2: "Haldiram's",
    client3: "HDFC Bank",
  };

  const siteNames: Record<string, string> = {
    site1: "Greater Kailash 2",
    site2: "Nehru Place",
    site3: "Vasant Vihar",
  };

  return {
    clientName: clientNames[incident.clientId] || "Client Name",
    siteName: siteNames[incident.siteId] || "Site Name",
  };
};

// Transform Guard API incident to Officer format
const transformGuardIncidentToOfficer = (guardIncident: GuardApiIncident): OfficerIncidentReport => {
  const { clientName, siteName } = getClientSiteInfo(guardIncident);
  const officerType = mapGuardTypeToOfficerType(guardIncident.type);

  return {
    id: guardIncident.id,
    type: officerType,
    status: mapGuardStatusToOfficerStatus(guardIncident.status),
    latestAlert: new Date(guardIncident.reportedAt)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", ""),
    evidenceCount: guardIncident.evidenceUrls?.length || 0,
    evidenceUrls: guardIncident.evidenceUrls,
    description: guardIncident.description,
    assignedGuard: guardIncident.reportedBy || "Security Guard",
    site: siteName,
    clientName: clientName,
    title: getIncidentTitle(officerType),
    date: guardIncident.reportedAt.split("T")[0],
  };
};

// API call function for Officer incidents
const fetchOfficerIncidents = async (officerId: string): Promise<OfficerIncidentReport[]> => {
  if (!officerId) {
    throw new Error("Officer ID is required");
  }

  console.log(`🔄 Fetching officer incidents from API for officer: ${officerId}`);

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append("areaOfficerId", officerId); // Using officerId as areaOfficerId
  queryParams.append("page", "1");
  queryParams.append("limit", "1000"); // Get all incidents for the officer

  const queryString = queryParams.toString();
  const url = `/incidents?${queryString}`;

  const response = await authApi.get<GuardApiIncidentsResponse>(url);

  if (!response.data.success) {
    throw new Error("Failed to fetch officer incidents");
  }

  const incidentsData = response.data.data?.incidents || [];

  console.log(
    `✅ Successfully fetched ${Array.isArray(incidentsData) ? incidentsData.length : "unknown"} incidents for officer: ${officerId}`,
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

  if (!Array.isArray(incidentsData)) {
    console.warn(`⚠️ Officer Incidents API returned non-array data for officer: ${officerId}`, incidentsData);
    return [];
  }

  // Transform Guard incidents to Officer format
  return incidentsData.map(transformGuardIncidentToOfficer);
};

// TanStack Query Keys for Officer Incidents
export const officerIncidentsQueryKeys = {
  all: ["officerIncidents"] as const,
  officer: (officerId: string) => [...officerIncidentsQueryKeys.all, "officer", officerId] as const,
  officerWithParams: (officerId: string, dateFrom?: string, dateTo?: string, status?: string) =>
    [...officerIncidentsQueryKeys.officer(officerId), "params", dateFrom, dateTo, status] as const,
};

// Custom hook for fetching officer incidents with TanStack Query
export const useOfficerIncidents = (officerId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: officerIncidentsQueryKeys.officer(officerId || ""),
    queryFn: () => fetchOfficerIncidents(officerId!),
    enabled: enabled && !!officerId,
    staleTime: 2 * 60 * 1000, // 2 minutes - incidents change more frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Utility functions for Officer incidents
export const useOfficerIncidentsUtils = () => {
  const queryClient = useQueryClient();

  // Helper function to get date range strings for API calls
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

  // Filter incidents by date for day view
  const getIncidentsForDate = (incidents: OfficerIncidentReport[], date: Date): OfficerIncidentReport[] => {
    const targetDateStr = date.toISOString().split("T")[0];
    return incidents.filter((incident) => {
      return incident.date === targetDateStr;
    });
  };

  // Filter incidents by status
  const getIncidentsByStatus = (
    incidents: OfficerIncidentReport[],
    status: OfficerIncidentStatus
  ): OfficerIncidentReport[] => {
    return incidents.filter((incident) => incident.status === status);
  };

  // Get incident counts by status
  const getIncidentCounts = (incidents: OfficerIncidentReport[]) => {
    return {
      open: incidents.filter((incident) => incident.status === "OPEN").length,
      closed: incidents.filter((incident) => incident.status === "CLOSED").length,
      total: incidents.length,
    };
  };

  // Invalidate officer incidents cache
  const invalidateOfficerIncidents = (officerId: string) => {
    queryClient.invalidateQueries({
      queryKey: officerIncidentsQueryKeys.officer(officerId),
    });
  };

  // Prefetch officer incidents
  const prefetchOfficerIncidents = async (officerId: string) => {
    await queryClient.prefetchQuery({
      queryKey: officerIncidentsQueryKeys.officer(officerId),
      queryFn: () => fetchOfficerIncidents(officerId),
      staleTime: 2 * 60 * 1000,
    });
  };

  // Clear all officer incidents cache
  const clearAllOfficerIncidentsCache = () => {
    queryClient.removeQueries({
      queryKey: officerIncidentsQueryKeys.all,
    });
  };

  // Sort incidents by latest alert time
  const sortIncidentsByLatestAlert = (incidents: OfficerIncidentReport[]): OfficerIncidentReport[] => {
    return [...incidents].sort((a, b) => {
      // Parse the date strings for comparison
      const dateA = new Date(a.latestAlert.replace(/(\d{2})\/(\d{2})\/(\d{2})/, "20$3-$2-$1"));
      const dateB = new Date(b.latestAlert.replace(/(\d{2})\/(\d{2})\/(\d{2})/, "20$3-$2-$1"));
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  };

  // Group incidents by type
  const groupIncidentsByType = (incidents: OfficerIncidentReport[]) => {
    return incidents.reduce(
      (acc, incident) => {
        if (!acc[incident.type]) {
          acc[incident.type] = [];
        }
        acc[incident.type].push(incident);
        return acc;
      },
      {} as Record<OfficerIncidentType, OfficerIncidentReport[]>
    );
  };

  return {
    getDateRangeForView,
    getIncidentsForDate,
    getIncidentsByStatus,
    getIncidentCounts,
    invalidateOfficerIncidents,
    prefetchOfficerIncidents,
    clearAllOfficerIncidentsCache,
    sortIncidentsByLatestAlert,
    groupIncidentsByType,
  };
};
