// File: src/modules/officers/service/areas-api.service.ts
import { authApi } from "../../../config/axios";

// Types for Areas API
export interface Area {
  id: string;
  name: string;
  agencyId: string;
  createdAt: string;
  updatedAt: string;
  areas: AreaManager[];
}

export interface AreaManager {
  id: string;
  fullName: string;
  contactPhone: string;
  agencyId: string;
  areaId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AreaManagerWithDetails {
  id: string;
  fullName: string;
  contactPhone: string;
  agencyId: string;
  areaId: string;
  createdAt: string;
  updatedAt: string;
  area: {
    id: string;
    name: string;
  };
  agency: {
    id: string;
    agencyName: string;
  };
}

// API Response interfaces
export interface AreasAPIResponse {
  success: boolean;
  data: Area[];
  timestamp: string;
}

export interface AreaManagersAPIResponse {
  success: boolean;
  data: AreaManagerWithDetails[];
  timestamp: string;
}

// Areas and Area Managers API Service
export const areasAPIService = {
  // Get all areas for an agency
  getAreas: async (agencyId: string): Promise<Area[]> => {
    try {
      console.log(`🔄 Fetching areas for agency: ${agencyId}`);

      const response = await authApi.get<AreasAPIResponse>(`/settings/areas/${encodeURIComponent(agencyId)}`);

      if (!response.data.success) {
        throw new Error("Failed to fetch areas");
      }

      console.log("✅ Areas fetched successfully:", response.data.data.length, "areas");

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch areas:", error);

      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("You do not have permission to view areas.");
      } else if (error.response?.status === 404) {
        throw new Error("Agency not found or no areas configured.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK" || !error.response) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.response?.data?.message || "Failed to fetch areas.");
      }
    }
  },

  // Get all area managers for an agency
  getAreaManagers: async (agencyId: string): Promise<AreaManagerWithDetails[]> => {
    try {
      console.log(`🔄 Fetching area managers for agency: ${agencyId}`);

      const response = await authApi.get<AreaManagersAPIResponse>(
        `/settings/area-managers/${encodeURIComponent(agencyId)}`
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch area managers");
      }

      console.log("✅ Area managers fetched successfully:", response.data.data.length, "managers");

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch area managers:", error);

      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("You do not have permission to view area managers.");
      } else if (error.response?.status === 404) {
        throw new Error("Agency not found or no area managers configured.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK" || !error.response) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.response?.data?.message || "Failed to fetch area managers.");
      }
    }
  },

  // Get area managers filtered by specific area
  getAreaManagersByArea: async (agencyId: string, areaId: string): Promise<AreaManagerWithDetails[]> => {
    try {
      const allManagers = await areasAPIService.getAreaManagers(agencyId);
      return allManagers.filter((manager) => manager.areaId === areaId);
    } catch (error) {
      console.error("❌ Failed to fetch area managers by area:", error);
      throw error;
    }
  },

  // Helper function to get area name by ID
  getAreaName: async (agencyId: string, areaId: string): Promise<string | null> => {
    try {
      const areas = await areasAPIService.getAreas(agencyId);
      const area = areas.find((area) => area.id === areaId);
      return area?.name || null;
    } catch (error) {
      console.error("❌ Failed to get area name:", error);
      return null;
    }
  },

  // Helper function to get area manager name by ID
  getAreaManagerName: async (agencyId: string, managerId: string): Promise<string | null> => {
    try {
      const managers = await areasAPIService.getAreaManagers(agencyId);
      const manager = managers.find((manager) => manager.id === managerId);
      return manager?.fullName || null;
    } catch (error) {
      console.error("❌ Failed to get area manager name:", error);
      return null;
    }
  },
};
