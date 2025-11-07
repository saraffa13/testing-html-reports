import { AccessTime } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import React from "react";
import { LuShirt } from "react-icons/lu";
import type { OfficerDefaultType } from "./officer-defaults-types";

interface OfficerDefaultFilterTabsProps {
  selectedType: OfficerDefaultType | null;
  onTypeChange: (type: OfficerDefaultType) => void;
  availableTypes: OfficerDefaultType[];
}

const getOfficerDefaultIcon = (type: OfficerDefaultType) => {
  switch (type) {
    case "LATE":
      return <AccessTime sx={{ width: 24, height: 24 }} />;
    case "UNIFORM":
      return <LuShirt style={{ width: 24, height: 24 }} />;
    default:
      return null;
  }
};

/**
 * Filter tabs for selecting different officer default types (only Late and Uniform)
 */
const OfficerDefaultFilterTabs: React.FC<OfficerDefaultFilterTabsProps> = ({
  selectedType,
  onTypeChange,
  availableTypes,
}) => {
  const allTypes: OfficerDefaultType[] = ["LATE", "UNIFORM"];

  return (
    <Box
      sx={{
        width: "96px", // Reduced width since only 2 tabs
        height: "48px",
        display: "flex",
        gap: "8px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {allTypes.map((type) => {
        const isSelected = selectedType === type;
        const isAvailable = availableTypes.includes(type);

        return (
          <IconButton
            key={type}
            onClick={() => isAvailable && onTypeChange(type)}
            disabled={!isAvailable}
            sx={{
              width: "44px",
              height: "48px",
              borderRadius: "8px",
              padding: "10px",
              backgroundColor: isSelected ? "#1D68C3" : "#FFFFFFA3",
              boxShadow: "0px 1px 4px 0px #70707033",
              color: isSelected ? "#FFFFFF" : "#629DE4",
              opacity: isAvailable ? 1 : 0.5,
              "&:hover": {
                backgroundColor: isSelected ? "#1557A6" : isAvailable ? "#F0F7FF" : "#FFFFFFA3",
              },
              "&:disabled": {
                opacity: 0.3,
              },
            }}
          >
            {getOfficerDefaultIcon(type)}
          </IconButton>
        );
      })}
    </Box>
  );
};

export default OfficerDefaultFilterTabs;
