// File: services/api/areasApi.ts
import { authApi } from "../../../../config/axios";

export interface Area {
  id: string;
  name: string;
  agencyId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAreaRequest {
  name: string;
  agencyId: string;
}

export interface UpdateAreaRequest {
  name: string;
}

// API Response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export class AreasApiService {
  /**
   * Create a new area
   */
  static async createArea(data: CreateAreaRequest): Promise<Area> {
    try {
      console.log("📝 Creating area:", data);

      const response = await authApi.post<ApiResponse<Area>>("/settings/area", data);

      console.log("✅ Area created successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error creating area:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to create area");
    }
  }

  /**
   * Get all areas for an agency
   */
  static async getAreas(agencyId: string): Promise<Area[]> {
    try {
      console.log("📝 Fetching areas for agency:", agencyId);

      const response = await authApi.get<ApiResponse<Area[]>>(`/settings/areas/${agencyId}`);

      console.log("✅ Areas fetched successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error fetching areas:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch areas");
    }
  }

  /**
   * Update an area
   */
  static async updateArea(id: string, agencyId: string, data: UpdateAreaRequest): Promise<Area> {
    try {
      console.log("📝 Updating area:", { id, agencyId, data });

      const response = await authApi.patch<ApiResponse<Area>>(`/settings/area/${id}/${agencyId}`, data);

      console.log("✅ Area updated successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error updating area:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to update area");
    }
  }

  /**
   * Delete an area
   */
  static async deleteArea(id: string, agencyId: string): Promise<void> {
    try {
      console.log("📝 Deleting area:", { id, agencyId });

      await authApi.delete(`/settings/area/${id}/${agencyId}`);

      console.log("✅ Area deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting area:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to delete area");
    }
  }
}

export default AreasApiService;
