import { useApi } from "../../../../apis/base";

import axios, { AxiosError } from "axios";
import type { CreateSiteSuccessResponse, APIErrorResponse } from "../../components/forms/add_client_site/types";

const API_BASE_URL = import.meta.env.VITE_DUTY_API_BASE_URL;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Validation helper to check request payload
const validateCreateSiteRequest = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required top-level fields
  if (!data.clientId) errors.push("clientId is required");
  if (!data.areaOfficerId) errors.push("areaOfficerId is required");
  if (!data.siteName || !data.siteName.trim()) errors.push("siteName is required");
  if (!data.siteType || !Array.isArray(data.siteType) || data.siteType.length === 0) {
    errors.push("siteType must be a non-empty array");
  }
  if (!data.addressLine1) errors.push("addressLine1 is required");
  if (!data.city) errors.push("city is required");
  if (!data.district) errors.push("district is required");
  if (!data.pinCode) errors.push("pinCode is required");
  if (!data.state) errors.push("state is required");
  if (!data.geofenceType) errors.push("geofenceType is required");
  if (typeof data.patrolling !== "boolean") errors.push("patrolling must be a boolean");

  // Check sitePosts structure
  if (data.sitePosts && Array.isArray(data.sitePosts)) {
    data.sitePosts.forEach((post: any, postIndex: number) => {
      if (!post.tempId) errors.push(`sitePosts[${postIndex}].tempId is required`);
      if (!post.postName) errors.push(`sitePosts[${postIndex}].postName is required`);
      if (!post.geofenceType) errors.push(`sitePosts[${postIndex}].geofenceType is required`);

      if (post.shifts && Array.isArray(post.shifts)) {
        post.shifts.forEach((shift: any, shiftIndex: number) => {
          if (!shift.tempId) errors.push(`sitePosts[${postIndex}].shifts[${shiftIndex}].tempId is required`);
          if (!shift.daysOfWeek || !Array.isArray(shift.daysOfWeek) || shift.daysOfWeek.length === 0) {
            errors.push(`sitePosts[${postIndex}].shifts[${shiftIndex}].daysOfWeek must be a non-empty array`);
          }

          if (shift.guardRequirements && Array.isArray(shift.guardRequirements)) {
            shift.guardRequirements.forEach((req: any, reqIndex: number) => {
              if (!req.tempId) {
                errors.push(`sitePosts[${postIndex}].shifts[${shiftIndex}].guardRequirements[${reqIndex}].tempId is required`);
              }
              if (!req.guardTypeId) {
                errors.push(`sitePosts[${postIndex}].shifts[${shiftIndex}].guardRequirements[${reqIndex}].guardTypeId is required`);
              }
              if (typeof req.guardCount !== "number" || req.guardCount <= 0) {
                errors.push(`sitePosts[${postIndex}].shifts[${shiftIndex}].guardRequirements[${reqIndex}].guardCount must be a positive number`);
              }
              if (typeof req.alertnessChallengeCount !== "number" || req.alertnessChallengeCount < 1) {
                errors.push(`sitePosts[${postIndex}].shifts[${shiftIndex}].guardRequirements[${reqIndex}].alertnessChallengeCount must be at least 1`);
              }
            });
          }

          if (shift.guardSelections && Array.isArray(shift.guardSelections)) {
            shift.guardSelections.forEach((sel: any, selIndex: number) => {
              if (!sel.guardRequirementId) {
                errors.push(`sitePosts[${postIndex}].shifts[${shiftIndex}].guardSelections[${selIndex}].guardRequirementId is required`);
              }
              if (!sel.guardId) {
                errors.push(`sitePosts[${postIndex}].shifts[${shiftIndex}].guardSelections[${selIndex}].guardId is required`);
              }
              if (typeof sel.occurenceCount !== "number") {
                errors.push(`sitePosts[${postIndex}].shifts[${shiftIndex}].guardSelections[${selIndex}].occurenceCount must be a number`);
              }
            });
          }
        });
      }
    });
  }

  return { isValid: errors.length === 0, errors };
};

export const createSite = async (data: any): Promise<CreateSiteSuccessResponse> => {
  // Use a longer timeout for site creation (60 seconds) to avoid timeout errors
  // while the backend processes the request (which can take 30-40 seconds)

  // Log the request payload for debugging
  console.group("🔍 Create Site API Request");
  console.log("Full Request Payload:", JSON.stringify(data, null, 2));

  // Validate the request before sending
  const validation = validateCreateSiteRequest(data);
  if (!validation.isValid) {
    console.error("❌ Client-side validation failed:");
    validation.errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
    console.groupEnd();
    throw new Error(`Client-side validation failed: ${validation.errors.join(", ")}`);
  }
  console.log("✅ Client-side validation passed");
  console.groupEnd();

  try {
    const response = await axios.post<CreateSiteSuccessResponse>(`${API_BASE_URL}/client-sites`, data, {
      headers: { ...getAuthHeaders() },
      timeout: 60000, // 60 seconds timeout
    });

    console.log("✅ Site created successfully:", response.data);
    return response.data;
  } catch (error) {
    // Enhanced error handling for API errors with proper typing
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<APIErrorResponse>;
      console.error("❌ API Error Response:", axiosError.response?.data);
      if (axiosError.response?.data) {
        throw axiosError;
      }
    }
    console.error("❌ Unexpected error:", error);
    throw error;
  }
};

export const getClientSites = async (clientId: string, page?: number, limit?: number): Promise<any> => {
  const { get } = useApi;

  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return get(`/client-sites/${clientId}${queryString}`);
};

export const getClientSitesWithCounts = async (
  clientId: string,
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  const { get } = useApi;
  return get(`/client-sites/count/${clientId}?limit=${limit}&page=${page}`);
};

export const updateSiteGeofence = async (siteId: string, data: any) => {
  const { patch } = useApi;
  return patch(`/sites/${siteId}/geofence`, data);
};
