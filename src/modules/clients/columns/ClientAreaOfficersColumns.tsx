import { Avatar, Chip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

export const AreaOfficerColumns: GridColDef[] = [
  {
    field: "companyId",
    headerName: "Company ID",
    width: 110,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "photo",
    headerName: "Photo",
    width: 80,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params) => (
      <div className="flex items-center justify-center h-full">
        <Avatar
          src={params.row.photo}
          alt={params.row.name}
          sx={{ width: 40, height: 40, borderRadius: "8px" }}
          variant="square"
        />
      </div>
    ),
  },
  {
    field: "name",
    headerName: "Name",
    width: 140,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "phoneNumber",
    headerName: "Phone Number",
    width: 140,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "assignedArea",
    headerName: "Assigned Area",
    width: 250,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "clientSites",
    headerName: "Client Sites",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "guardCount",
    headerName: "Guard Count",
    width: 100,
    headerAlign: "center" as const,
    align: "center" as const,
  },
  {
    field: "upAndUpAsliTrust",
    headerName: "UpAndUp Asli Trust",
    width: 130,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params) => {
      const rating = params.value as number;
      const getChipColor = (rating: number) => {
        if (rating >= 4.5) return "#76CB80";
        if (rating >= 4.0) return "#76CB80";
        if (rating >= 3.5) return "#E89E59";
        return "#f44336";
      };

      return (
        <Chip
          label={rating.toFixed(1)}
          size="small"
          sx={{
            fontWeight: 600,
            minWidth: 50,
            borderRadius: "6px",
            backgroundColor: getChipColor(rating),
            color: "white",
            fontSize: "12px",
          }}
        />
      );
    },
  },
];
