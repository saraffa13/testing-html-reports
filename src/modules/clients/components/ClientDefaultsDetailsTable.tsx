import { Box } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect } from "react";
import {
  AbsentColumns,
  AlertnessColumns,
  GeofenceColumns,
  LateColumns,
  PatrolColumns,
  UniformColumns,
  type GuardAbsentItems,
  type GuardAlertnessItems,
  type GuardGeofenceItems,
  type GuardLateItems,
  type GuardPatrolItems,
  type GuardUniformItems,
} from "../columns/GuardsDefaultsListViewColumns";
import { datagridStyle } from "../lib/datagridStyle";

export type GuardItems =
  | GuardAbsentItems
  | GuardLateItems
  | GuardUniformItems
  | GuardAlertnessItems
  | GuardGeofenceItems
  | GuardPatrolItems;

const commonTable = ({
  items,
  columns,
  setSelectedGuard,
}: {
  items: any[];
  columns: GridColDef[];
  setSelectedGuard: (guard: GuardItems) => void;
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        flexGrow: 1,
        minHeight: 400,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DataGrid
        rows={items}
        columns={columns}
        hideFooter={true}
        onRowClick={(params) => {
          setSelectedGuard(params.row as GuardItems);
        }}
        disableColumnMenu
        sx={datagridStyle}
      />
    </Box>
  );
};

export const ClientDefaultsDetailsTable = ({
  selectedMetric,
  setSelectedGuard,
  absentGuards,
  uniformGuards,
  alertnessGuards,
  lateGuards,
  geofenceGuards,
  patrolGuards,
}: {
  selectedMetric: string;
  setSelectedGuard: any;
  absentGuards: any[];
  uniformGuards: any[];
  alertnessGuards: any[];
  lateGuards: any[];
  geofenceGuards: any[];
  patrolGuards: any[];
}) => {
  useEffect(() => {
    console.log("Selected Metric:", absentGuards);
  });
  switch (selectedMetric) {
    case "absent":
      return commonTable({ items: absentGuards, columns: AbsentColumns, setSelectedGuard });

    case "late":
      return commonTable({ items: lateGuards, columns: LateColumns, setSelectedGuard });

    case "uniform":
      return commonTable({ items: uniformGuards, columns: UniformColumns, setSelectedGuard });

    case "alertness":
      return commonTable({ items: alertnessGuards, columns: AlertnessColumns, setSelectedGuard });

    case "geofence":
      return commonTable({ items: geofenceGuards, columns: GeofenceColumns, setSelectedGuard });

    case "patrol":
      return commonTable({ items: patrolGuards, columns: PatrolColumns, setSelectedGuard });

    default:
      return commonTable({ items: [], columns: [], setSelectedGuard });
  }
};
