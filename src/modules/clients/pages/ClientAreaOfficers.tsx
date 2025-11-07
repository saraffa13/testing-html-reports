import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, Button, IconButton, MenuItem, Select, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetClientAreaOfficers } from "../apis/hooks/useGetClientGuards";
import { useGetClientSites } from "../apis/hooks/useGetClientSites";
import { AreaOfficerColumns } from "../columns/ClientAreaOfficersColumns";
import { useClientContext } from "../context/ClientContext";

export default function ClientAreaOfficers() {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const { clientId } = useParams();
  const { selectedSite, setSelectedSite } = useClientContext();
  const { data: sitesResponse, isLoading: isLoadingSites } = useGetClientSites(clientId || "");
  const sites = sitesResponse?.data || [];

  const siteIdForApi = selectedSite === "ALL SITES" ? undefined : selectedSite;
  const areaOfficerApiParams: any = {
    page: currentPage + 1,
    limit: pageSize,
    clientId,
  };
  if (siteIdForApi) {
    areaOfficerApiParams.siteId = siteIdForApi;
  }
  const { data, isLoading, error } = useGetClientAreaOfficers(clientId!);
  const apiAreaOfficers = (data && (data as any).data.areaOfficers) || [];

  const areaOfficers = apiAreaOfficers.map((officer: any) => ({
    id: officer.guardId,
    companyId: officer.guardId,
    photo: officer.photo,
    name: officer.name,
    phoneNumber: officer.phoneNumber,
    assignedArea: officer.assignedArea,
    clientSites: officer.clientSites,
    guardCount: officer.guardCount,
    upAndUpAsliTrust: 4 + Math.random(),
    siteIds: officer.siteId ? officer.siteId.split(", ").map((id: string) => id.trim()) : [],
  }));

  // Apply site filtering based on siteId
  const filteredAreaOfficers =
    selectedSite === "ALL SITES"
      ? areaOfficers
      : areaOfficers.filter((officer: any) => {
          return officer.siteIds && officer.siteIds.includes(selectedSite);
        });

  const pageNumbers = [];
  const adjustedTotalPages = Math.ceil(filteredAreaOfficers.length / pageSize);
  for (let i = 0; i < adjustedTotalPages; i++) {
    pageNumbers.push(i + 1);
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(adjustedTotalPages - 1, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page - 1);
  };

  const handleRowClick = (params: any) => {
    const guardId = params.row.id; // This is the guardId
    navigate(`/officers/${guardId}/performance`);
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading area officers</div>;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-4">
          <div className="flex flex-row items-center text-lg gap-2 font-semibold">
            <h2 className="">AREA OFFICERS</h2>
            <p className="text-[#707070]">{filteredAreaOfficers.length}</p>
          </div>

          <Button variant="contained" size="small" disabled={isLoadingSites}>
            <HomeWorkOutlinedIcon sx={{ mr: 1 }} />
            <Select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              size="small"
              sx={{ minWidth: 180, background: "transparent", border: "none" }}
              disableUnderline
              displayEmpty
            >
              <MenuItem value="ALL SITES">ALL SITES</MenuItem>
              {sites.map((site: any) => (
                <MenuItem key={site.id} value={site.id}>
                  {site.siteName}
                </MenuItem>
              ))}
            </Select>
            <KeyboardArrowDownIcon sx={{ ml: 1 }} />
          </Button>
        </div>
      </div>

      <Box sx={{ display: "inline-block" }}>
        <DataGrid
          rows={filteredAreaOfficers}
          columns={AreaOfficerColumns}
          hideFooter={true}
          disableRowSelectionOnClick={false}
          hideFooterSelectedRowCount
          onRowClick={handleRowClick}
          sx={{
            borderRadius: "8px",
            mt: 2,
            ".MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
            },
            ".MuiDataGrid-cell": {
              whiteSpace: "nowrap",
            },
            border: 0,
            "& .wrapped-header .MuiDataGrid-columnHeaderTitle": {
              whiteSpace: "pre-line",
              lineHeight: "1.2",
              textAlign: "center",
            },
            "& .wrapped-header": {
              height: "auto !important",
              minHeight: "70px",
            },
          }}
        />
      </Box>

      <div className="flex justify-between items-center mt-4 px-2">
        <div className="flex items-center">
          <Typography variant="body2" sx={{ mr: 1, mb: 1 }}>
            Show
          </Typography>
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            size="small"
            variant="standard"
            IconComponent={ExpandMoreOutlinedIcon}
            sx={{
              minWidth: 80,
              color: "#000",
              fontSize: "14px",
              textAlign: "center",
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingRight: "24px !important",
              },
              "& svg": {
                color: "#808080",
                pb: 0.5,
              },
              "&::before": { borderBottom: "none" },
              "&::after": { borderBottom: "none" },
              "&:hover:not(.Mui-disabled)::before": { borderBottom: "none" },
            }}
          >
            {[5, 10, 25, 50, 100].map((size) => (
              <MenuItem key={size} value={size} sx={{ justifyContent: "center" }}>
                <span style={{ color: "#2A77D5", marginRight: 4 }}>{size} Rows</span>
              </MenuItem>
            ))}
          </Select>
        </div>

        <div className="flex items-center">
          <IconButton onClick={handlePreviousPage} disabled={currentPage === 0} size="small">
            <KeyboardArrowLeftIcon />
          </IconButton>

          <div className="flex mx-1">
            {pageNumbers.map((page) => (
              <Button
                key={page}
                onClick={() => handlePageClick(page)}
                variant="text"
                size="small"
                sx={{
                  minWidth: 32,
                  height: 32,
                  mx: 0.5,
                  fontSize: "16px",
                  color: currentPage === page - 1 ? "#2A77D5" : "black",
                }}
              >
                {page}
              </Button>
            ))}
          </div>

          <IconButton onClick={handleNextPage} disabled={currentPage >= adjustedTotalPages - 1} size="small">
            <KeyboardArrowRightIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
