import React, { createContext, useCallback, useContext, useState, useEffect, type ReactNode } from "react";
import { guardsAPIService, type Guard } from "../services/guards-api.service";
import { useAuth } from "../../../hooks/useAuth";

// Create the context
interface GuardContextType {
  guards: Guard[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  initialized: boolean;
  getGuardByName: (name: string) => Guard | undefined;
  getGuardById: (id: string) => Promise<Guard>;
  refreshGuards: () => Promise<void>;
  searchGuards: (searchTerm: string) => Promise<void>;
  loadGuards: (page?: number, limit?: number) => Promise<void>;
  forceRefreshGuards: () => Promise<void>;
  initializeGuards: () => Promise<void>;
}

const GuardContext = createContext<GuardContextType | undefined>(undefined);

export const GuardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Reset guards when user's agencyId changes
  useEffect(() => {
    if (user?.agencyId) {
      setGuards([]);
      setInitialized(false);
    }
  }, [user?.agencyId]);

  // Memoize loadGuards to prevent unnecessary re-renders
  const loadGuards = useCallback(async (page: number = 1, limit: number = 1000) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Loading guards from API...");

      const result = await guardsAPIService.getGuards({
        page,
        limit,
        agencyId: user?.agencyId
      });

      setGuards(result.guards);
      setTotal(result.total);
      setCurrentPage(page);
      setTotalPages(result.totalPages);
      setInitialized(true);

      console.log("✅ Guards loaded successfully:", result.guards.length, "guards");
    } catch (err: any) {
      console.error("❌ Failed to load guards:", err);
      setError(err.message || "Failed to load guards");
      setGuards([]);
    } finally {
      setLoading(false);
    }
  }, [user?.agencyId]); // Depend on agencyId

  // Memoize initializeGuards to prevent re-creation
  const initializeGuards = useCallback(async () => {
    if (!initialized && !loading) {
      // Add loading check to prevent concurrent calls
      console.log("🚀 Initializing guards for the first time...");
      await loadGuards();
    } else {
      console.log("ℹ️ Guards already initialized or loading, skipping...");
    }
  }, [initialized, loading, loadGuards]);

  // Memoize other functions
  const forceRefreshGuards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Force refreshing guards from API (bypassing cache)...");

      const timestamp = new Date().getTime();
      const result = await guardsAPIService.getGuards({
        page: currentPage,
        limit: 1000,
        agencyId: user?.agencyId,
        _t: timestamp,
      } as any);

      setGuards(result.guards);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setInitialized(true);

      console.log("✅ Guards force refreshed successfully:", result.guards.length, "guards");
    } catch (err: any) {
      console.error("❌ Failed to force refresh guards:", err);
      setError(err.message || "Failed to refresh guards");
    } finally {
      setLoading(false);
    }
  }, [currentPage, user?.agencyId]);

  const refreshGuards = useCallback(async () => {
    console.log("🔄 Refreshing guards list...");
    await loadGuards(currentPage);
  }, [currentPage, loadGuards]);

  const searchGuards = useCallback(
    async (searchTerm: string) => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Searching guards:", searchTerm);

        if (!searchTerm.trim()) {
          await loadGuards();
          return;
        }

        const searchResults = await guardsAPIService.searchGuards(searchTerm, user?.agencyId);
        setGuards(searchResults);
        setTotal(searchResults.length);
        setCurrentPage(1);
        setTotalPages(1);

        console.log("✅ Search completed:", searchResults.length, "guards found");
      } catch (err: any) {
        console.error("❌ Search failed:", err);
        setError(err.message || "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [loadGuards, user?.agencyId]
  );

  const getGuardByName = useCallback(
    (name: string): Guard | undefined => {
      const formattedSearchName = name.toLowerCase();

      let guard = guards.find((g) => g.name.toLowerCase() === formattedSearchName);

      if (!guard) {
        guard = guards.find((g) => {
          const guardNameUrl = g.name.toLowerCase().replace(/\s+/g, "-");
          return guardNameUrl === formattedSearchName || formattedSearchName.includes(guardNameUrl);
        });
      }

      return guard;
    },
    [guards]
  );

  const getGuardById = useCallback(async (id: string): Promise<Guard> => {
    return await guardsAPIService.getGuardById(id);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = React.useMemo<GuardContextType>(
    () => ({
      guards,
      loading,
      error,
      total,
      currentPage,
      totalPages,
      initialized,
      getGuardByName,
      getGuardById,
      refreshGuards,
      searchGuards,
      loadGuards,
      forceRefreshGuards,
      initializeGuards,
    }),
    [
      guards,
      loading,
      error,
      total,
      currentPage,
      totalPages,
      initialized,
      getGuardByName,
      getGuardById,
      refreshGuards,
      searchGuards,
      loadGuards,
      forceRefreshGuards,
      initializeGuards,
    ]
  );

  return <GuardContext.Provider value={value}>{children}</GuardContext.Provider>;
};

export const useGuards = () => {
  const context = useContext(GuardContext);
  if (context === undefined) {
    throw new Error("useGuards must be used within a GuardProvider");
  }
  return context;
};

export type { Guard };
