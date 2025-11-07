import {
  useGetAlertnessDefaults,
  useGetAttendanceCount,
  useGetGeofenceActivity,
  useGetLateCount,
  useGetUniformDefaults,
} from "@modules/clients/apis/hooks/useGetClientGuardDefaults";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { getDateRangeForView } from "../utils/dateRangeUtils";

export const GuardDefaultsListView = () => {
  const { selectedMetric, selectedView, currentDate, selectedSite } = useClientContext();
  const { clientId } = useParams();
  const dateRange = useMemo(() => getDateRangeForView(selectedView, currentDate), [selectedView, currentDate]);
  const navigate = useNavigate();

  const {
    data: attendanceCountData,
    isLoading: isLoadingAbsent,
    error: errorAbsent,
  } = useGetAttendanceCount(clientId || "", dateRange.startDate, dateRange.endDate) as any;
  const {
    data: uniformData,
    isLoading: isLoadingUniform,
    error: errorUniform,
  } = useGetUniformDefaults(clientId || "", dateRange.startDate, dateRange.endDate) as any;
  const {
    data: alertnessData,
    isLoading: isLoadingAlertness,
    error: errorAlertness,
  } = useGetAlertnessDefaults(clientId || "", dateRange.startDate, dateRange.endDate) as any;
  const {
    data: lateData,
    isLoading: isLoadingLate,
    error: errorLate,
  } = useGetLateCount(clientId || "", dateRange.startDate, dateRange.endDate) as any;
  const {
    data: geofenceData,
    isLoading: isLoadingGeofence,
    error: errorGeofence,
  } = useGetGeofenceActivity(clientId || "", dateRange.startDate, dateRange.endDate) as any;

  const absentGuardsData = useMemo(() => {
    if (!attendanceCountData?.data?.siteBreakdown) return [];
    let siteData = attendanceCountData.data.siteBreakdown;

    if (selectedSite !== "ALL SITES") {
      siteData = siteData.filter((site: any) => site.siteId === selectedSite);
    }

    return siteData
      .filter((site: any) => site.absentCount > 0)
      .map((site: any, index: number) => ({
        id: index,
        siteId: site.siteId,
        siteName: site.siteName,
        guardCount: site.absentCount,
        absent: site.absentCount,
        replaced: 0,
        toReplace: site.absentCount,
      }));
  }, [attendanceCountData, selectedSite]);

  const uniformGuardsData = useMemo(() => {
    if (!uniformData?.data?.sitesWithDefaults) return [];
    let sitesData = uniformData.data.sitesWithDefaults;

    if (selectedSite !== "ALL SITES") {
      sitesData = sitesData.filter((site: any) => site.siteId === selectedSite);
    }

    return sitesData
      .filter((site: any) => site.totalDefaults > 0)
      .map((site: any, index: number) => {
        const uniqueGuards = new Set();
        site.defaultsByDate?.forEach((dayData: any) => {
          dayData.guards?.forEach((guard: any) => uniqueGuards.add(guard.guardId));
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
  }, [uniformData, selectedSite]);

  const alertnessGuardsData = useMemo(() => {
    if (!alertnessData?.data?.sitesWithIssues) return [];
    let sitesData = alertnessData.data.sitesWithIssues;

    if (selectedSite !== "ALL SITES") {
      sitesData = sitesData.filter((site: any) => site.siteId === selectedSite);
    }

    return sitesData
      .filter((site: any) => site.totalDefaults > 0)
      .map((site: any, index: number) => {
        const uniqueGuards = new Set();
        site.defaultsByDate?.forEach((dayData: any) => {
          dayData.guards?.forEach((guard: any) => uniqueGuards.add(guard.guardId));
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
  }, [alertnessData, selectedSite]);

  const lateGuardsData = useMemo(() => {
    if (!lateData?.data?.lateGuardsByDate) return [];
    const siteMap = new Map();

    let filteredData = lateData.data.lateGuardsByDate;
    if (selectedSite !== "ALL SITES") {
      filteredData = filteredData.filter((dayData: any) => dayData.siteId === selectedSite);
    }

    (filteredData as any[]).forEach((dayData: any) => {
      const { siteId, siteName, guardCount, guards } = dayData;
      if (siteMap.has(siteId)) {
        const existing: any = siteMap.get(siteId);
        existing.totalIncidents += guardCount;
        existing.totalLateMinutes += guards.reduce((sum: number, guard: any) => sum + guard.lateMinutes, 0);
        guards.forEach((guard: any) => existing.uniqueGuards.add(guard.guardId));
      } else {
        const uniqueGuards = new Set<string>();
        guards.forEach((guard: any) => uniqueGuards.add(guard.guardId));
        siteMap.set(siteId, {
          siteId,
          siteName,
          totalIncidents: guardCount,
          totalLateMinutes: guards.reduce((sum: number, guard: any) => sum + guard.lateMinutes, 0),
          uniqueGuards,
        } as any);
      }
    });
    return Array.from(siteMap.values())
      .filter((site: any) => site.totalIncidents > 0)
      .map((site: any, index: number) => ({
        id: index,
        siteId: site.siteId,
        siteName: site.siteName,
        guardCount: site.uniqueGuards.size,
        totalIncidents: site.totalIncidents,
        avgLateMinutes: Math.round(site.totalLateMinutes / site.totalIncidents),
      }));
  }, [lateData, selectedSite]);

  const geofenceGuardsData = useMemo(() => {
    if (!geofenceData?.data?.sitesWithGeofenceActivity) return [];
    const siteMap = new Map();

    let filteredSites = geofenceData.data.sitesWithGeofenceActivity;
    if (selectedSite !== "ALL SITES") {
      filteredSites = filteredSites.filter((siteActivity: any) => siteActivity.siteId === selectedSite);
    }

    filteredSites.forEach((siteActivity: any) => {
      const { siteId, siteName, sessionCount, guards } = siteActivity;
      if (!guards || !Array.isArray(guards)) return;

      if (siteMap.has(siteId)) {
        const existing = siteMap.get(siteId);
        existing.totalSessions += sessionCount;
        guards.forEach((guard: any) => {
          existing.uniqueGuards.add(guard.guardId);
          existing.totalDuration += (guard?.sessions || []).reduce(
            (sum: any, session: any) =>
              sum + (session?.duration ? parseInt(session.duration.replace(" Min", "")) || 0 : 0),
            0
          );
        });
      } else {
        const uniqueGuards = new Set();
        let totalDuration = 0;
        guards.forEach((guard: any) => {
          uniqueGuards.add(guard.guardId);
          totalDuration += (guard?.sessions || []).reduce(
            (sum: any, session: any) =>
              sum + (session?.duration ? parseInt(session.duration.replace(" Min", "")) || 0 : 0),
            0
          );
        });
        siteMap.set(siteId, {
          siteId,
          siteName,
          totalSessions: sessionCount,
          uniqueGuards,
          totalDuration,
        });
      }
    });

    return Array.from(siteMap.values())
      .filter((site: any) => site.totalSessions > 0)
      .map((site: any, index: number) => ({
        id: index,
        siteId: site.siteId,
        siteName: site.siteName,
        guardCount: site.uniqueGuards.size,
        totalSessions: site.totalSessions,
        avgDuration: Math.round(site.totalDuration / site.totalSessions),
      }));
  }, [geofenceData, selectedSite]);

  const patrolGuardsData = useMemo(() => {
    if (!geofenceData?.data?.sitesWithGeofenceActivity) return [];
    const siteMap = new Map();

    let filteredSites = geofenceData.data.sitesWithGeofenceActivity;
    if (selectedSite !== "ALL SITES") {
      filteredSites = filteredSites.filter((siteActivity: any) => siteActivity.siteId === selectedSite);
    }

    filteredSites.forEach((siteActivity: any) => {
      const { siteId, siteName, sessionCount, guards } = siteActivity;
      if (!guards || !Array.isArray(guards)) return;

      if (siteMap.has(siteId)) {
        const existing = siteMap.get(siteId);
        existing.totalPatrols += sessionCount;
        guards.forEach((guard: any) => existing.uniqueGuards.add(guard?.guardId));
      } else {
        const uniqueGuards = new Set();
        guards.forEach((guard: any) => {
          if (guard?.guardId) uniqueGuards.add(guard.guardId);
        });
        siteMap.set(siteId, {
          siteId,
          siteName,
          totalPatrols: sessionCount,
          uniqueGuards,
        });
      }
    });
    return Array.from(siteMap.values())
      .filter((site: any) => site.totalPatrols > 0)
      .map((site: any, index: number) => ({
        id: index,
        siteId: site.siteId,
        siteName: site.siteName,
        guardCount: site.uniqueGuards.size,
        totalPatrols: site.totalPatrols,
        avgPatrolsPerGuard: Math.round(site.totalPatrols / site.uniqueGuards.size),
      }));
  }, [geofenceData, selectedSite]);

  const getTableData = () => {
    switch (selectedMetric) {
      case "absent":
        return { rows: absentGuardsData, columns: AbsentTableColumns, isLoading: isLoadingAbsent, error: errorAbsent };
      case "late":
        return { rows: lateGuardsData, columns: LateTableColumns, isLoading: isLoadingLate, error: errorLate };
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
        return null;
    }
  };

  const tableData = getTableData();

  if (!tableData) {
    return (
      <div className="flex flex-col bg-white p-4 items-center h-full w-full">
        <span className="uppercase text-lg mb-4">{selectedMetric} : LIST VIEW</span>
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
          No data available for {selectedMetric}
        </Box>
      </div>
    );
  }

  if (tableData.isLoading) {
    return (
      <div className="flex flex-col bg-white p-4 items-center h-full w-full">
        <span className="uppercase text-lg mb-4">{selectedMetric} : LIST VIEW</span>
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
      </div>
    );
  }

  if (tableData.error) {
    return (
      <div className="flex flex-col bg-white p-4 items-center h-full w-full">
        <span className="uppercase text-lg mb-4">{selectedMetric} : LIST VIEW</span>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white p-4 items-center h-full w-full">
      <span className="uppercase text-lg mb-4">{selectedMetric} : LIST VIEW</span>
      <Box sx={{ width: "100%", flexGrow: 1, minHeight: 400, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <DataGrid
          rows={tableData.rows}
          columns={tableData.columns}
          hideFooter={true}
          disableColumnMenu
          disableRowSelectionOnClick
          sx={datagridStyle}
          onRowClick={(params) => {
            const siteId = params.row.siteId || params.row.id;
            const { clientId } = useParams();
            navigate(`/clients/${clientId}/performance/guards-defaults/${siteId}`);
          }}
        />
      </Box>
    </div>
  );
};
