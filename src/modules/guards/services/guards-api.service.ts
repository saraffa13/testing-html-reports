import { authApi, guardsApi } from "../../../config/axios";
import type { GuardType } from "../hooks/useGuardTypes";

// Types based on the new API response structure (for dashboard/table)
export interface DashboardGuardReference {
  guardId: string;
  agencyId: string;
  guardName: string;
  photo: string;
  phoneNumber: string;
  guardType: string;
  shiftTimeStart: string;
  shiftTimeEnd: string;
  clientName: string;
  areaOfficerName: string;
  trustScore: number;
}

// Keep the original APIGuard interface for detailed profile views
export interface APIGuardAddress {
  id: string;
  guardId: string;
  line1: string;
  line2: string | null;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  landmark: string | null;
  country: string;
  type: "PERMANENT" | "TEMPORARY";
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface APIGuardContact {
  id: string;
  guardId: string;
  phoneNumber: string;
  contactType: "PRIMARY" | "ALTERNATE";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface APIEmergencyContact {
  id: string;
  guardId: string;
  contactName: string;
  relationship: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIFamilyMember {
  id: string;
  guardId: string;
  relationshipType: "FATHER" | "MOTHER" | "SPOUSE";
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIGuardDocument {
  id: string;
  guardId: string;
  type: string;
  documentNumber: string;
  documentUrl: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string | null;
  isVerified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface APIEmployment {
  id: string;
  guardId: string;
  agencyId: string;
  startDate: string;
  endDate: string | null;
  position: string | null;
  salary: string | null;
  terminationReason: string | null;
  isCurrentEmployer: boolean;
  psaraStatus: string;
  licenseNumber: string | null;
  dateOfIssue: string | null;
  validUntil: string | null;
  valindIn: string | null;
  createdAt: string;
  updatedAt: string;
  agency: {
    id: string;
    name: string;
  };
}

export interface APICurrentAgency {
  id: string;
  name: string;
}

// Main API Guard interface (from the backend response) - KEEP THIS FOR PROFILE VIEWS
export interface APIGuard {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  sex: "MALE" | "FEMALE" | "OTHER";
  bloodGroup: string;
  height: number;
  weight: number;
  identificationMark: string;
  martialStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  photo: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
  guardType: string;
  userType: string;
  currentAgencyId: string;
  createdAt: string;
  updatedAt: string;
  addresses: APIGuardAddress[];
  contacts: APIGuardContact[];
  emergencyContacts: APIEmergencyContact[];
  familyMembers: APIFamilyMember[];
  documents: APIGuardDocument[];
  employments: APIEmployment[];
  currentAgency: APICurrentAgency;
}

// API Response structure for the new dashboard endpoint
export interface GuardReferencesAPIResponse {
  success: boolean;
  data: {
    guards: DashboardGuardReference[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

// API Response structure for detailed guard profile
export interface GuardsAPIResponse {
  success: boolean;
  data: {
    data: APIGuard[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}

// Frontend Guard interface - ONLY fields from the dashboard API, no mock data
export interface Guard {
  id: string;
  companyId: string; // agencyId
  photo: string;
  name: string;
  phoneNumber: string;
  type: string; // guardType (mapped to typeName)
  shiftTime: string; // formatted from shiftTimeStart and shiftTimeEnd
  assignedClient: string;
  areaOfficer: string;
  upAndUpTrust: number; // trustScore
}

// Cache for guard types to avoid multiple API calls
let guardTypesCache: GuardType[] | null = null;
let guardTypesCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch guard types with caching
const fetchGuardTypes = async (agencyId: string): Promise<GuardType[]> => {
  const now = Date.now();

  // Return cached data if still valid
  if (guardTypesCache && now - guardTypesCacheTimestamp < CACHE_DURATION) {
    console.log("📦 Using cached guard types:", guardTypesCache.length, "types");
    return guardTypesCache;
  }

  try {
    console.log("🔄 Fetching guard types for agencyId:", agencyId);
    // FIXED: Endpoint is under /settings/ route
    const response = await authApi.get<{ success: boolean; data: GuardType[] }>(
      `/settings/guard-types/${agencyId}`
    );
    guardTypesCache = response.data.data;
    guardTypesCacheTimestamp = now;
    console.log("✅ Guard types fetched and cached:", guardTypesCache.length, "types", guardTypesCache.map(t => ({ id: t.id, name: t.typeName })));
    return guardTypesCache;
  } catch (error: any) {
    console.error("❌ Failed to fetch guard types:", error?.response?.data || error?.message || error);
    // Return cache even if expired, or empty array if no cache
    const fallback = guardTypesCache || [];
    console.log("⚠️ Using fallback:", fallback.length, "guard types");
    return fallback;
  }
};

// Transform new API guard data to frontend format - NO MOCK DATA
const transformDashboardGuardToFrontend = (
  dashboardGuard: DashboardGuardReference,
  guardTypes?: GuardType[]
): Guard => {
  // Format phone number (remove country code for display if present)
  const formattedPhone = dashboardGuard.phoneNumber.startsWith("+91")
    ? dashboardGuard.phoneNumber.substring(3)
    : dashboardGuard.phoneNumber;

  // Format shift time
  const formatShiftTime = (start: string, end: string): string => {
    if (start === "N/A" || end === "N/A") return "Not Assigned";
    return `${start} - ${end}`;
  };

  const shiftTime = formatShiftTime(dashboardGuard.shiftTimeStart, dashboardGuard.shiftTimeEnd);

  // Handle N/A values
  const assignedClient = dashboardGuard.clientName === "N/A" ? "Unassigned" : dashboardGuard.clientName;
  const areaOfficer = dashboardGuard.areaOfficerName === "N/A" ? "Not Assigned" : dashboardGuard.areaOfficerName;

  // Look up guard type name from guardTypeId
  let guardType = "Security Guard"; // Default fallback
  if (dashboardGuard.guardType && dashboardGuard.guardType !== "N/A") {
    // If guardTypes are provided, look up the type name
    if (guardTypes && guardTypes.length > 0) {
      const foundType = guardTypes.find((type) => type.id === dashboardGuard.guardType);
      if (foundType) {
        guardType = foundType.typeName;
        console.log(`✅ Mapped guardTypeId "${dashboardGuard.guardType}" to "${guardType}"`);
      } else {
        console.warn(`⚠️ No match found for guardTypeId: "${dashboardGuard.guardType}"`, {
          availableTypes: guardTypes.map(t => ({ id: t.id, name: t.typeName }))
        });
        guardType = dashboardGuard.guardType; // Use the ID as fallback
      }
    } else {
      console.warn("⚠️ No guard types available for mapping");
      // Fallback to using the raw value (could be ID or name)
      guardType = dashboardGuard.guardType;
    }
  }

  // Return ONLY the fields from the dashboard API - NO MOCK DATA
  return {
    id: dashboardGuard.guardId,
    companyId: dashboardGuard.agencyId,
    photo: dashboardGuard.photo,
    name: dashboardGuard.guardName,
    phoneNumber: formattedPhone,
    type: guardType,
    shiftTime,
    assignedClient,
    areaOfficer,
    upAndUpTrust: dashboardGuard.trustScore,
  };
};

// Transform API guard data to frontend format (for detailed profile views)
// Note: This uses the full guards API endpoint which may have more data than dashboard
const transformAPIGuardToFrontend = (apiGuard: APIGuard): Guard => {
  // Get primary phone number
  const primaryContact = apiGuard.contacts.find((c) => c.contactType === "PRIMARY");
  const phoneNumber = primaryContact?.phoneNumber || apiGuard.phoneNumber;

  // Format phone number (remove country code for display)
  const formattedPhone = phoneNumber.startsWith("+91") ? phoneNumber.substring(3) : phoneNumber;

  // Create full name
  const fullName = [apiGuard.firstName, apiGuard.middleName, apiGuard.lastName].filter(Boolean).join(" ");

  // For guard details, we only have limited info, so use defaults for fields not available
  return {
    id: apiGuard.id,
    companyId: apiGuard.currentAgencyId,
    photo: apiGuard.photo,
    name: fullName,
    phoneNumber: formattedPhone,
    type: apiGuard.guardType || "Security Guard", // guardType might be ID, ideally should be mapped
    shiftTime: "Not Available",
    assignedClient: apiGuard.currentAgency?.name || "Unassigned",
    areaOfficer: "Not Available",
    upAndUpTrust: 0, // Not available in this endpoint
  };
};

// Updated Guards API service
export const guardsAPIService = {
  // Get all guards using the new dashboard endpoint
  getGuards: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    agencyId?: string;
  }): Promise<{ guards: Guard[]; total: number; page: number; totalPages: number }> => {
    try {
      console.log("🔄 Fetching guards from dashboard API...");

      // Get agencyId
      const agencyId = params?.agencyId || "agency_0";

      // Fetch guard types first (with caching)
      const guardTypes = await fetchGuardTypes(agencyId);
      console.log("✅ Guard types fetched:", guardTypes.length, "types");

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add agencyId (required parameter)
      queryParams.append("agencyId", agencyId);

      // Add includeDetails parameter (from the curl example)
      queryParams.append("includeDetails", "false");

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);

      const url = `/guard-references/dashboard?${queryParams.toString()}`;

      const response = await authApi.get<GuardReferencesAPIResponse>(url);

      console.log("✅ Guards fetched successfully:", response.data.data.guards.length, "guards");

      // Transform API data to frontend format with guard types
      const transformedGuards = response.data.data.guards.map((guard) =>
        transformDashboardGuardToFrontend(guard, guardTypes)
      );

      return {
        guards: transformedGuards,
        total: response.data.data.meta.total,
        page: response.data.data.meta.page,
        totalPages: response.data.data.meta.totalPages,
      };
    } catch (error: any) {
      console.error("❌ Failed to fetch guards:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("You do not have permission to view guards.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK" || !error.response) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.response?.data?.message || "Failed to fetch guards.");
      }
    }
  },

  // Get guard by ID - Use the detailed profile endpoint (guardsApi)
  getGuardById: async (id: string): Promise<Guard> => {
    try {
      console.log("🔄 Fetching guard by ID:", id);

      const response = await guardsApi.get<{ success: boolean; data: APIGuard }>(`/guards/${id}`);

      console.log("✅ Guard fetched successfully:", response.data.data.firstName);

      return transformAPIGuardToFrontend(response.data.data);
    } catch (error: any) {
      console.error("❌ Failed to fetch guard:", error);

      if (error.response?.status === 404) {
        throw new Error("Guard not found.");
      } else if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else {
        throw new Error("Failed to fetch guard details.");
      }
    }
  },

  // Search guards (using the search parameter in the main endpoint)
  searchGuards: async (searchTerm: string, agencyId?: string): Promise<Guard[]> => {
    try {
      const result = await guardsAPIService.getGuards({
        search: searchTerm,
        agencyId: agencyId || "agency_0",
      });
      return result.guards;
    } catch (error) {
      console.error("❌ Failed to search guards:", error);
      throw error;
    }
  },
};
