// File: src/types/guard.types.ts - Updated with new API fields

// Enums for various guard-related types
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

export enum AddressType {
  PERMANENT = "PERMANENT",
  LOCAL = "LOCAL",
}

export enum ContactType {
  PERSONAL = "PERSONAL",
  ALTERNATE = "ALTERNATE",
}

export enum DocumentType {
  ID_CARD = "ID_CARD",
  LICENSE = "LICENSE",
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

// 🔥 NEW: PSARA Status Enum
export enum PSARAStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

// Address interface
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  district?: string;
  state: string;
  pinCode: string;
  landmark?: string;
  country: string;
  type: AddressType;
  isPrimary: boolean;
}

// Contact interface
export interface Contact {
  phoneNumber: string;
  contactType: ContactType;
  isVerified: boolean;
}

// Emergency contact interface
export interface EmergencyContact {
  contactName: string;
  relationship: string;
  phoneNumber: string;
}

// Family member interface
export interface FamilyMember {
  relationshipType: RelationshipType;
  name: string;
}

// Document interface
export interface Document {
  type: DocumentType;
  documentNumber: string;
  documentUrl?: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
  isVerified: boolean;
}

// 🔥 NEW: Employment interface as required by API
export interface Employment {
  licenseNumber?: string;
  dateOfIssue?: string;
  psaraStatus: PSARAStatus | string;
  validUntil?: string;
  validIn?: string;
}

// Form data interfaces (frontend structure)
export interface PersonalDetails {
  profilePhoto: File | null;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  sex: string;
  bloodGroup: string;
  nationality: string;
  height: string;
  heightUnit: string;
  weight: string;
  identificationMark: string;
  fatherName: string;
  motherName: string;
  maritalStatus: string;
  spouseName?: string;
  spouseDob?: string;
}

export interface ContactDetails {
  mobileNumber: string;
  alternateNumber?: string;
  emergencyContact: {
    firstName: string;
    middleName?: string;
    lastName: string;
    relationship: string;
    contactNumber: string;
  };
}

export interface AddressDetails {
  localAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    district: string;
    pincode: string;
    state: string;
    landmark: string;
  };
  permanentAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    district: string;
    pincode: string;
    state: string;
    landmark: string;
  };
  sameAsPermanent: boolean;
}

export interface EmploymentDetails {
  companyId: string;
  dateOfJoining: string;
  referredBy?: string;
  referralContactNumber?: string;
  relationshipWithGuard?: string;
  guardTypeId: string; // Guard type ID
  psaraCertificationStatus: string;
  status: string;
  isExDefense: boolean;
  licenseNumber?: string;
  dateOfIssue?: string;
  validUntil?: string;
  validIn?: string;
}

export interface DocumentVerification {
  documents: Array<{
    type: string;
    isSelected: boolean;
  }>;
}

// Complete form data structure
export interface GuardFormData {
  personalDetails: PersonalDetails;
  contactDetails: ContactDetails;
  address: AddressDetails;
  employmentDetails: EmploymentDetails;
  documentVerification: DocumentVerification;
}

// API request interface (backend structure)
export interface CreateGuardRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  status: GuardStatus | string;
  userType: string;

  // Required fields as per API
  guardTypeId: string; // Guard type ID
  employment: Employment; // Employment object
  files: string[]; // Files array (empty since no file uploads)

  // Optional fields
  middleName?: string;
  nationality?: string;
  sex?: Sex;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  identificationMark?: string;
  martialStatus?: MaritalStatus;
  photo?: File;
  addresses?: Address[];
  contacts?: Contact[];
  emergencyContacts?: EmergencyContact[];
  familyMembers?: FamilyMember[];
  documents?: Document[];
}

// API response interface
export interface CreateGuardResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: GuardStatus;
  userType: string;
  guardType?: string;
  createdAt: string;
  updatedAt: string;
  agencyId: string;
  // Include other fields as needed
}

// 🔥 NEW: Guard Type interface for API
export interface GuardType {
  id: string;
  typeName: string; // 🔥 FIX: Changed from 'name' to 'typeName' to match API
  agencyId: string;
  createdAt: string;
  updatedAt: string;
  // Note: isActive field doesn't exist in API response, so we'll treat all as active
}

// 🔥 NEW: Guard Types API Response
export interface GuardTypesResponse {
  guardTypes: GuardType[];
  total: number;
}

// Error interface
export interface GuardError {
  message: string;
  field?: string;
  code?: string;
}
