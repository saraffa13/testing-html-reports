import { useApi } from "../../../../apis/base";

export const getAttendanceCount = async (clientId: string, startDate?: string, endDate?: string): Promise<any> => {
  const { get } = useApi;
  let url = `/clients/default/absent/${clientId}`;

  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await get(url);
  return response;
};

export const getLateCount = async (clientId: string): Promise<any> => {
  const { get } = useApi;
  const response = await get(`/clients/default/late/${clientId}/count`);
  return response;
};

export const getUniformDefaults = async (clientId: string, startDate?: string, endDate?: string): Promise<any> => {
  const { get } = useApi;
  let url = `/clients/default/uniform/${clientId}`;

  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await get(url);
  return response;
};

export const getAlertnessDefaults = async (clientId: string, startDate?: string, endDate?: string): Promise<any> => {
  const { get } = useApi;
  let url = `/clients/default/alertness/${clientId}`;

  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await get(url);
  return response;
};

export const getGeofenceActivity = async (clientId: string): Promise<any> => {
  const { get } = useApi;
  const response = await get(`/clients/default/geofence/${clientId}`);
  return response;
};

export const getLateGuards = async (clientId: string, startDate?: string, endDate?: string): Promise<any> => {
  const { get } = useApi;
  let url = `/clients/default/late/${clientId}`;

  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await get(url);
  return response;
};

export const getGeofenceDefaults = async (clientId: string, startDate?: string, endDate?: string): Promise<any> => {
  const { get } = useApi;
  let url = `/clients/default/geofence/${clientId}`;

  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await get(url);
  return response;
};
