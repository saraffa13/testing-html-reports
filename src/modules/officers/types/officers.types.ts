// File: src/types/officers.types.ts

// Enums matching the API
export enum Sex {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
  OTHER = "OTHER",
}

export enum GuardStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  OTHER = "OTHER",
}

export enum UserType {
  GUARD = "GUARD",
  AREA_OFFICER = "AREA_OFFICER",
}

export enum AddressType {
  PERMANENT = "PERMANENT",
  CURRENT = "CURRENT",
}

export enum ContactType {
  PERSONAL = "PERSONAL",
  EMERGENCY = "EMERGENCY",
  ALTERNATE = "ALTERNATE",
}

export enum RelationshipType {
  FATHER = "FATHER",
  MOTHER = "MOTHER",
  SPOUSE = "SPOUSE",
  BROTHER = "BROTHER",
  SISTER = "SISTER",
  SON = "SON",
  DAUGHTER = "DAUGHTER",
  OTHER = "OTHER",
}

export enum DocumentType {
  ID_CARD = "ID_CARD",
  AADHAR_CARD = "AADHAR_CARD",
  PAN_CARD = "PAN_CARD",
  BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE",
  EDUCATION_CERTIFICATE = "EDUCATION_CERTIFICATE",
  LICENSE = "LICENSE",
}

// API-specific interfaces for the guard endpoint
export interface OfficerApiAddress {
  line1: string;
  line2?: string;
  city: string;
  district?: string;
  state: string;
  pinCode: string;
  landmark?: string;
  country: string;
  type: AddressType;
  isPrimary?: boolean;
}

export interface OfficerApiContact {
  phoneNumber: string;
  contactType: ContactType;
  isVerified?: boolean;
}

export interface EmergencyContact {
  contactName: string;
  relationship: string;
  phoneNumber: string;
}

export interface FamilyMember {
  relationshipType: RelationshipType;
  name: string;
}

export interface OfficerApiDocument {
  type: DocumentType;
  documentNumber?: string;
  issuedBy?: string;
  issuedDate?: string;
  expiryDate?: string;
  isVerified?: boolean;
}

// 🔥 FIXED: Employment interface to match backend DTO (single object)
export interface OfficerApiEmployment {
  position?: string;
  startDate?: string;
  assignedDutyArea?: string;
  areaManager?: string;
  assignedAreaId?: string;
  areaManagerId?: string;
  psaraStatus?: string;
  licenseNumber?: string;
  dateOfIssue?: string;
  validUntil?: string;
  validIn?: string;
}

// 🔥 FIXED: API request interface - changed employments to employment (single object)
export interface CreateOfficerRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
  email: string;
  phoneNumber: string;
  nationality?: string;
  sex?: Sex;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  identificationMark?: string;
  martialStatus?: MaritalStatus; // Note: API uses 'martialStatus' not 'maritalStatus'
  photo?: File; // File object for multipart
  status: GuardStatus;
  userType: UserType; // Always AREA_OFFICER for officers
  guardTypeId?: string; // 🔥 ADDED: Guard type ID required by backend API
  addresses?: OfficerApiAddress[];
  contacts?: OfficerApiContact[];
  emergencyContacts?: EmergencyContact[];
  familyMembers?: FamilyMember[];
  documents?: OfficerApiDocument[];
  employment?: OfficerApiEmployment; // 🔥 FIXED: Single employment object (not array)
}

// Officer form data types (updated to match guards structure)
export interface OfficerPersonalDetails {
  profilePhoto: File | null;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  dateOfBirth: string; // Only DOB, removed age fields
  sex: string;
  bloodGroup: string; // Dropdown selection
  nationality: string;
  height: string;
  heightUnit: string; // cm or ft
  weight: string;
  identificationMark: string;
  fatherName: string;
  motherName?: string; // Will be made mandatory in validation
  maritalStatus: string;
  spouseName?: string;
  spouseDob?: string; // Only DOB for spouse, removed age
}

export interface OfficerContactDetails {
  mobileNumber: string; // 10-digit number (backend adds +91)
  alternateNumber?: string; // 10-digit number (backend adds +91)
  emergencyContact: {
    firstName: string;
    middleName?: string;
    lastName: string;
    relationship: string;
    contactNumber: string; // 10-digit number (backend adds +91)
  };
}

export interface OfficerAddress {
  localAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    district: string;
    pincode: string;
    state: string;
    landmark?: string;
  };
  permanentAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    district: string;
    pincode: string;
    state: string;
    landmark?: string;
  };
  sameAsPermanent: boolean;
}

// Update the OfficerEmploymentDetails interface to include ID fields
export interface OfficerEmploymentDetails {
  companyId: string;
  dateOfJoining: string;
  designation: string;
  assignedDutyArea: string;
  assignedDutyAreaId?: string; // Store area ID separately for API calls
  areaManager: string;
  areaManagerId?: string; // Store manager ID separately for API calls
  referredBy: string;
  referralContactNumber: string; // 10-digit number (backend adds +91)
  relationshipWithOfficer: string;
  status: string;
  guardTypeId?: string; // 🔥 ADDED: Guard type ID (optional in form, will use default if not provided)
}

export interface OfficerDocumentVerification {
  documents: Array<{
    type: string;
    isSelected: boolean;
    // No file upload - just verification marking
  }>;
}

export interface OfficerFormData {
  personalDetails: OfficerPersonalDetails;
  contactDetails: OfficerContactDetails;
  address: OfficerAddress;
  employmentDetails: OfficerEmploymentDetails;
  documentVerification: OfficerDocumentVerification;
}

// Response types
export interface CreateOfficerResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: GuardStatus;
  userType: UserType;
  createdAt: string;
  updatedAt: string;
}

// API error response type
export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error?: string;
  details?: any;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Officer creation state for UI
export interface OfficerCreationState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  data: CreateOfficerResponse | null;
}
