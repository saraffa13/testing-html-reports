import {
  useGetAlertnessDefaults,
  useGetAttendanceCount,
  useGetGeofenceActivity,
  useGetLateCount,
  useGetUniformDefaults,
} from "@modules/clients/apis/hooks/useGetClientGuardDefaults";
import { CustomDateRangePicker } from "@modules/clients/components/CustomDateRangePicker";
import MetricChart from "@modules/clients/components/CustomMetricChart";
import { renderMetricComponent } from "@modules/clients/components/GuardDefaultsComponents";
import { GuardDefaultsListView } from "@modules/clients/components/GuardDefaultsListView";
import { useClientContext } from "@modules/clients/context/ClientContext";
import { getDateRangeForView } from "@modules/clients/utils/dateRangeUtils";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import { Button, CircularProgress, Dialog } from "@mui/material";
import { ShirtIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export default function ClientGuardDefaults() {
  const { selectedView, currentDate, selectedMetric, setSelectedMetric, selectedSite } = useClientContext();
  const { clientId } = useParams();
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (selectedView === "custom" && !customStartDate && !customEndDate) {
      setIsDatePickerOpen(true);
    }
  }, [selectedView, customStartDate, customEndDate]);

  const dateRange = useMemo(() => {
    if (selectedView === "custom" && customStartDate && customEndDate) {
      return getDateRangeForView("custom", currentDate, customStartDate, customEndDate);
    }
    return getDateRangeForView(selectedView, currentDate);
  }, [selectedView, currentDate, customStartDate, customEndDate]);

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

  const isLoading = isLoadingAbsent || isLoadingLate || isLoadingUniform || isLoadingAlertness || isLoadingGeofence;

  const metrics = useMemo(() => {
    if (selectedSite === "ALL SITES") {
      return {
        absent: attendanceData?.data?.summary?.totalUniqueAbsentGuards || 0,
        late: lateData?.data?.totalLateIncidents || 0,
        uniform: uniformData?.data?.totalUniformDefaults || 0,
        alertness: alertnessData?.data?.totalAlertnessDefaults || 0,
        geofence:
          geofenceData?.data?.sitesWithGeofenceActivity?.reduce(
            (total: number, activity: any) => total + activity.sessionCount,
            0
          ) || 0,
        patrol: geofenceData?.data?.totalSessions || 0,
        total:
          (attendanceData?.data?.summary?.totalUniqueAbsentGuards || 0) +
          (lateData?.data?.totalLateIncidents || 0) +
          (uniformData?.data?.totalUniformDefaults || 0) +
          (alertnessData?.data?.totalAlertnessDefaults || 0),
      };
    } else {
      const siteAbsent =
        attendanceData?.data?.siteBreakdown?.find((site: any) => site.siteId === selectedSite)?.uniqueAbsentGuards || 0;
      const siteLateIncidents =
        lateData?.data?.lateGuardsByDate
          ?.filter((dayData: any) => dayData.siteId === selectedSite)
          ?.reduce((total: number, dayData: any) => total + dayData.guardCount, 0) || 0;
      const siteUniformDefaults =
        uniformData?.data?.sitesWithDefaults
          ?.filter((site: any) => site.siteId === selectedSite)
          ?.reduce((total: number, site: any) => total + site.totalDefaults, 0) || 0;
      const siteAlertnessDefaults =
        alertnessData?.data?.sitesWithIssues
          ?.filter((site: any) => site.siteId === selectedSite)
          ?.reduce((total: number, site: any) => total + site.totalDefaults, 0) || 0;
      const siteGeofenceSessionCount =
        geofenceData?.data?.sitesWithGeofenceActivity
          ?.filter((activity: any) => activity.siteId === selectedSite)
          ?.reduce((total: number, activity: any) => total + activity.sessionCount, 0) || 0;
      const sitePatrolSessions =
        geofenceData?.data?.sitesWithGeofenceActivity
          ?.filter((activity: any) => activity.siteId === selectedSite)
          ?.reduce((total: number, activity: any) => total + activity.sessionCount, 0) || 0;
      return {
        absent: siteAbsent,
        late: siteLateIncidents,
        uniform: siteUniformDefaults,
        alertness: siteAlertnessDefaults,
        geofence: siteGeofenceSessionCount,
        patrol: sitePatrolSessions,
        total: siteAbsent + siteLateIncidents + siteUniformDefaults + siteAlertnessDefaults,
      };
    }
  }, [attendanceData, lateData, uniformData, alertnessData, geofenceData, selectedSite]);

  const guardCounts = useMemo(() => {
    let absentGuardCount = 0;
    if (attendanceData?.data?.siteBreakdown) {
      let siteData = attendanceData.data.siteBreakdown;
      if (selectedSite !== "ALL SITES") {
        siteData = siteData.filter((site: any) => site?.siteId === selectedSite);
      }
      absentGuardCount = siteData
        .filter((site: any) => site?.absentCount > 0)
        .reduce((total: number, site: any) => total + (site?.absentCount || 0), 0);
    }

    let lateGuardCount = 0;
    if (lateData?.data?.lateGuardsByDate) {
      const siteMap = new Map();
      let filteredData = lateData.data.lateGuardsByDate;
      if (selectedSite !== "ALL SITES") {
        filteredData = filteredData.filter((dayData: any) => dayData?.siteId === selectedSite);
      }
      filteredData.forEach((dayData: any) => {
        if (!dayData?.siteId || !dayData?.guards) return;
        const { siteId, guards } = dayData;
        if (siteMap.has(siteId)) {
          const existing = siteMap.get(siteId);
          guards.forEach((guard: any) => {
            if (guard?.guardId) existing.uniqueGuards.add(guard.guardId);
          });
        } else {
          const uniqueGuards = new Set();
          guards.forEach((guard: any) => {
            if (guard?.guardId) uniqueGuards.add(guard.guardId);
          });
          siteMap.set(siteId, { uniqueGuards });
        }
      });
      lateGuardCount = Array.from(siteMap.values()).reduce(
        (total: number, site: any) => total + (site?.uniqueGuards?.size || 0),
        0
      );
    }

    let uniformGuardCount = 0;
    if (uniformData?.data?.sitesWithDefaults) {
      let sitesData = uniformData.data.sitesWithDefaults;
      if (selectedSite !== "ALL SITES") {
        sitesData = sitesData.filter((site: any) => site?.siteId === selectedSite);
      }
      uniformGuardCount = sitesData
        .filter((site: any) => site?.totalDefaults > 0)
        .reduce((total: number, site: any) => {
          const uniqueGuards = new Set();
          site?.defaultsByDate?.forEach((dayData: any) => {
            dayData?.guards?.forEach((guard: any) => {
              if (guard?.guardId) uniqueGuards.add(guard.guardId);
            });
          });
          return total + uniqueGuards.size;
        }, 0);
    }

    let alertnessGuardCount = 0;
    if (alertnessData?.data?.sitesWithIssues) {
      let sitesData = alertnessData.data.sitesWithIssues;
      if (selectedSite !== "ALL SITES") {
        sitesData = sitesData.filter((site: any) => site?.siteId === selectedSite);
      }
      alertnessGuardCount = sitesData
        .filter((site: any) => site?.totalDefaults > 0)
        .reduce((total: number, site: any) => {
          const uniqueGuards = new Set();
          site?.defaultsByDate?.forEach((dayData: any) => {
            dayData?.guards?.forEach((guard: any) => {
              if (guard?.guardId) uniqueGuards.add(guard.guardId);
            });
          });
          return total + uniqueGuards.size;
        }, 0);
    }

    let geofenceGuardCount = 0;
    if (geofenceData?.data?.sitesWithGeofenceActivity) {
      const siteMap = new Map();
      let filteredSites = geofenceData.data.sitesWithGeofenceActivity;
      if (selectedSite !== "ALL SITES") {
        filteredSites = filteredSites.filter((siteActivity: any) => siteActivity?.siteId === selectedSite);
      }
      filteredSites.forEach((siteActivity: any) => {
        if (!siteActivity?.siteId || !siteActivity?.guards) return;
        const { siteId, guards } = siteActivity;
        if (siteMap.has(siteId)) {
          const existing = siteMap.get(siteId);
          guards.forEach((guard: any) => {
            if (guard?.guardId) existing.uniqueGuards.add(guard.guardId);
          });
        } else {
          const uniqueGuards = new Set();
          guards.forEach((guard: any) => {
            if (guard?.guardId) uniqueGuards.add(guard.guardId);
          });
          siteMap.set(siteId, { uniqueGuards });
        }
      });
      geofenceGuardCount = Array.from(siteMap.values()).reduce(
        (total: number, site: any) => total + (site?.uniqueGuards?.size || 0),
        0
      );
    }

    let patrolGuardCount = geofenceGuardCount;
    return {
      absent: absentGuardCount,
      late: lateGuardCount,
      uniform: uniformGuardCount,
      alertness: alertnessGuardCount,
      geofence: geofenceGuardCount,
      patrol: patrolGuardCount,
    };
  }, [attendanceData, lateData, uniformData, alertnessData, geofenceData, selectedSite]);

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
  };

  const handleCustomMetricSelect = (metricId: string) => {
    const metricMap: { [key: string]: string } = {
      absent: "absent",
      time: "late",
      uniform: "uniform",
      alertness: "alertness",
      geofence: "geofence",
      patrol: "patrol",
    };
    const mappedMetric = metricMap[metricId] || metricId;
    setSelectedMetric(mappedMetric);
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setIsDatePickerOpen(false);
  };

  const handleDatePickerCancel = () => {
    setIsDatePickerOpen(false);
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

  if (isLoading) {
    return (
      <div className="p-4 w-full h-full flex flex-col items-center justify-center">
        <CircularProgress />
        <p className="mt-2 text-gray-600">Loading metrics data...</p>
      </div>
    );
  }

  return (
    <div
      className="p-4 w-full h-full flex flex-col"
      style={{ maxWidth: "100vw", maxHeight: "100vh", overflow: "hidden" }}
    >
      <Dialog open={isDatePickerOpen} onClose={handleDatePickerCancel}>
        <CustomDateRangePicker
          onDateRangeChange={handleDateRangeChange}
          onCancel={handleDatePickerCancel}
          initialStartDate={customStartDate || undefined}
          initialEndDate={customEndDate || undefined}
        />
      </Dialog>
      <div className="flex flex-row gap-2 mt-4 flex-1" style={{ minHeight: 0, overflow: "hidden" }}>
        <div
          className="bg-white p-4 rounded-lg flex flex-col gap-4"
          style={{ minWidth: 0, flex: "0 0 auto", maxWidth: "50%", overflow: "hidden" }}
        >
          {selectedView === "custom" ? (
            <MetricChart guardCounts={guardCounts} onMetricSelect={handleCustomMetricSelect} />
          ) : (
            <div className="flex flex-col gap-4 items-center">
              <span className="uppercase text-lg">GUARDS : {selectedMetric}</span>
              <div className="flex flex-row gap-4 my-2">
                <Button
                  variant="contained"
                  sx={getMetricButtonStyles("absent")}
                  onClick={() => handleMetricChange("absent")}
                >
                  <PersonOffOutlinedIcon />
                  {metrics.absent.toString().padStart(2, "0")}
                </Button>
                <Button
                  variant="contained"
                  sx={getMetricButtonStyles("late")}
                  onClick={() => handleMetricChange("late")}
                >
                  <AccessTimeOutlinedIcon />
                  {metrics.late.toString().padStart(2, "0")}
                </Button>
                <Button
                  variant="contained"
                  sx={getMetricButtonStyles("uniform")}
                  onClick={() => handleMetricChange("uniform")}
                >
                  <ShirtIcon className={`w-6 h-6 ${selectedMetric === "uniform" ? "text-white" : "text-blue-600"}`} />
                  {metrics.uniform.toString().padStart(2, "0")}
                </Button>
                <Button
                  variant="contained"
                  sx={getMetricButtonStyles("alertness")}
                  onClick={() => handleMetricChange("alertness")}
                >
                  <img
                    src="/client_icons/alertness.svg"
                    alt="Alertness Icon"
                    className="w-6 h-6"
                    style={{
                      filter: selectedMetric === "alertness" ? "brightness(0) invert(1)" : "",
                    }}
                  />
                  {metrics.alertness.toString().padStart(2, "0")}
                </Button>
                <Button
                  variant="contained"
                  sx={getMetricButtonStyles("geofence")}
                  onClick={() => handleMetricChange("geofence")}
                >
                  <HomeWorkOutlinedIcon />
                  {metrics.geofence.toString().padStart(2, "0")}
                </Button>
                <Button
                  variant="contained"
                  sx={getMetricButtonStyles("patrol")}
                  onClick={() => handleMetricChange("patrol")}
                >
                  <DirectionsRunOutlinedIcon />
                  {metrics.patrol.toString().padStart(2, "0")}
                </Button>
              </div>
            </div>
          )}
          {renderMetricComponent(selectedMetric, selectedView, currentDate)}
        </div>
        {(selectedView === "week" || selectedView === "month" || selectedView === "custom") && (
          <GuardDefaultsListView />
        )}
      </div>
    </div>
  );
}
