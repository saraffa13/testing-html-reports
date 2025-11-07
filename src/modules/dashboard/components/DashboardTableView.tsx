import { CustomSwitch } from "@components/CustomSwitch";
import { useGetGuards } from "@modules/clients/apis/hooks/useGuards";
import { Search, StarBorder, Tune } from "@mui/icons-material";
import { CircularProgress, InputAdornment, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAttendanceOverview,
  useDashboardOverview,
  useIncidentReports,
  useLateUniformSummary,
  useLivelinessAlerts,
  useShiftPerformanceIssues,
} from "../apis/hooks/useDashboard";
import { areaOfficersColumns, areaOfficersDatagridStyle } from "../columns/AreaOfficersColumns";
import { attendanceColumns } from "../columns/AttendanceColumns";
import { guardsColumns, guardsDatagridStyle } from "../columns/GuardsColumns";
import { livelinessColumns, livelinessDatagridStyle } from "../columns/LivelinessColumns";
import { datagridStyle, getOverviewColumns } from "../columns/OverviewColumns";
import { shiftsColumns, shiftsDatagridStyle } from "../columns/ShiftsColumns";
import AreaOfficersTasksView from "./AreaOfficersTasksView";
import IncidentReportsView from "./IncidentReportsView";

interface DashboardTableViewProps {
  selectedTableView: string;
  selectedColumn: string;
  selectedViewType: string;
  onColumnClick: (columnField: string) => void;
  pageSize: number;
  opAgencyId: string;
  startDate: string;
  endDate: string;
  areaOfficerTasksData?: any;
  isAreaOfficerTasksLoading?: boolean;
  areaOfficerTasksError?: Error | null;
}

const StarredHeader = ({
  showStarredOnly,
  setShowStarredOnly,
  searchQuery,
  setSearchQuery,
}: {
  showStarredOnly: boolean;
  setShowStarredOnly: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) => (
  <div className="flex justify-between items-center mb-4">
    <div className="flex gap-2">
      <div
        className={`inline-flex items-center gap-1 cursor-pointer pb-1 text-[#2A77D5] ${
          !showStarredOnly ? "border-b-2 border-[#2A77D5] font-semibold" : ""
        }`}
        onClick={() => setShowStarredOnly(false)}
      >
        <Tune sx={{ mr: 0.5, fontSize: 20 }} />
        ALL
      </div>
      <div
        className={`inline-flex items-center gap-1 cursor-pointer pb-1 text-[#2A77D5] ${
          showStarredOnly ? "border-b-2 border-[#2A77D5] font-semibold" : ""
        }`}
        onClick={() => setShowStarredOnly(true)}
      >
        <StarBorder sx={{ mr: 0.5, fontSize: 20 }} />
        STARRED
      </div>
    </div>
    <TextField
      size="small"
      placeholder="Search List"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Search sx={{ color: "#9e9e9e", fontSize: 18 }} />
          </InputAdornment>
        ),
      }}
      sx={{
        width: 180,
        "& .MuiOutlinedInput-root": {
          borderRadius: "6px",
          height: "32px",
          fontSize: "13px",
          "& fieldset": {
            borderColor: "#e5e5e5",
          },
          "&:hover fieldset": {
            borderColor: "#d1d5db",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#9ca3af",
            borderWidth: "1px",
          },
        },
        "& .MuiOutlinedInput-input": {
          padding: "6px 12px",
          "&::placeholder": {
            color: "#9ca3af",
            fontSize: "13px",
          },
        },
      }}
    />
  </div>
);

