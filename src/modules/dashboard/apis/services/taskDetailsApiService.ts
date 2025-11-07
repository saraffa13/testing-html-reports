// Enhanced API service with better error handling and data transformation for tasks

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../../config/axios";

// Updated API Response interfaces to match actual API response
export interface TaskApiResponse {
  success: boolean;
  data: TaskApiData;
  timestamp: string;
}

export interface TaskApiData {
  id: string;
  areaOfficerId: string;
  clientId: string;
  siteId: string;
  customLocation: string | null;
  deadline: string;
  startedAt: string;
  completedAt: string | null;
  taskStatus: "PENDING" | "INPROGRESS" | "COMPLETED";
  totalDuration: number | null;
  createdAt: string;
  updatedAt: string;
  subtasks: TaskApiSubtask[];
  client?: {
    id: string;
    clientName: string;
    clientLogo: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string;
    state?: string;
    pinCode?: number;
  };
  site?: {
    id: string;
    siteName: string;
    addressLine1: string | null;
    city: string;
    pinCode: string;
  };
  areaOfficer?: {
    id: string;
    firstName: string;
    lastName: string;
    photo: string | null;
    phone: string | null;
  };
}

export interface TaskApiSubtask {
  id: string;
  taskId: string;
  type: string;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  evidence: TaskApiEvidence[];
}

export interface TaskApiEvidence {
  id: string;
  taskId: string;
  subtaskId: string;
  evidenceType: "TEXT" | "IMAGE" | "VIDEO";
  textContent: string | null;
  file: string | null;
  uploadedAt: string;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    photo: string | null;
  };
}

// Enhanced Transform API task data to UI format
export interface TransformedTaskDetails {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "OVERDUE" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  client: string;
  site: string;
  clientPhoto?: string;
  taskId: string;
  dueDate: string;
  dueTime: string;
  duration: string;
  completedOn?: string;
  completedTime?: string;
  assignedOn: string;
  assignedTime: string;
  areaOfficer: {
    name: string;
    area: string;
    phone: string;
    photo?: string;
  };
  subtasks: TransformedSubtask[];
  evidences: TransformedEvidence[];
}

export interface TransformedSubtask {
  id: string;
  name: string;
  type: string;
  completedOn?: string;
  completedTime?: string;
  status: "COMPLETED" | "PENDING" | "OVERDUE";
  hasEvidence: boolean;
  evidenceCount: number;
}

export interface TransformedEvidence {
  id: string;
  type: "image" | "video" | "text";
  url?: string;
  textContent?: string;
  thumbnail?: string;
  uploadedBy: string;
  uploadedOn: string;
  uploadedTime: string;
  subtaskId: string;
  subtaskName: string;
}

// Enhanced helper functions
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

const calculateDuration = (startedAt: string, completedAt: string | null): string => {
  if (!startedAt || startedAt === "null") {
    return "Duration not available";
  }

  try {
    const startTime = new Date(startedAt);
    const endTime = completedAt && completedAt !== "null" ? new Date(completedAt) : new Date();

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return "Unable to calculate duration";
    }

    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 0 || minutes < 0) {
      return "Duration calculation error";
    }

    if (completedAt && completedAt !== "null") {
      return `${hours} hours ${minutes} minutes`;
    } else {
      return `${hours} hours ${minutes} minutes (in progress)`;
    }
  } catch (error) {
    console.warn("Duration calculation error:", error);
    return "Duration calculation failed";
  }
};

const determineTaskStatus = (taskStatus: string, deadline: string): "PENDING" | "OVERDUE" | "DONE" => {
  if (taskStatus === "COMPLETED") {
    return "DONE";
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (now > deadlineDate) {
    return "OVERDUE";
  }

  return "PENDING";
};

const calculatePriority = (deadline: string, status: string): "LOW" | "MEDIUM" | "HIGH" => {
  if (status === "COMPLETED") return "LOW";

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDeadline < 0) return "HIGH"; // Overdue
  if (hoursUntilDeadline < 24) return "HIGH"; // Due within 24 hours
  if (hoursUntilDeadline < 72) return "MEDIUM"; // Due within 3 days
  return "LOW";
};

const mapSubtaskType = (type: string): string => {
  const typeMap: Record<string, string> = {
    DOCUMENTS: "document",
    SITE_VISIT: "sitevisit",
    SITEVISIT: "sitevisit",
    TRAINING: "training",
    INSPECTION: "inspection",
    AUDIT: "inspection",
    OTHER: "other",
    DEFAULT: "other",
  };

  return typeMap[type.toUpperCase()] || "other";
};

