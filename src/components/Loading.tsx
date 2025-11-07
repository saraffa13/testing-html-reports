// File: src/components/Loading.tsx
import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

interface LoadingProps {
  message?: string;
  size?: number;
  fullHeight?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message = "Loading...", size = 40, fullHeight = true }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: fullHeight ? "100vh" : "200px",
        gap: 2,
        padding: 3,
      }}
    >
      <CircularProgress
        size={size}
        sx={{
          color: "#2A77D5",
        }}
      />
      <Typography
        sx={{
          fontFamily: "Mukta",
          color: "#707070",
          fontSize: "16px",
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;
