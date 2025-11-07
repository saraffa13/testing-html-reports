// File: src/service/incidentDetailsApiService.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../config/axios";

// API Response interfaces for Incident Details
export interface IncidentApiResponse {
  success: boolean;
  data: IncidentApiData;
  timestamp: string;
}

export interface IncidentApiData {
  id: string;
  status: "OPEN" | "CLOSED";
  type: string;
  description: string | null;
  reportedAt: string;
  resolvedAt: string | null;
  areaOfficerId: string;
  clientId: string;
  siteId: string;
  evidenceUrls?: string[];
  location: string | null;
  severity: string | null;
  reportedBy: string | null;
  client?: {
    clientName: string;
    clientLogo: string | null;
  };
  site?: {
    siteName: string;
    addressLine1: string | null;
    city: string;
    pinCode: string;
  };
  // Additional fields that might be in the real API
  reports?: IncidentApiReport[];
  evidences?: IncidentApiEvidence[];
}

export interface IncidentApiReport {
  id: string;
  reporterName: string;
  reporterPhoto: string | null;
  reportedAt: string;
  description: string | null;
  reportedBy: string;
}

export interface IncidentApiEvidence {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnail: string | null;
  uploadedAt: string;
  uploadedBy: string;
}

// Transform API incident data to UI format
export interface TransformedIncidentDetails {
  id: string;
  type: string;
  status: "OPEN" | "CLOSED";
  client: string;
  site: string;
  clientPhoto?: string;
  duration: string;
  closedOn?: string;
  closedTime?: string;
  firstReported: string;
  firstReportedTime: string;
  areaOfficer: {
    name: string;
    area: string;
    phone: string;
    photo?: string;
  };
  reports: TransformedIncidentReport[];
  evidences: TransformedIncidentEvidence[];
}

export interface TransformedIncidentReport {
  id: string;
  reporterName: string;
  reporterPhoto?: string;
  reportedOn: string;
  reportedTime: string;
  description?: string;
}

export interface TransformedIncidentEvidence {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  uploadedBy: string;
  uploadedOn: string;
}

