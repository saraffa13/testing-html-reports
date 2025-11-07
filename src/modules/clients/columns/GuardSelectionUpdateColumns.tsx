import { Avatar, Button } from "@mui/material";
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

// This factory returns the columns for selected guards, including custom actions for alertness and replace.
export const getSelectedGuardsColumnsWithActions = (
  guardSettings: Record<string, { alertnessChallenge: boolean; patrolling: boolean; occurrenceCount?: number }>,
  handleGuardSettingChange: (
    guardId: string,
    setting: "alertnessChallenge" | "patrolling" | "occurrenceCount",
    value: boolean | number
  ) => void,
  handleReplaceGuard: (guardId: string, guardSelectionId?: string) => void
): GridColDef[] => [
  ...selectedGuardsColumns.filter(
    (col) =>
      col.field !== "alertnessChallenge" &&
      col.field !== "patrollingStatus" &&
      col.field !== "alertnessChallengeCount" &&
      col.field !== "patrolling" &&
      col.field !== "occurrenceCount"
  ),
  {
    field: "alertnessChallenge",
    headerName: "Alertness Challenge",
    width: 140,
    sortable: false,
    renderCell: (params) => (
      <div className="w-full h-full flex items-center justify-center">
        <span className="scale-75">
          <CustomSwitch
            checked={!!guardSettings[params.row.id]?.alertnessChallenge}
            onChange={() =>
              handleGuardSettingChange(
                params.row.id,
                "alertnessChallenge",
                !guardSettings[params.row.id]?.alertnessChallenge
              )
            }
          />
        </span>
      </div>
    ),
  },
  {
    field: "occurrenceCount",
    headerName: "Count",
    width: 80,
    minWidth: 60,
    maxWidth: 100,
    sortable: false,
    renderCell: (params) => (
      <input
        type="number"
        min={0}
        value={guardSettings[params.row.id]?.occurrenceCount ?? 0}
        style={{ width: 60, padding: "2px 4px", border: "1px solid #e0e0e0", borderRadius: 4 }}
        onChange={(e) => handleGuardSettingChange(params.row.id, "occurrenceCount", Number(e.target.value))}
      />
    ),
  },
  {
    field: "patrolling",
    headerName: "Patrol",
    width: 140,
    sortable: false,
    renderCell: (params) => (
      <div className="w-full h-full flex items-center justify-center">
        <span className="scale-75">
          <CustomSwitch
            checked={!!guardSettings[params.row.id]?.patrolling}
            onChange={() =>
              handleGuardSettingChange(params.row.id, "patrolling", !guardSettings[params.row.id]?.patrolling)
            }
          />
        </span>
      </div>
    ),
  },

  {
    field: "replace",
    headerName: "Replace",
    width: 100,
    sortable: false,
    renderCell: (params) => (
      <Button
        type="button"
        color="primary"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleReplaceGuard(params.row.id, params.row.guardSelectionId);
        }}
        variant="outlined"
      >
        Replace
      </Button>
    ),
  },
];
