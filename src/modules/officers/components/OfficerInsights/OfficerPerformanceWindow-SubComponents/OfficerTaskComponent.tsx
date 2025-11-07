import {
  Assignment,
  CheckCircle,
  DashboardCustomize,
  Description,
  HomeWork,
  School,
  Search,
  Warning,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type OfficerTask, type OfficerTaskStatus } from "./officer-incident-tasks-types";

interface OfficerTasksProps {
  tasks: OfficerTask[];
  width?: string | number;
  height?: string | number;
}

// Task type icons mapping with Material UI icons
const getTaskTypeIcon = (taskType: string) => {
  switch (taskType.toLowerCase()) {
    case "sitevisit":
      return <HomeWork sx={{ width: 20, height: 20, color: "#2A77D5" }} />;
    case "training":
      return <School sx={{ width: 20, height: 20, color: "#2A77D5" }} />;
    case "document":
      return <Description sx={{ width: 20, height: 20, color: "#2A77D5" }} />;
    case "inspection":
      return <Search sx={{ width: 20, height: 20, color: "#2A77D5" }} />;
    case "other":
    default:
      return <DashboardCustomize sx={{ width: 20, height: 20, color: "#2A77D5" }} />;
  }
};

// Get task type from task data
const getTaskTypes = (task: OfficerTask): string[] => {
  if (task.types && task.types.length > 0) {
    return task.types;
  }

  if (task.type) {
    return [task.type];
  }

  const types: string[] = [];

  if (task.note?.toLowerCase().includes("site") || task.site) {
    types.push("sitevisit");
  }
  if (task.note?.toLowerCase().includes("training")) {
    types.push("training");
  }
  if (task.note?.toLowerCase().includes("document") || task.note?.toLowerCase().includes("report")) {
    types.push("document");
  }
  if (task.note?.toLowerCase().includes("inspection") || task.note?.toLowerCase().includes("audit")) {
    types.push("inspection");
  }

  if (types.length === 0) {
    types.push("other");
  }

  return types;
};

// Helper function to extract client name from site or use fallback
const getClientDisplayName = (task: OfficerTask): string => {
  // If we have assignedBy, use it (could contain client info)
  if (task.assignedBy && task.assignedBy !== "Area Officer" && task.assignedBy !== "Office") {
    return task.assignedBy;
  }

  // Try to extract client from note
  if (task.note?.includes("Client:")) {
    const clientMatch = task.note.match(/Client:\s*([^|]+)/);
    if (clientMatch) {
      return clientMatch[1].trim();
    }
  }

  // Try to derive from site name (common pattern: "ClientName - SiteName")
  if (task.site?.includes(" - ")) {
    return task.site.split(" - ")[0];
  }

  // Fallback to generic name
  return "Client";
};

// Helper function to get site display name
const getSiteDisplayName = (task: OfficerTask): string => {
  if (!task.site) {
    return "Site";
  }

  // If site contains " - ", take the part after the dash (actual site name)
  if (task.site.includes(" - ")) {
    return task.site.split(" - ")[1] || task.site;
  }

  // Otherwise use the site as-is
  return task.site;
};

/**
 * Officer Tasks component with Overdue/Pending/Done status tracking
 */
