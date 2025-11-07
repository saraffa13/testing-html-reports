import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Alert, Box, CircularProgress, Divider, Typography } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { useGuards } from "../../context/GuardContext";
import { useGuardAssignments } from "../../hooks/useGuardAssignments";
import type { FormattedAssignment } from "../../services/assignment.service";

/**
 * Assignment Window Component
 * Shows guard assignment information fetched from API
 */

const AssignmentWindow: React.FC = () => {
  // Get guard ID from URL params
  const { guardId } = useParams<{ guardId: string }>();

  // Get guard data from context
  const { guards, loading: guardLoading } = useGuards();

  // Find the guard data using guardId
  const guardData = guardId ? guards.find(g => g.id === guardId) : null;

  // Fetch assignments using the guard ID
  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useGuardAssignments(guardId || null, !!guardId);

  // Handle View on Map click
  const handleViewOnMap = (geolocation: { lat: number; lng: number }, mapLink?: string) => {
    if (mapLink && mapLink !== "https://maps.google.com") {
      // Use the provided map link if it's specific
      window.open(mapLink, "_blank");
    } else {
      // Fallback to coordinates-based Google Maps URL
      const url = `https://www.google.com/maps?q=${geolocation.lat},${geolocation.lng}`;
      window.open(url, "_blank");
    }
  };

  // Field component for consistent styling
  const Field: React.FC<{
    label: string;
    value: string;
    isGeolocation?: boolean;
    onMapClick?: () => void;
  }> = ({ label, value, isGeolocation = false, onMapClick }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        mb: "8px",
        gap: "8px",
      }}
    >
      {/* Label */}
      <Typography
        sx={{
          fontFamily: "Mukta",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          color: "#A3A3A3",
          width: "100px", // fixed width for alignment
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>

      {/* Value */}
      {isGeolocation ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
            flexWrap: "wrap",
            "&:hover .MuiTypography-root": {
              textDecoration: "underline",
            },
          }}
          onClick={onMapClick}
        >
          <LocationOnIcon sx={{ fontSize: "16px", color: "#2A77D5" }} />
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#2A77D5",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </Typography>
        </Box>
      ) : (
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            color: "#3B3B3B",
            wordBreak: "break-word",
            flex: 1,
            whiteSpace: "pre-line",
          }}
        >
          {value}
        </Typography>
      )}
    </Box>
  );

  // Loading state
  if (guardLoading || assignmentsLoading) {
    return (
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          padding: "16px",
          borderRadius: "12px",
          background: "#F7F7F7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#2A77D5" }} />
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontSize: "16px",
            color: "#707070",
            textAlign: "center",
          }}
        >
          Loading assignments...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (assignmentsError) {
    return (
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          padding: "16px",
          borderRadius: "12px",
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
          {/* Content Heading */}
          <Box sx={{ width: "1020px", height: "24px", gap: "8px" }}>
            <Box
              sx={{
                width: "1020px",
                height: "24px",
                gap: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "32px",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                }}
              >
                Assignment
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Divider sx={{ width: "1020px", border: "1px solid #FFFFFF" }} />

          {/* Error Alert */}
          <Alert
            severity="error"
            sx={{
              mt: 2,
              "& .MuiAlert-message": {
                fontFamily: "Mukta",
              },
            }}
            action={
              <button
                onClick={() => refetchAssignments()}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2A77D5",
                  cursor: "pointer",
                  fontFamily: "Mukta",
                  textDecoration: "underline",
                }}
              >
                Retry
              </button>
            }
          >
            {assignmentsError instanceof Error
              ? assignmentsError.message
              : String(assignmentsError || "Failed to load assignments")}
          </Alert>
        </Box>
      </Box>
    );
  }

  // Guard not found state
  if (!guardData) {
    return (
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          padding: "16px",
          borderRadius: "12px",
          background: "#F7F7F7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontSize: "18px",
            color: "#707070",
            textAlign: "center",
          }}
        >
          Guard not found
        </Typography>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontSize: "14px",
            color: "#A3A3A3",
            textAlign: "center",
          }}
        >
          Unable to load assignment data without guard information
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "1052px",
        height: "840px",
        padding: "16px",
        borderRadius: "12px",
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
        {/* Content Heading */}
        <Box sx={{ width: "1020px", height: "24px", gap: "8px" }}>
          <Box
            sx={{
              width: "1020px",
              height: "24px",
              gap: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 600,
                fontSize: "24px",
                lineHeight: "32px",
                textTransform: "capitalize",
                color: "#3B3B3B",
              }}
            >
              Assignment
            </Typography>
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#707070",
                ml: 2,
              }}
            >
              ({assignments.length} assignment{assignments.length !== 1 ? "s" : ""})
            </Typography>
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ width: "1020px", border: "1px solid #FFFFFF" }} />

        {/* Content */}
        <Box
          sx={{
            width: "1020px",
            height: "760px",
            gap: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {assignments.length === 0 ? (
            // No assignments state
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "400px",
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontSize: "18px",
                  color: "#707070",
                  textAlign: "center",
                }}
              >
                No assignments found
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontSize: "14px",
                  color: "#A3A3A3",
                  textAlign: "center",
                }}
              >
                This guard currently has no active assignments
              </Typography>
            </Box>
          ) : (
            // Assignment Cards Container
            <Box
              sx={{
                width: "1020px",
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                overflowY: "auto", // Add scroll if many assignments
                maxHeight: "760px",
              }}
            >
              {assignments.map((assignment: FormattedAssignment, index: number) => (
                <Box
                  key={assignment.id}
                  sx={{
                    width: "502px",
                    borderRadius: "10px",
                    padding: "12px 16px 16px 16px",
                    background: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* Card Header */}
                  <Box
                    sx={{
                      width: "470px",
                      height: "16px",
                      mb: "12px",
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
                      }}
                    >
                      Assigned Client {index + 1}
                    </Typography>
                  </Box>

                  {/* Content */}
                  <Box
                    sx={{
                      width: "468px",
                      display: "flex",
                      gap: "16px",
                      flex: 1,
                    }}
                  >
                    {/* Left Column */}
                    <Box
                      sx={{
                        width: "226px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Field label="Client Name" value={assignment.clientName} />
                      <Field label="Site" value={assignment.site} />
                      <Field label="Area Officer" value={assignment.areaOfficer} />
                      <Field label="Starting Date" value={assignment.startingDate} />
                      <Field label="Shift" value={`${assignment.shiftDays}\n${assignment.shiftTime}`} />
                    </Box>

                    {/* Right Column */}
                    <Box
                      sx={{
                        width: "226px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Field label="Address" value={assignment.address} />
                      <Field
                        label="Geolocation"
                        value="View On Map"
                        isGeolocation={true}
                        onMapClick={() => handleViewOnMap(assignment.geolocation, assignment.siteLocationMapLink)}
                      />
                      <Field label="Location Type" value={assignment.locationType} />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AssignmentWindow;
