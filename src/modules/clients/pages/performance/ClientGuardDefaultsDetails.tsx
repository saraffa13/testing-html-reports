import {
  useGetAlertnessDefaults,
  useGetAttendanceCount,
  useGetGeofenceActivity,
  useGetLateCount,
  useGetUniformDefaults,
} from "@modules/clients/apis/hooks/useGetClientGuardDefaults";
import { ClientDefaultsDetailsTable } from "@modules/clients/components/ClientDefaultsDetailsTable";
import { CustomDateRangePicker } from "@modules/clients/components/CustomDateRangePicker";
import { useClientContext } from "@modules/clients/context/ClientContext";
import { formatDate, getWeekRange } from "@modules/clients/utils/dateRangeUtils";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CalendarViewMonthOutlinedIcon from "@mui/icons-material/CalendarViewMonthOutlined";
import CalendarViewWeekOutlinedIcon from "@mui/icons-material/CalendarViewWeekOutlined";
import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import { Avatar, Button, Dialog, Menu, MenuItem } from "@mui/material";
import { ShirtIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  type GuardAbsentItems,
  type GuardAlertnessItems,
  type GuardGeofenceItems,
  type GuardLateItems,
  type GuardPatrolItems,
  type GuardUniformItems,
} from "../../columns/GuardsDefaultsListViewColumns";
import {
  AbsentDetails,
  AlertnessDetails,
  GeofenceDetails,
  LateDetails,
  PatrolDetails,
  UniformInspection,
} from "../../components/ClientDefaultsDetailsComponents";
import { getDateRangeForView } from "../../utils/dateRangeUtils";

type ViewType = "day" | "week" | "month" | "custom";
type GuardItems =
  | GuardAbsentItems
  | GuardLateItems
  | GuardUniformItems
  | GuardAlertnessItems
  | GuardGeofenceItems
  | GuardPatrolItems;