export default function DashboardTableView({
  selectedTableView,
  areaOfficerTasksData,
  isAreaOfficerTasksLoading,
  areaOfficerTasksError,
  selectedViewType,
  opAgencyId,
  startDate,
  endDate,
}: DashboardTableViewProps) {
  const navigate = useNavigate();
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Change default to false (show count by default)
  const [showPercentage, setShowPercentage] = useState(false);
  const shouldShowStarredHeader = ["overview", "attendance", "guards", "shifts"].includes(selectedTableView);
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
    data: livelinessData,
    isLoading: isLivelinessLoading,
    error: livelinessError,
  } = useLivelinessAlerts({
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
    userTypeFilter: "GUARD",
  });

  // Fetch area officers using guards API
  const {
    data: areaOfficersGuardsData,
    isLoading: isAreaOfficersGuardsLoading,
    error: areaOfficersGuardsError,
  } = useGetGuards({
    page: 1,
    limit: 50,
    userType: "AREA_OFFICER",
    agencyId: opAgencyId,
  });
  const overviewData = dashboardData?.data?.clients || [];
  const livelinessAlerts = livelinessData?.data || [];
  const lateUniformSummary = lateUniformData?.data?.data?.[0]?.overviewData || [];
  const shiftPerformanceOverview = shiftPerformanceData?.data?.data?.[0]?.overviewData || [];

  console.log('Liveliness data:', livelinessData);
  console.log('Liveliness alerts:', livelinessAlerts);
  const transformedOverviewData = overviewData.map((item: any, _index: number) => ({
    id: item.id,
    clientId: item.id,
    clientName: item.name,
    favourite: item.favourite || false,
    absentCount: item.defaults.absentCount,
    lateCount: item.defaults.lateCount,
    uniformCount: item.defaults.uniformCount,
    alertnessCount: item.defaults.alertnessCount,
    geofenceCount: item.defaults.geofenceCount,
    patrolCount: item.defaults.patrolCount,
    starred: item.favourite || false,
  }));
  const transformedLivelinessData = livelinessAlerts.map((item: any, index: number) => ({
    id: index + 1,
    ...item,
  }));
  const transformedGuardsData = lateUniformSummary.map((item: any, index: number) => ({
    id: index + 1,
    clientId: item.clientId,
    clientName: item.clientName,
    favourite: item.favourite || false,
    late: item.lateCount,
    uniform: item.uniform,
    starred: item.favourite || false,
  }));
  const transformedShiftsData = shiftPerformanceOverview.map((item: any, index: number) => ({
    id: index + 1,
    clientId: item.clientId,
    clientName: item.clientName,
    favourite: item.favourite || false,
    alertness: item.alertness,
    geofence: item.geofence,
    patrol: item.patrol || 0,
    starred: item.favourite || false,
  }));
  const transformedAreaOfficersData = (areaOfficersGuardsData?.data?.guards || []).map(
    (officer: any, index: number) => ({
      id: index + 1,
      clientId: officer.guardId,
      name: `${officer.firstName} ${officer.middleName || ""} ${officer.lastName}`.trim(),
      assignedArea: "NA",
      absent: 0, // Use status to determine absence
      late: 0, // Could be calculated from GuardSelection timing data
      uniform: 0, // Could be enhanced with actual uniform data
    })
  );

  // Use opAgencyId and date range for attendance API
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

  const applySearchFilter = (data: any[], searchFields: string[]) => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  };
  const applyStarredFilter = (data: any[]) => {
    if (!showStarredOnly) return data;
    return data.filter((item) => item.starred === true);
  };
  const getFilteredData = (data: any[], searchFields: string[]) => {
    let filtered = applySearchFilter(data, searchFields);
    filtered = applyStarredFilter(filtered);
    return filtered;
  };
  const handleRowClick = (clientId: string) => {
    if (selectedTableView !== "incidents" && selectedTableView !== "area-officers-tasks") {
      navigate(`/clients/${clientId}/performance/guards-defaults`);
    }
  };
  const handleLivelinessRowClick = (guardId: string) => {
    navigate(`/guards/${guardId}/performance`);
  };

  useEffect(() => {
    console.log(overviewData);
  }, [overviewData]);
  // Helper to determine if monthly view is active
  const isMonthlyOverview = selectedTableView === "overview" && selectedViewType === "month";

  if (selectedTableView === "overview") {
    if (isDashboardLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading dashboard data...</Typography>
        </div>
      );
    }
    if (dashboardError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Typography color="error">Error loading dashboard data</Typography>
        </div>
      );
    }
    return (
      <div className="w-full h-full">
        {shouldShowStarredHeader && (
          <StarredHeader
            showStarredOnly={showStarredOnly}
            setShowStarredOnly={setShowStarredOnly}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {isMonthlyOverview && (
          <div className="flex flex-col items-center gap-1 mb-2" style={{ minHeight: 48 }}>
            <CustomSwitch labelOn="%" labelOff="count" checked={showPercentage} onChange={setShowPercentage} />
            <span className="text-xs text-[#707070] mt-1 text-center">
              Choose Between Raw Duty Counts And Percentage Insights To Understand Site Performance Your Way
            </span>
          </div>
        )}
        <DataGrid
          rows={getFilteredData(transformedOverviewData, ["clientName", "alertness", "geofence", "patrol"])}
          columns={getOverviewColumns(showPercentage, isMonthlyOverview)}
          hideFooter
          disableRowSelectionOnClick
          sx={datagridStyle}
          onRowClick={(params) => handleRowClick(params.row.clientId)}
        />
      </div>
    );
  }
  if (selectedTableView === "attendance") {
    if (isAttendanceOverviewLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading attendance data...</Typography>
        </div>
      );
    }
    if (attendanceOverviewError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Typography color="error">Error loading attendance data</Typography>
        </div>
      );
    }
    // Transform API data to rows for DataGrid matching the API response structure
    const attendanceRows =
      attendanceOverviewData?.data?.clients?.map((item: any, idx: number) => ({
        id: idx + 1,
        clientId: item.clientId,
        clientName: item.clientName,
        favourite: item.favourite ?? false,
        absentCount: item.absentCount ?? 0,
        relacedCount: item.relacedCount ?? 0,
        toReplaceCount: item.toReplaceCount ?? 0,
      })) || [];

    return (
      <div className="w-full h-full">
        {shouldShowStarredHeader && (
          <StarredHeader
            showStarredOnly={showStarredOnly}
            setShowStarredOnly={setShowStarredOnly}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        <DataGrid
          rows={getFilteredData(attendanceRows, ["clientName", "absentCount", "relacedCount", "toReplaceCount"])}
          columns={attendanceColumns}
          hideFooter
          disableRowSelectionOnClick
          sx={datagridStyle}
          onRowClick={(params) => handleRowClick(params.row.clientId)}
        />
      </div>
    );
  }
  if (selectedTableView === "liveiness") {
    if (isLivelinessLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading liveliness alerts...</Typography>
        </div>
      );
    }
    if (livelinessError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Typography color="error">Error loading liveliness alerts</Typography>
        </div>
      );
    }
    return (
      <div className="w-full h-full">
        <DataGrid
          rows={applySearchFilter(transformedLivelinessData, ["guardName", "clientName", "siteName", "alertType"])}
          columns={livelinessColumns}
          hideFooter
          disableRowSelectionOnClick
          rowHeight={80}
          getRowHeight={() => 80}
          sx={livelinessDatagridStyle}
          onRowClick={(params) => handleLivelinessRowClick(params.row.guardId)}
        />
      </div>
    );
  }
  if (selectedTableView === "guards") {
    if (isLateUniformLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading guards data...</Typography>
        </div>
      );
    }
    if (lateUniformError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Typography color="error">Error loading guards data</Typography>
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-white p-4">
        {shouldShowStarredHeader && (
          <StarredHeader
            showStarredOnly={showStarredOnly}
            setShowStarredOnly={setShowStarredOnly}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        <DataGrid
          rows={getFilteredData(transformedGuardsData, ["clientName", "late", "uniform"])}
          columns={guardsColumns}
          hideFooter
          disableRowSelectionOnClick
          sx={guardsDatagridStyle}
          onRowClick={(params) => handleRowClick(params.row.clientId)}
        />
      </div>
    );
  }
  if (selectedTableView === "shifts") {
    if (isShiftPerformanceLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading shifts data...</Typography>
        </div>
      );
    }
    if (shiftPerformanceError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Typography color="error">Error loading shifts data</Typography>
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-white p-4">
        {shouldShowStarredHeader && (
          <StarredHeader
            showStarredOnly={showStarredOnly}
            setShowStarredOnly={setShowStarredOnly}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        <DataGrid
          rows={getFilteredData(transformedShiftsData, ["clientName", "alertness", "geofence", "patrol"])}
          columns={shiftsColumns}
          hideFooter
          disableRowSelectionOnClick
          sx={shiftsDatagridStyle}
          onRowClick={(params) => handleRowClick(params.row.clientId)}
        />
      </div>
    );
  }
  if (selectedTableView === "area-officers") {
    if (isAreaOfficersGuardsLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading area officers data...</Typography>
        </div>
      );
    }
    if (areaOfficersGuardsError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Typography color="error">Error loading area officers data</Typography>
        </div>
      );
    }
    return (
      <div className="w-full h-full">
        <DataGrid
          rows={applySearchFilter(transformedAreaOfficersData, ["name", "assignedArea", "late", "uniform"])}
          columns={areaOfficersColumns}
          hideFooter
          disableRowSelectionOnClick
          sx={areaOfficersDatagridStyle}
          onRowClick={(params) => handleRowClick(params.row.clientId)}
        />
      </div>
    );
  }
  if (selectedTableView === "incidents") {
    return (
      <IncidentReportsView
        incidentReportsData={incidentReportsData}
        isLoading={isIncidentReportsLoading}
        error={incidentReportsError}
      />
    );
  }
  if (selectedTableView === "area-officers-tasks") {
    return (
      <AreaOfficersTasksView
        opAgencyId={opAgencyId}
        areaOfficerTasksData={areaOfficerTasksData}
        isLoading={isAreaOfficerTasksLoading}
        error={areaOfficerTasksError}
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-gray-500">
        {selectedTableView.charAt(0).toUpperCase() + selectedTableView.slice(1)} view coming soon...
      </div>
    </div>
  );
}
