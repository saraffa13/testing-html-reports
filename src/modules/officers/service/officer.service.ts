// File: src/services/officer.service.ts
import { guardsApi } from "../../../config/axios";
import { formatDateForBackend } from "@modules/clients/utils/dateFormatUtils";
import {
  AddressType,
  ContactType,
  DocumentType,
  GuardStatus,
  MaritalStatus,
  RelationshipType,
  Sex,
  UserType,
  type CreateOfficerRequest,
  type CreateOfficerResponse,
  type OfficerApiDocument,
  type OfficerFormData,
} from "../types/officers.types";

// Format phone numbers for API (backend expects 10 digits with +91 prefix)
const formatPhoneNumber = (phoneNumber: string): string => {
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

// Transform form data to API request format
const transformFormDataToApiRequest = (formData: OfficerFormData): CreateOfficerRequest => {
  const { personalDetails, contactDetails, address, employmentDetails, documentVerification } = formData;

  // Handle date of birth (only DOB, no age option)
  const dateOfBirth = personalDetails.dateOfBirth;
  if (!dateOfBirth) {
    throw new Error("Date of birth is required");
  }

  // Convert date of birth to backend format
  const formattedDateOfBirth = dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)
    ? formatDateForBackend(new Date(dateOfBirth + "T00:00:00"))
    : dateOfBirth;

  // Use the provided email (now required in officer form)
  const email = personalDetails.email.trim();
  if (!email) {
    throw new Error("Email is required for officers");
  }

  const formattedPhoneNumber = formatPhoneNumber(contactDetails.mobileNumber);
  const formattedEmergencyPhone = formatPhoneNumber(contactDetails.emergencyContact.contactNumber);

  // Build addresses array
  const addresses = [];

  // Always add permanent address first (mapped from permanent address form)
  addresses.push({
    line1: address.permanentAddress.addressLine1.trim(),
    line2: address.permanentAddress.addressLine2?.trim() || "",
    city: address.permanentAddress.city.trim(),
    district: address.permanentAddress.district?.trim() || "",
    state: address.permanentAddress.state.trim(),
    pinCode: address.permanentAddress.pincode.trim(),
    landmark: address.permanentAddress.landmark?.trim() || "",
    country: "India",
    type: AddressType.PERMANENT,
    isPrimary: true,
  });

  // Add local address if different from permanent
  if (!address.sameAsPermanent && address.localAddress) {
    addresses.push({
      line1: address.localAddress.addressLine1.trim(),
      line2: address.localAddress.addressLine2?.trim() || "",
      city: address.localAddress.city.trim(),
      district: address.localAddress.district?.trim() || "",
      state: address.localAddress.state.trim(),
      pinCode: address.localAddress.pincode.trim(),
      landmark: address.localAddress.landmark?.trim() || "",
      country: "India",
      type: AddressType.CURRENT,
      isPrimary: false,
    });
  }

  // Build contacts array
  const contacts = [
    {
      phoneNumber: formattedPhoneNumber,
      contactType: ContactType.PERSONAL,
      isVerified: false,
    },
  ];

  // Add alternate contact if provided
  if (contactDetails.alternateNumber?.trim()) {
    const formattedAlternatePhone = formatPhoneNumber(contactDetails.alternateNumber);
    contacts.push({
      phoneNumber: formattedAlternatePhone,
      contactType: ContactType.ALTERNATE,
      isVerified: false,
    });
  }

  // Build emergency contacts array
  const emergencyContacts = [
    {
      contactName: `${contactDetails.emergencyContact.firstName.trim()} ${contactDetails.emergencyContact.lastName.trim()}`,
      relationship: contactDetails.emergencyContact.relationship.trim(),
      phoneNumber: formattedEmergencyPhone,
    },
  ];

  // Build family members array
  const familyMembers = [];

  if (personalDetails.fatherName && personalDetails.fatherName.trim()) {
    familyMembers.push({
      relationshipType: RelationshipType.FATHER,
      name: personalDetails.fatherName.trim(),
    });
  }

  // Add mother if provided
  if (personalDetails.motherName && personalDetails.motherName.trim()) {
    familyMembers.push({
      relationshipType: RelationshipType.MOTHER,
      name: personalDetails.motherName.trim(),
    });
  }

  // Add spouse if married
  if (personalDetails.maritalStatus === "Married" && personalDetails.spouseName && personalDetails.spouseName.trim()) {
    familyMembers.push({
      relationshipType: RelationshipType.SPOUSE,
      name: personalDetails.spouseName.trim(),
    });
  }

  // Build documents metadata array - No file uploads, just verification status
  const documents: OfficerApiDocument[] = [];

  // Process document verification - only include selected documents
  documentVerification.documents.forEach((doc) => {
    if (doc.isSelected) {
      // Create document metadata
      documents.push({
        type: DocumentType.ID_CARD, // Using ID_CARD for all documents as requested
        documentNumber: `${doc.type.toUpperCase()}_VERIFIED`,
        issuedBy: "Government Authority",
        issuedDate: dateOfBirth,
        expiryDate: "2099-12-31",
        isVerified: true, // Mark as verified since it was selected
      });
    }
  });

  // Map form values to backend enum values
  const genderMapping: { [key: string]: Sex } = {
    Male: Sex.MALE,
    Female: Sex.FEMALE,
    Other: Sex.OTHER,
  };

  const officerStatusMapping: { [key: string]: GuardStatus } = {
    PENDING: GuardStatus.PENDING,
    ACTIVE: GuardStatus.ACTIVE,
    INACTIVE: GuardStatus.INACTIVE,
    SUSPENDED: GuardStatus.SUSPENDED,
    OTHER: GuardStatus.OTHER,
  };

  const maritalStatusMapping: { [key: string]: MaritalStatus } = {
    Single: MaritalStatus.SINGLE,
    Married: MaritalStatus.MARRIED,
    Divorced: MaritalStatus.DIVORCED,
    "Widow/Widower": MaritalStatus.WIDOWED,
  };
  const officerStatus = formData.employmentDetails.status
    ? officerStatusMapping[formData.employmentDetails.status] || GuardStatus.ACTIVE
    : GuardStatus.ACTIVE;

  // 🔥 FIXED: Build employment as single object (not array)
  let employment = undefined;
  if (employmentDetails.designation && employmentDetails.dateOfJoining) {
    employment = {
      position: employmentDetails.designation.trim(),
      startDate: employmentDetails.dateOfJoining,
      ...(employmentDetails.assignedDutyArea?.trim() && {
        assignedDutyArea: employmentDetails.assignedDutyArea.trim(),
      }),
      ...(employmentDetails.areaManager?.trim() && { areaManager: employmentDetails.areaManager.trim() }),
      ...(employmentDetails.assignedDutyAreaId?.trim() && {
        assignedAreaId: employmentDetails.assignedDutyAreaId.trim(),
      }),
      ...(employmentDetails.areaManagerId?.trim() && { areaManagerId: employmentDetails.areaManagerId.trim() }),
    };
  }

  // 🔥 CRITICAL: Guard Type ID handling for officers
  // TODO: This should be fetched from guard types API or selected in the form
  // For now, using a default value to satisfy backend validation
  const guardTypeId = employmentDetails.guardTypeId?.trim() || "OFFICER";

  // Build the API request object
  const apiRequest: CreateOfficerRequest = {
    firstName: personalDetails.firstName.trim(),
    lastName: personalDetails.lastName.trim(),
    dateOfBirth: formattedDateOfBirth,
    email,
    phoneNumber: formattedPhoneNumber,
    status: officerStatus, // Officers are typically active by default
    userType: UserType.AREA_OFFICER, // 🔥 CRITICAL: Always AREA_OFFICER for officers - CANNOT be overridden
    guardTypeId, // 🔥 ADDED: Required by backend API
    // Optional fields
    ...(personalDetails.middleName?.trim() && { middleName: personalDetails.middleName.trim() }),
    ...(personalDetails.nationality?.trim() && { nationality: personalDetails.nationality.trim() }),
    ...(personalDetails.sex && genderMapping[personalDetails.sex] && { sex: genderMapping[personalDetails.sex] }),
    ...(personalDetails.bloodGroup?.trim() && { bloodGroup: personalDetails.bloodGroup.trim() }),
    ...(personalDetails.height && { height: parseInt(personalDetails.height) }),
    ...(personalDetails.weight && { weight: parseInt(personalDetails.weight) }),
    ...(personalDetails.identificationMark?.trim() && {
      identificationMark: personalDetails.identificationMark.trim(),
    }),
    ...(personalDetails.maritalStatus &&
      maritalStatusMapping[personalDetails.maritalStatus] && {
        martialStatus: maritalStatusMapping[personalDetails.maritalStatus],
      }),
    ...(personalDetails.profilePhoto && { photo: personalDetails.profilePhoto }),
    ...(addresses.length > 0 && { addresses }),
    ...(contacts.length > 0 && { contacts }),
    ...(emergencyContacts.length > 0 && { emergencyContacts }),
    ...(familyMembers.length > 0 && { familyMembers }),
    ...(documents.length > 0 && { documents }),
    // 🔥 FIXED: Use single employment object instead of array
    ...(employment && { employment }),
    // No files array - documents are verification only
  };

  return apiRequest;
};

