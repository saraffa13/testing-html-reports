import { Box, Typography } from "@mui/material";
import React from "react";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  height?: string | number;
  width?: string | number;
}

/**
 * Reusable card component for sections in the expansion window
 */
const SectionCard: React.FC<SectionCardProps> = ({ title, children, height = "auto", width = "502px" }) => {
  return (
    <Box
      sx={{
        width: width,
        height: height,
        padding: "16px",
        gap: "16px",
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        sx={{
          fontFamily: "Mukta",
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: "16px",
          color: "#707070",
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
};

export default SectionCard;
