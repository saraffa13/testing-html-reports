export type AgencyUserRole = "ADMIN" | "MANAGER" | "STAFF" | "READONLY";

export type Status = "ACTIVE" | "SUSPENDED";

export interface AgencyUser {
  id: string;
  opAgencyId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: AgencyUserRole;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agency {
  id: string;
  agencyName: string;
  agencyImageUrl: string | null;
  registrationNumber: string | null;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  city: string;
  state: string;
  pinCode: string;
  platformSubscriptionTier: string | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}
