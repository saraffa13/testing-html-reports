// File: src/services/assignment.service.ts
import { authApi } from "../../../config/axios";

// Types based on the API response structure
export interface AssignmentClient {
  clientName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  pinCode: number;
  state: string;
}

export interface AssignmentSite {
  siteName: string;
  siteLocationMapLink: string;
  geofenceType: "CIRCLE" | "POLYGON";
}

export interface AssignmentShift {
  dutyStartTime: string; // Format: "HH:mm"
  dutyEndTime: string; // Format: "HH:mm"
  daysOfWeek: string[]; // Array of day names
}

export interface AssignmentAreaOfficer {
  firstName: string;
  middleName: string | null;
  lastName: string;
}

export interface GuardAssignment {
  client: AssignmentClient;
  site: AssignmentSite;
  shift: AssignmentShift;
  areaOfficer: AssignmentAreaOfficer;
  createdAt: string;
}

export interface GuardAssignmentResponse {
  success: boolean;
  data: GuardAssignment[];
  timestamp: string;
}

// Transform API data to component format
export interface FormattedAssignment {
  id: string; // Generated from index for UI purposes
  clientName: string;
  site: string;
  areaOfficer: string;
  startingDate: string;
  shiftDays: string;
  shiftTime: string;
  address: string;
  geolocation: {
    lat: number;
    lng: number;
  };
  locationType: string;
  siteLocationMapLink?: string;
}

// Helper function to format shift days
const formatShiftDays = (daysOfWeek: string[]): string => {
  const dayAbbreviations: { [key: string]: string } = {
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "T",
    Friday: "F",
    Saturday: "S",
    Sunday: "S",
  };

  const abbreviatedDays = daysOfWeek.map((day) => dayAbbreviations[day] || day.charAt(0));
  return `Days - ${abbreviatedDays.join(" ")}`;
};

// Helper function to format time from 24-hour to 12-hour format
const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(":");
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "/");
};

// Helper function to extract coordinates from Google Maps link (if available)
const extractCoordinatesFromMapLink = (mapLink: string): { lat: number; lng: number } => {
  // Default coordinates for Pune, Maharashtra (fallback)
  const defaultCoords = { lat: 18.5204, lng: 73.8567 };

  if (!mapLink || mapLink === "https://maps.google.com") {
    return defaultCoords;
  }

  try {
    // Try different Google Maps URL patterns
    const patterns = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // @lat,lng
      /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // q=lat,lng
      /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ll=lat,lng
      /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // center=lat,lng
    ];

    for (const pattern of patterns) {
      const match = mapLink.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);

        // Validate coordinates are reasonable for India
        if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
          return { lat, lng };
        }
      }
    }

    console.warn("Could not extract valid coordinates from map link:", mapLink);
    return defaultCoords;
  } catch (error) {
    console.error("Error extracting coordinates:", error);
    return defaultCoords;
  }
};

// Transform API response to component format
const transformAssignmentData = (assignments: GuardAssignment[]): FormattedAssignment[] => {
  return assignments.map((assignment, index) => {
    const { client, site, shift, areaOfficer, createdAt } = assignment;

    // Format area officer name
    const areaOfficerName = [areaOfficer.firstName, areaOfficer.middleName, areaOfficer.lastName]
      .filter(Boolean)
      .join(" ");

    // Format address
    const address = [
      client.addressLine1,
      client.addressLine2,
      client.city,
      client.district,
      client.state,
      client.pinCode.toString(),
    ]
      .filter(Boolean)
      .join(", ");

    // Format shift time
    const shiftTimeFormatted = `${formatTime(shift.dutyStartTime)} - ${formatTime(shift.dutyEndTime)}`;

    // Extract coordinates from map link or use default
    const geolocation = extractCoordinatesFromMapLink(site.siteLocationMapLink);

    return {
      id: `assignment_${index + 1}`, // Generate ID for UI
      clientName: client.clientName,
      site: site.siteName,
      areaOfficer: areaOfficerName,
      startingDate: formatDate(createdAt),
      shiftDays: formatShiftDays(shift.daysOfWeek),
      shiftTime: shiftTimeFormatted,
      address: address,
      geolocation: geolocation,
      locationType: site.geofenceType === "CIRCLE" ? "Site" : "Area", // Map geofence type to location type
      siteLocationMapLink: site.siteLocationMapLink,
    };
  });
};

// Assignment service
export const assignmentService = {
  // Get guard assignments by guard ID
  getGuardAssignments: async (guardId: string): Promise<FormattedAssignment[]> => {
    try {
      console.log(`🔄 Fetching assignments for guard: ${guardId}`);

      const response = await authApi.get<GuardAssignmentResponse>(`/guard-references/${guardId}/assignment`);

      if (!response.data.success) {
        throw new Error("Failed to fetch guard assignments");
      }

      console.log(`✅ Assignments fetched successfully: ${response.data.data.length} assignments`);

      // Transform the data to match component expectations
      const formattedAssignments = transformAssignmentData(response.data.data);

      console.log("📊 Formatted assignments:", formattedAssignments);

      return formattedAssignments;
    } catch (error: any) {
      console.error("❌ Failed to fetch guard assignments:", error);

      // Log additional context for debugging
      console.error("Request details:", {
        guardId,
        endpoint: `/guard-references/${guardId}/assignment`,
        errorType: error?.response ? "HTTP Error" : "Network/Other Error",
      });

      if (error.response?.status === 404) {
        console.log(`ℹ️ No assignments found for guard: ${guardId}`);
        return []; // Return empty array instead of throwing error
      } else if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("You do not have permission to view this guard's assignments.");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid guard ID or request format.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK" || !error.response) {
        throw new Error("Network error. Please check your connection.");
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch guard assignments.";
        throw new Error(errorMessage);
      }
    }
  },

  // Validate guard ID format
  validateGuardId: (guardId: string | null | undefined): boolean => {
    return !!(guardId && guardId.trim().length > 0);
  },
};
