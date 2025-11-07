// File: src/modules/officers/service/clientSitesApiService.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../config/axios";

// API Response interfaces for Client Sites
export interface ClientSiteApiData {
  id: string;
  opAgencyId: string;
  clientLogo: string | null;
  clientName: string;
  favourite: boolean;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  pinCode: number;
  state: string;
  landMark: string | null;
  contactPersonFullName: string;
  designation: string | null;
  contactPhone: string;
  contactEmail: string | null;
  emergencyContactName: string | null;
  emergencyContactDesignation: string | null;
  emergencyContactPhone: string | null;
  emergencyContactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  sites: ClientSite[];
  opAgency: {
    id: string;
    agencyName: string;
    agencyImageUrl: string;
  };
}

export interface ClientSite {
  id: string;
  siteName: string;
  siteType: string[];
  city: string;
  state: string;
  createdAt: string;
}

export interface ClientSitesApiResponse {
  success: boolean;
  data: ClientSiteApiData[];
  timestamp: string;
}

// Transformed client site data for UI
export interface TransformedClientSite {
  siteId: string;
  client: string;
  siteName: string;
  type: "Bank" | "ATM" | "Corporate" | "Retail" | "Office" | "Warehouse" | "Commercial";
  posts: number; // Mock data - would need another API
  guardCount: number; // Mock data - would need another API
  clientId: string;
  clientLogo?: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    state: string;
    pinCode: string;
    landMark?: string;
  };
  contactPerson: {
    name: string;
    designation?: string;
    phone: string;
    email?: string;
  };
  emergencyContact?: {
    name: string;
    designation?: string;
    phone: string;
    email?: string;
  };
  agency: {
    id: string;
    name: string;
    imageUrl: string;
  };
  favourite: boolean;
  createdAt: string;
  updatedAt: string;
}

// Map site types from API to UI
const mapSiteType = (siteTypes: string[]): TransformedClientSite["type"] => {
  if (siteTypes.includes("OFFICE")) return "Office";
  if (siteTypes.includes("COMMERCIAL")) return "Commercial";
  if (siteTypes.includes("WAREHOUSE")) return "Warehouse";
  if (siteTypes.includes("BANK")) return "Bank";
  if (siteTypes.includes("ATM")) return "ATM";
  if (siteTypes.includes("RETAIL")) return "Retail";
  return "Corporate";
};

// Generate mock data for fields not available in API
const generateMockSiteData = () => ({
  posts: Math.floor(Math.random() * 5) + 1, // 1-5 posts
  guardCount: Math.floor(Math.random() * 10) + 2, // 2-11 guards
});

// Transform API data to UI format
const transformClientSiteData = (apiData: ClientSiteApiData[]): TransformedClientSite[] => {
  const transformedSites: TransformedClientSite[] = [];

  apiData.forEach((client) => {
    client.sites.forEach((site) => {
      const mockData = generateMockSiteData();

      transformedSites.push({
        siteId: site.id,
        client: client.clientName,
        siteName: site.siteName,
        type: mapSiteType(site.siteType),
        posts: mockData.posts,
        guardCount: mockData.guardCount,
        clientId: client.id,
        clientLogo: client.clientLogo === null ? undefined : client.clientLogo,
        address: {
          addressLine1: client.addressLine1,
          addressLine2: client.addressLine2 === null ? undefined : client.addressLine2,
          city: client.city,
          district: client.district,
          state: client.state,
          pinCode: client.pinCode.toString(),
          landMark: client.landMark === null ? undefined : client.landMark,
        },
        contactPerson: {
          name: client.contactPersonFullName,
          designation: client.designation === null ? undefined : client.designation,
          phone: client.contactPhone,
          email: client.contactEmail === null ? undefined : client.contactEmail,
        },
        emergencyContact: client.emergencyContactName
          ? {
              name: client.emergencyContactName,
              designation: client.emergencyContactDesignation === null ? undefined : client.emergencyContactDesignation,
              phone: client.emergencyContactPhone || "",
              email: client.emergencyContactEmail === null ? undefined : client.emergencyContactEmail,
            }
          : undefined,
        agency: {
          id: client.opAgency.id,
          name: client.opAgency.agencyName,
          imageUrl: client.opAgency.agencyImageUrl,
        },
        favourite: client.favourite,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      });
    });
  });

  return transformedSites;
};

