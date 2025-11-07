// File: services/tasksApiService.ts
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../../config/axios";
import { formatDateStartForBackend, formatDateEndForBackend } from "@modules/clients/utils/dateFormatUtils";

// API Response interfaces
export interface ApiTask {
  id: string;
  taskStatus: "PENDING" | "INPROGRESS" | "COMPLETED";
  customLocation?: string;
  areaOfficerId: string;
  startedAt: string;
  deadline: string;
  clientId: string;
  siteId: string;
  createdAt: string;
  completedAt?: string | null;
  totalDuration?: number | null;
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

interface ApiTasksResponse {
  success: boolean;
  data: {
    data: ApiTask[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  timestamp: string;
}

// Transform API response to internal Task format
const transformApiTaskToInternal = (apiTask: ApiTask) => {
  // Format the task time from deadline or startedAt
  const taskTimeDate = apiTask.deadline ? new Date(apiTask.deadline) : new Date(apiTask.startedAt);
  const taskTime = taskTimeDate
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");

  // Create a meaningful note from available data
  let note = "";
  if (apiTask.customLocation) {
    note += `Location: ${apiTask.customLocation}`;
  }
  if (apiTask.site?.siteName) {
    note += `${note ? " | " : ""}Site: ${apiTask.site.siteName}`;
  }
  if (apiTask.subtasks && apiTask.subtasks.length > 0) {
    const subtaskTypes = apiTask.subtasks.map((st) => st.type).join(", ");
    note += `${note ? " | " : ""}Tasks: ${subtaskTypes}`;
  }
  if (!note) {
    note = `Task at ${apiTask.site?.siteName || "Unknown Site"}`;
  }

  return {
    id: apiTask.id,
    assignedBy: "Area Officer", // Default since not provided in API
    taskTime: taskTime,
    note: note,
    status: apiTask.taskStatus,
    priority: "MEDIUM" as const, // Default priority
    deadline: apiTask.deadline,
    completedAt: apiTask.completedAt,
    taskType: apiTask.subtasks?.[0]?.type || "OTHER",
    estimatedDuration: undefined,
    actualDuration: apiTask.totalDuration,
    attachments: [],
    // Additional fields from API
    customLocation: apiTask.customLocation,
    site: apiTask.site,
    client: apiTask.client,
    subtasks: apiTask.subtasks,
    startedAt: apiTask.startedAt,
  };
};

// API call function
const fetchFieldTasks = async (guardId: string) => {
  if (!guardId) {
    throw new Error("Guard ID is required");
  }

  console.log(`🔄 Fetching all field tasks from API for guardId: ${guardId}`);

  // Build query parameters - using guardId for field-tasks endpoint
  const queryParams = new URLSearchParams();
  queryParams.append("guardId", guardId);
  queryParams.append("page", "1");
  queryParams.append("limit", "50");
  queryParams.append("sortOrder", "desc");
  queryParams.append("date", new Date().toISOString());

  const queryString = queryParams.toString();
  const url = `/field-tasks?${queryString}`;

  const response = await authApi.get<ApiTasksResponse>(url);

  if (!response.data.success) {
    throw new Error("Failed to fetch tasks");
  }

  // Handle the correct response structure - tasks are in response.data.data.data
  const tasksData = response.data.data?.data || [];

  console.log(
    `✅ Successfully fetched ${Array.isArray(tasksData) ? tasksData.length : "unknown"} field tasks for guardId: ${guardId}`,
    {
      responseStructure: {
        hasData: !!response.data.data,
        hasFieldTasks: !!response.data.data?.data,
        tasksType: Array.isArray(response.data.data?.data) ? "array" : typeof response.data.data?.data,
        tasksLength: Array.isArray(response.data.data?.data) ? response.data.data.data.length : "N/A",
        pagination: response.data.data?.pagination,
      },
    }
  );

  // Ensure we have an array to work with
  if (!Array.isArray(tasksData)) {
    console.warn(`⚠️ Field Tasks API returned non-array data for guardId: ${guardId}`, tasksData);
    return [];
  }

  // Transform API data to internal format
  return tasksData.map(transformApiTaskToInternal);
};

// TanStack Query Keys
export const tasksQueryKeys = {
  all: ["field-tasks"] as const,
  guard: (guardId: string) => [...tasksQueryKeys.all, "guard", guardId] as const,
  guardWithParams: (
    guardId: string,
    date?: string,
    status?: string,
    clientId?: string,
    siteId?: string
  ) =>
    [
      ...tasksQueryKeys.guard(guardId),
      "params",
      date,
      status,
      clientId,
      siteId,
    ] as const,
};

// Custom hook for fetching field tasks with TanStack Query
export const useTasks = (guardId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: tasksQueryKeys.guard(guardId || ""),
    queryFn: () => fetchFieldTasks(guardId!),
    enabled: enabled && !!guardId,
    staleTime: 3 * 60 * 1000, // 3 minutes - field tasks don't change as frequently as incidents
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Utility functions
export const useTasksUtils = () => {
  // Helper function to get date range strings for API calls (same as defaults and incidents)
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

  // Filter tasks by date for legacy compatibility
  const getTasksForDate = (tasks: any[], date: Date) => {
    const targetDateStr = date.toISOString().split("T")[0];
    return tasks.filter((task) => {
      // Check deadline first, then startedAt as fallback
      const taskDate = task.deadline ? new Date(task.deadline) : new Date(task.startedAt);
      const taskDateStr = taskDate.toISOString().split("T")[0];
      return taskDateStr === targetDateStr;
    });
  };

  // Group tasks by status
  const groupTasksByStatus = (tasks: any[]) => {
    return tasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<string, any[]>
    );
  };

  // Sort tasks by priority and deadline
  const sortTasksByPriorityAndDeadline = (tasks: any[]) => {
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

    return [...tasks].sort((a, b) => {
      // First sort by priority
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Then sort by deadline
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }

      if (a.deadline) return -1;
      if (b.deadline) return 1;

      // Finally sort by creation time
      return new Date(a.taskTime).getTime() - new Date(b.taskTime).getTime();
    });
  };

  return {
    getDateRangeForView,
    getTasksForDate,
    groupTasksByStatus,
    sortTasksByPriorityAndDeadline,
  };
};
