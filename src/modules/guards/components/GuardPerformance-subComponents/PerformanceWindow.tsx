// export default PerformanceWindow;

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useGuards } from "../../context/GuardContext";
import InfoItem from "../../reusableComponents/InfoItem";
import SectionCard from "../../reusableComponents/SectionCard";
import { useDefaultsUtils, useGuardDefaults } from "../../services/defaultsApiService";
import { useIncidents, useIncidentsUtils } from "../../services/incidentsApiService";
import { formatDateStartForBackend, formatDateEndForBackend } from "@modules/clients/utils/dateFormatUtils";
import { performanceDataService, type ClientAssignment } from "../../services/performanceDataService";
import { useTasks } from "../../services/tasksApiService";
import DefaultsCard from "../GuardPerformanceWindow-SubComponents/GuardDefaultsComponent";
import IncidentReportsComponent from "../GuardPerformanceWindow-SubComponents/IncidentReportComponent";
import TasksComponent from "../GuardPerformanceWindow-SubComponents/TaskComponent";

// Define view types for date selection
type DateViewType = "DAY" | "WEEK" | "MONTH" | "CUSTOM";

// Helper function to format date as DD-MM-YYYY
const formatDateDDMMYYYY = (date: Date): string => {
  return format(date, "dd-MM-yyyy");
};

// Helper function to format date display for buttons
const formatDateForButton = (date: Date): string => {
  const day = format(date, "EEE").toUpperCase();
  const dateStr = formatDateDDMMYYYY(date);
  return `${day} ${dateStr}`;
};

// Helper function to format date with day name for dropdown
const formatDateForDropdown = (date: Date): string => {
  const dayName = format(date, "EEE");
  const dateStr = formatDateDDMMYYYY(date);
  return `${dayName} ${dateStr}`;
};

// Helper function to format week range
const formatWeekRange = (startDate: Date, endDate: Date): string => {
  return `${formatDateDDMMYYYY(startDate)} - ${formatDateDDMMYYYY(endDate)}`;
};

// Helper function to format month
const formatMonthYear = (date: Date): string => {
  return format(date, "MMMM yyyy");
};

