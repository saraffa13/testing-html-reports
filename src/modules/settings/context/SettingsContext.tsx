// File: context/SettingsContext.tsx
import React, { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import AreaManagersApiService, { type AreaManager as ApiAreaManager } from "../services/api/areaManagersApi";
import AreasApiService, { type Area as ApiArea } from "../services/api/areasApi";
import GuardTypesApiService, { type GuardType } from "../services/api/guardTypesApi";
import SiteTypesApiService, { type SiteType as ApiSiteType } from "../services/api/siteTypesApi";

// Import useAuth to get the current user
import { useAuth } from "../../../hooks/useAuth";

// Define interfaces for UI data structures
export interface SecurityGuardType {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Area {
  id: string;
  name: string;
  isActive: boolean;
}

export interface AreaManager {
  id: string;
  name: string;
  phone: string;
  areaId: string;
  isActive: boolean;
}

export interface SiteType {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
}

export interface OperationalSettings {
  securityGuardTypes: SecurityGuardType[];
  areas: Area[];
  areaManagers: AreaManager[];
  siteTypes: SiteType[];
  lastModified: string;
}

export interface UniformSettings {
  uniformTypes: any[];
  lastModified: string;
}

export interface DataSettings {
  dataConfigurations: any[];
  lastModified: string;
}

export interface SettingsContextType {
  // Operational Settings
  operationalSettings: OperationalSettings | null;
  uniformSettings: UniformSettings | null;
  dataSettings: DataSettings | null;

  // Loading states
  loading: boolean;
  operationalLoading: boolean;
  uniformLoading: boolean;
  dataLoading: boolean;
  guardTypesLoading: boolean;
  areasLoading: boolean;
  areaManagersLoading: boolean;
  siteTypesLoading: boolean;

  // Error states
  error: string | null;

  // Agency ID
  agencyId: string | null;

  // Guard Types methods
  fetchGuardTypes: () => Promise<void>;
  createGuardType: (typeName: string) => Promise<void>;
  updateGuardType: (id: string, typeName: string) => Promise<void>;
  deleteGuardType: (id: string) => Promise<void>;

  // Areas methods
  fetchAreas: () => Promise<void>;
  createArea: (name: string) => Promise<void>;
  updateArea: (id: string, name: string) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;

  // Area Managers methods
  fetchAreaManagers: () => Promise<void>;
  createAreaManager: (fullName: string, contactPhone: string, areaId: string) => Promise<void>;
  updateAreaManager: (id: string, fullName: string, contactPhone: string, areaId: string) => Promise<void>;
  deleteAreaManager: (id: string) => Promise<void>;

  // Site Types methods
  fetchSiteTypes: () => Promise<void>;
  createSiteType: (typeName: string) => Promise<void>;
  updateSiteType: (id: string, typeName: string) => Promise<void>;
  deleteSiteType: (id: string) => Promise<void>;

  // General methods
  initializeOperationalSettings: () => Promise<void>;
  fetchUniformSettings: () => Promise<void>;
  fetchDataSettings: () => Promise<void>;
  updateOperationalSettings: (settings: Partial<OperationalSettings>) => Promise<void>;
  updateUniformSettings: (settings: Partial<UniformSettings>) => Promise<void>;
  updateDataSettings: (settings: Partial<DataSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  console.log("📝 SettingsProvider render");

  // Get the authenticated user to access agency ID
  const { user } = useAuth();

  // State management
  const [operationalSettings, setOperationalSettings] = useState<OperationalSettings | null>(null);
  const [uniformSettings, setUniformSettings] = useState<UniformSettings | null>(null);
  const [dataSettings, setDataSettings] = useState<DataSettings | null>(null);

  const [loading, setLoading] = useState(false);
  const [operationalLoading, setOperationalLoading] = useState(false);
  const [uniformLoading, setUniformLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [guardTypesLoading, setGuardTypesLoading] = useState(false);
  const [areasLoading, setAreasLoading] = useState(false);
  const [areaManagersLoading, setAreaManagersLoading] = useState(false);
  const [siteTypesLoading, setSiteTypesLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Track initialization state to prevent multiple API calls
  const [initialized, setInitialized] = useState(false);

  // Debug logging for user and agency ID
  useEffect(() => {
    console.log("🔍 DEBUG: User state changed:", {
      user: user
        ? {
            id: user.id,
            agencyId: user.agencyId,
            email: user.email,
          }
        : null,
    });
  }, [user]);

  // Helper functions to transform API data to UI data
  const transformGuardType = (apiGuardType: GuardType): SecurityGuardType => ({
    id: apiGuardType.id,
    name: apiGuardType.typeName,
    isActive: apiGuardType.isActive ?? true,
  });

  const transformArea = (apiArea: ApiArea): Area => ({
    id: apiArea.id,
    name: apiArea.name,
    isActive: apiArea.isActive ?? true,
  });

  const transformAreaManager = (apiAreaManager: ApiAreaManager): AreaManager => ({
    id: apiAreaManager.id,
    name: apiAreaManager.fullName,
    phone: apiAreaManager.contactPhone,
    areaId: apiAreaManager.areaId,
    isActive: apiAreaManager.isActive ?? true,
  });

  const transformSiteType = (apiSiteType: ApiSiteType): SiteType => ({
    id: apiSiteType.id,
    name: apiSiteType.typeName,
    category: "General", // API doesn't provide category, set default
    isActive: apiSiteType.isActive ?? true,
  });

  // Guard Types methods
  const fetchGuardTypes = useCallback(async (): Promise<void> => {
    if (!user?.agencyId) {
      console.warn("⚠️ No agency ID available for fetching guard types");
      return;
    }

    try {
      setGuardTypesLoading(true);
      setError(null);

      console.log("🔍 DEBUG: Fetching guard types with agency ID:", user.agencyId);
      const apiGuardTypes = await GuardTypesApiService.getGuardTypes(user.agencyId);
      console.log("🔍 DEBUG: Guard types received:", apiGuardTypes);

      const transformedGuardTypes = apiGuardTypes.map(transformGuardType);

      setOperationalSettings((prev) =>
        prev
          ? {
              ...prev,
              securityGuardTypes: transformedGuardTypes,
              lastModified: new Date().toLocaleDateString(),
            }
          : {
              securityGuardTypes: transformedGuardTypes,
              areas: [],
              areaManagers: [],
              siteTypes: [],
              lastModified: new Date().toLocaleDateString(),
            }
      );
    } catch (err: any) {
      setError(err.message || "Failed to fetch guard types");
      console.error("❌ Error fetching guard types:", err);
    } finally {
      setGuardTypesLoading(false);
    }
  }, [user?.agencyId]);

  const createGuardType = async (typeName: string): Promise<void> => {
    console.log("🔍 DEBUG: createGuardType called with:", { typeName, agencyId: user?.agencyId });

    if (!user?.agencyId) {
      const error = "No agency ID available for creating guard type";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setGuardTypesLoading(true);
      setError(null);

      console.log("🔍 DEBUG: Creating guard type with data:", { typeName, agencyId: user.agencyId });
      await GuardTypesApiService.createGuardType({ typeName, agencyId: user.agencyId });

      console.log("✅ Guard type created successfully, refreshing list");
      await fetchGuardTypes();
    } catch (err: any) {
      console.error("❌ Error creating guard type:", err);
      setError(err.message || "Failed to create guard type");
      throw err;
    } finally {
      setGuardTypesLoading(false);
    }
  };

  const updateGuardType = async (id: string, typeName: string): Promise<void> => {
    console.log("🔍 DEBUG: updateGuardType called with:", { id, typeName, agencyId: user?.agencyId });

    if (!user?.agencyId) {
      const error = "No agency ID available for updating guard type";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setGuardTypesLoading(true);
      setError(null);

      await GuardTypesApiService.updateGuardType(id, user.agencyId, { typeName });
      await fetchGuardTypes();
    } catch (err: any) {
      console.error("❌ Error updating guard type:", err);
      setError(err.message || "Failed to update guard type");
      throw err;
    } finally {
      setGuardTypesLoading(false);
    }
  };

  const deleteGuardType = async (id: string): Promise<void> => {
    console.log("🔍 DEBUG: deleteGuardType called with:", { id, agencyId: user?.agencyId });

    if (!user?.agencyId) {
      const error = "No agency ID available for deleting guard type";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setGuardTypesLoading(true);
      setError(null);

      await GuardTypesApiService.deleteGuardType(id, user.agencyId);
      await fetchGuardTypes();
    } catch (err: any) {
      console.error("❌ Error deleting guard type:", err);
      setError(err.message || "Failed to delete guard type");
      throw err;
    } finally {
      setGuardTypesLoading(false);
    }
  };

  // Areas methods
  const fetchAreas = useCallback(async (): Promise<void> => {
    if (!user?.agencyId) {
      console.warn("⚠️ No agency ID available for fetching areas");
      return;
    }

    try {
      setAreasLoading(true);
      setError(null);

      console.log("🔍 DEBUG: Fetching areas with agency ID:", user.agencyId);
      const apiAreas = await AreasApiService.getAreas(user.agencyId);
      console.log("🔍 DEBUG: Areas received:", apiAreas);

      const transformedAreas = apiAreas.map(transformArea);

      setOperationalSettings((prev) =>
        prev
          ? {
              ...prev,
              areas: transformedAreas,
              lastModified: new Date().toLocaleDateString(),
            }
          : {
              securityGuardTypes: [],
              areas: transformedAreas,
              areaManagers: [],
              siteTypes: [],
              lastModified: new Date().toLocaleDateString(),
            }
      );
    } catch (err: any) {
      setError(err.message || "Failed to fetch areas");
      console.error("❌ Error fetching areas:", err);
    } finally {
      setAreasLoading(false);
    }
  }, [user?.agencyId]);

  const createArea = async (name: string): Promise<void> => {
    console.log("🔍 DEBUG: createArea called with:", { name, agencyId: user?.agencyId });

    if (!user?.agencyId) {
      const error = "No agency ID available for creating area";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setAreasLoading(true);
      setError(null);

      await AreasApiService.createArea({ name, agencyId: user.agencyId });
      await fetchAreas();
    } catch (err: any) {
      console.error("❌ Error creating area:", err);
      setError(err.message || "Failed to create area");
      throw err;
    } finally {
      setAreasLoading(false);
    }
  };

  const updateArea = async (id: string, name: string): Promise<void> => {
    console.log("🔍 DEBUG: updateArea called with:", { id, name, agencyId: user?.agencyId });

    if (!user?.agencyId) {
      const error = "No agency ID available for updating area";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setAreasLoading(true);
      setError(null);

      await AreasApiService.updateArea(id, user.agencyId, { name });
      await fetchAreas();
    } catch (err: any) {
      console.error("❌ Error updating area:", err);
      setError(err.message || "Failed to update area");
      throw err;
    } finally {
      setAreasLoading(false);
    }
  };

  const deleteArea = async (id: string): Promise<void> => {
    console.log("🔍 DEBUG: deleteArea called with:", { id, agencyId: user?.agencyId });

    if (!user?.agencyId) {
      const error = "No agency ID available for deleting area";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setAreasLoading(true);
      setError(null);

      await AreasApiService.deleteArea(id, user.agencyId);
      await fetchAreas();
    } catch (err: any) {
      console.error("❌ Error deleting area:", err);
      setError(err.message || "Failed to delete area");
      throw err;
    } finally {
      setAreasLoading(false);
    }
  };

  // Area Managers methods
  const fetchAreaManagers = useCallback(async (): Promise<void> => {
    if (!user?.agencyId) {
      console.warn("⚠️ No agency ID available for fetching area managers");
      return;
    }

    try {
      setAreaManagersLoading(true);
      setError(null);

      console.log("🔍 DEBUG: Fetching area managers with agency ID:", user.agencyId);
      const apiAreaManagers = await AreaManagersApiService.getAreaManagers(user.agencyId);
      console.log("🔍 DEBUG: Area managers received:", apiAreaManagers);

      const transformedAreaManagers = apiAreaManagers.map(transformAreaManager);

      setOperationalSettings((prev) =>
        prev
          ? {
              ...prev,
              areaManagers: transformedAreaManagers,
              lastModified: new Date().toLocaleDateString(),
            }
          : {
              securityGuardTypes: [],
              areas: [],
              areaManagers: transformedAreaManagers,
              siteTypes: [],
              lastModified: new Date().toLocaleDateString(),
            }
      );
    } catch (err: any) {
      setError(err.message || "Failed to fetch area managers");
      console.error("❌ Error fetching area managers:", err);
    } finally {
      setAreaManagersLoading(false);
    }
  }, [user?.agencyId]);

  const createAreaManager = async (fullName: string, contactPhone: string, areaId: string): Promise<void> => {
    console.log("🔍 DEBUG: createAreaManager called with:", {
      fullName,
      contactPhone,
      areaId,
      agencyId: user?.agencyId,
    });

    if (!user?.agencyId) {
      const error = "No agency ID available for creating area manager";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setAreaManagersLoading(true);
      setError(null);

      await AreaManagersApiService.createAreaManager({ fullName, contactPhone, agencyId: user.agencyId, areaId });
      await fetchAreaManagers();
    } catch (err: any) {
      console.error("❌ Error creating area manager:", err);
      setError(err.message || "Failed to create area manager");
      throw err;
    } finally {
      setAreaManagersLoading(false);
    }
  };

  const updateAreaManager = async (
    id: string,
    fullName: string,
    contactPhone: string,
    areaId: string
  ): Promise<void> => {
    console.log("🔍 DEBUG: updateAreaManager called with:", {
      id,
      fullName,
      contactPhone,
      areaId,
      agencyId: user?.agencyId,
    });

    if (!user?.agencyId) {
      const error = "No agency ID available for updating area manager";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setAreaManagersLoading(true);
      setError(null);

      await AreaManagersApiService.updateAreaManager(id, user.agencyId, { fullName, contactPhone, areaId });
      await fetchAreaManagers();
    } catch (err: any) {
      console.error("❌ Error updating area manager:", err);
      setError(err.message || "Failed to update area manager");
      throw err;
    } finally {
      setAreaManagersLoading(false);
    }
  };

  const deleteAreaManager = async (id: string): Promise<void> => {
    console.log("🔍 DEBUG: deleteAreaManager called with:", { id, agencyId: user?.agencyId });

    if (!user?.agencyId) {
      const error = "No agency ID available for deleting area manager";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setAreaManagersLoading(true);
      setError(null);

      await AreaManagersApiService.deleteAreaManager(id, user.agencyId);
      await fetchAreaManagers();
    } catch (err: any) {
      console.error("❌ Error deleting area manager:", err);
      setError(err.message || "Failed to delete area manager");
      throw err;
    } finally {
      setAreaManagersLoading(false);
    }
  };

  // Site Types methods
  const fetchSiteTypes = useCallback(async (): Promise<void> => {
    if (!user?.agencyId) {
      console.warn("⚠️ No agency ID available for fetching site types");
      return;
    }

    try {
      setSiteTypesLoading(true);
      setError(null);

      console.log("🔍 DEBUG: Fetching site types with agency ID:", user.agencyId);
      const apiSiteTypes = await SiteTypesApiService.getSiteTypes(user.agencyId);
      console.log("🔍 DEBUG: Site types received:", apiSiteTypes);

      const transformedSiteTypes = apiSiteTypes.map(transformSiteType);

      setOperationalSettings((prev) =>
        prev
          ? {
              ...prev,
              siteTypes: transformedSiteTypes,
              lastModified: new Date().toLocaleDateString(),
            }
          : {
              securityGuardTypes: [],
              areas: [],
              areaManagers: [],
              siteTypes: transformedSiteTypes,
              lastModified: new Date().toLocaleDateString(),
            }
      );
    } catch (err: any) {
      setError(err.message || "Failed to fetch site types");
      console.error("❌ Error fetching site types:", err);
    } finally {
      setSiteTypesLoading(false);
    }
  }, [user?.agencyId]);

  const createSiteType = async (typeName: string): Promise<void> => {
    console.log("🔍 DEBUG: createSiteType called with:", { typeName, agencyId: user?.agencyId });

    if (!user?.agencyId) {
      const error = "No agency ID available for creating site type";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setSiteTypesLoading(true);
      setError(null);

      await SiteTypesApiService.createSiteType({ typeName, agencyId: user.agencyId });
      await fetchSiteTypes();
    } catch (err: any) {
      console.error("❌ Error creating site type:", err);
      setError(err.message || "Failed to create site type");
      throw err;
    } finally {
      setSiteTypesLoading(false);
    }
  };

  const updateSiteType = async (id: string, typeName: string): Promise<void> => {
    console.log("🔍 DEBUG: updateSiteType called with:", { id, typeName, agencyId: user?.agencyId });

    if (!user?.agencyId) {
      const error = "No agency ID available for updating site type";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setSiteTypesLoading(true);
      setError(null);

      await SiteTypesApiService.updateSiteType(id, user.agencyId, { typeName });
      await fetchSiteTypes();
    } catch (err: any) {
      console.error("❌ Error updating site type:", err);
      setError(err.message || "Failed to update site type");
      throw err;
    } finally {
      setSiteTypesLoading(false);
    }
  };

  const deleteSiteType = async (id: string): Promise<void> => {
    console.log("🔍 DEBUG: deleteSiteType called with:", { id, agencyId: user?.agencyId });

    if (!user?.agencyId) {
      const error = "No agency ID available for deleting site type";
      console.error("❌", error);
      throw new Error(error);
    }

    try {
      setSiteTypesLoading(true);
      setError(null);

      await SiteTypesApiService.deleteSiteType(id, user.agencyId);
      await fetchSiteTypes();
    } catch (err: any) {
      console.error("❌ Error deleting site type:", err);
      setError(err.message || "Failed to delete site type");
      throw err;
    } finally {
      setSiteTypesLoading(false);
    }
  };

  // Initialize operational settings - only call this when needed
  const initializeOperationalSettings = useCallback(async (): Promise<void> => {
    if (loading || initialized || !user?.agencyId) {
      console.log("🔍 DEBUG: Skipping initialization:", { loading, initialized, hasAgencyId: !!user?.agencyId });
      return;
    }

    setLoading(true);
    console.log("🔍 DEBUG: Initializing operational settings for agency:", user.agencyId);

    try {
      // Initialize empty settings first
      setOperationalSettings({
        securityGuardTypes: [],
        areas: [],
        areaManagers: [],
        siteTypes: [],
        lastModified: new Date().toLocaleDateString(),
      });

      // Fetch all data in parallel
      await Promise.all([fetchGuardTypes(), fetchAreas(), fetchAreaManagers(), fetchSiteTypes()]);

      setInitialized(true);
      console.log("✅ All operational settings initialized successfully");
    } catch (err) {
      console.error("❌ Error initializing operational settings:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, initialized, user?.agencyId, fetchGuardTypes, fetchAreas, fetchAreaManagers, fetchSiteTypes]);

  const fetchUniformSettings = async (): Promise<void> => {
    try {
      setUniformLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUniformSettings({
        uniformTypes: [],
        lastModified: new Date().toLocaleDateString(),
      });
    } catch (err) {
      setError("Failed to fetch uniform settings");
      console.error("Error fetching uniform settings:", err);
    } finally {
      setUniformLoading(false);
    }
  };

  const fetchDataSettings = async (): Promise<void> => {
    try {
      setDataLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDataSettings({
        dataConfigurations: [],
        lastModified: new Date().toLocaleDateString(),
      });
    } catch (err) {
      setError("Failed to fetch data settings");
      console.error("Error fetching data settings:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const updateOperationalSettings = async (settings: Partial<OperationalSettings>): Promise<void> => {
    try {
      setOperationalLoading(true);
      setError(null);

      // TODO: Replace with actual API call for other settings
      await new Promise((resolve) => setTimeout(resolve, 500));
      setOperationalSettings((prev) => (prev ? { ...prev, ...settings } : null));
    } catch (err) {
      setError("Failed to update operational settings");
      console.error("Error updating operational settings:", err);
    } finally {
      setOperationalLoading(false);
    }
  };

  const updateUniformSettings = async (settings: Partial<UniformSettings>): Promise<void> => {
    try {
      setUniformLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUniformSettings((prev) => (prev ? { ...prev, ...settings } : null));
    } catch (err) {
      setError("Failed to update uniform settings");
      console.error("Error updating uniform settings:", err);
    } finally {
      setUniformLoading(false);
    }
  };

  const updateDataSettings = async (settings: Partial<DataSettings>): Promise<void> => {
    try {
      setDataLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDataSettings((prev) => (prev ? { ...prev, ...settings } : null));
    } catch (err) {
      setError("Failed to update data settings");
      console.error("Error updating data settings:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // Reset initialization when user changes
  useEffect(() => {
    if (user?.agencyId) {
      console.log("🔍 DEBUG: User agency ID changed, resetting initialization state");
      setInitialized(false);
    }
  }, [user?.agencyId]);

  const contextValue: SettingsContextType = {
    operationalSettings,
    uniformSettings,
    dataSettings,
    loading,
    operationalLoading,
    uniformLoading,
    dataLoading,
    guardTypesLoading,
    areasLoading,
    areaManagersLoading,
    siteTypesLoading,
    error,
    agencyId: user?.agencyId || null,
    fetchGuardTypes,
    createGuardType,
    updateGuardType,
    deleteGuardType,
    fetchAreas,
    createArea,
    updateArea,
    deleteArea,
    fetchAreaManagers,
    createAreaManager,
    updateAreaManager,
    deleteAreaManager,
    fetchSiteTypes,
    createSiteType,
    updateSiteType,
    deleteSiteType,
    initializeOperationalSettings,
    fetchUniformSettings,
    fetchDataSettings,
    updateOperationalSettings,
    updateUniformSettings,
    updateDataSettings,
  };

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};

// Custom hook to use settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
