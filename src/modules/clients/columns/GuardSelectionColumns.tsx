import { Avatar } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import CounterComponent from "../../../components/CounterComponent";
import { CustomSwitch } from "../../../components/CustomSwitch";

export const availableGuardsColumns: GridColDef[] = [
  {
    field: "photo",
    headerName: "Photo",
    width: 80,
    minWidth: 80,
    maxWidth: 80,
    resizable: false,
    renderCell: (params) => (
      <div className="flex w-full h-full items-center justify-center">
        <Avatar src={params.value} alt="Guard Photo" sx={{ width: 40, height: 40 }} variant="rounded" />
      </div>
    ),
    sortable: false,
    filterable: false,
  },
  {
    field: "companyId",
    headerName: "Company ID",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
  },
  {
    field: "guardName",
    headerName: "Guard Name",
    width: 140,
    minWidth: 120,
    maxWidth: 180,
    renderCell: (params) => (
      <div className="flex items-center w-full h-full">
        <span className="whitespace-normal text-sm leading-tight overflow-hidden text-ellipsis">{params.value}</span>
      </div>
    ),
  },
];

export const selectedGuardsColumns: GridColDef[] = [
  {
    field: "companyId",
    headerName: "ID",
    width: 50,
  },
  {
    field: "photo",
    headerName: "Photo",
    width: 70,
    minWidth: 70,
    maxWidth: 70,
    resizable: false,
    renderCell: (params) => (
      <div className="flex w-full h-full items-center justify-center">
        <Avatar src={params.value} alt="Guard Photo" sx={{ width: 32, height: 32 }} variant="rounded" />
      </div>
    ),
    sortable: false,
    filterable: false,
  },
  {
    field: "guardName",
    headerName: "Name",
    width: 100,
    renderCell: (params) => (
      <div className="flex items-center w-full h-full">
        <span className="whitespace-normal text-sm leading-tight overflow-hidden text-ellipsis">{params.value}</span>
      </div>
    ),
  },
  {
    field: "alertnessChallenge",
    headerName: "Alertness",
    width: 120,
    renderCell: (params) => (
      <div className="flex w-full h-full items-center justify-center">
        <div className="scale-75">
          <CustomSwitch checked={params.value} onChange={() => {}} />
        </div>
      </div>
    ),
    sortable: false,
    filterable: false,
  },
  {
    field: "occurrenceCount",
    headerName: "Count",
    width: 120,
    renderCell: () => (
      <div className="flex w-full h-full items-center justify-center">
        <CounterComponent />
      </div>
    ),
    sortable: false,
    filterable: false,
  },
  {
    field: "patrolling",
    headerName: "Patrol",
    width: 120,
    renderCell: (params) => (
      <div className="flex w-full h-full items-center justify-center">
        <div className="scale-75">
          <CustomSwitch checked={params.value} onChange={() => {}} />
        </div>
      </div>
    ),
    sortable: false,
    filterable: false,
  },
];
