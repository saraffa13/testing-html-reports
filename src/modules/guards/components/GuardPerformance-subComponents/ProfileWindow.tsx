// File: src/components/ProfileWindow.tsx
import { Alert, Box, Button, CircularProgress, Divider, Snackbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGuards } from "../../context/GuardContext";
import {
  useGuardProfile,
  useUpdateContactDetails,
  useUpdateEmergencyContact,
  useUpdateEmploymentDetails,
  useUpdatePersonalDetails,
} from "../../hooks/useGuardProfile";
import type { APIGuard } from "../../services/guards-api.service";
import ContactDetailsCard from "../GuardProfile-subComponents/ContactDetailsCard";
import {
  ContactDetailsEditDialog,
  EmergencyContactEditDialog,
  EmploymentDetailsEditDialog,
  PersonalDetailsEditDialog,
} from "../GuardProfile-subComponents/EditDialogs";
import EmergencyContactCard from "../GuardProfile-subComponents/EmergencyContactCard";
import EmploymentDetailsCard from "../GuardProfile-subComponents/EmploymentDetailsCard";
import PersonalDetailsCard from "../GuardProfile-subComponents/PersonalDetailsCard";
import VerifiedDocumentsCard from "../GuardProfile-subComponents/VerifiedDocumentsCard";

