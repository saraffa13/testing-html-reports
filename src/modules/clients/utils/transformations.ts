// Transformation utilities for client site data
import { DEFAULT_COORDINATES } from "../constants";

export const getCoordinatesFromData = (data: any) => {
  const lat = data.geoLocation?.coordinates?.latitude;
  const lng = data.geoLocation?.coordinates?.longitude;
  const validLat = typeof lat === "number" && !isNaN(lat) && lat !== 0 ? lat : DEFAULT_COORDINATES.latitude;
  const validLng = typeof lng === "number" && !isNaN(lng) && lng !== 0 ? lng : DEFAULT_COORDINATES.longitude;
  return {
    latitude: Number(validLat),
    longitude: Number(validLng),
  };
};

export const getValidGuardTypeId = (guardTypeId: string): string => {
  if (!guardTypeId) return "427759200000"; // Default to Security Guard ID
  return guardTypeId; // Return the actual guard type ID from the API
};

export const validateTimeFormat = (time: string): string => {
  if (!time) return "00:00";
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  try {
    const parts = time.split(":");
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      }
    }
  } catch (error) {
    console.warn(`Invalid time format: ${time}, using default 00:00`);
  }
  return "00:00";
};

export const isValidCoordinate = (coord: unknown): coord is number =>
  typeof coord === "number" && !isNaN(coord);

export const validateAndFixPatrolRoutes = (
  patrolRoutes: any[],
  fallbackCoordinates: { latitude: number; longitude: number }
): any[] => {
  if (!patrolRoutes || patrolRoutes.length === 0) {
    return [];
  }
  return patrolRoutes.map((route) => {
    if (!route.checkpoints || route.checkpoints.length === 0) {
      return {
        ...route,
        checkpoints: [
          {
            checkType: "QR_CODE" as const,
            qrCodeUrl: undefined,
            qrlocationImageUrl: undefined,
            photoUrl: undefined,
            latitude: Number(fallbackCoordinates.latitude),
            longitude: Number(fallbackCoordinates.longitude),
          },
        ],
      };
    }
    const fixedCheckpoints = route.checkpoints.map((checkpoint: any) => {
      const lat = checkpoint.latitude;
      const lng = checkpoint.longitude;
      if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
        return {
          ...checkpoint,
          latitude: Number(fallbackCoordinates.latitude),
          longitude: Number(fallbackCoordinates.longitude),
        };
      }
      return {
        ...checkpoint,
        latitude: Number(Number(lat)),
        longitude: Number(Number(lng)),
      };
    });
    return {
      ...route,
      checkpoints: fixedCheckpoints,
    };
  });
};