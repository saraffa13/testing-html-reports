import { useApi } from "../../../../apis/base";

export interface CreateUniformRequest {
  clientId: string;
  uniformName: string;
  topPartImages?: File[];
  bottomPartImages?: File[];
  accessoryImages?: File[];
}

export interface UniformResponse {
  id: string;
  clientId: string;
  uniformName: string;
  topPart?: {
    urls: string[];
  };
  bottomPart?: {
    urls: string[];
  };
  accessories?: Array<{
    urls: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export const createClientUniform = async (data: CreateUniformRequest): Promise<UniformResponse> => {
  const { postFormData } = useApi;

  // Create FormData for multipart/form-data request
  const formData = new FormData();

  // Add required fields
  formData.append("clientId", data.clientId);
  formData.append("uniformName", data.uniformName);

  // Add image files
  if (data.topPartImages) {
    data.topPartImages.forEach((file) => {
      formData.append("topPartImages", file);
    });
  }

  if (data.bottomPartImages) {
    data.bottomPartImages.forEach((file) => {
      formData.append("bottomPartImages", file);
    });
  }

  if (data.accessoryImages) {
    data.accessoryImages.forEach((file) => {
      formData.append("accessoryImages", file);
    });
  }

  return postFormData("/client-uniforms", formData);
};
