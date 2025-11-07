import { ArrowBack, PlayArrow } from "@mui/icons-material";
import { Avatar, Box, CircularProgress, Divider, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type {
  TransformedIncidentEvidence,
  TransformedIncidentReport,
} from "../apis/services/incidentDetailsApiService";
import { useDashboardIncidentDetails } from "../apis/services/incidentDetailsApiService";

// Incident type icons mapping (simple emoji icons)
const getIncidentTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "fire":
      return "🔥";
    case "theft":
      return "🔒";
    case "medical":
      return "🏥";
    case "property_damage":
      return "🔨";
    case "fight":
      return "⚠️";
    case "substance":
      return "🚫";
    case "lights_on":
      return "💡";
    default:
      return "📋";
  }
};

const getIncidentTypeDisplayName = (type: string): string => {
  switch (type.toLowerCase()) {
    case "fire":
      return "Fire Hazard";
    case "theft":
      return "Theft/Security";
    case "medical":
      return "Medical Emergency";
    case "property_damage":
      return "Property Damage";
    case "fight":
      return "Altercation";
    case "substance":
      return "Substance Issue";
    case "lights_on":
      return "Lighting Issue";
    default:
      return "Other";
  }
};

const DashboardIncidentDetailsPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();

  // Use the dashboard incident details API service
  const {
    data: incidentDetails,
    isLoading,
    error,
    isError,
  } = useDashboardIncidentDetails(incidentId || null, !!incidentId);

  const [selectedReport, setSelectedReport] = useState<TransformedIncidentReport | null>(null);

  // Set initial selected report when data loads
  React.useEffect(() => {
    if (incidentDetails?.reports && incidentDetails.reports.length > 0 && !selectedReport) {
      setSelectedReport(incidentDetails.reports[0]);
    }
  }, [incidentDetails, selectedReport]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleReportSelect = (report: TransformedIncidentReport) => {
    setSelectedReport(report);
  };

  const handleEvidenceClick = (evidence: TransformedIncidentEvidence) => {
    console.log("View evidence:", evidence);

    if (evidence.url) {
      window.open(evidence.url, "_blank");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          width: "1272px",
          height: "872px",
          borderRadius: "16px",
          padding: "16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress color="primary" />
          <Typography sx={{ fontFamily: "Mukta", fontSize: "16px", color: "#707070" }}>
            Loading incident details...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (isError || !incidentDetails) {
    return (
      <Box
        sx={{
          width: "1272px",
          height: "872px",
          borderRadius: "16px",
          padding: "16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
          backgroundColor: "#FFFFFF",
        }}
      >
        <Typography variant="h6" color="error">
          {error instanceof Error ? error.message : "Incident not found"}
        </Typography>
        <Typography sx={{ color: "#707070", textAlign: "center" }}>
          The requested incident could not be loaded. Please check the incident ID and try again.
        </Typography>
        <IconButton onClick={handleBack} sx={{ mt: 2 }}>
          <ArrowBack /> Go Back
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "1272px",
        height: "872px",
        borderRadius: "16px",
        gap: "8px",
        padding: "16px",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          width: "1240px",
          height: "840px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            width: "1240px",
            height: "32px",
            paddingTop: "4px",
            paddingBottom: "4px",
            gap: "8px",
          }}
        >
          <Box
            sx={{
              width: "1240px",
              height: "24px",
              gap: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <IconButton
                onClick={handleBack}
                sx={{
                  width: "22px",
                  height: "22px",
                  padding: 0,
                  color: "#3B3B3B",
                }}
              >
                <ArrowBack sx={{ width: "22px", height: "22px" }} />
              </IconButton>

              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "32px",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                  whiteSpace: "nowrap",
                }}
              >
                {incidentDetails.client} - {incidentDetails.site} : Incident
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            width: "1240px",
            height: "796px",
            borderRadius: "10px",
            gap: "12px",
            padding: "16px",
            backgroundColor: "#F7F7F7",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Cards Row */}
          <Box
            sx={{
              width: "952px",
              height: "116px",
              gap: "12px",
              display: "flex",
            }}
          >
            {/* Client Photo Card */}
            <Box
              sx={{
                width: "121px",
                height: "120px",
                borderRadius: "10px",
                gap: "8px",
                padding: "16px",
                backgroundColor: "#FFFFFF",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Avatar
                src={incidentDetails.clientPhoto}
                alt={incidentDetails.client}
                sx={{
                  width: "84px",
                  height: "84px",
                  border: "2px solid #D9D9D9",
                  opacity: 0.9,
                  fontSize: "32px",
                  backgroundColor: "#F5F5F5",
                  color: "#999999",
                }}
              >
                🏢
              </Avatar>
            </Box>

            {/* Details Card */}
            <Box
              sx={{
                width: "269px",
                height: "120px",
                borderRadius: "10px",
                paddingTop: "12px",
                paddingRight: "16px",
                paddingBottom: "16px",
                paddingLeft: "16px",
                gap: "8px",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "20px",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                  marginBottom: "8px",
                }}
              >
                Details
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Typography
                    sx={{ width: "88px", fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#A3A3A3" }}
                  >
                    Client
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.client}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Typography
                    sx={{ width: "88px", fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#A3A3A3" }}
                  >
                    Site
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.site}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Typography
                    sx={{ width: "88px", fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#A3A3A3" }}
                  >
                    Incident ID
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.id}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Status Card */}
            <Box
              sx={{
                width: "269px",
                height: "120px",
                borderRadius: "10px",
                paddingTop: "12px",
                paddingRight: "16px",
                paddingBottom: "16px",
                paddingLeft: "16px",
                gap: "8px",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "20px",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                  marginBottom: "8px",
                }}
              >
                Status - {incidentDetails.status.toLowerCase()}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Typography
                    sx={{ width: "88px", fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#A3A3A3" }}
                  >
                    Duration
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.duration}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Typography
                    sx={{ width: "88px", fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#A3A3A3" }}
                  >
                    Closed On
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.closedOn || "N/A"}
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.closedTime || ""}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Typography
                    sx={{ width: "88px", fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#A3A3A3" }}
                  >
                    First Reported
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.firstReported}
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.firstReportedTime}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Area Officer Card */}
            <Box
              sx={{
                width: "269px",
                height: "120px",
                borderRadius: "10px",
                paddingTop: "12px",
                paddingRight: "16px",
                paddingBottom: "16px",
                paddingLeft: "16px",
                gap: "8px",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "20px",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                  marginBottom: "8px",
                }}
              >
                Area Officer
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Typography
                    sx={{ width: "88px", fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#A3A3A3" }}
                  >
                    Name
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.areaOfficer.name}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Typography
                    sx={{ width: "88px", fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#A3A3A3" }}
                  >
                    Area
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.areaOfficer.area}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Typography
                    sx={{ width: "88px", fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#A3A3A3" }}
                  >
                    Phone
                  </Typography>
                  <Typography sx={{ fontFamily: "Mukta", fontWeight: 400, fontSize: "14px", color: "#3B3B3B" }}>
                    {incidentDetails.areaOfficer.phone}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Bottom Section */}
          <Box
            sx={{
              width: "1208px",
              height: "636px",
              borderRadius: "10px",
              border: "1px solid #F0F0F0",
              display: "flex",
            }}
          >
            {/* Left Panel */}
            <Box
              sx={{
                width: "604px",
                height: "636px",
                gap: "16px",
                padding: "16px",
                borderTopLeftRadius: "10px",
                borderBottomLeftRadius: "10px",
                borderRight: "1px solid #F0F0F0",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Box sx={{ width: "572px", height: "604px", gap: "16px", display: "flex", flexDirection: "column" }}>
                {/* Heading */}
                <Box
                  sx={{
                    width: "572px",
                    height: "90px",
                    gap: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {/* Filter Icon */}
                  <Box
                    sx={{
                      width: "96px",
                      height: "42px",
                      gap: "8px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "8px",
                        backgroundColor: "#2A77D5",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "24px",
                      }}
                    >
                      {getIncidentTypeIcon(incidentDetails.type)}
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 600,
                      fontSize: "16px",
                      textAlign: "center",
                      color: "#3B3B3B",
                    }}
                  >
                    INCIDENT : {getIncidentTypeDisplayName(incidentDetails.type).toUpperCase()}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 500,
                      fontSize: "12px",
                      textAlign: "center",
                      color: "#A3A3A3",
                    }}
                  >
                    Select a row to view evidences
                  </Typography>
                </Box>

                {/* Content */}
                <Box sx={{ width: "572px", height: "498px", gap: "12px", display: "flex", flexDirection: "column" }}>
                  {/* Table Heading */}
                  <Box
                    sx={{
                      width: "572px",
                      height: "16px",
                      paddingLeft: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Typography
                      sx={{ width: "440px", fontFamily: "Mukta", fontWeight: 500, fontSize: "12px", color: "#3B3B3B" }}
                    >
                      NAME
                    </Typography>
                    <Divider orientation="vertical" sx={{ height: "16px", borderColor: "#F7F7F7", mx: 1 }} />
                    <Typography
                      sx={{ width: "108px", fontFamily: "Mukta", fontWeight: 500, fontSize: "12px", color: "#3B3B3B" }}
                    >
                      REPORTED ON
                    </Typography>
                  </Box>

                  {/* Reports List */}
                  <Box
                    sx={{
                      width: "572px",
                      height: "288px",
                      overflowY: "auto",
                      "&::-webkit-scrollbar": { width: "12px" },
                      "&::-webkit-scrollbar-track": { backgroundColor: "#F0F0F0", borderRadius: "40px" },
                      "&::-webkit-scrollbar-thumb": { backgroundColor: "#D9D9D9", borderRadius: "20px" },
                    }}
                  >
                    {incidentDetails.reports.map((report) => (
                      <Box
                        key={report.id}
                        onClick={() => handleReportSelect(report)}
                        sx={{
                          width: "572px",
                          height: "56px",
                          borderRadius: "10px",
                          border: "1px solid #F0F0F0",
                          backgroundColor: selectedReport?.id === report.id ? "#F1F7FE" : "#FFFFFF",
                          boxShadow: "0px 2px 4px 2px #70707012",
                          cursor: "pointer",
                          marginBottom: "16px",
                          "&:hover": { backgroundColor: "#F1F7FE" },
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: "16px",
                          paddingRight: "16px",
                          gap: "16px",
                        }}
                      >
                        <Box sx={{ width: "428px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <Avatar
                            src={report.reporterPhoto}
                            alt={report.reporterName}
                            sx={{ width: "40px", height: "40px", border: "2px solid #F0F0F0" }}
                          />
                          <Typography
                            sx={{
                              width: "300px",
                              fontFamily: "Mukta",
                              fontWeight: 400,
                              fontSize: "16px",
                              color: "#3B3B3B",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {report.reporterName}
                          </Typography>
                        </Box>

                        <Box sx={{ width: "120px", display: "flex", gap: "8px", alignItems: "center" }}>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 400,
                              fontSize: "16px",
                              color: "#3B3B3B",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {report.reportedOn}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 400,
                              fontSize: "16px",
                              color: "#3B3B3B",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {report.reportedTime}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right Panel - Evidence */}
            <Box
              sx={{
                width: "604px",
                height: "636px",
                gap: "16px",
                padding: "16px",
                borderTopRightRadius: "10px",
                borderBottomRightRadius: "10px",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Typography
                sx={{ fontFamily: "Mukta", fontWeight: 600, fontSize: "16px", color: "#3B3B3B", marginBottom: "16px" }}
              >
                SUBMITTED EVIDENCE
              </Typography>

              <Box
                sx={{
                  width: "572px",
                  height: "572px",
                  borderRadius: "8px",
                  gap: "16px",
                  padding: "16px",
                  backgroundColor: "#F9F9F9",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: "12px" },
                  "&::-webkit-scrollbar-track": { backgroundColor: "#F0F0F0", borderRadius: "40px" },
                  "&::-webkit-scrollbar-thumb": { backgroundColor: "#D9D9D9", borderRadius: "20px" },
                }}
              >
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", width: "100%" }}>
                  {incidentDetails.evidences.map((evidence) => (
                    <Box
                      key={evidence.id}
                      onClick={() => handleEvidenceClick(evidence)}
                      sx={{
                        width: "160px",
                        height: "160px",
                        borderRadius: "16px",
                        backgroundColor: "#E5E5E5",
                        border: "2px solid #F0F0F0",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        "&:hover": { borderColor: "#2A77D5", transform: "scale(1.02)" },
                        transition: "all 0.2s ease",
                      }}
                    >
                      {evidence.type === "video" ? (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            backgroundImage: evidence.thumbnail ? `url(${evidence.thumbnail})` : "none",
                            backgroundColor: "#E5E5E5",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(0,0,0,0.7)",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <PlayArrow sx={{ width: "40px", height: "40px", color: "#FFFFFF" }} />
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url(${evidence.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundColor: "#E5E5E5",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography sx={{ fontSize: "48px", color: "#999999", display: "none" }}>📷</Typography>
                        </Box>
                      )}

                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: "rgba(0,0,0,0.8)",
                          color: "#FFFFFF",
                          padding: "8px 12px",
                          fontSize: "10px",
                          fontFamily: "Mukta",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#FFFFFF",
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {evidence.uploadedBy}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "10px",
                            color: "#CCCCCC",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {evidence.uploadedOn}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {incidentDetails.evidences.length === 0 && (
                  <Box
                    sx={{
                      width: "100%",
                      height: "200px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
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
                      <Typography sx={{ fontSize: "32px", color: "#CCCCCC" }}>📷</Typography>
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
                      No evidence submitted yet
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardIncidentDetailsPage;
