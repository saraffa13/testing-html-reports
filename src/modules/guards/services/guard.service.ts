// File: src/services/guard.service.ts - Fixed with enhanced error handling

import { authApi, guardsApi } from "../../../config/axios";
import {
  AddressType,
  ContactType,
  type CreateGuardRequest,
  type CreateGuardResponse,
  DocumentType,
  type GuardFormData,
  GuardStatus,
  MaritalStatus,
  RelationshipType,
  Sex,
} from "../types/guard.types";
import { formatDateForBackend } from "@modules/clients/utils/dateFormatUtils";

// Format phone numbers (ensure consistent +91 format)
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

// Helper function to create a proper file name for profile photo
const generateProfilePhotoFileName = (firstName: string, lastName: string, originalFile: File): string => {
  const timestamp = Date.now();
  const cleanFirstName = firstName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const cleanLastName = lastName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  // Get file extension from original file - with safety check
  let fileExtension = "jpg"; // Default fallback
  if (originalFile.name && typeof originalFile.name === "string") {
    const parts = originalFile.name.split(".");
    fileExtension = parts.length > 1 ? parts.pop() || "jpg" : "jpg";
  } else if (originalFile.type) {
    // Try to get extension from MIME type if name is not available
    const mimeToExt: { [key: string]: string } = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    };
    fileExtension = mimeToExt[originalFile.type] || "jpg";
  }

  return `${cleanFirstName}_${cleanLastName}_${timestamp}.${fileExtension}`;
};

