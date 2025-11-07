import CheckIcon from "@mui/icons-material/Check";
import { Box } from "@mui/material";
import React from "react";

interface UniformStep {
  id: number;
  label: string;
}

interface UniformProgressStepperProps {
  currentStep: number;
  steps: UniformStep[];
}

const UniformProgressStepper: React.FC<UniformProgressStepperProps> = ({ currentStep, steps }) => {
  // Calculate the width for each segment
  const segmentWidth = 100 / (steps.length - 1);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#F0F7FF",
        px: 2,
        borderRadius: "4px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "714px",
          position: "relative",
          height: "50px", // Fixed height
        }}
      >
        {/* Single connector line */}
        <Box
          sx={{
            position: "absolute",
            top: "16px", // Align with circles
            left: "2.5%", // Start a bit after the first circle
            width: "95%", // End a bit before the last circle
            height: "2px",
            borderTop: "2px dashed #D1D1D1",
            zIndex: 0,
          }}
        />

        {/* Step circles and labels */}
        {steps.map((step, index) => {
          // Calculate position percentage (0% for first, 100% for last)
          const position = index === 0 ? 0 : index === steps.length - 1 ? 100 : index * segmentWidth;

          return (
            <Box
              key={step.id}
              sx={{
                position: "absolute",
                left: `${position}%`,
                transform: "translateX(-50%)", // Center the circle at the position
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 1,
              }}
            >
              {/* Step circle */}
              <Box
                sx={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 500,
                  backgroundColor: step.id < currentStep ? "#2A77D5" : "#FFFFFF",
                  color: step.id < currentStep ? "#FFFFFF" : step.id === currentStep ? "#2A77D5" : "#A3A3A3",
                  border:
                    step.id < currentStep
                      ? "none"
                      : step.id === currentStep
                        ? "2px dotted #2A77D5"
                        : "2px solid #A3A3A3",
                }}
              >
                {step.id < currentStep ? <CheckIcon fontSize="small" /> : step.id}
              </Box>

              {/* Step label */}
              <Box
                sx={{
                  mt: 1,
                  textAlign: "center",
                }}
              >
                <Box
                  component="p"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: step.id <= currentStep ? "#2A77D5" : "#707070",
                    textDecoration: step.id <= currentStep ? "underline" : "none",
                    fontFamily: "Mukta",
                    whiteSpace: "nowrap",
                    margin: 0,
                  }}
                >
                  {step.label}
                </Box>
              </Box>
            </Box>
          );
        })}

        {/* Completed segments of the connector line */}
        {steps.map((_step, index) => {
          if (index >= currentStep - 1 || index === steps.length - 1) return null;

          const startPosition = index === 0 ? 2.5 : index * segmentWidth;
          const endPosition = (index + 1) * segmentWidth;
          const width = endPosition - startPosition;

          return (
            <Box
              key={`completed-line-${index}`}
              sx={{
                position: "absolute",
                top: "16px",
                left: `${startPosition}%`,
                width: `${width}%`,
                height: "2px",
                borderTop: "2px dashed #2A77D5",
                zIndex: 0,
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default UniformProgressStepper;
