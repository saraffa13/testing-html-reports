// File: src/modules/guards/services/guard-history.service.ts
import { authApi } from "../../../config/axios";

// Types based on the API response structure
export interface HistoryShift {
  dutyStartTime: string; // Format: "HH:mm"
  dutyEndTime: string; // Format: "HH:mm"
}

export interface HistoryClient {
  clientName: string;
}

export interface HistorySite {
  siteName: string;
}

export interface GuardHistoryRecord {
  createdAt: string; // ISO date string
  shift: HistoryShift;
  client: HistoryClient;
  site: HistorySite;
}

export interface GuardHistoryResponse {
  success: boolean;
  data: GuardHistoryRecord[];
  timestamp: string;
}

// Transform API data to component format
export interface FormattedHistoryRecord {
  id: string; // Generated from index for UI purposes
  startDate: string; // Formatted date from createdAt
  endDate: string; // Same as startDate since API doesn't provide end date
  shift: string; // Formatted time range
  client: string;
  site: string;
  designation: string; // Default designation
}

// Helper function to format time from 24-hour to 12-hour format
const formatTime = (time24: string): string => {
  if (!time24) return "";

  const [hours, minutes] = time24.split(":");
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
};

// Helper function to format date from ISO string
const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Transform API response to component format
const transformHistoryData = (historyRecords: GuardHistoryRecord[]): FormattedHistoryRecord[] => {
  return historyRecords.map((record, index) => {
    const { createdAt, shift, client, site } = record;

    // Format shift time
    const shiftTimeFormatted = `${formatTime(shift.dutyStartTime)} - ${formatTime(shift.dutyEndTime)}`;

    // Format dates
    const formattedDate = formatDate(createdAt);

    return {
      id: `history_${index + 1}`, // Generate ID for UI
      startDate: formattedDate,
      endDate: formattedDate, // API doesn't provide separate end date
      shift: shiftTimeFormatted,
      client: client.clientName,
      site: site.siteName,
      designation: "Security Guard", // Default designation since not provided by API
    };
  });
};

// Guard History API Service
export const guardHistoryService = {
  // Get guard history by guard ID
  getGuardHistory: async (guardId: string): Promise<FormattedHistoryRecord[]> => {
    try {
      console.log(`🔄 Fetching history for guard: ${guardId}`);

      const response = await authApi.get<GuardHistoryResponse>(`/guard-references/${guardId}/history`);

      if (!response.data.success) {
        throw new Error("Failed to fetch guard history");
      }

      console.log(`✅ History fetched successfully: ${response.data.data.length} records`);

      // Transform the data to match component expectations
      const formattedHistory = transformHistoryData(response.data.data);

      console.log("📊 Formatted history records:", formattedHistory);

      return formattedHistory;
    } catch (error: any) {
      console.error("❌ Failed to fetch guard history:", error);

      // Log additional context for debugging
      console.error("Request details:", {
        guardId,
        endpoint: `/guard-references/${guardId}/history`,
        errorType: error?.response ? "HTTP Error" : "Network/Other Error",
      });

      if (error.response?.status === 404) {
        console.log(`ℹ️ No history found for guard: ${guardId}`);
        return []; // Return empty array instead of throwing error
      } else if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("You do not have permission to view this guard's history.");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid guard ID or request format.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK" || !error.response) {
        throw new Error("Network error. Please check your connection.");
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch guard history.";
        throw new Error(errorMessage);
      }
    }
  },

  // Validate guard ID format
  validateGuardId: (guardId: string | null | undefined): boolean => {
    return !!(guardId && guardId.trim().length > 0);
  },

  // Group history records by type (for potential future categorization)
  categorizeHistoryRecords: (
    records: FormattedHistoryRecord[]
  ): {
    recent: FormattedHistoryRecord[];
    older: FormattedHistoryRecord[];
  } => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recent: FormattedHistoryRecord[] = [];
    const older: FormattedHistoryRecord[] = [];

    records.forEach((record) => {
      const recordDate = new Date(record.startDate.split("/").reverse().join("-")); // Convert DD/MM/YYYY to YYYY-MM-DD

      if (recordDate >= oneMonthAgo) {
        recent.push(record);
      } else {
        older.push(record);
      }
    });

    return { recent, older };
  },

  // Sort records by date (newest first)
  sortHistoryRecords: (records: FormattedHistoryRecord[]): FormattedHistoryRecord[] => {
    return [...records].sort((a, b) => {
      // Convert DD/MM/YYYY to comparable date
      const dateA = new Date(a.startDate.split("/").reverse().join("-"));
      const dateB = new Date(b.startDate.split("/").reverse().join("-"));

      return dateB.getTime() - dateA.getTime(); // Newest first
    });
  },
};