// Transform form data to API request format
const transformFormDataToApiRequest = (formData: GuardFormData): CreateGuardRequest => {
  const { personalDetails, contactDetails, address, employmentDetails, documentVerification } = formData;

  // Handle date of birth - only DOB now, no age
  if (!personalDetails.dateOfBirth) {
    throw new Error("Date of birth is required");
  }

  // Convert date of birth to backend format
  const dateOfBirth = personalDetails.dateOfBirth;
  const formattedDateOfBirth = dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)
    ? formatDateForBackend(new Date(dateOfBirth + "T00:00:00"))
    : dateOfBirth;

  // Use the provided email or generate one if empty
  let email = personalDetails.email?.trim();
  if (!email) {
    const firstName = personalDetails.firstName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const lastName = personalDetails.lastName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    email = `${firstName}.${lastName}@guardservice.com`;
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
      type: AddressType.LOCAL,
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
  if (contactDetails.alternateNumber) {
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

  // Build documents metadata array - NO FILES, just metadata for selected documents
  const documents = [];

  // Process document verification - only include selected documents (no files)
  documentVerification.documents.forEach((doc) => {
    if (doc.isSelected) {
      // Create document metadata without files
      documents.push({
        type: DocumentType.ID_CARD, // Using ID_CARD for all documents as requested
        documentNumber: `${doc.type.toUpperCase()}_VERIFIED_${Date.now()}`,
        documentUrl: "", // Empty since no file uploads
        issuedBy: "Government Authority",
        issuedDate: dateOfBirth,
        expiryDate: "2099-12-31",
        isVerified: true, // Mark as verified since they're selected
      });
    }
  });

  // Add license document if applicable
  if (employmentDetails.licenseNumber && employmentDetails.licenseNumber.trim()) {
    documents.push({
      type: DocumentType.LICENSE,
      documentNumber: employmentDetails.licenseNumber.trim(),
      documentUrl: "", // Empty since no file uploads
      issuedBy: employmentDetails.validIn || "Licensing Authority",
      issuedDate: employmentDetails.dateOfIssue || dateOfBirth,
      expiryDate: employmentDetails.validUntil || "2099-12-31",
      isVerified: true,
    });
  }

  // Map form values to backend enum values
  const genderMapping: { [key: string]: Sex } = {
    Male: Sex.MALE,
    Female: Sex.FEMALE,
    Other: Sex.OTHER,
  };

  const maritalStatusMapping: { [key: string]: MaritalStatus } = {
    Single: MaritalStatus.SINGLE,
    Married: MaritalStatus.MARRIED,
    Divorced: MaritalStatus.DIVORCED,
    "Widow/Widower": MaritalStatus.WIDOWED,
  };

  // Map guard status from form to API enum
  const guardStatusMapping: { [key: string]: GuardStatus } = {
    PENDING: GuardStatus.PENDING,
    ACTIVE: GuardStatus.ACTIVE,
    INACTIVE: GuardStatus.INACTIVE,
    SUSPENDED: GuardStatus.SUSPENDED,
    OTHER: GuardStatus.OTHER,
  };

  // Map PSARA status from form to API enum
  const psaraStatusMapping: { [key: string]: string } = {
    Pending: "PENDING",
    Completed: "COMPLETED",
  };

  // Get status from employment details, default to ACTIVE
  const guardStatus = employmentDetails.status
    ? guardStatusMapping[employmentDetails.status] || GuardStatus.ACTIVE
    : GuardStatus.ACTIVE;

  // Handle profile photo with proper filename
  let processedProfilePhoto: File | undefined = undefined;
  if (personalDetails.profilePhoto) {
    const newFileName = generateProfilePhotoFileName(
      personalDetails.firstName,
      personalDetails.lastName,
      personalDetails.profilePhoto
    );

    // Create a new File with the proper name
    processedProfilePhoto = new File([personalDetails.profilePhoto], newFileName, {
      type: personalDetails.profilePhoto.type,
    });

    console.log("Profile photo processed:", {
      originalName: personalDetails.profilePhoto.name,
      newName: newFileName,
      size: personalDetails.profilePhoto.size,
      type: personalDetails.profilePhoto.type,
    });
  }

  // Convert height with unit
  let heightInCm: number | undefined;
  if (personalDetails.height && personalDetails.heightUnit) {
    const heightValue = parseFloat(personalDetails.height);
    if (personalDetails.heightUnit === "ft") {
      heightInCm = Math.round(heightValue * 30.48); // Convert feet to cm
    } else {
      heightInCm = Math.round(heightValue); // Already in cm
    }
  }

  // Build employment object as required by API
  const employment = {
    licenseNumber: employmentDetails.licenseNumber?.trim() || "",
    dateOfIssue: employmentDetails.dateOfIssue || "",
    psaraStatus: employmentDetails.psaraCertificationStatus
      ? psaraStatusMapping[employmentDetails.psaraCertificationStatus] || "PENDING"
      : "PENDING",
    validUntil: employmentDetails.validUntil || "",
    validIn: employmentDetails.validIn?.trim() || "",
  };

  // Build the API request object
  const apiRequest: CreateGuardRequest = {
    firstName: personalDetails.firstName.trim(),
    lastName: personalDetails.lastName.trim(),
    dateOfBirth: formattedDateOfBirth,
    email,
    phoneNumber: formattedPhoneNumber,
    status: guardStatus,
    userType: "GUARD",

    // Add guardTypeId field as required by API
    guardTypeId: employmentDetails.guardTypeId?.trim() || "",

    // Add employment object as required by API
    employment,

    // Add files array (empty since no file uploads but required by API)
    files: [],

    // Optional fields
    ...(personalDetails.middleName?.trim() && { middleName: personalDetails.middleName.trim() }),
    ...(personalDetails.nationality?.trim() && { nationality: personalDetails.nationality.trim() }),
    ...(personalDetails.sex && genderMapping[personalDetails.sex] && { sex: genderMapping[personalDetails.sex] }),
    ...(personalDetails.bloodGroup?.trim() && { bloodGroup: personalDetails.bloodGroup.trim() }),
    ...(heightInCm && { height: heightInCm }),
    ...(personalDetails.weight && { weight: parseInt(personalDetails.weight) }),
    ...(personalDetails.identificationMark?.trim() && {
      identificationMark: personalDetails.identificationMark.trim(),
    }),
    ...(personalDetails.maritalStatus &&
      maritalStatusMapping[personalDetails.maritalStatus] && {
        martialStatus: maritalStatusMapping[personalDetails.maritalStatus],
      }),
    ...(processedProfilePhoto && { photo: processedProfilePhoto }),
    ...(addresses.length > 0 && { addresses }),
    ...(contacts.length > 0 && { contacts }),
    ...(emergencyContacts.length > 0 && { emergencyContacts }),
    ...(familyMembers.length > 0 && { familyMembers }),
    ...(documents.length > 0 && { documents }),
  };

  return apiRequest;
};

// Transform API request to FormData for multipart upload
const transformToFormData = (apiRequest: CreateGuardRequest): FormData => {
  const formData = new FormData();

  // Add basic fields
  formData.append("firstName", apiRequest.firstName);
  formData.append("lastName", apiRequest.lastName);
  formData.append("dateOfBirth", apiRequest.dateOfBirth);
  formData.append("email", apiRequest.email);
  formData.append("phoneNumber", apiRequest.phoneNumber);
  formData.append("status", apiRequest.status);
  formData.append("userType", apiRequest.userType);

  // Add guardTypeId field
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

  // Handle photo upload with enhanced filename handling
  if (apiRequest.photo) {
    console.log("Processing photo for upload:", {
      originalName: apiRequest.photo.name,
      size: apiRequest.photo.size,
      type: apiRequest.photo.type,
      isFile: apiRequest.photo instanceof File,
    });

    let finalFile = apiRequest.photo;
    let finalFileName = apiRequest.photo.name;

    // Multiple checks for invalid filenames
    const invalidNames = ["undefined", "null", "", "blob"];
    const isInvalidName =
      !finalFileName || invalidNames.includes(finalFileName.toLowerCase()) || finalFileName.trim() === "";

    if (isInvalidName) {
      console.log("Invalid filename detected, generating new one...");

      // Generate a proper filename
      const timestamp = Date.now();
      const firstName = apiRequest.firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const lastName = apiRequest.lastName.toLowerCase().replace(/[^a-z0-9]/g, "");

      // Determine extension from MIME type
      let extension = "jpg"; // default fallback
      if (apiRequest.photo.type) {
        const mimeToExtension: { [key: string]: string } = {
          "image/jpeg": "jpg",
          "image/jpg": "jpg",
          "image/png": "png",
          "image/gif": "gif",
          "image/webp": "webp",
          "image/bmp": "bmp",
          "image/svg+xml": "svg",
          "image/tiff": "tiff",
        };
        extension = mimeToExtension[apiRequest.photo.type] || "jpg";
      }

      finalFileName = `${firstName}_${lastName}_profile_${timestamp}.${extension}`;

      // Create a new File object with the correct name
      finalFile = new File([apiRequest.photo], finalFileName, {
        type: apiRequest.photo.type,
        lastModified: apiRequest.photo.lastModified || Date.now(),
      });

      console.log("Generated new filename:", {
        oldName: apiRequest.photo.name,
        newName: finalFileName,
        extension: extension,
        mimeType: apiRequest.photo.type,
      });
    }

    // Append to FormData with explicit filename parameter
    formData.append("photo", finalFile, finalFileName);

    console.log("Photo added to FormData:", {
      fieldName: "photo",
      fileName: finalFileName,
      fileSize: finalFile.size,
      fileType: finalFile.type,
      isFileInstance: finalFile instanceof File,
    });
  } else {
    console.log("No photo provided for upload");
  }

  // Add JSON arrays as strings
  if (apiRequest.addresses) formData.append("addresses", JSON.stringify(apiRequest.addresses));
  if (apiRequest.contacts) formData.append("contacts", JSON.stringify(apiRequest.contacts));
  if (apiRequest.emergencyContacts) formData.append("emergencyContacts", JSON.stringify(apiRequest.emergencyContacts));
  if (apiRequest.familyMembers) formData.append("familyMembers", JSON.stringify(apiRequest.familyMembers));
  if (apiRequest.documents) formData.append("documents", JSON.stringify(apiRequest.documents));

  // Add employment object as JSON
  if (apiRequest.employment) {
    formData.append("employment", JSON.stringify(apiRequest.employment));
  }

  // Final verification log
  console.log("FormData creation complete. Total entries:", Array.from(formData.entries()).length);
  console.log("Documents metadata only (no files):", apiRequest.documents?.length || 0, "documents");
  console.log("Employment object added:", !!apiRequest.employment);
  console.log("Files array omitted (not expected by backend validation)");

  return formData;
};

// Guard Types API Service
export const guardTypesService = {
  // Get all guard types for an agency
  getGuardTypes: async (agencyId: string): Promise<GuardType[]> => {
    try {
      console.log("Fetching guard types for agency:", agencyId);

      const response = await authApi.get(`/settings/guard-types/${agencyId}`);

      console.log("Guard types API response:", response.data);

      // Extract data from the nested response structure
      const guardTypes = response.data?.data || response.data || [];

      console.log("Guard types extracted:", guardTypes);
      return guardTypes as GuardType[];
    } catch (error: any) {
      console.error("Failed to fetch guard types:", error);

      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }
      if (error.response?.status === 404) {
        throw new Error("Guard types not found for this agency.");
      }

      throw new Error("Failed to fetch guard types.");
    }
  },
};

