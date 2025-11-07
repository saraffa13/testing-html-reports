import React, { createContext, useCallback, useContext, useState, useEffect, type ReactNode } from "react";
import { officersAPIService, type Officer } from "../service/officers-api.service";
import { useAuth } from "../../../hooks/useAuth";

// Create the context
interface OfficerContextType {
  officers: Officer[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  initialized: boolean;
  agencyId: string; // Add agencyId to context
  getOfficerByName: (name: string) => Officer | undefined;
  getOfficerById: (id: string) => Promise<Officer>;
  refreshOfficers: () => Promise<void>;
  searchOfficers: (searchTerm: string) => Promise<void>;
  loadOfficers: (page?: number, limit?: number) => Promise<void>;
  forceRefreshOfficers: () => Promise<void>;
  initializeOfficers: () => Promise<void>;
  setAgencyId: (agencyId: string) => void; // Add method to update agencyId
}

const OfficerContext = createContext<OfficerContextType | undefined>(undefined);

// Provider component
export const OfficerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [agencyId, setAgencyIdState] = useState<string>(user?.agencyId || "agency_0"); // Use user's agencyId

  // Update agencyId when user changes
  useEffect(() => {
    if (user?.agencyId && user.agencyId !== agencyId) {
      setAgencyIdState(user.agencyId);
      // Reset officers when agency changes
      setOfficers([]);
      setInitialized(false);
    }
  }, [user?.agencyId, agencyId]);

  // Method to update agency ID
  const setAgencyId = useCallback((newAgencyId: string) => {
    setAgencyIdState(newAgencyId);
    // Reset officers when agency changes
    setOfficers([]);
    setInitialized(false);
  }, []);

  // Memoize loadOfficers to prevent unnecessary re-renders
  const loadOfficers = useCallback(
    async (page: number = 1, limit: number = 50) => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Loading officers from dashboard area-officers API...");

        const result = await officersAPIService.getOfficers({
          page,
          limit,
          agencyId, // Pass agencyId to the API
        });

        setOfficers(result.officers);
        setTotal(result.total);
        setCurrentPage(page);
        setTotalPages(result.totalPages);
        setInitialized(true);

        console.log("✅ Officers loaded successfully:", result.officers.length, "officers");
      } catch (err: any) {
        console.error("❌ Failed to load officers:", err);
        setError(err.message || "Failed to load officers");
        setOfficers([]);
      } finally {
        setLoading(false);
      }
    },
    [agencyId]
  ); // Add agencyId as dependency

  // Memoize initializeOfficers to prevent re-creation
  const initializeOfficers = useCallback(async () => {
    if (!initialized && !loading) {
      // Add loading check to prevent concurrent calls
      console.log("🚀 Initializing officers for the first time...");
      await loadOfficers();
    } else {
      console.log("ℹ️ Officers already initialized or loading, skipping...");
    }
  }, [initialized, loading, loadOfficers]);

  // Memoize forceRefreshOfficers
  const forceRefreshOfficers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Force refreshing officers from dashboard area-officers API (bypassing cache)...");

      const timestamp = new Date().getTime();
      const result = await officersAPIService.getOfficers({
        page: currentPage,
        limit: 50,
        agencyId,
        _t: timestamp,
      } as any);

      setOfficers(result.officers);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setInitialized(true);

      console.log("✅ Officers force refreshed successfully:", result.officers.length, "officers");
    } catch (err: any) {
      console.error("❌ Failed to force refresh officers:", err);
      setError(err.message || "Failed to refresh officers");
    } finally {
      setLoading(false);
    }
  }, [currentPage, agencyId]);

  // Memoize refreshOfficers
  const refreshOfficers = useCallback(async () => {
    console.log("🔄 Refreshing officers list...");
    await loadOfficers(currentPage);
  }, [currentPage, loadOfficers]);

  // Memoize searchOfficers
  const searchOfficers = useCallback(
    async (searchTerm: string) => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Searching officers:", searchTerm);

        if (!searchTerm.trim()) {
          await loadOfficers();
          return;
        }

        const searchResults = await officersAPIService.searchOfficers(searchTerm, agencyId);
        setOfficers(searchResults);
        setTotal(searchResults.length);
        setCurrentPage(1);
        setTotalPages(1);

        console.log("✅ Officer search completed:", searchResults.length, "officers found");
      } catch (err: any) {
        console.error("❌ Officer search failed:", err);
        setError(err.message || "Officer search failed");
      } finally {
        setLoading(false);
      }
    },
    [loadOfficers, agencyId]
  );

  // Memoize getOfficerByName
  const getOfficerByName = useCallback(
    (name: string): Officer | undefined => {
      const formattedSearchName = name.toLowerCase();

      let officer = officers.find((o) => o.name.toLowerCase() === formattedSearchName);

      if (!officer) {
        officer = officers.find((o) => {
          const officerNameUrl = o.name.toLowerCase().replace(/\s+/g, "-");
          return officerNameUrl === formattedSearchName || formattedSearchName.includes(officerNameUrl);
        });
      }

      return officer;
    },
    [officers]
  );

  // Memoize getOfficerById
  const getOfficerById = useCallback(
    async (id: string): Promise<Officer> => {
      try {
        return await officersAPIService.getOfficerById(id, agencyId);
      } catch (err: any) {
        console.error("❌ Failed to get officer by ID:", err);
        throw err;
      }
    },
    [agencyId]
  );

  // Memoize context value to prevent unnecessary re-renders
  const value = React.useMemo<OfficerContextType>(
    () => ({
      officers,
      loading,
      error,
      total,
      currentPage,
      totalPages,
      initialized,
      agencyId,
      getOfficerByName,
      getOfficerById,
      refreshOfficers,
      searchOfficers,
      loadOfficers,
      forceRefreshOfficers,
      initializeOfficers,
      setAgencyId,
    }),
    [
      officers,
      loading,
      error,
      total,
      currentPage,
      totalPages,
      initialized,
      agencyId,
      getOfficerByName,
      getOfficerById,
      refreshOfficers,
      searchOfficers,
      loadOfficers,
      forceRefreshOfficers,
      initializeOfficers,
      setAgencyId,
    ]
  );

  return <OfficerContext.Provider value={value}>{children}</OfficerContext.Provider>;
};

// Custom hook for using the officer context
export const useOfficers = () => {
  const context = useContext(OfficerContext);
  if (context === undefined) {
    throw new Error("useOfficers must be used within an OfficerProvider");
  }
  return context;
};

// Export the Officer interface for use in other components
export type { Officer };
