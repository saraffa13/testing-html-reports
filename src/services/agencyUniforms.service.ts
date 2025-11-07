// File: src/services/agencyUniforms.service.ts
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../config/axios";

// Types for Agency Uniform API response
export interface AgencyUniform {
  id: string;
  agencyId: string;
  uniformName: string;
  topPartUrls: string[];
  bottomPartUrls: string[];
  accessoriesUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgencyUniformsResponse {
  success: boolean;
  data: {
    data: AgencyUniform[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  timestamp: string;
}

// API service functions
export const agencyUniformsService = {
  // Get all uniforms for an agency
  getAgencyUniforms: async (agencyId: string): Promise<AgencyUniform[]> => {
    if (!agencyId) {
      throw new Error("Agency ID is required");
    }

    console.log(`🔄 Fetching agency uniforms for agency: ${agencyId}`);

    const queryParams = new URLSearchParams();
    queryParams.append("agencyId", agencyId);

    const response = await authApi.get<AgencyUniformsResponse>(`/agency-uniforms?${queryParams.toString()}`);

    if (!response.data.success) {
      throw new Error("Failed to fetch agency uniforms");
    }

    console.log(`✅ Successfully fetched ${response.data.data.data.length} uniforms for agency: ${agencyId}`);

    return response.data.data.data;
  },
};

// TanStack Query Keys
export const agencyUniformsQueryKeys = {
  all: ["agencyUniforms"] as const,
  agency: (agencyId: string) => [...agencyUniformsQueryKeys.all, "agency", agencyId] as const,
};

// Custom hook for fetching agency uniforms with TanStack Query
export const useAgencyUniforms = (agencyId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: agencyUniformsQueryKeys.agency(agencyId || ""),
    queryFn: () => agencyUniformsService.getAgencyUniforms(agencyId!),
    enabled: enabled && !!agencyId,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - cache garbage collection time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
};

// Utility function to transform uniforms to dropdown options
export const transformUniformsToOptions = (uniforms: AgencyUniform[]) => {
  return uniforms.map((uniform) => ({
    value: uniform.uniformName,
    label: uniform.uniformName.charAt(0).toUpperCase() + uniform.uniformName.slice(1),
  }));
};
