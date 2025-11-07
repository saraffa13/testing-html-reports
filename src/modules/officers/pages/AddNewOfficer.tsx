import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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

// Import the officer form components
import OfficerAddressForm from "../components/AddNewOfficers/AddressForm";
import OfficerContactDetailsForm from "../components/AddNewOfficers/ContactDetailForm";
import OfficerDocumentVerificationForm from "../components/AddNewOfficers/DocumentVerificationForm";
import OfficerEmploymentDetailsForm from "../components/AddNewOfficers/EmploymentDetailsForm";
import OfficerPersonalDetailsForm from "../components/AddNewOfficers/PersonalDetailForm";
import CustomProgressStepper from "../components/ProgressStepper";

// Import hooks and types
import { useOfficers } from "../context/OfficerContext"; // 🔥 Import OfficerContext to trigger refresh
import { useOfficerMutations } from "../hooks/useOfficerMutations";
import type { OfficerFormData } from "../types/officers.types";

// Steps for the form
const steps = [
  { id: 1, label: "PERSONAL DETAILS" },
  { id: 2, label: "CONTACT DETAILS" },
  { id: 3, label: "ADDRESS" },
  { id: 4, label: "EMPLOYMENT DETAILS" },
  { id: 5, label: "DOCUMENT VERIFICATION" },
];

