// File: src/modules/officers/components/OfficerInsights/Insights-SubComponents/OfficerClientSitesWindow.tsx
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import DescriptionIcon from "@mui/icons-material/Description";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import SearchIcon from "@mui/icons-material/Search";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOfficers } from "../../../context/OfficerContext";
import type { TransformedClientSite } from "../../../service/clientSitesApiService";
import { useClientSites, useClientSitesUtils } from "../../../service/clientSitesApiService";
import { useSiteTasks, useSiteTasksUtils } from "../../../service/siteTasksApiService";

// Types for UI state
type TaskStatus = "overdue" | "pending" | "done";

const OfficerClientSitesWindow: React.FC = () => {
  const { officerId } = useParams<{ officerId: string }>();
  const navigate = useNavigate();
  const { officers, loading: officerLoading } = useOfficers();

  // State management
  const [selectedSite, setSelectedSite] = useState<TransformedClientSite | null>(null);
  const [activeTab, setActiveTab] = useState<TaskStatus>("overdue");

  // Get officer data - officerId is already the guardId
  const officerData = officers.find((o) => o.guardId === officerId);
  const guardId = officerId || null;

  // Client Sites API Integration
  const { data: clientSites = [], isLoading: loadingSites, error: sitesError } = useClientSites(guardId, !!guardId);

  // Site Tasks API Integration - only fetch when a site is selected
  const {
    data: siteTasks = [],
    isLoading: loadingTasks,
    error: tasksError,
  } = useSiteTasks(guardId, selectedSite?.siteId || null, !!guardId && !!selectedSite?.siteId);

  // Utility functions
  const { sortSitesByName } = useClientSitesUtils();
  const { filterTasksByStatus, getTaskStats } = useSiteTasksUtils();

  // Auto-select first site when sites are loaded
  useEffect(() => {
    if (clientSites.length > 0 && !selectedSite) {
      const sortedSites = sortSitesByName(clientSites);
      setSelectedSite(sortedSites[0]);
    }
  }, [clientSites, selectedSite, sortSitesByName]);

  // Memoized task counts and filtered tasks
  const taskCounts = useMemo(() => {
    if (!siteTasks.length) {
      return { overdue: 0, pending: 0, done: 0 };
    }
    const stats = getTaskStats(siteTasks);
    return {
      overdue: stats.overdue,
      pending: stats.pending,
      done: stats.done,
    };
  }, [siteTasks, getTaskStats]);

  const currentTasks = useMemo(() => {
    return filterTasksByStatus(siteTasks, activeTab);
  }, [siteTasks, activeTab, filterTasksByStatus]);

  // Handle site selection
  const handleSiteClick = (site: TransformedClientSite) => {
    setSelectedSite(site);
    setActiveTab("overdue");
  };

  // Handle Add Task button click
  const handleAddNewTask = () => {
    navigate(`/officers/${officerId}/add-task`);
  };

  // Get task icon based on type
  const getTaskIcon = (taskType: string) => {
    const iconProps = { sx: { width: 16, height: 16, color: "#2A77D5" } };

    switch (taskType) {
      case "site_visit":
        return <HomeWorkIcon {...iconProps} />;
      case "training":
        return <SearchIcon {...iconProps} />;
      case "documents":
        return <DescriptionIcon {...iconProps} />;
      case "inspection":
        return <MilitaryTechIcon {...iconProps} />;
      case "other":
        return <DashboardCustomizeIcon {...iconProps} />;
      default:
        return <DashboardCustomizeIcon {...iconProps} />;
    }
  };

  // Show loading state
  if (officerLoading || !officerData) {
    return (
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          padding: "16px",
          borderRadius: "12px",
          background: "#F7F7F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Show error state if guard ID is not available
  if (!guardId) {
    return (
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          padding: "16px",
          borderRadius: "12px",
          background: "#F7F7F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Alert severity="error">Officer Guard ID not found. Cannot load client sites.</Alert>
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
        boxShadow: "0px 1px 4px 0px #4E515F0F",
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
        <Box
          sx={{
            width: "1020px",
            height: "32px",
            gap: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Title */}
          <Box
            sx={{
              width: "766px",
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
              Client Sites
            </Typography>
          </Box>

          {/* Add Task Button */}
          <Box
            sx={{
              width: 246,
              height: 32,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              startIcon={<AddIcon sx={{ width: 16, height: 16, color: "#2A77D5" }} />}
              onClick={handleAddNewTask}
              sx={{
                width: 112,
                height: 32,
                gap: 1.5,
                borderRadius: 1.5,
                px: 2,
                bgcolor: "#FFFFFF",
                boxShadow: "0px 1px 4px 0px #70707033",
                textTransform: "uppercase",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: "16px",
                color: "#2A77D5",
                "&:hover": { bgcolor: "#F5F5F5" },
              }}
            >
              ADD&nbsp;TASK
            </Button>
          </Box>
        </Box>

        {/* Divider */}
        <Divider
          sx={{
            width: "1020px",
            borderWidth: "1px",
            border: "1px solid #FFFFFF",
          }}
        />

        {/* Error Alerts */}
        {sitesError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Failed to load client sites: {sitesError.message}
          </Alert>
        )}

        {tasksError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Failed to load site tasks: {tasksError.message}
          </Alert>
        )}

        {/* Content */}
        <Box
          sx={{
            width: "1020px",
            height: "752px",
            display: "flex",
          }}
        >
          {/* Sites Table */}
          <Box
            sx={{
              width: "536px",
              height: "752px",
              borderWidth: "1px",
              borderTopLeftRadius: "10px",
              borderBottomLeftRadius: "10px",
              background: "#F7F7F7",
              border: "1px solid #F0F0F0",
            }}
          >
            <TableContainer
              component={Paper}
              sx={{
                width: "100%",
                height: "100%",
                borderTopLeftRadius: "10px",
                borderBottomLeftRadius: "10px",
                backgroundColor: "#F7F7F7",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#dddddd",
                  borderRadius: "4px",
                },
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "60px", fontFamily: "Mukta", fontWeight: 600, fontSize: "12px" }}>
                      Site ID
                    </TableCell>
                    <TableCell sx={{ width: "80px", fontFamily: "Mukta", fontWeight: 600, fontSize: "12px" }}>
                      Client
                    </TableCell>
                    <TableCell sx={{ width: "120px", fontFamily: "Mukta", fontWeight: 600, fontSize: "12px" }}>
                      Site Name
                    </TableCell>
                    <TableCell sx={{ width: "60px", fontFamily: "Mukta", fontWeight: 600, fontSize: "12px" }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ width: "50px", fontFamily: "Mukta", fontWeight: 600, fontSize: "12px" }}>
                      Posts
                    </TableCell>
                    <TableCell sx={{ width: "80px", fontFamily: "Mukta", fontWeight: 600, fontSize: "12px" }}>
                      Guard Count
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingSites ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : clientSites.length > 0 ? (
                    clientSites.map((site) => (
                      <TableRow
                        key={site.siteId}
                        hover
                        selected={selectedSite?.siteId === site.siteId}
                        onClick={() => handleSiteClick(site)}
                        sx={{
                          cursor: "pointer",
                          "&.Mui-selected": {
                            backgroundColor: "rgba(42, 119, 213, 0.1)",
                          },
                          "&:hover": {
                            backgroundColor: "rgba(42, 119, 213, 0.05)",
                          },
                        }}
                      >
                        <TableCell sx={{ fontFamily: "Mukta", fontSize: "14px" }}>
                          {site.siteId.substring(0, 8)}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "Mukta", fontSize: "14px" }}>{site.client}</TableCell>
                        <TableCell sx={{ fontFamily: "Mukta", fontSize: "14px" }}>{site.siteName}</TableCell>
                        <TableCell sx={{ fontFamily: "Mukta", fontSize: "14px" }}>{site.type}</TableCell>
                        <TableCell sx={{ fontFamily: "Mukta", fontSize: "14px", textAlign: "center" }}>
                          {site.posts}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "Mukta", fontSize: "14px", textAlign: "center" }}>
                          {site.guardCount}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography sx={{ color: "#707070", fontFamily: "Mukta" }}>No client sites found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Tasks Panel */}
          <Box
            sx={{
              width: "482px",
              height: "752px",
              gap: "16px",
              padding: "16px",
              borderTopRightRadius: "10px",
              borderBottomRightRadius: "10px",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {selectedSite ? (
              <>
                {/* Tasks Heading */}
                <Box
                  sx={{
                    width: "450px",
                    height: "16px",
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
                    TASKS
                  </Typography>
                </Box>

                {/* Task Tabs and Content */}
                <Box
                  sx={{
                    width: "450px",
                    height: "688px",
                    gap: "12px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Tab Container */}
                  <Box
                    sx={{
                      width: "450px",
                      height: "56px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "450px",
                        height: "48px",
                        padding: "8px",
                        gap: "8px",
                        borderRadius: "11px",
                        background: "#F7F7F7",
                        display: "flex",
                      }}
                    >
                      {/* OVERDUE Tab */}
                      <Box
                        onClick={() => setActiveTab("overdue")}
                        sx={{
                          width: "139.33px",
                          height: "32px",
                          borderRadius: "8px",
                          padding: "8px 24px",
                          backgroundColor: activeTab === "overdue" ? "#1D68C3" : "#FFFFFF",
                          boxShadow: "0px 1px 4px 0px #70707033",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <WarningIcon
                          sx={{
                            width: "16px",
                            height: "16px",
                            color: activeTab === "overdue" ? "#FFFFFF" : "#2A77D5",
                          }}
                        />
                        <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 500,
                              fontSize: "16px",
                              lineHeight: "24px",
                              textTransform: "uppercase",
                              color: activeTab === "overdue" ? "#FFFFFF" : "#2A77D5",
                            }}
                          >
                            OVERDUE
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 400,
                              fontSize: "16px",
                              lineHeight: "24px",
                              color: activeTab === "overdue" ? "#FFFFFF" : "#2A77D5",
                            }}
                          >
                            ({taskCounts.overdue.toString().padStart(2, "0")})
                          </Typography>
                        </Box>
                      </Box>

                      {/* PENDING Tab */}
                      <Box
                        onClick={() => setActiveTab("pending")}
                        sx={{
                          width: "139.33px",
                          height: "32px",
                          borderRadius: "8px",
                          padding: "8px",
                          backgroundColor: activeTab === "pending" ? "#1D68C3" : "#FFFFFF",
                          boxShadow: "0px 1px 4px 0px #70707033",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <AssignmentIcon
                          sx={{
                            width: "16px",
                            height: "16px",
                            color: activeTab === "pending" ? "#FFFFFF" : "#2A77D5",
                          }}
                        />
                        <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 500,
                              fontSize: "16px",
                              lineHeight: "24px",
                              textTransform: "uppercase",
                              color: activeTab === "pending" ? "#FFFFFF" : "#2A77D5",
                            }}
                          >
                            PENDING
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 400,
                              fontSize: "16px",
                              lineHeight: "24px",
                              color: activeTab === "pending" ? "#FFFFFF" : "#2A77D5",
                            }}
                          >
                            ({taskCounts.pending.toString().padStart(2, "0")})
                          </Typography>
                        </Box>
                      </Box>

                      {/* DONE Tab */}
                      <Box
                        onClick={() => setActiveTab("done")}
                        sx={{
                          width: "139.33px",
                          height: "32px",
                          borderRadius: "8px",
                          padding: "8px 24px",
                          backgroundColor: activeTab === "done" ? "#1D68C3" : "#FFFFFF",
                          boxShadow: "0px 1px 4px 0px #70707033",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            width: "16px",
                            height: "16px",
                            color: activeTab === "done" ? "#FFFFFF" : "#2A77D5",
                          }}
                        />
                        <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 500,
                              fontSize: "16px",
                              lineHeight: "24px",
                              textTransform: "uppercase",
                              color: activeTab === "done" ? "#FFFFFF" : "#2A77D5",
                            }}
                          >
                            DONE
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 400,
                              fontSize: "16px",
                              lineHeight: "24px",
                              color: activeTab === "done" ? "#FFFFFF" : "#2A77D5",
                            }}
                          >
                            ({taskCounts.done.toString().padStart(2, "0")})
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Task List Header */}
                  <Box
                    sx={{
                      width: "450px",
                      height: "16px",
                      paddingX: "16px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        width: "201px",
                        fontFamily: "Mukta",
                        fontWeight: 500,
                        fontSize: "12px",
                        lineHeight: "16px",
                        textTransform: "capitalize",
                        color: "#3B3B3B",
                      }}
                    >
                      DUE ON
                    </Typography>

                    <Divider orientation="vertical" sx={{ height: "16px", mx: 1 }} />

                    <Typography
                      sx={{
                        width: "201px",
                        fontFamily: "Mukta",
                        fontWeight: 500,
                        fontSize: "12px",
                        lineHeight: "16px",
                        textTransform: "capitalize",
                        color: "#3B3B3B",
                      }}
                    >
                      ASSIGNED BY
                    </Typography>
                  </Box>

                  {/* Tasks List */}
                  {loadingTasks ? (
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : currentTasks.length > 0 ? (
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
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
                      {currentTasks.map((task) => (
                        <Box
                          key={task.id}
                          sx={{
                            width: "450px",
                            height: "72px",
                            borderRadius: "10px",
                            border: "1px solid #F0F0F0",
                            boxShadow: "0px 1px 4px 0px #70707033",
                            background: "#FFFFFF",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* Task Info Row */}
                          <Box
                            sx={{
                              width: "100%",
                              height: "40px",
                              paddingX: "16px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {/* Date & Time */}
                            <Box
                              sx={{
                                width: "205px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Mukta",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  color: "#3B3B3B",
                                }}
                              >
                                {task.dueDate}
                              </Typography>

                              <Divider orientation="vertical" sx={{ height: "16px" }} />

                              <Typography
                                sx={{
                                  fontFamily: "Mukta",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  color: "#3B3B3B",
                                }}
                              >
                                {task.dueTime}
                              </Typography>
                            </Box>

                            {/* Assigned By */}
                            <Box
                              sx={{
                                width: "205px",
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Mukta",
                                  fontWeight: 400,
                                  fontSize: "16px",
                                  lineHeight: "24px",
                                  textAlign: "center",
                                  color: "#3B3B3B",
                                }}
                              >
                                {task.assignedBy}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Task Icon Row */}
                          <Box
                            sx={{
                              width: "100%",
                              height: "32px",
                              padding: "6px 24px",
                              background: "#F1F7FE",
                              borderBottomLeftRadius: "10px",
                              borderBottomRightRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {getTaskIcon(task.taskType)}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        flex: 1,
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
                        NO {activeTab.toUpperCase()} TASKS
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                  Select a client site to view tasks
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerClientSitesWindow;
