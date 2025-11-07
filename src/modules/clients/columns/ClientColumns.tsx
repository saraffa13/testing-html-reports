import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { Avatar, CircularProgress } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { usePatchClientFavourite } from "../apis/hooks/usePatchClientFavourite";

export const columns: GridColDef[] = [
  {
    field: "favourite",
    headerName: "",
    width: 50,
    renderCell: (params) => {
      const isFavourite = params.row.favourite;
      const clientId = params.row.id;
      const patchFavourite = usePatchClientFavourite();
      const handleFavouriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        patchFavourite.mutate({ id: clientId, favourite: !isFavourite });
      };
      return (
        <span className="star-btn" onClick={handleFavouriteClick} style={{ cursor: "pointer" }}>
          {patchFavourite.isPending ? (
            <CircularProgress size={18} />
          ) : isFavourite ? (
            <StarIcon sx={{ color: "#E4C710", fontSize: "20px" }} />
          ) : (
            <StarOutlineIcon sx={{ fontSize: "20px" }} />
          )}
        </span>
      );
    },
    sortable: false,
    filterable: false,
  },
  { field: "id", headerName: "Client ID", width: 90 },
  {
    field: "logo",
    headerName: "Logo",
    width: 80,
    renderCell: (params) => (
      <div className="flex w-full h-full items-center justify-center">
        <Avatar src={params.value} alt="Client Logo" sx={{ width: 32, height: 32 }} variant="rounded" />
      </div>
    ),
    sortable: false,
    filterable: false,
  },
  {
    field: "clientName",
    headerName: "Client Name",
    width: 200,
    renderCell: (params) => {
      const clientName = params.value;
      const navigate = useNavigate();
      return (
        <div className="cursor-pointer" onClick={() => navigate(`/clients/${params.row.id}/performance`)}>
          {clientName}
        </div>
      );
    },
  },
  {
    field: "mainOffice",
    headerName: "Main Office",
    width: 150,
  },
  {
    field: "totalSites",
    headerName: "Total Sites",
    type: "number",
    width: 100,
  },
  {
    field: "totalGuards",
    headerName: "Total Guard",
    type: "number",
    width: 100,
  },
];
