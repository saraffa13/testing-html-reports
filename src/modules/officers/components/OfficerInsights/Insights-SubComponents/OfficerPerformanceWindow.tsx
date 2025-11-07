import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, CircularProgress, Divider, IconButton, Tooltip, Typography } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useOfficers } from "../../../context/OfficerContext";
import { officerPerformanceDataService, type OfficerAssignment } from "../../../service/PerformanceDataService";

// Import the dedicated Officer API services
import { useOfficerDefaults, useOfficerDefaultsUtils } from "../../../service/officerDefaultsApiService";
import { useOfficerIncidents, useOfficerIncidentsUtils } from "../../../service/officerIncidentsApiService";
import { useOfficerTasks, useOfficerTasksUtils } from "../../../service/officerTasksApiService";

// Import existing Area Officer components
import OfficerCalendarOverlay from "../OfficerPerformanceWindow-SubComponents/OfficerCalendarOverlay";
import OfficerDefaultsCalendarView from "../OfficerPerformanceWindow-SubComponents/OfficerDefaultsCalenderView";
import OfficerDefaultsCard from "../OfficerPerformanceWindow-SubComponents/OfficerDefaultsComponent";
import OfficerIncidentReportsComponent from "../OfficerPerformanceWindow-SubComponents/OfficerIncidentReportComponent";
import OfficerTasksComponent from "../OfficerPerformanceWindow-SubComponents/OfficerTaskComponent";

// Define view types for date selection
type DateViewType = "DAY" | "WEEK" | "MONTH" | "CUSTOM";