const getSubtaskDisplayName = (type: string): string => {
  const nameMap: Record<string, string> = {
    DOCUMENTS: "Documents",
    SITE_VISIT: "Site Visit",
    SITEVISIT: "Site Visit",
    TRAINING: "Training",
    INSPECTION: "Inspection",
    AUDIT: "Audit",
    OTHER: "Other Tasks",
    DEFAULT: "General Task",
  };

  return nameMap[type.toUpperCase()] || "Task";
};

const determineSubtaskStatus = (isCompleted: boolean, deadline: string): "COMPLETED" | "PENDING" | "OVERDUE" => {
  if (isCompleted) {
    return "COMPLETED";
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (now > deadlineDate) {
    return "OVERDUE";
  }

  return "PENDING";
};

// Enhanced transform API data to UI format
const transformTaskDetails = (apiData: TaskApiData): TransformedTaskDetails => {
  console.log("🔄 Transforming task data:", apiData);

  if (!apiData || !apiData.id) {
    throw new Error("Invalid task data received from API");
  }

  try {
    const { date: dueDate, time: dueTime } = formatDateTime(apiData.deadline);
    const { date: assignedDate, time: assignedTime } = formatDateTime(apiData.startedAt);

    const completedDateTime = apiData.completedAt !== null ? formatDateTime(apiData.completedAt) : null;

    const status = determineTaskStatus(apiData.taskStatus, apiData.deadline);
    const priority = calculatePriority(apiData.deadline, apiData.taskStatus);

    // Enhanced client information handling
    const clientName = apiData.client?.clientName || "Client Information Not Available";
    const clientLogo = apiData.client?.clientLogo || undefined;

    // Enhanced site information handling
    const siteName = apiData.site?.siteName || apiData.customLocation || "Site Information Not Available";

    // Enhanced area officer information handling
    const areaOfficerName = apiData.areaOfficer
      ? `${apiData.areaOfficer.firstName} ${apiData.areaOfficer.lastName}`.trim()
      : "Area Officer";

    const areaOfficerPhone = apiData.areaOfficer?.phone || "+91 XXX XXX XXXX";
    const areaOfficerPhoto = apiData.areaOfficer?.photo || undefined;

    // Enhanced subtasks transformation
    const transformedSubtasks: TransformedSubtask[] = apiData.subtasks.map((subtask) => {
      const completedDateTime = subtask.completedAt !== null ? formatDateTime(subtask.completedAt) : null;
      const evidenceCount = subtask.evidence?.length || 0;

      return {
        id: subtask.id,
        name: getSubtaskDisplayName(subtask.type),
        type: mapSubtaskType(subtask.type),
        completedOn: completedDateTime?.date,
        completedTime: completedDateTime?.time,
        status: determineSubtaskStatus(subtask.isCompleted, apiData.deadline),
        hasEvidence: evidenceCount > 0,
        evidenceCount,
      };
    });

    // Enhanced evidences transformation with better uploader handling
    const transformedEvidences: TransformedEvidence[] = [];

    apiData.subtasks.forEach((subtask) => {
      if (subtask.evidence && Array.isArray(subtask.evidence)) {
        subtask.evidence.forEach((evidence) => {
          const { date: uploadedDate, time: uploadedTime } = formatDateTime(evidence.uploadedAt);

          // Enhanced uploader name handling
          let uploaderName = "Unknown User";
          if (evidence.uploadedBy) {
            uploaderName = `${evidence.uploadedBy.firstName} ${evidence.uploadedBy.lastName}`.trim();
          } else if (evidence.uploadedById) {
            uploaderName = `User ${evidence.uploadedById.slice(-8)}`;
          }

          // Enhanced file handling - null safety
          const evidenceUrl = evidence.file || undefined;
          const evidenceText = evidence.textContent || undefined;

          // Enhanced thumbnail logic for videos
          const evidenceThumbnail =
            evidence.evidenceType === "VIDEO" && evidence.file
              ? evidence.file // Use the same URL for now, could be enhanced with actual thumbnail URL
              : undefined;

          transformedEvidences.push({
            id: evidence.id,
            type: evidence.evidenceType === "TEXT" ? "text" : evidence.evidenceType === "VIDEO" ? "video" : "image",
            url: evidenceUrl,
            textContent: evidenceText,
            thumbnail: evidenceThumbnail,
            uploadedBy: uploaderName,
            uploadedOn: uploadedDate,
            uploadedTime: uploadedTime,
            subtaskId: subtask.id,
            subtaskName: getSubtaskDisplayName(subtask.type),
          });
        });
      }
    });

    const transformed: TransformedTaskDetails = {
      id: apiData.id,
      title: `Task ${apiData.id.slice(-8)}`,
      description: apiData.customLocation || siteName || "Task assigned to officer",
      status,
      priority,
      client: clientName,
      site: siteName,
      clientPhoto: clientLogo,
      taskId: apiData.id,
      dueDate,
      dueTime,
      duration: calculateDuration(apiData.startedAt, apiData.completedAt),
      completedOn: completedDateTime?.date,
      completedTime: completedDateTime?.time,
      assignedOn: assignedDate,
      assignedTime: assignedTime,
      areaOfficer: {
        name: areaOfficerName,
        area: "Assigned Area", // Could be enhanced with actual area info
        phone: areaOfficerPhone,
        photo: areaOfficerPhoto,
      },
      subtasks: transformedSubtasks,
      evidences: transformedEvidences,
    };

    console.log("✅ Task transformation completed:", {
      id: transformed.id,
      title: transformed.title,
      client: transformed.client,
      site: transformed.site,
      status: transformed.status,
      subtasksCount: transformed.subtasks.length,
      evidencesCount: transformed.evidences.length,
      hasClientLogo: !!transformed.clientPhoto,
    });

    return transformed;
  } catch (error) {
    console.error("❌ Task transformation error:", error);
    throw new Error(`Failed to transform task data: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Enhanced API call function
const fetchTaskDetails = async (taskId: string): Promise<TransformedTaskDetails> => {
  if (!taskId || taskId.trim() === "") {
    throw new Error("Task ID is required");
  }

  console.log(`🔄 [Dashboard] Fetching task details for: ${taskId}`);

  try {
    const response = await authApi.get<TaskApiResponse>(`/tasks/${taskId}`);

    console.log("🔍 API Response Status:", response.status);
    console.log("🔍 API Response Success:", response.data?.success);

    if (!response.data) {
      throw new Error("No data received from API");
    }

    if (!response.data.success) {
      throw new Error(response.data.success === false ? "API returned success: false" : "Failed to fetch task details");
    }

    if (!response.data.data) {
      throw new Error("No task data in API response");
    }

    const transformed = transformTaskDetails(response.data.data);

    console.log(`✅ [Dashboard] Successfully processed task: ${taskId}`);
    return transformed;
  } catch (error) {
    console.error(`❌ [Dashboard] Error fetching task ${taskId}:`, error);

    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Unknown error occurred while fetching task: ${String(error)}`);
    }
  }
};

