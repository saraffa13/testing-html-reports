// File: services/defaultsApiService.ts
import { formatDateEndForBackend, formatDateStartForBackend } from "@modules/clients/utils/dateFormatUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../config/axios";
import type { DefaultData, GuardDefault } from "../components/GuardPerformanceWindow-SubComponents/defaults-types";

// API Response interfaces based on the new API structure
interface AttendanceConfirmation {
  id: string;
  dutyId: string;
  guardId: string;
  areaOfficer: string;
  clientId: string;
  siteId: string;
  willAttend: boolean;
  reason: string | null;
  confirmedAt: string;
  dutyDate: string;
}

interface LateDuty {
  id: string;
  dutyDate: string;
  guardId: string;
  areaOfficerId: string;
  clientId: string;
  siteId: string;
  scheduledStartTime: string;
  actualStartTime: string | null;
  isLate: boolean;
  lateMinutes?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface UniformCheck {
  id: string;
  dutyId: string;
  guardId: string;
  areaOfficer: string;
  dutyDate: string;
  clientId: string;
  siteId: string;
  passed: boolean;
  failureReasons: string[];
  photoUrl: string;
  remarks: string | null;
  retryCount: number;
  triggeredBy: string;
  checkedAt: string;
}

interface GeofenceLog {
  id: string;
  dutyId: string;
  guardId: string;
  areaOfficer: string;
  dutyDate: string;
  clientId: string;
  siteId: string;
  eventType: "ENTER" | "EXIT";
  reason: string | null;
  duration: number | null;
  timestamp: string;
}

interface AlertnessCheck {
  id: string;
  dutyId: string;
  guardId: string;
  areaOfficer: string;
  dutyDate: string;
  clientId: string;
  siteId: string;
  challengeType: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  passed: boolean;
  minimumScore: number;
  difficulty: string;
  retryCount: number;
  retryAllowed: boolean;
  triggeredBy: string;
  questionData: any;
  checkedAt: string;
}

interface ApiDefaultsResponse {
  attendanceConfirmations: AttendanceConfirmation[];
  lateDuties: LateDuty[];
  uniformChecks: UniformCheck[];
  geofenceLogs: GeofenceLog[];
  alertnessChecks: AlertnessCheck[];
  summary: {
    totalAttendanceConfirmations: number;
    totalLateDuties: number;
    totalUniformChecks: number;
    totalGeofenceLogs: number;
    totalAlertnessChecks: number;
  };
}

// Helper function to format time difference

// Helper function to format time from ISO string
const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Transform API response to internal format
const transformApiResponseToInternal = (apiResponse: ApiDefaultsResponse): GuardDefault[] => {
  const { lateDuties, uniformChecks, geofenceLogs, alertnessChecks } = apiResponse;

  // Group data by date
  const groupedByDate: Record<string, DefaultData[]> = {};

  // Process late duties (LATE defaults)
  (lateDuties || []).forEach((duty) => {
    const date = duty.dutyDate.split("T")[0]; // Extract YYYY-MM-DD

    if (duty.isLate && duty.lateMinutes && duty.lateMinutes > 0) {
      if (!groupedByDate[date]) groupedByDate[date] = [];

      const actualTime = duty.actualStartTime || duty.scheduledStartTime;
      groupedByDate[date].push({
        type: "LATE",
        timeWheel: {
          showCenterButton: false,
          lateIn: true,
          outOfGeofence: false,
          earlyOut: false,
          firstAlertnessTestMissed: false,
          secondAlertnessTestMissed: false,
        },
        displayText: `${formatTime(actualTime)} - ${duty.lateMinutes} MIN. LATE`,
      });
    }
  });

  // Process uniform checks (UNIFORM defaults)
  (uniformChecks || []).forEach((check) => {
    const date = check.dutyDate.split("T")[0];

    if (!check.passed || check.failureReasons.length > 0) {
      if (!groupedByDate[date]) groupedByDate[date] = [];

      groupedByDate[date].push({
        type: "UNIFORM",
        uniformErrors: check.failureReasons.map((reason, index) => ({
          id: `${check.id}_${index}`,
          icon: "identity_card",
          name: reason.charAt(0).toUpperCase() + reason.slice(1).toLowerCase(), // Format: Hat, Id_card, etc.
          status: check.passed ? "Approved" : ("Pending" as "Approved" | "Pending" | "Rejected"),
          evidenceUrl: check.photoUrl,
        })),
      });
    }
  });

  // Process geofence logs (GEOFENCE defaults)
  const geofenceExitsByDate: Record<string, GeofenceLog[]> = {};
  (geofenceLogs || []).forEach((log) => {
    const date = log.dutyDate.split("T")[0];

    if (log.eventType === "EXIT" && log.duration) {
      if (!geofenceExitsByDate[date]) geofenceExitsByDate[date] = [];
      geofenceExitsByDate[date].push(log);
    }
  });

  Object.entries(geofenceExitsByDate).forEach(([date, exits]) => {
    if (exits.length > 0) {
      if (!groupedByDate[date]) groupedByDate[date] = [];

      // Calculate total time outside geofence
      const totalMinutesOutside = exits.reduce((sum, exit) => sum + (exit.duration || 0), 0);
      const firstExit = exits[0];
      const lastExit = exits[exits.length - 1];

      groupedByDate[date].push({
        type: "GEOFENCE",
        timeWheel: {
          showCenterButton: false,
          lateIn: false,
          outOfGeofence: true,
          earlyOut: false,
          firstAlertnessTestMissed: false,
          secondAlertnessTestMissed: false,
        },
        displayText: `${formatTime(firstExit.timestamp)} TO ${formatTime(lastExit.timestamp)} - ${totalMinutesOutside} MIN. OUTSIDE`,
      });
    }
  });

  // Process alertness checks (ALERTNESS defaults)
  (alertnessChecks || []).forEach((check) => {
    const date = check.dutyDate.split("T")[0];

    if (!check.passed) {
      if (!groupedByDate[date]) groupedByDate[date] = [];

      groupedByDate[date].push({
        type: "ALERTNESS",
        timeWheel: {
          showCenterButton: false,
          lateIn: false,
          outOfGeofence: false,
          earlyOut: false,
          firstAlertnessTestMissed: true,
          secondAlertnessTestMissed: check.retryCount > 0,
        },
        displayText: `${formatTime(check.checkedAt)} - SCORE: ${check.score}/${check.minimumScore}`,
      });
    }
  });

  // Convert grouped data to GuardDefault array
  return Object.entries(groupedByDate).map(([date, defaults]) => ({
    guardId:
      (lateDuties && lateDuties[0]?.guardId) ||
      (uniformChecks && uniformChecks[0]?.guardId) ||
      (geofenceLogs && geofenceLogs[0]?.guardId) ||
      (alertnessChecks && alertnessChecks[0]?.guardId) ||
      "",
    date,
    defaults,
  }));
};

// API call function
const fetchGuardDefaults = async (guardId: string, fromDate?: string, toDate?: string): Promise<GuardDefault[]> => {
  if (!guardId) {
    throw new Error("Guard ID is required");
  }

  console.log(`🔄 Fetching defaults from API for guard: ${guardId}`);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (fromDate) queryParams.append("fromDate", fromDate);
  if (toDate) queryParams.append("toDate", toDate);

  const queryString = queryParams.toString();
  const url = `/defaults/guard/${guardId}/summary${queryString ? `?${queryString}` : ""}`;

  const response = await authApi.get<ApiDefaultsResponse>(url);

  if (!response.data) {
    throw new Error("Failed to fetch defaults - no data received");
  }

  console.log(`✅ Successfully fetched defaults for guard: ${guardId}`, {
    url,
    summary: response.data.summary,
    hasLateDuties: !!response.data.lateDuties,
    hasUniformChecks: !!response.data.uniformChecks,
    hasGeofenceLogs: !!response.data.geofenceLogs,
    hasAlertnessChecks: !!response.data.alertnessChecks,
    lateDutiesCount: response.data.lateDuties?.length || 0,
    uniformChecksCount: response.data.uniformChecks?.length || 0,
    geofenceLogsCount: response.data.geofenceLogs?.length || 0,
    alertnessChecksCount: response.data.alertnessChecks?.length || 0,
  });

  return transformApiResponseToInternal(response.data);
};

// TanStack Query Keys
export const defaultsQueryKeys = {
  all: ["defaults"] as const,
  guard: (guardId: string) => [...defaultsQueryKeys.all, "guard", guardId] as const,
  guardWithDateRange: (guardId: string, fromDate?: string, toDate?: string) =>
    [...defaultsQueryKeys.guard(guardId), "dateRange", fromDate, toDate] as const,
};

// Custom hook for fetching guard defaults with TanStack Query
export const useGuardDefaults = (
  guardId: string | null,
  enabled: boolean = true,
  fromDate?: string,
  toDate?: string
) => {
  return useQuery({
    queryKey: defaultsQueryKeys.guardWithDateRange(guardId || "", fromDate, toDate),
    queryFn: () => fetchGuardDefaults(guardId!, fromDate, toDate),
    enabled: enabled && !!guardId,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - cache garbage collection time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Only refetch if data is stale
  });
};

// Utility functions for working with the defaults data
export const useDefaultsUtils = () => {
  const queryClient = useQueryClient();

  const getDefaultsForDate = (allDefaults: GuardDefault[], date: Date): DefaultData[] => {
    const dateStr = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const guardDefaults = allDefaults.find((gd) => gd.date === dateStr);
    return guardDefaults?.defaults || [];
  };

  const getDefaultsForDateRange = (allDefaults: GuardDefault[], startDate: Date, endDate: Date): GuardDefault[] => {
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    return allDefaults.filter((gd) => {
      return gd.date >= startDateStr && gd.date <= endDateStr;
    });
  };

  const invalidateGuardDefaults = (guardId: string) => {
    queryClient.invalidateQueries({
      queryKey: defaultsQueryKeys.guard(guardId),
    });
  };

  const prefetchGuardDefaults = async (guardId: string, fromDate?: string, toDate?: string) => {
    await queryClient.prefetchQuery({
      queryKey: defaultsQueryKeys.guardWithDateRange(guardId, fromDate, toDate),
      queryFn: () => fetchGuardDefaults(guardId, fromDate, toDate),
      staleTime: 5 * 60 * 1000,
    });
  };

  const clearAllDefaultsCache = () => {
    queryClient.removeQueries({
      queryKey: defaultsQueryKeys.all,
    });
  };

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

  return {
    getDefaultsForDate,
    getDefaultsForDateRange,
    invalidateGuardDefaults,
    prefetchGuardDefaults,
    clearAllDefaultsCache,
    getDateRangeForView,
  };
};