const AddNewOfficer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [saveProgressOpen, setSaveProgressOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);
  const navigate = useNavigate();

  // 🔥 Get forceRefreshOfficers function from context to manually refresh
  const { forceRefreshOfficers } = useOfficers();

  // Use the officer mutations hook
  const {
    createOfficer,
    isCreatingOfficer,
    createOfficerError,
    createOfficerSuccess,
    createOfficerData,
    resetCreateOfficer,
  } = useOfficerMutations();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    trigger,
    reset,
  } = useForm<OfficerFormData>({
    mode: "onChange",
    defaultValues: {
      personalDetails: {
        profilePhoto: null,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        dateOfBirth: "", // Only DOB, no age
        sex: "",
        bloodGroup: "",
        nationality: "",
        height: "",
        heightUnit: "cm", // Default to cm
        weight: "",
        identificationMark: "",
        fatherName: "",
        motherName: "", // Will be made mandatory in validation
        maritalStatus: "",
        spouseName: "",
        spouseDob: "", // Only DOB for spouse
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
        designation: "",
        assignedDutyArea: "",
        areaManager: "",
        referredBy: "",
        referralContactNumber: "",
        relationshipWithOfficer: "",
        status: "ACTIVE", // Set to ACTIVE by default, no user selection needed
      },
      documentVerification: {
        documents: [
          { type: "aadhaar", isSelected: false },
          { type: "birth", isSelected: false },
          { type: "education", isSelected: false },
          { type: "pan", isSelected: false }, // PAN is now mandatory
          { type: "driving", isSelected: false },
          { type: "passport", isSelected: false },
        ],
      },
    },
  });

  const maritalStatus = watch("personalDetails.maritalStatus");
  const sameAsPermanent = watch("address.sameAsPermanent");
  const documentsVerification = watch("documentVerification.documents");

  // Check for existing draft on component mount
  useEffect(() => {
    const checkForDraft = () => {
      try {
        const draftData = localStorage.getItem("officerDraft");
        if (draftData) {
          const parsedDraft = JSON.parse(draftData);
          console.log("📋 Found existing officer draft:", parsedDraft);
          setDraftDialogOpen(true);
        }
      } catch (error) {
        console.error("❌ Error parsing draft data:", error);
        // Clear corrupted draft
        localStorage.removeItem("officerDraft");
      }
    };

    checkForDraft();
  }, []);

  // Load draft data into form
  const loadDraft = () => {
    try {
      const draftData = localStorage.getItem("officerDraft");
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
    localStorage.removeItem("officerDraft");
    setDraftDialogOpen(false);
    console.log("🗑️ Draft cleared, starting fresh");
  };

  // Handle step click from progress stepper (clickable steps)
  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  // Validation logic for each step
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 1: // Personal Details
        fieldsToValidate = [
          "personalDetails.firstName",
          "personalDetails.lastName",
          "personalDetails.email",
          "personalDetails.dateOfBirth", // Only DOB validation
          "personalDetails.sex",
          "personalDetails.bloodGroup",
          "personalDetails.nationality",
          "personalDetails.height",
          "personalDetails.heightUnit",
          "personalDetails.weight",
          "personalDetails.identificationMark",
          "personalDetails.fatherName",
          "personalDetails.motherName", // Now mandatory
          "personalDetails.maritalStatus",
        ];

        // Check if profile photo is uploaded (mandatory)
        const profilePhoto = watch("personalDetails.profilePhoto");
        if (!profilePhoto) {
          alert("Please upload a profile photo before proceeding.");
          return false;
        }

        // Add spouse validation if married
        if (maritalStatus === "Married") {
          fieldsToValidate.push("personalDetails.spouseName");
          fieldsToValidate.push("personalDetails.spouseDob"); // Only spouse DOB
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
        // Always validate permanent address (Aadhaar verification)
        fieldsToValidate = [
          "address.permanentAddress.addressLine1",
          "address.permanentAddress.addressLine2",
          "address.permanentAddress.city",
          "address.permanentAddress.district",
          "address.permanentAddress.pincode",
          "address.permanentAddress.state",
          "address.permanentAddress.landmark",
        ];

        // Validate local address only if different from permanent
        if (!sameAsPermanent) {
          fieldsToValidate = [
            ...fieldsToValidate,
            "address.localAddress.addressLine1",
            "address.localAddress.addressLine2",
            "address.localAddress.city",
            "address.localAddress.district",
            "address.localAddress.pincode",
            "address.localAddress.state",
            "address.localAddress.landmark",
          ];
        }
        break;

      case 4: // Employment Details
        fieldsToValidate = [
          "employmentDetails.companyId",
          "employmentDetails.dateOfJoining",
          "employmentDetails.designation",
          "employmentDetails.assignedDutyArea",
          "employmentDetails.areaManager",
          // Referral fields are now optional - removed from validation
          // status field removed - set to ACTIVE by default
        ];
        break;

      case 5: // Document Verification
        // Check mandatory documents (including PAN)
        const selectedDocuments = documentsVerification?.filter((doc) => doc.isSelected) || [];
        const mandatoryDocTypes = ["aadhaar", "birth", "education", "pan"]; // PAN is mandatory
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

  // Move to next step - Direct navigation without confirmation
  const nextStep = async () => {
    const isStepValid = await validateCurrentStep();

    if (isStepValid) {
      // Direct navigation to next step without confirmation dialog
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleSaveProgressConfirm = () => {
    setSaveProgressOpen(false);
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: OfficerFormData) => {
    console.log("📝 Officer form data being submitted:", {
      personalDetails: {
        name: `${data.personalDetails.firstName} ${data.personalDetails.lastName}`,
        email: data.personalDetails.email,
        phone: data.contactDetails.mobileNumber,
        designation: data.employmentDetails.designation,
        assignedArea: data.employmentDetails.assignedDutyArea,
        areaManager: data.employmentDetails.areaManager,
        status: data.employmentDetails.status, // 🔥 Log the status
        hasPhoto: !!data.personalDetails.profilePhoto,
      },
      selectedDocuments: data.documentVerification.documents.filter((doc) => doc.isSelected).length,
      agencyId: data.employmentDetails.companyId, // Using company ID as agency ID
      userType: "AREA_OFFICER", // 🔥 CRITICAL: Hardcoded in service layer - CANNOT be changed
    });

    try {
      // Use the mutation to create the officer - agency ID comes from form data
      createOfficer(data);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  // Handle successful officer creation
  useEffect(() => {
    if (createOfficerSuccess && createOfficerData) {
      setSuccessOpen(true);
      console.log("🎉 Officer created successfully! Data:", createOfficerData);

      // Clear draft on successful submission
      localStorage.removeItem("officerDraft");
      console.log("🗑️ Draft cleared after successful submission");

      // 🔥 CRITICAL: Force refresh the officers list in the context (bypasses cache)
      console.log("🔄 Force refreshing officers list to show new officer...");
      forceRefreshOfficers()
        .then(() => {
          console.log("✅ Officers list force refreshed successfully!");

          // Navigate immediately - the cache invalidation ensures fresh data
          navigate("/officers");
        })
        .catch((error) => {
          console.error("❌ Failed to force refresh officers list:", error);
          // Still navigate even if refresh fails - cache invalidation should handle it
          navigate("/officers");
        });
    }
  }, [createOfficerSuccess, createOfficerData, navigate, forceRefreshOfficers]);

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard your changes? This will also delete any saved draft.")) {
      reset();
      resetCreateOfficer();
      localStorage.removeItem("officerDraft"); // Clear draft when discarding
      navigate("/officers");
    }
  };

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

    localStorage.setItem("officerDraft", JSON.stringify(draftWithMetadata));
    console.log("💾 Officer draft saved to localStorage with metadata:", draftWithMetadata._draftMetadata);
    alert("Draft saved successfully! You can continue from where you left off next time.");

    // Redirect to officers list after saving draft
    navigate("/officers");
  };

  const handleCancelSaveProgress = () => {
    setSaveProgressOpen(false);
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate("/officers");
  };

  // Get error message for display
  const getErrorMessage = () => {
    if (!createOfficerError) return null;

    if (createOfficerError instanceof Error) {
      return createOfficerError.message;
    }

    return "An unexpected error occurred while creating the officer.";
  };

  // Styles for submit button when disabled
  const disabledSubmitBtnStyle = {
    width: "149px",
    height: "33px",
    padding: "8px 16px",
    borderRadius: "8px",
    backgroundColor: "#F0F0F0",
    boxShadow: "0px 1px 4px 0px #70707033",
    color: "#A3A3A3",
    fontFamily: "Mukta",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "24px",
    textTransform: "uppercase",
    cursor: "not-allowed",
  };

  return (
    <div className="h-full">
      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={8000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSuccessClose} severity="success" sx={{ width: "100%" }}>
          🎉 Officer created successfully! Refreshing officers list and redirecting...
        </Alert>
      </Snackbar>

      {/* Error Display */}
      {createOfficerError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => resetCreateOfficer()}>
          {getErrorMessage()}
        </Alert>
      )}

      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center text-xl gap-2 font-semibold mb-2">
          <ArrowBackIcon className="cursor-pointer" onClick={() => navigate("/officers")} />
          <h2 className="">Add New Area Officer</h2>
        </div>

        {currentStep < 6 && (
          <div className="flex flex-row gap-4">
            <Button
              variant="contained"
              onClick={handleDiscard}
              disabled={isCreatingOfficer}
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
                  color: isCreatingOfficer ? "#A0A0A0" : "#2A77D5",
                }}
              />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontFamily: "Mukta",
                  color: isCreatingOfficer ? "#A0A0A0" : "#2A77D5",
                  textTransform: "uppercase",
                }}
              >
                DISCARD
              </Typography>
            </Button>

            <Button
              variant="contained"
              onClick={handleSaveDraft}
              disabled={isCreatingOfficer}
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
                  color: isCreatingOfficer ? "#A0A0A0" : "#2A77D5",
                }}
              />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontFamily: "Mukta",
                  color: isCreatingOfficer ? "#A0A0A0" : "#2A77D5",
                  textTransform: "uppercase",
                }}
              >
                SAVE DRAFT
              </Typography>
            </Button>

            <Button
              variant="contained"
              onClick={currentStep === 5 ? handleSubmit(onSubmit) : undefined}
              disabled={currentStep < 5 || isCreatingOfficer}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                width: "137px",
                height: "32px",
                borderRadius: "8px",
                padding: "8px 16px",
                backgroundColor: currentStep === 5 && !isCreatingOfficer ? "#FFFFFF" : "#F0F0F0",
                boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
                "&:hover": {
                  backgroundColor: currentStep === 5 && !isCreatingOfficer ? "#F5F5F5" : "#F0F0F0",
                },
                ...(currentStep < 5 && disabledSubmitBtnStyle),
              }}
            >
              {isCreatingOfficer ? (
                <CircularProgress size={16} sx={{ color: "#A3A3A3" }} />
              ) : (
                <CheckOutlinedIcon
                  fontSize="small"
                  sx={{
                    color: currentStep === 5 && !isCreatingOfficer ? "#2A77D5" : "#A3A3A3",
                  }}
                />
              )}
              <Typography
                sx={{
                  fontSize: "14px",
                  fontFamily: "Mukta",
                  color: currentStep === 5 && !isCreatingOfficer ? "#2A77D5" : "#A3A3A3",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {isCreatingOfficer ? "CREATING..." : "SUBMIT FORM"}
              </Typography>
            </Button>
          </div>
        )}
      </div>

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
        <CustomProgressStepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

        <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1 }}>
          {currentStep === 1 && (
            <OfficerPersonalDetailsForm
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              getValues={getValues}
            />
          )}
          {currentStep === 2 && (
            <OfficerContactDetailsForm register={register} errors={errors} watch={watch} setValue={setValue} />
          )}
          {currentStep === 3 && (
            <OfficerAddressForm register={register} errors={errors} watch={watch} setValue={setValue} />
          )}
          {currentStep === 4 && (
            <OfficerEmploymentDetailsForm register={register} errors={errors} watch={watch} setValue={setValue} />
          )}
          {currentStep === 5 && (
            <OfficerDocumentVerificationForm register={register} errors={errors} watch={watch} setValue={setValue} />
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 3,
              mt: 2,
              px: 2,
            }}
          >
            {currentStep > 1 && (
              <Button
                variant="contained"
                onClick={prevStep}
                disabled={isCreatingOfficer}
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
                  <ChevronLeftIcon
                    sx={{
                      color: isCreatingOfficer ? "#A0A0A0" : "#2A77D5",
                      width: "16px",
                      height: "16px",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "16px",
                      lineHeight: "24px",
                      fontFamily: "Mukta",
                      color: isCreatingOfficer ? "#A0A0A0" : "#2A77D5",
                      fontWeight: "500",
                      textTransform: "uppercase",
                    }}
                  >
                    Previous
                  </Typography>
                </Box>
              </Button>
            )}

            {currentStep < 5 && (
              <Button
                variant="contained"
                onClick={nextStep}
                disabled={isCreatingOfficer}
                endIcon={
                  <ChevronRightIcon
                    sx={{
                      color: isCreatingOfficer ? "#A0A0A0" : "#2A77D5",
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
                    color: isCreatingOfficer ? "#A0A0A0" : "#2A77D5",
                    fontWeight: "500",
                    textTransform: "uppercase",
                  }}
                >
                  Next
                </Typography>
              </Button>
            )}

            {currentStep === 5 && (
              <Button
                variant="contained"
                type="submit"
                disabled={isCreatingOfficer}
                sx={{
                  borderRadius: "8px",
                  fontFamily: "Mukta",
                  textTransform: "uppercase",
                  backgroundColor: isCreatingOfficer ? "#F0F0F0" : "#FFFFFF",
                  color: isCreatingOfficer ? "#A0A0A0" : "#2A77D5",
                  "&:hover": {
                    backgroundColor: isCreatingOfficer ? "#F0F0F0" : "#F5F5F5",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#F0F0F0",
                    color: "#A0A0A0",
                  },
                }}
              >
                {isCreatingOfficer ? (
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

      {/* Save Progress Dialog */}
      <Dialog open={saveProgressOpen} onClose={handleCancelSaveProgress} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: "#707070" }}>
              Your progress has been saved.
            </Typography>
            <Typography sx={{ mb: 3, color: "#707070" }}>Do you want to continue to the next step?</Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSaveProgressConfirm}
                sx={{
                  backgroundColor: "#2A77D5",
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: "#1E5AA3",
                  },
                }}
              >
                Yes
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancelSaveProgress}
                sx={{
                  color: "#2A77D5",
                  borderColor: "#2A77D5",
                  "&:hover": {
                    borderColor: "#1E5AA3",
                    backgroundColor: "rgba(42, 119, 213, 0.04)",
                  },
                }}
              >
                No
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewOfficer;
