import { useApi } from "../../../../apis/base";

// Dashboard overview API response types
export interface DashboardOverviewData {
  id: string;
  name: string;
  favourite: boolean;
  defaults: {
    absentCount: number;
    lateCount: number;
    uniformCount: number;
    alertnessCount: number;
    geofenceCount: number;
    patrolCount: number;
  };
}

export interface DashboardOverviewResponse {
  success: boolean;
  data: {
    clientsCount: number;
    clients: DashboardOverviewData[];
  };
  timestamp: string;
}

// Liveliness alerts API response types
export interface LivelinessAlertData {
  guardId: string;
  photo: string;
  guardName: string;
  designation: string;
  clientName: string;
  siteName: string;
  dateAndTime: string;
  where: string;
}

export interface LivelinessAlertsResponse {
  success: boolean;
  data: LivelinessAlertData[];
  timestamp: string;
}

// Late uniform summary API response types
export interface LateUniformSummaryData {
  clientId: string;
  clientName: string;
  favourite: boolean;
  lateCount: number;
  uniform: number;
}

export interface LateUniformSummaryResponse {
  success: boolean;
  data: {
    data: Array<{
      totalLateCount: number;
      totalUniformDefaultCount: number;
      overviewData: LateUniformSummaryData[];
    }>;
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

// Shift performance issues API response types
export interface ShiftPerformanceData {
  clientId: string;
  clientName: string;
  favourite: boolean;
  alertness: number;
  geofence: number;
  patrol: number;
}

export interface ShiftPerformanceResponse {
  success: boolean;
  data: {
    data: Array<{
      totalAlertnessCount: number;
      totalGeofenceCount: number;
      totalPatrolCount: number;
      overviewData: ShiftPerformanceData[];
    }>;
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

// Area officers API response types
export interface AreaOfficersData {
  clientId: string;
  clientName: string;
  favourite: boolean;
  absentCount: number;
  lateCount: number;
  uniform: number;
}

export interface AreaOfficersResponse {
  success: boolean;
  data: {
    data: Array<{
      totalAbsentCount: number;
      totalLateCount: number;
      totalUniformDefaultCount: number;
      overviewData: AreaOfficersData[];
    }>;
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

// Incident reports API response types
export interface IncidentReportData {
  incidentId: string;
  clientName: string;
  siteName: string;
  events: string[];
  dateAndTime: string;
  status: "OPEN" | "CLOSED";
  latestAlert: string;
}

export interface IncidentReportsResponse {
  success: boolean;
  data: {
    data: Array<{
      totalIncidents: number;
      openIncidents: number;
      closedIncidents: number;
      incidentReports: IncidentReportData[];
    }>;
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

// Task-related types for Area Officer Tasks
export interface TaskData {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  taskStatus: "PENDING" | "INPROGRESS" | "COMPLETED" | "OVERDUE";
  deadline: string;
  clientName: string;
  siteName: string;
  areaOfficerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  success: boolean;
  data: {
    tasks: TaskData[];
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

// Attendance overview API response types
export interface AttendanceOverviewData {
  clientId: string;
  clientName: string;
  favourite: boolean;
  absentCount: number;
  relacedCount: number;
  toReplaceCount: number;
}

export interface AttendanceOverviewResponse {
  success: boolean;
  data: {
    totalAbsentCount: number;
    totalRelacedCount: number;
    totalToReplaceCount: number;
    clients: AttendanceOverviewData[];
  };
  timestamp: string;
}

// Get dashboard overview API service
export const getDashboardOverview = async (params: {
  opAgencyId: string;
  from: string;
  to: string;
  page?: number;
  limit?: number;
}): Promise<DashboardOverviewResponse> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();

  // Add only the parameters that the new API accepts
  if (params.opAgencyId) searchParams.append("opAgencyId", params.opAgencyId);
  if (params.from) searchParams.append("from", params.from);
  if (params.to) searchParams.append("to", params.to);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/admin-console/dashboard/overview${queryString}`);
};

// Get liveliness alerts API service
export const getLivelinessAlerts = async (params: {
  opAgencyId: string;
  from: string;
  to: string;
  page?: number;
  limit?: number;
}): Promise<LivelinessAlertsResponse> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();

  // Add only the parameters that the new API accepts
  if (params.opAgencyId) searchParams.append("opAgencyId", params.opAgencyId);
  if (params.from) searchParams.append("from", params.from);
  if (params.to) searchParams.append("to", params.to);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/admin-console/dashboard/overview/liveliness${queryString}`);
};

// Get late uniform summary API service
export const getLateUniformSummary = async (params: {
  opAgencyId: string;
  clientId?: string;
  dutyDate?: string;
  createdAt?: object;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  userTypeFilter?: string;
  incidentStatus?: string;
  taskStatus?: string;
}): Promise<LateUniformSummaryResponse> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();

  // Add all parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/dashboard/late-uniform-summary${queryString}`);
};

// Get shift performance issues API service
export const getShiftPerformanceIssues = async (params: {
  opAgencyId: string;
  clientId?: string;
  dutyDate?: string;
  createdAt?: object;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  userTypeFilter?: string;
  incidentStatus?: string;
  taskStatus?: string;
}): Promise<ShiftPerformanceResponse> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();

  // Add all parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/dashboard/shift-performance-issues${queryString}`);
};

// Get area officers API service
export const getAreaOfficers = async (params: {
  opAgencyId: string;
  clientId?: string;
  dutyDate?: string;
  createdAt?: object;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  userTypeFilter?: string;
  incidentStatus?: string;
  taskStatus?: string;
}): Promise<AreaOfficersResponse> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();

  // Add all parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/dashboard/area-officers-only/absent-late-uniform${queryString}`);
};

// Get incident reports API service
export const getIncidentReports = async (params: {
  opAgencyId: string;
  clientId?: string;
  dutyDate?: string;
  createdAt?: object;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  userTypeFilter?: string;
  incidentStatus?: string;
  taskStatus?: string;
}): Promise<IncidentReportsResponse> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();

  // Add all parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/dashboard/incident-reports${queryString}`);
};

// Get tasks API service for area officer tasks
export const getTasks = async (params: {
  opAgencyId?: string;
  clientId?: string;
  siteId?: string;
  areaOfficerId?: string;
  status?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  page?: number;
  limit?: number;
}): Promise<TasksResponse> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();

  // Add all parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Map opAgencyId to agencyId for backend compatibility
      const paramKey = key === 'opAgencyId' ? 'agencyId' : key;
      searchParams.append(paramKey, value.toString());
    }
  });

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/tasks${queryString}`);
};

// Get attendance overview API service
export const getAttendanceOverview = async (params: {
  opAgencyId?: string;
  from: string;
  to: string;
  page?: number;
  limit?: number;
}): Promise<AttendanceOverviewResponse> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/admin-console/dashboard/overview/attendance${queryString}`);
};
