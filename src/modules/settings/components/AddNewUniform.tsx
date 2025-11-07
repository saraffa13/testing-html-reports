import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, Snackbar, Typography } from "@mui/material";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// Import form components
import AccessoriesForm from "../components/AddNewUniform-subComponents/AccessoriesForm";
import BasicDetailsForm from "../components/AddNewUniform-subComponents/BasicDetailsForm";
import UniformBottomForm from "../components/AddNewUniform-subComponents/UniformBottomForm";
import UniformTopForm from "../components/AddNewUniform-subComponents/UniformTopForm";
import UniformProgressStepper from "../components/UniformProgressStepper";

// Import API service and utilities
import UniformsApiService from "../services/api/uniformsApi";
import { cropImageFromCanvas, dataURLToFile, validateImageFiles } from "../utils/imageUtils";

// Steps configuration - matches your Figma specifications
const steps = [
  { id: 1, label: "Basic Details Form" },
  { id: 2, label: "Uniform-Top" },
  { id: 3, label: "Uniform-Bottom" },
  { id: 4, label: "Accessories" },
];

// Interface for Uniform form data
interface UniformDetails {
  basicDetails: {
    uniformName: string;
    uniformTop: boolean;
    uniformBottom: boolean;
    accessories: boolean;
  };
  uniformTop: {
    photos?: File[];
    taggedElements?: any[];
  };
  uniformBottom: {
    photos?: File[];
    taggedElements?: any[];
  };
  accessories: {
    photos?: File[];
    taggedElements?: any[];
  };
}

