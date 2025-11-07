import CheckIcon from "@mui/icons-material/Check";
import React from "react";

export interface Step {
  id: number;
  label: string;
}

interface ProgressStepperProps {
  currentStep: number;
  steps?: Step[];
  onStepClick?: (stepId: number) => void;
  disabledSteps?: number[];
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep = 1,
  steps: customSteps,
  onStepClick,
  disabledSteps = [],
}) => {
  const steps = customSteps || [];

  // Compute disabled steps: all steps after the first invalid step
  let computedDisabledSteps: number[] = [];
  let foundInvalid = false;
  for (let i = 0; i < steps.length; i++) {
    if (disabledSteps.includes(steps[i].id)) {
      foundInvalid = true;
    }
    if (foundInvalid) {
      computedDisabledSteps.push(steps[i].id);
    }
  }

  return (
    <div className="flex justify-center items-center w-full bg-blue-50 py-2 px-4 rounded-md">
      <div className="flex items-center justify-center w-full max-w-xl">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isFuture = step.id > currentStep;
          const isDisabled = computedDisabledSteps.includes(step.id);
          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1">
              <div className="relative w-full flex items-center justify-center">
                {/* Connecting lines */}
                {index < steps.length - 1 && (
                  <div
                    className={`border-t-2 border-dashed absolute left-1/2 right-0 w-1/2 z-0 ${
                      isCompleted ? "border-blue-500" : "border-gray-300"
                    }`}
                  ></div>
                )}
                {index > 0 && (
                  <div
                    className={`border-t-2 border-dashed absolute right-1/2 left-0 w-1/2 z-0 ${
                      steps[index - 1].id < currentStep ? "border-blue-500" : "border-gray-300"
                    }`}
                  ></div>
                )}

                {/* Step circle as button */}
                <button
                  type="button"
                  disabled={isDisabled || isFuture}
                  onClick={() => {
                    if (onStepClick && !isDisabled && !isFuture) onStepClick(step.id);
                  }}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium z-10 focus:outline-none transition-all
                    ${isCompleted ? "bg-blue-500 text-white border-none cursor-pointer" : ""}
                    ${isCurrent ? "border-blue-500 text-blue-500 border-2 border-dotted bg-white cursor-pointer" : ""}
                    ${isFuture ? "bg-white text-gray-400 border-gray-300 cursor-not-allowed" : ""}
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  aria-label={`Go to step ${step.label}`}
                >
                  {isCompleted ? <CheckIcon fontSize="small" /> : step.id}
                </button>
              </div>

              {/* Step label */}
              <div className="mt-2 text-center">
                <p
                  className={`text-sm font-medium ${
                    step.id <= currentStep ? "text-blue-500 underline" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;
