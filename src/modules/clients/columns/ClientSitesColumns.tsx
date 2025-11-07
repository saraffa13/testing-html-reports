import type { GridColDef } from "@mui/x-data-grid";

export const SiteColumns: GridColDef[] = [
  {
    field: "id",
    headerName: "Site ID",
    width: 100,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "siteName",
    headerName: "Site Name",
    width: 200,
    flex: 1,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "type",
    headerName: "Type",
    width: 120,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "contactPerson",
    headerName: "Contact Person",
    width: 180,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "posts",
    headerName: "Posts",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "guardCount",
    headerName: "Guard Count",
    width: 120,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "shifts",
    headerName: "Shifts",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
];