const PerformanceWindow: React.FC = () => {
  // Get guard ID from URL params
  const { guardId } = useParams<{ guardId: string }>();

  // Get guards data from context
  const { guards, loading: guardsLoading } = useGuards();

  // State for current date view (DAY, WEEK, MONTH, CUSTOM)
  const [dateView, setDateView] = useState<DateViewType>("DAY");

  // State for selected date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // State for showing date picker (for CUSTOM view)
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // State for client assignment data (keeping existing logic)
  const [clientAssignment, setClientAssignment] = useState<ClientAssignment | null>(null);
  const [loadingClientData, setLoadingClientData] = useState<boolean>(false);

  // NEW: State for dropdown menus
  const [weekDropdownAnchor, setWeekDropdownAnchor] = useState<null | HTMLElement>(null);
  const [monthDropdownAnchor, setMonthDropdownAnchor] = useState<null | HTMLElement>(null);

  // NEW: State to track if a specific date was selected from dropdown
  const [isSpecificDateSelected, setIsSpecificDateSelected] = useState<boolean>(false);

  // Current guard data
  const guardData = guards.find(g => g.id === guardId);

  // Get utility functions
  const { getDefaultsForDate, getDefaultsForDateRange, invalidateGuardDefaults, getDateRangeForView } =
    useDefaultsUtils();
  const incidentsUtils = useIncidentsUtils();

  // Calculate date range based on current view and get API parameters
  const { fromDate, toDate } = useMemo(() => {
    if (isSpecificDateSelected && (dateView === "WEEK" || dateView === "MONTH")) {
      // For specific date selection, query only that date
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);
      return {
        fromDate: formatDateStartForBackend(dayStart),
        toDate: formatDateEndForBackend(dayEnd)
      };
    }
    return getDateRangeForView(selectedDate, dateView);
  }, [selectedDate, dateView, isSpecificDateSelected, getDateRangeForView]);

  // Use TanStack Query for defaults with caching and date range
  const {
    data: allDefaults = [],
    isLoading: loadingDefaults,
    error: defaultsError,
    refetch: refetchDefaults,
    isRefetching,
    dataUpdatedAt,
  } = useGuardDefaults(guardData?.id || null, !!guardData?.id, fromDate, toDate);

  // Separate query for getting period data (week/month) to populate dropdowns
  const periodDateRange = useMemo(() => {
    return getDateRangeForView(selectedDate, dateView);
  }, [selectedDate, dateView, getDateRangeForView]);

  const { data: periodDefaults = [], isLoading: loadingPeriodDefaults } = useGuardDefaults(
    guardData?.id || null,
    !!guardData?.id && (dateView === "WEEK" || dateView === "MONTH"), // Removed the isSpecificDateSelected condition
    periodDateRange.fromDate,
    periodDateRange.toDate
  );

  // Use TanStack Query for incidents - fetch all incidents for the guard
  const {
    data: incidents = [],
    isLoading: loadingIncidents,
    error: incidentsError,
    refetch: refetchIncidents,
  } = useIncidents(guardData?.id || null, !!guardData?.id);

  // Use TanStack Query for tasks - fetch all tasks for the guard
  const {
    data: tasks = [],
    isLoading: loadingTasks,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasks(guardData?.id || null, !!guardData?.id);

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
    return getDefaultsForDate(allDefaults, selectedDate);
  }, [allDefaults, selectedDate, getDefaultsForDate]);

  // Get available dates for dropdowns
  const availableDatesForDropdown = useMemo(() => {
    if (dateView !== "WEEK" && dateView !== "MONTH") return [];
    if (isSpecificDateSelected) return [];

    const dateRange = getDateRange();
    const availableDefaults = getDefaultsForDateRange(periodDefaults, dateRange.start, dateRange.end);

    return availableDefaults
      .filter((gd) => gd.defaults.length > 0) // Only dates with defaults
      .map((gd) => ({
        date: new Date(gd.date),
        defaultsCount: gd.defaults.length,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date
  }, [periodDefaults, dateView, isSpecificDateSelected, getDefaultsForDateRange]);

  // Filter incidents and tasks based on current view
  const filteredIncidents = useMemo(() => {
    return incidentsUtils.getIncidentsForDate(incidents, selectedDate);
  }, [incidents, selectedDate, incidentsUtils]);

  const filteredTasks = useMemo(() => {
    const today = selectedDate.toISOString().split("T")[0];
    return tasks.filter((task) => {
      // Check if task deadline is today
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline).toISOString().split("T")[0];
        if (deadlineDate === today) return true;
      }

      // Check if task was started today
      if (task.startedAt) {
        const startDate = new Date(task.startedAt).toISOString().split("T")[0];
        if (startDate === today) return true;
      }

      // Show PENDING and INPROGRESS tasks regardless of date for better UX
      if (task.status === "PENDING" || task.status === "INPROGRESS") {
        return true;
      }

      return false;
    });
  }, [tasks, selectedDate]);

  // Keep existing client assignment logic
  React.useEffect(() => {
    if (!guardData) return;

    setLoadingClientData(true);
    performanceDataService
      .getClientAssignment(guardData.id, selectedDate)
      .then((data) => {
        setClientAssignment(data);
        setLoadingClientData(false);
      })
      .catch((error) => {
        console.error("Error fetching client assignment:", error);
        setClientAssignment(null);
        setLoadingClientData(false);
      });
  }, [guardData, selectedDate]);

  // Handle date view change and update selected date
  const handleDateViewChange = (view: DateViewType) => {
    setDateView(view);
    setIsSpecificDateSelected(false);
    setWeekDropdownAnchor(null);
    setMonthDropdownAnchor(null);

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
      setIsSpecificDateSelected(false);
      if (dateView === "CUSTOM") {
        setShowDatePicker(true);
      } else {
        setShowDatePicker(false);
      }
    }
  };

  // Handle week dropdown - FIXED VERSION
  const handleWeekDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🔄 Week dropdown click:", {
      dateView,
      availableDatesLength: availableDatesForDropdown.length,
      isSpecificDateSelected,
    });

    // Always show dropdown if we're in WEEK view and have available dates
    if (dateView === "WEEK" && availableDatesForDropdown.length > 0) {
      setWeekDropdownAnchor(event.currentTarget);
    } else if (dateView !== "WEEK") {
      // Only change view if we're not already in WEEK view
      handleDateViewChange("WEEK");
    }
  };

  // Handle month dropdown - FIXED VERSION
  const handleMonthDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🔄 Month dropdown click:", {
      dateView,
      availableDatesLength: availableDatesForDropdown.length,
      isSpecificDateSelected,
    });

    // Always show dropdown if we're in MONTH view and have available dates
    if (dateView === "MONTH" && availableDatesForDropdown.length > 0) {
      setMonthDropdownAnchor(event.currentTarget);
    } else if (dateView !== "MONTH") {
      // Only change view if we're not already in MONTH view
      handleDateViewChange("MONTH");
    }
  };

  // Handle dropdown close - but allow reopening

  const handleMonthDropdownClose = () => {
    setMonthDropdownAnchor(null);
  };

  // Handle date selection from dropdown
  const handleDateSelectionFromDropdown = (date: Date, _keepDropdownOpen: boolean = false) => {
    setSelectedDate(date);
    setIsSpecificDateSelected(true);
    setWeekDropdownAnchor(null);
    setMonthDropdownAnchor(null);
  };

  // Handle refresh all data
  const handleRefreshAll = async () => {
    if (guardData?.id) {
      console.log(`🔄 Force refreshing all data for guard: ${guardData.id}`);
      invalidateGuardDefaults(guardData.id);
      await Promise.all([refetchDefaults(), refetchIncidents(), refetchTasks()]);
    }
  };

  // Get date display text based on current view
  const getDateDisplayText = (): string => {
    if (isSpecificDateSelected && (dateView === "WEEK" || dateView === "MONTH")) {
      return formatDateForButton(selectedDate);
    }

    const dateRange = getDateRange();

    switch (dateView) {
      case "DAY": {
        return formatDateForButton(selectedDate);
      }
      case "WEEK": {
        return formatWeekRange(dateRange.start, dateRange.end);
      }
      case "MONTH": {
        return formatMonthYear(selectedDate);
      }
      case "CUSTOM": {
        return formatDateDDMMYYYY(selectedDate);
      }
      default:
        return "";
    }
  };

  // Get performance data title
  const getPerformanceTitle = (): string => {
    if (isSpecificDateSelected && (dateView === "WEEK" || dateView === "MONTH")) {
      return `Performance : ${formatDateDDMMYYYY(selectedDate)}`;
    }

    switch (dateView) {
      case "DAY":
        return "Performance : Today";
      case "WEEK":
        return "Performance : This Week";
      case "MONTH":
        return "Performance : This Month";
      case "CUSTOM":
        return `Performance : ${formatDateDDMMYYYY(selectedDate)}`;
      default:
        return "Performance";
    }
  };

  // Show loading state
  if (guardsLoading || !guardData) {
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
          Loading guard details...
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
            {guardData?.id && (
              <Tooltip title={`Last updated: ${dataUpdatedAt ? format(new Date(dataUpdatedAt), "HH:mm:ss") : "Never"}`}>
                <span>
                  <IconButton
                    onClick={handleRefreshAll}
                    disabled={isRefetching || loadingIncidents || loadingTasks}
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

          {/* Calendar Section */}
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

            {/* Buttons container */}
            <Box
              sx={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
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
                  width: dateView === "DAY" ? "220px" : "87px",
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

              {/* WEEK Button with Dropdown - FIXED VERSION */}
              <Button
                variant={dateView === "WEEK" ? "contained" : "outlined"}
                onClick={handleWeekDropdownClick}
                startIcon={
                  <DateRangeIcon
                    sx={{ width: 16, height: 16, color: dateView === "WEEK" ? "#FFFFFF ! important" : "#2A77D5" }}
                  />
                }
                endIcon={
                  dateView === "WEEK" && availableDatesForDropdown.length > 0 ? (
                    <ExpandMoreIcon sx={{ width: 16, height: 16 }} />
                  ) : null
                }
                sx={{
                  width: isSpecificDateSelected && dateView === "WEEK" ? "220px" : "87px",
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
                {isSpecificDateSelected && dateView === "WEEK" ? `WEEK | ${getDateDisplayText()}` : "WEEK"}
              </Button>

              {/* Week Dropdown Menu */}
              <Menu
                anchorEl={weekDropdownAnchor}
                open={Boolean(weekDropdownAnchor)}
                onClose={() => setWeekDropdownAnchor(null)}
                PaperProps={{
                  sx: {
                    maxHeight: 200,
                    width: 280,
                    mt: 1,
                  },
                }}
              >
                {loadingPeriodDefaults ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography>Loading...</Typography>
                  </MenuItem>
                ) : availableDatesForDropdown.length > 0 ? (
                  availableDatesForDropdown.map((item) => (
                    <MenuItem
                      key={formatDateDDMMYYYY(item.date)}
                      onClick={() => handleDateSelectionFromDropdown(item.date)}
                      sx={{
                        fontFamily: "Mukta",
                        fontSize: "14px",
                        "&:hover": {
                          backgroundColor: "#F0F7FF",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <Typography sx={{ fontFamily: "Mukta", fontSize: "14px" }}>
                          {formatDateForDropdown(item.date)}
                        </Typography>
                        <Typography sx={{ fontFamily: "Mukta", fontSize: "12px", color: "#707070" }}>
                          {item.defaultsCount} default{item.defaultsCount > 1 ? "s" : ""}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <Typography sx={{ fontFamily: "Mukta", fontSize: "14px", color: "#707070" }}>
                      No defaults found in this week
                    </Typography>
                  </MenuItem>
                )}
              </Menu>

              {/* MONTH Button with Dropdown - FIXED VERSION */}
              <Button
                variant={dateView === "MONTH" ? "contained" : "outlined"}
                onClick={handleMonthDropdownClick}
                startIcon={
                  <EventIcon
                    sx={{ width: 16, height: 16, color: dateView === "MONTH" ? "#FFFFFF ! important" : "#2A77D5" }}
                  />
                }
                endIcon={
                  dateView === "MONTH" && availableDatesForDropdown.length > 0 ? (
                    <ExpandMoreIcon sx={{ width: 16, height: 16 }} />
                  ) : null
                }
                sx={{
                  width: isSpecificDateSelected && dateView === "MONTH" ? "220px" : "99px",
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
                {isSpecificDateSelected && dateView === "MONTH" ? `MONTH | ${getDateDisplayText()}` : "MONTH"}
              </Button>

              {/* Month Dropdown Menu */}
              <Menu
                anchorEl={monthDropdownAnchor}
                open={Boolean(monthDropdownAnchor)}
                onClose={handleMonthDropdownClose}
                PaperProps={{
                  sx: {
                    maxHeight: 200,
                    width: 280,
                    mt: 1,
                  },
                }}
              >
                {loadingPeriodDefaults ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography>Loading...</Typography>
                  </MenuItem>
                ) : availableDatesForDropdown.length > 0 ? (
                  availableDatesForDropdown.map((item) => (
                    <MenuItem
                      key={formatDateDDMMYYYY(item.date)}
                      onClick={(e) => {
                        // Keep dropdown open if Ctrl/Cmd is held, close if not
                        const keepOpen = e.ctrlKey || e.metaKey;
                        handleDateSelectionFromDropdown(item.date, keepOpen);
                      }}
                      selected={
                        isSpecificDateSelected && formatDateDDMMYYYY(selectedDate) === formatDateDDMMYYYY(item.date)
                      }
                      sx={{
                        fontFamily: "Mukta",
                        fontSize: "14px",
                        "&:hover": {
                          backgroundColor: "#F0F7FF",
                        },
                        "&.Mui-selected": {
                          backgroundColor: "#E3F2FD",
                          "&:hover": {
                            backgroundColor: "#BBDEFB",
                          },
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <Typography sx={{ fontFamily: "Mukta", fontSize: "14px" }}>
                          {formatDateForDropdown(item.date)}
                        </Typography>
                        <Typography sx={{ fontFamily: "Mukta", fontSize: "12px", color: "#707070" }}>
                          {item.defaultsCount} default{item.defaultsCount > 1 ? "s" : ""}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <Typography sx={{ fontFamily: "Mukta", fontSize: "14px", color: "#707070" }}>
                      No defaults found in this month
                    </Typography>
                  </MenuItem>
                )}
                {/* Help text */}
                {availableDatesForDropdown.length > 0 && (
                  <MenuItem disabled sx={{ fontSize: "10px", color: "#999", fontStyle: "italic" }}>
                    Hold Ctrl/Cmd + click to keep dropdown open
                  </MenuItem>
                )}
              </Menu>

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
                  minWidth: dateView === "CUSTOM" ? "220px" : "105px",
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
                {dateView === "CUSTOM" ? `CUSTOM | ${formatDateDDMMYYYY(selectedDate)}` : "CUSTOM"}
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
          {/* Client Info Section */}
          <SectionCard title="ASSIGNED CLIENT" width="1020px">
            {loadingClientData ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : clientAssignment ? (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <InfoItem label="Client Name" value={clientAssignment.clientName} />
                <InfoItem label="Site" value={clientAssignment.site} />
                <InfoItem label="Area Officer" value={clientAssignment.areaOfficer} />
                <InfoItem label="Starting Date" value={clientAssignment.startingDate} />
                <InfoItem label="Shift Day" value={clientAssignment.shiftDay} />
                <InfoItem label="Shift Time" value={clientAssignment.shiftTime} />
              </Box>
            ) : (
              <Typography sx={{ p: 2, color: "#707070" }}>No assignment data available for this period.</Typography>
            )}
          </SectionCard>

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
                sx={{
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
                        {isRefetching ? "Refreshing..." : "Loading defaults..."}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Always use normal DefaultsCard - no special week/month view */}
                <DefaultsCard defaults={currentDefaultsData} width="502px" height="288px" />

                {/* Cache indicator */}
                {dataUpdatedAt && !loadingDefaults && (
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
                    Updated: {format(new Date(dataUpdatedAt), "HH:mm")}
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
                  <Typography sx={{ fontSize: "12px", color: "#707070" }}>Loading incidents...</Typography>
                </Box>
              ) : (
                <IncidentReportsComponent incidents={filteredIncidents} width="502px" height="356px" />
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
                  <Typography sx={{ fontSize: "12px", color: "#707070" }}>Loading tasks...</Typography>
                </Box>
              ) : (
                <TasksComponent tasks={filteredTasks} width="502px" height="660px" />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PerformanceWindow;
