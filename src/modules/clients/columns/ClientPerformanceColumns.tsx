import type { GridColDef } from "@mui/x-data-grid";
import { useNavigate, useParams } from "react-router-dom";

interface SiteItems {
  id: number;
  name: string;
  absent: number;
  replaced: number;
  toReplace: number;
  guardCount: number;
}

export const siteItems: SiteItems[] = [
  { id: 1, name: "Nehru Place", absent: 2, replaced: 1, toReplace: 0, guardCount: 10 },
  { id: 2, name: "Navjeevan Vihar", absent: 1, replaced: 0, toReplace: 1, guardCount: 8 },
  { id: 3, name: "GK2", absent: 0, replaced: 0, toReplace: 0, guardCount: 5 },
];

export const siteColumns: GridColDef[] = [
  {
    field: "id",
    headerName: "SITE ID",
    width: 100,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "name",
    headerName: "SITE NAME",
    width: 200,
    headerAlign: "left" as const,
    align: "left" as const,
    renderCell: (params) => {
      const siteName = params.value;
      const { clientId } = useParams();
      const navigate = useNavigate();
      return (
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/clients/${clientId}/performance/guards-defaults/${params.row.id}`)}
        >
          {siteName}
        </div>
      );
    },
  },
  {
    field: "absent",
    headerName: "ABSENT",
    width: 80,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "replaced",
    headerName: "REPLACED",
    width: 100,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "toReplace",
    headerName: "TO REPLACE",
    width: 100,
    headerAlign: "left" as const,
    align: "left" as const,
  },
];

// Absent table columns based on image
export const AbsentTableColumns: GridColDef[] = [
  {
    field: "siteId",
    headerName: "SITE ID",
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "siteName",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const siteName = params.value;
      const { clientId } = useParams();
      const navigate = useNavigate();

      return (
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/clients/${clientId}/performance/guards-defaults/${params.row.siteId}`)}
        >
          {siteName}
        </div>
      );
    },
  },
  {
    field: "absent",
    headerName: "ABSENT",
    width: 100,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
  {
    field: "replaced",
    headerName: "REPLACED",
    width: 100,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
  {
    field: "toReplace",
    headerName: "TO REPLACE",
    width: 120,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
];

// Late table columns based on image
export const LateTableColumns: GridColDef[] = [
  {
    field: "siteId",
    headerName: "SITE ID",
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "siteName",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const siteName = params.value;
      const { clientId } = useParams();
      const navigate = useNavigate();
      return (
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/clients/${clientId}/performance/guards-defaults/${params.row.siteId}`)}
        >
          {siteName}
        </div>
      );
    },
  },
  {
    field: "guardCount",
    headerName: "GUARD COUNT",
    width: 120,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
];

// Uniform, Alertness, Geofence, Patrol table columns (same structure as Late)
export const UniformTableColumns: GridColDef[] = [
  {
    field: "siteId",
    headerName: "SITE ID",
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "siteName",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const siteName = params.value;
      const { clientId } = useParams();
      const navigate = useNavigate();
      return (
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/clients/${clientId}/performance/guards-defaults/${params.row.siteId}`)}
        >
          {siteName}
        </div>
      );
    },
  },
  {
    field: "guardCount",
    headerName: "GUARD COUNT",
    width: 120,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
];

export const AlertnessTableColumns: GridColDef[] = [
  {
    field: "siteId",
    headerName: "SITE ID",
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "siteName",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const siteName = params.value;
      const { clientId } = useParams();
      const navigate = useNavigate();
      return (
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/clients/${clientId}/performance/guards-defaults/${params.row.siteId}`)}
        >
          {siteName}
        </div>
      );
    },
  },
  {
    field: "guardCount",
    headerName: "GUARD COUNT",
    width: 120,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
];

export const GeofenceTableColumns: GridColDef[] = [
  {
    field: "siteId",
    headerName: "SITE ID",
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "siteName",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const siteName = params.value;
      const { clientId } = useParams();
      const navigate = useNavigate();
      return (
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/clients/${clientId}/performance/guards-defaults/${params.row.siteId}`)}
        >
          {siteName}
        </div>
      );
    },
  },
  {
    field: "guardCount",
    headerName: "GUARD COUNT",
    width: 120,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
];

export const PatrolTableColumns: GridColDef[] = [
  {
    field: "siteId",
    headerName: "SITE ID",
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "siteName",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const siteName = params.value;
      const { clientId } = useParams();
      const navigate = useNavigate();
      return (
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/clients/${clientId}/performance/guards-defaults/${params.row.siteId}`)}
        >
          {siteName}
        </div>
      );
    },
  },
  {
    field: "guardCount",
    headerName: "GUARD COUNT",
    width: 120,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
];

export const lateTableData = [
  {
    id: 1,
    siteId: "12443",
    siteName: "Nehru Place",
    guardCount: 3,
  },
  {
    id: 2,
    siteId: "12444",
    siteName: "Navjeevan Vihar",
    guardCount: 1,
  },
];

export const alertnessTableData = [
  {
    id: 1,
    siteId: "12443",
    siteName: "Nehru Place",
    guardCount: 2,
  },
  {
    id: 2,
    siteId: "12444",
    siteName: "Axis Bank",
    guardCount: 2,
  },
  {
    id: 3,
    siteId: "12444",
    siteName: "GK2",
    guardCount: 4,
  },
];

// Sample data for geofence table
export const geofenceTableData = [
  {
    id: 1,
    siteId: "12443",
    siteName: "Nehru Place",
    guardCount: 2,
  },
  {
    id: 2,
    siteId: "12444",
    siteName: "Navjeevan Vihar",
    guardCount: 5,
  },
  {
    id: 3,
    siteId: "12444",
    siteName: "GK2",
    guardCount: 1,
  },
];

// Sample data for patrol table
export const patrolTableData = [
  {
    id: 1,
    siteId: "12443",
    siteName: "Nehru Place",
    guardCount: 2,
  },
  {
    id: 2,
    siteId: "12444",
    siteName: "Navjeevan Vihar",
    guardCount: 3,
  },
  {
    id: 3,
    siteId: "12444",
    siteName: "GK2",
    guardCount: 2,
  },
];
