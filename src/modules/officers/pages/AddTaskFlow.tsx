// File: src/modules/officers/pages/AddTaskFlow.tsx - Final errorless version
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, Snackbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TaskDeadlineForm from "../components/AddTaskForm/TaskDeadline";
import TaskLocationForm from "../components/AddTaskForm/TaskLocation";
import TaskSelectionForm from "../components/AddTaskForm/TaskSelection";
import CustomProgressStepper from "../components/ProgressStepper";
import { useOfficers } from "../context/OfficerContext";
import { taskService, type TaskFormData } from "../service/taskService";

// Steps for the form
const steps = [
  { id: 1, label: "TASK LOCATION" },
  { id: 2, label: "TASK SELECTION" },
  { id: 3, label: "TASK DEADLINE" },
];

const AddTaskFlow: React.FC = () => {
  const { officerId } = useParams<{ officerId: string }>();
  const navigate = useNavigate();
  const { officers } = useOfficers();

  // Get officer data using officerId (which is the guardId)
  const officerData = officers.find(o => o.guardId === officerId);
  const areaOfficerId = officerId || null; // officerId is already the guardId we need for the API

  const [currentStep, setCurrentStep] = useState(1);
  const [saveProgressOpen, setSaveProgressOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TaskFormData>({
    taskLocation: {
      selectedSites: [],
      customLocation: undefined,
      isCustomLocation: false,
    },
    taskSelection: {
      selectedTasks: [],
    },
    taskDeadline: {
      dueDate: "",
      dueTime: "",
      amPm: "AM",
    },
  });

  // Load draft on component mount
  useEffect(() => {
    const loadDraft = () => {
      const draft = taskService.loadDraft();
      if (draft) {
        setFormData(draft);
        console.log("📥 Loaded existing draft");
      }
    };

    loadDraft();
  }, []);

  // Check if we have officer data and guardId
  if (!officerData || !areaOfficerId) {
    return (
      <div className="h-full flex items-center justify-center">
        <Alert severity="error">Officer not found or missing data. Cannot create task.</Alert>
      </div>
    );
  }

  const createTask = async (taskData: TaskFormData) => {
    try {
      setIsCreating(true);
      setCreateError(null);

      console.log("🔄 Creating task for officer:", {
        officerName: officerData.name,
        guardId: areaOfficerId,
        taskData,
      });

      // Use the real task service
      const result = await taskService.createTask(taskData, areaOfficerId);

      console.log("✅ Task created successfully:", result);

      // Clear draft after successful creation
      taskService.clearDraft();

      setSuccessOpen(true);

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate(`/officers/${officerId}/performance`);
      }, 3000);
    } catch (error: any) {
      console.error("❌ Task creation error:", error);
      setCreateError(error.message || "Failed to create task. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const saveDraft = async (draftData: TaskFormData) => {
    try {
      await taskService.saveDraft(draftData);
      console.log("✅ Draft saved successfully");
    } catch (error) {
      console.error("❌ Error saving draft:", error);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        // Check location selection
        if (formData.taskLocation.isCustomLocation) {
          return !!formData.taskLocation.customLocation?.trim();
        } else {
          return formData.taskLocation.selectedSites.length > 0;
        }
      case 2:
        return formData.taskSelection.selectedTasks.length > 0;
      case 3:
        return formData.taskDeadline.dueDate && formData.taskDeadline.dueTime && formData.taskDeadline.amPm;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (!validateStep()) {
      setCreateError("Please complete all required fields for this step");
      return;
    }

    // Auto-save as draft when progressing
    await saveDraft(formData);
    setSaveProgressOpen(true);
  };

  const handleSaveProgressConfirm = () => {
    setSaveProgressOpen(false);
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Final validation
    const validationErrors = taskService.validateFormData(formData);
    if (validationErrors.length > 0) {
      setCreateError(`Please fix the following issues: ${validationErrors.join(", ")}`);
      return;
    }

    await createTask(formData);
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard your changes?")) {
      taskService.clearDraft();
      navigate(`/officers/${officerId}/performance`);
    }
  };

  const handleSaveDraft = async () => {
    const success = await taskService.saveDraft(formData);
    if (success) {
      alert("Draft saved successfully!");
    } else {
      alert("Failed to save draft. Please try again.");
    }
  };

  const updateFormData = (section: keyof TaskFormData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate(`/officers/${officerId}/performance`);
  };

  // Disabled submit button style
  const disabledSubmitBtnStyle = {
    width: "165px",
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
        autoHideDuration={6000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSuccessClose} severity="success" sx={{ width: "100%" }}>
          🎉 Task created successfully! Redirecting to officer performance...
        </Alert>
      </Snackbar>

      {/* Error Display */}
      {createError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCreateError(null)}>
          {createError}
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center text-xl gap-2 font-semibold mb-2">
          <ArrowBackIcon className="cursor-pointer" onClick={() => navigate(`/officers/${officerId}/performance`)} />
          <h2 className="">Add New Task for {officerData.name}</h2>
        </div>

        {currentStep < 4 && (
          <div className="flex flex-row gap-4">
            <Button
              variant="contained"
              onClick={handleDiscard}
              disabled={isCreating}
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
                  color: isCreating ? "#A0A0A0" : "#2A77D5",
                }}
              />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontFamily: "Mukta",
                  color: isCreating ? "#A0A0A0" : "#2A77D5",
                  textTransform: "uppercase",
                }}
              >
                DISCARD
              </Typography>
            </Button>

            <Button
              variant="contained"
              onClick={handleSaveDraft}
              disabled={isCreating}
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
                  color: isCreating ? "#A0A0A0" : "#2A77D5",
                }}
              />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontFamily: "Mukta",
                  color: isCreating ? "#A0A0A0" : "#2A77D5",
                  textTransform: "uppercase",
                }}
              >
                SAVE DRAFT
              </Typography>
            </Button>

            <Button
              variant="contained"
              onClick={currentStep === 3 ? handleSubmit : undefined}
              disabled={currentStep < 3 || isCreating}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                width: "165px",
                height: "33px",
                borderRadius: "8px",
                padding: "8px 16px",
                backgroundColor: currentStep === 3 && !isCreating ? "#FFFFFF" : "#F0F0F0",
                boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
                "&:hover": {
                  backgroundColor: currentStep === 3 && !isCreating ? "#F5F5F5" : "#F0F0F0",
                },
                ...(currentStep < 3 && disabledSubmitBtnStyle),
              }}
            >
              {isCreating ? (
                <CircularProgress size={16} sx={{ color: "#A3A3A3" }} />
              ) : (
                <CheckOutlinedIcon
                  fontSize="small"
                  sx={{
                    color: currentStep === 3 && !isCreating ? "#2A77D5" : "#A3A3A3",
                  }}
                />
              )}
              <Typography
                sx={{
                  fontSize: "14px",
                  fontFamily: "Mukta",
                  color: currentStep === 3 && !isCreating ? "#2A77D5" : "#A3A3A3",
                  textTransform: "uppercase",
                }}
              >
                {isCreating ? "CREATING..." : "SUBMIT FORM"}
              </Typography>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
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
        }}
      >
        {/* Officer Info Card - Centered */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: "350px",
              height: "56px",
              gap: "16px",
              borderRadius: "10px",
              padding: "8px 16px",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid #D9D9D9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F5F5F5",
                overflow: "hidden",
              }}
            >
              {officerData.photo ? (
                <img
                  src={officerData.photo}
                  alt={officerData.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Typography sx={{ fontSize: "20px" }}>👤</Typography>
              )}
            </Box>
            <Box sx={{ width: "262px", height: "40px", gap: "8px" }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}>
                <Typography sx={{ fontSize: "14px", color: "#A3A3A3", width: "72px" }}>Officer ID</Typography>
                <Typography sx={{ fontSize: "14px", color: "#3B3B3B", width: "182px" }}>
                  {officerData.guardId || officerData.id}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography sx={{ fontSize: "14px", color: "#A3A3A3", width: "72px" }}>Name</Typography>
                <Typography sx={{ fontSize: "14px", color: "#3B3B3B", width: "182px" }}>{officerData.name}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Progress Stepper */}
        <CustomProgressStepper currentStep={currentStep} steps={steps} />

        {/* Form Content */}
        <form style={{ flex: 1 }}>
          {/* Form Content Container */}
          <Box
            sx={{
              display: "flex",
              justifyContent: currentStep === 3 ? "center" : "flex-start",
              width: "100%",
            }}
          >
            {currentStep === 1 && (
              <TaskLocationForm
                data={formData.taskLocation}
                areaOfficerId={areaOfficerId}
                onUpdate={(data) => updateFormData("taskLocation", data)}
              />
            )}
            {currentStep === 2 && (
              <TaskSelectionForm
                data={formData.taskSelection}
                onUpdate={(data) => updateFormData("taskSelection", data)}
              />
            )}
            {currentStep === 3 && (
              <TaskDeadlineForm
                data={formData.taskDeadline}
                onUpdate={(data) => updateFormData("taskDeadline", data)}
              />
            )}
          </Box>

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
            {currentStep > 1 && (
              <Button
                variant="contained"
                onClick={prevStep}
                disabled={isCreating}
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
                      color: isCreating ? "#A0A0A0" : "#2A77D5",
                      width: "16px",
                      height: "16px",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "16px",
                      lineHeight: "24px",
                      fontFamily: "Mukta",
                      color: isCreating ? "#A0A0A0" : "#2A77D5",
                      fontWeight: "500",
                      textTransform: "uppercase",
                    }}
                  >
                    Previous
                  </Typography>
                </Box>
              </Button>
            )}

            {currentStep < 3 && (
              <Button
                variant="contained"
                onClick={nextStep}
                disabled={isCreating}
                endIcon={
                  <ChevronRightIcon
                    sx={{
                      color: isCreating ? "#A0A0A0" : "#2A77D5",
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
                    color: isCreating ? "#A0A0A0" : "#2A77D5",
                    fontWeight: "500",
                    textTransform: "uppercase",
                  }}
                >
                  Next
                </Typography>
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isCreating}
                sx={{
                  borderRadius: "8px",
                  fontFamily: "Mukta",
                  textTransform: "uppercase",
                  backgroundColor: isCreating ? "#F0F0F0" : "#FFFFFF",
                  color: isCreating ? "#A0A0A0" : "#2A77D5",
                  "&:hover": {
                    backgroundColor: isCreating ? "#F0F0F0" : "#F5F5F5",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#F0F0F0",
                    color: "#A0A0A0",
                  },
                }}
              >
                {isCreating ? (
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

      {/* Save Progress Dialog */}
      <Dialog open={saveProgressOpen} onClose={() => setSaveProgressOpen(false)} maxWidth="sm" fullWidth>
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
                onClick={() => setSaveProgressOpen(false)}
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

export default AddTaskFlow;
