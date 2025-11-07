// File: src/components/OfficerProfileWindow.tsx
import { Alert, Box, Button, CircularProgress, Divider, Snackbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useOfficers } from "../../../context/OfficerContext";
import {
  useOfficerProfile,
  useUpdateOfficerContactDetails,
  useUpdateOfficerEmergencyContact,
  useUpdateOfficerEmploymentDetails,
  useUpdateOfficerPersonalDetails,
} from "../../../hooks/useOfficerProfile";
import type { APIOfficerProfile } from "../../../service/officers-api.service";
import OfficerContactDetailsCard from "../../OfficerProfile-subComponents/OfficerContactDetailsCard";
import {
  OfficerContactDetailsEditDialog,
  OfficerEmergencyContactEditDialog,
  OfficerEmploymentDetailsEditDialog,
  OfficerPersonalDetailsEditDialog,
} from "../../OfficerProfile-subComponents/OfficerEditDialogs";
import OfficerEmergencyContactCard from "../../OfficerProfile-subComponents/OfficerEmergencyContactCard";
import OfficerEmploymentDetailsCard from "../../OfficerProfile-subComponents/OfficerEmploymentDetailsCard";
import OfficerPersonalDetailsCard from "../../OfficerProfile-subComponents/OfficerPersonalDetailsCard";
import OfficerVerifiedDocumentsCard from "../../OfficerProfile-subComponents/OfficerVerifiedDocumentsCard";

