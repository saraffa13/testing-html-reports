// File: src/api/base.ts
import axios from "axios";
import { authApi, guardsApi } from "../config/axios";

// Auth API endpoints (port 3000)
export const authAPI = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await authApi.get<T>(endpoint);
    return response.data;
  },

  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await authApi.post<T>(endpoint, data);
    return response.data;
  },

  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await authApi.put<T>(endpoint, data);
    return response.data;
  },

  patch: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await authApi.patch<T>(endpoint, data);
    return response.data;
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await authApi.delete<T>(endpoint);
    return response.data;
  },
};

// Guards API endpoints (port 3001) - with authentication
export const guardsAPI = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await guardsApi.get<T>(endpoint);
    return response.data;
  },

  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await guardsApi.post<T>(endpoint, data);
    return response.data;
  },

  postFormData: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const response = await guardsApi.post<T>(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await guardsApi.put<T>(endpoint, data);
    return response.data;
  },

  putFormData: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const response = await guardsApi.put<T>(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  patch: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await guardsApi.patch<T>(endpoint, data);
    return response.data;
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await guardsApi.delete<T>(endpoint);
    return response.data;
  },
};

const API_BASE_URL = import.meta.env.VITE_DUTY_API_BASE_URL;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleForbidden = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const useApi = {
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      const response = await axios.get<T>(`${API_BASE_URL}${endpoint}`, {
        headers: { ...getAuthHeaders() },
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) handleForbidden();
      throw error;
    }
  },
  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    try {
      const response = await axios.post<T>(`${API_BASE_URL}${endpoint}`, data, {
        headers: { ...getAuthHeaders() },
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) handleForbidden();
      throw error;
    }
  },
  postFormData: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    try {
      const response = await axios.post<T>(`${API_BASE_URL}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data", ...getAuthHeaders() },
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) handleForbidden();
      throw error;
    }
  },
  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    try {
      const response = await axios.put<T>(`${API_BASE_URL}${endpoint}`, data, {
        headers: { ...getAuthHeaders() },
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) handleForbidden();
      throw error;
    }
  },
  putFormData: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    try {
      const response = await axios.put<T>(`${API_BASE_URL}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data", ...getAuthHeaders() },
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) handleForbidden();
      throw error;
    }
  },
  patch: async <T>(endpoint: string, data?: any): Promise<T> => {
    try {
      const response = await axios.patch<T>(`${API_BASE_URL}${endpoint}`, data, {
        headers: { ...getAuthHeaders() },
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) handleForbidden();
      throw error;
    }
  },
  patchFormData: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    try {
      const response = await axios.patch<T>(`${API_BASE_URL}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data", ...getAuthHeaders() },
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) handleForbidden();
      throw error;
    }
  },
  delete: async <T>(endpoint: string): Promise<T> => {
    try {
      const response = await axios.delete<T>(`${API_BASE_URL}${endpoint}`, {
        headers: { ...getAuthHeaders() },
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) handleForbidden();
      throw error;
    }
  },
} as const;
