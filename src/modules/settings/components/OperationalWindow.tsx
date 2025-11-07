// File: components/settings/OperationalWindow.tsx
import { Alert, Box, CircularProgress, Snackbar, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useSettings } from "../context/SettingsContext";
// Fix: Correct import paths to match your actual file structure
import { AreaManagersCard, AreasCard, GuardTypesCard, SiteTypesCard } from "./operational";

const OperationalWindow: React.FC = () => {
  const { loading, error, initializeOperationalSettings } = useSettings();

  // Initialize settings when component mounts
  useEffect(() => {
    console.log("📝 OperationalWindow mounted, initializing settings");
    initializeOperationalSettings();
  }, [initializeOperationalSettings]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Show snackbar for global errors
  useEffect(() => {
    if (error) {
      showSnackbar(error, "error");
    }
  }, [error]);

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "warning" | "info" = "success") => {
      setSnackbar({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          borderRadius: "12px",
          padding: "16px",
          background: "#F7F7F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography sx={{ fontFamily: "Mukta", fontSize: "18px", color: "#707070" }}>
          Loading operational settings...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          borderRadius: "12px",
          padding: "16px",
          background: "#F7F7F7",
        }}
      >
        <Box
          sx={{
            width: "1020px",
            height: "808px",
            gap: "12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              width: "1020px",
              height: "32px",
              gap: "8px",
            }}
          >
            <Box
              sx={{
                width: "908px",
                height: "24px",
                gap: "16px",
              }}
            >
              <Typography
                sx={{
                  width: "190px",
                  height: "24px",
                  paddingTop: "5px",
                  paddingBottom: "4px",
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "32px",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                }}
              >
                Operational Setup
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Box
            sx={{
              width: "1020px",
              height: "1px",
              border: "1px solid #FFFFFF",
            }}
          />

          {/* Content */}
          <Box
            sx={{
              width: "1020px",
              height: "752px",
              gap: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Row 1 - Guard Types and Areas */}
            <Box sx={{ display: "flex", gap: "16px" }}>
              <GuardTypesCard
                onSuccess={(message) => showSnackbar(message, "success")}
                onError={(message) => showSnackbar(message, "error")}
              />
              <AreasCard
                onSuccess={(message) => showSnackbar(message, "success")}
                onError={(message) => showSnackbar(message, "error")}
              />
            </Box>

            {/* Row 2 - Area Managers and Site Types */}
            <Box sx={{ display: "flex", gap: "16px" }}>
              <AreaManagersCard
                onSuccess={(message) => showSnackbar(message, "success")}
                onError={(message) => showSnackbar(message, "error")}
              />
              <SiteTypesCard
                onSuccess={(message) => showSnackbar(message, "success")}
                onError={(message) => showSnackbar(message, "error")}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Global Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OperationalWindow;
