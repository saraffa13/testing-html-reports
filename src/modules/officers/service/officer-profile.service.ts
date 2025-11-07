// File: src/services/officer-profile.service.ts
import { guardsApi } from "../../../config/axios";
import type { APIOfficerProfile } from "./officers-api.service";
import { formatDateForBackend } from "@modules/clients/utils/dateFormatUtils";

// Profile update request interfaces (IDENTICAL to guard interfaces)
export interface OfficerPersonalDetailsUpdate {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  sex?: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: string;
  nationality?: string;
  height?: number;
  weight?: number;
  identificationMark?: string;
  martialStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
}

export interface OfficerContactDetailsUpdate {
  phoneNumber?: string;
  alternateNumber?: string;
  addresses?: {
    local?: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      district?: string;
      state: string;
      pincode: string; // Form uses pincode
      landmark?: string;
    };
    permanent?: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      district?: string;
      state: string;
      pincode: string; // Form uses pincode
      landmark?: string;
    };
  };
}

export interface OfficerEmergencyContactUpdate {
  contactName?: string;
  relationship?: string;
  phoneNumber?: string;
}

export interface OfficerEmploymentDetailsUpdate {
  position?: string;
  startDate?: string;
  assignedArea?: string;
  designation?: string;
  areaManager?: string;
}

// Family members update
export interface OfficerFamilyMembersUpdate {
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
}

// Complete update request interface
export interface OfficerProfileUpdateRequest {
  personalDetails?: OfficerPersonalDetailsUpdate;
  contactDetails?: OfficerContactDetailsUpdate;
  emergencyContact?: OfficerEmergencyContactUpdate;
  employmentDetails?: OfficerEmploymentDetailsUpdate;
  familyMembers?: OfficerFamilyMembersUpdate;
}

// API Response interfaces
export interface OfficerProfileResponse {
  success: boolean;
  data: APIOfficerProfile;
  timestamp: string;
}

export interface UpdateOfficerResponse {
  success: boolean;
  data: APIOfficerProfile;
  message: string;
  timestamp: string;
}

// Helper function to convert date string to backend DateTime format - IDENTICAL to guard service
const formatDateToISO = (dateString: string): string => {
  if (!dateString) return dateString;

  // If it's already in the new backend format, return as is
  if (dateString.includes("T") && dateString.includes("+05:30")) {
    return dateString;
  }

  // If it's just a date (YYYY-MM-DD), convert to backend DateTime format
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(dateString + "T00:00:00");
    return formatDateForBackend(date);
  }

  // If it's another format, try to parse and convert
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return formatDateForBackend(date);
    }
  } catch (error) {
    console.warn("Invalid date format:", dateString);
  }

  return dateString; // Return original if can't parse
};

// Format phone numbers (ensure consistent +91 format) - IDENTICAL to guard service
const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return phoneNumber;

  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // If it already has +91, return as is
  if (cleaned.startsWith("+91")) {
    return cleaned;
  }

  // If it's a 10-digit number starting with 6-9, add +91 prefix
  if (cleaned.length === 10 && cleaned.match(/^[6-9]/)) {
    return `+91${cleaned}`;
  }

  // If it's 12 digits starting with 91, add + prefix
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }

  // Return as is for other formats
  return cleaned;
};

