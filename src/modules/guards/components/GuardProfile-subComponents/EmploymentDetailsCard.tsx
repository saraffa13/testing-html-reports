// File: src/components/profile/EmploymentDetailsCard.tsx
import EditIcon from "@mui/icons-material/Edit";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import React from "react";
import { formatDateOnly } from "../../../../utils/dateFormatter";
import { useGuardTypes } from "../../hooks/useGuardTypes";

// Props interface
interface EmploymentDetailsCardProps {
  employmentDetails: {
    companyId: string;
    dateOfJoining: string;
    guardType: string;
    psaraCertificationStatus: string;
  };
  onEdit: () => void;
  isUpdating?: boolean;
  agencyId?: string;
  guardTypeId?: string; // The actual guard type ID from API
}

// Key-Value pair component for displaying data
const KeyValuePair: React.FC<{ label: string; value: string }> = ({ label, value }) => (
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
  </Box>
);

const EmploymentDetailsCard: React.FC<EmploymentDetailsCardProps> = ({
  employmentDetails,
  onEdit,
  isUpdating = false,
  agencyId,
  guardTypeId,
}) => {
  // Fetch guard types to get the proper guard type name
  const { data: guardTypes } = useGuardTypes(agencyId || "", { enabled: !!agencyId });

  // Find the guard type name from the ID
  const guardTypeName = guardTypes?.find((gt) => gt.id === guardTypeId)?.typeName || employmentDetails.guardType;

  // Format PSARA status for display
  const formatPsaraStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "COMPLETED":
        return "Completed";
      case "IN_PROGRESS":
        return "In Progress";
      case "REJECTED":
        return "Rejected";
      case "EXPIRED":
        return "Expired";
      default:
        return status || "N/A";
    }
  };
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
        <KeyValuePair label="Designation" value={guardTypeName || ""} />
        <KeyValuePair label="PSARA Status" value={formatPsaraStatus(employmentDetails.psaraCertificationStatus)} />
      </Box>
    </Box>
  );
};

export default EmploymentDetailsCard;