// API call function for Client Sites
const fetchClientSites = async (areaOfficerId: string): Promise<TransformedClientSite[]> => {
  if (!areaOfficerId) {
    throw new Error("Area Officer ID is required");
  }

  console.log(`🔄 Fetching client sites from API for area officer: ${areaOfficerId}`);

  const response = await authApi.get<ClientSitesApiResponse>(`/clients/${encodeURIComponent(areaOfficerId)}/clients`);

  if (!response.data.success) {
    throw new Error("Failed to fetch client sites");
  }

  console.log(`✅ Successfully fetched client sites for area officer: ${areaOfficerId}`, {
    totalClients: response.data.data.length,
    totalSites: response.data.data.reduce((acc, client) => acc + client.sites.length, 0),
  });

  return transformClientSiteData(response.data.data);
};

// TanStack Query Keys for Client Sites
export const clientSitesQueryKeys = {
  all: ["clientSites"] as const,
  areaOfficer: (areaOfficerId: string) => [...clientSitesQueryKeys.all, "areaOfficer", areaOfficerId] as const,
};

// Custom hook for fetching client sites with TanStack Query
export const useClientSites = (areaOfficerId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: clientSitesQueryKeys.areaOfficer(areaOfficerId || ""),
    queryFn: () => fetchClientSites(areaOfficerId!),
    enabled: enabled && !!areaOfficerId,
    staleTime: 10 * 60 * 1000, // 10 minutes - client sites don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for longer
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Utility functions for Client Sites
export const useClientSitesUtils = () => {
  const queryClient = useQueryClient();

  const invalidateClientSites = (areaOfficerId: string) => {
    queryClient.invalidateQueries({
      queryKey: clientSitesQueryKeys.areaOfficer(areaOfficerId),
    });
  };

  const prefetchClientSites = async (areaOfficerId: string) => {
    await queryClient.prefetchQuery({
      queryKey: clientSitesQueryKeys.areaOfficer(areaOfficerId),
      queryFn: () => fetchClientSites(areaOfficerId),
      staleTime: 10 * 60 * 1000,
    });
  };

  const clearAllClientSitesCache = () => {
    queryClient.removeQueries({
      queryKey: clientSitesQueryKeys.all,
    });
  };

  // Helper functions for filtering and sorting
  const filterSitesByType = (
    sites: TransformedClientSite[],
    type: TransformedClientSite["type"]
  ): TransformedClientSite[] => {
    return sites.filter((site) => site.type === type);
  };

  const filterFavouriteSites = (sites: TransformedClientSite[]): TransformedClientSite[] => {
    return sites.filter((site) => site.favourite);
  };

  const sortSitesByName = (sites: TransformedClientSite[]): TransformedClientSite[] => {
    return [...sites].sort((a, b) => a.siteName.localeCompare(b.siteName));
  };

  const sortSitesByClient = (sites: TransformedClientSite[]): TransformedClientSite[] => {
    return [...sites].sort((a, b) => a.client.localeCompare(b.client));
  };

  const groupSitesByClient = (sites: TransformedClientSite[]) => {
    return sites.reduce(
      (acc, site) => {
        if (!acc[site.client]) {
          acc[site.client] = [];
        }
        acc[site.client].push(site);
        return acc;
      },
      {} as Record<string, TransformedClientSite[]>
    );
  };

  const groupSitesByType = (sites: TransformedClientSite[]) => {
    return sites.reduce(
      (acc, site) => {
        if (!acc[site.type]) {
          acc[site.type] = [];
        }
        acc[site.type].push(site);
        return acc;
      },
      {} as Record<TransformedClientSite["type"], TransformedClientSite[]>
    );
  };

  const getSiteStats = (sites: TransformedClientSite[]) => {
    const stats = {
      totalSites: sites.length,
      totalPosts: sites.reduce((acc, site) => acc + site.posts, 0),
      totalGuards: sites.reduce((acc, site) => acc + site.guardCount, 0),
      favouriteSites: sites.filter((site) => site.favourite).length,
      sitesByType: groupSitesByType(sites),
    };

    return stats;
  };

  return {
    invalidateClientSites,
    prefetchClientSites,
    clearAllClientSitesCache,
    filterSitesByType,
    filterFavouriteSites,
    sortSitesByName,
    sortSitesByClient,
    groupSitesByClient,
    groupSitesByType,
    getSiteStats,
  };
};
