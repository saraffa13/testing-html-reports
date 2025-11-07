import { useGetClients } from "@modules/clients/apis/hooks/useGetClients";
import type { ClientListItem } from "@modules/clients/types";
import { transformToClientListItem } from "@modules/clients/types";
import { formatDateForBackend } from "@modules/clients/utils/dateFormatUtils";
import { formatDate } from "@modules/clients/utils/dateRangeUtils";
import { useAuth } from "../../../hooks/useAuth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarViewMonthOutlinedIcon from "@mui/icons-material/CalendarViewMonthOutlined";
import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MapsHomeWorkOutlinedIcon from "@mui/icons-material/MapsHomeWorkOutlined";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import QueryBuilderOutlinedIcon from "@mui/icons-material/QueryBuilderOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { Box, Button, CircularProgress, Divider, Menu, MenuItem, Typography } from "@mui/material";
import { Shirt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  useAreaOfficerTasks,
  useAreaOfficers,
  useAttendanceOverview,
  useDashboardOverview,
  useIncidentReports,
  useLateUniformSummary,
  useLivelinessAlerts,
  useShiftPerformanceIssues,
} from "../apis/hooks/useDashboard";
import DashboardTableView from "../components/DashboardTableView";

type ViewType = "live" | "day" | "month";

type TableViewType =
  | "overview"
  | "liveiness"
  | "attendance"
  | "guards"
  | "shifts"
  | "area-officers"
  | "incidents"
  | "area-officers-tasks";

/**
 * Live Dashboard Component
 *
 * This component provides a comprehensive dashboard with multiple views:
 * - LIVE: Shows data from the last 24 hours
 * - DAY: Shows data for a selected day
 * - MONTH: Shows data for a selected month
 *
 * Integrates with the following APIs:
 * - Dashboard Overview: /api/v2/dashboard/overview
 * - Liveliness Alerts: /api/v2/dashboard/liveliness-alerts
 * - Late Uniform Summary: /api/v2/dashboard/late-uniform-summary
 * - Shift Performance Issues: /api/v2/dashboard/shift-performance-issues
 * - Area Officers: /api/v2/dashboard/area-officers-only/absent-late-uniform
 * - Incident Reports: /api/v2/dashboard/incident-reports
 * - Tasks: /api/v2/tasks
 */

