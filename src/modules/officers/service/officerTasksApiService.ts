// File: services/officerTasksApiService.ts
import { formatDateEndForBackend, formatDateStartForBackend } from "@modules/clients/utils/dateFormatUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../config/axios";
import type {
  OfficerTask,
  OfficerTaskStatus,
  OfficerTaskType,
} from "../components/OfficerInsights/OfficerPerformanceWindow-SubComponents/officer-incident-tasks-types";

// API Response interfaces for Guard tasks
export interface GuardApiTask {
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

interface GuardApiTasksResponse {
  success: boolean;
  data: {
    tasks: GuardApiTask[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  timestamp: string;
}

// Transform Guard task status to Officer task status - FIXED
const mapGuardStatusToOfficerStatus = (guardStatus: string, deadline: string): OfficerTaskStatus => {
  const status = guardStatus.toUpperCase();

  // First check if task is completed - this should take priority
  if (status === "COMPLETED") {
    console.log(`✅ Task marked as DONE (was ${guardStatus})`);
    return "DONE";
  }

  // For non-completed tasks, check if overdue
  try {
    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (now > deadlineDate) {
      console.log(`⏰ Task marked as OVERDUE (was ${guardStatus})`);
      return "OVERDUE";
    }
  } catch (e) {
    console.warn("Error parsing deadline:", deadline);
  }

  // Default to PENDING for PENDING and INPROGRESS
  console.log(`📝 Task marked as PENDING (was ${guardStatus})`);
  return "PENDING";
};

// Map Guard subtask types to Officer task types
const mapSubtaskTypeToOfficerType = (subtaskType: string): OfficerTaskType => {
  const typeMap: Record<string, OfficerTaskType> = {
    SITE_VISIT: "sitevisit",
    SITEVISIT: "sitevisit",
    TRAINING: "training",
    DOCUMENTS: "document",
    INSPECTION: "inspection",
    AUDIT: "inspection",
    OTHER: "other",
  };

  return typeMap[subtaskType.toUpperCase()] || "other";
};

// Get priority based on deadline proximity
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

// FIXED: Use actual IDs instead of hardcoded names
const getClientSiteInfo = (task: GuardApiTask) => {
  return {
    clientName: task.client?.clientName || task.clientId, // Use actual client name from API or fallback to ID
    siteName: task.site?.siteName || task.siteId, // Use actual site name from API or fallback to ID
    clientId: task.clientId,
    siteId: task.siteId,
  };
};

// Generate task note from available data
const generateTaskNote = (task: GuardApiTask): string => {
  const parts: string[] = [];

  if (task.customLocation) {
    parts.push(`Location: ${task.customLocation}`);
  }

  if (task.site?.siteName) {
    parts.push(`Site: ${task.site.siteName}`);
  } else if (task.siteId) {
    parts.push(`Site ID: ${task.siteId}`);
  }

  if (task.subtasks && task.subtasks.length > 0) {
    const subtaskTypes = task.subtasks.map((st) => st.type).join(", ");
    parts.push(`Tasks: ${subtaskTypes}`);
  }

  if (parts.length === 0) {
    const { siteName } = getClientSiteInfo(task);
    parts.push(`Task at ${siteName}`);
  }

  return parts.join(" | ");
};

// Transform Guard API task to Officer format - UPDATED
const transformGuardTaskToOfficer = (guardTask: GuardApiTask): OfficerTask => {
  const { clientName, siteName, clientId, siteId } = getClientSiteInfo(guardTask);
  const officerStatus = mapGuardStatusToOfficerStatus(guardTask.taskStatus, guardTask.deadline);

  // Enhanced debug logging to track status transformation
  console.log(`🔄 Task ${guardTask.id}:`, {
    guardStatus: guardTask.taskStatus,
    officerStatus: officerStatus,
    deadline: guardTask.deadline,
    completedAt: guardTask.completedAt,
    clientId: clientId,
    siteId: siteId,
    clientName: clientName,
    siteName: siteName,
  });

  // Determine primary task type from subtasks
  const taskTypes: OfficerTaskType[] = guardTask.subtasks?.map((st) => mapSubtaskTypeToOfficerType(st.type)) || [
    "other",
  ];

  // Format task time from deadline
  const taskTimeDate = new Date(guardTask.deadline);
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

  // Format due date
  const dueDate = taskTimeDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  const transformedTask: OfficerTask = {
    id: guardTask.id,
    type: taskTypes[0] || "other",
    types: taskTypes,
    assignedBy: "Area Officer", // Default since not provided in Guard API
    assignedTo: "Guard Name", // Default value
    taskTime: taskTime,
    dueDate: dueDate,
    status: officerStatus,
    priority: calculateTaskPriority(guardTask.deadline, guardTask.taskStatus),
    note: generateTaskNote(guardTask),
    site: siteName, // Now uses actual site name or ID
    title: taskTypes[0]?.charAt(0).toUpperCase() + taskTypes[0]?.slice(1) || "Task",
    description: generateTaskNote(guardTask),
  };

  console.log(`✅ Transformed task ${guardTask.id} with status: ${transformedTask.status}`);
  return transformedTask;
};

// API call function for Officer tasks
const fetchOfficerTasks = async (officerId: string): Promise<OfficerTask[]> => {
  if (!officerId) {
    throw new Error("Officer ID is required");
  }

  console.log(`🔄 Fetching officer tasks from API for officer: ${officerId}`);

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append("areaOfficerId", officerId); // Using officerId as areaOfficerId
  queryParams.append("page", "1");
  queryParams.append("limit", "1000"); // Get all tasks for the officer

  const queryString = queryParams.toString();
  const url = `/tasks?${queryString}`;

  const response = await authApi.get<GuardApiTasksResponse>(url);

  if (!response.data.success) {
    throw new Error("Failed to fetch officer tasks");
  }

  const tasksData = response.data.data?.tasks || [];

  console.log(
    `✅ Successfully fetched ${Array.isArray(tasksData) ? tasksData.length : "unknown"} tasks for officer: ${officerId}`,
    {
      responseStructure: {
        hasData: !!response.data.data,
        hasTasks: !!response.data.data?.tasks,
        tasksType: Array.isArray(response.data.data?.tasks) ? "array" : typeof response.data.data?.tasks,
        tasksLength: Array.isArray(response.data.data?.tasks) ? response.data.data.tasks.length : "N/A",
        pagination: response.data.data?.pagination,
      },
      rawTasks: tasksData.map((t) => ({ id: t.id, status: t.taskStatus, deadline: t.deadline })),
    }
  );

  if (!Array.isArray(tasksData)) {
    console.warn(`⚠️ Officer Tasks API returned non-array data for officer: ${officerId}`, tasksData);
    return [];
  }

  // Transform Guard tasks to Officer format
  const transformedTasks = tasksData.map(transformGuardTaskToOfficer);

  // Enhanced debug logging for task status distribution
  const statusCounts = transformedTasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    {} as Record<OfficerTaskStatus, number>
  );

  console.log(`📊 Officer Task Status Distribution:`, statusCounts);
  console.log(
    `📋 Officer Tasks Details:`,
    transformedTasks.map((t) => ({
      id: t.id,
      status: t.status,
      site: t.site,
      client: t.assignedBy, // This would be client info if available
    }))
  );

  // Verify DONE tasks are present
  const doneTasks = transformedTasks.filter((t) => t.status === "DONE");
  if (doneTasks.length > 0) {
    console.log(
      `✅ Found ${doneTasks.length} DONE tasks:`,
      doneTasks.map((t) => ({ id: t.id, site: t.site }))
    );
  } else {
    console.log(
      `⚠️ No DONE tasks found. All tasks:`,
      transformedTasks.map((t) => ({ id: t.id, status: t.status }))
    );
  }

  return transformedTasks;
};

// TanStack Query Keys for Officer Tasks
export const officerTasksQueryKeys = {
  all: ["officerTasks"] as const,
  officer: (officerId: string) => [...officerTasksQueryKeys.all, "officer", officerId] as const,
  officerWithParams: (
    officerId: string,
    deadlineFrom?: string,
    deadlineTo?: string,
    status?: string,
    clientId?: string,
    siteId?: string
  ) =>
    [
      ...officerTasksQueryKeys.officer(officerId),
      "params",
      deadlineFrom,
      deadlineTo,
      status,
      clientId,
      siteId,
    ] as const,
};

// Custom hook for fetching officer tasks with TanStack Query
export const useOfficerTasks = (officerId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: officerTasksQueryKeys.officer(officerId || ""),
    queryFn: () => fetchOfficerTasks(officerId!),
    enabled: enabled && !!officerId,
    staleTime: 3 * 60 * 1000, // 3 minutes - tasks don't change as frequently as incidents
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Utility functions for Officer tasks
export const useOfficerTasksUtils = () => {
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
          toDate: formatDateEndForBackend(dayEnd),
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
          toDate: formatDateEndForBackend(defaultEnd),
        };
    }
  };

