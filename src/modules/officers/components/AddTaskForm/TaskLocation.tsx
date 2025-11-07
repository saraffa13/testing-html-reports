// File: src/modules/officers/components/AddTaskForm/TaskLocation.tsx - Final errorless version
import AddIcon from "@mui/icons-material/Add";
import { Box, CircularProgress, Typography } from "@mui/material";
import React, { useState } from "react";
import type { TransformedClientSite } from "../../service/clientSitesApiService";
import { useClientSites } from "../../service/clientSitesApiService";
import CustomLocationModal from "./CustomLocationModal";

interface TaskLocationData {
  selectedSites: Array<{
    siteId: string;
    clientId: string;
    siteName: string;
    clientName: string;
    clientLogo?: string;
  }>;
  customLocation?: string;
  isCustomLocation: boolean;
}

interface TaskLocationFormProps {
  data: TaskLocationData;
  areaOfficerId: string | null; // Officer's guardId
  onUpdate: (data: Partial<TaskLocationData>) => void;
}

const TaskLocationForm: React.FC<TaskLocationFormProps> = ({ data, areaOfficerId, onUpdate }) => {
  const [customLocationModalOpen, setCustomLocationModalOpen] = useState(false);

  // Use the existing client sites hook
  const {
    data: clientSites = [],
    isLoading: loadingClients,
    error: clientsError,
  } = useClientSites(areaOfficerId, !!areaOfficerId);

  const handleSiteSelect = (site: TransformedClientSite) => {
    const siteData = {
      siteId: site.siteId,
      clientId: site.clientId,
      siteName: site.siteName,
      clientName: site.client,
      clientLogo: site.clientLogo,
    };

    const selectedSites = data.selectedSites.some((s) => s.siteId === site.siteId)
      ? data.selectedSites.filter((s) => s.siteId !== site.siteId)
      : [...data.selectedSites, siteData];

    onUpdate({
      selectedSites,
      isCustomLocation: false,
      customLocation: undefined,
    });
  };

  const handleAddCustomLocation = () => {
    setCustomLocationModalOpen(true);
  };

  const handleCustomLocationSave = (locationName: string) => {
    onUpdate({
      customLocation: locationName,
      isCustomLocation: true,
      selectedSites: [], // Clear selected sites when using custom location
    });
    setCustomLocationModalOpen(false);
  };

  const handleCustomLocationClose = () => {
    setCustomLocationModalOpen(false);
  };

  const clearCustomLocation = () => {
    onUpdate({
      customLocation: undefined,
      isCustomLocation: false,
    });
  };

  return (
    <Box
      sx={{
        width: "1136px",
        height: "552px",
        padding: "24px",
        gap: "24px",
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Title */}
      <Typography
        variant="h1"
        sx={{
          fontFamily: "Mukta",
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "32px",
          color: "#2A77D5",
          textTransform: "capitalize",
          mb: 3,
        }}
      >
        TASK LOCATION
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Label */}
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "16px",
            color: "#707070",
            textTransform: "capitalize",
          }}
        >
          Select a Task Location
        </Typography>

        {/* Custom Location Section */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {/* Add New Location Button */}
          <Box
            onClick={handleAddCustomLocation}
            sx={{
              width: "112px",
              height: "90px",
              padding: "12px",
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 1px 4px 0px #70707033",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: data.isCustomLocation ? "2px solid #2A77D5" : "none",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
            }}
          >
            <AddIcon sx={{ width: "32px", height: "32px", color: "#2A77D5", mb: 1 }} />
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "14px",
                textAlign: "center",
                textTransform: "uppercase",
                color: "#3B3B3B",
              }}
            >
              Add New Location
            </Typography>
          </Box>

          {/* Custom Location Display */}
          {data.isCustomLocation && data.customLocation && (
            <Box
              sx={{
                width: "220px",
                height: "90px",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#E3F0FF",
                border: "2px solid #2A77D5",
                boxShadow: "0px 1px 4px 0px #70707033",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* Close button */}
              <Box
                onClick={clearCustomLocation}
                sx={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#FF4444",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#CC3333",
                  },
                }}
              >
                ×
              </Box>

              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "14px",
                  textAlign: "center",
                  color: "#2A77D5",
                  wordBreak: "break-word",
                }}
              >
                {data.customLocation}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  textAlign: "center",
                  color: "#707070",
                  mt: 0.5,
                }}
              >
                Custom Location
              </Typography>
            </Box>
          )}
        </Box>

        {/* Error Display */}
        {clientsError && (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontSize: "14px",
                color: "#E05952",
                textAlign: "center",
              }}
            >
              Failed to load client sites. Please try again.
            </Typography>
          </Box>
        )}

        {/* Client Sites Section */}
        {!data.isCustomLocation && (
          <Box>
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "12px",
                color: "#707070",
                textTransform: "capitalize",
                mb: 1,
              }}
            >
              Client Sites
            </Typography>

            {loadingClients ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                <CircularProgress color="primary" />
              </Box>
            ) : clientSites.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(136px, 1fr))",
                  gap: "16px",
                  maxHeight: "318px",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#dddddd",
                    borderRadius: "3px",
                  },
                }}
              >
                {clientSites.map((site) => {
                  const isSelected = data.selectedSites.some((s) => s.siteId === site.siteId);

                  return (
                    <Box
                      key={site.siteId}
                      onClick={() => handleSiteSelect(site)}
                      sx={{
                        width: "136px",
                        height: "112px",
                        padding: "12px",
                        borderRadius: "12px",
                        backgroundColor: isSelected ? "#E3F0FF" : "#FFFFFF",
                        border: isSelected ? "2px solid #2A77D5" : "none",
                        boxShadow: "0px 1px 4px 0px #70707033",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: isSelected ? "#E3F0FF" : "#F5F5F5",
                          transform: "translateY(-2px)",
                          boxShadow: "0px 4px 8px 0px #70707040",
                        },
                      }}
                    >
                      {/* Client Logo */}
                      <Box
                        sx={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#F0F0F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1,
                          border: "1.43px solid #F0F0F0",
                          overflow: "hidden",
                        }}
                      >
                        {site.clientLogo ? (
                          <img
                            src={site.clientLogo}
                            alt={site.client}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              // Fallback to building emoji if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              if (target.nextSibling) {
                                (target.nextSibling as HTMLElement).style.display = "block";
                              }
                            }}
                          />
                        ) : null}
                        <Typography
                          sx={{
                            fontSize: "20px",
                            display: site.clientLogo ? "none" : "block",
                          }}
                        >
                          🏢
                        </Typography>
                      </Box>

                      {/* Site Info */}
                      <Typography
                        sx={{
                          fontFamily: "Mukta",
                          fontWeight: 500,
                          fontSize: "12px",
                          textAlign: "center",
                          textTransform: "uppercase",
                          color: "#3B3B3B",
                          lineHeight: "14px",
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                        }}
                      >
                        {site.siteName}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Mukta",
                          fontWeight: 400,
                          fontSize: "10px",
                          textAlign: "center",
                          color: "#707070",
                          lineHeight: "12px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                        }}
                      >
                        {site.client}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontSize: "16px",
                    color: "#CCCCCC",
                    textAlign: "center",
                  }}
                >
                  No client sites available
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontSize: "14px",
                    color: "#CCCCCC",
                    textAlign: "center",
                  }}
                >
                  Use "Add New Location" to create a custom location
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Custom Location Modal */}
      <CustomLocationModal
        open={customLocationModalOpen}
        onClose={handleCustomLocationClose}
        onSave={handleCustomLocationSave}
        initialValue={data.customLocation || ""}
      />
    </Box>
  );
};

export default TaskLocationForm;
