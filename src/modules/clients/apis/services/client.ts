import type { ClientWithDetails } from "@modules/clients/types";
import { useApi } from "../../../../apis/base";

export interface ClientsApiResponse {
  success: boolean;
  data: ClientWithDetails[];
  timestamp: string;
}

export interface ClientDetailsApiResponse {
  success: boolean;
  data: {
    id: string;
    opAgencyId: string;
    clientLogo: string | null;
    clientName: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    district: string;
    pinCode: number;
    state: string;
    landMark: string | null;
    contactPersonFullName: string;
    designation: string | null;
    contactPhone: string;
    contactEmail: string | null;
    emergencyContactName: string | null;
    emergencyContactDesignation: string | null;
    emergencyContactPhone: string | null;
    emergencyContactEmail: string | null;
    createdAt: string;
    updatedAt: string;
    opAgency: {
      id: string;
      agencyName: string;
      agencyImageUrl: string;
      registrationNumber: string;
      contactPersonName: string;
      contactEmail: string;
      contactPhone: string;
      addressLine1: string;
      city: string;
      state: string;
      pinCode: string;
      platformSubscriptionTier: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
    uniforms: Array<{
      id: string;
      clientId: string;
      uniformName: string;
      topPartUrl: string;
      bottomPartUrl: string;
      accessoriesUrl: string;
      createdAt: string;
      updatedAt: string;
    }>;
    sites: Array<{
      id: string;
      clientId: string;
      siteName: string;
      siteType: string[];
      areaOfficerId: string;
      siteContactPersonFullName: string | null;
      siteContactDesignation: string | null;
      siteContactPhone: string | null;
      siteContactEmail: string | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string;
      district: string;
      pinCode: string;
      state: string;
      landMark: string | null;
      siteLocationMapLink: string | null;
      latitude: string | null;
      longitude: string | null;
      plusCode: string | null;
      geoFenceMapData: any | null;
      geofenceType: string;
      patrolling: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  timestamp: string;
}

export const createClient = async (formData: FormData): Promise<any> => {
  const { postFormData } = useApi;
  const response = postFormData("/clients", formData);
  return response;
};

export const getClientsCounts = async (id: string, opAgencyId: string): Promise<ClientsApiResponse> => {
  const { get } = useApi;
  // Use the new API endpoint
  const response = await get(`/clients/count/${id}?opAgencyId=${opAgencyId}`);
  return response as ClientsApiResponse;
};

export const getClients = async (opAgencyId: string): Promise<ClientsApiResponse> => {
  const { get } = useApi;
  const response = await get(`/clients?opAgencyId=${opAgencyId}`);
  return response as ClientsApiResponse;
};

export const getClientById = async (clientId: string): Promise<ClientDetailsApiResponse> => {
  const { get } = useApi;
  const response = await get(`/clients/${clientId}`);
  return response as ClientDetailsApiResponse;
};

// Correct API endpoint and structure based on the API documentation
export const updateClient = async (clientId: string, data: FormData): Promise<any> => {
  console.log("updateClient service called with:", { clientId, formData: Object.fromEntries(data.entries()) });

  const { patchFormData } = useApi;

  try {
    // Use the correct API endpoint and patchFormData method for FormData
    const response = await patchFormData(`/clients/${clientId}`, data);
    console.log("updateClient service response:", response);
    return response;
  } catch (error) {
    console.error("updateClient service error:", error);
    throw error;
  }
};

// Alternative updateClient with JSON instead of FormData for debugging
export const updateClientJson = async (clientId: string, data: any): Promise<any> => {
  const { patch } = useApi;

  // Log the data being sent for debugging
  console.log("UpdateClientJson - clientId:", clientId);
  console.log("UpdateClientJson - data:", data);

  return patch(`/clients/${clientId}`, data);
};

// Get guard references for a client
export const getGuardReferences = async (params: {
  clientId: string;
  page?: number;
  limit?: number;
  guardId?: string;
  agencyId?: string;
  siteId?: string;
  userType?: string;
  status?: string;
  gender?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<any> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();

  // Add all parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/guard-references${queryString}`);
};