// Officer Profile API Service
export const officerProfileService = {
  // Get officer profile by ID
  getOfficerProfile: async (officerId: string, agencyId: string): Promise<APIOfficerProfile> => {
    try {
      console.log(`🔄 Fetching officer profile: ${officerId} for agency: ${agencyId}`);

      const response = await guardsApi.get<OfficerProfileResponse>(
        `/guards/${officerId}?agencyId=${encodeURIComponent(agencyId)}`
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch officer profile");
      }

      console.log(
        `✅ Officer profile fetched successfully: ${response.data.data.firstName} ${response.data.data.lastName}`
      );

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch officer profile:", error);

      if (error.response?.status === 404) {
        throw new Error("Officer not found");
      } else if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("You do not have permission to view this officer's profile.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK" || !error.response) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.response?.data?.message || "Failed to fetch officer profile.");
      }
    }
  },

  // Update officer profile
  updateOfficerProfile: async (
    officerId: string,
    agencyId: string,
    updateData: OfficerProfileUpdateRequest
  ): Promise<APIOfficerProfile> => {
    try {
      console.log(`🔄 Updating officer profile: ${officerId}`, updateData);

      // Transform the update data to match API expectations
      const apiUpdateData = officerProfileService.transformUpdateDataForAPI(updateData);

      console.log(`📤 Sending officer API update data:`, apiUpdateData);

      const response = await guardsApi.patch<UpdateOfficerResponse>(
        `/guards/${officerId}?agencyId=${encodeURIComponent(agencyId)}`,
        apiUpdateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update officer profile");
      }

      console.log(`✅ Officer profile updated successfully: ${officerId}`);

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to update officer profile:", error);
      console.error("❌ Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 404) {
        throw new Error("Officer not found");
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMessage = "Invalid data provided. Please check all fields.";

        if (errorData?.message) {
          if (typeof errorData.message === "string") {
            errorMessage = errorData.message;
          } else if (Array.isArray(errorData.message)) {
            errorMessage = `Validation errors: ${errorData.message.join(", ")}`;
          }
        }

        // Check if there are specific errors in the response
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          const specificErrors = errorData.errors
            .map((err: any) => {
              if (typeof err === "string") return err;
              if (err.message) return err.message;
              if (err.constraints) return Object.values(err.constraints).join(", ");
              return JSON.stringify(err);
            })
            .join(", ");
          errorMessage = `Validation failed: ${specificErrors}`;
        }

        console.error("🔍 Detailed 400 error:", errorData);
        throw new Error(errorMessage);
      } else if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("You do not have permission to update this officer's profile.");
      } else if (error.response?.status === 409) {
        throw new Error("Conflict: The data you're trying to update conflicts with existing data.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK" || !error.response) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.response?.data?.message || "Failed to update officer profile.");
      }
    }
  },

  transformUpdateDataForAPI: (updateData: OfficerProfileUpdateRequest): any => {
    const apiData: any = {};

    apiData.userType = "AREA_OFFICER";

    // Personal details transformation - IDENTICAL to guard service
    if (updateData.personalDetails) {
      const personalDetails = { ...updateData.personalDetails };

      // Convert date string to ISO-8601 DateTime if present
      if (personalDetails.dateOfBirth) {
        personalDetails.dateOfBirth = formatDateToISO(personalDetails.dateOfBirth);
      }

      // Only include fields that have values to avoid overriding with empty data
      Object.keys(personalDetails).forEach((key) => {
        const value = personalDetails[key as keyof OfficerPersonalDetailsUpdate];
        if (value !== undefined && value !== null && value !== "") {
          apiData[key] = value;
        }
      });
    }

    // Contact details transformation - IDENTICAL to guard service
    if (updateData.contactDetails) {
      if (updateData.contactDetails.phoneNumber) {
        apiData.phoneNumber = formatPhoneNumber(updateData.contactDetails.phoneNumber);
      }

      // Handle contacts array for alternate numbers
      if (updateData.contactDetails.phoneNumber || updateData.contactDetails.alternateNumber) {
        apiData.contacts = [];

        // Add primary contact
        if (updateData.contactDetails.phoneNumber) {
          apiData.contacts.push({
            phoneNumber: formatPhoneNumber(updateData.contactDetails.phoneNumber),
            contactType: "PRIMARY",
            isVerified: false,
          });
        }

        // Add alternate contact
        if (updateData.contactDetails.alternateNumber) {
          apiData.contacts.push({
            phoneNumber: formatPhoneNumber(updateData.contactDetails.alternateNumber),
            contactType: "ALTERNATE",
            isVerified: false,
          });
        }
      }

      // Handle addresses - IDENTICAL to guard service
      if (updateData.contactDetails.addresses) {
        apiData.addresses = [];

        // Add permanent address
        if (updateData.contactDetails.addresses.permanent) {
          const addr = updateData.contactDetails.addresses.permanent;
          // Only add if it has the required fields
          if (addr.addressLine1 && addr.city && addr.state && addr.pincode) {
            apiData.addresses.push({
              line1: addr.addressLine1,
              line2: addr.addressLine2 || "",
              city: addr.city,
              district: addr.district || "",
              state: addr.state,
              pinCode: addr.pincode, // Note: API uses pinCode, not pincode
              landmark: addr.landmark || "",
              type: "PERMANENT",
              isPrimary: true,
              country: "India",
            });
          }
        }

        // Add local address
        if (updateData.contactDetails.addresses.local) {
          const addr = updateData.contactDetails.addresses.local;
          // Only add if it has the required fields
          if (addr.addressLine1 && addr.city && addr.state && addr.pincode) {
            apiData.addresses.push({
              line1: addr.addressLine1,
              line2: addr.addressLine2 || "",
              city: addr.city,
              district: addr.district || "",
              state: addr.state,
              pinCode: addr.pincode, // Note: API uses pinCode, not pincode
              landmark: addr.landmark || "",
              type: "CURRENT",
              isPrimary: false,
              country: "India",
            });
          }
        }

        // If no valid addresses, don't send the addresses array
        if (apiData.addresses.length === 0) {
          delete apiData.addresses;
        }
      }
    }

    // Emergency contact transformation - IDENTICAL to guard service
    if (updateData.emergencyContact) {
      const ec = updateData.emergencyContact;
      if (ec.contactName && ec.phoneNumber) {
        apiData.emergencyContacts = [
          {
            contactName: ec.contactName.trim(),
            relationship: ec.relationship || "Other",
            phoneNumber: formatPhoneNumber(ec.phoneNumber),
          },
        ];
      }
    }

    // Family members transformation - IDENTICAL to guard service
    if (updateData.familyMembers) {
      const familyMembers = [];

      if (updateData.familyMembers.fatherName && updateData.familyMembers.fatherName.trim()) {
        familyMembers.push({
          relationshipType: "FATHER",
          name: updateData.familyMembers.fatherName.trim(),
        });
      }

      if (updateData.familyMembers.motherName && updateData.familyMembers.motherName.trim()) {
        familyMembers.push({
          relationshipType: "MOTHER",
          name: updateData.familyMembers.motherName.trim(),
        });
      }

      if (updateData.familyMembers.spouseName && updateData.familyMembers.spouseName.trim()) {
        familyMembers.push({
          relationshipType: "SPOUSE",
          name: updateData.familyMembers.spouseName.trim(),
        });
      }

      // Always include family members array, even if empty (to clear existing data)
      apiData.familyMembers = familyMembers;
    }

    // Employment details - Enhanced to include area and manager
    if (updateData.employmentDetails) {
      const emp = updateData.employmentDetails;

      // For employment details, we need to send as single employment object (not array)
      // This matches the API DTO structure
      if (emp.position || emp.startDate || emp.assignedArea || emp.areaManager) {
        apiData.employment = {
          position: emp.position || null,
          startDate: emp.startDate ? formatDateToISO(emp.startDate) : null,
          assignedDutyArea: emp.assignedArea || null,
          areaManager: emp.areaManager || null,
        };
      }
    }

    console.log("🔄 Transformed officer API data with preserved userType:", apiData);
    return apiData;
  },

  // Validation methods - IDENTICAL to guard service
  validatePersonalDetails: (data: OfficerPersonalDetailsUpdate): string[] => {
    const errors: string[] = [];

    if (data.firstName && data.firstName.trim().length < 2) {
      errors.push("First name must be at least 2 characters long");
    }

    if (data.lastName && data.lastName.trim().length < 2) {
      errors.push("Last name must be at least 2 characters long");
    }

    if (data.height && (data.height < 100 || data.height > 250)) {
      errors.push("Height must be between 100-250 cm");
    }

    if (data.weight && (data.weight < 30 || data.weight > 200)) {
      errors.push("Weight must be between 30-200 kg");
    }

    // Validate date format
    if (data.dateOfBirth) {
      try {
        const date = new Date(data.dateOfBirth);
        if (isNaN(date.getTime())) {
          errors.push("Invalid date format for date of birth");
        }
      } catch (error) {
        errors.push("Invalid date format for date of birth");
      }
    }

    return errors;
  },

  validateContactDetails: (data: OfficerContactDetailsUpdate): string[] => {
    const errors: string[] = [];

    if (data.phoneNumber) {
      const phoneRegex = /^(\+91[6-9]\d{9}|[6-9]\d{9})$/;
      if (!phoneRegex.test(data.phoneNumber.replace(/[\s\-\(\)]/g, ""))) {
        errors.push("Phone number must be a valid Indian number");
      }
    }

    if (data.alternateNumber) {
      const phoneRegex = /^(\+91[6-9]\d{9}|[6-9]\d{9})$/;
      if (!phoneRegex.test(data.alternateNumber.replace(/[\s\-\(\)]/g, ""))) {
        errors.push("Alternate number must be a valid Indian number");
      }
    }

    // Only validate addresses if they are being updated
    if (data.addresses?.permanent) {
      const pa = data.addresses.permanent;
      if (pa.addressLine1 && pa.addressLine1.trim().length < 5) {
        errors.push("Address line 1 must be at least 5 characters long");
      }
      if (pa.city && pa.city.trim().length < 2) {
        errors.push("City is required");
      }
      if (pa.state && pa.state.trim().length < 2) {
        errors.push("State is required");
      }
      if (pa.pincode && !/^\d{6}$/.test(pa.pincode)) {
        errors.push("Pin code must be a 6-digit number");
      }
    }

    return errors;
  },

  validateEmergencyContact: (data: OfficerEmergencyContactUpdate): string[] => {
    const errors: string[] = [];

    if (data.contactName && data.contactName.trim().length < 2) {
      errors.push("Emergency contact name must be at least 2 characters long");
    }

    if (data.phoneNumber) {
      const phoneRegex = /^(\+91[6-9]\d{9}|[6-9]\d{9})$/;
      if (!phoneRegex.test(data.phoneNumber.replace(/[\s\-\(\)]/g, ""))) {
        errors.push("Emergency contact number must be a valid Indian number");
      }
    }

    return errors;
  },

  // Updated validation method that only validates the section being updated
  validateUpdateData: (updateData: OfficerProfileUpdateRequest): string[] => {
    let errors: string[] = [];

    if (updateData.personalDetails) {
      errors = errors.concat(officerProfileService.validatePersonalDetails(updateData.personalDetails));
    }

    if (updateData.contactDetails) {
      errors = errors.concat(officerProfileService.validateContactDetails(updateData.contactDetails));
    }

    if (updateData.emergencyContact) {
      errors = errors.concat(officerProfileService.validateEmergencyContact(updateData.emergencyContact));
    }

    return errors;
  },
};
