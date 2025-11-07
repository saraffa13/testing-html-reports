// File: services/api/index.ts
export { default as AreaManagersApiService } from "./areaManagersApi";
export { default as AreasApiService } from "./areasApi";
export { default as GuardTypesApiService } from "./guardTypesApi";
export { default as SiteTypesApiService } from "./siteTypesApi";

// Re-export types for convenience
export type { AreaManager, CreateAreaManagerRequest, UpdateAreaManagerRequest } from "./areaManagersApi";
export type { Area, CreateAreaRequest, UpdateAreaRequest } from "./areasApi";
export type { CreateGuardTypeRequest, GuardType, UpdateGuardTypeRequest } from "./guardTypesApi";
export type { CreateSiteTypeRequest, SiteType, UpdateSiteTypeRequest } from "./siteTypesApi";
