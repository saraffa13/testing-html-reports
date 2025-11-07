// File: src/modules/settings/services/api/uniformsApi.ts
import { authApi } from "../../../../config/axios";

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

export interface CreateUniformRequest {
  uniformName: string;
  topPartImages?: File[];
  bottomPartImages?: File[];
  accessoryImages?: File[];
}

export interface DeleteImageRequest {
  imageUrl: string;
}

// API Response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export class UniformsApiService {
  /**
   * Create a new agency uniform using the duty API (authApi uses dutyApiBaseUrl)
   */
  static async createUniform(data: CreateUniformRequest): Promise<AgencyUniform> {
    try {
      console.log("📝 Creating uniform:", {
        uniformName: data.uniformName,
        topPartImages: data.topPartImages?.length || 0,
        bottomPartImages: data.bottomPartImages?.length || 0,
        accessoryImages: data.accessoryImages?.length || 0,
      });

      // Create FormData for multipart upload
      const formData = new FormData();

      // Add uniform name
      formData.append("uniformName", data.uniformName);

      // Add top part images
      if (data.topPartImages && data.topPartImages.length > 0) {
        data.topPartImages.forEach((file) => {
          formData.append("topPartImages", file);
          console.log(`📎 Added top part image: ${file.name} (${file.size} bytes)`);
        });
      }

      // Add bottom part images
      if (data.bottomPartImages && data.bottomPartImages.length > 0) {
        data.bottomPartImages.forEach((file) => {
          formData.append("bottomPartImages", file);
          console.log(`📎 Added bottom part image: ${file.name} (${file.size} bytes)`);
        });
      }

      // Add accessory images
      if (data.accessoryImages && data.accessoryImages.length > 0) {
        data.accessoryImages.forEach((file) => {
          formData.append("accessoryImages", file);
          console.log(`📎 Added accessory image: ${file.name} (${file.size} bytes)`);
        });
      }

      // Log FormData summary for debugging
      console.log("📤 FormData summary:");
      let imageCount = 0;
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          imageCount++;
          console.log(`  ${key}: File(${value.name}, ${(value.size / 1024).toFixed(1)} KB)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      console.log(`📊 Total images: ${imageCount}`);

      const response = await authApi.post<ApiResponse<AgencyUniform>>("/agency-uniforms", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Uniform created successfully:");
      console.log("  - ID:", response.data.data.id);
      console.log("  - Name:", response.data.data.uniformName);
      console.log("  - Top parts:", response.data.data.topPartUrls.length);
      console.log("  - Bottom parts:", response.data.data.bottomPartUrls.length);
      console.log("  - Accessories:", response.data.data.accessoriesUrls.length);

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error creating uniform:");
      console.error("  - Status:", error.response?.status);
      console.error("  - Message:", error.response?.data?.message || error.message);
      console.error("  - Data:", error.response?.data);

      // Provide more specific error messages
      if (error.response?.status === 413) {
        throw new Error("Files are too large. Please reduce image sizes and try again.");
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || "Invalid request. Please check your inputs.");
      } else if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (error.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Upload timeout. Please try again with smaller images.");
      }

      throw new Error(error.response?.data?.message || error.message || "Failed to create uniform");
    }
  }

  /**
   * Get all uniforms for an agency
   */
  static async getUniforms(agencyId: string): Promise<AgencyUniform[]> {
    try {
      console.log("📝 Fetching uniforms for agency:", agencyId);

      const response = await authApi.get<ApiResponse<{ data: AgencyUniform[] }>>(
        `/agency-uniforms?agencyId=${agencyId}&orderBy=createdAt&sortOrder=desc`
      );

      console.log("✅ Uniforms fetched successfully:", response.data.data.data.length, "uniforms");
      return response.data.data.data;
    } catch (error: any) {
      console.error("❌ Error fetching uniforms:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch uniforms");
    }
  }

  /**
   * Get a specific uniform by ID
   */
  static async getUniform(id: string): Promise<AgencyUniform> {
    try {
      console.log("📝 Fetching uniform:", id);

      const response = await authApi.get<ApiResponse<AgencyUniform>>(`/agency-uniforms/uniform/${id}`);

      console.log("✅ Uniform fetched successfully:", response.data.data.uniformName);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error fetching uniform:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch uniform");
    }
  }

  /**
   * Update a uniform
   */
  static async updateUniform(id: string, data: CreateUniformRequest): Promise<AgencyUniform> {
    try {
      console.log("📝 Updating uniform:", { id, data });

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("uniformName", data.uniformName);

      // Add images if provided
      if (data.topPartImages && data.topPartImages.length > 0) {
        data.topPartImages.forEach((file) => {
          formData.append("topPartImages", file);
        });
      }

      if (data.bottomPartImages && data.bottomPartImages.length > 0) {
        data.bottomPartImages.forEach((file) => {
          formData.append("bottomPartImages", file);
        });
      }

      if (data.accessoryImages && data.accessoryImages.length > 0) {
        data.accessoryImages.forEach((file) => {
          formData.append("accessoryImages", file);
        });
      }

      const response = await authApi.patch<ApiResponse<AgencyUniform>>(`/agency-uniforms/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Uniform updated successfully:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error updating uniform:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to update uniform");
    }
  }

  /**
   * Delete a uniform completely
   */
  static async deleteUniform(id: string): Promise<void> {
    try {
      console.log("📝 Deleting uniform:", { id });

      await authApi.delete(`/agency-uniforms/${id}`);

      console.log("✅ Uniform deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting uniform:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to delete uniform");
    }
  }

  /**
   * Delete a specific image from a uniform
   */
  static async deleteUniformImage(id: string, imageUrl: string): Promise<AgencyUniform> {
    try {
      console.log("📝 Deleting uniform image:", { id, imageUrl });

      const requestData: DeleteImageRequest = {
        imageUrl: imageUrl,
      };

      const response = await authApi.patch<ApiResponse<AgencyUniform>>(
        `/agency-uniforms/${id}/delete-image`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Uniform image deleted successfully");
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error deleting uniform image:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to delete uniform image");
    }
  }
}

export default UniformsApiService;