  // Filter tasks by date for day view
  const getTasksForDate = (tasks: OfficerTask[], date: Date): OfficerTask[] => {
    const targetDateStr = date.toISOString().split("T")[0];
    return tasks.filter((task) => {
      // Check deadline date
      try {
        const taskDate = new Date(task.dueDate.split(" ")[0].replace(/(\d{2})\/(\d{2})\/(\d{2})/, "20$3-$2-$1"));
        const taskDateStr = taskDate.toISOString().split("T")[0];
        if (taskDateStr === targetDateStr) return true;
      } catch (e) {
        console.warn("Error parsing task date:", task.dueDate);
      }

      // Show PENDING and OVERDUE tasks regardless of date for better UX
      if (task.status === "PENDING" || task.status === "OVERDUE") {
        return true;
      }

      return false;
    });
  };

  // Filter tasks by status
  const getTasksByStatus = (tasks: OfficerTask[], status: OfficerTaskStatus): OfficerTask[] => {
    const filtered = tasks.filter((task) => task.status === status);
    console.log(`🔍 Filtering tasks by status "${status}":`, {
      totalTasks: tasks.length,
      filteredCount: filtered.length,
      filteredTasks: filtered.map((t) => ({ id: t.id, status: t.status, site: t.site })),
    });
    return filtered;
  };