// Profile Window Component with modular structure
const ProfileWindow: React.FC = () => {
  const { guardId } = useParams<{ guardId: string }>();
  const { guards } = useGuards();

  // State for guard identification
  const [agencyId, setAgencyId] = useState<string | null>(null);

  // API hooks
  const {
    data: guardProfileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useGuardProfile(guardId || null, agencyId);

  // Update hooks for different sections
  const personalDetailsUpdate = useUpdatePersonalDetails();
  const contactDetailsUpdate = useUpdateContactDetails();
  const emergencyContactUpdate = useUpdateEmergencyContact();
  const employmentDetailsUpdate = useUpdateEmploymentDetails();

  // Local state for UI
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string>("");
  const [editFormData, setEditFormData] = useState<any>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Initialize guard ID and agency ID from context
  useEffect(() => {
    if (guardId) {
      const guard = guards.find(g => g.id === guardId);
      if (guard) {
        setAgencyId(guard.companyId);
        console.log(`✅ Agency ID set from guard context: ${guard.companyId}`);
      } else {
        console.warn(`⚠️ Guard not found in context for ID: ${guardId}`);
      }
    }
  }, [guardId, guards]);

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
        message: "Profile updated successfully!",
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
        message: error.message || "Failed to update profile",
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
  const transformApiDataToDisplayFormat = (apiData: APIGuard) => {
    // Get addresses
    const permanentAddress = apiData.addresses?.find((addr) => addr.type === "PERMANENT");
    const localAddress = apiData.addresses?.find((addr) => addr.type === "TEMPORARY") || permanentAddress;

    // Get contacts
    const primaryContact = apiData.contacts?.find((contact) => contact.contactType === "PRIMARY");
    const alternateContact = apiData.contacts?.find((contact) => contact.contactType === "ALTERNATE");

    // Get family members
    const father = apiData.familyMembers?.find((member) => member.relationshipType === "FATHER");
    const mother = apiData.familyMembers?.find((member) => member.relationshipType === "MOTHER");
    const spouse = apiData.familyMembers?.find((member) => member.relationshipType === "SPOUSE");

    // Get employment details
    const currentEmployment = apiData.employments?.find((emp) => emp.isCurrentEmployer);

    return {
      personalDetails: {
        firstName: apiData.firstName,
        middleName: apiData.middleName || "",
        lastName: apiData.lastName,
        dateOfBirth: apiData.dateOfBirth,
        age: Math.floor((Date.now() - new Date(apiData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
        sex: apiData.sex,
        bloodGroup: apiData.bloodGroup,
        nationality: apiData.nationality,
        height: apiData.height?.toString() || "",
        weight: apiData.weight?.toString() || "",
        identificationMark: apiData.identificationMark || "",
        fatherName: father?.name || "",
        motherName: mother?.name || "",
        maritalStatus:
          apiData.martialStatus === "MARRIED" ? "Married" : apiData.martialStatus === "SINGLE" ? "Single" : "Other",
        spouseName: spouse?.name || "",
        profilePhoto: apiData.photo,
      },
      contactDetails: {
        mobileNumber: primaryContact?.phoneNumber || apiData.phoneNumber,
        alternateNumber: alternateContact?.phoneNumber || "",
        emergencyContact: {
          firstName: apiData.emergencyContacts?.[0]?.contactName?.split(" ")[0] || "",
          lastName: apiData.emergencyContacts?.[0]?.contactName?.split(" ").slice(1).join(" ") || "",
          relationship: apiData.emergencyContacts?.[0]?.relationship || "",
          contactNumber: apiData.emergencyContacts?.[0]?.phoneNumber || "",
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
        companyId: apiData.currentAgency?.name || apiData.currentAgencyId,
        dateOfJoining: currentEmployment?.startDate || "",
        guardType: apiData.guardType || currentEmployment?.position || "Security Guard",
        psaraCertificationStatus: currentEmployment?.psaraStatus || "PENDING",
      },
      documentVerification: {
        documents: {
          aadhaarCard: apiData.documents?.some((doc) => doc.type === "AADHAR_CARD") || false,
          birthCertificate: apiData.documents?.some((doc) => doc.type === "BIRTH_CERTIFICATE") || false,
          educationCertificate: apiData.documents?.some((doc) => doc.type === "EDUCATION_CERTIFICATE") || false,
          panCard: apiData.documents?.some((doc) => doc.type === "PAN_CARD") || false,
        },
      },
      upAndUpTrust: Math.random() * 2 + 3, // This would come from another API/calculation
    };
  };

  // Handle edit button click
  const handleEdit = (section: string) => {
    if (!guardProfileData) return;

    const displayData = transformApiDataToDisplayFormat(guardProfileData);
    setEditingSection(section);

    switch (section) {
      case "personal":
        setEditFormData({
          firstName: displayData.personalDetails.firstName,
          middleName: displayData.personalDetails.middleName,
          lastName: displayData.personalDetails.lastName,
          dateOfBirth: displayData.personalDetails.dateOfBirth.split("T")[0], // Extract date part only
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
          mobileNumber: displayData.contactDetails.mobileNumber,
          alternateNumber: displayData.contactDetails.alternateNumber,
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
          guardType: guardProfileData.guardType || "", // Use the actual guard type ID from API
          psaraCertificationStatus: displayData.employmentDetails.psaraCertificationStatus,
        });
        break;
      default:
        setEditFormData({});
    }
    setEditDialogOpen(true);
  };

  // Handle save changes
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
            phoneNumber: editFormData.mobileNumber,
            alternateNumber: editFormData.alternateNumber,
            addresses: {
              permanent: editFormData.permanentAddress,
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
            guardType: editFormData.guardType, // Guard type ID
            startDate: editFormData.dateOfJoining, // Now using 'employment' (singular) field
            psaraCertificationStatus: editFormData.psaraCertificationStatus, // Now using 'employment' (singular) field
          });
          break;

        default:
          throw new Error("Unknown section for update");
      }
    } catch (error: any) {
      console.error("Error saving changes:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to save changes",
        severity: "error",
      });
    }
  };

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
          Loading profile data...
        </Typography>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontSize: "14px",
            color: "#A0A0A0",
          }}
        >
          Fetching guard details from server
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
  if (!guardProfileData) {
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
          No profile data available
        </Typography>
      </Box>
    );
  }

  // Transform API data for display
  const displayData = transformApiDataToDisplayFormat(guardProfileData);

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
            Profile
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
            <PersonalDetailsCard
              personalDetails={displayData.personalDetails}
              onEdit={() => handleEdit("personal")}
              isUpdating={isUpdating}
            />

            {/* Contact Details Card */}
            <ContactDetailsCard
              contactDetails={displayData.contactDetails}
              address={displayData.address}
              onEdit={() => handleEdit("contact")}
              isUpdating={isUpdating}
            />

            {/* Emergency Contact Card */}
            <EmergencyContactCard
              emergencyContact={displayData.contactDetails.emergencyContact}
              onEdit={() => handleEdit("emergency")}
              isUpdating={isUpdating}
            />

            {/* Employment Details Card */}
            <EmploymentDetailsCard
              employmentDetails={displayData.employmentDetails}
              onEdit={() => handleEdit("employment")}
              isUpdating={isUpdating}
              agencyId={agencyId || undefined}
              guardTypeId={guardProfileData.guardType}
            />
          </Box>

          {/* Right Frame - Verified Documents */}
          <VerifiedDocumentsCard
            documents={displayData.documentVerification.documents}
            upAndUpTrust={displayData.upAndUpTrust}
          />
        </Box>
      </Box>

      {/* Edit Dialogs */}
      <PersonalDetailsEditDialog
        open={editDialogOpen && editingSection === "personal"}
        onClose={() => setEditDialogOpen(false)}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveChanges}
        isLoading={isUpdating}
      />

      <ContactDetailsEditDialog
        open={editDialogOpen && editingSection === "contact"}
        onClose={() => setEditDialogOpen(false)}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveChanges}
        isLoading={isUpdating}
      />

      <EmergencyContactEditDialog
        open={editDialogOpen && editingSection === "emergency"}
        onClose={() => setEditDialogOpen(false)}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveChanges}
        isLoading={isUpdating}
      />

      <EmploymentDetailsEditDialog
        open={editDialogOpen && editingSection === "employment"}
        onClose={() => setEditDialogOpen(false)}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveChanges}
        isLoading={isUpdating}
        agencyId={agencyId || undefined}
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

export default ProfileWindow;
