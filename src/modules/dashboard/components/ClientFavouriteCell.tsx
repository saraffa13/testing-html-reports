import { Star, StarBorder } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { usePatchClientFavourite } from "@modules/clients/apis/hooks/usePatchClientFavourite";

interface ClientFavouriteCellProps {
  clientId: string;
  clientName: string;
  isFavourite: boolean;
}

export const ClientFavouriteCell = ({ clientId, clientName, isFavourite }: ClientFavouriteCellProps) => {
  const patchFavourite = usePatchClientFavourite();

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    patchFavourite.mutate({ id: clientId, favourite: !isFavourite });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span onClick={handleStarClick} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
        {patchFavourite.isPending ? (
          <CircularProgress size={18} />
        ) : isFavourite ? (
          <Star sx={{ color: "#ffc107", fontSize: 20 }} />
        ) : (
          <StarBorder sx={{ color: "#9e9e9e", fontSize: 20 }} />
        )}
      </span>
      {clientName}
    </div>
  );
};