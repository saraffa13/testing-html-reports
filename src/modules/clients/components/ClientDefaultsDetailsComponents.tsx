import SignalCellularAltOutlinedIcon from "@mui/icons-material/SignalCellularAltOutlined";
import UnfoldMoreOutlinedIcon from "@mui/icons-material/UnfoldMoreOutlined";
import { Avatar, Box, Button } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { ArrowDown, Clock, HardHat, MapPin, Shirt } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  AbsentColumnsTwo,
  guardAbsentItemsTwo,
  type GuardAbsentItems,
  type GuardLateItems,
} from "../columns/GuardsDefaultsListViewColumns";
import { datagridStyle } from "../lib/datagridStyle";
import GeofenceBreachModal from "./modals/GeofenceBreachReasonModal";

export const AbsentDetails = ({ guardData }: { guardData: GuardAbsentItems }) => {
  // if (guardData?.replacedWith === "") {
  if (true) {
    console.log("Guard Data:", guardData);
    return (
      <div className="flex flex-col gap-4 p-4 items-center justify-center bg-white border-l border-gray-200 flex-1">
        <span className="text-lg">LIST OF AVAILABLE GUARDS</span>
        <Box
          sx={{
            width: "fit",
            flexGrow: 1,
            minHeight: 400,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DataGrid
            rows={guardAbsentItemsTwo}
            columns={AbsentColumnsTwo}
            hideFooter={true}
            disableColumnMenu
            disableRowSelectionOnClick
            sx={datagridStyle}
          />
        </Box>
      </div>
    );
  }
  if (guardData?.replacedWith) {
    return (
      <div className="bg-white flex flex-col gap-4 p-4 items-center border-l border-gray-200">
        <span className="font-semibold text-lg">Details</span>
        <div className="flex flex-col bg-[#F1F7FE] p-2 rounded-lg gap-2">
          <span className="font-semibold text-[#3B3B3B] text-sm">Absent Guard</span>
          <div className="flex flex-row gap-4">
            <Avatar variant="square" sx={{ width: 70, height: 70, borderRadius: "8px" }} />
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span className="text-[#A3A3A3]">ID</span>
              <span>12445</span>
              <span className="text-[#A3A3A3]">Name</span>
              <span>Ramendra Sharma</span>
              <span className="text-[#A3A3A3]">Phone Number</span>
              <span>+91 9999 333333</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span className="text-[#A3A3A3]">Designation</span>
              <span>Security Guard</span>
              <span className="text-[#A3A3A3]">Post</span>
              <span>Entrance Gate</span>
              <span className="text-[#A3A3A3]">Shift</span>
              <span>8:00 PM - 8:00 AM</span>
            </div>
          </div>
          <Button variant="contained" size="small" sx={{ whiteSpace: "nowrap", width: "fit-content" }}>
            <SignalCellularAltOutlinedIcon /> VIEW PERFORMANCE
          </Button>
        </div>
        <div className="flex flex-col bg-[#F7F7F7] p-2 rounded-lg gap-2 w-full">
          <span className="font-semibold text-[#3B3B3B] text-sm">Replacement</span>
          <div className="flex flex-row gap-4 w-full">
            <Avatar variant="square" sx={{ width: 140, height: 140, borderRadius: "8px" }} />
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span className="text-[#A3A3A3]">ID</span>
              <span>12445</span>
              <span className="text-[#A3A3A3]">Name</span>
              <span>Ramendra Sharma</span>
              <span className="text-[#A3A3A3]">Phone Number</span>
              <span>+91 9999 333333</span>
              <span className="text-[#A3A3A3]">Designation</span>
              <span>Security Guard</span>
              <span className="text-[#A3A3A3]">Client</span>
              <span>Axis Bank</span>
              <span className="text-[#A3A3A3]">Site</span>
              <span>Nehru Place</span>
              <span className="text-[#A3A3A3]">Post</span>
              <span>Entrance Gate</span>
              <span className="text-[#A3A3A3]">Shift</span>
              <span>8:00 PM - 8:00 AM</span>
              <span className="text-[#A3A3A3]">Reporting Officer</span>
              <span>Sachin Sharma</span>
              <span className="text-[#A3A3A3]">Phone Number</span>
              <span>+91 9999 99999</span>
            </div>
          </div>
          <Button variant="contained" size="small" sx={{ whiteSpace: "nowrap", width: "fit-content" }}>
            <SignalCellularAltOutlinedIcon /> VIEW PERFORMANCE
          </Button>
        </div>
      </div>
    );
  }
};

const MAX_LATE_MINUTES = 60;

export const LateDetails = ({ guardData }: { guardData: GuardLateItems }) => {
  const displayDutyTime = guardData?.scheduledStartTime;
  const checkInTime = guardData?.acutalCheckInTime
    ? new Date(guardData.acutalCheckInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    : "-";
  const displayLateBy = guardData?.lateMinutes;

  useEffect(() => {
    console.log("Guard Data:", guardData);
  }, [guardData]);

  const calculatePercentage = (lateTime: number): number => {
    console.log("Display Duty Time:", displayDutyTime);
    console.log("Display Late By:", displayLateBy);
    console.log("Late Time:", lateTime);
    const minutes = lateTime;
    return Math.min((minutes / MAX_LATE_MINUTES) * 100, 100);
  };

  const displayPercentage = calculatePercentage(displayLateBy);

  useEffect(() => {
    console.log("Display Duty Time:", displayPercentage);
  }, [displayDutyTime, displayLateBy]);
  const data = [
    { name: "completed", value: displayPercentage },
    { name: "remaining", value: 100 - displayPercentage },
  ];

  const COLORS = ["#ef4444", "#e5e7eb"];

  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 min-h-screen w-full">
      <h1 className="text-xl font-semibold text-gray-800 mb-12">DETAILS</h1>

      <div className="relative mb-16">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              cx={100}
              cy={100}
              startAngle={90}
              endAngle={450}
              innerRadius={70}
              outerRadius={90}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 ml-2 mt-2 flex flex-col items-center justify-center">
          <Clock className="w-8 h-8 text-gray-600 mb-2" />
          <span className="text-lg font-medium text-gray-600">LATE</span>
        </div>
      </div>

      <div className="flex">
        <div className="">
          <h3 className="text-sm font-medium text-gray-600 mb-4 tracking-wide ml-4">CHECK IN TIME</h3>
          <div className="bg-white px-4 py-6 rounded-l-lg shadow pr-36">
            <span className="text-lg text-gray-800">{checkInTime}</span>
          </div>
        </div>

        <div className="">
          <h3 className="text-sm font-medium text-gray-600 mb-4 tracking-wide ml-4">LATE BY</h3>
          <div className="bg-white px-4 py-6 rounded-r-lg shadow">
            <span className="text-lg text-gray-800">{displayLateBy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UniformError {
  id: number;
  icon: React.ReactNode;
  error: string;
  action: string;
  status: "approved" | "disapproved";
}

const errorsColumns: GridColDef[] = [
  {
    field: "icon",
    headerName: "ICON",
    width: 60,
    renderCell: (params) => <div className="flex items-center justify-center h-full w-full">{params.value}</div>,
  },
  {
    field: "error",
    headerName: "ERROR",
    minWidth: 140,
  },
  {
    field: "action",
    headerName: "AO ACTION",
    width: 120,
  },
];

interface UniformInspectionProps {
  guardPhoto?: string;
  guardName?: string;
  topErrors?: UniformError[];
  bottomErrors?: UniformError[];
}

export const UniformInspection = ({
  guardPhoto = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  guardName = "John Smith",
  topErrors = [
    {
      id: 1,
      icon: <HardHat className="w-6 h-6 text-[#84842e]" />,
      error: "CAP MISSING",
      action: "Approved",
      status: "approved",
    },
    {
      id: 2,
      icon: <Shirt className="w-6 h-6 text-[#84842e]" />,
      error: "SHIRT INCORRECT",
      action: "Disapproved",
      status: "disapproved",
    },
  ],
  bottomErrors = [],
}: UniformInspectionProps) => {
  const [activeTab, setActiveTab] = useState<"top" | "bottom">("top");

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen border-l border-gray-200">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("top")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors w-full h-fit justify-center ${
            activeTab === "top" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          <Shirt className="w-4 h-4" />
          TOP ({topErrors.length.toString().padStart(2, "0")})
        </button>
        <button
          onClick={() => setActiveTab("bottom")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors w-full h-fit justify-center ${
            activeTab === "bottom" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          <ArrowDown className="w-4 h-4" />
          BOTTOM ({bottomErrors.length.toString().padStart(2, "0")})
        </button>
      </div>

      <div className="flex gap-6">
        <div className="relative">
          <div className="w-72 h-96 rounded-2xl overflow-hidden shadow-lg">
            <img src={guardPhoto} alt={guardName} className="w-full h-full object-cover" />

            {activeTab === "top" && topErrors.length > 0 && (
              <>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-[#57575799] rounded-full flex items-center justify-center shadow-lg">
                    <HardHat className="w-6 h-6 text-white" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#498ADA] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-20 left-4">
                  <div className="w-12 h-12 bg-[#57575799] rounded-full flex items-center justify-center shadow-lg">
                    <Shirt className="w-6 h-6 text-white" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#498ADA] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <Box
          sx={{
            minHeight: 400,
            minWidth: 0,
          }}
        >
          <DataGrid
            rows={topErrors}
            columns={errorsColumns}
            hideFooter={true}
            disableRowSelectionOnClick
            disableColumnMenu
            sx={datagridStyle}
          />
        </Box>
      </div>
    </div>
  );
};

interface MissedTime {
  id: number;
  number: number;
  time: string;
}

interface AlertnessDetailsProps {
  guardData?: {
    id: number;
    name: string;
    photo: string;
    dutyTime: string;
    missedNo: number;
  };
  missedTimes?: MissedTime[];
  dutyStartTime?: string;
}

const missedTimesColumns: GridColDef[] = [
  {
    field: "number",
    headerName: "NUMBER",
    width: 100,
    align: "center" as const,
    renderCell: (params) => <span className="text-lg font-semibold text-gray-600">{params.value}</span>,
  },
  {
    field: "time",
    headerName: "MISSED TIME",
    minWidth: 300,
    renderCell: (params) => <span className="text-lg text-gray-800">{params.value}</span>,
  },
];

const DUTY_HOURS = 8;

export const AlertnessDetails = ({
  // guardData,
  missedTimes,
  dutyStartTime = "08:00 AM",
}: AlertnessDetailsProps) => {
  const timeToDutyHour = (timeStr: string, startTime: string): number => {
    const parseTime = (time: string): number => {
      const [timepart, period] = time.split(" ");
      const [hours, minutes] = timepart.split(":").map(Number);

      let totalHours = hours;
      if (period === "PM" && hours !== 12) totalHours += 12;
      if (period === "AM" && hours === 12) totalHours = 0;

      return totalHours + minutes / 60;
    };

    const startHour = parseTime(startTime);
    const currentHour = parseTime(timeStr);

    let dutyHour = currentHour - startHour;

    if (dutyHour < 0) {
      dutyHour += 24;
    }

    return dutyHour % DUTY_HOURS;
  };

  const dutyHourToAngle = (dutyHour: number): number => {
    return (dutyHour / DUTY_HOURS) * 360;
  };

  const angleToPosition = (angle: number, radius: number) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  return (
    <div className="flex flex-col items-center p-8 bg-white min-h-screen w-full border-l border-gray-200">
      <h1 className="text-xl font-semibold text-gray-800 mb-12">DETAILS</h1>

      <div className="relative mb-16">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="85" stroke="#e5e7eb" strokeWidth="24" fill="none" />

          <line x1="100" y1="30" x2="100" y2="2" stroke="#374151" strokeWidth="4" strokeLinecap="round" />

          {missedTimes &&
            missedTimes.map((missed) => {
              const dutyHour = timeToDutyHour(missed.time, dutyStartTime);
              const angle = dutyHourToAngle(dutyHour);
              const pos = angleToPosition(angle, 85);

              return (
                <line
                  key={missed.id}
                  x1={100 + pos.x * 0.8}
                  y1={100 + pos.y * 0.8}
                  x2={100 + pos.x * 1.1}
                  y2={100 + pos.y * 1.1}
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            })}

          {Array.from({ length: DUTY_HOURS }, (_, i) => {
            const angle = dutyHourToAngle(i);
            const pos = angleToPosition(angle, 85);
            return (
              <line
                key={`hour-${i}`}
                x1={100 + pos.x * 0.9}
                y1={100 + pos.y * 0.9}
                x2={100 + pos.x * 0.95}
                y2={100 + pos.y * 0.95}
                stroke="#d1d5db"
                strokeWidth="1"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <img
            src="/client_icons/alertness.svg"
            alt="Alertness Icon"
            className="w-8 h-8"
            style={{
              filter: "invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0) contrast(100%)",
            }}
          />
          <span className="text-lg font-medium text-gray-600">ALERTNESS</span>
        </div>
      </div>

      {missedTimes && missedTimes.length > 0 && (
        <div className="w-full max-w-2xl flex justify-center">
          <Box
            sx={{
              minHeight: 400,
              minWidth: 0,
            }}
          >
            <DataGrid
              rows={missedTimes}
              columns={missedTimesColumns}
              hideFooter={true}
              disableRowSelectionOnClick
              disableColumnMenu
              sx={datagridStyle}
            />
          </Box>
        </div>
      )}
    </div>
  );
};

interface GeofenceViolation {
  id: number;
  number: number;
  entryTime: string;
  exitTime: string;
  duration: string;
  aoAction: string;
  status: "approved" | "pending" | "disapproved";
  viewReason: string;
}

interface GeofenceDetailsProps {
  guardData?: {
    id: number;
    name: string;
    photo: string;
    dutyTime: string;
    count: number;
    sessions?: Array<{
      number: number;
      entryTime: string;
      exitTime: string;
      duration: string;
      aoAction: string;
      viewReason?: string;
    }>;
  };
  violations?: GeofenceViolation[];
  dutyStartTime?: string;
}

const geofenceColumns = [
  {
    field: "number",
    headerName: "NUMBER",
    width: 60,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params: any) => <span className="text-lg font-semibold text-gray-600">{params.value}</span>,
  },
  {
    field: "entryTime",
    headerName: "ENTRY TIME",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params: any) => <span className="text-lg text-gray-800">{params.value}</span>,
  },
  {
    field: "exitTime",
    headerName: "EXIT TIME",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params: any) => <span className="text-lg text-gray-800">{params.value}</span>,
  },
  {
    field: "duration",
    headerName: "DURATION",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params: any) => <span className="text-lg text-gray-800">{params.value}</span>,
  },
  {
    field: "aoAction",
    headerName: "AO ACTION",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "viewReason",
    headerName: "VIEW REASON",
    width: 150,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: () => {
      const [modal, setModal] = useState(false);
      return (
        <div>
          <div className="flex w-full h-full items-center justify-center">
            <Button onClick={() => setModal(true)} variant="contained">
              <UnfoldMoreOutlinedIcon className="w-4 h-4 rotate-45" />
              <span className="text-sm font-medium">TASK</span>
            </Button>
          </div>
          <GeofenceBreachModal open={modal} onClose={() => setModal(false)} viewMode="incident" />
        </div>
      );
    },
  },
];

export const GeofenceDetails = ({ guardData, violations = [] }: GeofenceDetailsProps) => {
  // Use session data from guardData if available, otherwise fall back to violations prop
  const sessionData = guardData?.sessions || violations;

  // Convert session data to the expected format if needed
  const formattedViolations = sessionData.map((session: any, index: number) => ({
    id: session.id || index + 1,
    number: session.number || index + 1,
    entryTime: session.entryTime,
    exitTime: session.exitTime,
    duration: session.duration,
    aoAction: session.aoAction,
    status:
      session.aoAction?.toLowerCase() === "approved"
        ? ("approved" as const)
        : session.aoAction?.toLowerCase() === "disapproved"
          ? ("disapproved" as const)
          : ("pending" as const),
    viewReason: session.viewReason || "View Task",
  }));

  const timeToMinutes = (timeStr: string): number => {
    // Handle 24-hour format (HH:MM)
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getDutyDurationMinutes = (dutyTime: string): number => {
    // Parse duty time like "08:00 - 20:00"
    const [startTime, endTime] = dutyTime.split(" - ");
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Handle overnight shifts
    if (endMinutes <= startMinutes) {
      return 24 * 60 - startMinutes + endMinutes;
    }

    return endMinutes - startMinutes;
  };

  const getMinutesFromDutyStart = (timeStr: string, dutyTime: string): number => {
    const [startTime] = dutyTime.split(" - ");
    const startMinutes = timeToMinutes(startTime);
    const currentMinutes = timeToMinutes(timeStr);

    let minutesFromStart = currentMinutes - startMinutes;

    // Handle overnight case
    if (minutesFromStart < 0) {
      minutesFromStart += 24 * 60;
    }

    return minutesFromStart;
  };

  const minutesToAngle = (minutes: number, totalDutyMinutes: number): number => {
    return (minutes / totalDutyMinutes) * 360;
  };

  const angleToPosition = (angle: number, radius: number) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  const createViolationSegments = () => {
    if (!guardData?.dutyTime) return [];

    const totalDutyMinutes = getDutyDurationMinutes(guardData.dutyTime);

    return formattedViolations.map((session) => {
      const entryMinutes = getMinutesFromDutyStart(session.entryTime, guardData.dutyTime);
      const exitMinutes = getMinutesFromDutyStart(session.exitTime, guardData.dutyTime);

      const startAngle = minutesToAngle(entryMinutes, totalDutyMinutes) - 90; // -90 to start from top
      const endAngle = minutesToAngle(exitMinutes, totalDutyMinutes) - 90;

      const radius = 85;
      const strokeWidth = 24;

      // Calculate arc direction - sessions can span across different times
      let sweepFlag = 1; // Default to clockwise
      let largeArcFlag = 0;

      // If exit time is before entry time, it means session spans across day boundary
      if (exitMinutes < entryMinutes) {
        largeArcFlag = 1;
      } else if (Math.abs(endAngle - startAngle) > 180) {
        largeArcFlag = 1;
      }

      const x1 = 100 + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = 100 + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = 100 + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = 100 + radius * Math.sin((endAngle * Math.PI) / 180);

      return (
        <path
          key={session.id}
          d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`}
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-center p-8 bg-white min-h-screen w-full border-l border-gray-200">
      <h1 className="text-xl font-semibold text-gray-800 mb-12">DETAILS</h1>

      <div className="relative mb-16">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="85" stroke="#e5e7eb" strokeWidth="24" fill="none" />

          {createViolationSegments()}

          <line x1="100" y1="30" x2="100" y2="2" stroke="#374151" strokeWidth="4" strokeLinecap="round" />

          {/* Hour markers - show 12 markers around the circle representing duty time segments */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = i * 30 - 90; // 30 degrees apart, starting from top
            const pos = angleToPosition(angle, 85);
            return (
              <line
                key={`hour-${i}`}
                x1={100 + pos.x * 0.9}
                y1={100 + pos.y * 0.9}
                x2={100 + pos.x * 0.95}
                y2={100 + pos.y * 0.95}
                stroke="#d1d5db"
                strokeWidth="1"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <MapPin className="w-8 h-8 text-gray-600 mb-2" />
          <span className="text-lg font-medium text-gray-600">GEOFENCE</span>
        </div>
      </div>

      {formattedViolations.length > 0 && (
        <div className="w-full max-w-2xl flex justify-center">
          <Box
            sx={{
              minHeight: 400,
              minWidth: 0,
            }}
          >
            <DataGrid
              rows={formattedViolations}
              columns={geofenceColumns}
              hideFooter={true}
              disableRowSelectionOnClick
              disableColumnMenu
              sx={datagridStyle}
            />
          </Box>
        </div>
      )}
    </div>
  );
};

import { AlertCircle, Camera, X } from "lucide-react";

interface PatrolData {
  id: number;
  startTime: string;
  patrolRoute: string;
  patrolRound: string;
  checkPoint: string;
  error: string;
  errorType: "photo" | "unfinished" | "missed";
}

interface PatrolDetailsProps {
  guardData?: {
    id: number;
    name: string;
    photo: string;
    dutyTime: string;
    count: number;
  };
  patrolData?: PatrolData[];
}
const getErrorIcon = (errorType: string) => {
  switch (errorType) {
    case "photo":
      return <Camera className="w-5 h-5 text-red-500" />;
    case "unfinished":
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case "missed":
      return <X className="w-5 h-5 text-red-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-red-500" />;
  }
};
const patrolColumns = [
  {
    field: "startTime",
    headerName: "START TIME",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "patrolRoute",
    headerName: "PATROL ROUTE",
    width: 110,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "patrolRound",
    headerName: "PATROL ROUND",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "checkPoint",
    headerName: "CHECK POINT",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "error",
    headerName: "ERROR",
    width: 180,
    headerAlign: "left" as const,
    align: "left" as const,
    renderCell: (params: { row: PatrolData }) => (
      <div className="flex items-center gap-2">
        {getErrorIcon(params.row.errorType)}
        <span className="text-gray-800">{params.row.error}</span>
      </div>
    ),
  },
];

export const PatrolDetails = ({
  guardData,
  patrolData = [
    {
      id: 1,
      startTime: "08:00 AM",
      patrolRoute: "Parking",
      patrolRound: "01",
      checkPoint: "01",
      error: "Photo Not Taken",
      errorType: "photo" as const,
    },
    {
      id: 2,
      startTime: "10:20 AM",
      patrolRoute: "Basement",
      patrolRound: "02",
      checkPoint: "03",
      error: "Patrol Unfinished",
      errorType: "unfinished" as const,
    },
    {
      id: 3,
      startTime: "01:00 PM",
      patrolRoute: "Parking",
      patrolRound: "02",
      checkPoint: "-",
      error: "Patrol Missed",
      errorType: "missed" as const,
    },
  ],
}: PatrolDetailsProps) => {
  return (
    <div className="flex flex-col items-center p-8 bg-white min-h-screen w-full border-l border-gray-200">
      <h1 className="text-xl font-semibold text-gray-800 mb-12">DETAILS</h1>

      {guardData && (
        <div className="mb-8 text-center">
          <h2 className="text-xl font-medium text-gray-700">{guardData.name}</h2>
          <p className="text-sm text-gray-500">Guard ID: {guardData.id}</p>
        </div>
      )}

      <Box
        sx={{
          minHeight: 400,
          minWidth: 0,
          width: "fit-content",
        }}
      >
        <DataGrid
          rows={patrolData}
          columns={patrolColumns}
          hideFooter={true}
          disableRowSelectionOnClick
          disableColumnMenu
          sx={datagridStyle}
        />
      </Box>
    </div>
  );
};
