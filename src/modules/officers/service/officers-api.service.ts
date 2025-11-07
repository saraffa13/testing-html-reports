import { authApi, guardsApi } from "../../../config/axios";

// Types based on the new dashboard API response structure
export interface DashboardAreaOfficer {
  guardId: string;
  agencyId: string;
  guardName: string;
  photo: string;
  phoneNumber: string;
  assignedArea: string;
  shiftTimeStart: string;
  shiftTimeEnd: string;
  assignedSites: number;
  assignedGuards: number;
  trustScore: number;
}

// API Response structure for the new area officers dashboard endpoint
export interface AreaOfficersAPIResponse {
  success: boolean;
  data: {
    guards: DashboardAreaOfficer[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

// Keep existing detailed profile interfaces for individual officer lookup
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
  type: "PERMANENT" | "CURRENT";
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
  assignedDutyArea: string | null;
  areaManager: string | null;
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
  assignedArea?: string;
}

export interface APICurrentAgency {
  id: string;
  name: string;
}

// Detailed Officer Profile (for individual officer lookup)
export interface APIOfficerProfile {
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
  userType: "AREA_OFFICER";
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

// Frontend Officer interface (keeping the same structure for table compatibility)
export interface Officer {
  companyId: string;
  photo: string;
  name: string;
  phoneNumber: string;
  designation: string;
  shiftTime: string;
  assignedArea: string;
  assignedSites: number;
  assignedGuards: number;
  upAndUpTrust: number;
  psaraStatus?: string;
  // Additional fields
  id: string;
  guardId: string;
  email: string;
  status: string;
  nationality: string;
  sex: string;
  bloodGroup: string;
  height: number;
  weight: number;
  martialStatus: string;
  currentAgency: string;
  currentAgencyId: string;
}

// Transform new dashboard API data to frontend Officer format
const transformDashboardOfficerToFrontend = (dashboardOfficer: DashboardAreaOfficer): Officer => {
  // Format phone number (remove country code for display if present)
  const formattedPhone = dashboardOfficer.phoneNumber.startsWith("+91")
    ? dashboardOfficer.phoneNumber.substring(3)
    : dashboardOfficer.phoneNumber;

  // Company ID is the agencyId
  const companyId = dashboardOfficer.agencyId;

  // Format shift time
  const formatShiftTime = (start: string, end: string): string => {
    if (start === "N/A" || end === "N/A") return "Not Assigned";
    return `${start} - ${end}`;
  };

  const shiftTime = formatShiftTime(dashboardOfficer.shiftTimeStart, dashboardOfficer.shiftTimeEnd);

  // Handle N/A values
  const assignedArea = dashboardOfficer.assignedArea === "N/A" ? "Unassigned" : dashboardOfficer.assignedArea;

  // Generate mock data for fields not in the new API (to maintain table compatibility)
  const designation = "Area Officer"; // Default designation for area officers
  const psaraStatus = Math.random() > 0.5 ? "Completed" : "Pending";
  const mockEmail = `${dashboardOfficer.guardName.toLowerCase().replace(/\s+/g, ".")}@areaoffice.com`;

  return {
    id: dashboardOfficer.guardId,
    guardId: dashboardOfficer.guardId,
    companyId,
    photo: dashboardOfficer.photo,
    name: dashboardOfficer.guardName,
    phoneNumber: formattedPhone,
    designation,
    shiftTime,
    assignedArea,
    assignedSites: dashboardOfficer.assignedSites,
    assignedGuards: dashboardOfficer.assignedGuards,
    upAndUpTrust: dashboardOfficer.trustScore,
    psaraStatus,
    // Mock data for compatibility (these fields don't exist in the new API)
    email: mockEmail,
    status: "ACTIVE", // Default status
    nationality: "Indian", // Default nationality
    sex: "MALE", // Default sex
    bloodGroup: "O+", // Default blood group
    height: 170, // Default height
    weight: 70, // Default weight
    martialStatus: "SINGLE", // Default marital status
    currentAgency: dashboardOfficer.agencyId,
    currentAgencyId: dashboardOfficer.agencyId,
  };
};

// Transform detailed officer profile to frontend Officer format (for individual lookups)
const transformAPIProfileToOfficer = (apiProfile: APIOfficerProfile): Officer => {
  // Get primary phone number
  const primaryContact = apiProfile.contacts.find((c) => c.contactType === "PRIMARY");
  const phoneNumber = primaryContact?.phoneNumber || apiProfile.phoneNumber;

  // Format phone number (remove country code for display)
  const formattedPhone = phoneNumber.startsWith("+91") ? phoneNumber.substring(3) : phoneNumber;

  // Get current employment details
  const currentEmployment = apiProfile.employments.find((e) => e.isCurrentEmployer);
  const designation = currentEmployment?.position || "Area Officer";

  // Company ID is the agencyId
  const companyId = apiProfile.currentAgencyId;

  // Create full name
  const fullName = [apiProfile.firstName, apiProfile.middleName, apiProfile.lastName].filter(Boolean).join(" ");

  // Generate mock data for fields not available in detailed profile
  const mockShiftTime = "8 AM - 8 PM";
  const mockAssignedArea = currentEmployment?.assignedDutyArea || "Area Assignment";
  const mockAssignedSites = Math.floor(Math.random() * 50) + 10;
  const mockAssignedGuards = Math.floor(Math.random() * 100) + 20;
  const mockUpAndUpTrust = Math.random() * 2 + 3;
  const mockPsaraStatus = Math.random() > 0.5 ? "Completed" : "Pending";

  return {
    id: apiProfile.id,
    guardId: apiProfile.id,
    companyId,
    photo: apiProfile.photo,
    name: fullName,
    phoneNumber: formattedPhone,
    designation,
    shiftTime: mockShiftTime,
    assignedArea: mockAssignedArea,
    assignedSites: mockAssignedSites,
    assignedGuards: mockAssignedGuards,
    upAndUpTrust: mockUpAndUpTrust,
    psaraStatus: mockPsaraStatus,
    email: apiProfile.email,
    status: apiProfile.status,
    nationality: apiProfile.nationality,
    sex: apiProfile.sex,
    bloodGroup: apiProfile.bloodGroup,
    height: apiProfile.height,
    weight: apiProfile.weight,
    martialStatus: apiProfile.martialStatus,
    currentAgency: apiProfile.currentAgency?.name || "N/A",
    currentAgencyId: apiProfile.currentAgencyId,
  };
};

// Updated Officers API service
export const officersAPIService = {
  // Get all officers using the new dashboard area-officers endpoint
  getOfficers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    agencyId?: string;
  }): Promise<{ officers: Officer[]; total: number; page: number; totalPages: number }> => {
    try {
      console.log("🔄 Fetching officers from dashboard area-officers API...");

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add agencyId (required parameter)
      if (params?.agencyId) {
        queryParams.append("agencyId", params.agencyId);
      } else {
        // Default agency ID if not provided
        queryParams.append("agencyId", "agency_0");
      }

      // Add includeDetails parameter (from the curl example)
      queryParams.append("includeDetails", "false");

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);

      const url = `/guard-references/dashboard/area-officers?${queryParams.toString()}`;

      const response = await authApi.get<AreaOfficersAPIResponse>(url);

      console.log("✅ Officers fetched successfully:", response.data.data.guards.length, "officers");

      // Transform API data to frontend format
      const transformedOfficers = response.data.data.guards.map(transformDashboardOfficerToFrontend);

      return {
        officers: transformedOfficers,
        total: response.data.data.meta.total,
        page: response.data.data.meta.page,
        totalPages: response.data.data.meta.totalPages,
      };
    } catch (error: any) {
      console.error("❌ Failed to fetch officers:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("You do not have permission to view officers.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK" || !error.response) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.response?.data?.message || "Failed to fetch officers.");
      }
    }
  },

