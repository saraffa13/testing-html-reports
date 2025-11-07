// Enhanced API service with better error handling and data transformation

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../../config/axios";

// Updated API Response interfaces to match actual API response
export interface IncidentApiResponse {
  success: boolean;
  data: IncidentApiData;
  timestamp: string;
}

export interface IncidentApiData {
  id: string;
  status: "OPEN" | "CLOSED";
  events: string[]; // Changed from "type" to match API
  dateAndTime: string; // Changed from "reportedAt" to match API
  closedAt: string | null; // Changed from "resolvedAt" to match API
  areaOfficerId: string;
  clientId: string;
  siteId: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    clientName: string;
    clientLogo: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string;
    state: string;
    pinCode: number;
  };
  site?: {
    siteName: string;
    addressLine1: string | null;
    city: string;
    pinCode: string;
  };
  evidences?: IncidentApiEvidence[];
}

// Updated evidence structure to match API
export interface IncidentApiEvidence {
  id: string;
  eventType: string;
  files: string[];
  uploadedAt: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    photo: string | null;
  };
}

// Keep existing transformed interfaces
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

// Enhanced helper functions with better error handling
const formatDateTime = (isoString: string | null | undefined): { date: string; time: string } => {
  if (!isoString || isoString === "null" || isoString === "undefined") {
    return { date: "Date not available", time: "" };
  }

  try {
    const date = new Date(isoString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return { date: "Invalid date", time: "" };
    }

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
  } catch (error) {
    console.warn("Date parsing error:", error, "for input:", isoString);
    return { date: "Date format error", time: "" };
  }
};

const calculateDuration = (reportedAt: string, resolvedAt: string | null): string => {
  if (!reportedAt || reportedAt === "null") {
    return "Duration not available";
  }

  try {
    const startTime = new Date(reportedAt);
    const endTime = resolvedAt && resolvedAt !== "null" ? new Date(resolvedAt) : new Date();

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return "Unable to calculate duration";
    }

    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 0 || minutes < 0) {
      return "Duration calculation error";
    }

    return `${hours} hours ${minutes} minutes`;
  } catch (error) {
    console.warn("Duration calculation error:", error);
    return "Duration calculation failed";
  }
};

