import { useApi } from "../../../../apis/base";

export interface GuardData {
  id: string;
  guardId: string;
  phoneNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  photo: string;
  bloodGroup: string;
  currentAgencyId: string;
  guardTypeId?: string;
  sex: "MALE" | "FEMALE";
  userType: "GUARD" | "AREA_OFFICER";
  createdAt: string;
  updatedAt: string;
  GuardSelection?: Array<{
    id: string;
    shiftPostId: string;
    guardId: string;
    sitePostId: string;
    siteId: string;
    clientId: string;
    areaOfficerId: string;
    alertnessChallenge: boolean;
    occurenceCount: number;
    patrolling: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface GuardsResponse {
  success: boolean;
  data: {
    guards: GuardData[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  timestamp: string;
}

// Get guards API service
export const getGuards = async (params: {
  page?: number;
  limit?: number;
  guardId?: string;
  agencyId?: string;
  clientId?: string;
  siteId?: string;
  userType?: "GUARD" | "AREA_OFFICER";
  status?: string;
  gender?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<GuardsResponse> => {
  const { get } = useApi;

  const searchParams = new URLSearchParams();

  // Add all parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return get(`/guard-references/guards${queryString}`);
};
