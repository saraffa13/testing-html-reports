// File: src/components/OfficerProfile-subComponents/OfficerPersonalDetailsCard.tsx
import EditIcon from "@mui/icons-material/Edit";
import { Box, CircularProgress, Divider, IconButton, Typography } from "@mui/material";
import React from "react";
import { formatDateOnly } from "../../../../utils/dateFormatter";

// Props interface
interface OfficerPersonalDetailsCardProps {
  personalDetails: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    age?: number;
    sex?: string;
    bloodGroup?: string;
    nationality?: string;
    height?: string;
    weight?: string;
    identificationMark?: string;
    fatherName?: string;
    motherName?: string;
    maritalStatus?: string;
    spouseName?: string;
  };
  onEdit: () => void;
  isUpdating?: boolean;
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

const OfficerPersonalDetailsCard: React.FC<OfficerPersonalDetailsCardProps> = ({
  personalDetails,
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
        minHeight: "300px",
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
          Personal
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
        {/* BASIC Section */}
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "12px",
            lineHeight: "16px",
            color: "#707070",
            textTransform: "uppercase",
            mb: "8px",
          }}
        >
          BASIC
        </Typography>

        <Box sx={{ mb: "16px" }}>
          <KeyValuePair
            label="Full Name"
            value={`${personalDetails.firstName} ${personalDetails.middleName || ""} ${personalDetails.lastName}`
              .replace(/\s+/g, " ")
              .trim()}
          />
          <KeyValuePair label="Email" value={personalDetails.email} />
          <KeyValuePair label="Date of Birth" value={formatDateOnly(personalDetails.dateOfBirth)} />
          <KeyValuePair label="Age" value={personalDetails.age?.toString() || ""} />
          <KeyValuePair label="Sex" value={personalDetails.sex || ""} />
          <KeyValuePair label="Blood Group" value={personalDetails.bloodGroup || ""} />
          <KeyValuePair label="Nationality" value={personalDetails.nationality || ""} />
          <KeyValuePair label="Height" value={personalDetails.height ? `${personalDetails.height} cm` : ""} />
          <KeyValuePair label="Weight" value={personalDetails.weight ? `${personalDetails.weight} kg` : ""} />
          {personalDetails.identificationMark && (
            <KeyValuePair label="ID Mark" value={personalDetails.identificationMark} />
          )}
        </Box>

        <Divider sx={{ borderColor: "#F0F0F0", mb: "16px" }} />

        {/* RELATIONS Section */}
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "12px",
            lineHeight: "16px",
            color: "#707070",
            textTransform: "uppercase",
            mb: "8px",
          }}
        >
          RELATIONS
        </Typography>

        <Box>
          <KeyValuePair label="Father's Name" value={personalDetails.fatherName || ""} />
          {personalDetails.motherName && <KeyValuePair label="Mother's Name" value={personalDetails.motherName} />}
          <KeyValuePair label="Marital Status" value={personalDetails.maritalStatus || ""} />
          {personalDetails.spouseName && <KeyValuePair label="Spouse's Name" value={personalDetails.spouseName} />}
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerPersonalDetailsCard;