// Updated transform function to handle the new API structure
const transformIncidentDetails = (apiData: IncidentApiData): TransformedIncidentDetails => {
  console.log("🔄 Transforming incident data:", apiData);

  if (!apiData || !apiData.id) {
    throw new Error("Invalid incident data received from API");
  }

  try {
    // Use dateAndTime instead of reportedAt
    const { date: reportedDate, time: reportedTime } = formatDateTime(apiData.dateAndTime);
    const resolvedDateTime = apiData.closedAt ? formatDateTime(apiData.closedAt) : null;

    // Create reports from the evidence uploader information since there's no separate reports array
    let reports: TransformedIncidentReport[] = [];

    if (apiData.evidences && Array.isArray(apiData.evidences) && apiData.evidences.length > 0) {
      // Create reports from evidence uploaders
      const uniqueUploaders = new Map();

      apiData.evidences.forEach((evidence) => {
        if (evidence.uploadedBy) {
          const uploaderId = evidence.uploadedBy.id;
          if (!uniqueUploaders.has(uploaderId)) {
            const { date: reportDate, time: reportTime } = formatDateTime(evidence.uploadedAt);
            const reporterName = `${evidence.uploadedBy.firstName} ${evidence.uploadedBy.lastName}`.trim();

            uniqueUploaders.set(uploaderId, {
              id: uploaderId,
              reporterName: reporterName || "Security Guard",
              reporterPhoto: evidence.uploadedBy.photo || undefined,
              reportedOn: reportDate,
              reportedTime: reportTime,
              description: `Evidence submitted for ${evidence.eventType}`,
            });
          }
        }
      });

      reports = Array.from(uniqueUploaders.values());
    }

    // If no reports from evidences, create a default one
    if (reports.length === 0) {
      reports = [
        {
          id: "default-report",
          reporterName: "Security Guard",
          reporterPhoto: undefined,
          reportedOn: reportedDate,
          reportedTime: reportedTime,
          description: "Initial incident report",
        },
      ];
    }

    // Transform evidences to match the expected structure
    let evidences: TransformedIncidentEvidence[] = [];

    if (apiData.evidences && Array.isArray(apiData.evidences) && apiData.evidences.length > 0) {
      apiData.evidences.forEach((evidence, _evidenceIndex) => {
        if (evidence.files && Array.isArray(evidence.files)) {
          evidence.files.forEach((fileUrl, fileIndex) => {
            const { date: uploadedDate } = formatDateTime(evidence.uploadedAt);
            const uploaderName = evidence.uploadedBy
              ? `${evidence.uploadedBy.firstName} ${evidence.uploadedBy.lastName}`.trim()
              : "Unknown User";

            const isVideo =
              fileUrl.toLowerCase().includes("video") ||
              fileUrl.toLowerCase().includes(".mp4") ||
              fileUrl.toLowerCase().includes(".avi") ||
              fileUrl.toLowerCase().includes(".mov");

            evidences.push({
              id: `${evidence.id}-file-${fileIndex}`,
              type: isVideo ? "video" : "image",
              url: fileUrl,
              thumbnail: isVideo ? undefined : undefined, // Could add thumbnail logic here
              uploadedBy: uploaderName,
              uploadedOn: uploadedDate,
            });
          });
        }
      });
    }

    // Enhanced client and site name handling
    const clientName = apiData.client?.clientName || "Client Information Not Available";
    const siteName = "Site Information Not Available"; // API doesn't seem to include site info

    // Enhanced incident type handling from events array
    const getReadableIncidentType = (events: string[]): string => {
      if (!events || events.length === 0) {
        return "General Incident";
      }

      // Use the first event type
      const type = events[0];

      // Convert snake_case or camelCase to readable format
      return type
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const transformed: TransformedIncidentDetails = {
      id: apiData.id,
      type: getReadableIncidentType(apiData.events),
      status: apiData.status || "OPEN",
      client: clientName,
      site: siteName,
      clientPhoto: apiData.client?.clientLogo || undefined,
      duration: calculateDuration(apiData.dateAndTime, apiData.closedAt),
      closedOn: resolvedDateTime?.date,
      closedTime: resolvedDateTime?.time,
      firstReported: reportedDate,
      firstReportedTime: reportedTime,
      areaOfficer: {
        name: "Area Officer", // TODO: Could be enhanced with actual officer lookup
        area: "Assigned Area",
        phone: "+91 XXX XXX XXXX",
        photo: undefined,
      },
      reports,
      evidences,
    };

    console.log("✅ Incident transformation completed:", {
      id: transformed.id,
      type: transformed.type,
      client: transformed.client,
      site: transformed.site,
      reportsCount: transformed.reports.length,
      evidencesCount: transformed.evidences.length,
    });

    return transformed;
  } catch (error) {
    console.error("❌ Incident transformation error:", error);
    throw new Error(`Failed to transform incident data: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Enhanced API call function
const fetchIncidentDetails = async (incidentId: string): Promise<TransformedIncidentDetails> => {
  if (!incidentId || incidentId.trim() === "") {
    throw new Error("Incident ID is required");
  }

  console.log(`🔄 [Dashboard] Fetching incident details for: ${incidentId}`);

  try {
    const response = await authApi.get<IncidentApiResponse>(`/incidents/${incidentId}`);

    console.log("🔍 API Response Status:", response.status);
    console.log("🔍 API Response Success:", response.data?.success);

    if (!response.data) {
      throw new Error("No data received from API");
    }

    if (!response.data.success) {
      throw new Error(
        response.data.success === false ? "API returned success: false" : "Failed to fetch incident details"
      );
    }

    if (!response.data.data) {
      throw new Error("No incident data in API response");
    }

    const transformed = transformIncidentDetails(response.data.data);

    console.log(`✅ [Dashboard] Successfully processed incident: ${incidentId}`);
    return transformed;
  } catch (error) {
    console.error(`❌ [Dashboard] Error fetching incident ${incidentId}:`, error);

    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Unknown error occurred while fetching incident: ${String(error)}`);
    }
  }
};

// TanStack Query Keys
export const dashboardIncidentDetailsQueryKeys = {
  all: ["dashboardIncidentDetails"] as const,
  incident: (incidentId: string) => [...dashboardIncidentDetailsQueryKeys.all, "incident", incidentId] as const,
};

// Enhanced custom hook with better error handling
export const useDashboardIncidentDetails = (incidentId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: dashboardIncidentDetailsQueryKeys.incident(incidentId || ""),
    queryFn: () => fetchIncidentDetails(incidentId!),
    enabled: enabled && !!incidentId && incidentId.trim() !== "",
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a client error (400-499)
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Utility functions
export const useDashboardIncidentDetailsUtils = () => {
  const queryClient = useQueryClient();

  const invalidateIncidentDetails = (incidentId: string) => {
    queryClient.invalidateQueries({
      queryKey: dashboardIncidentDetailsQueryKeys.incident(incidentId),
    });
  };

  const prefetchIncidentDetails = async (incidentId: string) => {
    await queryClient.prefetchQuery({
      queryKey: dashboardIncidentDetailsQueryKeys.incident(incidentId),
      queryFn: () => fetchIncidentDetails(incidentId),
      staleTime: 2 * 60 * 1000,
    });
  };

  const clearAllIncidentDetailsCache = () => {
    queryClient.removeQueries({
      queryKey: dashboardIncidentDetailsQueryKeys.all,
    });
  };

  return {
    invalidateIncidentDetails,
    prefetchIncidentDetails,
    clearAllIncidentDetailsCache,
  };
};
