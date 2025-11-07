// File: src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Agency login mutation - Enhanced but same core behavior
  const agencyLoginMutation = useMutation({
    mutationFn: authService.agencyLogin,
    onSuccess: (data) => {
      // Store tokens and user data
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update query cache
      queryClient.setQueryData(["user"], data.user);

      // Show success message
      console.log("✅ Login successful! Redirecting to dashboard...");

      // Redirect to dashboard - same as original
      window.location.href = "/";
    },
    onError: (error: any) => {
      console.error("Login failed:", error.message);
    },
  });

  // RESTORED: Simple user check from localStorage only (like original)
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      // If no token, user is not logged in
      if (!token) return null;

      // If we have a token but no user data, clear storage
      if (!storedUser) {
        localStorage.removeItem("access_token");
        return null;
      }

      try {
        // Just return the stored user data - NO server verification
        const parsedUser = JSON.parse(storedUser);
        console.log("✅ User found in storage:", parsedUser.email || "No email");
        return parsedUser;
      } catch (error) {
        // If stored data is corrupted, clear it
        console.error("❌ Corrupted user data, clearing storage");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - same as original
    retry: false,
  });

  const logout = () => {
    authService.logout();
    queryClient.clear();
    window.location.href = "/login";
  };

  // Check if user is authenticated - same logic as original
  const isAuthenticated = !!user;

  return {
    user,
    isUserLoading,
    isAuthenticated,
    agencyLogin: agencyLoginMutation.mutate,
    isLoginLoading: agencyLoginMutation.isPending,
    loginError: agencyLoginMutation.error,
    loginSuccess: agencyLoginMutation.isSuccess,
    logout,
  };
};
