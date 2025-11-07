import { datagridStyle } from "@modules/clients/lib/datagridStyle";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Button, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ShirtIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTasksByClientId } from "../../apis/hooks/useClientTasks";
import {
  useGetAlertnessDefaults,
  useGetAttendanceCount,
  useGetGeofenceActivity,
  useGetLateCount,
  useGetUniformDefaults,
} from "../../apis/hooks/useGetClientGuardDefaults";
import { formatDateStartForBackend, formatDateEndForBackend } from "../../utils/dateFormatUtils";
import { useClientIncidentReport } from "../../apis/hooks/useIncidentReport";
import type { Task } from "../../apis/services/tasks";
import { useAuth } from "../../../../hooks/useAuth";
import {
  AbsentTableColumns,
  AlertnessTableColumns,
  GeofenceTableColumns,
  LateTableColumns,
  PatrolTableColumns,
  UniformTableColumns,
} from "../../columns/ClientPerformanceColumns";

type GuardItems = any;

export default function Performance() {
  const { user } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState<string>("absent");
  const [selectedGuard, setSelectedGuard] = useState<GuardItems | null>(null);
  const [activeTab, setActiveTab] = useState<"overdue" | "pending" | "done">("pending");
  const [activeIncidentTab, setActiveIncidentTab] = useState<"open" | "closed">("open");
  const { clientId, siteId } = useParams();

  // Get today's date range for API calls
  const dateRange = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    endDate.setHours(23, 59, 59, 999);
    return {
      startDate: formatDateStartForBackend(startDate),
      endDate: formatDateEndForBackend(endDate),
    };
  }, []);

  // Fetch performance data for the site
  const { data: attendanceData, isLoading: isLoadingAbsent } = useGetAttendanceCount(
    clientId || "",
    dateRange.startDate,
    dateRange.endDate
  );
  const { data: lateData, isLoading: isLoadingLate } = useGetLateCount(
    clientId || "",
    dateRange.startDate,
    dateRange.endDate
  );
  const { data: uniformData, isLoading: isLoadingUniform } = useGetUniformDefaults(
    clientId || "",
    dateRange.startDate,
    dateRange.endDate
  );
  const { data: alertnessData, isLoading: isLoadingAlertness } = useGetAlertnessDefaults(
    clientId || "",
    dateRange.startDate,
    dateRange.endDate
  );
  const { data: geofenceData, isLoading: isLoadingGeofence } = useGetGeofenceActivity(
    clientId || "",
    dateRange.startDate,
    dateRange.endDate
  );

  // Fetch tasks using the API
  const { data: tasksResponse, isLoading: isLoadingTasks } = useGetTasksByClientId(
    user?.agencyId || "",
    clientId || "",
    siteId // Pass siteId to filter tasks for this specific site
  );

  // Fetch incident reports using the API
  const { data: incidentResponse, isLoading: isLoadingIncidents } = useClientIncidentReport({
    clientId: clientId || "",
  });

  const navigate = useNavigate();

  const isLoading = isLoadingAbsent || isLoadingLate || isLoadingUniform || isLoadingAlertness || isLoadingGeofence;

  // Move useEffect before any conditional returns
  useEffect(() => {
    console.log("Selected Guard:", selectedGuard);
    console.log("Selected Metric:", selectedMetric);
  }, [selectedGuard, selectedMetric]);

  // Calculate metrics for the specific site
  const metrics = useMemo(() => {
    const siteAbsent =
      attendanceData?.data?.siteBreakdown?.find((site: any) => site.siteId === siteId)?.uniqueAbsentGuards || 0;

    const siteLateIncidents =
      lateData?.data?.lateGuardsByDate
        ?.filter((dayData: any) => dayData.siteId === siteId)
        ?.reduce((total: number, dayData: any) => total + dayData.guardCount, 0) || 0;

    const siteUniformDefaults =
      uniformData?.data?.sitesWithDefaults
        ?.filter((site: any) => site.siteId === siteId)
        ?.reduce((total: number, site: any) => total + site.totalDefaults, 0) || 0;

    const siteAlertnessDefaults =
      alertnessData?.data?.sitesWithDefaults
        ?.filter((site: any) => site.siteId === siteId)
        ?.reduce((total: number, site: any) => total + site.totalDefaults, 0) || 0;

    const siteGeofenceGuards =
      geofenceData?.data?.sitesWithGeofenceActivity?.filter((activity: any) => activity.siteId === siteId)?.length || 0;

    const sitePatrolSessions =
      geofenceData?.data?.sitesWithGeofenceActivity
        ?.filter((activity: any) => activity.siteId === siteId)
        ?.reduce((total: number, activity: any) => total + activity.sessionCount, 0) || 0;

    return {
      absent: siteAbsent,
      late: siteLateIncidents,
      uniform: siteUniformDefaults,
      alertness: siteAlertnessDefaults,
      geofence: siteGeofenceGuards,
      patrol: sitePatrolSessions,
    };
  }, [attendanceData, lateData, uniformData, alertnessData, geofenceData, siteId]);

  // Process tasks data similar to AreaOfficerTasks.tsx
  const tasks = tasksResponse?.data?.tasks || [];

  const transformedTasks = useMemo(() => {
    const now = new Date();

    return tasks
      .filter((task: Task) => task.siteId === siteId) // Filter tasks for this specific site
      .map((task: Task) => {
        const deadline = new Date(task.deadline);
        const createdAt = new Date(task.createdAt);

        const isOverdue = deadline < now && task.taskStatus !== "COMPLETED";

        return {
          id: task.id.slice(-6),
          siteId: task.siteId.slice(-6),
          clientName: task.client.clientName,
          siteName: task.site.siteName,
          areaOfficerId: task.areaOfficerId,
          time: createdAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          date: createdAt.toLocaleDateString("en-GB"),
          deadline: deadline.toLocaleDateString("en-GB"),
          deadlineTime: deadline.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          taskStatus: task.taskStatus,
          isOverdue,
          originalId: task.id,
        };
      });
  }, [tasks, siteId]);

  // Filter tasks by current active tab
  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case "overdue":
        return transformedTasks.filter((task) => task.isOverdue);
      case "pending":
        return transformedTasks.filter(
          (task) => (task.taskStatus === "PENDING" || task.taskStatus === "INPROGRESS") && !task.isOverdue
        );
      case "done":
        return transformedTasks.filter((task) => task.taskStatus === "COMPLETED");
      default:
        return transformedTasks;
    }
  }, [transformedTasks, activeTab]);

  // Calculate task counts for each tab
  const taskCounts = useMemo(() => {
    const overdue = transformedTasks.filter((task) => task.isOverdue).length;
    const pending = transformedTasks.filter(
      (task) => (task.taskStatus === "PENDING" || task.taskStatus === "INPROGRESS") && !task.isOverdue
    ).length;
    const done = transformedTasks.filter((task) => task.taskStatus === "COMPLETED").length;

    return { overdue, pending, done };
  }, [transformedTasks]);

  // Process incident data similar to IncidentReports.tsx
  const allIncidentData = incidentResponse?.data || [];

  const incidentData = useMemo(() => {
    return allIncidentData
      .filter((incident: any) => incident.site?.id === siteId) // Filter incidents for this specific site
      .filter((incident: any) =>
        activeIncidentTab === "open" ? incident.status === "OPEN" : incident.status === "CLOSED"
      );
  }, [allIncidentData, activeIncidentTab, siteId]);

  // Calculate incident counts
  const incidentCounts = useMemo(() => {
    const siteIncidents = allIncidentData.filter((incident: any) => incident.site?.id === siteId);
    const open = siteIncidents.filter((incident: any) => incident.status === "OPEN").length;
    const closed = siteIncidents.filter((incident: any) => incident.status === "CLOSED").length;

    return { open, closed };
  }, [allIncidentData, siteId]);

  const handleTaskRowClick = () => {
    navigate(`/clients/${clientId}/performance/area-officers-tasks/${siteId}`);
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("en-GB"),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
    setSelectedGuard(null);
  };

  const getMetricButtonStyles = (metric: string) => ({
    display: "flex",
    flexDirection: "column",
    gap: 0,
    bgcolor: selectedMetric === metric ? "#2A77D5" : "#ffffff",
    color: selectedMetric === metric ? "white" : "#2A77D5",
    border: selectedMetric === metric ? "2px solid #2A77D5" : "2px solid #e0e0e0",
    "&:hover": {
      bgcolor: selectedMetric === metric ? "#1E5A96" : "#E3F2FD",
      border: "2px solid #2A77D5",
    },
    "& .MuiSvgIcon-root": {
      color: selectedMetric === metric ? "white" : "#2A77D5",
    },
    "& .lucide": {
      color: selectedMetric === metric ? "white" : "#2A77D5",
    },
  });

  const SiteDataGrid = ({ selectedMetric }: { selectedMetric: string }) => {
    const getTableData = () => {
      switch (selectedMetric) {
        case "absent": {
          // Filter absent data for this specific site
          const siteAbsentData =
            attendanceData?.data?.siteBreakdown
              ?.filter((site: any) => site.siteId === siteId && site.absentCount > 0)
              ?.map((site: any, index: number) => ({
                id: index,
                siteId: site.siteId,
                siteName: site.siteName,
                absent: site.absentCount,
                replaced: 0,
                toReplace: site.absentCount,
              })) || [];

          return {
            rows: siteAbsentData,
            columns: AbsentTableColumns,
            isLoading: isLoadingAbsent,
          };
        }
        case "late": {
          // Filter late data for this specific site
          const siteLateData =
            lateData?.data?.lateGuardsByDate
              ?.filter((dayData: any) => dayData.siteId === siteId && dayData.guardCount > 0)
              ?.reduce((acc: any[], dayData: any) => {
                const existing = acc.find((item) => item.siteId === dayData.siteId);
                if (existing) {
                  existing.totalIncidents += dayData.guardCount;
                  existing.totalLateMinutes += dayData.guards.reduce(
                    (sum: any, guard: any) => sum + guard.lateMinutes,
                    0
                  );
                  dayData.guards.forEach((guard: any) => existing.uniqueGuards.add(guard.guardId));
                } else {
                  const uniqueGuards = new Set<any>();
                  dayData.guards.forEach((guard: any) => uniqueGuards.add(guard.guardId));
                  acc.push({
                    id: acc.length,
                    siteId: dayData.siteId,
                    siteName: dayData.siteName,
                    guardCount: uniqueGuards.size,
                    totalIncidents: dayData.guardCount,
                    avgLateMinutes: Math.round(
                      dayData.guards.reduce((sum: any, guard: any) => sum + guard.lateMinutes, 0) / dayData.guardCount
                    ),
                    uniqueGuards,
                  });
                }
                return acc;
              }, []) || [];

          return {
            rows: siteLateData,
            columns: LateTableColumns,
            isLoading: isLoadingLate,
          };
        }
        case "uniform": {
          // Filter uniform data for this specific site
          const siteUniformData =
            uniformData?.data?.sitesWithDefaults
              ?.filter((site: any) => site.siteId === siteId && site.totalDefaults > 0)
              ?.map((site: any, index: number) => {
                const uniqueGuards = new Set();
                site.defaultsByDate?.forEach((dayData: any) => {
                  dayData.guards?.forEach((guard: any) => {
                    uniqueGuards.add(guard.guardId);
                  });
                });

                return {
                  id: index,
                  siteId: site.siteId,
                  siteName: site.siteName,
                  guardCount: uniqueGuards.size,
                  totalChecks: site.totalChecks,
                  totalDefaults: site.totalDefaults,
                  defaultRate: ((site.totalDefaults / site.totalChecks) * 100).toFixed(1) + "%",
                };
              }) || [];

          return {
            rows: siteUniformData,
            columns: UniformTableColumns,
            isLoading: isLoadingUniform,
          };
        }
        case "alertness": {
          // Filter alertness data for this specific site
          const siteAlertnessData =
            alertnessData?.data?.sitesWithDefaults
              ?.filter((site: any) => site.siteId === siteId && site.totalDefaults > 0)
              ?.map((site: any, index: number) => {
                const uniqueGuards = new Set();
                site.defaultsByDate?.forEach((dayData: any) => {
                  dayData.guards?.forEach((guard: any) => {
                    uniqueGuards.add(guard.guardId);
                  });
                });

                return {
                  id: index,
                  siteId: site.siteId,
                  siteName: site.siteName,
                  guardCount: uniqueGuards.size,
                  totalChecks: site.totalChecks,
                  totalDefaults: site.totalDefaults,
                  defaultRate: ((site.totalDefaults / site.totalChecks) * 100).toFixed(1) + "%",
                };
              }) || [];

          return {
            rows: siteAlertnessData,
            columns: AlertnessTableColumns,
            isLoading: isLoadingAlertness,
          };
        }
        case "geofence": {
          // Filter geofence data for this specific site
          const siteGeofenceData =
            geofenceData?.data?.sitesWithGeofenceActivity
              ?.filter((siteActivity: any) => siteActivity.siteId === siteId && siteActivity.sessionCount > 0)
              ?.map((siteActivity: any, index: number) => ({
                id: index,
                siteId: siteActivity.siteId,
                siteName: siteActivity.siteName,
                guardCount: siteActivity.guards.length,
                totalSessions: siteActivity.sessionCount,
                avgDuration: Math.round(
                  siteActivity.guards.reduce((sum: any, guard: any) => {
                    return (
                      sum +
                      guard.sessions.reduce((sessionSum: any, session: any) => {
                        const duration = parseInt(session.duration.replace(" Min", "")) || 0;
                        return sessionSum + duration;
                      }, 0)
                    );
                  }, 0) / siteActivity.sessionCount
                ),
              })) || [];

          return {
            rows: siteGeofenceData,
            columns: GeofenceTableColumns,
            isLoading: isLoadingGeofence,
          };
        }
        case "patrol": {
          // Filter patrol data for this specific site (same as geofence data)
          const sitePatrolData =
            geofenceData?.data?.sitesWithGeofenceActivity
              ?.filter((siteActivity: any) => siteActivity.siteId === siteId && siteActivity.sessionCount > 0)
              ?.map((siteActivity: any, index: number) => ({
                id: index,
                siteId: siteActivity.siteId,
                siteName: siteActivity.siteName,
                guardCount: siteActivity.guards.length,
                totalPatrols: siteActivity.sessionCount,
                avgPatrolsPerGuard: Math.round(siteActivity.sessionCount / siteActivity.guards.length),
              })) || [];

          return {
            rows: sitePatrolData,
            columns: PatrolTableColumns,
            isLoading: isLoadingGeofence,
          };
        }
        default:
          return {
            rows: [],
            columns: [],
            isLoading: false,
          };
      }
    };

    const { rows, columns, isLoading: tableLoading } = getTableData();

    if (tableLoading) {
      return (
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            minHeight: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!rows || rows.length === 0) {
      return (
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            minHeight: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="text-center text-gray-500">
            <p>No {selectedMetric} data found for this site</p>
          </div>
        </Box>
      );
    }

    return (
      <Box sx={{ width: "100%", flexGrow: 1, minHeight: 0, overflow: "hidden" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooter={true}
          disableColumnMenu
          disableRowSelectionOnClick
          sx={datagridStyle}
        />
      </Box>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 w-full h-full flex flex-col items-center justify-center">
        <CircularProgress />
        <p className="mt-2 text-gray-600">Loading site performance data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-2">
      <div className="flex flex-row gap-2 mt-2">
        <div className="bg-white p-3 w-fit rounded-lg">
          <div className="flex flex-col gap-3 items-center">
            <span className="uppercase text-base">GUARDS : {selectedMetric}</span>

            <div className="flex flex-row gap-2 my-1">
              <Button
                variant="contained"
                sx={{
                  ...getMetricButtonStyles("absent"),
                  minWidth: "60px",
                  height: "60px",
                  fontSize: "12px",
                }}
                onClick={() => handleMetricChange("absent")}
              >
                <PersonOffOutlinedIcon sx={{ fontSize: "16px", mb: 0.5 }} />
                {metrics.absent.toString().padStart(2, "0")}
              </Button>

              <Button
                variant="contained"
                sx={{
                  ...getMetricButtonStyles("late"),
                  minWidth: "60px",
                  height: "60px",
                  fontSize: "12px",
                }}
                onClick={() => handleMetricChange("late")}
              >
                <AccessTimeOutlinedIcon sx={{ fontSize: "16px", mb: 0.5 }} />
                {metrics.late.toString().padStart(2, "0")}
              </Button>

              <Button
                variant="contained"
                sx={{
                  ...getMetricButtonStyles("uniform"),
                  minWidth: "60px",
                  height: "60px",
                  fontSize: "12px",
                }}
                onClick={() => handleMetricChange("uniform")}
              >
                <ShirtIcon
                  className={`w-4 h-4 mb-1 ${selectedMetric === "uniform" ? "text-white" : "text-blue-600"}`}
                />
                {metrics.uniform.toString().padStart(2, "0")}
              </Button>

              <Button
                variant="contained"
                sx={{
                  ...getMetricButtonStyles("alertness"),
                  minWidth: "60px",
                  height: "60px",
                  fontSize: "12px",
                }}
                onClick={() => handleMetricChange("alertness")}
              >
                <img
                  src="/client_icons/alertness.svg"
                  alt="Alertness Icon"
                  className="w-4 h-4 mb-1"
                  style={{
                    filter: selectedMetric === "alertness" ? "brightness(0) invert(1)" : "",
                  }}
                />
                {metrics.alertness.toString().padStart(2, "0")}
              </Button>

              <Button
                variant="contained"
                sx={{
                  ...getMetricButtonStyles("geofence"),
                  minWidth: "60px",
                  height: "60px",
                  fontSize: "12px",
                }}
                onClick={() => handleMetricChange("geofence")}
              >
                <HomeWorkOutlinedIcon sx={{ fontSize: "16px", mb: 0.5 }} />
                {metrics.geofence.toString().padStart(2, "0")}
              </Button>

              <Button
                variant="contained"
                sx={{
                  ...getMetricButtonStyles("patrol"),
                  minWidth: "60px",
                  height: "60px",
                  fontSize: "12px",
                }}
                onClick={() => handleMetricChange("patrol")}
              >
                <DirectionsRunOutlinedIcon sx={{ fontSize: "16px", mb: 0.5 }} />
                {metrics.patrol.toString().padStart(2, "0")}
              </Button>
            </div>
          </div>

          <SiteDataGrid selectedMetric={selectedMetric} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="bg-white flex flex-col p-3 rounded-lg items-center gap-3">
            <h2 className="font-semibold text-sm">TASKS</h2>
            <div className="flex gap-1 mb-4 bg-[#F7F7F7] p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("overdue")}
                className={`flex flex-row items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors w-[6vw] uppercase text-xs h-fit justify-center ${
                  activeTab === "overdue" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                <ReportProblemOutlinedIcon sx={{ fontSize: "14px" }} />
                overdue ({taskCounts.overdue.toString().padStart(2, "0")})
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex flex-row items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors w-[6vw] uppercase text-xs h-fit justify-center ${
                  activeTab === "pending" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                <CheckCircleIcon sx={{ fontSize: "14px" }} />
                pending ({taskCounts.pending.toString().padStart(2, "0")})
              </button>
              <button
                onClick={() => setActiveTab("done")}
                className={`flex flex-row items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors w-[6vw] uppercase text-xs h-fit justify-center ${
                  activeTab === "done" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                <CheckCircleIcon sx={{ fontSize: "14px" }} />
                done ({taskCounts.done.toString().padStart(2, "0")})
              </button>
            </div>
            <div className="overflow-hidden whitespace-nowrap text-left w-[18vw]">
              <div className="grid grid-cols-2 gap-2 px-2 py-1">
                <div className="text-gray-600 font-medium text-xs">DUE ON</div>
                <div className="text-gray-600 font-medium text-xs">ASSIGNED BY</div>
              </div>
              <div className="flex flex-col gap-1">
                {isLoadingTasks ? (
                  <div className="text-center py-4">
                    <CircularProgress size={20} />
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-xs">No {activeTab} tasks found</div>
                ) : (
                  filteredTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.originalId}
                      className={`bg-white border rounded-lg shadow-sm cursor-pointer transition-colors hover:bg-gray-50 ${
                        task.isOverdue ? "border-red-300 bg-red-50" : "border-gray-200"
                      }`}
                      onClick={() => handleTaskRowClick()}
                    >
                      <div className="grid grid-cols-2 gap-2 px-2 py-1 bg-white items-center">
                        <div
                          className={`font-medium inline-flex gap-1 text-xs ${task.isOverdue ? "text-red-800" : "text-gray-800"}`}
                        >
                          <div>{task.deadline}</div>
                          <span className="text-gray-200">|</span>
                          <div className={task.isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}>
                            {task.deadlineTime}
                          </div>
                        </div>
                        <div className={`font-medium text-xs ${task.isOverdue ? "text-red-800" : "text-gray-800"}`}>
                          {" "}
                          {task.areaOfficerId}{" "}
                        </div>
                      </div>
                      <div className="bg-blue-50 px-4 py-1 border-t border-gray-200">
                        <div className="flex justify-center gap-2">
                          <button className="">
                            <LocalFireDepartmentOutlinedIcon sx={{ color: "#2A77D5", fontSize: "16px" }} />
                          </button>
                          <button className="">
                            <HomeOutlinedIcon sx={{ color: "#2A77D5", fontSize: "16px" }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="bg-white flex flex-col p-3 rounded-lg items-center gap-3 w-full">
            <h2 className="font-semibold text-sm">INCIDENT REPORTS</h2>
            <div className="flex gap-1 mb-4 bg-[#F7F7F7] p-1 rounded-lg">
              <button
                onClick={() => setActiveIncidentTab("open")}
                className={`flex flex-row items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors w-[6vw] uppercase text-xs h-fit justify-center ${
                  activeIncidentTab === "open"
                    ? "bg-[#2A77D5] text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                <CheckCircleOutlineIcon sx={{ fontSize: "14px" }} />
                open ({incidentCounts.open.toString().padStart(2, "0")})
              </button>
              <button
                onClick={() => setActiveIncidentTab("closed")}
                className={`flex flex-row items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors w-[6vw] uppercase text-xs h-fit justify-center ${
                  activeIncidentTab === "closed"
                    ? "bg-[#2A77D5] text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                <CheckCircleIcon sx={{ fontSize: "14px" }} />
                closed ({incidentCounts.closed.toString().padStart(2, "0")})
              </button>
            </div>
            <div className="overflow-hidden text-left w-full">
              <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 px-2 py-1">
                <div className="text-gray-600 font-medium text-xs">INCIDENT ID</div>
                <div className="text-gray-600 font-medium text-xs">SITE NAME</div>
                <div className="text-gray-600 font-medium text-xs">TIME</div>
              </div>
              <div className="flex flex-col gap-1">
                {isLoadingIncidents ? (
                  <div className="text-center py-4">
                    <CircularProgress size={20} />
                  </div>
                ) : incidentData.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-xs">
                    No {activeIncidentTab} incidents found for this site
                  </div>
                ) : (
                  incidentData.slice(0, 3).map((incident) => {
                    const { date, time } = formatDateTime(incident.dateAndTime);
                    return (
                      <div key={incident.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 px-2 py-1 bg-white items-center">
                          <div className="text-gray-800 font-medium truncate text-xs">{incident.id.slice(-6)}</div>
                          <div className="text-gray-800 font-medium break-words text-xs">{incident.site?.siteName}</div>
                          <div className="text-gray-800 font-medium text-xs">
                            <div>{date}</div>
                            <div>{time}</div>
                          </div>
                        </div>
                        <div className="bg-blue-50 px-4 py-1 border-t border-gray-200">
                          <div className="flex justify-center gap-2">
                            <button className="">
                              <LocalFireDepartmentOutlinedIcon sx={{ color: "#2A77D5", fontSize: "16px" }} />
                            </button>
                            <button className="">
                              <HomeOutlinedIcon sx={{ color: "#2A77D5", fontSize: "16px" }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
