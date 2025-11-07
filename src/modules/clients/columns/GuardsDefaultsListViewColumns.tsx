import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Avatar, Button } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReplaceModal } from "../components/modals/ReplaceModal";

interface GuardDefaultsItems {
  id: number;
  name: string;
  date: string;
  guardCount: number;
}

export const guardDefaultsItems: GuardDefaultsItems[] = [
  { id: 1, name: "Nehru Place", date: "17/01/25", guardCount: 10 },
  { id: 2, name: "Navjeevan Vihar", date: "20/01/25", guardCount: 8 },
  { id: 3, name: "GK2", date: "25/01/25", guardCount: 5 },
];

export const GuardDefaultsColumns: GridColDef[] = [
  {
    field: "id",
    headerName: "SITE ID",
    flex: 0.5,
    minWidth: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "name",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 150,
    headerAlign: "left" as const,
    align: "left" as const,
    renderCell: (params) => {
      const { clientId } = useParams();
      const navigate = useNavigate();
      const siteName = params.value;
      return (
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/clients/${clientId}/performance/guard-defaults/${params.row.id}`)}
        >
          {siteName}
        </div>
      );
    },
  },
  {
    field: "date",
    headerName: "DATE",
    flex: 0.7,
    minWidth: 120,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "guardCount",
    headerName: "GUARD COUNT",
    flex: 0.8,
    minWidth: 130,
    headerAlign: "center" as const,
    align: "center" as const,
  },
];

export interface GuardAbsentItems {
  id: number;
  name: string;
  photo: string;
  dutyTime: string;
  replacedWith?: string;
}

export const guardAbsentItems: GuardAbsentItems[] = [
  {
    id: 1,
    name: "John Doe",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "08:00AM",
    replacedWith: "",
  },
  {
    id: 2,
    name: "Alice Johnson",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "08:00AM",
    replacedWith: "",
  },
  {
    id: 3,
    name: "Charlie White",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "08:00AM",
    replacedWith: "Diana Green",
  },
];

export const AbsentColumns: GridColDef[] = [
  {
    field: "photo",
    headerName: "",
    renderCell: (params) => (
      <div className="flex items-center justify-center mt-1">
        <Avatar src={params.row.photo} alt={params.row.name} />
      </div>
    ),
  },
  {
    field: "id",
    headerName: "GUARD ID",
    flex: 0.5,
    minWidth: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "name",
    headerName: "GUARD NAME",
    flex: 1,
    minWidth: 150,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "dutyTime",
    headerName: "DUTY TIME",
    minWidth: 120,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "replacedWith",
    headerName: "REPLACED ?",
    minWidth: 130,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: () => (
      <div className="flex items-center justify-center mt-1">
        <Avatar src="" />
      </div>
    ),
  },
];

export interface GuardLateItems {
  id: number;
  guardId: string;
  guardName: string;
  photo: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  acutalCheckInTime: string;
  phoneNumber: string;
  lateMinutes: number;
  reason?: string | null;
  dutyId: string;
  timeDifference: number;
}

export const LateColumns: GridColDef[] = [
  {
    field: "photo",
    headerName: "",
    renderCell: (params) => (
      <div className="flex items-center justify-center mt-1">
        <Avatar src={params.row.photo} alt={params.row.name} />
      </div>
    ),
  },
  {
    field: "id",
    headerName: "GUARD ID",
    flex: 0.5,
    minWidth: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "guardName",
    headerName: "GUARD NAME",
    flex: 1,
    minWidth: 150,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "scheduledStartTime",
    headerName: "DUTY TIME",
    minWidth: 120,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "lateMinutes",
    headerName: "LATE BY",
    minWidth: 130,
    headerAlign: "center" as const,
    align: "center" as const,
  },
];

export interface GuardUniformItems {
  id: number;
  name: string;
  photo: string;
  count: number;
}

export const guardUniformItems: GuardUniformItems[] = [
  {
    id: 1,
    name: "Robert Taylor",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    count: 3,
  },
  {
    id: 2,
    name: "Lisa Anderson",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    count: 3,
  },
  {
    id: 3,
    name: "James Miller",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    count: 3,
  },
];

export const UniformColumns: GridColDef[] = [
  {
    field: "photo",
    headerName: "",
    renderCell: (params) => (
      <div className="flex items-center justify-center mt-1">
        <Avatar src={params.row.photo} alt={params.row.name} />
      </div>
    ),
  },
  {
    field: "id",
    headerName: "GUARD ID",
    minWidth: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "guardName",
    headerName: "GUARD NAME",
    minWidth: 200,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "count",
    headerName: "Guard Count",
    minWidth: 120,
    headerAlign: "left" as const,
    align: "left" as const,
  },
];

export interface GuardAlertnessItems {
  id: number;
  name: string;
  photo: string;
  dutyTime: string;
  missedNo: number;
  checkedAt?: string | null;
}

export const guardAlertnessItems: GuardAlertnessItems[] = [
  {
    id: 1,
    name: "Peter Clark",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "12:00PM",
    missedNo: 3,
  },
  {
    id: 2,
    name: "Jennifer Lee",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "02:00PM",
    missedNo: 5,
  },
  {
    id: 3,
    name: "Mark Thompson",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "04:00PM",
    missedNo: 2,
  },
];

export const AlertnessColumns: GridColDef[] = [
  {
    field: "photo",
    headerName: "",
    renderCell: (params) => (
      <div className="flex items-center justify-center mt-1">
        <Avatar src={params.row.photo} alt={params.row.name} />
      </div>
    ),
  },
  {
    field: "id",
    headerName: "GUARD ID",
    flex: 0.5,
    minWidth: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "guardName",
    headerName: "GUARD NAME",
    flex: 1,
    minWidth: 150,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "scheduledStartTime",
    headerName: "DUTY TIME",
    minWidth: 120,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "missedNo",
    headerName: "MISSED NO.",
    minWidth: 130,
    headerAlign: "center" as const,
    align: "center" as const,
  },
];

export interface GuardGeofenceItems {
  id: number;
  name: string;
  photo: string;
  dutyTime: string;
  count: number;
}

export const guardGeofenceItems: GuardGeofenceItems[] = [
  {
    id: 1,
    name: "Kevin Martinez",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "06:00PM",
    count: 5,
  },
  {
    id: 2,
    name: "Rachel Green",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "08:00PM",
    count: 8,
  },
  {
    id: 3,
    name: "Thomas White",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "10:00PM",
    count: 3,
  },
];

export const GeofenceColumns: GridColDef[] = [
  {
    field: "photo",
    headerName: "",
    renderCell: (params) => (
      <div className="flex items-center justify-center mt-1">
        <Avatar src={params.row.photo} alt={params.row.guardName} />
      </div>
    ),
  },
  {
    field: "guardId",
    headerName: "GUARD ID",
    flex: 0.5,
    minWidth: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "guardName",
    headerName: "GUARD NAME",
    flex: 1,
    minWidth: 150,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "dutyTime",
    headerName: "DUTY TIME",
    minWidth: 120,
    headerAlign: "left" as const,
    align: "left" as const,
    renderCell: (params) => <span>{params.row.dutyTime ? params.row.dutyTime.split("-")[0].trim() : "-"}</span>,
  },
  {
    field: "count",
    headerName: "COUNT",
    minWidth: 130,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params) => <span>{params.row.sessions ? params.row.sessions.length : 0}</span>,
  },
];

export interface GuardPatrolItems {
  id: number;
  name: string;
  photo: string;
  dutyTime: string;
  count: number;
}

export const guardPatrolItems: GuardPatrolItems[] = [
  {
    id: 1,
    name: "Daniel Harris",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "12:00AM",
    count: 12,
  },
  {
    id: 2,
    name: "Olivia Martin",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "02:00AM",
    count: 8,
  },
  {
    id: 3,
    name: "Andrew Lewis",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "04:00AM",
    count: 15,
  },
];

export const PatrolColumns: GridColDef[] = [
  {
    field: "photo",
    headerName: "",
    renderCell: (params) => (
      <div className="flex items-center justify-center mt-1">
        <Avatar src={params.row.photo} alt={params.row.name} />
      </div>
    ),
  },
  {
    field: "id",
    headerName: "GUARD ID",
    flex: 0.5,
    minWidth: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "name",
    headerName: "GUARD NAME",
    flex: 1,
    minWidth: 150,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "dutyTime",
    headerName: "DUTY TIME",
    minWidth: 120,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "count",
    headerName: "COUNT",
    minWidth: 130,
    headerAlign: "center" as const,
    align: "center" as const,
  },
];

export const guardAbsentItemsTwo = [
  {
    id: 1,
    name: "John Doe",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "08:00AM",
    distance: "0 km",
  },
  {
    id: 2,
    name: "Alice Johnson",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "08:00AM",
    distance: "0.5 km",
  },
  {
    id: 3,
    name: "Charlie White",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    dutyTime: "08:00AM",
    distance: "10 km",
  },
];

export const AbsentColumnsTwo: GridColDef[] = [
  {
    field: "photo",
    headerName: "",
    flex: 0.5,
    minWidth: 60,
    renderCell: (params) => (
      <div className="flex items-center justify-center mt-1">
        <Avatar src={params.row.photo} alt={params.row.name} />
      </div>
    ),
  },
  {
    field: "id",
    headerName: "GUARD ID",
    minWidth: 80,
    flex: 0.5,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "name",
    headerName: "GUARD NAME",
    flex: 1,
    minWidth: 150,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "dutyTime",
    headerName: "DUTY TIME",
    flex: 0.8,
    minWidth: 100,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "distance",
    headerName: "DISTANCE",
    flex: 0.8,
    minWidth: 60,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "assign",
    headerName: "Assign",
    minWidth: 130,
    flex: 1,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <div className="flex w-full h-full items-center justify-center">
            <Button onClick={() => setOpen(true)} variant="contained" size="small">
              <SwapHorizIcon />
              Replace
            </Button>
          </div>
          <ReplaceModal open={open} onClose={() => setOpen(false)} />
        </div>
      );
    },
  },
];
