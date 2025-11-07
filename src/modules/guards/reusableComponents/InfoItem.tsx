import { Box, Typography } from "@mui/material";
import React from "react";

interface InfoItemProps {
  label: string;
  value: string | number | React.ReactNode;
  minWidth?: string | number;
}

/**
 * Reusable component for displaying label-value pairs in the expansion window
 */
const InfoItem: React.FC<InfoItemProps> = ({ label, value, minWidth = "140px" }) => {
  return (
    <Box sx={{ minWidth: minWidth }}>
      <Typography
        sx={{
          fontFamily: "Mukta",
          fontWeight: 400,
          fontSize: "12px",
          lineHeight: "16px",
          color: "#707070",
        }}
      >
        {label}
      </Typography>
      {typeof value === "string" || typeof value === "number" ? (
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "16px",
            color: "#3B3B3B",
          }}
        >
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  );
};

export default InfoItem;
