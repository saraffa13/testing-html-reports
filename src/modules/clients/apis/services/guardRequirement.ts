import { useApi } from "../../../../apis/base";

export const updateGuardRequirement = async (requirementId: string, data: any): Promise<any> => {
  const { patch } = useApi;
  return patch(`/sites/guard-requirements/${requirementId}`, data);
};

export const getGuardRequirements = async (siteId: string): Promise<any> => {
  const { get } = useApi;
  return get(`/sites/${siteId}/guard-requirements`);
};
