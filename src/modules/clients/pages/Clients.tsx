import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetClientsCount } from "../apis/hooks/useGetClients";
import { columns } from "../columns/ClientColumns";
import type { ClientListItem } from "../types";

export default function Clients() {
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const opAgencyId = user?.agencyId || "agency_0";
  const id = "default";

  const { data: clientsResponse, isLoading, error } = useGetClientsCount(id, opAgencyId);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const [guardCountRange, setGuardCountRange] = useState<[number, number]>([0, 500]);
  const [sitesCountRange, setSitesCountRange] = useState<[number, number]>([0, 100]);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredRows, setFilteredRows] = useState<ClientListItem[]>([]);
  const [clientRows, setClientRows] = useState<ClientListItem[]>([]);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    if (clientsResponse?.data) {
      const transformedClients = clientsResponse.data.map((client: any) => ({
        id: client.id,
        logo: client.clientLogo,
        clientName: client.clientName,
        mainOffice: client.addressLine1,
        totalSites: client._count?.sites ?? 0,
        totalGuards: client._count?.guards ?? 0,
        favourite: client.favourite,
      }));
      setClientRows(transformedClients);

      if (transformedClients.length > 0) {
        const guards = transformedClients.map((client) => client.totalGuards);
        const sites = transformedClients.map((client) => client.totalSites);

        const minGuards = Math.min(...guards);
        const maxGuards = Math.max(...guards);
        const minSites = Math.min(...sites);
        const maxSites = Math.max(...sites);

        setGuardCountRange([minGuards, maxGuards]);
        setSitesCountRange([minSites, maxSites]);
      }
    }
  }, [clientsResponse]);

  useEffect(() => {
    applyFilters();
  }, [showFavouritesOnly, guardCountRange, sitesCountRange, clientRows]);

  useEffect(() => {
    setCurrentPage(0);
  }, [pageSize, showFavouritesOnly, guardCountRange, sitesCountRange]);

  useEffect(() => {
    const checkForDraft = () => {
      const clientDraft = localStorage.getItem("clientDraft");
      setHasDraft(!!clientDraft);
    };

    checkForDraft();

    // Check for draft changes when component gains focus
    const handleFocus = () => checkForDraft();
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const applyFilters = () => {
    let result = [...clientRows];

    if (showFavouritesOnly) {
      result = result.filter((row) => row.favourite);
    }

    result = result.filter((row) => row.totalGuards >= guardCountRange[0] && row.totalGuards <= guardCountRange[1]);

    result = result.filter((row) => row.totalSites >= sitesCountRange[0] && row.totalSites <= sitesCountRange[1]);

    result.sort((a, b) => (b.favourite ? 1 : 0) - (a.favourite ? 1 : 0));

    setFilteredRows(result);
  };

  const resetFilters = () => {
    if (clientRows.length > 0) {
      const guards = clientRows.map((client) => client.totalGuards);
      const sites = clientRows.map((client) => client.totalSites);

      const minGuards = Math.min(...guards);
      const maxGuards = Math.max(...guards);
      const minSites = Math.min(...sites);
      const maxSites = Math.max(...sites);

      setShowFavouritesOnly(false);
      setGuardCountRange([minGuards, maxGuards]);
      setSitesCountRange([minSites, maxSites]);
    }
  };

  const isFilterActive = () => {
    if (clientRows.length === 0) return false;

    const guards = clientRows.map((client) => client.totalGuards);
    const sites = clientRows.map((client) => client.totalSites);

    const minGuards = Math.min(...guards);
    const maxGuards = Math.max(...guards);
    const minSites = Math.min(...sites);
    const maxSites = Math.max(...sites);

    return (
      showFavouritesOnly ||
      guardCountRange[0] > minGuards ||
      guardCountRange[1] < maxGuards ||
      sitesCountRange[0] > minSites ||
      sitesCountRange[1] < maxSites
    );
  };

  const totalPages = Math.ceil(filteredRows.length / pageSize);

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
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(0);
  };

  const openFilter = () => setIsFilterOpen(true);
  const closeFilter = () => setIsFilterOpen(false);
  const applyAndClose = () => closeFilter();

  const handleDraftClick = () => {
    if (hasDraft) {
      navigate("/add-client");
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">Error loading clients: {error.message}</Typography>
      </Box>
    );
  }

  const pageNumbers = [];
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i + 1);
  }

  const currentPageData = filteredRows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div>
      <div className="flex flex-row justify-between mb-4">
        <div className="flex flex-row items-center text-2xl gap-2 font-semibold">
          <h2 className="">Clients</h2>
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
          <Button variant="contained" onClick={() => navigate("/add-client")}>
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
              Add New Client
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
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              p: 3,
              mt: 0.5,
              borderRadius: "10px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" component="h2">
              Filter By
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={resetFilters}>Reset</Button>
              <Button onClick={applyAndClose}>Apply</Button>
            </Stack>
          </Box>
          <Divider sx={{ my: 2 }} />
          <FormControlLabel
            control={
              <Checkbox checked={showFavouritesOnly} onChange={(e) => setShowFavouritesOnly(e.target.checked)} />
            }
            label="Show starred"
            sx={{ mb: 2, display: "block" }}
          />
          <Typography gutterBottom>Guards Count Range:</Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <TextField
              label="Min"
              type="number"
              size="small"
              value={guardCountRange[0]}
              onChange={(e) => setGuardCountRange([Number(e.target.value), guardCountRange[1]])}
              slotProps={{
                input: {
                  inputProps: {
                    min: 0,
                    max: guardCountRange[1],
                  },
                },
              }}
              fullWidth
            />
            <TextField
              label="Max"
              type="number"
              size="small"
              value={guardCountRange[1]}
              onChange={(e) => setGuardCountRange([guardCountRange[0], Number(e.target.value)])}
              slotProps={{
                input: {
                  inputProps: {
                    min: guardCountRange[0],
                    max: 1000,
                  },
                },
              }}
              fullWidth
            />
          </Stack>
          <Typography gutterBottom>Sites Count Range:</Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
            <TextField
              label="Min"
              type="number"
              size="small"
              value={sitesCountRange[0]}
              onChange={(e) => setSitesCountRange([Number(e.target.value), sitesCountRange[1]])}
              slotProps={{
                input: {
                  inputProps: {
                    min: 0,
                    max: sitesCountRange[1],
                  },
                },
              }}
              fullWidth
            />
            <TextField
              label="Max"
              type="number"
              size="small"
              value={sitesCountRange[1]}
              onChange={(e) => setSitesCountRange([sitesCountRange[0], Number(e.target.value)])}
              slotProps={{
                input: {
                  inputProps: {
                    min: sitesCountRange[0],
                    max: 1000,
                  },
                },
              }}
              fullWidth
            />
          </Stack>
        </Box>
      </Popover>

      <div className="bg-[#F0F0F0] rounded-[10px] overflow-clip border-[1px] border-[#dddddd]">
        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={currentPageData}
            columns={columns}
            hideFooter={true}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            sx={{
              ".MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
              },
              ".MuiDataGrid-cell": {
                whiteSpace: "nowrap",
              },
              border: 0,
              cursor: "pointer",
            }}
            onRowClick={(params, event) => {
              if ((event.target as HTMLElement).closest(".star-btn")) return;
              navigate(`/clients/${params.row.id}/performance`);
            }}
          />
        </Box>
      </div>

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

        <div className="flex items-center mx-auto">
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
