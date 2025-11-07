// File: services/api/areaManagersApi.ts
import { authApi } from "../../../../config/axios";

export interface AreaManager {
  id: string;
  fullName: string;
  contactPhone: string;
  agencyId: string;
  areaId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAreaManagerRequest {
  fullName: string;
  contactPhone: string;
  agencyId: string;
  areaId: string;
}

export interface UpdateAreaManagerRequest {
  fullName: string;
  contactPhone: string;
  areaId: string;
}

// API Response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export class AreaManagersApiService {
  /**
   * Create a new area manager
   */
  static async createAreaManager(data: CreateAreaManagerRequest): Promise<AreaManager> {
    try {
      console.log("📝 Creating area manager:", data);

      const response = await authApi.post<ApiResponse<AreaManager>>("/settings/area-manager", data);

      console.log("✅ Area manager created successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error creating area manager:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to create area manager");
    }
  }

  /**
   * Get all area managers for an agency
   */
  static async getAreaManagers(agencyId: string): Promise<AreaManager[]> {
    try {
      console.log("📝 Fetching area managers for agency:", agencyId);

      const response = await authApi.get<ApiResponse<AreaManager[]>>(`/settings/area-managers/${agencyId}`);

      console.log("✅ Area managers fetched successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error fetching area managers:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch area managers");
    }
  }

  /**
   * Update an area manager
   */
  static async updateAreaManager(id: string, agencyId: string, data: UpdateAreaManagerRequest): Promise<AreaManager> {
    try {
      console.log("📝 Updating area manager:", { id, agencyId, data });

      const response = await authApi.patch<ApiResponse<AreaManager>>(`/settings/area-manager/${id}/${agencyId}`, data);

      console.log("✅ Area manager updated successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error updating area manager:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to update area manager");
    }
  }

  /**
   * Delete an area manager
   */
  static async deleteAreaManager(id: string, agencyId: string): Promise<void> {
    try {
      console.log("📝 Deleting area manager:", { id, agencyId });

      await authApi.delete(`/settings/area-manager/${id}/${agencyId}`);

      console.log("✅ Area manager deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting area manager:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to delete area manager");
    }
  }
}

export default AreaManagersApiService;
