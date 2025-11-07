// Shared constants and enums for client module

export type GeofenceType = "NO_GEOFENCE" | "CIRCLE" | "POLYGON";


export type UniformBy = "CLIENT" | "PSA";

export type PatrolFrequency = "TIME" | "COUNT";

export type CheckType = "QR_CODE" | "PHOTO";

export type SiteType =
  | "OFFICE"
  | "RESIDENTIAL"
  | "INDUSTRIAL"
  | "HEALTHCARE"
  | "PUBLIC"
  | "EVENT"
  | "HIGH_SECURITY"
  | "RELIGIOUS";

export type DutyStatus = "SCHEDULED" | "CHECKED_IN" | "ACTIVE" | "COMPLETED" | "ABSENT" | "ABANDONED";

export type ScanMethod = "QR_CODE" | "NFC" | "MANUAL" | "GPS";

export type CheckinAction = "CHECK_IN" | "CHECK_OUT" | "BREAK_START" | "BREAK_END" | "LUNCH_START" | "LUNCH_END";

export type CheckinStatus = "ON_TIME" | "LATE" | "EARLY" | "MISSED" | "UNAUTHORIZED";

export type GeofenceEvent = "ENTER" | "EXIT";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export enum DaysOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY"
}

// Default coordinates (Mumbai)
export const DEFAULT_COORDINATES = {
  latitude: 19.076,
  longitude: 72.8777,
} as const;

// Geofence type mappings for API
export const GEOFENCE_MAPPING = {
  "Circular Geofence": "CIRCLE",
  "Polygon Geofence": "POLYGON",
} as const;

// Validation error messages
export const VALIDATION_ERRORS = {
  SITE_NAME_REQUIRED: "Site name is required",
  CONTACT_NAME_REQUIRED: "Contact person name is required",
  ADDRESS_REQUIRED: "Address line 1 is required",
  CITY_REQUIRED: "City is required",
  STATE_REQUIRED: "State is required",
  LATITUDE_REQUIRED: "Valid latitude is required",
  LONGITUDE_REQUIRED: "Valid longitude is required",
  SITE_POST_REQUIRED: "At least one site post is required",
  SITE_POST_INVALID: (index: number) => `Site post ${index + 1} has invalid data`,
  PATROL_ROUTE_INVALID: (index: number) => `Patrol route ${index + 1} has invalid data`,
} as const;