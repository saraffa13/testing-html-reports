import { useGetClientSiteById } from "@modules/clients/apis/hooks/useGetClientSitesById";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SignalCellularAltOutlinedIcon from "@mui/icons-material/SignalCellularAltOutlined";
import { Button } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SiteDetails } from "./Details";
import Performance from "./Performance";
import Posts from "./Posts";

export default function Sites() {
  const { siteId } = useParams<{ clientId: string; siteId: string }>();
  const { data: site } = useGetClientSiteById(siteId ?? "");

  const [selectedView, setSelectedView] = useState<"details" | "posts" | "performace">("details");
  const navigate = useNavigate();

  const getButtonStyles = (isSelected: boolean) => ({
    bgcolor: isSelected ? "#2A77D5" : "white",
    color: isSelected ? "white" : "#2A77D5",
    border: "1px solid #2A77D5",
    "&:hover": {
      bgcolor: isSelected ? "#1E5A96" : "#E3F2FD",
    },
  });
  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-center">
        <div className="inline-flex gap-2 items-center">
          <ArrowBackIcon onClick={() => navigate(-1)} className="cursor-pointer" />

          <h2 className="font-semibold">
            {(site as any)?.data?.siteData?.siteName || "-"} <span className="text-[#707070]">(ID: {siteId})</span>
          </h2>
        </div>
        <div className="flex flex-row gap-4">
          <Button
            variant="outlined"
            size="small"
            sx={getButtonStyles(selectedView === "details")}
            onClick={() => setSelectedView("details")}
          >
            SITE DETAILS
          </Button>

          <Button
            variant="outlined"
            size="small"
            sx={getButtonStyles(selectedView === "posts")}
            onClick={() => setSelectedView("posts")}
          >
            SITE POSTS
          </Button>

          <Button
            variant="outlined"
            size="small"
            sx={getButtonStyles(selectedView === "performace")}
            onClick={() => setSelectedView("performace")}
          >
            <SignalCellularAltOutlinedIcon sx={{ mr: 1 }} />
            SITE PERFORMANCE
          </Button>
        </div>
      </div>
      <div>
        {selectedView === "details" && <SiteDetails />}
        {selectedView === "posts" && <Posts />}
        {selectedView === "performace" && <Performance />}
      </div>
    </div>
  );
}
