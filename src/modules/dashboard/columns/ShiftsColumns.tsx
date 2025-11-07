import { type GridColDef } from "@mui/x-data-grid";
import { ClientFavouriteCell } from "../components/ClientFavouriteCell";

export const shiftsColumns: GridColDef[] = [
  {
    field: "clientName",
    headerName: "CLIENT NAME",
    flex: 1,
    minWidth: 200,
    renderCell: (params) => {
      return (
        <ClientFavouriteCell
          clientId={params.row.clientId}
          clientName={params.value}
          isFavourite={params.row.favourite}
        />
      );
    },
  },
  {
    field: "alertness",
    headerName: "ALERTNESS",
    width: 100,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
  {
    field: "geofence",
    headerName: "GEOFENCE",
    width: 100,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
  {
    field: "patrol",
    headerName: "PATROL",
    width: 100,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
];

export const shiftsRows = [
  {
    id: 1,
    clientName: "Kotak",
    starred: true,
    alertness: 15,
    geofence: 4,
    patrol: 11,
  },
  {
    id: 2,
    clientName: "DLF Jasmine",
    starred: false,
    alertness: 12,
    geofence: 10,
    patrol: 2,
  },
  {
    id: 3,
    clientName: "Haldirams",
    starred: false,
    alertness: 10,
    geofence: 8,
    patrol: 2,
  },
  {
    id: 4,
    clientName: "Epicuria",
    starred: true,
    alertness: 10,
    geofence: 10,
    patrol: 0,
  },
  {
    id: 5,
    clientName: "Axis Bank",
    starred: true,
    alertness: 5,
    geofence: 4,
    patrol: 1,
  },
  {
    id: 6,
    clientName: "Rainbow Hospital",
    starred: true,
    alertness: 4,
    geofence: 0,
    patrol: 4,
  },
  {
    id: 7,
    clientName: "Mittal Industries",
    starred: false,
    alertness: 4,
    geofence: 1,
    patrol: 3,
  },
  {
    id: 8,
    clientName: "Maruti",
    starred: false,
    alertness: 2,
    geofence: 0,
    patrol: 2,
  },
  {
    id: 9,
    clientName: "Marshal's",
    starred: false,
    alertness: 2,
    geofence: 0,
    patrol: 2,
  },
  {
    id: 10,
    clientName: "Manga Co.",
    starred: false,
    alertness: 2,
    geofence: 0,
    patrol: 2,
  },
];

export const shiftsDatagridStyle = {
  width: "100%",
  height: "100%",
  border: "none",
  minWidth: 300,
  "& .MuiDataGrid-main": {
    borderRadius: "12px",
    overflow: "hidden",
  },
  "& .MuiDataGrid-virtualScroller": {
    "&::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#c1c1c1",
      borderRadius: "10px",
      "&:hover": {
        background: "#a8a8a8",
      },
    },
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#ffffff",
    borderBottom: "none",
    fontSize: "14px",
    fontWeight: 600,
    color: "#6c757d",
    minHeight: "56px !important",
    maxHeight: "56px !important",
  },
  "& .MuiDataGrid-columnHeader": {
    mb: 1,
    "&:focus": {
      outline: "none",
    },
    "&:focus-within": {
      outline: "none",
    },
  },
  "& .MuiDataGrid-cell": {
    borderLeft: "1px solid #F0F0F0",
    borderRight: "1px solid #F0F0F0",
    fontSize: "14px",
    fontWeight: 500,
    color: "#212529",
    "&:focus": {
      outline: "none",
    },
    "&:focus-within": {
      outline: "none",
    },
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#ffffff",
    marginBottom: "8px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #f0f0f0",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#f8f9fa",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
      transform: "translateY(-2px)",
    },
    "&.Mui-selected": {
      backgroundColor: "#e3f2fd",
      boxShadow: "0 4px 16px rgba(42, 119, 213, 0.2)",
      "&:hover": {
        backgroundColor: "#e3f2fd",
        boxShadow: "0 6px 20px rgba(42, 119, 213, 0.25)",
      },
    },
  },
  "& .MuiDataGrid-footerContainer": {
    display: "none",
  },
};
