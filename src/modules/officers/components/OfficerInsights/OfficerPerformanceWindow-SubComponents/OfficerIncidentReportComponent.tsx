import { CheckCircle, PendingActions } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getOfficerIncidentTypeIcon,
  type OfficerIncidentReport,
  type OfficerIncidentStatus,
} from "./officer-incident-tasks-types"; // Updated import to use consolidated file

interface OfficerIncidentReportsProps {
  incidents: OfficerIncidentReport[];
  width?: string | number;
  height?: string | number;
}

/**
 * Officer Incident Reports component with Open/Closed sections - Updated with navigation to details page
 */
const OfficerIncidentReportsComponent: React.FC<OfficerIncidentReportsProps> = ({
  incidents,
  width = "502px",
  height = "448px",
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OfficerIncidentStatus>("OPEN");

  // Filter incidents by status
  const openIncidents = incidents.filter((incident) => incident.status === "OPEN");
  const closedIncidents = incidents.filter((incident) => incident.status === "CLOSED");

  // Get current incidents based on active tab
  const currentIncidents = activeTab === "OPEN" ? openIncidents : closedIncidents;

  // Handle incident click - navigate to details page
  const handleIncidentClick = (incident: OfficerIncidentReport) => {
    navigate(`/incidents/${incident.id}/details`);
  };

  // Get client name - use data from incident directly
  const getClientName = (incident: OfficerIncidentReport): string => {
    return incident.clientName || "Client Name";
  };

  // Get display site name - use data from incident directly
  const getDisplaySiteName = (incident: OfficerIncidentReport): string => {
    return incident.site || "Site";
  };

  return (
    <Box
      sx={{
        width: width,
        height: height,
        borderRadius: "10px",
        padding: "16px",
        gap: "16px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Heading */}
      <Box
        sx={{
          width: "470px",
          height: "16px",
          backdropFilter: "blur(4px)",
        }}
      >
        <Typography
          sx={{
            width: "132px",
            height: "16px",
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "20px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            paddingTop: "3px",
            paddingBottom: "3px",
          }}
        >
          INCIDENT REPORTS
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          width: "470px",
          height: "384px",
          gap: "12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Tab Container */}
        <Box
          sx={{
            width: "470px",
            height: "48px",
            borderRadius: "10px",
            gap: "24px",
            paddingRight: "40px",
            paddingLeft: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Tab Frame */}
          <Box
            sx={{
              width: "390px",
              height: "48px",
              borderRadius: "11px",
              padding: "8px",
              gap: "8px",
              backgroundColor: "#F7F7F7",
              display: "flex",
            }}
          >
            {/* OPEN Tab */}
            <Box
              onClick={() => setActiveTab("OPEN")}
              sx={{
                width: "183px",
                height: "32px",
                borderRadius: "8px",
                paddingTop: "8px",
                paddingRight: "24px",
                paddingBottom: "8px",
                paddingLeft: "24px",
                backgroundColor: activeTab === "OPEN" ? "#2A77D5" : "#FFFFFF",
                boxShadow: "0px 1px 4px 0px #70707033",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: activeTab === "OPEN" ? "#2364B6" : "#F0F7FF",
                },
              }}
            >
              <Box
                sx={{
                  width: "93px",
                  height: "16px",
                  borderRadius: "24px",
                  gap: "8px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <PendingActions
                  sx={{
                    width: "16px",
                    height: "16px",
                    color: activeTab === "OPEN" ? "#FFFFFF" : "#2A77D5",
                  }}
                />
                <Box
                  sx={{
                    width: "69px",
                    height: "16px",
                    paddingBottom: "12px",
                    gap: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      width: "39px",
                      height: "10px",
                      fontFamily: "Mukta",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "24px",
                      textTransform: "uppercase",
                      color: activeTab === "OPEN" ? "#FFFFFF" : "#2A77D5",
                    }}
                  >
                    OPEN
                  </Typography>
                  <Typography
                    sx={{
                      width: "26px",
                      height: "16px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: activeTab === "OPEN" ? "#FFFFFF" : "#2A77D5",
                      paddingTop: "3px",
                      paddingBottom: "3px",
                    }}
                  >
                    ({openIncidents.length.toString().padStart(2, "0")})
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* CLOSED Tab */}
            <Box
              onClick={() => setActiveTab("CLOSED")}
              sx={{
                width: "183px",
                height: "32px",
                borderRadius: "8px",
                paddingTop: "8px",
                paddingRight: "24px",
                paddingBottom: "8px",
                paddingLeft: "24px",
                backgroundColor: activeTab === "CLOSED" ? "#2A77D5" : "#FFFFFF",
                boxShadow: "0px 1px 4px 0px #70707033",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: activeTab === "CLOSED" ? "#2364B6" : "#F0F7FF",
                },
              }}
            >
              <Box
                sx={{
                  width: "109px",
                  height: "16px",
                  borderRadius: "24px",
                  gap: "8px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CheckCircle
                  sx={{
                    width: "16px",
                    height: "16px",
                    color: activeTab === "CLOSED" ? "#FFFFFF" : "#2A77D5",
                  }}
                />
                <Box
                  sx={{
                    width: "85px",
                    height: "16px",
                    paddingBottom: "12px",
                    gap: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      width: "54px",
                      height: "10px",
                      fontFamily: "Mukta",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "24px",
                      textTransform: "uppercase",
                      color: activeTab === "CLOSED" ? "#FFFFFF" : "#2A77D5",
                    }}
                  >
                    CLOSED
                  </Typography>
                  <Typography
                    sx={{
                      width: "27px",
                      height: "16px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: activeTab === "CLOSED" ? "#FFFFFF" : "#2A77D5",
                      paddingTop: "3px",
                      paddingBottom: "3px",
                    }}
                  >
                    ({closedIncidents.length.toString().padStart(2, "0")})
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Table Heading */}
        <Box
          sx={{
            width: "470px",
            height: "16px",
            borderRadius: "8px",
            gap: "8px",
            paddingRight: "8px",
            paddingLeft: "8px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              width: "64px",
              height: "16px",
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              color: "#3B3B3B",
              paddingTop: "4px",
              paddingBottom: "4px",
            }}
          >
            INCIDENT ID
          </Typography>
          <Typography
            sx={{
              width: "114px",
              height: "16px",
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              color: "#3B3B3B",
              paddingTop: "4px",
              paddingBottom: "4px",
            }}
          >
            CLIENT NAME
          </Typography>
          <Typography
            sx={{
              width: "114px",
              height: "16px",
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              color: "#3B3B3B",
              paddingTop: "4px",
              paddingBottom: "4px",
            }}
          >
            SITE NAME
          </Typography>
          <Typography
            sx={{
              width: "73px",
              height: "16px",
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              color: "#3B3B3B",
              paddingTop: "4px",
              paddingBottom: "4px",
            }}
          >
            LATEST ALERT
          </Typography>
        </Box>

        {/* Scroll Window */}
        <Box
          sx={{
            width: "470px",
            height: "296px",
            gap: "8px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Table */}
          {currentIncidents.length > 0 ? (
            <Box
              sx={{
                width: "470px",
                height: "296px",
                overflowY: "auto",
                paddingRight: "8px",
                "&::-webkit-scrollbar": {
                  width: "12px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#F0F0F0",
                  borderRadius: "40px",
                  marginRight: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#D9D9D9",
                  borderRadius: "20px",
                  marginRight: "8px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#CCCCCC",
                },
              }}
            >
              <Box
                sx={{
                  width: "450px",
                  gap: "16px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {currentIncidents.map((incident) => (
                  <Box
                    key={incident.id}
                    onClick={() => handleIncidentClick(incident)}
                    sx={{
                      width: "450px",
                      height: "84px",
                      borderRadius: "10px",
                      gap: "8px",
                      border: "1px solid #F0F0F0",
                      boxShadow: "0px 1px 4px 0px #70707033",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#F9F9F9",
                        transform: "translateY(-2px)",
                        boxShadow: "0px 4px 12px 0px #70707033",
                      },
                    }}
                  >
                    {/* Details */}
                    <Box
                      sx={{
                        width: "450px",
                        height: "56px",
                        gap: "10px",
                        display: "flex",
                        alignItems: "center",
                        paddingRight: "16px",
                        paddingLeft: "8px",
                      }}
                    >
                      {/* Incident ID */}
                      <Typography
                        sx={{
                          width: "64px",
                          fontFamily: "Mukta",
                          fontWeight: 400,
                          fontSize: "14px",
                          color: "#3B3B3B",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {incident.id}
                      </Typography>

                      {/* Client Name */}
                      <Typography
                        sx={{
                          width: "114px",
                          fontFamily: "Mukta",
                          fontWeight: 400,
                          fontSize: "14px",
                          color: "#3B3B3B",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getClientName(incident)}
                      </Typography>

                      {/* Site Name */}
                      <Typography
                        sx={{
                          width: "114px",
                          fontFamily: "Mukta",
                          fontWeight: 400,
                          fontSize: "14px",
                          color: "#3B3B3B",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getDisplaySiteName(incident)}
                      </Typography>

                      {/* Latest Alert */}
                      <Typography
                        sx={{
                          width: "73px",
                          fontFamily: "Mukta",
                          fontWeight: 400,
                          fontSize: "12px",
                          color: "#3B3B3B",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {incident.latestAlert}
                      </Typography>
                    </Box>

                    {/* Icon List */}
                    <Box
                      sx={{
                        width: "450px",
                        height: "28px",
                        gap: "16px",
                        paddingTop: "4px",
                        paddingRight: "96px",
                        paddingBottom: "4px",
                        paddingLeft: "96px",
                        backgroundColor: "#F1F7FE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Dynamic Incident Type Icon */}
                      <Box
                        sx={{
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getOfficerIncidentTypeIcon(incident.type)}
                      </Box>

                      {/* Site/Location Icon */}
                      <Box
                        sx={{
                          width: "20px",
                          height: "20px",
                          fontSize: "20px",
                          color: "#2A77D5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        🏠
                      </Box>

                      {/* Evidence Count Indicator (if available) */}
                      {incident.evidenceCount > 0 && (
                        <Box
                          sx={{
                            width: "20px",
                            height: "20px",
                            fontSize: "16px",
                            color: "#2A77D5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                          }}
                        >
                          📷
                          {incident.evidenceCount > 1 && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: "-4px",
                                right: "-4px",
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                backgroundColor: "#FF6B6B",
                                color: "#FFFFFF",
                                fontSize: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 600,
                              }}
                            >
                              {incident.evidenceCount > 9 ? "9+" : incident.evidenceCount}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            // Empty State
            <Box
              sx={{
                width: "450px",
                height: "296px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <Box
                sx={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#F0F0F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "32px", color: "#CCCCCC" }}>📋</Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "16px",
                  color: "#CCCCCC",
                  textAlign: "center",
                }}
              >
                NO {activeTab} INCIDENTS
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerIncidentReportsComponent;