// Transform API request to FormData for multipart upload
const transformToFormData = (apiRequest: CreateOfficerRequest): FormData => {
  const formData = new FormData();

  // Add basic fields
  formData.append("firstName", apiRequest.firstName);
  formData.append("lastName", apiRequest.lastName);
  formData.append("dateOfBirth", apiRequest.dateOfBirth);
  formData.append("email", apiRequest.email);
  formData.append("phoneNumber", apiRequest.phoneNumber);
  formData.append("status", apiRequest.status);
  formData.append("userType", apiRequest.userType);

  // 🔥 ADDED: Add guardTypeId field (required by backend API)
  if (apiRequest.guardTypeId) {
    formData.append("guardTypeId", apiRequest.guardTypeId);
  }

  // Add optional fields
  if (apiRequest.middleName) formData.append("middleName", apiRequest.middleName);
  if (apiRequest.nationality) formData.append("nationality", apiRequest.nationality);
  if (apiRequest.sex) formData.append("sex", apiRequest.sex);
  if (apiRequest.bloodGroup) formData.append("bloodGroup", apiRequest.bloodGroup);
  if (apiRequest.height) formData.append("height", apiRequest.height.toString());
  if (apiRequest.weight) formData.append("weight", apiRequest.weight.toString());
  if (apiRequest.identificationMark) formData.append("identificationMark", apiRequest.identificationMark);
  if (apiRequest.martialStatus) formData.append("martialStatus", apiRequest.martialStatus);

  // Add profile photo
  if (apiRequest.photo) {
    formData.append("photo", apiRequest.photo);
  }

  // Add JSON arrays as strings
  if (apiRequest.addresses) formData.append("addresses", JSON.stringify(apiRequest.addresses));
  if (apiRequest.contacts) formData.append("contacts", JSON.stringify(apiRequest.contacts));
  if (apiRequest.emergencyContacts) formData.append("emergencyContacts", JSON.stringify(apiRequest.emergencyContacts));
  if (apiRequest.familyMembers) formData.append("familyMembers", JSON.stringify(apiRequest.familyMembers));
  if (apiRequest.documents) formData.append("documents", JSON.stringify(apiRequest.documents));

  // 🔥 FIXED: Send employment as single object, not array
  if (apiRequest.employment) formData.append("employment", JSON.stringify(apiRequest.employment));

  // No files to append - documents are verification only

  return formData;
};