// TanStack Query Keys for Dashboard Task Details
export const dashboardTaskDetailsQueryKeys = {
  all: ["dashboardTaskDetails"] as const,
  task: (taskId: string) => [...dashboardTaskDetailsQueryKeys.all, "task", taskId] as const,
};

// Enhanced custom hook for fetching dashboard task details with TanStack Query
export const useDashboardTaskDetails = (taskId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: dashboardTaskDetailsQueryKeys.task(taskId || ""),
    queryFn: () => fetchTaskDetails(taskId!),
    enabled: enabled && !!taskId && taskId.trim() !== "",
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

// Enhanced utility functions for Dashboard Task Details
export const useDashboardTaskDetailsUtils = () => {
  const queryClient = useQueryClient();

  const invalidateTaskDetails = (taskId: string) => {
    queryClient.invalidateQueries({
      queryKey: dashboardTaskDetailsQueryKeys.task(taskId),
    });
  };

  const prefetchTaskDetails = async (taskId: string) => {
    await queryClient.prefetchQuery({
      queryKey: dashboardTaskDetailsQueryKeys.task(taskId),
      queryFn: () => fetchTaskDetails(taskId),
      staleTime: 2 * 60 * 1000,
    });
  };

  const clearAllTaskDetailsCache = () => {
    queryClient.removeQueries({
      queryKey: dashboardTaskDetailsQueryKeys.all,
    });
  };

  return {
    invalidateTaskDetails,
    prefetchTaskDetails,
    clearAllTaskDetailsCache,
  };
};
