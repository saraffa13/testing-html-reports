import { ArrowBack, PlayArrow } from "@mui/icons-material";
import { Avatar, Box, Chip, CircularProgress, Divider, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { TransformedEvidence, TransformedSubtask } from "../apis/services/taskDetailsApiService";
import { useDashboardTaskDetails } from "../apis/services/taskDetailsApiService";

// Task type icons mapping (reusing from officers)
const getTaskTypeIcon = (taskType: string) => {
  // Simple emoji icons for task types
  switch (taskType.toLowerCase()) {
    case "sitevisit":
      return "🏠";
    case "training":
      return "🎓";
    case "document":
      return "📄";
    case "inspection":
      return "🔍";
    case "other":
    default:
      return "📋";
  }
};

// Helper functions
const getSubtaskStatusColor = (status: "COMPLETED" | "PENDING" | "OVERDUE"): string => {
  switch (status) {
    case "COMPLETED":
      return "#4CAF50";
    case "PENDING":
      return "#2A77D5";
    case "OVERDUE":
      return "#FF6B6B";
    default:
      return "#707070";
  }
};

const DashboardTaskDetailsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  // Use the dashboard task details API service
  const { data: taskDetails, isLoading, error, isError } = useDashboardTaskDetails(taskId || null, !!taskId);

  const [selectedSubtask, setSelectedSubtask] = useState<TransformedSubtask | null>(null);

  // Set initial selected subtask when data loads
  React.useEffect(() => {
    if (taskDetails?.subtasks && taskDetails.subtasks.length > 0 && !selectedSubtask) {
      setSelectedSubtask(taskDetails.subtasks[0]);
    }
  }, [taskDetails, selectedSubtask]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubtaskSelect = (subtask: TransformedSubtask) => {
    setSelectedSubtask(subtask);
  };

  const handleEvidenceClick = (evidence: TransformedEvidence) => {
    console.log("View evidence:", evidence);

    if (evidence.type === "text") {
      alert(`Evidence Text:\n\n${evidence.textContent || "No text content"}`);
    } else if (evidence.url) {
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
            Loading task details...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (isError || !taskDetails) {
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
          {error instanceof Error ? error.message : "Task not found"}
        </Typography>
        <Typography sx={{ color: "#707070", textAlign: "center" }}>
          The requested task could not be loaded. Please check the task ID and try again.
        </Typography>
        <IconButton onClick={handleBack} sx={{ mt: 2 }}>
          <ArrowBack /> Go Back
        </IconButton>
      </Box>
    );
  }

  // Get filtered evidences for selected subtask
  const filteredEvidences = selectedSubtask
    ? taskDetails.evidences.filter((evidence) => evidence.subtaskId === selectedSubtask.id)
    : taskDetails.evidences;

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
                {taskDetails.client} - {taskDetails.site} : Task
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
              height: "120px",
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
                src={taskDetails.clientPhoto}
                alt={taskDetails.client}
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

              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Box sx={{ display: "flex", gap: "6px" }}>
                  <Typography
                    sx={{
                      width: "68px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#A3A3A3",
                      flexShrink: 0,
                    }}
                  >
                    Client
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#3B3B3B",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {taskDetails.client}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "6px" }}>
                  <Typography
                    sx={{
                      width: "68px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#A3A3A3",
                      flexShrink: 0,
                    }}
                  >
                    Site
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#3B3B3B",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {taskDetails.site}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "6px" }}>
                  <Typography
                    sx={{
                      width: "68px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#A3A3A3",
                      flexShrink: 0,
                    }}
                  >
                    Task ID
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#3B3B3B",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {taskDetails.taskId.slice(-12)}
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
                  marginBottom: "6px",
                }}
              >
                Status - {taskDetails.status === "DONE" ? "Completed" : taskDetails.status.toLowerCase()}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <Box sx={{ display: "flex", gap: "4px", alignItems: "flex-start" }}>
                  <Typography
                    sx={{
                      width: "58px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "13px",
                      color: "#A3A3A3",
                      flexShrink: 0,
                      lineHeight: "14px",
                    }}
                  >
                    Due Date
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "1px", flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "Mukta",
                        fontWeight: 400,
                        fontSize: "13px",
                        color: "#3B3B3B",
                        lineHeight: "14px",
                      }}
                    >
                      {taskDetails.dueDate}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Mukta",
                        fontWeight: 400,
                        fontSize: "13px",
                        color: "#3B3B3B",
                        lineHeight: "14px",
                      }}
                    >
                      {taskDetails.dueTime}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: "4px", alignItems: "flex-start" }}>
                  <Typography
                    sx={{
                      width: "58px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "13px",
                      color: "#A3A3A3",
                      flexShrink: 0,
                      lineHeight: "14px",
                    }}
                  >
                    Duration
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "13px",
                      color: "#3B3B3B",
                      lineHeight: "14px",
                      flex: 1,
                      wordBreak: "break-word",
                    }}
                  >
                    {taskDetails.duration}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "4px", alignItems: "flex-start" }}>
                  <Typography
                    sx={{
                      width: "58px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "13px",
                      color: "#A3A3A3",
                      flexShrink: 0,
                      lineHeight: "14px",
                    }}
                  >
                    {taskDetails.status === "DONE" ? "Done On" : "Start On"}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "1px", flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "Mukta",
                        fontWeight: 400,
                        fontSize: "13px",
                        color: "#3B3B3B",
                        lineHeight: "14px",
                      }}
                    >
                      {taskDetails.status === "DONE" ? taskDetails.completedOn || "N/A" : taskDetails.assignedOn}
                    </Typography>
                    {((taskDetails.status === "DONE" && taskDetails.completedTime) ||
                      (taskDetails.status !== "DONE" && taskDetails.assignedTime)) && (
                      <Typography
                        sx={{
                          fontFamily: "Mukta",
                          fontWeight: 400,
                          fontSize: "13px",
                          color: "#3B3B3B",
                          lineHeight: "14px",
                        }}
                      >
                        {taskDetails.status === "DONE" ? taskDetails.completedTime : taskDetails.assignedTime}
                      </Typography>
                    )}
                  </Box>
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

              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Box sx={{ display: "flex", gap: "6px" }}>
                  <Typography
                    sx={{
                      width: "68px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#A3A3A3",
                      flexShrink: 0,
                    }}
                  >
                    Name
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#3B3B3B",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {taskDetails.areaOfficer.name}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "6px" }}>
                  <Typography
                    sx={{
                      width: "68px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#A3A3A3",
                      flexShrink: 0,
                    }}
                  >
                    Area
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#3B3B3B",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {taskDetails.areaOfficer.area}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "6px" }}>
                  <Typography
                    sx={{
                      width: "68px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#A3A3A3",
                      flexShrink: 0,
                    }}
                  >
                    Phone
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#3B3B3B",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {taskDetails.areaOfficer.phone}
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
            {/* Left Panel - Subtasks */}
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
                      {getTaskTypeIcon(taskDetails.subtasks[0]?.type || "other")}
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
                    SUBTASKS
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
                      sx={{ width: "200px", fontFamily: "Mukta", fontWeight: 500, fontSize: "12px", color: "#3B3B3B" }}
                    >
                      SUBTASK
                    </Typography>
                    <Divider orientation="vertical" sx={{ height: "16px", borderColor: "#F7F7F7", mx: 1 }} />
                    <Typography
                      sx={{ width: "120px", fontFamily: "Mukta", fontWeight: 500, fontSize: "12px", color: "#3B3B3B" }}
                    >
                      COMPLETED ON
                    </Typography>
                    <Divider orientation="vertical" sx={{ height: "16px", borderColor: "#F7F7F7", mx: 1 }} />
                    <Typography
                      sx={{ width: "80px", fontFamily: "Mukta", fontWeight: 500, fontSize: "12px", color: "#3B3B3B" }}
                    >
                      STATUS
                    </Typography>
                    <Divider orientation="vertical" sx={{ height: "16px", borderColor: "#F7F7F7", mx: 1 }} />
                    <Typography
                      sx={{ width: "80px", fontFamily: "Mukta", fontWeight: 500, fontSize: "12px", color: "#3B3B3B" }}
                    >
                      EVIDENCE
                    </Typography>
                  </Box>

                  {/* Subtasks List */}
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
                    {taskDetails.subtasks.map((subtask) => (
                      <Box
                        key={subtask.id}
                        onClick={() => handleSubtaskSelect(subtask)}
                        sx={{
                          width: "572px",
                          height: "56px",
                          borderRadius: "10px",
                          border: "1px solid #F0F0F0",
                          backgroundColor: selectedSubtask?.id === subtask.id ? "#F1F7FE" : "#FFFFFF",
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
                        <Box sx={{ width: "180px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <Box
                            sx={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              backgroundColor: "#2A77D5",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "16px",
                            }}
                          >
                            {getTaskTypeIcon(subtask.type)}
                          </Box>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 400,
                              fontSize: "14px",
                              color: "#3B3B3B",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {subtask.name}
                          </Typography>
                        </Box>

                        <Box sx={{ width: "120px", display: "flex", gap: "4px", alignItems: "center" }}>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 400,
                              fontSize: "12px",
                              color: "#3B3B3B",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {subtask.completedOn || "N/A"}
                          </Typography>
                          {subtask.completedTime && (
                            <Typography
                              sx={{
                                fontFamily: "Mukta",
                                fontWeight: 400,
                                fontSize: "12px",
                                color: "#3B3B3B",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {subtask.completedTime}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ width: "80px" }}>
                          <Chip
                            label={subtask.status}
                            size="small"
                            sx={{
                              backgroundColor: getSubtaskStatusColor(subtask.status),
                              color: "#FFFFFF",
                              fontFamily: "Mukta",
                              fontWeight: 500,
                              fontSize: "10px",
                              height: "20px",
                            }}
                          />
                        </Box>

                        <Box sx={{ width: "80px", display: "flex", justifyContent: "center" }}>
                          {subtask.hasEvidence ? (
                            <Box
                              sx={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                backgroundColor: "#4CAF50",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Typography sx={{ fontSize: "10px", color: "#FFFFFF" }}>✓</Typography>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                border: "2px solid #D9D9D9",
                              }}
                            />
                          )}
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
                  {filteredEvidences.map((evidence) => (
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
                      {evidence.type === "text" ? (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#F0F0F0",
                            flexDirection: "column",
                            padding: "16px",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "48px",
                              color: "#2A77D5",
                              marginBottom: "8px",
                            }}
                          >
                            📝
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "#3B3B3B",
                              textAlign: "center",
                              fontWeight: 500,
                            }}
                          >
                            Text Evidence
                          </Typography>
                        </Box>
                      ) : evidence.type === "video" ? (
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
                            backgroundImage: evidence.url ? `url(${evidence.url})` : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundColor: "#E5E5E5",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {!evidence.url && <Typography sx={{ fontSize: "48px", color: "#999999" }}>📷</Typography>}
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
                          {evidence.uploadedOn} • {evidence.subtaskName}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {filteredEvidences.length === 0 && (
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
                      {selectedSubtask ? `No evidence for ${selectedSubtask.name}` : "No evidence submitted yet"}
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

export default DashboardTaskDetailsPage;
