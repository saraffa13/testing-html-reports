import { useApi } from "../../../../apis/base";

export const createPost = async (data: {
  siteId: string;
  postName: string;
  geofenceType: string;
  areaOfficerId?: string;
  geoFenceMapData?: {
    type: "circle" | "polygon";
    center?: { lat: number; lng: number };
    radius?: number;
    coordinates?: Array<{ lat: number; lng: number }>;
  };
}): Promise<any> => {
  const { post } = useApi;
  return post("/sites/posts", data);
};

export const createShift = async ({
  sitePostId,
  siteId,
  clientId,
  areaOfficerId,
  daysOfWeek,
  includePublicHolidays,
  dutyStartTime,
  dutyEndTime,
  checkInTime,
  latenessFrom,
  latenessTo,
  guardRequirements,
}: {
  sitePostId: string;
  siteId: string;
  clientId: string;
  areaOfficerId: string;
  daysOfWeek: string[];
  includePublicHolidays: boolean;
  dutyStartTime: string;
  dutyEndTime: string;
  checkInTime: string;
  latenessFrom: string;
  latenessTo: string;
  guardRequirements: Array<{
    guardTypeId: string; // Changed from guardType
    guardCount: number;
    uniformBy: string;
    uniformType: string;
    tasksEnabled: boolean;
    alertnessChallengeEnabled: boolean;
    alertnessChallengeCount?: number;
    patrolEnabled: boolean;
    selectedPatrolRoutes: string[];
  }>;
}) => {
  const { post } = useApi;

  return post("/sites/shifts", {
    sitePostId,
    siteId,
    clientId,
    areaOfficerId,
    daysOfWeek,
    includePublicHolidays,
    dutyStartTime,
    dutyEndTime,
    checkInTime,
    latenessFrom,
    latenessTo,
    guardRequirements,
  });
};
