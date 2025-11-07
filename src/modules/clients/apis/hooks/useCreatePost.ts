import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, createShift } from "../services/posts";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      siteId: string;
      clientId: string;
      postName: string;
      geofenceType: string;
      areaOfficerId?: string;
      geoFenceMapData?: {
        type: "circle" | "polygon";
        center?: { lat: number; lng: number };
        radius?: number;
        coordinates?: Array<{ lat: number; lng: number }>;
      };
      shifts: Array<{
        daysOfWeek: string[];
        includePublicHolidays: boolean;
        dutyStartTime: string;
        dutyEndTime: string;
        checkInTime: string;
        latenessFrom: string;
        latenessTo: string;
        guardRequirement: {
          guardTypeId: string; // Changed from guardType
          guardCount: number;
          uniformBy: string;
          uniformType: string;
          tasksEnabled: boolean;
          alertnessChallengeEnabled: boolean;
          alertnessChallengeCount?: number;
          patrolEnabled: boolean;
          selectedPatrolRoutes: string[];
        };
      }>;
    }) => {
      // Create the post with the geofence data from the form
      const postResponse = await createPost({
        siteId: data.siteId,
        postName: data.postName,
        geofenceType: data.geofenceType,
        areaOfficerId: data.areaOfficerId,
        geoFenceMapData: data.geoFenceMapData,
      });

      const sitePostId = postResponse.data?.data?.id;
      if (!sitePostId) {
        throw new Error("Post ID not received from post creation response");
      }

      // Create shifts sequentially with guard requirements as array
      const shiftPromises = data.shifts.map((shift) => {
        return createShift({
          sitePostId,
          siteId: data.siteId,
          clientId: data.clientId,
          areaOfficerId: data.areaOfficerId || "",
          daysOfWeek: shift.daysOfWeek,
          includePublicHolidays: shift.includePublicHolidays,
          dutyStartTime: shift.dutyStartTime,
          dutyEndTime: shift.dutyEndTime,
          checkInTime: shift.checkInTime,
          latenessFrom: shift.latenessFrom,
          latenessTo: shift.latenessTo,
          guardRequirements: [shift.guardRequirement], // Convert to array
        });
      });

      await Promise.all(shiftPromises);
      return postResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSitesById"] });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
    },
  });
};
