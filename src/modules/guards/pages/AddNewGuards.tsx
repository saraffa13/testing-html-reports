// AddNewGuards.tsx - Updated with API integration for missing fields

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// Import components
import ChevRonLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddressForm from "../components/AddNewGuard-subComponents/AddressForm";
import ContactDetailsForm from "../components/AddNewGuard-subComponents/ContactDetailsForm";
import DocumentVerificationForm from "../components/AddNewGuard-subComponents/DocumentVerificationForm";
import EmploymentDetailsForm from "../components/AddNewGuard-subComponents/EmploymentDetailsForm";
import PersonalDetailsForm from "../components/AddNewGuard-subComponents/PersonalDetailForm";
import CustomProgressStepper from "../components/ProgressStepper";
// Import hooks and types
import { useAuth } from "../../../hooks/useAuth"; // 🔥 NEW: Import auth hook for agency ID
import { useGuards } from "../context/GuardContext";
import { useGuardMutations } from "../hooks/useGuardMutations";
import { useGuardTypes, type GuardType } from "../hooks/useGuardTypes"; // 🔥 NEW: Import guard types hook with type
import type { GuardFormData } from "../types/guard.types";

// Form steps
const steps = [
  { id: 1, label: "PERSONAL DETAILS" },
  { id: 2, label: "CONTACT DETAILS" },
  { id: 3, label: "ADDRESS" },
  { id: 4, label: "EMPLOYMENT DETAILS" },
  { id: 5, label: "DOCUMENT VERIFICATION" },
];

