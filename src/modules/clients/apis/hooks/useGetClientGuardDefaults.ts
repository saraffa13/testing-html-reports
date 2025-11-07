import { useQuery } from "@tanstack/react-query";
import {
  getAlertnessDefaults,
  getAttendanceCount,
  getGeofenceDefaults,
  getLateGuards,
  getUniformDefaults,
} from "../services/clientDefaults";

export const useGetAttendanceCount = (clientId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["attendanceCount", clientId, startDate, endDate],
    queryFn: () => getAttendanceCount(clientId, startDate, endDate),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useGetLateCount = (clientId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["lateGuards", clientId, startDate, endDate],
    queryFn: () => getLateGuards(clientId, startDate, endDate),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useGetUniformDefaults = (clientId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["uniformDefaults", clientId, startDate, endDate],
    queryFn: () => getUniformDefaults(clientId, startDate, endDate),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useGetAlertnessDefaults = (clientId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["alertnessDefaults", clientId, startDate, endDate],
    queryFn: () => getAlertnessDefaults(clientId, startDate, endDate),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const useGetGeofenceActivity = (clientId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["geofenceDefaults", clientId, startDate, endDate],
    queryFn: () => getGeofenceDefaults(clientId, startDate, endDate),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
