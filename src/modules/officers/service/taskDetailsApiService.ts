// File: src/service/taskDetailsApiService.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../config/axios";

// API Response interfaces for Task Details
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
    clientName: string;
    clientLogo: string | null;
  };
  site?: {
    siteName: string;
    addressLine1: string | null;
    city: string;
    pinCode: string;
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
}

// Transform API task data to UI format
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
}

export interface TransformedEvidence {
  id: string;
  type: "image" | "video" | "text";
  url?: string;
  textContent?: string;
  thumbnail?: string;
  uploadedBy: string;
  uploadedOn: string;
  subtaskId: string;
  subtaskName: string;
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

const calculateDuration = (startedAt: string, completedAt: string | null): string => {
  const startTime = new Date(startedAt);
  const endTime = completedAt ? new Date(completedAt) : new Date();

  const diffMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (completedAt) {
    return `${hours} hours ${minutes} minutes`;
  } else {
    return `${hours} hours ${minutes} minutes (in progress)`;
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

// Transform API data to UI format
const transformTaskDetails = (apiData: TaskApiData): TransformedTaskDetails => {
  const { date: dueDate, time: dueTime } = formatDateTime(apiData.deadline);
  const { date: assignedDate, time: assignedTime } = formatDateTime(apiData.startedAt);

  const completedDateTime = apiData.completedAt !== null ? formatDateTime(apiData.completedAt) : null;

  const status = determineTaskStatus(apiData.taskStatus, apiData.deadline);
  const priority = calculatePriority(apiData.deadline, apiData.taskStatus);

  // Transform subtasks
  const transformedSubtasks: TransformedSubtask[] = apiData.subtasks.map((subtask) => {
    const completedDateTime = subtask.completedAt !== null ? formatDateTime(subtask.completedAt) : null;

    return {
      id: subtask.id,
      name: getSubtaskDisplayName(subtask.type),
      type: mapSubtaskType(subtask.type),
      completedOn: completedDateTime?.date,
      completedTime: completedDateTime?.time,
      status: determineSubtaskStatus(subtask.isCompleted, apiData.deadline),
      hasEvidence: subtask.evidence.length > 0,
    };
  });

  // Transform evidences
  const transformedEvidences: TransformedEvidence[] = [];

  apiData.subtasks.forEach((subtask) => {
    subtask.evidence.forEach((evidence) => {
      const { date: uploadedDate } = formatDateTime(evidence.uploadedAt);

      // Convert null to undefined for proper TypeScript handling
      const evidenceUrl = evidence.file === null ? undefined : evidence.file;
      const evidenceText = evidence.textContent === null ? undefined : evidence.textContent;
      const evidenceThumbnail = evidence.evidenceType === "VIDEO" && evidence.file !== null ? evidence.file : undefined;

      transformedEvidences.push({
        id: evidence.id,
        type: evidence.evidenceType === "TEXT" ? "text" : evidence.evidenceType === "VIDEO" ? "video" : "image",
        url: evidenceUrl,
        textContent: evidenceText,
        thumbnail: evidenceThumbnail,
        uploadedBy: `Guard ${evidence.uploadedById}`,
        uploadedOn: uploadedDate,
        subtaskId: subtask.id,
        subtaskName: getSubtaskDisplayName(subtask.type),
      });
    });
  });

  return {
    id: apiData.id,
    title: `Task ${apiData.id.slice(-8)}`,
    description: apiData.customLocation || "Task assigned to officer",
    status,
    priority,
    client: apiData.client?.clientName || "Client Name",
    site: apiData.site?.siteName || apiData.customLocation || "Site Name",
    clientPhoto: apiData.client?.clientLogo === null ? undefined : apiData.client?.clientLogo,
    taskId: apiData.id,
    dueDate,
    dueTime,
    duration: calculateDuration(apiData.startedAt, apiData.completedAt),
    completedOn: completedDateTime?.date,
    completedTime: completedDateTime?.time,
    assignedOn: assignedDate,
    assignedTime: assignedTime,
    areaOfficer: {
      name: "Area Officer",
      area: "Assigned Area",
      phone: "+91 XXX XXX XXXX",
      photo: undefined,
    },
    subtasks: transformedSubtasks,
    evidences: transformedEvidences,
  };
};

// API call function for Task Details
const fetchTaskDetails = async (taskId: string): Promise<TransformedTaskDetails> => {
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  console.log(`🔄 Fetching task details from API for task: ${taskId}`);

  const response = await authApi.get<TaskApiResponse>(`/tasks/${taskId}`);

  if (!response.data.success) {
    throw new Error("Failed to fetch task details");
  }

  console.log(`✅ Successfully fetched task details for: ${taskId}`, response.data.data);

  return transformTaskDetails(response.data.data);
};

// TanStack Query Keys for Task Details
export const taskDetailsQueryKeys = {
  all: ["taskDetails"] as const,
  task: (taskId: string) => [...taskDetailsQueryKeys.all, "task", taskId] as const,
};

// Custom hook for fetching task details with TanStack Query
export const useTaskDetails = (taskId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: taskDetailsQueryKeys.task(taskId || ""),
    queryFn: () => fetchTaskDetails(taskId!),
    enabled: enabled && !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Utility functions for Task Details
export const useTaskDetailsUtils = () => {
  const queryClient = useQueryClient();

  const invalidateTaskDetails = (taskId: string) => {
    queryClient.invalidateQueries({
      queryKey: taskDetailsQueryKeys.task(taskId),
    });
  };

  const prefetchTaskDetails = async (taskId: string) => {
    await queryClient.prefetchQuery({
      queryKey: taskDetailsQueryKeys.task(taskId),
      queryFn: () => fetchTaskDetails(taskId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const clearAllTaskDetailsCache = () => {
    queryClient.removeQueries({
      queryKey: taskDetailsQueryKeys.all,
    });
  };

  return {
    invalidateTaskDetails,
    prefetchTaskDetails,
    clearAllTaskDetailsCache,
  };
};
