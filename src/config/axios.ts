import axios from "axios";

// Load base URLs from .env
const dutyApiBaseUrl = import.meta.env.VITE_DUTY_API_BASE_URL;
const coreApiBaseUrl = import.meta.env.VITE_CORE_API_BASE_URL;

// Endpoints that do not require authentication
const PUBLIC_ENDPOINTS = ["/auth/agency-login", "/auth/guard-login", "/health"];

// Create axios instance for auth service
export const authApi = axios.create({
  baseURL: dutyApiBaseUrl, // e.g., "http://127.0.0.1:3000"
  timeout: 60000, // Increased timeout for remote API
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for guards service
export const guardsApi = axios.create({
  baseURL: coreApiBaseUrl, // e.g., "http://127.0.0.1:3001"
  timeout: 60000, // Increased timeout for file uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for guards API
guardsApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`⚠️ No token found for guards API request: ${config.url}`);
    }

    // Don't override Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Enforce global 30-second timeout for ALL requests
    config.timeout = 30000;

    console.log(`🔗 Guards API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Guards API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for guards API
guardsApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Guards API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Guards API Response Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);

    if (error.response?.status === 401) {
      console.log("🔒 Unauthorized - clearing tokens");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("access_token");
      // Optionally redirect to login page (client-side only)
      // if (typeof window !== 'undefined') window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Request interceptor for auth API
authApi.interceptors.request.use(
  (config) => {
    // Skip Authorization header for public endpoints
    if (!PUBLIC_ENDPOINTS.includes(config.url || "")) {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(`⚠️ No token found for auth API request: ${config.url}`);
      }
    } else {
      console.log(`🔓 Public endpoint, skipping Authorization header: ${config.url}`);
    }

    // Enforce global 30-second timeout for ALL requests
    config.timeout = 60000;

    console.log(`🔗 Auth API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Auth API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for auth API
authApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Auth API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Auth API Response Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);

    if (error.response?.status === 401) {
      console.log("🔒 Unauthorized - clearing tokens");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("access_token");
      // Optionally redirect to login page (client-side only)
      // if (typeof window !== 'undefined') window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default { authApi, guardsApi };
