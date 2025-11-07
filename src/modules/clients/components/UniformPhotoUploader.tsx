import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { Button, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import FileUpload from "../../../components/FileUpload";
import { ProgressStepper } from "../../../components/ProgressStepper";

interface ClientUniformForm {
  uniformName: string;
  top: boolean;
  bottom: boolean;
  accessories: boolean;
  topPhotos: (File | string)[];
  bottomPhotos: (File | string)[];
  accessoriesPhotos: (File | string)[];
}

interface UniformPhotoUploaderProps {
  onCancel: () => void;
}

type UniformPartType = "top" | "bottom" | "accessories";

interface Step {
  id: number;
  label: string;
  type: UniformPartType;
}

const UniformPhotoUploader: React.FC<UniformPhotoUploaderProps> = ({ onCancel }) => {
  const { watch, setValue } = useFormContext<ClientUniformForm>();

  const hasTop = !!watch("top");
  const hasBottom = !!watch("bottom");
  const hasAccessories = !!watch("accessories");
  const topPhotos = watch("topPhotos") || [];
  const bottomPhotos = watch("bottomPhotos") || [];
  const accessoriesPhotos = watch("accessoriesPhotos") || [];

  const photoSteps: Step[] = [];
  let stepId = 2;
  if (hasTop) photoSteps.push({ id: stepId++, label: "UNIFORM TOP", type: "top" });
  if (hasBottom) photoSteps.push({ id: stepId++, label: "UNIFORM BOTTOM", type: "bottom" });
  if (hasAccessories) photoSteps.push({ id: stepId++, label: "ACCESSORIES", type: "accessories" });

  const [currentStep, setCurrentStep] = useState(2);
  const [disabledSteps, setDisabledSteps] = useState<number[]>([]);

  useEffect(() => {
    if (hasTop && topPhotos.length === 0) {
      setValue("topPhotos", [""], { shouldValidate: true });
    }

    if (hasBottom && bottomPhotos.length === 0) {
      setValue("bottomPhotos", [""], { shouldValidate: true });
    }

    if (hasAccessories && accessoriesPhotos.length === 0) {
      setValue("accessoriesPhotos", [""], { shouldValidate: true });
    }
  }, [hasTop, hasBottom, hasAccessories, setValue, topPhotos.length, bottomPhotos.length, accessoriesPhotos.length]);

  const goToNextStep = () => {
    const currentStepIndex = photoSteps.findIndex((step) => step.id === currentStep);
    // Always check if the first photo step is valid and update disabledSteps accordingly
    const firstStep = photoSteps[0];
    const firstStepValid = firstStep ? validateStep(firstStep.id) : true;
    const newDisabledSteps: number[] = [];
    if (!firstStepValid && firstStep) {
      newDisabledSteps.push(firstStep.id);
    }
    setDisabledSteps(newDisabledSteps);
    if (currentStepIndex === photoSteps.length - 1 || currentStepIndex === -1) {
      onCancel();
    } else {
      const nextStep = photoSteps[currentStepIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep.id);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentStepIndex = photoSteps.findIndex((step) => step.id === currentStep);

    if (currentStepIndex <= 0) {
      onCancel();
    } else {
      const prevStep = photoSteps[currentStepIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep.id);
      }
    }
  };

  const handleFileChange = (file: File | null, type: UniformPartType, index: number) => {
    if (!file) return;

    let updatedPhotos: (File | string)[] = [];

    switch (type) {
      case "top": {
        updatedPhotos = [...topPhotos];
        updatedPhotos[index] = file;
        if (index === updatedPhotos.length - 1) {
          updatedPhotos.push("");
        }
        setValue("topPhotos", updatedPhotos, { shouldValidate: true });
        break;
      }
      case "bottom": {
        updatedPhotos = [...bottomPhotos];
        updatedPhotos[index] = file;
        if (index === updatedPhotos.length - 1) {
          updatedPhotos.push("");
        }
        setValue("bottomPhotos", updatedPhotos, { shouldValidate: true });
        break;
      }
      case "accessories": {
        updatedPhotos = [...accessoriesPhotos];
        updatedPhotos[index] = file;
        if (index === updatedPhotos.length - 1) {
          updatedPhotos.push("");
        }
        setValue("accessoriesPhotos", updatedPhotos, { shouldValidate: true });
        break;
      }
    }
  };

  const getCurrentStep = () => {
    if (photoSteps.length === 0) {
      return null;
    }

    return photoSteps.find((step) => step.id === currentStep);
  };

  const getPhotosForType = (type: UniformPartType) => {
    switch (type) {
      case "top":
        return topPhotos;
      case "bottom":
        return bottomPhotos;
      case "accessories":
        return accessoriesPhotos;
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    const step = getCurrentStep();

    if (!step) {
      return (
        <div className="flex items-center justify-center h-64">
          <Typography variant="body1" color="textSecondary">
            No uniform parts selected. Please go back and select at least one part.
          </Typography>
        </div>
      );
    }

    return renderPhotoUploader(step.type, step.label);
  };

  const renderPhotoUploader = (type: UniformPartType, label: string) => {
    const photos = getPhotosForType(type);

    return (
      <Paper elevation={0} className="p-6 bg-gray-50 rounded-md">
        <Typography variant="h6" className="font-medium text-blue-800 mb-4">
          {label}
        </Typography>

        <div className="flex flex-row flex-wrap mt-4 gap-6">
          {photos.map((photo, index) => (
            <div key={`${type}-photo-container-${index}`} className="relative">
              {photo && (
                <div className="flex flex-col gap-2 w-[10vw]">
                  <span className="text-sm text-gray-600">Photo {index + 1} uploaded</span>
                  <div className="relative w-full h-full overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={photo instanceof File ? URL.createObjectURL(photo) : typeof photo === "string" ? photo : ""}
                      alt={`${type} photo ${index + 1}`}
                      className="h-full w-full object-fill"
                    />
                  </div>
                </div>
              )}

              {!photo && (
                <div className="w-[10vw]">
                  <FileUpload
                    label={`Upload ${type} Photo ${index + 1}`}
                    maxSize={5}
                    acceptedFileTypes="image/*"
                    onFileChange={(file) => handleFileChange(file, type, index)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Paper>
    );
  };

  const allSteps = [
    { id: 1, label: "BASIC DETAILS" },
    ...photoSteps.map((step) => ({ id: step.id, label: step.label })),
  ];

  const validateStep = (stepId: number) => {
    const step = photoSteps.find((s) => s.id === stepId);
    if (!step) return true;
    const photos = getPhotosForType(step.type);
    // At least one photo must be uploaded for the step
    return photos.some((photo) => photo && photo !== "");
  };

  const handleStepClick = (stepId: number) => {
    if (stepId === currentStep) return;
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      return;
    }
    if (validateStep(currentStep) && stepId === currentStep + 1) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl p-6">
      <div className="mb-6">
        <ProgressStepper
          currentStep={currentStep}
          steps={allSteps}
          onStepClick={handleStepClick}
          disabledSteps={disabledSteps}
        />
      </div>

      <div className="flex-1 mb-6">{renderStepContent()}</div>

      <div className="flex ml-auto gap-4 mt-auto">
        <Button onClick={goToPreviousStep}>
          <ArrowBackIosIcon /> Previous
        </Button>
        <Button variant="contained" color="primary" onClick={goToNextStep}>
          {photoSteps.findIndex((step) => step.id === currentStep) === photoSteps.length - 1 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default UniformPhotoUploader;
