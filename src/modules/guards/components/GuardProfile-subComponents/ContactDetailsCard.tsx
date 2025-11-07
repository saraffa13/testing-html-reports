// File: src/components/profile/ContactDetailsCard.tsx
import EditIcon from "@mui/icons-material/Edit";
import { Box, CircularProgress, Divider, IconButton, Typography } from "@mui/material";
import React from "react";

// Props interface
interface ContactDetailsCardProps {
  contactDetails: {
    mobileNumber: string;
    alternateNumber?: string;
  };
  address: {
    localAddress: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      district?: string;
      pincode: string;
      state: string;
      landmark?: string;
    };
    permanentAddress: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      district?: string;
      pincode: string;
      state: string;
      landmark?: string;
    };
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

// Address Key-Value pair component for multi-line addresses
const AddressKeyValuePair: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: "flex", gap: "12px", mb: "12px", alignItems: "flex-start" }}>
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
        whiteSpace: "pre-line",
        wordBreak: "break-word",
      }}
    >
      {value || "N/A"}
    </Typography>
  </Box>
);

const ContactDetailsCard: React.FC<ContactDetailsCardProps> = ({
  contactDetails,
  address,
  onEdit,
  isUpdating = false,
}) => {
  // Create formatted address strings
  const localAddressString = `${address.localAddress.addressLine1}${
    address.localAddress.addressLine2 ? ", " + address.localAddress.addressLine2 : ""
  }\n${address.localAddress.city}, ${address.localAddress.district || ""}\n${address.localAddress.state} - ${
    address.localAddress.pincode
  }`;

  const permanentAddressString = `${address.permanentAddress.addressLine1}${
    address.permanentAddress.addressLine2 ? ", " + address.permanentAddress.addressLine2 : ""
  }\n${address.permanentAddress.city}, ${address.permanentAddress.district || ""}\n${
    address.permanentAddress.state
  } - ${address.permanentAddress.pincode}`;

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
          Contact
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
        {/* CONTACT NUMBER Section */}
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
          CONTACT NUMBER
        </Typography>

        <Box sx={{ mb: "16px" }}>
          <KeyValuePair label="Phone Number" value={contactDetails.mobileNumber} />
          {contactDetails.alternateNumber && <KeyValuePair label="Alternate" value={contactDetails.alternateNumber} />}
        </Box>

        <Divider sx={{ borderColor: "#F0F0F0", mb: "16px" }} />

        {/* ADDRESS Section */}
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
          ADDRESS
        </Typography>

        <Box>
          <AddressKeyValuePair label="Local Address" value={localAddressString} />
          <AddressKeyValuePair label="Permanent Address" value={permanentAddressString} />
        </Box>
      </Box>
    </Box>
  );
};

export default ContactDetailsCard;
