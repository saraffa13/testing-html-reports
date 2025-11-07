// File: src/modules/officers/service/siteTasksApiService.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../config/axios";

// API Response interfaces for Site Tasks (using the existing task structure)
export interface SiteTaskApiData {
  id: string;
  areaOfficerId: string;
  clientId: string;
  siteId: string;
  customLocation?: string | null;
  deadline: string;
  startedAt: string;
  completedAt?: string | null;
  taskStatus: "PENDING" | "INPROGRESS" | "COMPLETED";
  totalDuration?: number | null;
  createdAt: string;
  updatedAt: string;
  subtasks?: Array<{
    id: string;
    taskId: string;
    type: string;
    isCompleted: boolean;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  site?: {
    siteName: string;
    addressLine1?: string | null;
    city: string;
    pinCode: string;
  };
  client?: {
    clientName: string;
    clientLogo?: string | null;
  };
}

export interface SiteTasksApiResponse {
  success: boolean;
  data: {
    tasks: SiteTaskApiData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  timestamp: string;
}

// Transformed site task data for UI (matching the existing task structure)
export interface SiteTaskData {
  id: string;
  dueDate: string; // Format: "DD/MM/YY"
  dueTime: string; // Format: "HH:MM am/pm"
  assignedBy: string;
  taskType: "site_visit" | "training" | "document" | "inspection" | "other";
  status: "overdue" | "pending" | "done";
  clientSiteId: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  description?: string;
  customLocation?: string;
  subtasks: Array<{
    id: string;
    type: string;
    isCompleted: boolean;
    completedAt?: string;
  }>;
}

// Helper function to format date from ISO to DD/MM/YY
const formatDateToDDMMYY = (isoString: string): string => {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
};

// Helper function to format time from ISO to HH:MM am/pm
const formatTimeToAmPm = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Map API task status to UI status
const mapApiStatusToUIStatus = (apiStatus: string, deadline: string): "overdue" | "pending" | "done" => {
  if (apiStatus === "COMPLETED") {
    return "done";
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (now > deadlineDate) {
    return "overdue";
  }

  return "pending";
};

// Map subtask type to task type
const mapSubtaskTypeToTaskType = (subtaskType: string): SiteTaskData["taskType"] => {
  const typeMap: Record<string, SiteTaskData["taskType"]> = {
    SITE_VISIT: "site_visit",
    SITEVISIT: "site_visit",
    TRAINING: "training",
    DOCUMENTS: "document",
    INSPECTION: "inspection",
    AUDIT: "inspection",
    OTHER: "other",
  };

  return typeMap[subtaskType.toUpperCase()] || "other";
};

// Calculate task priority based on deadline
const calculateTaskPriority = (deadline: string, status: string): "LOW" | "MEDIUM" | "HIGH" => {
  if (status === "COMPLETED") return "LOW";

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDeadline < 0) return "HIGH"; // Overdue
  if (hoursUntilDeadline < 24) return "HIGH"; // Due within 24 hours
  if (hoursUntilDeadline < 72) return "MEDIUM"; // Due within 3 days
  return "LOW";
};

// Transform API data to UI format
const transformSiteTaskData = (apiData: SiteTaskApiData[]): SiteTaskData[] => {
  return apiData.map((task) => {
    const uiStatus = mapApiStatusToUIStatus(task.taskStatus, task.deadline);
    const priority = calculateTaskPriority(task.deadline, task.taskStatus);

    // Determine primary task type from subtasks
    const primaryTaskType = task.subtasks?.length ? mapSubtaskTypeToTaskType(task.subtasks[0].type) : "other";

    return {
      id: task.id,
      dueDate: formatDateToDDMMYY(task.deadline),
      dueTime: formatTimeToAmPm(task.deadline),
      assignedBy: "Office", // Default value since not provided in API
      taskType: primaryTaskType,
      status: uiStatus,
      clientSiteId: task.siteId,
      priority,
      description: task.customLocation || undefined,
      customLocation: task.customLocation || undefined,
      subtasks:
        task.subtasks?.map((subtask) => ({
          id: subtask.id,
          type: subtask.type,
          isCompleted: subtask.isCompleted,
          completedAt: subtask.completedAt || undefined,
        })) || [],
    };
  });
};

// API call function for Site Tasks
const fetchSiteTasks = async (areaOfficerId: string, siteId?: string): Promise<SiteTaskData[]> => {
  if (!areaOfficerId) {
    throw new Error("Area Officer ID is required");
  }

  console.log(`🔄 Fetching site tasks from API:`, {
    areaOfficerId,
    siteId: siteId || "all sites",
  });

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append("areaOfficerId", areaOfficerId);

  if (siteId) {
    queryParams.append("siteId", siteId);
  }

  // Get all tasks by setting a high limit
  queryParams.append("limit", "1000");
  queryParams.append("page", "1");

  const response = await authApi.get<SiteTasksApiResponse>(`/tasks?${queryParams.toString()}`);

  if (!response.data.success) {
    throw new Error("Failed to fetch site tasks");
  }

  const tasksData = response.data.data?.tasks || [];

  console.log(`✅ Successfully fetched site tasks:`, {
    areaOfficerId,
    siteId: siteId || "all sites",
    totalTasks: tasksData.length,
    pagination: response.data.data?.pagination,
  });

  if (!Array.isArray(tasksData)) {
    console.warn(`⚠️ Site Tasks API returned non-array data`, tasksData);
    return [];
  }

  return transformSiteTaskData(tasksData);
};

// TanStack Query Keys for Site Tasks
export const siteTasksQueryKeys = {
  all: ["siteTasks"] as const,
  areaOfficer: (areaOfficerId: string) => [...siteTasksQueryKeys.all, "areaOfficer", areaOfficerId] as const,
  site: (areaOfficerId: string, siteId: string) =>
    [...siteTasksQueryKeys.areaOfficer(areaOfficerId), "site", siteId] as const,
  allSites: (areaOfficerId: string) => [...siteTasksQueryKeys.areaOfficer(areaOfficerId), "allSites"] as const,
};

// Custom hook for fetching tasks for a specific site
export const useSiteTasks = (areaOfficerId: string | null, siteId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: siteId
      ? siteTasksQueryKeys.site(areaOfficerId || "", siteId)
      : siteTasksQueryKeys.allSites(areaOfficerId || ""),
    queryFn: () => fetchSiteTasks(areaOfficerId!, siteId || undefined),
    enabled: enabled && !!areaOfficerId,
    staleTime: 5 * 60 * 1000, // 5 minutes - tasks change more frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Custom hook for fetching tasks for all sites (overview)
export const useAllSiteTasks = (areaOfficerId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: siteTasksQueryKeys.allSites(areaOfficerId || ""),
    queryFn: () => fetchSiteTasks(areaOfficerId!),
    enabled: enabled && !!areaOfficerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Utility functions for Site Tasks
export const useSiteTasksUtils = () => {
  const queryClient = useQueryClient();

  const invalidateSiteTasks = (areaOfficerId: string, siteId?: string) => {
    if (siteId) {
      queryClient.invalidateQueries({
        queryKey: siteTasksQueryKeys.site(areaOfficerId, siteId),
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: siteTasksQueryKeys.areaOfficer(areaOfficerId),
      });
    }
  };

  const prefetchSiteTasks = async (areaOfficerId: string, siteId?: string) => {
    const queryKey = siteId
      ? siteTasksQueryKeys.site(areaOfficerId, siteId)
      : siteTasksQueryKeys.allSites(areaOfficerId);

    await queryClient.prefetchQuery({
      queryKey,
      queryFn: () => fetchSiteTasks(areaOfficerId, siteId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const clearAllSiteTasksCache = () => {
    queryClient.removeQueries({
      queryKey: siteTasksQueryKeys.all,
    });
  };

  // Helper functions for filtering and grouping tasks
  const filterTasksByStatus = (tasks: SiteTaskData[], status: SiteTaskData["status"]): SiteTaskData[] => {
    return tasks.filter((task) => task.status === status);
  };

  const filterTasksByType = (tasks: SiteTaskData[], type: SiteTaskData["taskType"]): SiteTaskData[] => {
    return tasks.filter((task) => task.taskType === type);
  };

  const filterTasksByPriority = (tasks: SiteTaskData[], priority: SiteTaskData["priority"]): SiteTaskData[] => {
    return tasks.filter((task) => task.priority === priority);
  };

  const groupTasksByStatus = (tasks: SiteTaskData[]) => {
    return tasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<SiteTaskData["status"], SiteTaskData[]>
    );
  };

  const groupTasksByType = (tasks: SiteTaskData[]) => {
    return tasks.reduce(
      (acc, task) => {
        if (!acc[task.taskType]) {
          acc[task.taskType] = [];
        }
        acc[task.taskType].push(task);
        return acc;
      },
      {} as Record<SiteTaskData["taskType"], SiteTaskData[]>
    );
  };

  const getTaskStats = (tasks: SiteTaskData[]) => {
    const stats = {
      total: tasks.length,
      overdue: tasks.filter((t) => t.status === "overdue").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      done: tasks.filter((t) => t.status === "done").length,
      highPriority: tasks.filter((t) => t.priority === "HIGH").length,
      mediumPriority: tasks.filter((t) => t.priority === "MEDIUM").length,
      lowPriority: tasks.filter((t) => t.priority === "LOW").length,
    };

    return stats;
  };

  const sortTasksByDeadline = (tasks: SiteTaskData[]): SiteTaskData[] => {
    return [...tasks].sort((a, b) => {
      // Parse DD/MM/YY format to compare dates
      const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split("/");
        return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
      };

      const dateA = parseDate(a.dueDate);
      const dateB = parseDate(b.dueDate);

      return dateA.getTime() - dateB.getTime();
    });
  };

  const sortTasksByPriority = (tasks: SiteTaskData[]): SiteTaskData[] => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

    return [...tasks].sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  return {
    invalidateSiteTasks,
    prefetchSiteTasks,
    clearAllSiteTasksCache,
    filterTasksByStatus,
    filterTasksByType,
    filterTasksByPriority,
    groupTasksByStatus,
    groupTasksByType,
    getTaskStats,
    sortTasksByDeadline,
    sortTasksByPriority,
  };
};
