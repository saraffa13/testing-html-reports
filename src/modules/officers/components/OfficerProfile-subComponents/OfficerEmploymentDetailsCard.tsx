// File: src/components/OfficerProfile-subComponents/OfficerEmploymentDetailsCard.tsx
import EditIcon from "@mui/icons-material/Edit";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { formatDateOnly } from "../../../../utils/dateFormatter";
import { useAreasAndManagers } from "../../hooks/useAreasAndManagers";

// Props interface
interface OfficerEmploymentDetailsCardProps {
  employmentDetails: {
    companyId: string;
    dateOfJoining: string;
    designation: string;
    assignedArea: string;
    areaManager: string;
  };
  onEdit: () => void;
  isUpdating?: boolean;
}

// Key-Value pair component for displaying data
const KeyValuePair: React.FC<{ label: string; value: string; isLoading?: boolean }> = ({ label, value, isLoading }) => (
  <Box sx={{ display: "flex", gap: "12px", mb: "8px", alignItems: "flex-start" }}>
    <Typography
      sx={{
        width: "88px",
        fontFamily: "Mukta",
        fontWeight: 400,
        fontSize: "14px",
        lineHeight: "16px",
        color: "#A3A3A3",
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
    {isLoading ? (
      <CircularProgress size={14} />
    ) : (
      <Typography
        sx={{
          flex: 1,
          fontFamily: "Mukta",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "16px",
          color: "#3B3B3B",
          wordBreak: "break-word",
        }}
      >
        {value || "N/A"}
      </Typography>
    )}
  </Box>
);

const OfficerEmploymentDetailsCard: React.FC<OfficerEmploymentDetailsCardProps> = ({
  employmentDetails,
  onEdit,
  isUpdating = false,
}) => {
  const { user } = useAuth();
  const [resolvedAreaName, setResolvedAreaName] = useState<string>("");
  const [resolvedManagerName, setResolvedManagerName] = useState<string>("");

  // Use the areas and managers hooks to resolve names if needed
  const {
    areas,
    managers,
    isLoading: dataLoading,
    getAreaName,
    getManagerName,
  } = useAreasAndManagers(user?.agencyId || null);

  // Resolve area and manager names from IDs if needed
  useEffect(() => {
    // First, just use the values we have directly
    setResolvedAreaName(employmentDetails.assignedArea || "");
    setResolvedManagerName(employmentDetails.areaManager || "");

    // If API data is loaded and we have placeholder text, try to resolve from IDs
    if (areas.length > 0 && managers.length > 0) {
      // Check if assignedArea looks like a placeholder
      if (
        employmentDetails.assignedArea === "Area Assignment" ||
        employmentDetails.assignedArea === "Area Manager" ||
        !employmentDetails.assignedArea
      ) {
        console.log("🔍 Area appears to be placeholder, checking for stored data...");

        // Try to find area by checking if there's only one area for this agency
        if (areas.length === 1) {
          console.log("📍 Using single available area:", areas[0].name);
          setResolvedAreaName(areas[0].name);
        }
      }

      // Check if areaManager looks like a placeholder
      if (
        employmentDetails.areaManager === "Area Manager" ||
        employmentDetails.areaManager === "Area Assignment" ||
        !employmentDetails.areaManager
      ) {
        console.log("🔍 Manager appears to be placeholder, checking for stored data...");

        // Try to find manager by checking if there's only one manager for this agency
        if (managers.length === 1) {
          console.log("👤 Using single available manager:", managers[0].fullName);
          setResolvedManagerName(managers[0].fullName);
        }
      }

      // Check if values are IDs (long strings) and resolve them
      const isAreaId = employmentDetails.assignedArea && employmentDetails.assignedArea.length > 20;
      const isManagerId = employmentDetails.areaManager && employmentDetails.areaManager.length > 20;

      if (isAreaId) {
        const areaName = getAreaName(employmentDetails.assignedArea);
        if (areaName) {
          console.log("📍 Resolved area ID to name:", areaName);
          setResolvedAreaName(areaName);
        }
      }

      if (isManagerId) {
        const managerName = getManagerName(employmentDetails.areaManager);
        if (managerName) {
          console.log("👤 Resolved manager ID to name:", managerName);
          setResolvedManagerName(managerName);
        }
      }
    }

    console.log("🏢 Employment Details Debug:", {
      originalArea: employmentDetails.assignedArea,
      originalManager: employmentDetails.areaManager,
      resolvedArea: resolvedAreaName || employmentDetails.assignedArea,
      resolvedManager: resolvedManagerName || employmentDetails.areaManager,
      areasLoaded: areas.length,
      managersLoaded: managers.length,
    });
  }, [employmentDetails.assignedArea, employmentDetails.areaManager, areas, managers, getAreaName, getManagerName]);

  return (
    <Box
      sx={{
        borderRadius: "10px",
        padding: "16px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minHeight: "150px",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "20px",
            color: "#3B3B3B",
            textTransform: "capitalize",
          }}
        >
          Employment Details
        </Typography>
        <IconButton
          onClick={onEdit}
          disabled={isUpdating}
          sx={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            boxShadow: "0px 1px 4px rgba(112, 112, 112, 0.2)",
            backgroundColor: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#F5F5F5",
            },
            "&.Mui-disabled": {
              backgroundColor: "#F0F0F0",
            },
          }}
        >
          {isUpdating ? (
            <CircularProgress size={14} />
          ) : (
            <EditIcon sx={{ width: "14px", height: "14px", color: "#2A77D5" }} />
          )}
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1 }}>
        <KeyValuePair label="Company ID" value={employmentDetails.companyId || ""} />
        <KeyValuePair
          label="Joining Date"
          value={employmentDetails.dateOfJoining ? formatDateOnly(employmentDetails.dateOfJoining) : ""}
        />
        <KeyValuePair label="Designation" value={employmentDetails.designation || ""} />
        <KeyValuePair
          label="Assigned Area"
          value={resolvedAreaName || "Not assigned"}
          isLoading={dataLoading && !resolvedAreaName}
        />
        <KeyValuePair
          label="Area Manager"
          value={resolvedManagerName || "Not assigned"}
          isLoading={dataLoading && !resolvedManagerName}
        />
      </Box>

      {/* Show a small indicator if data is being resolved */}
      {dataLoading && (resolvedAreaName || resolvedManagerName) && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <CircularProgress size={12} />
          <Typography variant="caption" sx={{ color: "#A3A3A3", fontSize: "10px" }}>
            Loading area information...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OfficerEmploymentDetailsCard;