const OfficerTasksComponent: React.FC<OfficerTasksProps> = ({ tasks, width = "502px", height = "676px" }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OfficerTaskStatus>("PENDING");

  // Filter tasks by status
  const overdueTasks = tasks.filter((task: OfficerTask) => task.status === "OVERDUE");
  const pendingTasks = tasks.filter((task: OfficerTask) => task.status === "PENDING");
  const doneTasks = tasks.filter((task: OfficerTask) => task.status === "DONE");

  // Get current tasks based on active tab
  const getCurrentTasks = () => {
    switch (activeTab) {
      case "OVERDUE":
        return overdueTasks;
      case "PENDING":
        return pendingTasks;
      case "DONE":
        return doneTasks;
      default:
        return pendingTasks;
    }
  };

  const currentTasks = getCurrentTasks();

  const handleTaskClick = (task: OfficerTask) => {
    navigate(`/tasks/${task.id}/details`);
  };

  const handleTabChange = (newTab: OfficerTaskStatus) => {
    setActiveTab(newTab);
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
            width: "44px",
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
          TASKS
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          width: "470px",
          height: "600px",
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
            paddingRight: "20px",
            paddingLeft: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Tab Frame */}
          <Box
            sx={{
              width: "430px",
              height: "48px",
              borderRadius: "11px",
              padding: "8px",
              gap: "4px",
              backgroundColor: "#F7F7F7",
              display: "flex",
            }}
          >
            {/* OVERDUE Tab */}
            <Box
              onClick={() => handleTabChange("OVERDUE")}
              sx={{
                width: "138px",
                height: "32px",
                borderRadius: "8px",
                paddingTop: "8px",
                paddingRight: "16px",
                paddingBottom: "8px",
                paddingLeft: "16px",
                backgroundColor: activeTab === "OVERDUE" ? "#2A77D5" : "#FFFFFF",
                boxShadow: "0px 1px 4px 0px #70707033",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Warning
                sx={{
                  width: "16px",
                  height: "16px",
                  color: activeTab === "OVERDUE" ? "#FFFFFF" : "#2A77D5",
                }}
              />
              <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "24px",
                    textTransform: "uppercase",
                    color: activeTab === "OVERDUE" ? "#FFFFFF" : "#2A77D5",
                  }}
                >
                  OVERDUE
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "24px",
                    color: activeTab === "OVERDUE" ? "#FFFFFF" : "#2A77D5",
                    paddingTop: "3px",
                    paddingBottom: "3px",
                  }}
                >
                  ({overdueTasks.length.toString().padStart(2, "0")})
                </Typography>
              </Box>
            </Box>

            {/* PENDING Tab */}
            <Box
              onClick={() => handleTabChange("PENDING")}
              sx={{
                width: "138px",
                height: "32px",
                borderRadius: "8px",
                paddingTop: "8px",
                paddingRight: "16px",
                paddingBottom: "8px",
                paddingLeft: "16px",
                backgroundColor: activeTab === "PENDING" ? "#2A77D5" : "#FFFFFF",
                boxShadow: "0px 1px 4px 0px #70707033",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Assignment
                sx={{
                  width: "16px",
                  height: "16px",
                  color: activeTab === "PENDING" ? "#FFFFFF" : "#2A77D5",
                }}
              />
              <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "24px",
                    textTransform: "uppercase",
                    color: activeTab === "PENDING" ? "#FFFFFF" : "#2A77D5",
                  }}
                >
                  PENDING
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "24px",
                    color: activeTab === "PENDING" ? "#FFFFFF" : "#2A77D5",
                    paddingTop: "3px",
                    paddingBottom: "3px",
                  }}
                >
                  ({pendingTasks.length.toString().padStart(2, "0")})
                </Typography>
              </Box>
            </Box>

            {/* DONE Tab */}
            <Box
              onClick={() => handleTabChange("DONE")}
              sx={{
                width: "138px",
                height: "32px",
                borderRadius: "8px",
                paddingTop: "8px",
                paddingRight: "16px",
                paddingBottom: "8px",
                paddingLeft: "16px",
                backgroundColor: activeTab === "DONE" ? "#2A77D5" : "#FFFFFF",
                boxShadow: "0px 1px 4px 0px #70707033",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <CheckCircle
                sx={{
                  width: "16px",
                  height: "16px",
                  color: activeTab === "DONE" ? "#FFFFFF" : "#2A77D5",
                }}
              />
              <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "24px",
                    textTransform: "uppercase",
                    color: activeTab === "DONE" ? "#FFFFFF" : "#2A77D5",
                  }}
                >
                  DONE
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "24px",
                    color: activeTab === "DONE" ? "#FFFFFF" : "#2A77D5",
                    paddingTop: "3px",
                    paddingBottom: "3px",
                  }}
                >
                  ({doneTasks.length.toString().padStart(2, "0")})
                </Typography>
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
            TASK ID
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
            CLIENT
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
            SITE
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
            DUE BY
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
            ASSIGNED BY
          </Typography>
        </Box>

        {/* Scroll Window */}
        <Box
          sx={{
            width: "470px",
            height: "500px",
            gap: "8px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Table */}
          {currentTasks.length > 0 ? (
            <Box
              sx={{
                width: "470px",
                height: "500px",
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
                {currentTasks.map((task: OfficerTask) => (
                  <Box
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    sx={{
                      width: "450px",
                      height: "84px",
                      borderRadius: "10px",
                      gap: "8px",
                      border: "1px solid #F0F0F0",
                      boxShadow: "0px 1px 4px 0px #70707033",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#F9F9F9",
                        transform: "translateY(-1px)",
                        boxShadow: "0px 4px 8px 0px #70707033",
                      },
                      transition: "all 0.2s ease",
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
                      {/* Task ID */}
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
                        {task.id.slice(-8)} {/* Show last 8 chars for readability */}
                      </Typography>

                      {/* Client */}
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
                        {getClientDisplayName(task)}
                      </Typography>

                      {/* Site */}
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
                        {getSiteDisplayName(task)}
                      </Typography>

                      {/* Due By */}
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
                        {task.dueDate}
                      </Typography>

                      {/* Assigned By */}
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
                        {task.assignedBy || "Officer"}
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
                      {getTaskTypes(task).map((taskType: string, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getTaskTypeIcon(taskType)}
                        </Box>
                      ))}
                      {/* Fill remaining slots if needed */}
                      {Array.from({ length: Math.max(0, 5 - getTaskTypes(task).length) }).map((_, index: number) => (
                        <Box
                          key={`empty-${index}`}
                          sx={{
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        />
                      ))}
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
                height: "500px",
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
                <Typography sx={{ fontSize: "32px", color: "#CCCCCC" }}>✓</Typography>
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
                NO {activeTab} TASKS
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerTasksComponent;