  // Get officer by ID - using the detailed profile endpoint
  getOfficerById: async (guardId: string, agencyId?: string): Promise<Officer> => {
    try {
      console.log("🔄 Fetching officer details by GUARD ID:", guardId);

      // Since we don't have a specific endpoint for individual officers in the dashboard API,
      // we'll use the detailed profile endpoint from guardsApi
      const url = agencyId ? `/guards/${guardId}?agencyId=${encodeURIComponent(agencyId)}` : `/guards/${guardId}`;

      const response = await guardsApi.get<{ success: boolean; data: APIOfficerProfile }>(url);

      if (!response.data.success) {
        throw new Error("Failed to fetch officer details");
      }

      console.log("✅ Officer details fetched successfully:", response.data.data.firstName);

      // Verify this is actually an officer
      if (response.data.data.userType !== "AREA_OFFICER") {
        throw new Error("The requested user is not an area officer");
      }

      return transformAPIProfileToOfficer(response.data.data);
    } catch (error: any) {
      console.error("❌ Failed to fetch officer details:", error);

      if (error.response?.status === 404) {
        throw new Error("Officer not found.");
      } else if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("You do not have permission to view this officer.");
      } else {
        throw new Error("Failed to fetch officer details.");
      }
    }
  },

  // Get detailed officer profile
  getOfficerProfile: async (guardId: string, agencyId?: string): Promise<APIOfficerProfile> => {
    try {
      console.log("🔄 Fetching officer profile by GUARD ID:", guardId);

      const url = agencyId ? `/guards/${guardId}?agencyId=${encodeURIComponent(agencyId)}` : `/guards/${guardId}`;

      const response = await guardsApi.get<{ success: boolean; data: APIOfficerProfile }>(url);

      if (!response.data.success) {
        throw new Error("Failed to fetch officer profile");
      }

      // Verify this is actually an officer
      if (response.data.data.userType !== "AREA_OFFICER") {
        throw new Error("The requested user is not an area officer");
      }

      console.log("✅ Officer profile fetched successfully:", response.data.data.firstName);

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch officer profile:", error);
      throw error;
    }
  },

  // Search officers (using the search parameter in the main dashboard endpoint)
  searchOfficers: async (searchTerm: string, agencyId?: string): Promise<Officer[]> => {
    try {
      const result = await officersAPIService.getOfficers({
        search: searchTerm,
        agencyId: agencyId || "agency_0",
      });
      return result.officers;
    } catch (error) {
      console.error("❌ Failed to search officers:", error);
      throw error;
    }
  },
};