// Helper functions
const formatDateTime = (isoString: string): { date: string; time: string } => {
  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const calculateDuration = (reportedAt: string, resolvedAt: string | null): string => {
  const startTime = new Date(reportedAt);
  const endTime = resolvedAt !== null ? new Date(resolvedAt) : new Date();

  const diffMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours} hours ${minutes} minutes`;
};

// Transform API data to UI format
const transformIncidentDetails = (apiData: IncidentApiData): TransformedIncidentDetails => {
  const { date: reportedDate, time: reportedTime } = formatDateTime(apiData.reportedAt);
  const resolvedDateTime = apiData.resolvedAt !== null ? formatDateTime(apiData.resolvedAt) : null;

  // Transform reports - use API reports if available, otherwise create from main incident
  let reports: TransformedIncidentReport[] = [];

  if (apiData.reports && apiData.reports.length > 0) {
    reports = apiData.reports.map((report) => {
      const { date: reportDate, time: reportTime } = formatDateTime(report.reportedAt);
      return {
        id: report.id,
        reporterName: report.reporterName || "Security Guard",
        reporterPhoto: report.reporterPhoto === null ? undefined : report.reporterPhoto,
        reportedOn: reportDate,
        reportedTime: reportTime,
        description: report.description || undefined,
      };
    });
  } else {
    // Create default report from main incident data
    reports = [
      {
        id: "1",
        reporterName: apiData.reportedBy || "Security Guard",
        reporterPhoto: undefined,
        reportedOn: reportedDate,
        reportedTime: reportedTime,
        description: apiData.description || "Initial incident report",
      },
    ];
  }

  // Transform evidences - use API evidences if available, otherwise use evidenceUrls
  let evidences: TransformedIncidentEvidence[] = [];

  if (apiData.evidences && apiData.evidences.length > 0) {
    evidences = apiData.evidences.map((evidence) => {
      const { date: uploadedDate } = formatDateTime(evidence.uploadedAt);

      return {
        id: evidence.id,
        type: evidence.type === "VIDEO" ? "video" : "image",
        url: evidence.url,
        thumbnail: evidence.thumbnail === null ? undefined : evidence.thumbnail,
        uploadedBy: evidence.uploadedBy || "Security Guard",
        uploadedOn: uploadedDate,
      };
    });
  } else if (apiData.evidenceUrls && apiData.evidenceUrls.length > 0) {
    evidences = apiData.evidenceUrls.map((url, index) => {
      const isVideo = url.includes("video") || url.includes(".mp4") || url.includes(".avi") || url.includes(".mov");

      return {
        id: (index + 1).toString(),
        type: isVideo ? "video" : "image",
        url: url,
        thumbnail: isVideo ? undefined : undefined, // Video thumbnail would need separate API field
        uploadedBy: apiData.reportedBy || "Security Guard",
        uploadedOn: reportedDate,
      };
    });
  }

  return {
    id: apiData.id,
    type: apiData.type,
    status: apiData.status,
    client: apiData.client?.clientName || "Unknown Client",
    site: apiData.site?.siteName || apiData.location || "Unknown Site",
    clientPhoto: apiData.client?.clientLogo === null ? undefined : apiData.client?.clientLogo,
    duration: calculateDuration(apiData.reportedAt, apiData.resolvedAt),
    closedOn: resolvedDateTime?.date,
    closedTime: resolvedDateTime?.time,
    firstReported: reportedDate,
    firstReportedTime: reportedTime,
    areaOfficer: {
      name: "Area Officer", // Could be enhanced with actual officer data from areaOfficerId lookup
      area: "Assigned Area",
      phone: "+91 XXX XXX XXXX",
      photo: undefined,
    },
    reports,
    evidences,
  };
};

// API call function for Incident Details
const fetchIncidentDetails = async (incidentId: string): Promise<TransformedIncidentDetails> => {
  if (!incidentId) {
    throw new Error("Incident ID is required");
  }

  console.log(`🔄 Fetching incident details from API for incident: ${incidentId}`);

  const response = await authApi.get<IncidentApiResponse>(`/incidents/${incidentId}`);

  if (!response.data.success) {
    throw new Error("Failed to fetch incident details");
  }

  console.log(`✅ Successfully fetched incident details for: ${incidentId}`, response.data.data);

  return transformIncidentDetails(response.data.data);
};

// TanStack Query Keys for Incident Details
export const incidentDetailsQueryKeys = {
  all: ["incidentDetails"] as const,
  incident: (incidentId: string) => [...incidentDetailsQueryKeys.all, "incident", incidentId] as const,
};

// Custom hook for fetching incident details with TanStack Query
export const useIncidentDetails = (incidentId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: incidentDetailsQueryKeys.incident(incidentId || ""),
    queryFn: () => fetchIncidentDetails(incidentId!),
    enabled: enabled && !!incidentId,
    staleTime: 2 * 60 * 1000, // 2 minutes - incidents change more frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Utility functions for Incident Details
export const useIncidentDetailsUtils = () => {
  const queryClient = useQueryClient();

  const invalidateIncidentDetails = (incidentId: string) => {
    queryClient.invalidateQueries({
      queryKey: incidentDetailsQueryKeys.incident(incidentId),
    });
  };

  const prefetchIncidentDetails = async (incidentId: string) => {
    await queryClient.prefetchQuery({
      queryKey: incidentDetailsQueryKeys.incident(incidentId),
      queryFn: () => fetchIncidentDetails(incidentId),
      staleTime: 2 * 60 * 1000,
    });
  };

  const clearAllIncidentDetailsCache = () => {
    queryClient.removeQueries({
      queryKey: incidentDetailsQueryKeys.all,
    });
  };

  return {
    invalidateIncidentDetails,
    prefetchIncidentDetails,
    clearAllIncidentDetailsCache,
  };
};
