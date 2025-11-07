import { Avatar } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

// Column definitions
export const guardSelectionsColumns: GridColDef[] = [
  {
    field: "companyId",
    headerName: "Company ID",
    width: 100,
    headerAlign: "left",
    align: "left",
  },
  {
    field: "photo",
    headerName: "Photo",
    width: 60,
    sortable: false,
    filterable: false,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => <Avatar src={params.value} alt={params.row.guardName} sx={{ width: 40, height: 40 }} />,
  },
  {
    field: "guardName",
    headerName: "Guard Name",
    width: 120,
    headerAlign: "left",
    align: "left",
  },
  {
    field: "type",
    headerName: "Type",
    width: 80,
    headerAlign: "left",
    align: "left",
  },
  {
    field: "alertnessChallenge",
    headerName: "Alertness Challenge",
    width: 140,
    headerAlign: "left",
    align: "left",
  },
  {
    field: "alertnessChallengeCount",
    headerName: "Occurence Count",
    width: 120,
    headerAlign: "center",
    align: "center",
    type: "number",
  },
  {
    field: "patrollingStatus",
    headerName: "Patrolling Status",
    width: 120,
    headerAlign: "center",
    align: "center",
    sortable: false,
  },
];
