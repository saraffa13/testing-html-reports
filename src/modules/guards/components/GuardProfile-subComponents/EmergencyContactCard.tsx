// File: src/components/profile/EmergencyContactCard.tsx
import EditIcon from "@mui/icons-material/Edit";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import React from "react";

// Props interface
interface EmergencyContactCardProps {
  emergencyContact: {
    firstName: string;
    lastName: string;
    relationship: string;
    contactNumber: string;
  };
  onEdit: () => void;
  isUpdating?: boolean;
}

const EmergencyContactCard: React.FC<EmergencyContactCardProps> = ({
  emergencyContact,
  onEdit,
  isUpdating = false,
}) => {
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
          Emergency Contact
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
      <Box
        sx={{
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: "#F7F7F7",
          flex: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "16px",
            color: "#3B3B3B",
            mb: "4px",
          }}
        >
          {`${emergencyContact.firstName} ${emergencyContact.lastName}`.trim() || "N/A"}
        </Typography>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "12px",
            lineHeight: "16px",
            color: "#3B3B3B",
            mb: "4px",
          }}
        >
          {emergencyContact.relationship || "N/A"}
        </Typography>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "16px",
            color: "#3B3B3B",
          }}
        >
          {emergencyContact.contactNumber || "N/A"}
        </Typography>
      </Box>
    </Box>
  );
};

export default EmergencyContactCard;