// Officer Profile Window Component with modular structure
const OfficerProfileWindow: React.FC = () => {
  const { officerId } = useParams<{ officerId: string }>();
  const { officers } = useOfficers();

  // officerId is already the guardId we need
  const guardId = officerId;
  const [agencyId, setAgencyId] = useState<string | null>(null);

  // API hooks - they now use guard ID directly
  const {
    data: officerProfileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useOfficerProfile(guardId || null, agencyId);

  // Update hooks for different sections
  const personalDetailsUpdate = useUpdateOfficerPersonalDetails();
  const contactDetailsUpdate = useUpdateOfficerContactDetails();
  const emergencyContactUpdate = useUpdateOfficerEmergencyContact();
  const employmentDetailsUpdate = useUpdateOfficerEmploymentDetails();

  // Local state for UI
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string>("");
  const [editFormData, setEditFormData] = useState<any>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Initialize agency ID
  useEffect(() => {
    if (officerId) {
      const officer = officers.find(o => o.guardId === officerId);
      if (officer) {
        setAgencyId(officer.currentAgencyId);

        console.log("🔍 Officer found for profile:", {
          name: officer.name,
          referenceId: officer.id,
          guardId: officer.guardId, // This is what we'll use for API calls
          agencyId: officer.currentAgencyId,
        });
      } else {
        console.warn(`Officer not found for ID: ${officerId}`);
      }
    }
  }, [officerId, officers]);

  // Show snackbar for update results
  useEffect(() => {
    if (
      personalDetailsUpdate.isSuccess ||
      contactDetailsUpdate.isSuccess ||
      emergencyContactUpdate.isSuccess ||
      employmentDetailsUpdate.isSuccess
    ) {
      setSnackbar({
        open: true,
        message: "Officer profile updated successfully!",
        severity: "success",
      });
      setEditDialogOpen(false);
    }
  }, [
    personalDetailsUpdate.isSuccess,
    contactDetailsUpdate.isSuccess,
    emergencyContactUpdate.isSuccess,
    employmentDetailsUpdate.isSuccess,
  ]);

  // Show error snackbar
  useEffect(() => {
    const error =
      personalDetailsUpdate.error ||
      contactDetailsUpdate.error ||
      emergencyContactUpdate.error ||
      employmentDetailsUpdate.error;

    if (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to update officer profile",
        severity: "error",
      });
    }
  }, [
    personalDetailsUpdate.error,
    contactDetailsUpdate.error,
    emergencyContactUpdate.error,
    employmentDetailsUpdate.error,
  ]);

  // Transform API data to display format
  const transformApiDataToDisplayFormat = (apiData: APIOfficerProfile) => {
    // Get addresses with proper null checks
    const permanentAddress = apiData.addresses?.find((addr) => addr.type === "PERMANENT");
    const localAddress = apiData.addresses?.find((addr) => addr.type === "CURRENT") || permanentAddress;

    // Get contacts with proper null checks
    const primaryContact = apiData.contacts?.find((contact) => contact.contactType === "PRIMARY");
    const alternateContact = apiData.contacts?.find((contact) => contact.contactType === "ALTERNATE");

    // Get family members with proper null checks and array validation
    const familyMembers = Array.isArray(apiData.familyMembers) ? apiData.familyMembers : [];
    const father = familyMembers.find((member) => member.relationshipType === "FATHER");
    const mother = familyMembers.find((member) => member.relationshipType === "MOTHER");
    const spouse = familyMembers.find((member) => member.relationshipType === "SPOUSE");

    // Get employment details with proper null checks
    const employments = Array.isArray(apiData.employments) ? apiData.employments : [];
    const currentEmployment = employments.find((emp) => emp.isCurrentEmployer);

    // Get documents with proper null checks
    const documents = Array.isArray(apiData.documents) ? apiData.documents : [];

    // Get emergency contacts with proper null checks
    const emergencyContacts = Array.isArray(apiData.emergencyContacts) ? apiData.emergencyContacts : [];

    return {
      personalDetails: {
        firstName: apiData.firstName || "",
        middleName: apiData.middleName || "",
        lastName: apiData.lastName || "",
        email: apiData.email || "",
        dateOfBirth: apiData.dateOfBirth || "",
        age: apiData.dateOfBirth
          ? Math.floor((Date.now() - new Date(apiData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : 0,
        sex: apiData.sex || "",
        bloodGroup: apiData.bloodGroup || "",
        nationality: apiData.nationality || "",
        height: apiData.height?.toString() || "",
        weight: apiData.weight?.toString() || "",
        identificationMark: apiData.identificationMark || "",
        fatherName: father?.name || "",
        motherName: mother?.name || "",
        maritalStatus:
          apiData.martialStatus === "MARRIED"
            ? "Married"
            : apiData.martialStatus === "SINGLE"
              ? "Single"
              : apiData.martialStatus === "DIVORCED"
                ? "Divorced"
                : apiData.martialStatus === "WIDOWED"
                  ? "Widowed"
                  : "Other",
        spouseName: spouse?.name || "",
        profilePhoto: apiData.photo || "",
      },
      contactDetails: {
        phoneNumber: primaryContact?.phoneNumber || apiData.phoneNumber || "",
        alternateNumber: alternateContact?.phoneNumber || "",
        emergencyContact: {
          firstName: emergencyContacts[0]?.contactName?.split(" ")[0] || "",
          lastName: emergencyContacts[0]?.contactName?.split(" ").slice(1).join(" ") || "",
          relationship: emergencyContacts[0]?.relationship || "",
          contactNumber: emergencyContacts[0]?.phoneNumber || "",
        },
      },
      address: {
        localAddress: {
          addressLine1: localAddress?.line1 || "",
          addressLine2: localAddress?.line2 || "",
          city: localAddress?.city || "",
          district: localAddress?.district || "",
          pincode: localAddress?.pinCode || "",
          state: localAddress?.state || "",
          landmark: localAddress?.landmark || "",
        },
        permanentAddress: {
          addressLine1: permanentAddress?.line1 || "",
          addressLine2: permanentAddress?.line2 || "",
          city: permanentAddress?.city || "",
          district: permanentAddress?.district || "",
          pincode: permanentAddress?.pinCode || "",
          state: permanentAddress?.state || "",
          landmark: permanentAddress?.landmark || "",
        },
      },
      employmentDetails: {
        companyId: apiData.currentAgencyId || "",
        dateOfJoining: currentEmployment?.startDate || "",
        designation: currentEmployment?.position || "Area Officer",
        assignedArea: currentEmployment?.assignedDutyArea || currentEmployment?.assignedArea || "Not assigned",
        areaManager: currentEmployment?.areaManager || "Not assigned",
      },
      documentVerification: {
        documents: {
          aadhaarCard: documents.some((doc) => doc.type === "AADHAR_CARD" || doc.type === "ID_CARD") || false,
          birthCertificate: documents.some((doc) => doc.type === "BIRTH_CERTIFICATE") || false,
          educationCertificate: documents.some((doc) => doc.type === "EDUCATION_CERTIFICATE") || false,
          panCard: documents.some((doc) => doc.type === "PAN_CARD") || false,
        },
      },
      upAndUpTrust: Math.random() * 2 + 3, // This would come from another API/calculation
    };
  };

  // Handle edit button click
  const handleEdit = (section: string) => {
    if (!officerProfileData) return;

    const displayData = transformApiDataToDisplayFormat(officerProfileData);
    setEditingSection(section);

    switch (section) {
      case "personal":
        setEditFormData({
          firstName: displayData.personalDetails.firstName,
          middleName: displayData.personalDetails.middleName,
          lastName: displayData.personalDetails.lastName,
          email: displayData.personalDetails.email,
          dateOfBirth: displayData.personalDetails.dateOfBirth
            ? displayData.personalDetails.dateOfBirth.split("T")[0]
            : "", // Extract date part only
          age: displayData.personalDetails.age,
          sex: displayData.personalDetails.sex,
          bloodGroup: displayData.personalDetails.bloodGroup,
          nationality: displayData.personalDetails.nationality,
          height: displayData.personalDetails.height,
          weight: displayData.personalDetails.weight,
          identificationMark: displayData.personalDetails.identificationMark,
          fatherName: displayData.personalDetails.fatherName,
          motherName: displayData.personalDetails.motherName,
          spouseName: displayData.personalDetails.spouseName,
          maritalStatus: displayData.personalDetails.maritalStatus,
        });
        break;
      case "contact":
        setEditFormData({
          phoneNumber: displayData.contactDetails.phoneNumber,
          alternateNumber: displayData.contactDetails.alternateNumber,
          localAddress: {
            addressLine1: displayData.address.localAddress.addressLine1,
            addressLine2: displayData.address.localAddress.addressLine2,
            city: displayData.address.localAddress.city,
            district: displayData.address.localAddress.district,
            pincode: displayData.address.localAddress.pincode, // Keep as pincode for form
            state: displayData.address.localAddress.state,
            landmark: displayData.address.localAddress.landmark,
          },
          permanentAddress: {
            addressLine1: displayData.address.permanentAddress.addressLine1,
            addressLine2: displayData.address.permanentAddress.addressLine2,
            city: displayData.address.permanentAddress.city,
            district: displayData.address.permanentAddress.district,
            pincode: displayData.address.permanentAddress.pincode, // Keep as pincode for form
            state: displayData.address.permanentAddress.state,
            landmark: displayData.address.permanentAddress.landmark,
          },
        });
        break;
      case "emergency":
        setEditFormData({
          contactName:
            `${displayData.contactDetails.emergencyContact.firstName} ${displayData.contactDetails.emergencyContact.lastName}`.trim(),
          relationship: displayData.contactDetails.emergencyContact.relationship,
          contactNumber: displayData.contactDetails.emergencyContact.contactNumber,
        });
        break;
      case "employment":
        setEditFormData({
          companyId: displayData.employmentDetails.companyId,
          dateOfJoining: displayData.employmentDetails.dateOfJoining
            ? displayData.employmentDetails.dateOfJoining.split("T")[0]
            : "",
          designation: displayData.employmentDetails.designation,
          assignedArea: displayData.employmentDetails.assignedArea,
          areaManager: displayData.employmentDetails.areaManager,
        });
        break;
      default:
        setEditFormData({});
    }
    setEditDialogOpen(true);
  };

  // Handle save changes using guard ID
  const handleSaveChanges = async () => {
    if (!guardId || !agencyId) {
      setSnackbar({
        open: true,
        message: "Missing guard or agency information",
        severity: "error",
      });
      return;
    }

    try {
      switch (editingSection) {
        case "personal":
          await personalDetailsUpdate.updatePersonalDetails(guardId, agencyId, {
            firstName: editFormData.firstName,
            middleName: editFormData.middleName,
            lastName: editFormData.lastName,
            email: editFormData.email,
            dateOfBirth: editFormData.dateOfBirth,
            sex: editFormData.sex,
            bloodGroup: editFormData.bloodGroup,
            nationality: editFormData.nationality,
            height: editFormData.height ? parseInt(editFormData.height) : undefined,
            weight: editFormData.weight ? parseInt(editFormData.weight) : undefined,
            identificationMark: editFormData.identificationMark,
            fatherName: editFormData.fatherName,
            motherName: editFormData.motherName,
            spouseName: editFormData.spouseName,
            maritalStatus: editFormData.maritalStatus,
          });
          break;

        case "contact":
          await contactDetailsUpdate.updateContactDetails(guardId, agencyId, {
            phoneNumber: editFormData.phoneNumber,
            alternateNumber: editFormData.alternateNumber,
            addresses: {
              permanent: {
                addressLine1: editFormData.permanentAddress?.addressLine1 || "",
                addressLine2: editFormData.permanentAddress?.addressLine2 || "",
                city: editFormData.permanentAddress?.city || "",
                district: editFormData.permanentAddress?.district || "",
                state: editFormData.permanentAddress?.state || "",
                pincode: editFormData.permanentAddress?.pincode || "", // Keep as pincode for form
                landmark: editFormData.permanentAddress?.landmark || "",
              },
              local: {
                addressLine1: editFormData.localAddress?.addressLine1 || "",
                addressLine2: editFormData.localAddress?.addressLine2 || "",
                city: editFormData.localAddress?.city || "",
                district: editFormData.localAddress?.district || "",
                state: editFormData.localAddress?.state || "",
                pincode: editFormData.localAddress?.pincode || "", // Keep as pincode for form
                landmark: editFormData.localAddress?.landmark || "",
              },
            },
          });
          break;

        case "emergency":
          await emergencyContactUpdate.updateEmergencyContact(guardId, agencyId, {
            contactName: editFormData.contactName,
            relationship: editFormData.relationship,
            phoneNumber: editFormData.contactNumber,
          });
          break;

        case "employment":
          await employmentDetailsUpdate.updateEmploymentDetails(guardId, agencyId, {
            position: editFormData.designation,
            startDate: editFormData.dateOfJoining,
            assignedArea: editFormData.assignedArea,
            designation: editFormData.designation,
            areaManager: editFormData.areaManager,
          });
          break;

        default:
          throw new Error("Unknown section for update");
      }
    } catch (error: any) {
      console.error("Error saving officer changes:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to save changes",
        severity: "error",
      });
    }
  };

  // Early return if guard ID is not available
  if (!guardId || !agencyId) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          padding: "24px",
          borderRadius: "12px",
          background: "#F7F7F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontSize: "20px",
            fontWeight: 500,
            color: "#707070",
          }}
        >
          Initializing officer profile...
        </Typography>
      </Box>
    );
  }

  // Loading state
  if (profileLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          padding: "24px",
          borderRadius: "12px",
          background: "#F7F7F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="primary" size={48} />
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontSize: "20px",
            fontWeight: 500,
            color: "#707070",
          }}
        >
          Loading officer profile...
        </Typography>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontSize: "14px",
            color: "#A0A0A0",
          }}
        >
          Fetching details using guard ID: {guardId}
        </Typography>
      </Box>
    );
  }

  // Error state
  if (profileError) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          padding: "24px",
          borderRadius: "12px",
          background: "#F7F7F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {profileError.message}
        </Alert>
        <Button
          variant="contained"
          onClick={() => refetchProfile()}
          sx={{
            backgroundColor: "#2A77D5",
            "&:hover": { backgroundColor: "#1E5AA3" },
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // No data state
  if (!officerProfileData) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          padding: "24px",
          borderRadius: "12px",
          background: "#F7F7F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontSize: "20px",
            fontWeight: 500,
            color: "#707070",
          }}
        >
          No officer profile data available
        </Typography>
      </Box>
    );
  }

  // Transform API data for display
  const displayData = transformApiDataToDisplayFormat(officerProfileData);

  const isUpdating =
    personalDetailsUpdate.isLoading ||
    contactDetailsUpdate.isLoading ||
    emergencyContactUpdate.isLoading ||
    employmentDetailsUpdate.isLoading;

  return (
    <Box
      sx={{
        width: "1052px",
        minHeight: "840px",
        padding: "24px",
        borderRadius: "12px",
        background: "#F7F7F7",
      }}
    >
      {/* Main Content Container */}
      <Box
        sx={{
          width: "1020px",
          height: "808px",
          margin: "0 auto",
          gap: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Content Heading */}
        <Box sx={{ width: "1020px", height: "32px", gap: "8px" }}>
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "24px",
              lineHeight: "32px",
              textTransform: "capitalize",
              color: "#3B3B3B",
              mb: "8px",
            }}
          >
            Officer Profile
          </Typography>
          <Divider sx={{ borderColor: "#FFFFFF", width: "1020px" }} />
        </Box>

        {/* Content */}
        <Box
          sx={{
            width: "1020px",
            height: "752px",
            display: "flex",
            gap: "12px",
          }}
        >
          {/* Left Frame - Cards */}
          <Box
            sx={{
              flex: "1 1 700px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
              alignContent: "start",
            }}
          >
            {/* Personal Details Card */}
            <OfficerPersonalDetailsCard
              personalDetails={displayData.personalDetails}
              onEdit={() => handleEdit("personal")}
              isUpdating={isUpdating}
            />

            {/* Contact Details Card */}
            <OfficerContactDetailsCard
              contactDetails={displayData.contactDetails}
              address={displayData.address}
              onEdit={() => handleEdit("contact")}
              isUpdating={isUpdating}
            />

            {/* Emergency Contact Card */}
            <OfficerEmergencyContactCard
              emergencyContact={displayData.contactDetails.emergencyContact}
              onEdit={() => handleEdit("emergency")}
              isUpdating={isUpdating}
            />

            {/* Employment Details Card */}
            <OfficerEmploymentDetailsCard
              employmentDetails={displayData.employmentDetails}
              onEdit={() => handleEdit("employment")}
              isUpdating={isUpdating}
            />
          </Box>

          {/* Right Frame - Verified Documents */}
          <OfficerVerifiedDocumentsCard
            documents={displayData.documentVerification.documents}
            upAndUpTrust={displayData.upAndUpTrust}
          />
        </Box>
      </Box>

      {/* Edit Dialogs */}
      <OfficerPersonalDetailsEditDialog
        open={editDialogOpen && editingSection === "personal"}
        onClose={() => setEditDialogOpen(false)}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveChanges}
        isLoading={isUpdating}
      />

      <OfficerContactDetailsEditDialog
        open={editDialogOpen && editingSection === "contact"}
        onClose={() => setEditDialogOpen(false)}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveChanges}
        isLoading={isUpdating}
      />

      <OfficerEmergencyContactEditDialog
        open={editDialogOpen && editingSection === "emergency"}
        onClose={() => setEditDialogOpen(false)}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveChanges}
        isLoading={isUpdating}
      />

      <OfficerEmploymentDetailsEditDialog
        open={editDialogOpen && editingSection === "employment"}
        onClose={() => setEditDialogOpen(false)}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveChanges}
        isLoading={isUpdating}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OfficerProfileWindow;