  // Get task counts by status
  const getTaskCounts = (tasks: OfficerTask[]) => {
    const counts = {
      pending: tasks.filter((task) => task.status === "PENDING").length,
      overdue: tasks.filter((task) => task.status === "OVERDUE").length,
      done: tasks.filter((task) => task.status === "DONE").length,
      total: tasks.length,
    };

    console.log(`📊 Task counts:`, counts);
    return counts;
  };

  // Group tasks by status
  const groupTasksByStatus = (tasks: OfficerTask[]) => {
    return tasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<OfficerTaskStatus, OfficerTask[]>
    );
  };

  // Sort tasks by priority and deadline
  const sortTasksByPriorityAndDeadline = (tasks: OfficerTask[]): OfficerTask[] => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

    return [...tasks].sort((a, b) => {
      // First sort by priority
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Then sort by deadline
      try {
        const dateA = new Date(a.dueDate.replace(/(\d{2})\/(\d{2})\/(\d{2})/, "20$3-$2-$1"));
        const dateB = new Date(b.dueDate.replace(/(\d{2})\/(\d{2})\/(\d{2})/, "20$3-$2-$1"));
        return dateA.getTime() - dateB.getTime();
      } catch (e) {
        return 0;
      }
    });
  };

  // Check if task is overdue
  const isTaskOverdue = (task: OfficerTask): boolean => {
    try {
      const deadline = new Date(task.dueDate.replace(/(\d{2})\/(\d{2})\/(\d{2})/, "20$3-$2-$1"));
      const now = new Date();
      return now > deadline && task.status !== "DONE";
    } catch (e) {
      return false;
    }
  };

  // Get tasks due today
  const getTasksDueToday = (tasks: OfficerTask[]): OfficerTask[] => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter((task) => {
      try {
        const taskDate = new Date(task.dueDate.replace(/(\d{2})\/(\d{2})\/(\d{2})/, "20$3-$2-$1"));
        const taskDateStr = taskDate.toISOString().split("T")[0];
        return taskDateStr === today;
      } catch (e) {
        return false;
      }
    });
  };

  // Invalidate officer tasks cache
  const invalidateOfficerTasks = (officerId: string) => {
    queryClient.invalidateQueries({
      queryKey: officerTasksQueryKeys.officer(officerId),
    });
  };

  // Prefetch officer tasks
  const prefetchOfficerTasks = async (officerId: string) => {
    await queryClient.prefetchQuery({
      queryKey: officerTasksQueryKeys.officer(officerId),
      queryFn: () => fetchOfficerTasks(officerId),
      staleTime: 3 * 60 * 1000,
    });
  };

  // Clear all officer tasks cache
  const clearAllOfficerTasksCache = () => {
    queryClient.removeQueries({
      queryKey: officerTasksQueryKeys.all,
    });
  };

  // Group tasks by type
  const groupTasksByType = (tasks: OfficerTask[]) => {
    return tasks.reduce(
      (acc, task) => {
        const type = task.type || "other";
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(task);
        return acc;
      },
      {} as Record<OfficerTaskType, OfficerTask[]>
    );
  };

  return {
    getDateRangeForView,
    getTasksForDate,
    getTasksByStatus,
    getTaskCounts,
    groupTasksByStatus,
    sortTasksByPriorityAndDeadline,
    isTaskOverdue,
    getTasksDueToday,
    invalidateOfficerTasks,
    prefetchOfficerTasks,
    clearAllOfficerTasksCache,
    groupTasksByType,
  };
};