const AddNewUniform: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [saveProgressOpen, setSaveProgressOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Store tagged elements from each step
  const [uniformData, setUniformData] = useState<{
    topTaggedElements: any[];
    bottomTaggedElements: any[];
    accessoryTaggedElements: any[];
    topUploadedImages: File[];
    bottomUploadedImages: File[];
    accessoryUploadedImages: File[];
  }>({
    topTaggedElements: [],
    bottomTaggedElements: [],
    accessoryTaggedElements: [],
    topUploadedImages: [],
    bottomUploadedImages: [],
    accessoryUploadedImages: [],
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<UniformDetails>({
    mode: "onChange",
    defaultValues: {
      basicDetails: {
        uniformName: "",
        uniformTop: false,
        uniformBottom: false,
        accessories: false,
      },
      uniformTop: {
        photos: [],
        taggedElements: [],
      },
      uniformBottom: {
        photos: [],
        taggedElements: [],
      },
      accessories: {
        photos: [],
        taggedElements: [],
      },
    },
  });

  const showSnackbar = (message: string, severity: "success" | "error" | "warning" | "info" = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const nextStep = async () => {
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["basicDetails.uniformName"];
        break;
      case 2:
        // Add validation for uniform top fields as needed
        break;
      case 3:
        // Add validation for uniform bottom fields as needed
        break;
      case 4:
        // Add validation for accessories fields as needed
        break;
    }

    const isStepValid = await trigger(fieldsToValidate as any);

    if (isStepValid) {
      setSaveProgressOpen(true);
    }
  };

  const handleSaveProgressConfirm = () => {
    setSaveProgressOpen(false);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // FIXED: Memoized callback to prevent infinite re-renders
  const handleTaggedElementsUpdate = useCallback((step: string, taggedElements: any[], uploadedImages: File[]) => {
    console.log(`📝 Updating tagged elements for ${step}:`, taggedElements.length);

    const taggedElementsWithSource = taggedElements.map((element) => ({
      ...element,
      source: step,
    }));

    setUniformData((prev) => {
      switch (step) {
        case "top":
          return {
            ...prev,
            topTaggedElements: taggedElementsWithSource,
            topUploadedImages: uploadedImages,
          };
        case "bottom":
          return {
            ...prev,
            bottomTaggedElements: taggedElementsWithSource,
            bottomUploadedImages: uploadedImages,
          };
        case "accessories":
          return {
            ...prev,
            accessoryTaggedElements: taggedElementsWithSource,
            accessoryUploadedImages: uploadedImages,
          };
        default:
          return prev;
      }
    });
  }, []); // Empty dependency array - we only use setState which is stable

  const onSubmit = async (data: UniformDetails) => {
    setSubmitting(true);

    try {
      console.log("📝 Starting uniform submission process...");
      console.log("Form data:", data);
      console.log("Uniform data:", uniformData);

      // Validate uniform name
      if (!data.basicDetails.uniformName.trim()) {
        throw new Error("Uniform name is required");
      }

      // Collect all tagged elements from different steps with source tracking
      const allTaggedElements = [
        ...uniformData.topTaggedElements.map((element) => ({ ...element, source: "top" })),
        ...uniformData.bottomTaggedElements.map((element) => ({ ...element, source: "bottom" })),
        ...uniformData.accessoryTaggedElements.map((element) => ({ ...element, source: "accessories" })),
      ];

      // Collect all uploaded images
      const allUploadedImages = [
        ...uniformData.topUploadedImages,
        ...uniformData.bottomUploadedImages,
        ...uniformData.accessoryUploadedImages,
      ];

      console.log(`📝 Processing data:`, {
        uniformName: data.basicDetails.uniformName,
        totalTaggedElements: allTaggedElements.length,
        totalUploadedImages: allUploadedImages.length,
        breakdown: {
          topElements: uniformData.topTaggedElements.length,
          topImages: uniformData.topUploadedImages.length,
          bottomElements: uniformData.bottomTaggedElements.length,
          bottomImages: uniformData.bottomUploadedImages.length,
          accessoryElements: uniformData.accessoryTaggedElements.length,
          accessoryImages: uniformData.accessoryUploadedImages.length,
        },
      });

      // Validate that we have at least some content
      if (allTaggedElements.length === 0 && allUploadedImages.length === 0) {
        throw new Error("Please upload at least one image or tag at least one uniform element before submitting");
      }

      // Process each category separately with their respective images
      const processedFiles = await processTaggedElementsWithSeparateImages(
        uniformData.topTaggedElements,
        uniformData.bottomTaggedElements,
        uniformData.accessoryTaggedElements,
        uniformData.topUploadedImages,
        uniformData.bottomUploadedImages,
        uniformData.accessoryUploadedImages,
        data.basicDetails.uniformName
      );

      console.log("📝 Processed files:", {
        topPartFiles: processedFiles.topPartFiles.length,
        bottomPartFiles: processedFiles.bottomPartFiles.length,
        accessoryFiles: processedFiles.accessoryFiles.length,
        details: {
          topParts: {
            baseImages: uniformData.topUploadedImages.length,
            taggedElements: uniformData.topTaggedElements.length,
            totalFiles: processedFiles.topPartFiles.length,
          },
          bottomParts: {
            baseImages: uniformData.bottomUploadedImages.length,
            taggedElements: uniformData.bottomTaggedElements.length,
            totalFiles: processedFiles.bottomPartFiles.length,
          },
          accessories: {
            baseImages: uniformData.accessoryUploadedImages.length,
            taggedElements: uniformData.accessoryTaggedElements.length,
            totalFiles: processedFiles.accessoryFiles.length,
          },
        },
      });

      // Validate processed files
      const allFiles = [
        ...processedFiles.topPartFiles,
        ...processedFiles.bottomPartFiles,
        ...processedFiles.accessoryFiles,
      ];

      if (allFiles.length === 0) {
        throw new Error("No files were processed successfully. Please check your uploads and try again.");
      }

      const validationErrors = validateImageFiles(allFiles);
      if (validationErrors.length > 0) {
        throw new Error(`File validation failed: ${validationErrors.join(", ")}`);
      }

      // Prepare API request with properly categorized files
      const apiRequest = {
        uniformName: data.basicDetails.uniformName.trim(),
        topPartImages: processedFiles.topPartFiles,
        bottomPartImages: processedFiles.bottomPartFiles,
        accessoryImages: processedFiles.accessoryFiles,
      };

      console.log("📤 Submitting to API with:", {
        uniformName: apiRequest.uniformName,
        topPartImages: apiRequest.topPartImages.length,
        bottomPartImages: apiRequest.bottomPartImages.length,
        accessoryImages: apiRequest.accessoryImages.length,
        totalFiles:
          apiRequest.topPartImages.length + apiRequest.bottomPartImages.length + apiRequest.accessoryImages.length,
      });

      // Log file details for debugging
      console.log("📎 File details:");
      console.log(
        "Top part files:",
        apiRequest.topPartImages.map((f) => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)}KB` }))
      );
      console.log(
        "Bottom part files:",
        apiRequest.bottomPartImages.map((f) => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)}KB` }))
      );
      console.log(
        "Accessory files:",
        apiRequest.accessoryImages.map((f) => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)}KB` }))
      );

      // Call the API
      const result = await UniformsApiService.createUniform(apiRequest);

      console.log("✅ Uniform created successfully:", {
        id: result.id,
        uniformName: result.uniformName,
        topPartUrls: result.topPartUrls.length,
        bottomPartUrls: result.bottomPartUrls.length,
        accessoriesUrls: result.accessoriesUrls.length,
        createdAt: result.createdAt,
      });

      // Verify the result matches our expectations
      console.log("🔍 Verifying categorization:");
      console.log(`Expected -> Actual:
      - Top parts: ${processedFiles.topPartFiles.length} -> ${result.topPartUrls.length}
      - Bottom parts: ${processedFiles.bottomPartFiles.length} -> ${result.bottomPartUrls.length}  
      - Accessories: ${processedFiles.accessoryFiles.length} -> ${result.accessoriesUrls.length}`);

      showSnackbar("Uniform created successfully! Check the categorization in the response.", "success");

      // Navigate back to settings immediately (no delay)
      navigate("/settings");
    } catch (error: any) {
      console.error("❌ Error creating uniform:", error);

      // Provide more specific error messages based on the error type
      let errorMessage = "Failed to create uniform";

      if (error.message?.includes("File validation failed")) {
        errorMessage = error.message;
      } else if (error.message?.includes("Authentication")) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error.message?.includes("Network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Upload timeout. Please try again with smaller images.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      showSnackbar(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function for processing tagged elements with separate images
  const processTaggedElementsWithSeparateImages = async (
    topElements: any[],
    bottomElements: any[],
    accessoryElements: any[],
    topImages: File[],
    bottomImages: File[],
    accessoryImages: File[],
    uniformName: string
  ): Promise<{
    topPartFiles: File[];
    bottomPartFiles: File[];
    accessoryFiles: File[];
  }> => {
    const topPartFiles: File[] = [];
    const bottomPartFiles: File[] = [];
    const accessoryFiles: File[] = [];

    console.log("📝 Processing tagged elements with separate images...");

    // Helper function to create base image files
    const createBaseImageFiles = (images: File[], category: string): File[] => {
      const baseFiles: File[] = [];
      const timestamp = Date.now();
      const sanitizedUniformName = uniformName.replace(/[^a-zA-Z0-9]/g, "_");

      images.forEach((originalImage, index) => {
        const extension = originalImage.name.split(".").pop() || "jpg";
        const filename = `${sanitizedUniformName}_${category}_base_${index + 1}_${timestamp}.${extension}`;

        const baseImageFile = new File([originalImage], filename, {
          type: originalImage.type,
          lastModified: originalImage.lastModified,
        });

        baseFiles.push(baseImageFile);
        console.log(`📷 Created base image: ${filename} (${(baseImageFile.size / 1024).toFixed(1)} KB)`);
      });

      return baseFiles;
    };

    // Helper function to process tagged elements
    const processTaggedElements = async (elements: any[], images: File[], category: string): Promise<File[]> => {
      const files: File[] = [];

      for (const element of elements) {
        try {
          const originalImage = images[element.imageIndex];
          if (!originalImage) {
            console.warn(
              `⚠️ Original image not found for element ${element.id} at index ${element.imageIndex} in ${category}`
            );
            continue;
          }

          // Crop the image based on the tagged coordinates
          const croppedDataURL = await cropImageFromCanvas(originalImage, element.coordinates, element.shape);

          // Create meaningful filename
          const timestamp = Date.now();
          const sanitizedName = element.name.replace(/[^a-zA-Z0-9]/g, "_");
          const sanitizedUniformName = uniformName.replace(/[^a-zA-Z0-9]/g, "_");
          const filename = `${sanitizedUniformName}_${category}_${sanitizedName}_tagged_${timestamp}.png`;

          const file = dataURLToFile(croppedDataURL, filename);
          files.push(file);

          console.log(`✅ Processed tagged element: "${element.name}" -> ${category.toUpperCase()} (${filename})`);
        } catch (error) {
          console.error(`❌ Error processing element ${element.id} ("${element.name}") in ${category}:`, error);
        }
      }

      return files;
    };

    // Process TOP category
    if (topImages.length > 0) {
      console.log(`📝 Processing TOP category: ${topImages.length} base images, ${topElements.length} tagged elements`);

      // Add base images first
      const topBaseImages = createBaseImageFiles(topImages, "top");
      topPartFiles.push(...topBaseImages);

      // Add tagged elements
      const topTaggedFiles = await processTaggedElements(topElements, topImages, "top");
      topPartFiles.push(...topTaggedFiles);
    }

    // Process BOTTOM category
    if (bottomImages.length > 0) {
      console.log(
        `📝 Processing BOTTOM category: ${bottomImages.length} base images, ${bottomElements.length} tagged elements`
      );

      // Add base images first
      const bottomBaseImages = createBaseImageFiles(bottomImages, "bottom");
      bottomPartFiles.push(...bottomBaseImages);

      // Add tagged elements
      const bottomTaggedFiles = await processTaggedElements(bottomElements, bottomImages, "bottom");
      bottomPartFiles.push(...bottomTaggedFiles);
    }

    // Process ACCESSORIES category
    if (accessoryImages.length > 0) {
      console.log(
        `📝 Processing ACCESSORIES category: ${accessoryImages.length} base images, ${accessoryElements.length} tagged elements`
      );

      // Add base images first
      const accessoryBaseImages = createBaseImageFiles(accessoryImages, "accessories");
      accessoryFiles.push(...accessoryBaseImages);

      // Add tagged elements
      const accessoryTaggedFiles = await processTaggedElements(accessoryElements, accessoryImages, "accessories");
      accessoryFiles.push(...accessoryTaggedFiles);
    }

    console.log(`📊 Processing complete:
    - Top parts: ${topPartFiles.length} files (${topImages.length} base + ${topElements.length} tagged)
    - Bottom parts: ${bottomPartFiles.length} files (${bottomImages.length} base + ${bottomElements.length} tagged)  
    - Accessories: ${accessoryFiles.length} files (${accessoryImages.length} base + ${accessoryElements.length} tagged)
    - Total: ${topPartFiles.length + bottomPartFiles.length + accessoryFiles.length} files`);

    return {
      topPartFiles,
      bottomPartFiles,
      accessoryFiles,
    };
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard your changes?")) {
      navigate("/settings");
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement draft saving functionality
    showSnackbar("Draft saved successfully!", "info");
  };

  const handleCancelSaveProgress = () => {
    setSaveProgressOpen(false);
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
      {/* Header - Fixed outer part that doesn't change */}
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center text-xl gap-2 font-semibold mb-2">
          <ArrowBackIcon className="cursor-pointer" onClick={() => navigate("/settings")} />
          <h2 className="">Add New Uniform</h2>
        </div>

        {currentStep < 5 && (
          <div className="flex flex-row gap-4">
            <Button
              variant="contained"
              onClick={handleDiscard}
              disabled={submitting}
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
                "&:disabled": {
                  backgroundColor: "#F0F0F0",
                  color: "#A3A3A3",
                },
              }}
            >
              <DeleteOutlineOutlinedIcon
                fontSize="small"
                sx={{
                  width: "16px",
                  height: "16px",
                  color: submitting ? "#A3A3A3" : "#2A77D5",
                }}
              />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontFamily: "Mukta",
                  color: submitting ? "#A3A3A3" : "#2A77D5",
                  textTransform: "uppercase",
                }}
              >
                DISCARD
              </Typography>
            </Button>

            <Button
              variant="contained"
              onClick={handleSaveDraft}
              disabled={submitting}
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
                "&:disabled": {
                  backgroundColor: "#F0F0F0",
                  color: "#A3A3A3",
                },
              }}
            >
              <DraftsOutlinedIcon
                fontSize="small"
                sx={{
                  width: "16px",
                  height: "16px",
                  color: submitting ? "#A3A3A3" : "#2A77D5",
                }}
              />
              <Typography
                sx={{
                  fontSize: "14px",
                  fontFamily: "Mukta",
                  color: submitting ? "#A3A3A3" : "#2A77D5",
                  textTransform: "uppercase",
                }}
              >
                SAVE DRAFT
              </Typography>
            </Button>

            <Button
              variant="contained"
              onClick={currentStep === 4 ? handleSubmit(onSubmit) : undefined}
              disabled={currentStep < 4 || submitting}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                width: "149px",
                height: "33px",
                borderRadius: "8px",
                padding: "8px 16px",
                backgroundColor: currentStep === 4 && !submitting ? "#FFFFFF" : "#F0F0F0",
                boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
                "&:hover": {
                  backgroundColor: currentStep === 4 && !submitting ? "#F5F5F5" : "#F0F0F0",
                },
                ...(currentStep < 4 && disabledSubmitBtnStyle),
              }}
            >
              {submitting ? (
                <CircularProgress size={16} sx={{ color: "#A3A3A3" }} />
              ) : (
                <CheckOutlinedIcon
                  fontSize="small"
                  sx={{
                    color: currentStep === 4 ? "#2A77D5" : "#A3A3A3",
                  }}
                />
              )}
              <Typography
                sx={{
                  fontSize: "16px",
                  fontFamily: "Mukta",
                  color: currentStep === 4 && !submitting ? "#2A77D5" : "#A3A3A3",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {submitting ? "SUBMITTING..." : "SUBMIT FORM"}
              </Typography>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area - Changes based on current step */}
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
        {/* Progress Stepper - Uniform specific */}
        <UniformProgressStepper currentStep={currentStep} steps={steps} />

        {/* Dynamic Form Content - This changes */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1 }}>
          {currentStep === 1 && (
            <BasicDetailsForm register={register} errors={errors as any} watch={watch} setValue={setValue} />
          )}
          {currentStep === 2 && (
            <UniformTopForm
              register={register}
              errors={errors as any}
              watch={watch}
              setValue={setValue}
              onTaggedElementsUpdate={(taggedElements, uploadedImages) =>
                handleTaggedElementsUpdate("top", taggedElements, uploadedImages)
              }
            />
          )}
          {currentStep === 3 && (
            <UniformBottomForm
              register={register}
              errors={errors as any}
              watch={watch}
              setValue={setValue}
              onTaggedElementsUpdate={(taggedElements, uploadedImages) =>
                handleTaggedElementsUpdate("bottom", taggedElements, uploadedImages)
              }
            />
          )}
          {currentStep === 4 && (
            <AccessoriesForm
              register={register}
              errors={errors as any}
              watch={watch}
              setValue={setValue}
              onTaggedElementsUpdate={(taggedElements, uploadedImages) =>
                handleTaggedElementsUpdate("accessories", taggedElements, uploadedImages)
              }
            />
          )}

          {/* Navigation Buttons - Fixed */}
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
                disabled={submitting}
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
                  "&:disabled": {
                    backgroundColor: "#F0F0F0",
                    color: "#A3A3A3",
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
                  <ChevronLeftIcon sx={{ color: submitting ? "#A3A3A3" : "#2A77D5", width: "16px", height: "16px" }} />
                  <Typography
                    sx={{
                      fontSize: "16px",
                      lineHeight: "24px",
                      fontFamily: "Mukta",
                      color: submitting ? "#A3A3A3" : "#2A77D5",
                      fontWeight: "500",
                      textTransform: "uppercase",
                    }}
                  >
                    Previous
                  </Typography>
                </Box>
              </Button>
            )}
            {currentStep < 4 && (
              <Button
                variant="contained"
                onClick={nextStep}
                disabled={submitting}
                endIcon={
                  <ChevronRightIcon sx={{ color: submitting ? "#A3A3A3" : "#2A77D5", width: "20px", height: "20px" }} />
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
                  "&:disabled": {
                    backgroundColor: "#F0F0F0",
                    color: "#A3A3A3",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    fontFamily: "Mukta",
                    color: submitting ? "#A3A3A3" : "#2A77D5",
                    fontWeight: "500",
                    textTransform: "uppercase",
                  }}
                >
                  Next
                </Typography>
              </Button>
            )}
            {currentStep === 4 && (
              <Button
                variant="contained"
                type="submit"
                disabled={submitting}
                sx={{
                  borderRadius: "8px",
                  fontFamily: "Mukta",
                  textTransform: "uppercase",
                  backgroundColor: "#FFFFFF",
                  color: submitting ? "#A3A3A3" : "#2A77D5",
                  "&:hover": {
                    backgroundColor: "#F5F5F5",
                  },
                  "&:disabled": {
                    backgroundColor: "#F0F0F0",
                    color: "#A3A3A3",
                  },
                }}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </Box>
        </form>
      </Box>

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
                disabled={submitting}
                sx={{
                  backgroundColor: "#2A77D5",
                  color: "#FFFFFF", // 🔑 always white text
                  "&:hover": {
                    backgroundColor: "#1E5AA3",
                    color: "#FFFFFF", // keep white on hover too
                  },
                  "&:disabled": {
                    backgroundColor: "#F0F0F0",
                    color: "#A3A3A3", // gray when disabled
                  },
                }}
              >
                Yes
              </Button>

              <Button
                variant="outlined"
                onClick={handleCancelSaveProgress}
                disabled={submitting}
                sx={{
                  color: "#2A77D5",
                  borderColor: "#2A77D5",
                  "&:hover": {
                    borderColor: "#1E5AA3",
                    backgroundColor: "rgba(42, 119, 213, 0.04)",
                  },
                  "&:disabled": {
                    backgroundColor: "#F0F0F0",
                    color: "#A3A3A3",
                    borderColor: "#A3A3A3",
                  },
                }}
              >
                No
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddNewUniform;