// GuardType interface to match actual API response
interface GuardType {
  id: string;
  typeName: string; // Changed from 'name' to 'typeName'
  agencyId: string;
  createdAt: string;
  updatedAt: string;
  // Note: isActive field doesn't exist in API response, so we'll treat all as active
}

export const guardService = {
  // Create a new guard using multipart/form-data
  createGuard: async (formData: GuardFormData): Promise<CreateGuardResponse> => {
    // Extract agency ID from employment details (company ID)
    const agencyId = formData.employmentDetails.companyId;

    if (!agencyId || !agencyId.trim()) {
      throw new Error("Company ID is required and will be used as Agency ID");
    }
    try {
      // Validate form data before transformation
      const validationErrors = guardService.validateFormData(formData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      // Transform form data to API request format
      const apiRequest = transformFormDataToApiRequest(formData);

      // Transform to FormData for multipart upload
      const multipartData = transformToFormData(apiRequest);

      // Log the FormData contents for debugging
      console.log("Sending multipart form data:");
      for (const [key, value] of multipartData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Log important fields
      console.log("Key API fields:", {
        userType: apiRequest.userType,
        status: apiRequest.status,
        guardTypeId: apiRequest.guardTypeId,
        employment: apiRequest.employment,
        agencyId: agencyId,
        hasPhoto: !!apiRequest.photo,
        photoName: apiRequest.photo?.name,
        documentsCount: apiRequest.documents?.length || 0,
        filesArrayOmitted: true,
        noFileUploads: true,
      });

      // Make the API request with multipart/form-data
      const response = await guardsApi.post<CreateGuardResponse>(
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
      console.error("Guard creation error:", error);

      // Enhanced error handling with specific phone number duplicate detection
      if (error.response) {
        const errorData = error.response.data;

        console.error("Detailed error response:", {
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
                // Check for phone number duplicate error
                if (
                  errorData.message.toLowerCase().includes("phone") &&
                  (errorData.message.toLowerCase().includes("already") ||
                    errorData.message.toLowerCase().includes("exists"))
                ) {
                  errorMessage =
                    "This phone number is already registered with another guard. Please use a different number.";
                } else if (
                  errorData.message.toLowerCase().includes("email") &&
                  (errorData.message.toLowerCase().includes("already") ||
                    errorData.message.toLowerCase().includes("exists"))
                ) {
                  errorMessage = "This email address is already registered. Please use a different email.";
                } else {
                  errorMessage = errorData.message;
                }
              } else if (Array.isArray(errorData.message)) {
                errorMessage = `Validation errors: ${errorData.message.join(", ")}`;
              }
            }
            throw new Error(errorMessage);
          case 401:
            throw new Error("Unauthorized. Please login again.");
          case 403:
            throw new Error("You do not have permission to create guards.");
          case 409:
            // Handle duplicate conflicts specifically
            if (errorData?.message?.toLowerCase().includes("phone")) {
              throw new Error(
                "This phone number is already registered with another guard. Please use a different number."
              );
            } else if (errorData?.message?.toLowerCase().includes("email")) {
              throw new Error("This email address is already registered. Please use a different email.");
            } else {
              throw new Error("A guard with this information already exists.");
            }
          case 422:
            throw new Error("Invalid data format. Please check your input.");
          case 500:
            throw new Error("Server error. Please try again later.");
          default:
            throw new Error(errorData?.message || "An unexpected error occurred.");
        }
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK" || !error.response) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw error;
      }
    }
  },

  // Validate form data before submission
  validateFormData: (formData: GuardFormData): string[] => {
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
    if (!formData.contactDetails.mobileNumber?.trim()) {
      errors.push("Mobile number is required");
    }
    if (!formData.contactDetails.emergencyContact.firstName?.trim()) {
      errors.push("Emergency contact first name is required");
    }
    if (!formData.contactDetails.emergencyContact.lastName?.trim()) {
      errors.push("Emergency contact last name is required");
    }
    if (!formData.contactDetails.emergencyContact.relationship?.trim()) {
      errors.push("Emergency contact relationship is required");
    }
    if (!formData.contactDetails.emergencyContact.contactNumber?.trim()) {
      errors.push("Emergency contact number is required");
    }

    // Address validations
    if (!formData.address.permanentAddress.addressLine1?.trim()) {
      errors.push("Permanent address line 1 is required");
    }
    if (!formData.address.permanentAddress.city?.trim()) {
      errors.push("Permanent address city is required");
    }
    if (!formData.address.permanentAddress.state?.trim()) {
      errors.push("Permanent address state is required");
    }
    if (!formData.address.permanentAddress.pincode?.trim()) {
      errors.push("Permanent address pincode is required");
    }

    // Employment validations
    if (!formData.employmentDetails.companyId?.trim()) {
      errors.push("Company ID is required");
    }
    if (!formData.employmentDetails.guardTypeId?.trim()) {
      errors.push("Guard type is required");
    }

    // Phone number format validation
    const phoneRegex = /^(\+91[6-9]\d{9}|[6-9]\d{9})$/;

    if (
      formData.contactDetails.mobileNumber &&
      !phoneRegex.test(formData.contactDetails.mobileNumber.replace(/[\s\-\(\)]/g, ""))
    ) {
      errors.push("Mobile number must be a valid Indian number");
    }

    if (
      formData.contactDetails.emergencyContact.contactNumber &&
      !phoneRegex.test(formData.contactDetails.emergencyContact.contactNumber.replace(/[\s\-\(\)]/g, ""))
    ) {
      errors.push("Emergency contact number must be a valid Indian number");
    }

    // Document validation - UPDATED: Only require at least one mandatory document
    const selectedDocuments = formData.documentVerification.documents.filter((doc) => doc.isSelected);

    if (selectedDocuments.length === 0) {
      errors.push("Please select at least one document for verification");
      return errors; // Return early if no documents selected
    }

    // Check if at least one mandatory document is selected
    const mandatoryDocTypes = ["aadhaar", "pan"]; // Only these are truly mandatory
    const selectedMandatoryDocs = selectedDocuments.filter((doc) => mandatoryDocTypes.includes(doc.type));

    if (selectedMandatoryDocs.length === 0) {
      errors.push("Please select at least one mandatory document (Aadhaar Card or PAN Card)");
    }

    return errors;
  },

  // Get all guards
  getGuards: async (agencyId: string, page: number = 1, limit: number = 10, search?: string): Promise<any> => {
    try {
      const params = new URLSearchParams({
        agencyId,
        page: page.toString(),
        limit: limit.toString(),
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
      throw new Error("Failed to fetch guards.");
    }
  },

  // Get guard by ID
  getGuardById: async (id: string, agencyId: string): Promise<any> => {
    try {
      const response = await guardsApi.get(`/guards/${id}?agencyId=${agencyId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Guard not found.");
      }
      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }
      throw new Error("Failed to fetch guard details.");
    }
  },
};
