import { useApi } from "../../../../apis/base";

export interface FieldTasksFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fromDate?: string;
  toDate?: string;
  date?: string;
  areaOfficerId?: string;
  guardId?: string;
  clientId?: string;
  siteId?: string;
  dutyId?: string;
  other?: string;
  status?: "PENDING" | "INPROGRESS" | "COMPLETED" | "CANCELLED";
  assignedBy?: "CLIENT" | "AREA_OFFICER";
}

export interface FieldTask {
  id: string;
  guardId: string;
  assignedBy: "CLIENT" | "AREA_OFFICER";
  areaOfficerId: string;
  clientId: string;
  siteId: string;
  dutyId: string;
  other: string;
  status: "PENDING" | "INPROGRESS" | "COMPLETED" | "CANCELLED";
  note: string;
  noteFile: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FieldTasksPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FieldTasksApiResponse {
  success: boolean;
  data: {
    data: FieldTask[];
    pagination: FieldTasksPagination;
  };
  timestamp: string;
}

export const getFieldTasks = async (filters: FieldTasksFilters): Promise<FieldTasksApiResponse> => {
  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
  if (filters.fromDate) queryParams.append("fromDate", filters.fromDate);
  if (filters.toDate) queryParams.append("toDate", filters.toDate);
  if (filters.date) queryParams.append("date", filters.date);
  if (filters.areaOfficerId) queryParams.append("areaOfficerId", filters.areaOfficerId);
  if (filters.guardId) queryParams.append("guardId", filters.guardId);
  if (filters.clientId) queryParams.append("clientId", filters.clientId);
  if (filters.siteId) queryParams.append("siteId", filters.siteId);
  if (filters.dutyId) queryParams.append("dutyId", filters.dutyId);
  if (filters.other) queryParams.append("other", filters.other);
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.assignedBy) queryParams.append("assignedBy", filters.assignedBy);

  const endpoint = `/field-tasks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  return useApi.get<FieldTasksApiResponse>(endpoint);
};

export const getFieldTasksByClientId = async (
  clientId: string,
  additionalFilters?: Omit<FieldTasksFilters, "clientId">
): Promise<FieldTasksApiResponse> => {
  return getFieldTasks({
    clientId,
    ...additionalFilters,
  });
};

export const getFieldTasksBySiteId = async (
  clientId: string,
  siteId: string,
  additionalFilters?: Omit<FieldTasksFilters, "clientId" | "siteId">
): Promise<FieldTasksApiResponse> => {
  return getFieldTasks({
    clientId,
    siteId,
    ...additionalFilters,
  });
};

export const getFieldTasksByGuardId = async (
  guardId: string,
  additionalFilters?: Omit<FieldTasksFilters, "guardId">
): Promise<FieldTasksApiResponse> => {
  return getFieldTasks({
    guardId,
    ...additionalFilters,
  });
};