export const officerService = {
  // Create a new officer using multipart/form-data
  createOfficer: async (formData: OfficerFormData): Promise<CreateOfficerResponse> => {
    // Extract agency ID from employment details (company ID)
    const agencyId = formData.employmentDetails.companyId;

    if (!agencyId || !agencyId.trim()) {
      throw new Error("Company ID is required and will be used as Agency ID");
    }

    try {
      // Validate form data before transformation
      const validationErrors = officerService.validateFormData(formData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      // Transform form data to API request format
      const apiRequest = transformFormDataToApiRequest(formData);

      // Transform to FormData for multipart upload
      const multipartData = transformToFormData(apiRequest);

      // 🔥 CRITICAL: Verify userType is AREA_OFFICER before sending
      if (apiRequest.userType !== UserType.AREA_OFFICER) {
        throw new Error(`Invalid userType: Expected ${UserType.AREA_OFFICER}, got ${apiRequest.userType}`);
      }
      console.log("✅ UserType verified as AREA_OFFICER for officer creation");

      // Log the FormData contents for debugging
      console.log("📤 Sending officer multipart form data:");
      for (const [key, value] of multipartData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Special log for userType and guardTypeId to ensure they're correct
      console.log(`🔥 UserType being sent: ${apiRequest.userType}`);
      console.log(`🔥 GuardTypeId being sent: ${apiRequest.guardTypeId}`);

      // Log document count (no files)
      const documentsCount = apiRequest.documents?.length || 0;
      console.log(`📊 Documents verified count: ${documentsCount}`);

      // 🔥 FIXED: Log employment data (single object)
      if (apiRequest.employment) {
        console.log(`💼 Employment record:`, {
          position: apiRequest.employment.position,
          startDate: apiRequest.employment.startDate,
          assignedDutyArea: apiRequest.employment.assignedDutyArea,
          areaManager: apiRequest.employment.areaManager,
        });
      } else {
        console.log(`💼 No employment data provided`);
      }

      // Make the API request with multipart/form-data
      const response = await guardsApi.post<CreateOfficerResponse>(
        `/guards?agencyId=${encodeURIComponent(agencyId)}`,
        multipartData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ Officer creation error:", error);

      // Enhanced error handling
      if (error.response) {
        const errorData = error.response.data;

        console.error("🔍 Detailed error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: errorData,
        });

        // Handle validation errors from backend
        if (errorData?.message && Array.isArray(errorData.message)) {
          throw new Error(`Validation failed: ${errorData.message.join(", ")}`);
        }

        // Handle specific HTTP status codes
        switch (error.response.status) {
          case 400:
            let errorMessage = "Invalid data provided. Please check all fields.";
            if (errorData?.message) {
              if (typeof errorData.message === "string") {
                errorMessage = errorData.message;
              } else if (Array.isArray(errorData.message)) {
                errorMessage = `Validation errors: ${errorData.message.join(", ")}`;
              }
            }
            throw new Error(errorMessage);
          case 401:
            throw new Error("Unauthorized. Please login again.");
          case 403:
            throw new Error("You do not have permission to create officers.");
          case 409:
            throw new Error("An officer with this information already exists.");
          case 422:
            throw new Error("Invalid data format. Please check your input.");
          case 500:
            throw new Error("Server error. Please try again later.");
          default:
            throw new Error(errorData?.message || "An unexpected error occurred.");
        }
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK" || !error.response) {
        throw new Error("Network error. Please check your connection");
      } else {
        throw error;
      }
    }
  },

  validateFormData: (formData: OfficerFormData): string[] => {
    const errors: string[] = [];

    // Required field validations
    if (!formData.personalDetails.firstName?.trim()) {
      errors.push("First name is required");
    }
    if (!formData.personalDetails.lastName?.trim()) {
      errors.push("Last name is required");
    }
    if (!formData.personalDetails.email?.trim()) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(formData.personalDetails.email)) {
        errors.push("Invalid email format");
      }
    }
    if (!formData.personalDetails.dateOfBirth) {
      errors.push("Date of birth is required");
    }
    if (!formData.personalDetails.motherName?.trim()) {
      errors.push("Mother's name is required");
    }
    if (!formData.contactDetails.mobileNumber?.trim()) {
      errors.push("Mobile number is required");
    }
    if (!formData.contactDetails.emergencyContact.firstName?.trim()) {
      errors.push("Emergency contact first name is required");
    }
    if (!formData.contactDetails.emergencyContact.lastName?.trim()) {
      errors.push("Emergency contact last name is required");
    }
    if (!formData.contactDetails.emergencyContact.contactNumber?.trim()) {
      errors.push("Emergency contact number is required");
    }

    // Address validations
    if (!formData.address.permanentAddress.addressLine1?.trim()) {
      errors.push("Permanent address line 1 is required");
    }
    if (!formData.address.permanentAddress.addressLine2?.trim()) {
      errors.push("Permanent address line 2 is required");
    }
    if (!formData.address.permanentAddress.city?.trim()) {
      errors.push("Permanent address city is required");
    }
    if (!formData.address.permanentAddress.district?.trim()) {
      errors.push("Permanent address district is required");
    }
    if (!formData.address.permanentAddress.state?.trim()) {
      errors.push("Permanent address state is required");
    }
    if (!formData.address.permanentAddress.pincode?.trim()) {
      errors.push("Permanent address pincode is required");
    }
    if (!formData.address.permanentAddress.landmark?.trim()) {
      errors.push("Permanent address landmark is required");
    }

    // Validate local address if not same as permanent
    if (!formData.address.sameAsPermanent) {
      if (!formData.address.localAddress.addressLine1?.trim()) {
        errors.push("Local address line 1 is required");
      }
      if (!formData.address.localAddress.addressLine2?.trim()) {
        errors.push("Local address line 2 is required");
      }
      if (!formData.address.localAddress.city?.trim()) {
        errors.push("Local address city is required");
      }
      if (!formData.address.localAddress.district?.trim()) {
        errors.push("Local address district is required");
      }
      if (!formData.address.localAddress.state?.trim()) {
        errors.push("Local address state is required");
      }
      if (!formData.address.localAddress.pincode?.trim()) {
        errors.push("Local address pincode is required");
      }
      if (!formData.address.localAddress.landmark?.trim()) {
        errors.push("Local address landmark is required");
      }
    }

    // Phone number format validation (10 digits, backend adds +91)
    const phoneRegex = /^[6-9]\d{9}$/;

    if (
      formData.contactDetails.mobileNumber &&
      !phoneRegex.test(formData.contactDetails.mobileNumber.replace(/[\s\-\(\)]/g, ""))
    ) {
      errors.push("Mobile number must be a valid 10-digit Indian number starting with 6-9");
    }

    if (
      formData.contactDetails.emergencyContact.contactNumber &&
      !phoneRegex.test(formData.contactDetails.emergencyContact.contactNumber.replace(/[\s\-\(\)]/g, ""))
    ) {
      errors.push("Emergency contact number must be a valid 10-digit Indian number starting with 6-9");
    }

    // Validate referral contact number if provided (optional)
    if (
      formData.employmentDetails.referralContactNumber &&
      !phoneRegex.test(formData.employmentDetails.referralContactNumber.replace(/[\s\-\(\)]/g, ""))
    ) {
      errors.push("Referral contact number must be a valid 10-digit Indian number starting with 6-9");
    }

    // Document validation - UPDATED: Check for at least one mandatory document selected
    const selectedDocuments = formData.documentVerification.documents.filter((doc) => doc.isSelected);
    const mandatoryDocTypes = ["aadhaar", "birth", "education", "pan"];
    const selectedMandatoryDocs = selectedDocuments.filter((doc) => mandatoryDocTypes.includes(doc.type));

    if (selectedMandatoryDocs.length === 0) {
      errors.push(
        "Please select at least one mandatory document: Aadhaar Card, Birth Certificate, Education Certificate, or PAN Card"
      );
    }

    // Employment details validation
    if (!formData.employmentDetails.companyId?.trim()) {
      errors.push("Company ID is required");
    }
    if (!formData.employmentDetails.designation?.trim()) {
      errors.push("Designation is required");
    }
    if (!formData.employmentDetails.assignedDutyArea?.trim()) {
      errors.push("Assigned duty area is required");
    }
    if (!formData.employmentDetails.areaManager?.trim()) {
      errors.push("Area manager is required");
    }

    // UserType validation - Officers MUST be AREA_OFFICER
    console.log("Officer form validation: UserType will be enforced as AREA_OFFICER in service layer");

    return errors;
  },

  // Get all officers (same endpoint as guards, filtered by userType)
  getOfficers: async (agencyId: string, page: number = 1, limit: number = 10, search?: string): Promise<any> => {
    try {
      const params = new URLSearchParams({
        agencyId,
        page: page.toString(),
        limit: limit.toString(),
        userType: UserType.AREA_OFFICER, // Filter for officers only
      });

      if (search) {
        params.append("search", search);
      }

      const response = await guardsApi.get(`/guards?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }
      throw new Error("Failed to fetch officers.");
    }
  },

  // Get officer by ID
  getOfficerById: async (id: string, agencyId: string): Promise<any> => {
    try {
      const response = await guardsApi.get(`/guards/${id}?agencyId=${agencyId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Officer not found.");
      }
      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }
      throw new Error("Failed to fetch officer details.");
    }
  },
};