export default function LiveDashboard() {
  const [selectedView, setSelectedView] = useState<ViewType>("live");
  const [selectedTableView, setSelectedTableView] = useState<TableViewType>("overview");
  const [selectedColumn, setSelectedColumn] = useState<string>("absent");
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentFormatted = formatDate(currentDate);
  const todayString = `${currentFormatted.dayName} ${currentFormatted.day}/${currentFormatted.month}/${currentFormatted.year}`;
  const monthString = `${currentFormatted.monthName} ${currentFormatted.year}`;

  const getButtonStyles = (_view: ViewType, isSelected: boolean) => ({
    bgcolor: isSelected ? "#2A77D5" : "white",
    color: isSelected ? "white" : "#2A77D5",
    "&:hover": {
      bgcolor: isSelected ? "#1E5A96" : "#E3F2FD",
    },
  });

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
  };

  const handleTableViewChange = (view: TableViewType) => {
    setSelectedTableView(view);
  };

  const handleColumnClick = (columnField: string) => {
    setSelectedColumn(columnField);
  };

  // Get the current user's agency ID
  const { user, isUserLoading } = useAuth();
  const opAgencyId = user?.agencyId;

  // Debug: Remove in production
  // console.log("🔍 Dashboard Debug - User:", user);
  // console.log("🔍 Dashboard Debug - opAgencyId:", opAgencyId);

  // Show loading while user is being fetched
  if (isUserLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Don't render if no agency ID available
  if (!opAgencyId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>No agency data available</Typography>
      </Box>
    );
  }

  const { startDate, endDate } = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    if (selectedView === "day") {
      // Day view: selected day from 00:00:00 to 23:59:59
      startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedView === "month") {
      // Month view: first day to last day of selected month
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Live view: last 24 hours from current time
      endDate = new Date();
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    }

    return {
      startDate: formatDateForBackend(startDate),
      endDate: formatDateForBackend(endDate),
    };
  }, [selectedView, currentDate]);

  const { data: clientsResponse, isLoading, error } = useGetClients(opAgencyId);

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardOverview({
    opAgencyId,
    from: startDate,
    to: endDate,
    page: 1,
    limit: 50,
  });

  const {
    data: lateUniformData,
    isLoading: isLateUniformLoading,
    error: lateUniformError,
  } = useLateUniformSummary({
    opAgencyId,
    page: 1,
    limit: 50,
    sortOrder: "desc",
    incidentStatus: "ALL",
    fromDate: startDate,
    toDate: endDate,
  });

  const {
    data: shiftPerformanceData,
    isLoading: isShiftPerformanceLoading,
    error: shiftPerformanceError,
  } = useShiftPerformanceIssues({
    opAgencyId,
    page: 1,
    limit: 50,
    sortOrder: "desc",
    incidentStatus: "ALL",
    fromDate: startDate,
    toDate: endDate,
  });

  const {
    data: areaOfficersData,
    isLoading: isAreaOfficersLoading,
    error: areaOfficersError,
  } = useAreaOfficers({
    opAgencyId,
    page: 1,
    limit: 50,
    sortOrder: "desc",
    incidentStatus: "ALL",
    fromDate: startDate,
    toDate: endDate,
  });

  const {
    data: areaOfficerTasksData,
    isLoading: isAreaOfficerTasksLoading,
    error: areaOfficerTasksError,
  } = useAreaOfficerTasks({
    opAgencyId,
    page: 1,
    limit: 50,
  });

  const {
    data: incidentReportsData,
    isLoading: isIncidentReportsLoading,
    error: incidentReportsError,
  } = useIncidentReports({
    opAgencyId,
    page: 1,
    limit: 50,
    sortOrder: "desc",
    incidentStatus: "ALL",
    fromDate: startDate,
    toDate: endDate,
  });

  const { isLoading: isLivelinessAlertsLoading, error: livelinessAlertsError } = useLivelinessAlerts({
    opAgencyId,
    from: startDate,
    to: endDate,
    page: 1,
    limit: 50,
  });

  // Attendance overview API integration
  const {
    data: attendanceOverviewData,
    isLoading: isAttendanceOverviewLoading,
    error: attendanceOverviewError,
  } = useAttendanceOverview({
    opAgencyId,
    from: startDate,
    to: endDate,
    page: 1,
    limit: 50,
  });

  // Update attendance totals to use the new API data
  const attendanceTotals = {
    totalAbsent: attendanceOverviewData?.data?.totalAbsentCount || 0,
    totalReplaced: attendanceOverviewData?.data?.totalRelacedCount || 0,
    totalToReplace: attendanceOverviewData?.data?.totalToReplaceCount || 0,
  };

  const overviewData = dashboardData?.data?.clients || [];
  const totals = overviewData.reduce(
    (acc, client) => ({
      absent: acc.absent + client.defaults.absentCount,
      late: acc.late + client.defaults.lateCount,
      uniform: acc.uniform + client.defaults.uniformCount,
      alertness: acc.alertness + client.defaults.alertnessCount,
      geofence: acc.geofence + client.defaults.geofenceCount,
    }),
    { absent: 0, late: 0, uniform: 0, alertness: 0, geofence: 0 }
  );

  console.log(totals);

  const lateUniformSummary = lateUniformData?.data?.data?.[0];
  const guardTotals = {
    late: lateUniformSummary?.totalLateCount || 0,
    uniform: lateUniformSummary?.totalUniformDefaultCount || 0,
  };

  const shiftPerformanceSummary: any = shiftPerformanceData?.data?.data?.[0] || {};

  const incidentReportSummary = {
    totalIncidents: incidentReportsData?.data?.data?.[0]?.totalIncidents || 0,
    openIncidents: incidentReportsData?.data?.data?.[0]?.openIncidents || 0,
    closedIncidents: incidentReportsData?.data?.data?.[0]?.closedIncidents || 0,
  };

  const areaOfficerSummary = {
    absent: areaOfficersData?.data?.data?.[0]?.totalAbsentCount || 0,
    late: areaOfficersData?.data?.data?.[0]?.totalLateCount || 0,
    uniform: areaOfficersData?.data?.data?.[0]?.totalUniformDefaultCount || 0,
  };

  // Calculate task counts to match right side logic
  const now = new Date();
  const allTasks = areaOfficerTasksData?.data?.tasks || [];

  // Type guard function to match right side validation
  const isValidTask = (task: any) => {
    return (
      task &&
      typeof task === "object" &&
      typeof task.id === "string" &&
      typeof task.areaOfficerId === "string" &&
      task.client &&
      typeof task.client === "object" &&
      typeof task.client.clientName === "string" &&
      task.site &&
      typeof task.site === "object" &&
      typeof task.site.siteName === "string" &&
      "taskStatus" in task &&
      "deadline" in task
    );
  };

  const overdueTasks = allTasks.filter(
    (task: any) =>
      isValidTask(task) &&
      (task.taskStatus === "PENDING" || task.taskStatus === "INPROGRESS") &&
      new Date(task.deadline) < now
  );
  const pendingTasks = allTasks.filter(
    (task: any) =>
      isValidTask(task) &&
      (task.taskStatus === "PENDING" || task.taskStatus === "INPROGRESS") &&
      new Date(task.deadline) >= now
  );
  const completedTasks = allTasks.filter((task: any) => isValidTask(task) && task.taskStatus === "COMPLETED");

  const areaOfficerTasksSummary = {
    overdueTasks: overdueTasks.length,
    pendingTasks: pendingTasks.length,
    completedTasks: completedTasks.length,
    inProgressTasks: 0, // Not used in the UI
  };

  const [showFavouritesOnly] = useState(false);
  const [guardCountRange, setGuardCountRange] = useState<[number, number]>([0, 500]);
  const [sitesCountRange, setSitesCountRange] = useState<[number, number]>([0, 100]);
  const [pageSize] = useState(5);
  const [, setCurrentPage] = useState(0);
  const [filteredRows, setFilteredRows] = useState<ClientListItem[]>([]);
  const [clientRows, setClientRows] = useState<ClientListItem[]>([]);

  useEffect(() => {
    if (clientsResponse?.data) {
      const transformedClients = clientsResponse.data.map(transformToClientListItem);
      setClientRows(transformedClients);

      if (transformedClients.length > 0) {
        const guards = transformedClients.map((client) => client.totalGuards);
        const sites = transformedClients.map((client) => client.totalSites);

        const minGuards = Math.min(...guards);
        const maxGuards = Math.max(...guards);
        const minSites = Math.min(...sites);
        const maxSites = Math.max(...sites);

        setGuardCountRange([minGuards, maxGuards]);
        setSitesCountRange([minSites, maxSites]);
      }
    }
  }, [clientsResponse]);

  useEffect(() => {
    applyFilters();
  }, [showFavouritesOnly, guardCountRange, sitesCountRange, clientRows]);

  useEffect(() => {
    setCurrentPage(0);
  }, [pageSize, filteredRows]);

  const applyFilters = () => {
    let result = [...clientRows];

    if (showFavouritesOnly) {
      result = result.filter((row) => row.favourite);
    }

    result = result.filter((row) => row.totalGuards >= guardCountRange[0] && row.totalGuards <= guardCountRange[1]);

    result = result.filter((row) => row.totalSites >= sitesCountRange[0] && row.totalSites <= sitesCountRange[1]);

    setFilteredRows(result);
  };

  const [dayMenuAnchor, setDayMenuAnchor] = useState<null | HTMLElement>(null);
  const [monthMenuAnchor, setMonthMenuAnchor] = useState<null | HTMLElement>(null);

  const handleDayMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDayMenuAnchor(event.currentTarget);
  };
  const handleMonthMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMonthMenuAnchor(event.currentTarget);
  };
  const handleDayMenuClose = () => setDayMenuAnchor(null);
  const handleMonthMenuClose = () => setMonthMenuAnchor(null);

  const handleDateSelect = (date: Date, view: ViewType) => {
    setCurrentDate(date);
    setSelectedView(view);
    setDayMenuAnchor(null);
    setMonthMenuAnchor(null);
  };

  const generateDateOptions = (type: "day" | "month") => {
    const options = [];
    const today = new Date();
    if (type === "day") {
      const todayFormatted = formatDate(today);
      options.push({
        date: new Date(today),
        label: `${todayFormatted.dayName} ${todayFormatted.day}/${todayFormatted.month}/${todayFormatted.year}`,
      });
      for (let i = 1; i <= 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formatted = formatDate(date);
        options.push({
          date,
          label: `${formatted.dayName} ${formatted.day}/${formatted.month}/${formatted.year}`,
        });
      }
    } else if (type === "month") {
      const currentFormatted = formatDate(today);
      options.push({
        date: new Date(today),
        label: `${currentFormatted.monthName} ${currentFormatted.year}`,
      });
      for (let i = 1; i <= 12; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        const formatted = formatDate(date);
        options.push({
          date,
          label: `${formatted.monthName} ${formatted.year}`,
        });
      }
    }
    return options;
  };

  if (
    isLoading ||
    isDashboardLoading ||
    isLateUniformLoading ||
    isShiftPerformanceLoading ||
    isAreaOfficersLoading ||
    isAreaOfficerTasksLoading ||
    isIncidentReportsLoading ||
    isLivelinessAlertsLoading ||
    isAttendanceOverviewLoading
  ) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (
    error ||
    dashboardError ||
    lateUniformError ||
    shiftPerformanceError ||
    areaOfficersError ||
    areaOfficerTasksError ||
    incidentReportsError ||
    livelinessAlertsError ||
    attendanceOverviewError
  ) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">
          Error loading dashboard:{" "}
          {error?.message ||
            dashboardError?.message ||
            lateUniformError?.message ||
            shiftPerformanceError?.message ||
            areaOfficersError?.message ||
            areaOfficerTasksError?.message ||
            incidentReportsError?.message ||
            livelinessAlertsError?.message ||
            attendanceOverviewError?.message}
        </Typography>
      </Box>
    );
  }

  return (
    <div>
      <div className="flex flex-row justify-between mb-4">
        <div className="flex flex-row items-center text-xl gap-2 font-semibold">
          <h2 className="">
            {selectedView === "live"
              ? "LIVE: 24 HOURS DASHBOARD"
              : selectedView === "day"
                ? `DAY DASHBOARD: ${todayString}`
                : `MONTH DASHBOARD: ${monthString}`}
          </h2>
        </div>
        <div className="flex flex-row gap-4">
          <Button
            variant="outlined"
            size="small"
            sx={getButtonStyles("live", selectedView === "live")}
            onClick={() => handleViewChange("live")}
          >
            <AccessTimeIcon sx={{ mr: 1 }} />
            LIVE 24 HOURS
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={getButtonStyles("day", selectedView === "day")}
            onClick={handleDayMenuOpen}
            endIcon={<KeyboardArrowDownIcon />}
          >
            <EventOutlinedIcon sx={{ mr: 1 }} />
            {selectedView === "day" ? `DAY | ${todayString}` : "DAY"}
          </Button>
          <Menu anchorEl={dayMenuAnchor} open={Boolean(dayMenuAnchor)} onClose={handleDayMenuClose}>
            {generateDateOptions("day").map((option, index) => (
              <MenuItem key={index} onClick={() => handleDateSelect(option.date, "day")}>
                {option.label}
              </MenuItem>
            ))}
          </Menu>
          <Button
            variant="outlined"
            size="small"
            sx={getButtonStyles("month", selectedView === "month")}
            onClick={handleMonthMenuOpen}
            endIcon={<KeyboardArrowDownIcon />}
          >
            <CalendarViewMonthOutlinedIcon sx={{ mr: 1 }} />
            {selectedView === "month" ? `MONTH | ${monthString}` : "MONTH"}
          </Button>
          <Menu anchorEl={monthMenuAnchor} open={Boolean(monthMenuAnchor)} onClose={handleMonthMenuClose}>
            {generateDateOptions("month").map((option, index) => (
              <MenuItem key={index} onClick={() => handleDateSelect(option.date, "month")}>
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>
      <div className="flex flex-row gap-4 bg-[#F7F7F7] p-4 rounded-lg">
        <div className="flex flex-col gap-2 w-[300px] flex-shrink-0">
          <Button
            variant="contained"
            size="small"
            sx={{
              ...getButtonStyles("live", selectedTableView === "overview"),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              "& .MuiSvgIcon-root": {
                color: "white !important",
              },
            }}
            onClick={() => handleTableViewChange("overview")}
          >
            Overview
            <RemoveRedEyeOutlinedIcon sx={{ ml: 1 }} />
          </Button>

          <Button
            variant="contained"
            size="small"
            sx={getButtonStyles("live", selectedTableView === "liveiness")}
            onClick={() => handleTableViewChange("liveiness")}
          >
            LIVELINESS TEST ALERTS
          </Button>
          <div
            onClick={() => handleTableViewChange("attendance")}
            className="p-2 rounded-lg flex flex-col gap-2 items-center cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: selectedTableView === "attendance" ? "#2A77D5" : "white",
              color: selectedTableView === "attendance" ? "white" : "black",
            }}
          >
            <span className="text-xs">ATTENDANCE</span>
            <div
              className="flex flex-row items-center rounded-lg w-full justify-around"
              style={{
                backgroundColor: selectedTableView === "attendance" ? "rgba(255,255,255,0.2)" : "#F1F7FE",
              }}
            >
              <div className="flex flex-col items-center p-2">
                <span>{attendanceTotals.totalAbsent}</span>
                <Person2OutlinedIcon
                  sx={{
                    color: selectedTableView === "attendance" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "attendance" ? "white" : "#2A77D5",
                  }}
                >
                  ABSENT
                </span>
              </div>
              -
              <div className="flex flex-col items-center p-2">
                <span>{attendanceTotals.totalReplaced}</span>
                <SwapHorizOutlinedIcon
                  sx={{
                    color: selectedTableView === "attendance" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "attendance" ? "white" : "#2A77D5",
                  }}
                >
                  REPLACED
                </span>
              </div>
              =
              <div className="flex flex-col items-center p-2">
                <span>{attendanceTotals.totalToReplace}</span>
                <WarningAmberOutlinedIcon
                  sx={{
                    color: selectedTableView === "attendance" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "attendance" ? "white" : "#2A77D5",
                  }}
                >
                  TO REPLACE
                </span>
              </div>
            </div>
          </div>
          <div
            onClick={() => handleTableViewChange("guards")}
            className="p-2 rounded-lg flex flex-col gap-2 items-center cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: selectedTableView === "guards" ? "#2A77D5" : "white",
              color: selectedTableView === "guards" ? "white" : "black",
            }}
          >
            <span className="text-xs">GUARDS</span>
            <div
              className="flex flex-row items-center rounded-lg w-full justify-around"
              style={{
                backgroundColor: selectedTableView === "guards" ? "rgba(255,255,255,0.2)" : "#F1F7FE",
              }}
            >
              <div className="flex flex-col items-center p-2">
                <span>{guardTotals.late}</span>
                <QueryBuilderOutlinedIcon
                  sx={{
                    color: selectedTableView === "guards" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "guards" ? "white" : "#2A77D5",
                  }}
                >
                  LATE
                </span>
              </div>
              <Divider
                orientation="vertical"
                sx={{
                  borderColor: selectedTableView === "guards" ? "rgba(255,255,255,0.3)" : "#C2DBFA",
                }}
              />
              <div className="flex flex-col items-center p-2">
                <span>{guardTotals.uniform}</span>
                <Shirt
                  className="text-[20px]"
                  style={{
                    color: selectedTableView === "guards" ? "white" : "#2A77D5",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "guards" ? "white" : "#2A77D5",
                  }}
                >
                  UNIFORM
                </span>
              </div>
            </div>
          </div>
          <div
            onClick={() => handleTableViewChange("shifts")}
            className="p-2 rounded-lg flex flex-col gap-2 items-center cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: selectedTableView === "shifts" ? "#2A77D5" : "white",
              color: selectedTableView === "shifts" ? "white" : "black",
            }}
          >
            <span className="text-xs">SHIFTS WITH PERFORMANCE ISSUES</span>
            <div
              className="flex flex-row items-center rounded-lg w-full justify-around"
              style={{
                backgroundColor: selectedTableView === "shifts" ? "rgba(255,255,255,0.2)" : "#F1F7FE",
              }}
            >
              <div className="flex flex-col items-center p-2">
                <span>{shiftPerformanceSummary.totalAlertnessCount ?? 0}</span>
                <img src="/client_icons/alertness.svg" alt="Alertness" className="w-6 h-6" />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "shifts" ? "white" : "#2A77D5",
                  }}
                >
                  ALERTNESS
                </span>
              </div>
              <Divider
                orientation="vertical"
                sx={{
                  borderColor: selectedTableView === "shifts" ? "rgba(255,255,255,0.3)" : "#C2DBFA",
                }}
              />
              <div className="flex flex-col items-center p-2">
                <span>{shiftPerformanceSummary.totalGeofenceCount ?? 0}</span>
                <MapsHomeWorkOutlinedIcon
                  sx={{
                    color: selectedTableView === "shifts" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "shifts" ? "white" : "#2A77D5",
                  }}
                >
                  GEOFENCE
                </span>
              </div>
              <Divider
                orientation="vertical"
                sx={{
                  borderColor: selectedTableView === "shifts" ? "rgba(255,255,255,0.3)" : "#C2DBFA",
                }}
              />
              <div className="flex flex-col items-center p-2">
                <span>{shiftPerformanceSummary.totalPatrolCount ?? 0}</span>
                <DirectionsRunOutlinedIcon
                  sx={{
                    color: selectedTableView === "shifts" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "shifts" ? "white" : "#2A77D5",
                  }}
                >
                  PATROL
                </span>
              </div>
            </div>
          </div>
          <div
            onClick={() => handleTableViewChange("area-officers")}
            className="p-2 rounded-lg flex flex-col gap-2 items-center cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: selectedTableView === "area-officers" ? "#2A77D5" : "white",
              color: selectedTableView === "area-officers" ? "white" : "black",
            }}
          >
            <span className="text-xs">AREA OFFICERS</span>
            <div
              className="flex flex-row items-center rounded-lg w-full justify-around"
              style={{
                backgroundColor: selectedTableView === "area-officers" ? "rgba(255,255,255,0.2)" : "#F1F7FE",
              }}
            >
              <div className="flex flex-col items-center p-2">
                <span>{areaOfficerSummary.absent.toString().padStart(2, "0")}</span>
                <Person2OutlinedIcon
                  sx={{
                    color: selectedTableView === "area-officers" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "area-officers" ? "white" : "#2A77D5",
                  }}
                >
                  ABSENT
                </span>
              </div>
              <Divider
                orientation="vertical"
                sx={{
                  borderColor: selectedTableView === "area-officers" ? "rgba(255,255,255,0.3)" : "#C2DBFA",
                }}
              />
              <div className="flex flex-col items-center p-2">
                <span>{areaOfficerSummary.late.toString().padStart(2, "0")}</span>
                <QueryBuilderOutlinedIcon
                  sx={{
                    color: selectedTableView === "area-officers" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "area-officers" ? "white" : "#2A77D5",
                  }}
                >
                  LATE
                </span>
              </div>
              <Divider
                orientation="vertical"
                sx={{
                  borderColor: selectedTableView === "area-officers" ? "rgba(255,255,255,0.3)" : "#C2DBFA",
                }}
              />
              <div className="flex flex-col items-center p-2">
                <span>{areaOfficerSummary.uniform.toString().padStart(2, "0")}</span>
                <Shirt
                  className="text-[20px]"
                  style={{
                    color: selectedTableView === "area-officers" ? "white" : "#2A77D5",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "area-officers" ? "white" : "#2A77D5",
                  }}
                >
                  UNIFORM
                </span>
              </div>
            </div>
          </div>
          <div
            onClick={() => handleTableViewChange("incidents")}
            className="p-2 rounded-lg flex flex-col gap-2 items-center cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: selectedTableView === "incidents" ? "#2A77D5" : "white",
              color: selectedTableView === "incidents" ? "white" : "black",
            }}
          >
            <span className="text-xs">INCIDENT REPORTS</span>
            <div
              className="flex flex-row items-center rounded-lg w-full justify-around"
              style={{
                backgroundColor: selectedTableView === "incidents" ? "rgba(255,255,255,0.2)" : "#F1F7FE",
              }}
            >
              <div className="flex flex-col items-center p-2">
                <span>{incidentReportSummary.openIncidents}</span>
                <HistoryToggleOffIcon
                  sx={{
                    color: selectedTableView === "incidents" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "incidents" ? "white" : "#2A77D5",
                  }}
                >
                  OPEN
                </span>
              </div>
              <Divider
                orientation="vertical"
                sx={{
                  borderColor: selectedTableView === "incidents" ? "rgba(255,255,255,0.3)" : "#C2DBFA",
                }}
              />
              <div className="flex flex-col items-center p-2">
                <span>{incidentReportSummary.closedIncidents}</span>
                <TaskAltOutlinedIcon
                  sx={{
                    color: selectedTableView === "incidents" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "incidents" ? "white" : "#2A77D5",
                  }}
                >
                  CLOSED
                </span>
              </div>
            </div>
          </div>
          <div
            onClick={() => handleTableViewChange("area-officers-tasks")}
            className="p-2 rounded-lg flex flex-col gap-2 items-center cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: selectedTableView === "area-officers-tasks" ? "#2A77D5" : "white",
              color: selectedTableView === "area-officers-tasks" ? "white" : "black",
            }}
          >
            <span className="text-xs">AREA OFFICERS : TASKS</span>
            <div
              className="flex flex-row items-center rounded-lg w-full justify-around"
              style={{
                backgroundColor: selectedTableView === "area-officers-tasks" ? "rgba(255,255,255,0.2)" : "#F1F7FE",
              }}
            >
              <div className="flex flex-col items-center p-2">
                <span>{areaOfficerTasksSummary.overdueTasks ?? 0}</span>
                <WarningAmberOutlinedIcon
                  sx={{
                    color: selectedTableView === "area-officers-tasks" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "area-officers-tasks" ? "white" : "#2A77D5",
                  }}
                >
                  OVERDUE
                </span>
              </div>
              <Divider
                orientation="vertical"
                sx={{
                  borderColor: selectedTableView === "area-officers-tasks" ? "rgba(255,255,255,0.3)" : "#C2DBFA",
                }}
              />
              <div className="flex flex-col items-center p-2">
                <span>{areaOfficerTasksSummary.pendingTasks + areaOfficerTasksSummary.inProgressTasks || 0}</span>
                <HistoryToggleOffIcon
                  sx={{
                    color: selectedTableView === "area-officers-tasks" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "area-officers-tasks" ? "white" : "#2A77D5",
                  }}
                >
                  PENDING
                </span>
              </div>
              <Divider
                orientation="vertical"
                sx={{
                  borderColor: selectedTableView === "area-officers-tasks" ? "rgba(255,255,255,0.3)" : "#C2DBFA",
                }}
              />
              <div className="flex flex-col items-center p-2">
                <span>{areaOfficerTasksSummary.completedTasks ?? 0}</span>
                <TaskAltOutlinedIcon
                  sx={{
                    color: selectedTableView === "area-officers-tasks" ? "white" : "#2A77D5",
                    fontSize: "20px",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: selectedTableView === "area-officers-tasks" ? "white" : "#2A77D5",
                  }}
                >
                  DONE
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 min-h-[600px]">
          <DashboardTableView
            selectedTableView={selectedTableView}
            selectedColumn={selectedColumn}
            onColumnClick={handleColumnClick}
            pageSize={pageSize}
            opAgencyId={opAgencyId}
            startDate={startDate}
            endDate={endDate}
            areaOfficerTasksData={areaOfficerTasksData}
            isAreaOfficerTasksLoading={isAreaOfficerTasksLoading}
            areaOfficerTasksError={areaOfficerTasksError}
            selectedViewType={selectedView}
          />
        </div>
      </div>
    </div>
  );
}
