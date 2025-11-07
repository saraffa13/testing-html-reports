import type { Agency } from "src/types";
import {
  type GeofenceType,
  type UniformBy,
  type PatrolFrequency,
  type CheckType,
  type DutyStatus,
  type ScanMethod,
  type CheckinAction,
  type CheckinStatus,
  type GeofenceEvent,
  type Gender,
  DaysOfWeek,
} from "./constants";

// Re-export all types for easy access
export {
  type UniformBy,
  type PatrolFrequency,
  type CheckType,
  type DutyStatus,
  type ScanMethod,
  type CheckinAction,
  type CheckinStatus,
  type GeofenceEvent,
  type Gender,
  DaysOfWeek,
};

// Re-export for backward compatibility
export type GeoFenceType = GeofenceType;

export interface Client {
  id: string;
  opAgencyId: string;
  clientLogo: string | null;
  clientName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  pinCode: number;
  state: string;
  landMark: string | null;
  contactPersonFullName: string | null;
  designation: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  emergencyContactName: string | null;
  emergencyContactDesignation: string | null;
  emergencyContactPhone: string | null;
  emergencyContactEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientUniform {
  id: string;
  clientId: string;
  uniformName: string;
  topPartUrl: string | null;
  bottomPartUrl: string | null;
  accessoriesUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: string;
  clientId: string;
  siteName: string;
  siteType: string[];
  siteContactPersonFullName: string | null;
  siteContactDesignation: string | null;
  siteContactPhone: string | null;
  siteContactEmail: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string;
  district: string;
  pinCode: string;
  state: string;
  landMark: string | null;
  siteLocationMapLink: string | null;
  latitude: number | null;
  longitude: number | null;
  plusCode: string | null;
  geoFenceMapData: any | null; // JSON type
  geofenceType: GeoFenceType;
  patrolling: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SitePost {
  id: string;
  siteId: string;
  postName: string;
  geofenceType: GeoFenceType;
  geoFenceMapData: any | null; // JSON type
  createdAt: Date;
  updatedAt: Date;
}

export interface SitePostShift {
  id: string;
  sitePostId: string;
  daysOfWeek: string[];
  includePublicHolidays: boolean;
  dutyStartTime: string;
  dutyEndTime: string;
  checkInTime: string;
  latenessFrom: string;
  latenessTo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuardRequirement {
  id: string;
  sitePostShiftId: string;
  guardTypeId: string; // Use consistent naming with form types
  guardCount: number;
  uniformBy: UniformBy;
  uniformType: string;
  tasksEnabled: boolean;
  alertnessChallengeEnabled: boolean;
  alertnessChallengeCount: number | null;
  patrolEnabled: boolean;
  selectedPatrolRoutes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GuardSelection {
  id: string;
  shiftPostId: string;
  guardId: string;
  alertnessChallenge: boolean;
  occurenceCount: number | null;
  patrolling: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatrolRoutes {
  id: string;
  siteId: string;
  routeName: string;
  patrolRouteCode: string | null;
  patrolFrequency: PatrolFrequency;
  hours: number | null;
  minutes: number | null;
  count: number | null;
  roundsInShift: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatrolCheckpoint {
  id: string;
  patrolRouteId: string;
  checkType: CheckType;
  qrCodeUrl: string | null;
  qrlocationImageUrl: string | null;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuardReference {
  id: string;
  guardId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  status: string;
  photo: string | null;
  bloodGroup: string | null;
  currentAgencyId: string | null;
  sex: Gender | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Duty {
  id: string;
  guardSelectionId: string;
  dutyDate: Date;
  status: DutyStatus;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualCheckInTime: Date | null;
  actualCheckOutTime: Date | null;
  isLate: boolean;
  lateMinutes: number;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DutyAttendanceConfirmation {
  id: string;
  dutyId: string;
  willAttend: boolean;
  reason: string | null;
  confirmedAt: Date;
}

export interface DutyCheckinLog {
  id: string;
  dutyId: string;
  actionType: CheckinAction;
  status: CheckinStatus;
  scheduledTime: Date | null;
  actualTime: Date;
  timeDifference: number | null;
  reason: string | null;
  photoUrl: string | null;
  remarks: string | null;
}

export interface DutyUniformCheck {
  id: string;
  dutyId: string;
  passed: boolean;
  failureReasons: string[];
  photoUrl: string | null;
  remarks: string | null;
  retryCount: number;
  triggeredBy: string;
  checkedAt: Date;
}

export interface DutyGeofenceLog {
  id: string;
  dutyId: string;
  eventType: GeofenceEvent;
  reason: string | null;
  duration: number | null;
  timestamp: Date;
}

export interface DutyAlertnessCheck {
  id: string;
  dutyId: string;
  challengeType: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  passed: boolean;
  minimumScore: number;
  difficulty: string;
  retryCount: number;
  retryAllowed: boolean;
  triggeredBy: string;
  questionData: any | null; // JSON type
  checkedAt: Date;
}

export interface DutyCheckpointScan {
  id: string;
  dutyId: string;
  patrolLogId: string | null;
  checkpointId: string;
  scanTime: Date;
  scanMethod: ScanMethod;
  createdAt: Date;
}

// Extended interfaces with relations for common use cases
export interface ClientWithDetails extends Client {
  opAgency: Agency;
  uniforms: ClientUniform[];
  sites: Site[];
}

export interface SiteWithDetails extends Site {
  client: Client;
  SitePost: SitePost[];
  PatrolRoutes: PatrolRoutes[];
}

export interface SitePostWithDetails extends SitePost {
  site: Site;
  SitePostShift: SitePostShiftWithDetails[];
}

export interface SitePostShiftWithDetails extends SitePostShift {
  sitePost: SitePost;
  guardRequirements: GuardRequirement[];
  GuardSelection: GuardSelection[];
}

export interface PatrolRoutesWithDetails extends PatrolRoutes {
  site: Site;
  checkpoints: PatrolCheckpoint[];
}

export interface GuardSelectionWithDetails extends GuardSelection {
  guardReference: GuardReference;
  shift: SitePostShift;
  Duty: Duty[];
}

export interface DutyWithDetails extends Duty {
  guardSelection: GuardSelectionWithDetails;
  DutyAttendanceConfirmation: DutyAttendanceConfirmation | null;
  DutyCheckinLog: DutyCheckinLog[];
  DutyUniformCheck: DutyUniformCheck[];
  DutyGeofenceLog: DutyGeofenceLog[];
  DutyAlertnessCheck: DutyAlertnessCheck[];
}

// UI/Display specific interfaces (for lists, cards, etc.)
export interface ClientListItem {
  id: string;
  clientName: string;
  logo: string | null;
  mainOffice: string; // Computed from address fields
  totalSites: number;
  totalGuards: number;
  favourite: boolean; // From user preferences
}

export interface ClientDetailsView {
  id: string;
  clientName: string;
  totalGuards: number;
  address: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    district: string;
    pinCode: number;
    state: string;
    landMark: string | null;
  };
  contactDetails: {
    contactPerson: {
      fullName: string | null;
      designation: string | null;
      phoneNumber: string | null;
      email: string | null;
    };
    emergencyContact: {
      fullName: string | null;
      designation: string | null;
      phoneNumber: string | null;
      email: string | null;
    };
  };
}

export interface ClientUniformView {
  uniformName: string;
  top: boolean;
  bottom: boolean;
  accessories: boolean;
  topPhotos: string[];
  bottomPhotos: string[];
  accessoriesPhotos: string[];
}

export interface ClientSiteView {
  id: string;
  name: string;
  type: string[];
  contactPerson: {
    fullName: string | null;
    designation: string | null;
    phoneNumber: string | null;
    email: string | null;
  };
  areaOfficer: string[];
  address: {
    addressLine1: string | null;
    addressLine2: string | null;
    city: string;
    district: string;
    pinCode: string;
    state: string;
    landMark: string | null;
  };
  geoLocation: {
    mapLink: string | null;
    coordinates: {
      latitude: number | null;
      longitude: number | null;
    };
    plusCode: string | null;
  };
  geoFencing: {
    type: GeoFenceType;
  };
  patrolling: {
    patrol: boolean;
    patrolRouteDetails: {
      name: string;
      routeCode: string | null;
      patrolFrequency: {
        type: PatrolFrequency;
        hours: number | null;
        minutes: number | null;
        count: number | null;
        numberOfPatrols: number | null;
      };
      patrolCheckpoints: {
        type: CheckType;
        qrCode: string | null;
        photo: string | null;
      }[];
    }[];
  };
  sitePosts: {
    name: string;
    geoFenceType: GeoFenceType;
    shifts: {
      days: string[];
      publicHolidayGuardRequired: boolean;
      dutyStartTime: string;
      dutyEndTime: string;
      checkInTime: string;
      latenessFrom: string;
      latenessTo: string;
      guardRequirements: {
        guardTypeId: string;
        count: number;
        uniformBy: UniformBy;
        uniformType: string;
        tasks: boolean;
        alertnessChallenge: boolean;
        alertnessChallengeOccurrence: number | null;
        patrolEnabled: boolean;
        selectPatrolRoutes: string[];
      }[];
    }[];
  }[];
}

// Form interfaces for creating/updating entities
export interface CreateClientRequest {
  opAgencyId: string;
  clientLogo?: string;
  clientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  pinCode: number;
  state: string;
  landMark?: string;
  contactPersonFullName?: string;
  designation?: string;
  contactPhone?: string;
  contactEmail?: string;
  emergencyContactName?: string;
  emergencyContactDesignation?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string;
}

export interface CreateSiteRequest {
  clientId: string;
  siteName: string;
  siteType: string[];
  siteContactPersonFullName?: string;
  siteContactDesignation?: string;
  siteContactPhone?: string;
  siteContactEmail?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  district: string;
  pinCode: string;
  state: string;
  landMark?: string;
  siteLocationMapLink?: string;
  latitude?: number;
  longitude?: number;
  plusCode?: string;
  geoFenceMapData?: any;
  geofenceType: GeoFenceType;
  patrolling: boolean;
}

export interface UpdateSiteRequest extends Partial<CreateSiteRequest> {
  id: string;
}

export interface ClientFormData {
  clientLogo?: File | null;
  clientName: string;
  address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    district: string;
    pincode: string; // Keep as string for form, convert to number for API
    state: string;
    landmark: string;
  };
  contactDetails: {
    contactPerson: {
      fullName: string;
      designation: string; // Keep typo to match existing UI
      phoneNumber: string;
      email: string;
    };
    emergencyContact: {
      fullName: string;
      designation: string; // Keep typo to match existing UI
      phoneNumber: string;
      email: string;
    };
  };
}

// Utility function to transform API response to ClientListItem
export const transformToClientListItem = (client: ClientWithDetails): ClientListItem => {
  // Calculate total guards based on site characteristics
  // In a real scenario, this would come from guard assignments to posts/shifts
  const totalGuards =
    client.sites?.reduce((total, site) => {
      // Calculate guards needed based on site type and patrolling requirements
      let siteGuards = 2; // Base guards per site

      // Add extra guards for commercial/office sites
      if (site.siteType?.includes("COMMERCIAL") || site.siteType?.includes("OFFICE")) {
        siteGuards += 1;
      }

      // Add extra guards if patrolling is enabled
      if (site.patrolling) {
        siteGuards += 2;
      }

      return total + siteGuards;
    }, 0) || 0;

  return {
    id: client.id,
    clientName: client.clientName,
    logo: client.clientLogo,
    mainOffice: client.city, // Using city as main office
    totalSites: client.sites?.length || 0,
    totalGuards: totalGuards,
    favourite: false, // This should be managed by user preferences
  };
};

// Utility function to calculate total guards for a client
export const calculateTotalGuards = (client: ClientWithDetails): number => {
  // Calculate based on sites and their characteristics
  return (
    client.sites?.reduce((total, site) => {
      let siteGuards = 2; // Base guards per site

      // Add extra guards for commercial/office sites
      if (site.siteType?.includes("COMMERCIAL") || site.siteType?.includes("OFFICE")) {
        siteGuards += 1;
      }

      // Add extra guards if patrolling is enabled
      if (site.patrolling) {
        siteGuards += 2;
      }

      return total + siteGuards;
    }, 0) || 0
  );
};