export default function ClientGuardDefaultsDetails() {
  const { siteId, clientId } = useParams();
  const [selectedGuard, setSelectedGuard] = useState<GuardItems | null>(null);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dayMenuAnchor, setDayMenuAnchor] = useState<null | HTMLElement>(null);
  const [weekMenuAnchor, setWeekMenuAnchor] = useState<null | HTMLElement>(null);
  const [monthMenuAnchor, setMonthMenuAnchor] = useState<null | HTMLElement>(null);
  const {
    selectedView,
    setSelectedView,
    currentDate,
    setCurrentDate,
    selectedMetric,
    setSelectedMetric,
    clientDetails,
  } = useClientContext();
  const navigate = useNavigate();
  const currentFormatted = formatDate(currentDate);
  const todayString = `${currentFormatted.dayName} ${currentFormatted.day}/${currentFormatted.month}/${currentFormatted.year}`;
  const weekString = getWeekRange(currentDate);
  const monthString = `${currentFormatted.monthName} ${currentFormatted.year}`;

  const getButtonStyles = (isSelected: boolean) => ({
    bgcolor: isSelected ? "#2A77D5" : "white",
    color: isSelected ? "white" : "#2A77D5",
    border: "1px solid #2A77D5",
    "&:hover": {
      bgcolor: isSelected ? "#1E5A96" : "#E3F2FD",
    },
  });

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
    if (view === "custom") {
      setIsDatePickerOpen(true);
    }
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setDayMenuAnchor(null);
    setWeekMenuAnchor(null);
    setMonthMenuAnchor(null);
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setIsDatePickerOpen(false);
  };

  const handleDatePickerCancel = () => {
    setIsDatePickerOpen(false);
  };

  const generateDateOptions = (type: "day" | "week" | "month") => {
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
    } else if (type === "week") {
      options.push({
        date: new Date(today),
        label: getWeekRange(today),
      });
      for (let i = 1; i <= 12; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i * 7);
        options.push({
          date,
          label: getWeekRange(date),
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
    "&:hover": {
      bgcolor: selectedMetric === metric ? "#1E5A96" : "#E3F2FD",
    },
    "& .MuiSvgIcon-root": {
      color: selectedMetric === metric ? "white" : "#2A77D5",
    },
    "& .lucide": {
      color: selectedMetric === metric ? "white" : "#2A77D5",
    },
  });

  useEffect(() => {
    console.log("Selected Guard:", selectedGuard, "Selected Metric:", selectedMetric);
  }, [selectedGuard, selectedMetric]);
  const renderDetailsComponent = () => {
    if (!selectedGuard) return null;
    switch (selectedMetric) {
      case "absent":
        return <AbsentDetails guardData={selectedGuard as GuardAbsentItems} />;
      case "late":
        return <LateDetails guardData={selectedGuard as GuardLateItems} />;
      case "uniform":
        return (
          <UniformInspection
            guardPhoto={(selectedGuard as GuardUniformItems).photo}
            guardName={(selectedGuard as GuardUniformItems).name}
          />
        );
      case "alertness":
        const alertnessGuard = selectedGuard as GuardAlertnessItems;
        const missedTimes = alertnessGuard.checkedAt
          ? [
              {
                id: 1,
                number: 1,
                time: new Date(alertnessGuard.checkedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
              },
            ]
          : [];
        return <AlertnessDetails guardData={alertnessGuard} missedTimes={missedTimes} />;
      case "geofence":
        return (
          <GeofenceDetails
            guardData={selectedGuard as GuardGeofenceItems}
            violations={[
              {
                id: 1,
                number: 1,
                entryTime: "08:40 AM",
                exitTime: "08:58 AM",
                duration: "18 Min",
                aoAction: "Approved",
                status: "approved",
                viewReason: "View Task",
              },
              {
                id: 2,
                number: 2,
                entryTime: "02:24 PM",
                exitTime: "02:34 PM",
                duration: "10 Min",
                aoAction: "Pending",
                status: "pending",
                viewReason: "View Task",
              },
            ]}
          />
        );
      case "patrol":
        return (
          <PatrolDetails
            guardData={selectedGuard as GuardPatrolItems}
            patrolData={[
              {
                id: 1,
                startTime: "08:00 AM",
                patrolRoute: "Parking",
                patrolRound: "01",
                checkPoint: "01",
                error: "Photo Not Taken",
                errorType: "photo",
              },
              {
                id: 2,
                startTime: "10:20 AM",
                patrolRoute: "Basement",
                patrolRound: "02",
                checkPoint: "03",
                error: "Patrol Unfinished",
                errorType: "unfinished",
              },
              {
                id: 3,
                startTime: "01:00 PM",
                patrolRoute: "Parking",
                patrolRound: "02",
                checkPoint: "-",
                error: "Patrol Missed",
                errorType: "missed",
              },
            ]}
          />
        );
      default:
        return null;
    }
  };

  const dateRange = useMemo(() => {
    if (selectedView === "custom" && customStartDate && customEndDate) {
      return getDateRangeForView("custom", currentDate, customStartDate, customEndDate);
    }
    return getDateRangeForView(selectedView, currentDate);
  }, [selectedView, currentDate, customStartDate, customEndDate]);

  const { data: attendanceData } = useGetAttendanceCount(clientId || "", dateRange.startDate, dateRange.endDate);
  const { data: uniformData } = useGetUniformDefaults(clientId || "", dateRange.startDate, dateRange.endDate);
  const { data: alertnessData } = useGetAlertnessDefaults(clientId || "", dateRange.startDate, dateRange.endDate);
  const { data: lateData } = useGetLateCount(clientId || "", dateRange.startDate, dateRange.endDate);
  const { data: geofenceData } = useGetGeofenceActivity(clientId || "", dateRange.startDate, dateRange.endDate);

  const absentGuards = useMemo(() => {
    if (!attendanceData?.data?.siteBreakdown || !siteId) return [];
    const siteData = attendanceData.data.siteBreakdown.find((site: any) => site.siteId === siteId);
    if (!siteData?.absentGuardDetails) return [];

    return siteData.absentGuardDetails.map((guard: any) => ({
      id: guard.guardId,
      name: guard.guardName,
      phone: "N/A",
      photo: guard.guardPhoto || "/placeholder-avatar.png",
      dutyTime: guard.absentDuties[0].scheduledStartTime
        ? `${new Date(guard.absentDuties[0].scheduledStartTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${new Date(guard.absentDuties[0].scheduledEndTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : "N/A",
      absentDays: guard.totalAbsences,
      lastAbsentDate: guard.absentDuties[guard.absentDuties.length - 1]?.dutyDate || "",
      reason: guard.absentDuties[guard.absentDuties.length - 1]?.notes || "Not specified",
    })) as GuardAbsentItems[];
  }, [attendanceData, siteId]);

  const uniformGuards = useMemo(() => {
    if (!uniformData?.data?.sitesWithDefaults || !siteId) return [];
    const siteData = uniformData.data.sitesWithDefaults.find((site: any) => site.siteId === siteId);
    if (!siteData) return [];
    return siteData.defaultsByDate.flatMap((dayData: any) =>
      (dayData.guards ?? []).map((guard: any) => ({ ...guard, id: guard.guardId }))
    );
  }, [uniformData, siteId]);

  const alertnessGuards = useMemo(() => {
    if (!alertnessData?.data?.sitesWithIssues || !siteId) return [];
    const siteData = alertnessData.data.sitesWithIssues.find((site: any) => site.siteId === siteId);
    if (!siteData) return [];
    return siteData.defaultsByDate.flatMap((dayData: any) =>
      (dayData.guards ?? []).map((guard: any) => ({ ...guard, id: guard.guardId }))
    );
  }, [alertnessData, siteId]);

  const lateGuards = useMemo(() => {
    if (!lateData?.data?.lateGuardsByDate || !siteId) return [];
    return lateData.data.lateGuardsByDate
      .filter((dayData: any) => dayData.siteId === siteId)
      .flatMap((dayData: any) => dayData.guards.map((guard: any) => ({ ...guard, id: guard.guardId })));
  }, [lateData, siteId]);

  const geofenceGuards = useMemo(() => {
    if (!geofenceData?.data?.sitesWithGeofenceActivity || !siteId) return [];
    const siteData = geofenceData.data.sitesWithGeofenceActivity.find((site: any) => site.siteId === siteId);
    if (!siteData || !siteData.guards) return [];
    return siteData.guards.map((guard: any) => ({
      ...guard,
      id: guard.guardId,
      photo: guard.photo,
      count: guard.sessions ? guard.sessions.length : 0,
    }));
  }, [geofenceData, siteId]);

  const patrolGuards = useMemo(() => {
    if (!geofenceData?.data?.sitesWithGeofenceActivity || !siteId) return [];
    const siteData = geofenceData.data.sitesWithGeofenceActivity.find((site: any) => site.siteId === siteId);
    if (!siteData || !siteData.guards) return [];
    return siteData.guards.map((guard: any) => ({
      ...guard,
      id: guard.guardId,
      photo: guard.photo,
      count: guard.sessions ? guard.sessions.length : 0,
    }));
  }, [geofenceData, siteId]);
  const metrics = useMemo(() => {
    return {
      absent: absentGuards.length,
      late: lateGuards.length,
      uniform: uniformGuards.length,
      alertness: alertnessGuards.length,
      geofence: geofenceGuards.length,
      patrol: patrolGuards.length,
    };
  }, [absentGuards, lateGuards, uniformGuards, alertnessGuards, geofenceGuards, patrolGuards]);
  return (
    <div className="flex flex-col">
      <Dialog open={isDatePickerOpen} onClose={handleDatePickerCancel}>
        <CustomDateRangePicker
          onDateRangeChange={handleDateRangeChange}
          onCancel={handleDatePickerCancel}
          initialStartDate={customStartDate || undefined}
          initialEndDate={customEndDate || undefined}
        />
      </Dialog>
      <div className="flex flex-row justify-between">
        <div className="inline-flex gap-2">
          <ArrowBackIcon onClick={() => navigate(-1)} className="cursor-pointer" />

          <h2 className="font-semibold">
            {clientDetails?.clientName} - {clientDetails?.sites.find((site) => site.id === siteId)?.siteName}
          </h2>
        </div>

        <div className="flex flex-row gap-4">
          <Button
            variant="outlined"
            size="small"
            sx={getButtonStyles(selectedView === "day")}
            onClick={(event) => {
              handleViewChange("day");
              setDayMenuAnchor(event.currentTarget);
            }}
            endIcon={<KeyboardArrowDownIcon />}
          >
            <EventOutlinedIcon sx={{ mr: 1 }} />
            {selectedView === "day" ? `DAY | ${todayString}` : "DAY"}
          </Button>
          <Menu anchorEl={dayMenuAnchor} open={Boolean(dayMenuAnchor)} onClose={() => setDayMenuAnchor(null)}>
            {generateDateOptions("day").map((option, index) => (
              <MenuItem key={index} onClick={() => handleDateSelect(option.date)}>
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          <Button
            variant="outlined"
            size="small"
            sx={getButtonStyles(selectedView === "week")}
            onClick={(event) => {
              handleViewChange("week");
              setWeekMenuAnchor(event.currentTarget);
            }}
            endIcon={<KeyboardArrowDownIcon />}
          >
            <CalendarViewWeekOutlinedIcon sx={{ mr: 1 }} />
            {selectedView === "week" ? `WEEK | ${weekString}` : "WEEK"}
          </Button>
          <Menu anchorEl={weekMenuAnchor} open={Boolean(weekMenuAnchor)} onClose={() => setWeekMenuAnchor(null)}>
            {generateDateOptions("week").map((option, index) => (
              <MenuItem key={index} onClick={() => handleDateSelect(option.date)}>
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          <Button
            variant="outlined"
            size="small"
            sx={getButtonStyles(selectedView === "month")}
            onClick={(event) => {
              handleViewChange("month");
              setMonthMenuAnchor(event.currentTarget);
            }}
            endIcon={<KeyboardArrowDownIcon />}
          >
            <CalendarViewMonthOutlinedIcon sx={{ mr: 1 }} />
            {selectedView === "month" ? `MONTH | ${monthString}` : "MONTH"}
          </Button>
          <Menu anchorEl={monthMenuAnchor} open={Boolean(monthMenuAnchor)} onClose={() => setMonthMenuAnchor(null)}>
            {generateDateOptions("month").map((option, index) => (
              <MenuItem key={index} onClick={() => handleDateSelect(option.date)}>
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          <Button
            variant="outlined"
            size="small"
            sx={getButtonStyles(selectedView === "custom")}
            onClick={() => handleViewChange("custom")}
          >
            <CalendarMonthOutlinedIcon sx={{ mr: 1 }} />
            CUSTOM
          </Button>
        </div>
      </div>

      <div className="flex flex-col bg-[#F7F7F7] p-4 rounded-lg mt-4 gap-y-4">
        <div className="flex flex-row gap-4">
          <div className="bg-white p-4 rounded-lg w-[160px] h-[160px] flex items-center justify-center">
            <Avatar src={clientDetails?.clientLogo ?? undefined} alt="Client Logo" sx={{ width: 100, height: 100 }} />
          </div>

          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg min-w-[20vw]">
            <span className="font-semibold">Details</span>
            <div className="grid grid-cols-2 gap-x-2">
              <span className="text-[#A3A3A3]">Client Id</span>
              <span>{clientDetails?.id}</span>
              <span className="text-[#A3A3A3]">Client</span>
              <span>{clientDetails?.clientName}</span>
              <span className="text-[#A3A3A3]">Site</span>
              <span>{clientDetails?.sites.find((site) => site.id === siteId)?.siteName}</span>
              <span className="text-[#A3A3A3]">Site ID</span>
              <span>{siteId}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg min-w-[20vw]">
            <span className="font-semibold">Area officer</span>
            <div className="grid grid-cols-2 gap-x-2">
              <span className="text-[#A3A3A3]">Name</span>
              <span>{clientDetails?.sites.find((site) => site.id === siteId)?.areaOfficerId[0]}</span>
              <span className="text-[#A3A3A3]">Area</span>
              <span>{clientDetails?.sites.find((site) => site.id === siteId)?.city}</span>
              <span className="text-[#A3A3A3]">Phone</span>
              <span>{clientDetails?.sites.find((site) => site.id === siteId)?.siteContactPhone}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row">
          <div className="bg-white p-4 w-fit rounded-lg">
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

            <ClientDefaultsDetailsTable
              selectedMetric={selectedMetric}
              setSelectedGuard={setSelectedGuard}
              absentGuards={absentGuards}
              uniformGuards={uniformGuards}
              alertnessGuards={alertnessGuards}
              lateGuards={lateGuards}
              geofenceGuards={geofenceGuards}
              patrolGuards={patrolGuards}
            />
          </div>

          {renderDetailsComponent()}
        </div>
      </div>
    </div>
  );
}
