import { useApi } from "../../../../apis/base";

export interface TasksFilters {
  agencyId?: string;
  clientId?: string;
  siteId?: string;
  areaOfficerId?: string;
  status?: "PENDING" | "INPROGRESS" | "COMPLETED" | "CANCELLED";
  deadlineFrom?: string;
  deadlineTo?: string;
  page?: number;
  limit?: number;
}

export interface SubTask {
  id: string;
  taskId: string;
  type: "SITE_VISIT" | "DOCUMENTS" | "TRAINING" | "INSPECTION" | "OTHER";
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  taskStatus: "PENDING" | "INPROGRESS" | "COMPLETED" | "CANCELLED";
  customLocation: string | null;
  areaOfficerId: string;
  startedAt: string;
  deadline: string;
  clientId: string;
  siteId: string;
  createdAt: string;
  completedAt: string | null;
  totalDuration: number | null;
  subtasks: SubTask[];
  site: {
    siteName: string;
    addressLine1: string | null;
    city: string;
    pinCode: string;
  };
  client: {
    clientName: string;
    clientLogo: string | null;
  };
}

export interface TasksPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TasksApiResponse {
  success: boolean;
  data: {
    tasks: Task[];
    pagination: TasksPagination;
  };
  timestamp: string;
}

export const getClientTasks = async (filters: TasksFilters): Promise<TasksApiResponse> => {
  const queryParams = new URLSearchParams();

  if (filters.clientId) queryParams.append("clientId", filters.clientId);
  if (filters.siteId) queryParams.append("siteId", filters.siteId);
  if (filters.areaOfficerId) queryParams.append("areaOfficerId", filters.areaOfficerId);
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.deadlineFrom) queryParams.append("deadlineFrom", filters.deadlineFrom);
  if (filters.deadlineTo) queryParams.append("deadlineTo", filters.deadlineTo);
  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());

  const endpoint = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  return useApi.get<TasksApiResponse>(endpoint);
};

export const getClientTasksByClientId = async (
  clientId: string,
  additionalFilters?: Omit<TasksFilters, "clientId">
): Promise<TasksApiResponse> => {
  return getClientTasks({
    clientId,
    ...additionalFilters,
  });
};

export const getClientTasksBySiteId = async (
  clientId: string,
  siteId: string,
  additionalFilters?: Omit<TasksFilters, "clientId" | "siteId">
): Promise<TasksApiResponse> => {
  return getClientTasks({
    clientId,
    siteId,
    ...additionalFilters,
  });
};

export const getClientTasksByAreaOfficer = async (
  clientId: string,
  areaOfficerId: string,
  additionalFilters?: Omit<TasksFilters, "clientId" | "areaOfficerId">
): Promise<TasksApiResponse> => {
  return getClientTasks({
    clientId,
    areaOfficerId,
    ...additionalFilters,
  });
};
