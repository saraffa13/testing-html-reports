import { Avatar, Chip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";

export interface GuardItem {
  id: string;
  name: string;
  type: string;
  clientSite: string;
  areaOfficer: string;
  upAndUpAsliTrust: number;
  guardImage: string;
  phoneNumber: string;
  bloodGroup: string;
  email: string;
  sex: string;
  status: string;
}

export const GuardColumns: GridColDef[] = [
  {
    field: "clientId",
    headerName: "Company ID",
    width: 120,
    headerAlign: "center",
    flex: 1,
    align: "center",
    renderCell: () => {
      const { clientId } = useParams();
      return <div className="">{clientId}</div>;
    },
  },
  {
    field: "guardImage",
    headerName: "Photo",
    width: 70,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params) => (
      <div className="flex items-center justify-center h-full">
        <Avatar
          src={params.row.guardImage}
          alt={params.row.name}
          sx={{ width: 40, height: 40, borderRadius: "8px" }}
          variant="square"
        />
      </div>
    ),
  },
  {
    field: "name",
    headerName: "Guard Name",
    width: 200,
    flex: 1,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "phoneNumber",
    headerName: "Phone Number",
    width: 150,
    flex: 1,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "shiftTime",
    headerName: "Shift Time",
    width: 140,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "clientSite",
    headerName: "Client Site",
    width: 180,
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
    field: "areaOfficer",
    headerName: "Area Officer",
    width: 150,
    headerAlign: "left" as const,
    align: "left" as const,
  },
  {
    field: "upAndUpAsliTrust",
    headerName: "UpAndUp Asli Trust Score",
    width: 110,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params) => {
      const rating = params.value as number;
      const getChipColor = (rating: number) => {
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
            minWidth: 45,
            borderRadius: "8px",
            backgroundColor: getChipColor(rating),
            color: "#fff",
          }}
        />
      );
    },
  },
];
