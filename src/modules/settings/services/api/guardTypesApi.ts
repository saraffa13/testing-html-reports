// File: services/api/guardTypesApi.ts
import { authApi } from "../../../../config/axios";

export interface GuardType {
  id: string;
  typeName: string;
  agencyId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGuardTypeRequest {
  typeName: string;
  agencyId: string;
}

export interface UpdateGuardTypeRequest {
  typeName: string;
}

// API Response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export class GuardTypesApiService {
  /**
   * Create a new guard type
   */
  static async createGuardType(data: CreateGuardTypeRequest): Promise<GuardType> {
    try {
      console.log("📝 Creating guard type:", data);

      const response = await authApi.post<ApiResponse<GuardType>>("/settings/guard-type", data);

      console.log("✅ Guard type created successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error creating guard type:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to create guard type");
    }
  }

  /**
   * Get all guard types for an agency
   */
  static async getGuardTypes(agencyId: string): Promise<GuardType[]> {
    try {
      console.log("📝 Fetching guard types for agency:", agencyId);

      const response = await authApi.get<ApiResponse<GuardType[]>>(`/settings/guard-types/${agencyId}`);

      console.log("✅ Guard types fetched successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error fetching guard types:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch guard types");
    }
  }

  /**
   * Update a guard type
   */
  static async updateGuardType(id: string, agencyId: string, data: UpdateGuardTypeRequest): Promise<GuardType> {
    try {
      console.log("📝 Updating guard type:", { id, agencyId, data });

      const response = await authApi.patch<ApiResponse<GuardType>>(`/settings/guard-type/${id}/${agencyId}`, data);

      console.log("✅ Guard type updated successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error updating guard type:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to update guard type");
    }
  }

  /**
   * Delete a guard type
   */
  static async deleteGuardType(id: string, agencyId: string): Promise<void> {
    try {
      console.log("📝 Deleting guard type:", { id, agencyId });

      await authApi.delete(`/settings/guard-type/${id}/${agencyId}`);

      console.log("✅ Guard type deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting guard type:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to delete guard type");
    }
  }
}

export default GuardTypesApiService;
