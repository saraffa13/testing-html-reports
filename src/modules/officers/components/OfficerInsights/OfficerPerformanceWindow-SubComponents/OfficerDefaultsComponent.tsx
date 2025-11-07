import { Box, Typography } from "@mui/material";
import React, { useState } from "react";
import OfficerDefaultFilterTabs from "./OfficerDefaultFilterTabs";
import OfficerTimeWheelContent from "./OfficerTimeWheelContent";
import OfficerUniformContent from "./OfficerUniformContent";
import type { OfficerDefaultData, OfficerDefaultType } from "./officer-defaults-types";

interface OfficerDefaultsCardProps {
  defaults: OfficerDefaultData[];
  width?: string | number;
  height?: string | number;
}

/**
 * Main officer defaults card component that displays officer defaults with filter tabs
 * Officers only have Late and Uniform defaults
 */
const OfficerDefaultsCard: React.FC<OfficerDefaultsCardProps> = ({ defaults, width = "502px", height = "288px" }) => {
  // Get available default types (only Late and Uniform for officers)
  const availableTypes = defaults.map((d) => d.type);

  // Set initial selected type to first available type
  const [selectedType, setSelectedType] = useState<OfficerDefaultType>(
    availableTypes.length > 0 ? availableTypes[0] : "LATE"
  );

  // Get selected default data
  const selectedDefault = defaults.find((d) => d.type === selectedType);

  // Get title text based on selected type
  const getTitleText = (): string => {
    switch (selectedType) {
      case "LATE":
        return "DEFAULTS : LATE";
      case "UNIFORM":
        return "DEFAULTS : UNIFORM";
      default:
        return "DEFAULTS";
    }
  };

  // Render content based on selected type
  const renderContent = () => {
    if (!selectedDefault) {
      return (
        <Box
          sx={{
            width: "470px",
            height: "168px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "16px",
              color: "#707070",
            }}
          >
            No data available for this default type.
          </Typography>
        </Box>
      );
    }

    switch (selectedType) {
      case "UNIFORM":
        return <OfficerUniformContent errors={selectedDefault.uniformErrors || []} />;
      case "LATE":
        return (
          <OfficerTimeWheelContent
            timeWheelData={selectedDefault.timeWheel!}
            displayText={selectedDefault.displayText || ""}
          />
        );
      default:
        return null;
    }
  };

  // If no defaults available, show empty state
  if (defaults.length === 0) {
    return (
      <Box
        sx={{
          width: width,
          height: height,
          borderRadius: "10px",
          padding: "16px",
          gap: "16px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Empty State Icon */}
        <Box
          sx={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#F0F0F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "32px",
              color: "#CCCCCC",
            }}
          >
            👮
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "16px",
            color: "#CCCCCC",
            textAlign: "center",
          }}
        >
          DEFAULTS
        </Typography>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 400,
            fontSize: "14px",
            color: "#CCCCCC",
            textAlign: "center",
          }}
        >
          NO RECENT
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: width,
        height: height,
        borderRadius: "10px",
        padding: "16px",
        gap: "16px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Heading */}
      <Box
        sx={{
          width: "470px",
          height: "72px",
          gap: "8px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title */}
        <Box
          sx={{
            width: "470px",
            height: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "3px",
            paddingBottom: "3px",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "20px",
              textAlign: "center",
              textTransform: "capitalize",
              color: "#3B3B3B",
            }}
          >
            {getTitleText()}
          </Typography>
        </Box>

        {/* Filter Tabs - Only Late and Uniform */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            paddingTop: "8px",
          }}
        >
          <OfficerDefaultFilterTabs
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            availableTypes={availableTypes}
          />
        </Box>
      </Box>

      {/* Content */}
      {renderContent()}
    </Box>
  );
};

export default OfficerDefaultsCard;
