import { type GridColDef } from "@mui/x-data-grid";

export const areaOfficersTasksColumns: GridColDef[] = [
  {
    field: "taskId",
    headerName: "TASK ID",
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "name",
    headerName: "NAME",
    flex: 1,
    minWidth: 120,
  },
  {
    field: "clientName",
    headerName: "CLIENT NAME",
    flex: 1,
    minWidth: 120,
  },
  {
    field: "siteName",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 120,
  },
  {
    field: "dueOn",
    headerName: "DUE ON",
    width: 150,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "assignedBy",
    headerName: "ASSIGNED BY",
    width: 120,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "actions",
    headerName: "ACTIONS",
    width: 120,
    align: "center",
    headerAlign: "center",
    renderCell: () => (
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <span style={{ fontSize: "16px", color: "#2196f3" }}>🏠</span>
        <span style={{ fontSize: "16px", color: "#2196f3" }}>📍</span>
        <span style={{ fontSize: "16px", color: "#2196f3" }}>📋</span>
      </div>
    ),
  },
];

export const areaOfficersTasksOverdueRows = [
  {
    id: 1,
    taskId: "12443",
    name: "Hamir Ali",
    clientName: "Haldiram's",
    siteName: "GK2",
    dueOn: "23/01/25 04:35 PM",
    assignedBy: "Office",
    actions: "view_details",
  },
  {
    id: 2,
    taskId: "12443",
    name: "Raju Kumar",
    clientName: "Axis Bank",
    siteName: "Nehru Place",
    dueOn: "23/01/25 04:35 PM",
    assignedBy: "Office",
    actions: "view_details",
  },
];

export const areaOfficersTasksPendingRows = [
  {
    id: 1,
    taskId: "12443",
    name: "Hamir Ali",
    clientName: "Haldiram's",
    siteName: "GK2",
    dueOn: "23/01/25 04:35 PM",
    assignedBy: "Office",
    actions: "view_details",
  },
  {
    id: 2,
    taskId: "12443",
    name: "Raju Kumar",
    clientName: "Axis Bank",
    siteName: "Nehru Place",
    dueOn: "23/01/25 04:35 PM",
    assignedBy: "Office",
    actions: "view_details",
  },
];

export const areaOfficersTasksDoneRows = [
  {
    id: 1,
    taskId: "12443",
    name: "Hamir Ali",
    clientName: "Haldiram's",
    siteName: "GK2",
    doneOn: "23/01/25 04:35 PM",
    assignedBy: "Office",
    actions: "view_details",
  },
  {
    id: 2,
    taskId: "12453",
    name: "Shyam Gopal",
    clientName: "Jain Books",
    siteName: "GK2",
    doneOn: "23/01/25 04:35 PM",
    assignedBy: "Office",
    actions: "view_details",
  },
  {
    id: 3,
    taskId: "12444",
    name: "Anil Sharma",
    clientName: "Hardik Jeweller",
    siteName: "GK2",
    doneOn: "23/01/25 04:35 PM",
    assignedBy: "Office",
    actions: "view_details",
  },
  {
    id: 4,
    taskId: "12467",
    name: "Raju Kumar",
    clientName: "Axis Bank",
    siteName: "Nehru Place",
    doneOn: "23/01/25 04:35 PM",
    assignedBy: "Office",
    actions: "view_details",
  },
];

export const areaOfficersTasksDoneColumns: GridColDef[] = [
  {
    field: "taskId",
    headerName: "TASK ID",
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "name",
    headerName: "NAME",
    flex: 1,
    minWidth: 120,
  },
  {
    field: "clientName",
    headerName: "CLIENT NAME",
    flex: 1,
    minWidth: 120,
  },
  {
    field: "siteName",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 120,
  },
  {
    field: "doneOn",
    headerName: "DONE ON",
    width: 150,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "assignedBy",
    headerName: "ASSIGNED BY",
    width: 120,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "actions",
    headerName: "ACTIONS",
    width: 120,
    align: "center",
    headerAlign: "center",
    renderCell: () => (
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <span style={{ fontSize: "16px", color: "#2196f3" }}>🏠</span>
        <span style={{ fontSize: "16px", color: "#2196f3" }}>📍</span>
        <span style={{ fontSize: "16px", color: "#2196f3" }}>📋</span>
      </div>
    ),
  },
];
