// File: src/types/auth.types.ts
export enum UserType {
  AGENCY_USER = 'AGENCY_USER',
  GUARD = 'GUARD',
}

export interface User {
  id: string;
  email: string;
  type: UserType;
  firstName: string;
  lastName: string;
  agencyId?: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface AgencyLoginRequest {
  email: string;
  password: string;
}

export interface GuardLoginRequest {
  phoneNumber: string;
  otp: string;
}