const OfficerPerformanceWindow: React.FC = () => {
  // Get officer ID from URL params (this is the guardId)
  const { officerId } = useParams<{ officerId: string }>();

  // Get officers data from context
  const { officers, loading: officersLoading } = useOfficers();

  // State for current date view (DAY, WEEK, MONTH, CUSTOM)
  const [dateView, setDateView] = useState<DateViewType>("DAY");

  // State for selected date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // State for showing date picker (for CUSTOM view)
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // State for officer assignment data (keeping existing logic)
  const [officerAssignment, setOfficerAssignment] = useState<OfficerAssignment | null>(null);
  const [, setLoadingAssignmentData] = useState<boolean>(false);

  // State for calendar overlay
  const [showCalendarOverlay, setShowCalendarOverlay] = useState<boolean>(false);

  // Current officer data
  const officerData = officers.find(o => o.guardId === officerId);

  // 🔥 FIX: Use guardId for API calls, not reference id
  const officerGuardId = officerData?.guardId ?? ""; // For API calls
  const officerReferenceId = officerData?.id; // For UI display only

  console.log("🔍 Officer ID Debug:", {
    officerId,
    referenceId: officerReferenceId,
    guardId: officerGuardId,
    usingForAPIs: officerGuardId,
    hasOfficerData: !!officerData,
  });

  // Get utility functions from Officer services
  const { getDefaultsForDate, getDefaultsForDateRange, invalidateOfficerDefaults, getDateRangeForView } =
    useOfficerDefaultsUtils();

  const { getIncidentsForDate, invalidateOfficerIncidents } = useOfficerIncidentsUtils();

  const { invalidateOfficerTasks } = useOfficerTasksUtils();

  // Calculate date range based on current view and get API parameters
  const { fromDate, toDate } = useMemo(() => {
    return getDateRangeForView(selectedDate, dateView);
  }, [selectedDate, dateView, getDateRangeForView]);

  // 🔥 FIX: Use guardId for all API service calls
  const {
    data: allDefaults = [],
    isLoading: loadingDefaults,
    error: defaultsError,
    refetch: refetchDefaults,
    isRefetching: isRefetchingDefaults,
    dataUpdatedAt: defaultsUpdatedAt,
  } = useOfficerDefaults(officerGuardId || null, !!officerGuardId, fromDate, toDate);

  // Use TanStack Query for officer incidents - using guardId
  const {
    data: incidents = [],
    isLoading: loadingIncidents,
    error: incidentsError,
    refetch: refetchIncidents,
    isRefetching: isRefetchingIncidents,
  } = useOfficerIncidents(officerGuardId || null, !!officerGuardId);

  // Use TanStack Query for officer tasks - using guardId
  const {
    data: tasks = [],
    isLoading: loadingTasks,
    error: tasksError,
    refetch: refetchTasks,
    isRefetching: isRefetchingTasks,
  } = useOfficerTasks(officerGuardId || null, !!officerGuardId);

  // Calculate date range for UI components
  const getDateRange = (): { start: Date; end: Date } => {
    const today = selectedDate;

    switch (dateView) {
      case "DAY":
        return {
          start: startOfDay(today),
          end: startOfDay(today),
        };
      case "WEEK":
        return {
          start: startOfWeek(today, { weekStartsOn: 1 }), // Start on Monday
          end: endOfWeek(today, { weekStartsOn: 1 }), // End on Sunday
        };
      case "MONTH":
        return {
          start: startOfMonth(today),
          end: endOfMonth(today),
        };
      case "CUSTOM":
        return {
          start: startOfDay(today),
          end: startOfDay(today),
        };
      default:
        return {
          start: startOfDay(today),
          end: startOfDay(today),
        };
    }
  };

  // Memoized defaults data based on current view
  const currentDefaultsData = useMemo(() => {
    if (!allDefaults.length) return [];

    if (dateView === "DAY" || dateView === "CUSTOM") {
      return getDefaultsForDate(allDefaults, selectedDate);
    } else {
      // For week/month views, return defaults for the selected date within the range
      return getDefaultsForDate(allDefaults, selectedDate);
    }
  }, [allDefaults, dateView, selectedDate, getDefaultsForDate]);

  // Memoized calendar defaults data for week/month views
  const calendarDefaultsData = useMemo(() => {
    if (!allDefaults.length || (dateView !== "WEEK" && dateView !== "MONTH")) return [];

    const dateRange = getDateRange();
    return getDefaultsForDateRange(allDefaults, dateRange.start, dateRange.end);
  }, [allDefaults, dateView, selectedDate, getDefaultsForDateRange]);

  // Filter incidents and tasks based on current view
  const filteredIncidents = useMemo(() => {
    if (dateView === "DAY" || dateView === "CUSTOM") {
      return getIncidentsForDate(incidents, selectedDate);
    }
    // For week/month views, return all incidents and let the components handle display
    return incidents;
  }, [incidents, selectedDate, dateView, getIncidentsForDate]);

  const filteredTasks = useMemo(() => {
    // Debug logging to track task filtering
    console.log(`🔍 FILTERING TASKS:`, {
      dateView,
      selectedDate: selectedDate.toISOString().split("T")[0],
      totalTasks: tasks.length,
      allTasks: tasks.map((t) => ({ id: t.id, status: t.status, dueDate: t.dueDate })),
    });

    if (dateView === "DAY" || dateView === "CUSTOM") {
      // For day view, show ALL tasks regardless of date
      // This ensures DONE tasks are always visible
      const filtered = tasks; // Don't filter by date for day view

      console.log(`📋 DAY VIEW - Showing ALL tasks:`, {
        filteredCount: filtered.length,
        filteredTasks: filtered.map((t) => ({ id: t.id, status: t.status })),
      });

      return filtered;
    } else {
      // For week/month views, return all tasks
      console.log(`📅 WEEK/MONTH VIEW - Showing all tasks:`, {
        count: tasks.length,
        tasks: tasks.map((t) => ({ id: t.id, status: t.status })),
      });

      return tasks;
    }
  }, [tasks, selectedDate, dateView]);

  // Keep existing officer assignment logic using reference ID (or change if needed)
  useEffect(() => {
    if (!officerData) return;

    setLoadingAssignmentData(true);
    // Check if this API expects guardId or referenceId - you may need to change this
    officerPerformanceDataService
      .getOfficerAssignment(officerGuardId, selectedDate) // You might need to change to officerGuardId
      .then((data) => {
        setOfficerAssignment(data);
        setLoadingAssignmentData(false);
      })
      .catch((error) => {
        console.error("Error fetching officer assignment:", error);
        setOfficerAssignment(null);
        setLoadingAssignmentData(false);
      });
  }, [officerData, selectedDate, officerReferenceId]);

  // Handle date view change and update selected date
  const handleDateViewChange = (view: DateViewType) => {
    setDateView(view);

    if (view === "CUSTOM") {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
      const today = new Date();
      setSelectedDate(today);
    }
  };

  // Handle custom date selection
  const handleCustomDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      if (dateView === "CUSTOM") {
        setShowDatePicker(true);
      } else {
        setShowDatePicker(false);
      }
    }
  };

  // Handle calendar overlay
  const handleShowCalendar = () => {
    if (dateView === "WEEK" || dateView === "MONTH") {
      setShowCalendarOverlay(true);
    }
  };

  // Handle refresh all data - using guardId
  const handleRefreshAll = async () => {
    if (officerGuardId) {
      console.log(`🔄 Force refreshing all officer data for guardId: ${officerGuardId}`);

      // Invalidate all officer caches using guardId
      invalidateOfficerDefaults(officerGuardId);
      invalidateOfficerIncidents(officerGuardId);
      invalidateOfficerTasks(officerGuardId);

      // Refetch all data
      await Promise.all([refetchDefaults(), refetchIncidents(), refetchTasks()]);
    }
  };

  // Get date display text based on current view
  const getDateDisplayText = (): string => {
    const dateRange = getDateRange();

    switch (dateView) {
      case "DAY": {
        const day = format(selectedDate, "EEE").toUpperCase();
        const date = format(selectedDate, "MM/dd/yyyy");
        return `${day} ${date}`;
      }
      case "WEEK": {
        return `${format(dateRange.start, "MM/dd")} - ${format(dateRange.end, "MM/dd")}`;
      }
      case "MONTH": {
        return format(selectedDate, "MMMM yyyy");
      }
      case "CUSTOM": {
        return format(selectedDate, "MM/dd/yyyy");
      }
      default:
        return "";
    }
  };

  // Get performance data title
  const getPerformanceTitle = (): string => {
    switch (dateView) {
      case "DAY":
        return "Performance : Today";
      case "WEEK":
        return "Performance : This Week";
      case "MONTH":
        return "Performance : This Month";
      case "CUSTOM":
        return `Performance : ${format(selectedDate, "MMM dd, yyyy")}`;
      default:
        return "Performance";
    }
  };

  // Get calendar overlay title
  const getCalendarTitle = (): string => {
    switch (dateView) {
      case "WEEK":
        return `DEFAULTS : WEEK (${getDateDisplayText()})`;
      case "MONTH":
        return `DEFAULTS : MONTH (${getDateDisplayText()})`;
      default:
        return "DEFAULTS";
    }
  };

  // Check if any data is refreshing
  const isRefreshing = isRefetchingDefaults || isRefetchingIncidents || isRefetchingTasks;

  // Add error handling for missing guardId
  if (officerData && !officerGuardId) {
    return (
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          padding: "16px",
          borderRadius: "16px",
          background: "#F7F7F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Alert severity="error" sx={{ width: "80%", textAlign: "center" }}>
          <Typography sx={{ fontFamily: "Mukta", fontSize: "16px", fontWeight: 600 }}>Missing Guard ID</Typography>
          <Typography sx={{ fontFamily: "Mukta", fontSize: "14px", marginTop: 1 }}>
            Officer data is missing guardId field. Please check the officer context data.
          </Typography>
          <Typography sx={{ fontFamily: "Mukta", fontSize: "12px", marginTop: 1, color: "#666" }}>
            Reference ID: {officerReferenceId} | Guard ID: {officerGuardId || "Missing"}
          </Typography>
          <Button variant="outlined" onClick={() => window.location.reload()} sx={{ marginTop: 2 }}>
            Reload Page
          </Button>
        </Alert>
      </Box>
    );
  }

  // Show loading state
  if (officersLoading || !officerData) {
    return (
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          padding: "16px",
          borderRadius: "16px",
          background: "#F7F7F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="primary" />
        <Typography sx={{ fontFamily: "Mukta", fontSize: "16px", color: "#707070" }}>
          Loading officer details...
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
          {/* Title with Cache Info */}
          <Box
            sx={{
              width: "506px",
              height: "24px",
              gap: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: "Mukta",
                fontWeight: 600,
                fontSize: "24px",
                lineHeight: "32px",
                textTransform: "capitalize",
                color: "#3B3B3B",
              }}
            >
              {getPerformanceTitle()}
            </Typography>

            {/* Refresh Button for All Data */}
            {officerGuardId && (
              <Tooltip
                title={`Last updated: ${defaultsUpdatedAt ? format(new Date(defaultsUpdatedAt), "HH:mm:ss") : "Never"}`}
              >
                <span>
                  <IconButton
                    onClick={handleRefreshAll}
                    disabled={isRefreshing}
                    size="small"
                    sx={{
                      color: "#2A77D5",
                      "&:hover": { backgroundColor: "#F0F7FF" },
                      "&:disabled": {
                        color: "#CCCCCC",
                      },
                    }}
                  >
                    <RefreshIcon sx={{ width: 20, height: 20 }} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>

          {/* Calendar Section - keeping existing button code */}
          <Box
            sx={{
              width: "506px",
              height: "32px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "8px",
              position: "relative",
            }}
          >
            {/* Date picker for CUSTOM view */}
            {showDatePicker && (
              <Box
                sx={{
                  position: "absolute",
                  top: "-40px",
                  right: "0",
                  zIndex: 5,
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={handleCustomDateChange}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          width: "180px",
                          "& .MuiInputBase-root": {
                            borderRadius: "8px",
                            height: "32px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            )}

            {/* Date View Buttons */}
            <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* DAY Button */}
              <Button
                variant={dateView === "DAY" ? "contained" : "outlined"}
                onClick={() => handleDateViewChange("DAY")}
                startIcon={
                  <CalendarTodayIcon
                    sx={{ width: 16, height: 16, color: dateView === "DAY" ? "#FFFFFF ! important" : "#2A77D5" }}
                  />
                }
                sx={{
                  width: dateView === "DAY" ? "191px" : "87px",
                  height: "32px",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  textTransform: "uppercase",
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "16px",
                  backgroundColor: dateView === "DAY" ? "#2A77D5" : "#FFFFFF",
                  color: dateView === "DAY" ? "#FFFFFF" : "#2A77D5",
                  border: dateView === "DAY" ? "none" : "1px solid #2A77D5",
                  "&:hover": {
                    backgroundColor: dateView === "DAY" ? "#2364B6" : "#F0F7FF",
                  },
                  boxShadow: dateView === "DAY" ? "0px 1px 4px 0px #70707033" : "none",
                }}
              >
                {dateView === "DAY" ? `DAY | ${getDateDisplayText()}` : "DAY"}
              </Button>

              {/* WEEK Button */}
              <Button
                variant={dateView === "WEEK" ? "contained" : "outlined"}
                onClick={() => handleDateViewChange("WEEK")}
                startIcon={
                  <DateRangeIcon
                    sx={{ width: 16, height: 16, color: dateView === "WEEK" ? "#FFFFFF ! important" : "#2A77D5" }}
                  />
                }
                sx={{
                  width: "87px",
                  height: "32px",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  textTransform: "uppercase",
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "16px",
                  backgroundColor: dateView === "WEEK" ? "#2A77D5" : "#FFFFFF",
                  color: dateView === "WEEK" ? "#FFFFFF" : "#2A77D5",
                  border: dateView === "WEEK" ? "none" : "1px solid #2A77D5",
                  "&:hover": {
                    backgroundColor: dateView === "WEEK" ? "#2364B6" : "#F0F7FF",
                  },
                  boxShadow: dateView === "WEEK" ? "0px 1px 4px 0px #70707033" : "none",
                }}
              >
                WEEK
              </Button>

              {/* MONTH Button */}
              <Button
                variant={dateView === "MONTH" ? "contained" : "outlined"}
                onClick={() => handleDateViewChange("MONTH")}
                startIcon={
                  <EventIcon
                    sx={{ width: 16, height: 16, color: dateView === "MONTH" ? "#FFFFFF ! important" : "#2A77D5" }}
                  />
                }
                sx={{
                  width: "99px",
                  height: "32px",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  textTransform: "uppercase",
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "16px",
                  backgroundColor: dateView === "MONTH" ? "#2A77D5" : "#FFFFFF",
                  color: dateView === "MONTH" ? "#FFFFFF" : "#2A77D5",
                  border: dateView === "MONTH" ? "none" : "1px solid #2A77D5",
                  "&:hover": {
                    backgroundColor: dateView === "MONTH" ? "#2364B6" : "#F0F7FF",
                  },
                  boxShadow: dateView === "MONTH" ? "0px 1px 4px 0px #70707033" : "none",
                }}
              >
                MONTH
              </Button>

              {/* CUSTOM Button */}
              <Button
                variant={dateView === "CUSTOM" ? "contained" : "outlined"}
                onClick={() => handleDateViewChange("CUSTOM")}
                startIcon={
                  <CalendarTodayIcon
                    sx={{ width: 16, height: 16, color: dateView === "CUSTOM" ? "#FFFFFF ! important" : "#2A77D5" }}
                  />
                }
                sx={{
                  width: "auto",
                  minWidth: dateView === "CUSTOM" ? "191px" : "105px",
                  height: "32px",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  textTransform: "uppercase",
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "16px",
                  backgroundColor: dateView === "CUSTOM" ? "#2A77D5" : "#FFFFFF",
                  color: dateView === "CUSTOM" ? "#FFFFFF" : "#2A77D5",
                  border: dateView === "CUSTOM" ? "none" : "1px solid #2A77D5",
                  "&:hover": {
                    backgroundColor: dateView === "CUSTOM" ? "#2364B6" : "#F0F7FF",
                  },
                  boxShadow: dateView === "CUSTOM" ? "0px 1px 4px 0px #70707033" : "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {dateView === "CUSTOM" ? `CUSTOM | ${format(selectedDate, "MM/dd/yyyy")}` : "CUSTOM"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ width: "1020px", border: "1px solid #F0F0F0" }} />

        {/* Error Alerts */}
        {defaultsError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRefreshAll}>
                Retry
              </Button>
            }
            sx={{ marginBottom: "8px" }}
          >
            Failed to load defaults: {defaultsError instanceof Error ? defaultsError.message : "Unknown error"}
          </Alert>
        )}

        {incidentsError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRefreshAll}>
                Retry
              </Button>
            }
            sx={{ marginBottom: "8px" }}
          >
            Failed to load incidents: {incidentsError instanceof Error ? incidentsError.message : "Unknown error"}
          </Alert>
        )}

        {tasksError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRefreshAll}>
                Retry
              </Button>
            }
            sx={{ marginBottom: "8px" }}
          >
            Failed to load tasks: {tasksError instanceof Error ? tasksError.message : "Unknown error"}
          </Alert>
        )}

        {/* Content */}
        <Box
          sx={{
            width: "1020px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Officer Assignment Info Row */}
          {officerAssignment && (
            <Box
              sx={{
                width: "1020px",
                padding: "16px",
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                marginBottom: "8px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#707070",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                ASSIGNMENT DETAILS
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: "32px",
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#707070" }}>Assigned Area</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{officerAssignment.assignedArea}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#707070" }}>Guards Assigned</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{officerAssignment.guardsAssigned}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#707070" }}>Sites Assigned</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{officerAssignment.sitesAssigned}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#707070" }}>Shift Time</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{officerAssignment.shiftTime}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#707070" }}>PSARA Status</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{officerAssignment.psaraStatus}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#707070" }}>Supervisor</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{officerAssignment.supervisor}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Content Row - Two Column Layout */}
          <Box
            sx={{
              width: "1020px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            {/* Left Column - Defaults and Incident Reports */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "502px",
              }}
            >
              {/* Defaults Card */}
              <Box
                onClick={handleShowCalendar}
                sx={{
                  cursor: dateView === "WEEK" || dateView === "MONTH" ? "pointer" : "default",
                  position: "relative",
                }}
              >
                {loadingDefaults && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1,
                      borderRadius: "10px",
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={24} />
                      <Typography sx={{ fontSize: "12px", color: "#707070" }}>
                        {isRefetchingDefaults ? "Refreshing..." : "Loading defaults..."}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {dateView === "WEEK" || dateView === "MONTH" ? (
                  <OfficerDefaultsCalendarView
                    defaultsData={calendarDefaultsData}
                    selectedDate={selectedDate}
                    dateView={dateView}
                    onDayClick={(dayDefaults, date) => {
                      if (dayDefaults.length > 0) {
                        setSelectedDate(date);
                        setShowCalendarOverlay(true);
                      }
                    }}
                  />
                ) : (
                  <OfficerDefaultsCard defaults={currentDefaultsData} width="502px" height="288px" />
                )}

                {/* Cache indicator */}
                {defaultsUpdatedAt && !loadingDefaults && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      fontSize: "10px",
                      color: "#707070",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: "1px solid #F0F0F0",
                    }}
                  >
                    Updated: {format(new Date(defaultsUpdatedAt), "HH:mm")}
                  </Box>
                )}
              </Box>

              {/* Incident Reports Component */}
              {loadingIncidents ? (
                <Box
                  sx={{
                    width: "502px",
                    height: "356px",
                    borderRadius: "10px",
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <CircularProgress size={24} />
                  <Typography sx={{ fontSize: "12px", color: "#707070" }}>
                    {isRefetchingIncidents ? "Refreshing..." : "Loading incidents..."}
                  </Typography>
                </Box>
              ) : (
                <OfficerIncidentReportsComponent incidents={filteredIncidents} width="502px" height="356px" />
              )}
            </Box>

            {/* Right Column - Tasks */}
            <Box
              sx={{
                width: "502px",
              }}
            >
              {loadingTasks ? (
                <Box
                  sx={{
                    width: "502px",
                    height: "660px",
                    borderRadius: "10px",
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <CircularProgress size={24} />
                  <Typography sx={{ fontSize: "12px", color: "#707070" }}>
                    {isRefetchingTasks ? "Refreshing..." : "Loading tasks..."}
                  </Typography>
                </Box>
              ) : (
                <OfficerTasksComponent tasks={filteredTasks} width="502px" height="660px" />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Calendar Overlay for Week/Month Views */}
      <OfficerCalendarOverlay
        open={showCalendarOverlay}
        onClose={() => setShowCalendarOverlay(false)}
        selectedDate={selectedDate}
        defaultsData={calendarDefaultsData}
        title={getCalendarTitle()}
      />
    </Box>
  );
};

export default OfficerPerformanceWindow;
