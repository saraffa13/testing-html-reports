// File: services/officerDefaultsApiService.ts
import { formatDateEndForBackend, formatDateStartForBackend } from "@modules/clients/utils/dateFormatUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../config/axios";
import type {
  OfficerDefault,
  OfficerDefaultData,
  OfficerDefaultType,
} from "../components/OfficerInsights/OfficerPerformanceWindow-SubComponents/officer-defaults-types";

// Import Guard API response types for transformation
interface GuardApiDefaultsResponse {
  attendanceConfirmations: any[];
  lateDuties: any[];
  uniformChecks: any[];
  geofenceLogs: any[];
  alertnessChecks: any[];
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

// Transform Guard API response to Officer format (filtering out non-officer defaults)
const transformGuardApiToOfficerDefaults = (apiResponse: GuardApiDefaultsResponse): OfficerDefault[] => {
  const { lateDuties, uniformChecks } = apiResponse;

  // Group data by date - Officers only get LATE and UNIFORM
  const groupedByDate: Record<string, OfficerDefaultData[]> = {};

  // Process late duties (LATE defaults only)
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
        },
        displayText: `${formatTime(actualTime)} - ${duty.lateMinutes} MIN. LATE`,
      });
    }
  });

  // Process uniform checks (UNIFORM defaults only)
  (uniformChecks || []).forEach((check) => {
    const date = check.dutyDate.split("T")[0];

    if (!check.passed || check.failureReasons.length > 0) {
      if (!groupedByDate[date]) groupedByDate[date] = [];

      groupedByDate[date].push({
        type: "UNIFORM",
        uniformErrors: check.failureReasons.map((reason: string, index: number) => ({
          id: `${check.id}_${index}`,
          icon: "identity_card",
          name: reason.charAt(0).toUpperCase() + reason.slice(1),
          status: check.passed ? "Approved" : ("Pending" as "Approved" | "Pending" | "Rejected"),
          evidenceUrl: check.photoUrl,
        })),
      });
    }
  });

  // Convert grouped data to OfficerDefault array
  return Object.entries(groupedByDate).map(([date, defaults]) => ({
    officerId: (lateDuties && lateDuties[0]?.guardId) || (uniformChecks && uniformChecks[0]?.guardId) || "",
    date,
    defaults,
  }));
};

// API call function for Officer defaults
const fetchOfficerDefaults = async (
  officerId: string,
  fromDate?: string,
  toDate?: string
): Promise<OfficerDefault[]> => {
  if (!officerId) {
    throw new Error("Officer ID is required");
  }

  console.log(`🔄 Fetching officer defaults from API for officer: ${officerId}`);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (fromDate) queryParams.append("fromDate", fromDate);
  if (toDate) queryParams.append("toDate", toDate);

  const queryString = queryParams.toString();
  // Note: Using officerId as guardId since areaOfficerId = guard_id
  const url = `/defaults/guard/${officerId}/summary${queryString ? `?${queryString}` : ""}`;

  const response = await authApi.get<GuardApiDefaultsResponse>(url);

  if (!response.data) {
    throw new Error("Failed to fetch officer defaults - no data received");
  }

  console.log(`✅ Successfully fetched officer defaults for: ${officerId}`, {
    url,
    summary: response.data.summary,
    hasLateDuties: !!response.data.lateDuties,
    hasUniformChecks: !!response.data.uniformChecks,
    lateDutiesCount: response.data.lateDuties?.length || 0,
    uniformChecksCount: response.data.uniformChecks?.length || 0,
  });

  return transformGuardApiToOfficerDefaults(response.data);
};

// TanStack Query Keys for Officer Defaults
export const officerDefaultsQueryKeys = {
  all: ["officerDefaults"] as const,
  officer: (officerId: string) => [...officerDefaultsQueryKeys.all, "officer", officerId] as const,
  officerWithDateRange: (officerId: string, fromDate?: string, toDate?: string) =>
    [...officerDefaultsQueryKeys.officer(officerId), "dateRange", fromDate, toDate] as const,
};

// Custom hook for fetching officer defaults with TanStack Query
export const useOfficerDefaults = (
  officerId: string | null,
  enabled: boolean = true,
  fromDate?: string,
  toDate?: string
) => {
  return useQuery({
    queryKey: officerDefaultsQueryKeys.officerWithDateRange(officerId || "", fromDate, toDate),
    queryFn: () => fetchOfficerDefaults(officerId!, fromDate, toDate),
    enabled: enabled && !!officerId,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - cache garbage collection time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Only refetch if data is stale
  });
};

// Utility functions for working with officer defaults data
export const useOfficerDefaultsUtils = () => {
  const queryClient = useQueryClient();

  const getDefaultsForDate = (allDefaults: OfficerDefault[], date: Date): OfficerDefaultData[] => {
    const dateStr = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const officerDefaults = allDefaults.find((od) => od.date === dateStr);
    return officerDefaults?.defaults || [];
  };

  const getDefaultsForDateRange = (allDefaults: OfficerDefault[], startDate: Date, endDate: Date): OfficerDefault[] => {
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    return allDefaults.filter((od) => {
      return od.date >= startDateStr && od.date <= endDateStr;
    });
  };

  const invalidateOfficerDefaults = (officerId: string) => {
    queryClient.invalidateQueries({
      queryKey: officerDefaultsQueryKeys.officer(officerId),
    });
  };

  const prefetchOfficerDefaults = async (officerId: string, fromDate?: string, toDate?: string) => {
    await queryClient.prefetchQuery({
      queryKey: officerDefaultsQueryKeys.officerWithDateRange(officerId, fromDate, toDate),
      queryFn: () => fetchOfficerDefaults(officerId, fromDate, toDate),
      staleTime: 5 * 60 * 1000,
    });
  };

  const clearAllOfficerDefaultsCache = () => {
    queryClient.removeQueries({
      queryKey: officerDefaultsQueryKeys.all,
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

  // Officer-specific helper functions
  const hasOfficerDefaultsOnDate = (allDefaults: OfficerDefault[], date: Date): boolean => {
    const defaults = getDefaultsForDate(allDefaults, date);
    return defaults.length > 0;
  };

  const getOfficerDefaultsCountForDate = (allDefaults: OfficerDefault[], date: Date): number => {
    const defaults = getDefaultsForDate(allDefaults, date);
    return defaults.length;
  };

  const getAvailableOfficerDefaultTypes = (defaults: OfficerDefaultData[]): OfficerDefaultType[] => {
    return defaults.map((d) => d.type);
  };

  // Generate all days in period for calendar views
  const getAllDaysInPeriod = (selectedDate: Date, viewType: "WEEK" | "MONTH"): Date[] => {
    const days: Date[] = [];

    if (viewType === "WEEK") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay() + 1); // Monday

      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
    } else if (viewType === "MONTH") {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const currentDate = new Date(startOfMonth);
      while (currentDate <= endOfMonth) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return days;
  };

  return {
    getDefaultsForDate,
    getDefaultsForDateRange,
    invalidateOfficerDefaults,
    prefetchOfficerDefaults,
    clearAllOfficerDefaultsCache,
    getDateRangeForView,
    hasOfficerDefaultsOnDate,
    getOfficerDefaultsCountForDate,
    getAvailableOfficerDefaultTypes,
    getAllDaysInPeriod,
  };
};
