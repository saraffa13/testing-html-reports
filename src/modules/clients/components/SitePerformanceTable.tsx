import { Box } from "@mui/material";
import { DataGrid, type GridColDef, type GridRowSelectionModel } from "@mui/x-data-grid";
import { useState } from "react";
import {
  AbsentColumns,
  AlertnessColumns,
  GeofenceColumns,
  PatrolColumns,
  UniformColumns,
  guardAbsentItems,
  guardAlertnessItems,
  guardGeofenceItems,
  // guardLateItems,
  guardPatrolItems,
  guardUniformItems,
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
  const [selectedGuardIndex] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

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
        onRowSelectionModelChange={(newRowSelectionModel) => {
          const selectedId = Array.from(newRowSelectionModel.ids)[0];
          if (selectedId !== undefined) {
            setSelectedGuard(items[Number(selectedId)] as GuardItems);
          }
        }}
        rowSelectionModel={selectedGuardIndex}
        disableColumnMenu
        disableMultipleRowSelection={true}
        sx={datagridStyle}
      />
    </Box>
  );
};

export const SitePerformanceTable = ({
  selectedMetric,
  setSelectedGuard,
}: {
  selectedMetric: string;
  setSelectedGuard: any;
}) => {
  switch (selectedMetric) {
    case "absent":
      return commonTable({
        items: guardAbsentItems,
        columns: AbsentColumns,
        setSelectedGuard: setSelectedGuard,
      });

    // case "late":
    //   return commonTable({
    //     items: guardLateItems,
    //     columns: LateColumns,
    //     setSelectedGuard: setSelectedGuard,
    //   });

    case "uniform":
      return commonTable({
        items: guardUniformItems,
        columns: UniformColumns,
        setSelectedGuard: setSelectedGuard,
      });

    case "alertness":
      return commonTable({
        items: guardAlertnessItems,
        columns: AlertnessColumns,
        setSelectedGuard: setSelectedGuard,
      });

    case "geofence":
      return commonTable({
        items: guardGeofenceItems,
        columns: GeofenceColumns,
        setSelectedGuard: setSelectedGuard,
      });

    case "patrol":
      return commonTable({
        items: guardPatrolItems,
        columns: PatrolColumns,
        setSelectedGuard: setSelectedGuard,
      });

    default:
      return commonTable({
        items: [],
        columns: [],
        setSelectedGuard: setSelectedGuard,
      });
  }
};
