import { authApi } from "../config/axios";
import type { AgencyLoginRequest, AuthResponse, GuardLoginRequest, User } from "../types/auth.types";

export const authService = {
  // Agency user login
  agencyLogin: async (data: AgencyLoginRequest): Promise<AuthResponse> => {
    try {
      console.log("🔄 Attempting agency login:", {
        email: data.email,
        passwordLength: data.password?.length,
        endpoint: "/auth/agency-login",
      });

      const response = await authApi.post("/auth/agency-login", data);

      console.log("📥 Raw server response:", response.data);

      let authResponse: AuthResponse;

      // Handle different response formats
      if (response.data.success && response.data.data) {
        console.log("📋 Server response format: success wrapper");
        authResponse = {
          access_token: response.data.data.access_token,
          user: response.data.data.user,
        };
      } else if (response.data.access_token && response.data.user) {
        console.log("📋 Server response format: direct");
        authResponse = response.data;
      } else if (response.data.data && response.data.data.access_token) {
        console.log("📋 Server response format: data wrapper");
        authResponse = response.data.data;
      } else {
        console.error("❌ Unexpected response format:", response.data);
        throw new Error("Unexpected response format from server");
      }

      // Validate response
      if (!authResponse.access_token) {
        throw new Error("No access token received from server");
      }
      if (!authResponse.user) {
        throw new Error("No user data received from server");
      }

      console.log("✅ Agency login successful:", {
        userEmail: authResponse.user.email || "No email",
        userId: authResponse.user.id || "No ID",
        hasToken: !!authResponse.access_token,
        tokenLength: authResponse.access_token?.length,
      });

      // Store token and user data (optional, depending on your app's needs)
      localStorage.setItem("access_token", authResponse.access_token);
      localStorage.setItem("user", JSON.stringify(authResponse.user));

      return authResponse;
    } catch (error: any) {
      console.error("❌ Agency login error:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
        },
      });

      if (error.code === "ERR_NETWORK" || error.code === "NETWORK_ERROR") {
        throw new Error("Unable to connect to the authentication server. Please check your network or server status.");
      } else if (error.code === "ECONNREFUSED") {
        throw new Error("Connection refused by authentication server. Ensure the server is running on port 3000.");
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout. The authentication server took too long to respond.");
      } else if (error.response?.status === 401) {
        throw new Error("Invalid credentials. Please check your email and password.");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid request. Please check your input.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.response?.data?.message || "Login failed. Please try again.");
      }
    }
  },

  // Guard login
  guardLogin: async (data: GuardLoginRequest): Promise<AuthResponse> => {
    try {
      console.log("🔄 Attempting guard login:", {
        phoneNumber: data.phoneNumber,
        endpoint: "/auth/guard-login",
      });

      const response = await authApi.post("/auth/guard-login", data);

      let authResponse: AuthResponse;
      if (response.data.success && response.data.data) {
        authResponse = {
          access_token: response.data.data.access_token,
          user: response.data.data.user,
        };
      } else if (response.data.access_token && response.data.user) {
        authResponse = response.data;
      } else if (response.data.data && response.data.data.access_token) {
        authResponse = response.data.data;
      } else {
        throw new Error("Unexpected response format from server");
      }

      console.log("✅ Guard login successful:", {
        userId: authResponse.user.id || "No ID",
        hasToken: !!authResponse.access_token,
      });

      // Store token and user data
      localStorage.setItem("access_token", authResponse.access_token);
      localStorage.setItem("user", JSON.stringify(authResponse.user));

      return authResponse;
    } catch (error: any) {
      console.error("❌ Guard login error:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        responseData: error.response?.data,
      });

      if (error.code === "ERR_NETWORK" || error.code === "NETWORK_ERROR") {
        throw new Error("Unable to connect to the authentication server.");
      } else if (error.response?.status === 401) {
        throw new Error("Invalid OTP. Please check the code and try again.");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid request. Please check your input.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.response?.data?.message || "Guard login failed. Please try again.");
      }
    }
  },

  // Verify token
  verifyToken: async (token: string): Promise<User> => {
    try {
      console.log("🔍 Verifying token:", { tokenLength: token.length });

      const response = await authApi.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let user: User;
      if (response.data.success && response.data.data) {
        user = response.data.data;
      } else if (response.data.user) {
        user = response.data.user;
      } else if (response.data.email || response.data.id) {
        user = response.data;
      } else {
        throw new Error("Unexpected user data format");
      }

      console.log("✅ Token verified for user:", user.email || user.id || "Unknown user");
      return user;
    } catch (error: any) {
      console.error("❌ Token verification failed:", {
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data,
      });

      if (error.response?.status === 401) {
        console.log("🔄 Token expired or invalid, clearing storage");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        throw new Error("Invalid or expired token");
      } else if (error.response?.status === 404) {
        throw new Error("Token verification endpoint not found. Please check the server configuration.");
      } else {
        throw new Error(error.response?.data?.message || "Token verification failed.");
      }
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    console.log("👋 User logged out successfully");
  },

  // Test connection to auth server
  testConnection: async (): Promise<boolean> => {
    try {
      console.log("🔍 Testing connection to auth server...");
      await authApi.get("/health");
      console.log("✅ Auth server is reachable");
      return true;
    } catch (error: any) {
      console.error("❌ Auth server is not reachable:", {
        message: error.message,
        code: error.code,
        baseURL: authApi.defaults.baseURL,
      });
      return false;
    }
  },
};
