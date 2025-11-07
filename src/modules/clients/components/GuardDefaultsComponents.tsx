import {
  useGetAlertnessDefaults,
  useGetAttendanceCount,
  useGetGeofenceActivity,
  useGetLateCount,
  useGetUniformDefaults,
} from "@modules/clients/apis/hooks/useGetClientGuardDefaults";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  AbsentTableColumns,
  AlertnessTableColumns,
  GeofenceTableColumns,
  LateTableColumns,
  PatrolTableColumns,
  UniformTableColumns,
} from "../columns/ClientPerformanceColumns";
import { useClientContext } from "../context/ClientContext";
import { datagridStyle } from "../lib/datagridStyle";
import { formatDate, getDateRangeForView, type ViewType } from "../utils/dateRangeUtils";

interface CalendarComponentProps {
  selectedView: ViewType;
  currentDate: Date;
  selectedMetric: string;
  onDateSelect?: (date: Date) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  selectedView,
  currentDate,
  selectedMetric,
  onDateSelect,
}) => {
  const { clientId } = useParams();
  const { selectedSite } = useClientContext();

  const dateRange = useMemo(() => {
    return getDateRangeForView(selectedView, currentDate);
  }, [selectedView, currentDate]);

  const { data: attendanceData } = useGetAttendanceCount(clientId || "", dateRange.startDate, dateRange.endDate);
  const { data: uniformData } = useGetUniformDefaults(clientId || "", dateRange.startDate, dateRange.endDate);
  const { data: alertnessData } = useGetAlertnessDefaults(clientId || "", dateRange.startDate, dateRange.endDate);
  const { data: lateData } = useGetLateCount(clientId || "", dateRange.startDate, dateRange.endDate);
  const { data: geofenceData } = useGetGeofenceActivity(clientId || "", dateRange.startDate, dateRange.endDate);

  const dailyMetricCounts = useMemo(() => {
    const countMap = new Map<string, number>();

    if (selectedMetric === "absent" && attendanceData?.data?.siteBreakdown) {
      let siteBreakdown = attendanceData.data.siteBreakdown;
      if (selectedSite !== "ALL SITES") {
        siteBreakdown = siteBreakdown.filter((site: any) => site.siteId === selectedSite);
      }

      siteBreakdown.forEach((site: any) => {
        if (site.absentGuardDetails && site.absentGuardDetails.length > 0) {
          site.absentGuardDetails.forEach((guard: any) => {
            guard.absentDuties?.forEach((duty: any) => {
              if (duty.dutyDate) {
                const dutyDateObj = new Date(duty.dutyDate);
                if (!isNaN(dutyDateObj.getTime())) {
                  const dutyDate = dutyDateObj.toISOString().split("T")[0];
                  const currentCount = countMap.get(dutyDate) || 0;
                  countMap.set(dutyDate, currentCount + 1);
                }
              }
            });
          });
        }
      });

      if (attendanceData.data.dailyBreakdown) {
        attendanceData.data.dailyBreakdown.forEach((dayData: any) => {
          if (selectedSite === "ALL SITES" || dayData.siteId === selectedSite) {
            const currentCount = countMap.get(dayData.date) || 0;
            countMap.set(dayData.date, currentCount + dayData.absentCount);
          }
        });
      } else if (attendanceData.data.topAbsentGuards) {
        attendanceData.data.topAbsentGuards.forEach((guard: any) => {
          if (selectedSite !== "ALL SITES" && guard.siteId !== selectedSite) return;

          guard.absentDuties?.forEach((duty: any) => {
            if (duty.dutyDate) {
              const dutyDateObj = new Date(duty.dutyDate);
              if (!isNaN(dutyDateObj.getTime())) {
                const dutyDate = dutyDateObj.toISOString().split("T")[0];
                const currentCount = countMap.get(dutyDate) || 0;
                countMap.set(dutyDate, currentCount + 1);
              }
            }
          });
        });
      }
    }

    if (selectedMetric === "uniform" && uniformData?.data?.sitesWithDefaults) {
      let sitesWithDefaults = uniformData.data.sitesWithDefaults;
      if (selectedSite !== "ALL SITES") {
        sitesWithDefaults = sitesWithDefaults.filter((site: any) => site.siteId === selectedSite);
      }

      sitesWithDefaults.forEach((site: any) => {
        site.defaultsByDate?.forEach((dayData: any) => {
          const currentCount = countMap.get(dayData.date) || 0;
          countMap.set(dayData.date, currentCount + dayData.defaultCount);
        });
      });
    }

    if (selectedMetric === "alertness" && alertnessData?.data?.sitesWithIssues) {
      let sitesWithIssues = alertnessData.data.sitesWithIssues;
      if (selectedSite !== "ALL SITES") {
        sitesWithIssues = sitesWithIssues.filter((site: any) => site.siteId === selectedSite);
      }

      sitesWithIssues.forEach((site: any) => {
        site.defaultsByDate?.forEach((dayData: any) => {
          const currentCount = countMap.get(dayData.date) || 0;
          countMap.set(dayData.date, currentCount + dayData.defaultCount);
        });
      });
    }

    if (selectedMetric === "late" && lateData?.data?.lateGuardsByDate) {
      let lateGuardsByDate = lateData.data.lateGuardsByDate;
      if (selectedSite !== "ALL SITES") {
        lateGuardsByDate = lateGuardsByDate.filter((dayData: any) => dayData.siteId === selectedSite);
      }

      lateGuardsByDate.forEach((dayData: any) => {
        const currentCount = countMap.get(dayData.date) || 0;
        countMap.set(dayData.date, currentCount + dayData.guardCount);
      });
    }

    if (selectedMetric === "geofence" && geofenceData?.data?.sitesWithGeofenceActivity) {
      let sitesWithGeofenceActivity = geofenceData.data.sitesWithGeofenceActivity;
      if (selectedSite !== "ALL SITES") {
        sitesWithGeofenceActivity = sitesWithGeofenceActivity.filter(
          (siteActivity: any) => siteActivity.siteId === selectedSite
        );
      }

      sitesWithGeofenceActivity.forEach((siteActivity: any) => {
        if (siteActivity.date && siteActivity.sessionCount > 0) {
          const currentCount = countMap.get(siteActivity.date) || 0;
          countMap.set(siteActivity.date, currentCount + siteActivity.sessionCount);
        }
      });

      if (geofenceData.data.dailyActivity) {
        geofenceData.data.dailyActivity.forEach((dayData: any) => {
          if (selectedSite === "ALL SITES" || dayData.siteId === selectedSite) {
            const currentCount = countMap.get(dayData.date) || 0;
            countMap.set(dayData.date, currentCount + dayData.sessionCount);
          }
        });
      }
    }

    if (selectedMetric === "patrol" && geofenceData?.data?.sitesWithGeofenceActivity) {
      let sitesWithGeofenceActivity = geofenceData.data.sitesWithGeofenceActivity;
      if (selectedSite !== "ALL SITES") {
        sitesWithGeofenceActivity = sitesWithGeofenceActivity.filter(
          (siteActivity: any) => siteActivity.siteId === selectedSite
        );
      }

      sitesWithGeofenceActivity.forEach((siteActivity: any) => {
        if (siteActivity.date && siteActivity.sessionCount > 0) {
          const currentCount = countMap.get(siteActivity.date) || 0;
          countMap.set(siteActivity.date, currentCount + siteActivity.sessionCount);
        }
      });

      if (geofenceData.data.dailyActivity) {
        geofenceData.data.dailyActivity.forEach((dayData: any) => {
          if (selectedSite === "ALL SITES" || dayData.siteId === selectedSite) {
            const currentCount = countMap.get(dayData.date) || 0;
            countMap.set(dayData.date, currentCount + dayData.sessionCount);
          }
        });
      }
    }

    return countMap;
  }, [selectedMetric, attendanceData, uniformData, alertnessData, lateData, geofenceData, selectedSite]);

  const getWeekDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();

    return (
      <div className="grid grid-cols-7">
        {weekDays.map((date, index) => {
          const formatted = formatDate(date);
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const dateKey = `${year}-${month}-${day}`;

          const metricCount = dailyMetricCounts.get(dateKey) || 0;
          const isToday = date.toDateString() === currentDate.toDateString();

          const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
          const shortDayName = dayNames[date.getDay()];

          return (
            <div
              key={index}
              className={`bg-white rounded-lg cursor-pointer flex-1 text-center`}
              onClick={() => onDateSelect?.(date)}
            >
              <div className="text-gray-500 font-medium mb-1">{shortDayName}</div>
              <div className="text-gray-400 mb-2">{formatted.day}</div>
              <div
                className={`border border-gray-200 p-2 h-16 flex justify-center items-center ${
                  index === 0 ? "rounded-l-2xl" : index === 6 ? "rounded-r-2xl" : ""
                } ${isToday ? "bg-blue-50 border-blue-300" : ""}`}
              >
                {metricCount > 0 && (
                  <div className="text-red-500 text-sm font-bold bg-white shadow rounded-full w-10 h-10 items-center flex justify-center mx-auto">
                    {metricCount.toString().padStart(2, "0")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getCurrentMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysFromPrevMonth = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    const days = [];

    for (let i = daysFromPrevMonth; i > 0; i--) {
      const prevDate = new Date(year, month, -i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const renderMonthView = () => {
    const monthDays = getCurrentMonthDays();
    const dayHeaders = ["S", "M", "T", "W", "T", "F", "S"];

    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="grid grid-cols-7 gap-1 mb-3">
          {dayHeaders.map((day, index) => (
            <div key={index} className="text-center text-gray-600 text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthDays.map((dayObj, index) => {
            const { date, isCurrentMonth } = dayObj;
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            const dateKey = `${year}-${month}-${day}`;

            const metricCount = dailyMetricCounts.get(dateKey) || 0;
            const isToday = date.toDateString() === currentDate.toDateString();

            return (
              <div
                key={index}
                className={`relative h-16 cursor-pointer transition-all duration-200 bg-white border border-gray-300 flex flex-col justify-center items-center py-1 ${
                  isCurrentMonth ? "hover:bg-gray-50" : "opacity-40"
                } ${isToday ? "bg-blue-50 border-blue-300" : ""}`}
                onClick={() => onDateSelect?.(date)}
              >
                <div className={`text-sm font-medium mb-1 text-gray-700`}>{date.getDate()}</div>
                {isCurrentMonth && metricCount > 0 && (
                  <div className="text-red-500 text-sm font-bold bg-white w-8 h-8 flex items-center justify-center mx-auto shadow-lg rounded-full">
                    {metricCount.toString().padStart(2, "0")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  switch (selectedView) {
    case "week":
      return renderWeekView();
    case "month":
      return renderMonthView();
    default:
      return null;
  }
};

const CommonDataGrid = ({ selectedMetric }: { selectedMetric: string }) => {
  const { clientId } = useParams();
  const { selectedView, currentDate, selectedSite } = useClientContext();

  const dateRange = useMemo(() => {
    return getDateRangeForView(selectedView, currentDate);
  }, [selectedView, currentDate]);

  const {
    data: attendanceCountData,
    isLoading: isLoadingAbsent,
    error: errorAbsent,
  } = useGetAttendanceCount(clientId || "", dateRange.startDate, dateRange.endDate);

  const {
    data: uniformData,
    isLoading: isLoadingUniform,
    error: errorUniform,
  } = useGetUniformDefaults(clientId || "", dateRange.startDate, dateRange.endDate);

  const {
    data: alertnessData,
    isLoading: isLoadingAlertness,
    error: errorAlertness,
  } = useGetAlertnessDefaults(clientId || "", dateRange.startDate, dateRange.endDate);

  const {
    data: lateData,
    isLoading: isLoadingLate,
    error: errorLate,
  } = useGetLateCount(clientId || "", dateRange.startDate, dateRange.endDate);

  const {
    data: geofenceData,
    isLoading: isLoadingGeofence,
    error: errorGeofence,
  } = useGetGeofenceActivity(clientId || "", dateRange.startDate, dateRange.endDate);

  const absentGuardsData = useMemo(() => {
    if (!attendanceCountData?.data?.siteBreakdown) {
      return [];
    }

    let siteBreakdown = attendanceCountData.data.siteBreakdown;

    if (selectedSite !== "ALL SITES") {
      siteBreakdown = siteBreakdown.filter((site: any) => site.siteId === selectedSite);
    }

    const absentSites = siteBreakdown
      .filter((site: any) => site.absentCount > 0)
      .map((site: any, index: number) => ({
        id: index,
        siteId: site.siteId,
        siteName: site.siteName,
        absent: site.absentCount,
        replaced: 0,
        toReplace: site.absentCount,
      }));

    return absentSites;
  }, [attendanceCountData, selectedSite]);

  const uniformGuardsData = useMemo(() => {
    if (!uniformData?.data?.sitesWithDefaults) {
      return [];
    }

    let sitesWithDefaults = uniformData.data.sitesWithDefaults;

    if (selectedSite !== "ALL SITES") {
      sitesWithDefaults = sitesWithDefaults.filter((site: any) => site.siteId === selectedSite);
    }

    const uniformSites = sitesWithDefaults
      .filter((site: any) => site.totalDefaults > 0)
      .map((site: any, index: number) => {
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
      });

    return uniformSites;
  }, [uniformData, selectedSite]);

  const alertnessGuardsData = useMemo(() => {
    if (!alertnessData?.data?.sitesWithIssues) {
      return [];
    }

    let sitesWithIssues = alertnessData.data.sitesWithIssues;

    if (selectedSite !== "ALL SITES") {
      sitesWithIssues = sitesWithIssues.filter((site: any) => site.siteId === selectedSite);
    }

    const alertnessSites = sitesWithIssues
      .filter((site: any) => site.totalDefaults > 0)
      .map((site: any, index: number) => {
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
      });

    return alertnessSites;
  }, [alertnessData, selectedSite]);

  const lateGuardsData = useMemo(() => {
    if (!lateData?.data?.lateGuardsByDate) {
      return [];
    }

    let lateGuardsByDate = lateData.data.lateGuardsByDate;

    if (selectedSite !== "ALL SITES") {
      lateGuardsByDate = lateGuardsByDate.filter((dayData: any) => dayData.siteId === selectedSite);
    }

    const siteMap = new Map();
    lateGuardsByDate.forEach((dayData: any) => {
      const { siteId, siteName, guardCount, guards } = dayData;
      if (siteMap.has(siteId)) {
        const existing: any = siteMap.get(siteId);
        existing.totalIncidents += guardCount;
        existing.totalLateMinutes += guards.reduce((sum: any, guard: any) => sum + guard.lateMinutes, 0);
        guards.forEach((guard: any) => existing.uniqueGuards.add(guard.guardId));
      } else {
        const uniqueGuards = new Set<any>();
        guards.forEach((guard: any) => uniqueGuards.add(guard.guardId));
        siteMap.set(siteId, {
          siteId,
          siteName,
          totalIncidents: guardCount,
          totalLateMinutes: guards.reduce((sum: any, guard: any) => sum + guard.lateMinutes, 0),
          uniqueGuards,
        });
      }
    });
    const lateSites = Array.from(siteMap.values())
      .filter((site: any) => site.totalIncidents > 0)
      .map((site: any, index: number) => ({
        id: index,
        siteId: site.siteId,
        siteName: site.siteName,
        guardCount: site.uniqueGuards.size,
        totalIncidents: site.totalIncidents,
        avgLateMinutes: Math.round(site.totalLateMinutes / site.totalIncidents),
      }));
    return lateSites;
  }, [lateData, selectedSite]);

  const geofenceGuardsData = useMemo(() => {
    if (!geofenceData?.data?.sitesWithGeofenceActivity) return [];
    let sitesWithGeofenceActivity = geofenceData.data.sitesWithGeofenceActivity;

    if (selectedSite !== "ALL SITES") {
      sitesWithGeofenceActivity = sitesWithGeofenceActivity.filter(
        (siteActivity: any) => siteActivity.siteId === selectedSite
      );
    }

    const siteMap = new Map();
    sitesWithGeofenceActivity.forEach((siteActivity: any) => {
      const { siteId, siteName, sessionCount, guards } = siteActivity;
      if (!guards || !Array.isArray(guards)) return;

      if (siteMap.has(siteId)) {
        const existing: any = siteMap.get(siteId);
        existing.totalSessions += sessionCount;
        existing.guardCount += guards.length;
        existing.totalDuration += guards.reduce((sum: any, guard: any) => {
          return (
            sum +
            (guard?.sessions || []).reduce((sessionSum: any, session: any) => {
              const duration = session?.duration ? parseInt(session.duration.replace(" Min", "")) || 0 : 0;
              return sessionSum + duration;
            }, 0)
          );
        }, 0);
      } else {
        const totalDuration = guards.reduce((sum: any, guard: any) => {
          return (
            sum +
            (guard?.sessions || []).reduce((sessionSum: any, session: any) => {
              const duration = session?.duration ? parseInt(session.duration.replace(" Min", "")) || 0 : 0;
              return sessionSum + duration;
            }, 0)
          );
        }, 0);
        siteMap.set(siteId, {
          siteId,
          siteName,
          totalSessions: sessionCount,
          guardCount: guards.length,
          totalDuration,
        });
      }
    });
    const geofenceSites = Array.from(siteMap.values())
      .filter((site: any) => site.totalSessions > 0)
      .map((site: any, index: number) => ({
        id: index,
        siteId: site.siteId,
        siteName: site.siteName,
        guardCount: site.guardCount,
        totalSessions: site.totalSessions,
        avgDuration: Math.round(site.totalDuration / site.totalSessions),
      }));
    return geofenceSites;
  }, [geofenceData, selectedSite]);

  const patrolGuardsData = useMemo(() => {
    if (!geofenceData?.data?.sitesWithGeofenceActivity) return [];
    let sitesWithGeofenceActivity = geofenceData.data.sitesWithGeofenceActivity;

    if (selectedSite !== "ALL SITES") {
      sitesWithGeofenceActivity = sitesWithGeofenceActivity.filter(
        (siteActivity: any) => siteActivity.siteId === selectedSite
      );
    }

    const siteMap = new Map();
    sitesWithGeofenceActivity.forEach((siteActivity: any) => {
      const { siteId, siteName, sessionCount, guards } = siteActivity;
      if (siteMap.has(siteId)) {
        const existing: any = siteMap.get(siteId);
        existing.totalPatrols += sessionCount;
        existing.guardCount += guards.length;
      } else {
        siteMap.set(siteId, {
          siteId,
          siteName,
          totalPatrols: sessionCount,
          guardCount: guards.length,
        });
      }
    });
    const patrolSites = Array.from(siteMap.values())
      .filter((site: any) => site.totalPatrols > 0)
      .map((site: any, index: number) => ({
        id: index,
        siteId: site.siteId,
        siteName: site.siteName,
        guardCount: site.guardCount,
        totalPatrols: site.totalPatrols,
        avgPatrolsPerGuard: Math.round(site.totalPatrols / site.guardCount),
      }));
    return patrolSites;
  }, [geofenceData, selectedSite]);

  const getTableData = () => {
    switch (selectedMetric) {
      case "absent":
        return {
          rows: absentGuardsData,
          columns: AbsentTableColumns,
          isLoading: isLoadingAbsent,
          error: errorAbsent,
        };
      case "late":
        return {
          rows: lateGuardsData,
          columns: LateTableColumns,
          isLoading: isLoadingLate,
          error: errorLate,
        };
      case "uniform":
        return {
          rows: uniformGuardsData,
          columns: UniformTableColumns,
          isLoading: isLoadingUniform,
          error: errorUniform,
        };
      case "alertness":
        return {
          rows: alertnessGuardsData,
          columns: AlertnessTableColumns,
          isLoading: isLoadingAlertness,
          error: errorAlertness,
        };
      case "geofence":
        return {
          rows: geofenceGuardsData,
          columns: GeofenceTableColumns,
          isLoading: isLoadingGeofence,
          error: errorGeofence,
        };
      case "patrol":
        return {
          rows: patrolGuardsData,
          columns: PatrolTableColumns,
          isLoading: isLoadingGeofence,
          error: errorGeofence,
        };
      default:
        return {
          rows: [],
          columns: [],
          isLoading: false,
          error: null,
        };
    }
  };

  const { rows, columns, isLoading: tableLoading, error: tableError } = getTableData();

  if (tableLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          flexGrow: 1,
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading {selectedMetric} data...
      </Box>
    );
  }

  if (tableError) {
    return (
      <Box
        sx={{
          width: "100%",
          flexGrow: 1,
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Error loading {selectedMetric} data
      </Box>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          flexGrow: 1,
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-center text-gray-500">
          <p>No {selectedMetric} defaults found</p>
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

export const renderMetricComponent = (
  selectedMetric: string,
  selectedView?: ViewType,
  currentDate?: Date,
  onDateSelect?: (date: Date) => void
) => {
  switch (selectedMetric) {
    case "absent":
      if (selectedView === "day") {
        return <CommonDataGrid selectedMetric={selectedMetric} />;
      } else if (selectedView === "week" || selectedView === "month" || selectedView === "custom") {
        return (
          <Box sx={{ width: "100%", height: "100%", flexGrow: 1, minHeight: 0, overflow: "auto", p: 2 }}>
            <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
              <div className="flex-1" style={{ minHeight: 0, overflow: "auto" }}>
                {selectedView && currentDate ? (
                  <CalendarComponent
                    selectedView={selectedView}
                    currentDate={currentDate}
                    selectedMetric={selectedMetric}
                    onDateSelect={onDateSelect}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Calendar view not available</p>
                  </div>
                )}
              </div>
            </div>
          </Box>
        );
      }
      break;

    case "late":
      if (selectedView === "day") {
        return <CommonDataGrid selectedMetric={selectedMetric} />;
      } else if (selectedView === "week" || selectedView === "month" || selectedView === "custom") {
        return (
          <Box sx={{ width: "100%", height: "100%", flexGrow: 1, minHeight: 0, overflow: "auto", p: 2 }}>
            <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
              <div className="flex-1" style={{ minHeight: 0, overflow: "auto" }}>
                {selectedView && currentDate ? (
                  <CalendarComponent
                    selectedView={selectedView}
                    currentDate={currentDate}
                    selectedMetric="late"
                    onDateSelect={onDateSelect}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Calendar view not available</p>
                  </div>
                )}
              </div>
            </div>
          </Box>
        );
      }
      break;

    case "uniform":
      if (selectedView === "day") {
        return <CommonDataGrid selectedMetric={selectedMetric} />;
      } else if (selectedView === "week" || selectedView === "month" || selectedView === "custom") {
        return (
          <Box sx={{ width: "100%", height: "100%", flexGrow: 1, minHeight: 0, overflow: "auto", p: 2 }}>
            <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
              <div className="flex-1" style={{ minHeight: 0, overflow: "auto" }}>
                {selectedView && currentDate ? (
                  <CalendarComponent
                    selectedView={selectedView}
                    currentDate={currentDate}
                    selectedMetric="uniform"
                    onDateSelect={onDateSelect}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Calendar view not available</p>
                  </div>
                )}
              </div>
            </div>
          </Box>
        );
      }
      break;

    case "alertness":
      if (selectedView === "day") {
        return <CommonDataGrid selectedMetric={selectedMetric} />;
      } else if (selectedView === "week" || selectedView === "month" || selectedView === "custom") {
        return (
          <Box sx={{ width: "100%", height: "100%", flexGrow: 1, minHeight: 0, overflow: "auto", p: 2 }}>
            <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
              <div className="flex-1" style={{ minHeight: 0, overflow: "auto" }}>
                {selectedView && currentDate ? (
                  <CalendarComponent
                    selectedView={selectedView}
                    currentDate={currentDate}
                    selectedMetric="alertness"
                    onDateSelect={onDateSelect}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Calendar view not available</p>
                  </div>
                )}
              </div>
            </div>
          </Box>
        );
      }
      break;

    case "geofence":
      if (selectedView === "day") {
        return <CommonDataGrid selectedMetric={selectedMetric} />;
      } else if (selectedView === "week" || selectedView === "month" || selectedView === "custom") {
        return (
          <Box sx={{ width: "100%", height: "100%", flexGrow: 1, minHeight: 0, overflow: "auto", p: 2 }}>
            <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
              <div className="flex-1" style={{ minHeight: 0, overflow: "auto" }}>
                {selectedView && currentDate ? (
                  <CalendarComponent
                    selectedView={selectedView}
                    currentDate={currentDate}
                    selectedMetric="geofence"
                    onDateSelect={onDateSelect}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Calendar view not available</p>
                  </div>
                )}
              </div>
            </div>
          </Box>
        );
      }
      break;

    case "patrol":
      if (selectedView === "day") {
        return <CommonDataGrid selectedMetric={selectedMetric} />;
      } else if (selectedView === "week" || selectedView === "month" || selectedView === "custom") {
        return (
          <Box sx={{ width: "100%", height: "100%", flexGrow: 1, minHeight: 0, overflow: "auto", p: 2 }}>
            <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
              <div className="flex-1" style={{ minHeight: 0, overflow: "auto" }}>
                {selectedView && currentDate ? (
                  <CalendarComponent
                    selectedView={selectedView}
                    currentDate={currentDate}
                    selectedMetric="patrol"
                    onDateSelect={onDateSelect}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Calendar view not available</p>
                  </div>
                )}
              </div>
            </div>
          </Box>
        );
      }
      break;

    default:
      return null;
  }
};
