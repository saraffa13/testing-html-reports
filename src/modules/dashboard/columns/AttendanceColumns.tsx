import { type GridColDef } from "@mui/x-data-grid";
import { ClientFavouriteCell } from "../components/ClientFavouriteCell";

export const attendanceColumns: GridColDef[] = [
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
    field: "absentCount",
    headerName: "ABSENT",
    width: 80,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
  {
    field: "relacedCount",
    headerName: "REPLACED",
    width: 100,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
  {
    field: "toReplaceCount",
    headerName: "TO REPLACE",
    width: 110,
    align: "center",
    headerAlign: "center",
    type: "number",
  },
];

export const attendanceRows = [
  {
    id: 1,
    clientName: "Kotak",
    starred: true,
    present: 123,
    absent: 45,
    late: 12,
    replaced: 8,
    attendance_rate: 73,
  },
  {
    id: 2,
    clientName: "DLF Jasmine",
    starred: false,
    present: 145,
    absent: 32,
    late: 67,
    replaced: 15,
    attendance_rate: 82,
  },
  {
    id: 3,
    clientName: "Haldirams",
    starred: false,
    present: 156,
    absent: 31,
    late: 29,
    replaced: 22,
    attendance_rate: 83,
  },
  {
    id: 4,
    clientName: "Epicuria",
    starred: true,
    present: 98,
    absent: 27,
    late: 84,
    replaced: 5,
    attendance_rate: 78,
  },
  {
    id: 5,
    clientName: "Axis Bank",
    starred: true,
    present: 187,
    absent: 25,
    late: 43,
    replaced: 31,
    attendance_rate: 88,
  },
];