const AddNewGuard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [successOpen, setSuccessOpen] = useState(false);
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);
  const navigate = useNavigate();

  // 🔥 NEW: Get auth context for agency ID
  const { user } = useAuth();

  // Context and mutations
  const { forceRefreshGuards } = useGuards();
  const { createGuard, isCreatingGuard, createGuardError, createGuardSuccess, createGuardData, resetCreateGuard } =
    useGuardMutations();

  // 🔥 NEW: Load guard types for validation
  const {
    data: guardTypes = [],
    isLoading: isLoadingGuardTypes,
    error: guardTypesError,
  } = useGuardTypes(user?.agencyId || "", {
    enabled: !!user?.agencyId,
  });

  // Form setup with react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    trigger,
    reset,
  } = useForm<GuardFormData>({
    mode: "onChange",
    defaultValues: {
      personalDetails: {
        profilePhoto: null,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        sex: "",
        bloodGroup: "",
        nationality: "",
        height: "",
        heightUnit: "cm",
        weight: "",
        identificationMark: "",
        fatherName: "",
        motherName: "",
        maritalStatus: "",
        spouseName: "",
        spouseDob: "",
      },
      contactDetails: {
        mobileNumber: "",
        alternateNumber: "",
        emergencyContact: {
          firstName: "",
          middleName: "",
          lastName: "",
          relationship: "",
          contactNumber: "",
        },
      },
      address: {
        localAddress: {
          addressLine1: "",
          addressLine2: "",
          city: "",
          district: "",
          pincode: "",
          state: "",
          landmark: "",
        },
        permanentAddress: {
          addressLine1: "",
          addressLine2: "",
          city: "",
          district: "",
          pincode: "",
          state: "",
          landmark: "",
        },
        sameAsPermanent: false,
      },
      employmentDetails: {
        companyId: "",
        dateOfJoining: "",
        referredBy: "",
        referralContactNumber: "",
        relationshipWithGuard: "",
        guardTypeId: "", // Guard type ID
        psaraCertificationStatus: "",
        status: "ACTIVE",
        isExDefense: false,
        licenseNumber: "",
        dateOfIssue: "",
        validUntil: "",
        validIn: "",
      },
      documentVerification: {
        documents: [
          { type: "aadhaar", isSelected: false },
          { type: "birth", isSelected: false },
          { type: "education", isSelected: false },
          { type: "pan", isSelected: false },
          { type: "driving", isSelected: false },
          { type: "passport", isSelected: false },
        ],
      },
    },
  });

  // Watch form values for validation
  const maritalStatus = watch("personalDetails.maritalStatus");
  const sameAsPermanent = watch("address.sameAsPermanent");
  const documentsVerification = watch("documentVerification.documents");
  const guardTypeId = watch("employmentDetails.guardTypeId");

  // Check for existing draft on component mount
  useEffect(() => {
    const checkForDraft = () => {
      try {
        const draftData = localStorage.getItem("guardDraft");
        if (draftData) {
          const parsedDraft = JSON.parse(draftData);
          console.log("📋 Found existing guard draft:", parsedDraft);
          setDraftDialogOpen(true);
        }
      } catch (error) {
        console.error("❌ Error parsing draft data:", error);
        // Clear corrupted draft
        localStorage.removeItem("guardDraft");
      }
    };

    checkForDraft();
  }, []);

  // Load draft data into form
  const loadDraft = () => {
    try {
      const draftData = localStorage.getItem("guardDraft");
      if (draftData) {
        const parsedDraft = JSON.parse(draftData);

        // Reset form with draft data
        reset(parsedDraft);

        // Find the last completed step (step with data)
        let lastStep = 1;
        if (parsedDraft.personalDetails?.firstName) lastStep = Math.max(lastStep, 1);
        if (parsedDraft.contactDetails?.mobileNumber) lastStep = Math.max(lastStep, 2);
        if (parsedDraft.address?.permanentAddress?.addressLine1) lastStep = Math.max(lastStep, 3);
        if (parsedDraft.employmentDetails?.companyId) lastStep = Math.max(lastStep, 4);
        if (parsedDraft.documentVerification?.documents?.some((doc: any) => doc.isSelected))
          lastStep = Math.max(lastStep, 5);

        setCurrentStep(lastStep);
        console.log(`✅ Draft loaded successfully, starting at step ${lastStep}`);
      }
    } catch (error) {
      console.error("❌ Error loading draft:", error);
      alert("Error loading draft. Starting with a fresh form.");
    }
    setDraftDialogOpen(false);
  };

  // Clear draft and start fresh
  const clearDraftAndStartFresh = () => {
    localStorage.removeItem("guardDraft");
    setDraftDialogOpen(false);
    console.log("🗑️ Draft cleared, starting fresh");
  };

  // Handle step click from progress stepper (clickable steps)
  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  // 🔥 UPDATED: Enhanced validation with guard type checking
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 1: // Personal Details
        fieldsToValidate = [
          "personalDetails.firstName",
          "personalDetails.lastName",
          "personalDetails.email",
          "personalDetails.dateOfBirth",
          "personalDetails.sex",
          "personalDetails.bloodGroup",
          "personalDetails.nationality",
          "personalDetails.height",
          "personalDetails.heightUnit",
          "personalDetails.weight",
          "personalDetails.identificationMark",
          "personalDetails.fatherName",
          "personalDetails.motherName",
          "personalDetails.maritalStatus",
        ];

        // Check if profile photo is uploaded
        const profilePhoto = watch("personalDetails.profilePhoto");
        if (!profilePhoto) {
          alert("Please upload a profile photo before proceeding.");
          return false;
        }

        // Add spouse validation if married
        if (maritalStatus === "Married") {
          fieldsToValidate.push("personalDetails.spouseName");
          fieldsToValidate.push("personalDetails.spouseDob");
        }
        break;

      case 2: // Contact Details
        fieldsToValidate = [
          "contactDetails.mobileNumber",
          "contactDetails.emergencyContact.firstName",
          "contactDetails.emergencyContact.lastName",
          "contactDetails.emergencyContact.relationship",
          "contactDetails.emergencyContact.contactNumber",
        ];
        break;

      case 3: // Address
        fieldsToValidate = [
          "address.permanentAddress.addressLine1",
          "address.permanentAddress.addressLine2",
          "address.permanentAddress.city",
          "address.permanentAddress.district",
          "address.permanentAddress.pincode",
          "address.permanentAddress.state",
        ];

        if (!sameAsPermanent) {
          fieldsToValidate = [
            ...fieldsToValidate,
            "address.localAddress.addressLine1",
            "address.localAddress.addressLine2",
            "address.localAddress.city",
            "address.localAddress.district",
            "address.localAddress.pincode",
            "address.localAddress.state",
          ];
        }
        break;

      case 4: // Employment Details
        fieldsToValidate = [
          "employmentDetails.companyId",
          "employmentDetails.dateOfJoining",
          "employmentDetails.guardTypeId", // Validate guard type ID
          "employmentDetails.psaraCertificationStatus",
        ];

        // Check if selected guard type requires license
        const selectedGuardType = guardTypes?.find((type: GuardType) => type.id === guardTypeId);
        const requiresLicense = selectedGuardType
          ? ["Armed Security Guard", "Personal Security Officer", "Bouncer", "Gun Man", "Gunman"].includes(
              selectedGuardType.typeName
            )
          : false;

        if (requiresLicense) {
          fieldsToValidate.push(
            "employmentDetails.licenseNumber",
            "employmentDetails.dateOfIssue",
            "employmentDetails.validUntil",
            "employmentDetails.validIn"
          );
        }
        break;

      case 5: // Document Verification
        const selectedDocuments = documentsVerification?.filter((doc) => doc.isSelected) || [];
        const mandatoryDocTypes = ["aadhaar", "birth", "education", "pan"];
        const selectedMandatoryDocs = selectedDocuments.filter((doc) => mandatoryDocTypes.includes(doc.type));

        if (selectedMandatoryDocs.length < mandatoryDocTypes.length) {
          alert(
            "Please select all mandatory documents: Aadhaar Card, Birth Certificate, Education Certificate, and PAN Card."
          );
          return false;
        }
        return true;
    }

    return await trigger(fieldsToValidate as any);
  };

  // Move to next step
  const nextStep = async () => {
    const isStepValid = await validateCurrentStep();

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  // Move to previous step
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Form submission
  const onSubmit = async (data: GuardFormData) => {
    console.log("🔍 Form data being submitted:", {
      personalDetails: {
        name: `${data.personalDetails.firstName} ${data.personalDetails.lastName}`,
        email: data.personalDetails.email,
        phone: data.contactDetails.mobileNumber,
        guardTypeId: data.employmentDetails.guardTypeId, // Log guard type ID
        status: data.employmentDetails.status,
        hasPhoto: !!data.personalDetails.profilePhoto,
        height: `${data.personalDetails.height} ${data.personalDetails.heightUnit}`,
        bloodGroup: data.personalDetails.bloodGroup,
      },
      employment: {
        guardTypeId: data.employmentDetails.guardTypeId,
        psaraStatus: data.employmentDetails.psaraCertificationStatus,
        licenseNumber: data.employmentDetails.licenseNumber,
        dateOfIssue: data.employmentDetails.dateOfIssue,
        validUntil: data.employmentDetails.validUntil,
        validIn: data.employmentDetails.validIn,
      },
      selectedDocuments: data.documentVerification.documents.filter((doc) => doc.isSelected).length,
      agencyId: data.employmentDetails.companyId,
      userType: "GUARD",
    });

    try {
      createGuard(data);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  // Handle successful guard creation
  useEffect(() => {
    if (createGuardSuccess && createGuardData) {
      setSuccessOpen(true);
      console.log("🎉 Guard created successfully!");

      // Clear draft on successful submission
      localStorage.removeItem("guardDraft");
      console.log("🗑️ Draft cleared after successful submission");

      forceRefreshGuards()
        .then(() => {
          console.log("✅ Guards list refreshed");
          setTimeout(() => navigate("/guards"), 2000);
        })
        .catch((error) => {
          console.error("❌ Failed to refresh guards list:", error);
          setTimeout(() => navigate("/guards"), 2000);
        });
    }
  }, [createGuardSuccess, createGuardData, navigate, forceRefreshGuards]);

  // Discard changes
  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard your changes? This will also delete any saved draft.")) {
      reset();
      resetCreateGuard();
      localStorage.removeItem("guardDraft"); // Clear draft when discarding
      navigate("/guards");
    }
  };

  // Save draft to localStorage
  const handleSaveDraft = () => {
    const currentData = getValues();

    // Add metadata to draft
    const draftWithMetadata = {
      ...currentData,
      _draftMetadata: {
        savedAt: new Date().toISOString(),
        currentStep: currentStep,
        version: "1.0",
      },
    };

    localStorage.setItem("guardDraft", JSON.stringify(draftWithMetadata));
    console.log("💾 Guard draft saved to localStorage with metadata:", draftWithMetadata._draftMetadata);
    alert("Draft saved successfully! You can continue from where you left off next time.");

    // Redirect to guards list after saving draft
    navigate("/guards");
  };

  // Close success snackbar and redirect
  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate("/guards");
  };

  // Get error message for display
  const getErrorMessage = () => {
    if (!createGuardError) return null;
    if (createGuardError instanceof Error) {
      return createGuardError.message;
    }
    return "An unexpected error occurred while creating the guard.";
  };

  return (
    <div className="h-full">
      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={6000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSuccessClose} severity="success" sx={{ width: "100%" }}>
          🎉 Guard created successfully! Redirecting to guards list...
        </Alert>
      </Snackbar>

      {/* Error Display */}
      {createGuardError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => resetCreateGuard()}>
          {getErrorMessage()}
        </Alert>
      )}

      {/* 🔥 NEW: Guard Types Loading Error */}
      {guardTypesError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Failed to load guard types. Using fallback options. Error: {guardTypesError.message}
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center text-xl gap-2 font-semibold mb-2">
          <ArrowBackIcon className="cursor-pointer" onClick={() => navigate("/guards")} />
          <h2>Add New Guard</h2>
          {/* 🔥 NEW: Show loading indicator for guard types */}
          {isLoadingGuardTypes && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" sx={{ color: "#707070" }}>
                Loading guard types...
              </Typography>
            </Box>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-4">
          <Button
            variant="contained"
            onClick={handleDiscard}
            disabled={isCreatingGuard}
            sx={{
              display: "flex",
              width: "105px",
              height: "32px",
              borderRadius: "8px",
              padding: "8px 16px",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
              gap: "4px",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
              "&.Mui-disabled": {
                backgroundColor: "#F0F0F0",
                color: "#A0A0A0",
              },
            }}
          >
            <DeleteOutlineOutlinedIcon
              fontSize="small"
              sx={{
                width: "16px",
                height: "16px",
                color: isCreatingGuard ? "#A0A0A0" : "#2A77D5",
              }}
            />
            <Typography
              sx={{
                fontSize: "14px",
                fontFamily: "Mukta",
                color: isCreatingGuard ? "#A0A0A0" : "#2A77D5",
                textTransform: "uppercase",
              }}
            >
              DISCARD
            </Typography>
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveDraft}
            disabled={isCreatingGuard}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              width: "125px",
              height: "32px",
              borderRadius: "8px",
              padding: "8px 16px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
              "&.Mui-disabled": {
                backgroundColor: "#F0F0F0",
                color: "#A0A0A0",
              },
            }}
          >
            <DraftsOutlinedIcon
              fontSize="small"
              sx={{
                width: "16px",
                height: "16px",
                color: isCreatingGuard ? "#A0A0A0" : "#2A77D5",
              }}
            />
            <Typography
              sx={{
                fontSize: "14px",
                fontFamily: "Mukta",
                color: isCreatingGuard ? "#A0A0A0" : "#2A77D5",
                textTransform: "uppercase",
              }}
            >
              SAVE DRAFT
            </Typography>
          </Button>

          <Button
            variant="contained"
            onClick={currentStep === 5 ? handleSubmit(onSubmit) : undefined}
            disabled={currentStep < 5 || isCreatingGuard}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              width: "137px",
              height: "32px",
              borderRadius: "8px",
              padding: "8px 16px",
              backgroundColor: currentStep === 5 && !isCreatingGuard ? "#FFFFFF" : "#F0F0F0",
              boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
              color: currentStep === 5 && !isCreatingGuard ? "#2A77D5" : "#A3A3A3",
              "&:hover": {
                backgroundColor: currentStep === 5 && !isCreatingGuard ? "#F5F5F5" : "#F0F0F0",
              },
            }}
          >
            {isCreatingGuard ? (
              <CircularProgress size={16} sx={{ color: "#A3A3A3" }} />
            ) : (
              <CheckOutlinedIcon
                fontSize="small"
                sx={{
                  color: currentStep === 5 && !isCreatingGuard ? "#2A77D5" : "#A3A3A3",
                }}
              />
            )}
            <Typography
              sx={{
                fontSize: "14px",
                fontFamily: "Mukta",
                color: currentStep === 5 && !isCreatingGuard ? "#2A77D5" : "#A3A3A3",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {isCreatingGuard ? "CREATING..." : "SUBMIT FORM"}
            </Typography>
          </Button>
        </div>
      </div>

      {/* Form Container */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: "10px",
          backgroundColor: "#F1F7FE",
          width: "1240px",
          height: "792px",
          gap: "24px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        {/* Progress Stepper - Clickable */}
        <CustomProgressStepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1 }}>
          {currentStep === 1 && (
            <PersonalDetailsForm
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              getValues={getValues}
            />
          )}
          {currentStep === 2 && (
            <ContactDetailsForm register={register} errors={errors} watch={watch} setValue={setValue} />
          )}
          {currentStep === 3 && (
            <AddressForm register={register} errors={errors} watch={watch} setValue={setValue} trigger={trigger} />
          )}
          {currentStep === 4 && (
            <EmploymentDetailsForm register={register} errors={errors} watch={watch} setValue={setValue} />
          )}
          {currentStep === 5 && (
            <DocumentVerificationForm register={register} errors={errors} watch={watch} setValue={setValue} />
          )}

          {/* Navigation Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 3,
              mt: 2,
              px: 2,
            }}
          >
            {/* Previous Button */}
            {currentStep > 1 && (
              <Button
                variant="contained"
                onClick={prevStep}
                disabled={isCreatingGuard}
                sx={{
                  width: "101px",
                  height: "36px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
                  "&:hover": {
                    backgroundColor: "#F5F5F5",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#F0F0F0",
                    color: "#A0A0A0",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <ChevRonLeftIcon
                    sx={{
                      color: isCreatingGuard ? "#A0A0A0" : "#2A77D5",
                      width: "16px",
                      height: "16px",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "16px",
                      lineHeight: "24px",
                      fontFamily: "Mukta",
                      color: isCreatingGuard ? "#A0A0A0" : "#2A77D5",
                      fontWeight: "500",
                      textTransform: "uppercase",
                    }}
                  >
                    Previous
                  </Typography>
                </Box>
              </Button>
            )}

            {/* Next Button */}
            {currentStep < 5 && (
              <Button
                variant="contained"
                onClick={nextStep}
                disabled={isCreatingGuard}
                endIcon={
                  <ChevronRightIcon
                    sx={{
                      color: isCreatingGuard ? "#A0A0A0" : "#2A77D5",
                      width: "20px",
                      height: "20px",
                    }}
                  />
                }
                sx={{
                  width: "101px",
                  height: "36px",
                  padding: "8px 16px 8px 20px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  "&:hover": {
                    backgroundColor: "#F5F5F5",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#F0F0F0",
                    color: "#A0A0A0",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    fontFamily: "Mukta",
                    color: isCreatingGuard ? "#A0A0A0" : "#2A77D5",
                    fontWeight: "500",
                    textTransform: "uppercase",
                  }}
                >
                  Next
                </Typography>
              </Button>
            )}

            {/* Submit Button - Only on last step */}
            {currentStep === 5 && (
              <Button
                variant="contained"
                type="submit"
                disabled={isCreatingGuard}
                sx={{
                  borderRadius: "8px",
                  fontFamily: "Mukta",
                  textTransform: "uppercase",
                  backgroundColor: isCreatingGuard ? "#F0F0F0" : "#FFFFFF",
                  color: isCreatingGuard ? "#A0A0A0" : "#2A77D5",
                  "&:hover": {
                    backgroundColor: isCreatingGuard ? "#F0F0F0" : "#F5F5F5",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#F0F0F0",
                    color: "#A0A0A0",
                  },
                }}
              >
                {isCreatingGuard ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1, color: "#A0A0A0" }} />
                    Creating...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </Box>
        </form>
      </Box>

      {/* Draft Dialog */}
      <Dialog open={draftDialogOpen} onClose={() => {}} maxWidth="sm" fullWidth disableEscapeKeyDown>
        <DialogTitle sx={{ textAlign: "center", fontFamily: "Mukta", fontWeight: 600, color: "#2A77D5" }}>
          📋 Draft Found
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: "center", color: "#707070", mb: 2 }}>
            You have a saved draft from a previous session. Would you like to continue where you left off or start
            fresh?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <Button
            onClick={clearDraftAndStartFresh}
            variant="outlined"
            sx={{
              color: "#707070",
              borderColor: "#D0D0D0",
              "&:hover": {
                borderColor: "#A0A0A0",
                backgroundColor: "#F5F5F5",
              },
            }}
          >
            Start Fresh
          </Button>
          <Button
            onClick={loadDraft}
            variant="contained"
            sx={{
              backgroundColor: "#2A77D5",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#1E5AA3",
              },
            }}
          >
            Continue Draft
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddNewGuard;
