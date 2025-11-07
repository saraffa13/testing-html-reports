import { useApi } from "../../../../apis/base";

export interface CheckpointData {
  id?: string;
  checkType: "QR_CODE" | "PHOTO";
  latitude: number;
  longitude: number;
  _delete?: boolean;
}

export interface UpdatePatrolRouteData {
  siteId: string;
  routeId: string;
  routeName?: string;
  patrolRouteCode?: string;
  patrolFrequency?: "TIME" | "COUNT";
  hours?: number;
  minutes?: number;
  count?: number;
  roundsInShift?: number;
  checkpoints: CheckpointData[];
}

export interface CreatePatrolRouteData {
  siteId: string;
  routeName: string;
  patrolRouteCode?: string;
  patrolFrequency: "TIME" | "COUNT";
  hours?: number;
  minutes?: number;
  count?: number;
  roundsInShift?: number;
  checkpoints: CheckpointData[];
}

export interface CheckpointFiles {
  [key: string]: File;
}

export interface UpdatePatrolRouteResponse {
  message: string;
  patrolRoute: {
    id: string;
    routeName: string;
    patrolRouteCode: string;
    patrolFrequency: string;
    hours: number;
    minutes: number;
    count: number;
    roundsInShift: number;
    checkpoints: Array<{
      id: string;
      checkType: string;
      qrCodeUrl: string;
      qrlocationImageUrl?: string;
      photoUrl?: string;
      latitude: number;
      longitude: number;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  changes: {
    checkpointsAdded: number;
    checkpointsUpdated: number;
    checkpointsDeleted: number;
  };
}

export interface CreatePatrolRouteResponse {
  message: string;
  patrolRoute: {
    id: string;
    routeName: string;
    patrolRouteCode: string;
    patrolFrequency: string;
    hours: number;
    minutes: number;
    count: number;
    roundsInShift: number;
    checkpoints: Array<{
      id: string;
      checkType: string;
      qrCodeUrl: string;
      qrlocationImageUrl?: string;
      photoUrl?: string;
      latitude: number;
      longitude: number;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  changes: {
    checkpointsAdded: number;
    checkpointsUpdated: number;
    checkpointsDeleted: number;
  };
}

export const updatePatrolRouteWithCheckpoints = async (
  data: UpdatePatrolRouteData,
  files: CheckpointFiles
): Promise<UpdatePatrolRouteResponse> => {
  const { putFormData } = useApi;

  const formData = new FormData();

  // Add required fields
  formData.append("siteId", data.siteId);
  formData.append("routeId", data.routeId);

  // Add optional route fields
  if (data.routeName) formData.append("routeName", data.routeName);
  if (data.patrolRouteCode) formData.append("patrolRouteCode", data.patrolRouteCode);
  if (data.patrolFrequency) formData.append("patrolFrequency", data.patrolFrequency);
  if (data.hours !== undefined) formData.append("hours", data.hours.toString());
  if (data.minutes !== undefined) formData.append("minutes", data.minutes.toString());
  if (data.count !== undefined) formData.append("count", data.count.toString());
  if (data.roundsInShift !== undefined) formData.append("roundsInShift", data.roundsInShift.toString());

  // Add checkpoints as JSON string (as per API specification)
  formData.append("checkpoints", JSON.stringify(data.checkpoints));

  // Add files with proper naming convention: checkpoint_{INDEX}_{fileType}File
  Object.entries(files).forEach(([key, file]) => {
    // Validate file type and size before upload (following best practices)
    if (file instanceof File) {
      // Check file size (max 10MB as per specification)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File ${file.name} exceeds maximum size of 10MB`);
      }

      // Check file type (images only)
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File ${file.name} has unsupported type. Only JPG, JPEG, PNG, GIF are allowed`);
      }

      console.log(`Adding file with key: ${key}, name: ${file.name}`);
      formData.append(key, file);
    }
  });
  return putFormData("/sites/patrol-route-with-checkpoints", formData);
};

export const createPatrolRoute = async (
  data: CreatePatrolRouteData,
  files: CheckpointFiles
): Promise<CreatePatrolRouteResponse> => {
  const { postFormData } = useApi;

  const formData = new FormData();

  // Add required fields
  formData.append("siteId", data.siteId);
  formData.append("routeName", data.routeName);
  formData.append("patrolFrequency", data.patrolFrequency);

  // Add optional route fields
  if (data.patrolRouteCode) formData.append("patrolRouteCode", data.patrolRouteCode);
  if (data.hours !== undefined) formData.append("hours", data.hours.toString());
  if (data.minutes !== undefined) formData.append("minutes", data.minutes.toString());
  if (data.count !== undefined) formData.append("count", data.count.toString());
  if (data.roundsInShift !== undefined) formData.append("roundsInShift", data.roundsInShift.toString());

  // Add checkpoints as JSON string
  formData.append("checkpoints", JSON.stringify(data.checkpoints));

  // Add files with proper naming convention
  Object.entries(files).forEach(([key, file]) => {
    if (file instanceof File) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File ${file.name} exceeds maximum size of 10MB`);
      }

      // Check file type (images only)
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File ${file.name} has unsupported type. Only JPG, JPEG, PNG, GIF are allowed`);
      }

      formData.append(key, file);
    }
  });

  return postFormData("/sites/patrol-route", formData);
};
