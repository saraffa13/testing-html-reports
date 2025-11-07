// File: services/api/siteTypesApi.ts
import { authApi } from "../../../../config/axios";

export interface SiteType {
  id: string;
  typeName: string;
  agencyId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSiteTypeRequest {
  typeName: string;
  agencyId: string;
}

export interface UpdateSiteTypeRequest {
  typeName: string;
}

// API Response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export class SiteTypesApiService {
  /**
   * Create a new site type
   */
  static async createSiteType(data: CreateSiteTypeRequest): Promise<SiteType> {
    try {
      console.log("📝 Creating site type:", data);

      const response = await authApi.post<ApiResponse<SiteType>>("/settings/site-type", data);

      console.log("✅ Site type created successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error creating site type:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to create site type");
    }
  }

  /**
   * Get all site types for an agency
   */
  static async getSiteTypes(agencyId: string): Promise<SiteType[]> {
    try {
      console.log("📝 Fetching site types for agency:", agencyId);

      const response = await authApi.get<ApiResponse<SiteType[]>>(`/settings/site-types/${agencyId}`);

      console.log("✅ Site types fetched successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error fetching site types:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch site types");
    }
  }

  /**
   * Get a specific site type by ID
   */
  static async getSiteType(id: string, agencyId: string): Promise<SiteType> {
    try {
      console.log("📝 Fetching site type:", { id, agencyId });

      const response = await authApi.get<ApiResponse<SiteType>>(`/settings/site-type/${id}/${agencyId}`);

      console.log("✅ Site type fetched successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error fetching site type:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch site type");
    }
  }

  /**
   * Update a site type
   */
  static async updateSiteType(id: string, agencyId: string, data: UpdateSiteTypeRequest): Promise<SiteType> {
    try {
      console.log("📝 Updating site type:", { id, agencyId, data });

      const response = await authApi.patch<ApiResponse<SiteType>>(`/settings/site-type/${id}/${agencyId}`, data);

      console.log("✅ Site type updated successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error updating site type:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to update site type");
    }
  }

  /**
   * Delete a site type
   */
  static async deleteSiteType(id: string, agencyId: string): Promise<void> {
    try {
      console.log("📝 Deleting site type:", { id, agencyId });

      await authApi.delete(`/settings/site-type/${id}/${agencyId}`);

      console.log("✅ Site type deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting site type:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to delete site type");
    }
  }
}

export default SiteTypesApiService;
