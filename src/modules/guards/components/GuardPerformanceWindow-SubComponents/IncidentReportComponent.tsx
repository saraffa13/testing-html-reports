import { Image as ImageIcon } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import React from "react";
import { getIncidentTypeDisplayName, getIncidentTypeIcon, type IncidentReport } from "./incident-tasks-types";

interface IncidentReportsProps {
  incidents: IncidentReport[];
  width?: string | number;
  height?: string | number;
}

/**
 * Incident Reports component that displays guard incident reports
 */
const IncidentReportsComponent: React.FC<IncidentReportsProps> = ({ incidents, width = "502px", height = "448px" }) => {
  const handleEvidenceClick = (incident: IncidentReport) => {
    // Handle evidence viewing logic here
    console.log("View evidence for incident:", incident.id);
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
      {incidents.length > 0 ? (
        <Box
          sx={{
            width: "470px",
            height: "384px",
            gap: "12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Table Header */}
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
                width: "216px",
                height: "16px",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "16px",
                textTransform: "capitalize",
                color: "#3B3B3B",
                paddingTop: "4px",
                paddingBottom: "4px",
              }}
            >
              INCIDENT TYPE
            </Typography>
            <Typography
              sx={{
                width: "150px",
                height: "16px",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "16px",
                textTransform: "capitalize",
                color: "#3B3B3B",
                paddingTop: "4px",
                paddingBottom: "4px",
              }}
            >
              LATEST ALERT
            </Typography>
            <Typography
              sx={{
                width: "88px",
                height: "16px",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "16px",
                textTransform: "capitalize",
                color: "#3B3B3B",
                paddingTop: "4px",
                paddingBottom: "4px",
              }}
            >
              EVIDENCE
            </Typography>
          </Box>

          {/* Scroll Window */}
          <Box
            sx={{
              width: "470px",
              height: "356px",
              gap: "8px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Table Content */}
            <Box
              sx={{
                width: "470px",
                height: "356px",
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
                {incidents.map((incident) => (
                  <Box
                    key={incident.id}
                    sx={{
                      width: "450px",
                      height: "56px",
                      borderRadius: "10px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #F0F0F0",
                      boxShadow: "0px 1px 4px 0px #70707033",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      paddingRight: "16px",
                      paddingLeft: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#F9F9F9",
                        transform: "translateY(-2px)",
                        boxShadow: "0px 4px 12px 0px #70707033",
                      },
                    }}
                  >
                    {/* Incident Type */}
                    <Box
                      sx={{
                        width: "216px",
                        height: "56px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "20px",
                          lineHeight: "1",
                        }}
                      >
                        {getIncidentTypeIcon(incident.type)}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Mukta",
                          fontWeight: 400,
                          fontSize: "14px",
                          lineHeight: "20px",
                          color: "#3B3B3B",
                        }}
                      >
                        {getIncidentTypeDisplayName(incident.type)}
                      </Typography>
                    </Box>

                    {/* Latest Alert */}
                    <Box
                      sx={{
                        width: "150px",
                        height: "56px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Mukta",
                          fontWeight: 400,
                          fontSize: "12px",
                          lineHeight: "16px",
                          color: "#3B3B3B",
                        }}
                      >
                        {incident.latestAlert}
                      </Typography>
                    </Box>

                    {/* Evidence */}
                    <Box
                      sx={{
                        width: "88px",
                        height: "56px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        onClick={() => handleEvidenceClick(incident)}
                        sx={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          backgroundColor: "#2A77D5",
                          color: "#FFFFFF",
                          "&:hover": {
                            backgroundColor: "#2364B6",
                          },
                        }}
                      >
                        <ImageIcon sx={{ width: 20, height: 20 }} />
                      </IconButton>
                      {incident.evidenceCount > 0 && (
                        <Typography
                          sx={{
                            fontFamily: "Mukta",
                            fontWeight: 500,
                            fontSize: "10px",
                            color: "#2A77D5",
                            marginLeft: "4px",
                          }}
                        >
                          {incident.evidenceCount}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        // Empty State
        <Box
          sx={{
            width: "450px",
            height: "384px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          {/* Empty State Icon */}
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
            <Typography
              sx={{
                fontSize: "32px",
                color: "#CCCCCC",
              }}
            >
              📋
            </Typography>
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
            NO INCIDENTS
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default IncidentReportsComponent;
