import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, Button, Divider, IconButton, MenuItem, Popover, Select, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetClientSitesWithCounts } from "../apis/hooks/useGetClientSites";
import { SiteColumns } from "../columns/ClientSitesColumns";

interface SiteItem {
  id: string;
  siteName: string;
  type: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  geofenceEnabled: boolean;
  patrollingEnabled: boolean;
  posts: number;
  guardCount: number;
  shifts: number;
}

export default function ClientSites() {
  const { clientId } = useParams();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minGuardCount, setMinGuardCount] = useState<number | "">("");
  const [maxGuardCount, setMaxGuardCount] = useState<number | "">("");
  const [hasDraft, setHasDraft] = useState(false);

  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Fetch client sites data with counts
  const { data: sitesData, isLoading, error } = useGetClientSitesWithCounts(clientId || "", currentPage + 1, pageSize);

  // Transform API data to table format
  const rows = useMemo(() => {
    if (!sitesData?.data) return [];
    return (sitesData.data as any[]).map((site: any) => ({
      id: site.id,
      siteName: site.siteName,
      type: Array.isArray(site.siteType) ? site.siteType.join(", ") : site.siteType,
      contactPerson: site.siteContactPersonFullName || "-",
      contactPhone: site.siteContactPhone || "-",
      contactEmail: site.siteContactEmail || "-",
      address: site.addressLine1 || "-",
      geofenceEnabled: site.geoFenceStatus ?? false,
      patrollingEnabled: site.patrolling ?? false,
      posts: site._count?.posts ?? 0,
      guardCount: site._count?.guards ?? 0,
      shifts: site._count?.shifts ?? 0,
    }));
  }, [sitesData]);

  const [filteredRows, setFilteredRows] = useState<SiteItem[]>([]);

  useEffect(() => {
    setFilteredRows(rows);
  }, [rows]);

  const totalPages = Math.ceil((sitesData?.data?.length || 0) / pageSize);

  const pageNumbers = [];
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i + 1);
  }

  useEffect(() => {
    applyFilters();
  }, [minGuardCount, maxGuardCount]);

  useEffect(() => {
    setCurrentPage(0);
  }, [pageSize, filteredRows]);

  useEffect(() => {
    const checkForDraft = () => {
      const clientSiteDraft = localStorage.getItem("clientSiteDraft");
      setHasDraft(!!clientSiteDraft);
    };

    checkForDraft();

    // Check for draft changes when component gains focus
    const handleFocus = () => checkForDraft();
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const applyFilters = () => {
    let result = [...rows];

    if (minGuardCount !== "" && minGuardCount !== null) {
      result = result.filter((row) => row.guardCount >= minGuardCount);
    }

    if (maxGuardCount !== "" && maxGuardCount !== null) {
      result = result.filter((row) => row.guardCount <= maxGuardCount);
    }

    setFilteredRows(result);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography>Loading sites...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography color="error">Error loading sites data</Typography>
      </div>
    );
  }

  const openFilter = () => {
    setIsFilterOpen(true);
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setMinGuardCount("");
    setMaxGuardCount("");
  };

  const isFilterActive = () => {
    return minGuardCount !== "" || maxGuardCount !== "";
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page - 1);
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0);
  };

  const handleDraftClick = () => {
    if (hasDraft) {
      navigate(`/clients/${clientId}/add-client-site`);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row justify-between mb-4">
        <div className="flex flex-row items-center text-2xl gap-2 font-semibold">
          <h2 className="">SITES</h2>
          <p className="text-[#707070]">{filteredRows.length}</p>
        </div>
        <div className="flex flex-row gap-4">
          <Button
            ref={filterButtonRef}
            variant="contained"
            onClick={openFilter}
            color={isFilterActive() ? "primary" : "inherit"}
          >
            <FilterListOutlinedIcon
              sx={{
                typography: {
                  fontSize: "14px",
                },
              }}
            />
            <Typography
              sx={{
                typography: {
                  fontSize: "14px",
                },
              }}
            >
              Filters {isFilterActive() ? "(Active)" : ""}
            </Typography>
          </Button>
          <Button variant="contained" onClick={() => navigate(`/clients/${clientId}/add-client-site`)}>
            <AddOutlinedIcon
              sx={{
                typography: {
                  fontSize: "14px",
                },
              }}
            />
            <Typography
              sx={{
                typography: {
                  fontSize: "14px",
                },
              }}
            >
              Add New Site
            </Typography>
          </Button>
          <Button
            variant="contained"
            onClick={handleDraftClick}
            disabled={!hasDraft}
            color={hasDraft ? "primary" : "inherit"}
          >
            <DraftsOutlinedIcon
              sx={{
                typography: {
                  fontSize: "14px",
                },
              }}
            />
            <Typography
              sx={{
                typography: {
                  fontSize: "14px",
                },
              }}
            >
              Drafts {hasDraft ? "(1)" : ""}
            </Typography>
          </Button>
        </div>
      </div>

      <Popover
        open={isFilterOpen}
        anchorEl={filterButtonRef.current}
        onClose={closeFilter}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              p: 3,
              mt: 0.5,
              borderRadius: "10px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              width: 280,
            },
          },
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "text.secondary" }}>FILTER BY</Typography>
            <Button
              onClick={resetFilters}
              sx={{
                color: "#2A77D5",
                textTransform: "uppercase",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              RESET
            </Button>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: "16px",
                fontWeight: 600,
                color: "text.secondary",
                mb: 2,
              }}
            >
              Guards Count
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: "text.secondary",
                    fontSize: "14px",
                  }}
                >
                  Min
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Count"
                  type="number"
                  value={minGuardCount}
                  onChange={(e) => setMinGuardCount(e.target.value === "" ? "" : Number(e.target.value))}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#f9f9f9",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "10px 14px",
                      fontSize: "14px",
                    },
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: "text.secondary",
                    fontSize: "14px",
                  }}
                >
                  Max
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Count"
                  type="number"
                  value={maxGuardCount}
                  onChange={(e) => setMaxGuardCount(e.target.value === "" ? "" : Number(e.target.value))}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#f9f9f9",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "10px 14px",
                      fontSize: "14px",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Popover>

      <Box sx={{ display: "inline-block" }}>
        <DataGrid
          rows={filteredRows.slice(currentPage * pageSize, (currentPage + 1) * pageSize)}
          columns={SiteColumns}
          hideFooter={true}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          autoHeight
          sx={{
            borderRadius: "8px",
            mt: 2,
            cursor: "pointer",
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
          onRowClick={(params) => navigate(`/clients/${clientId}/sites/${params.row.id}`)}
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

          <IconButton onClick={handleNextPage} disabled={currentPage >= totalPages - 1} size="small">
            <KeyboardArrowRightIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
