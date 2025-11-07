import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetClientGuards } from "../apis/hooks/useGetClientGuards";
import { useGetClientSites } from "../apis/hooks/useGetClientSites";
import { GuardColumns, type GuardItem } from "../columns/ClientGuardsColumns";
import { useClientContext } from "../context/ClientContext";

export default function ClientGuards() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { selectedSite, setSelectedSite } = useClientContext();
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGuardTypes, setSelectedGuardTypes] = useState<string[]>([]);
  const [selectedCertificationStatus, setSelectedCertificationStatus] = useState<string[]>([]);
  const [selectedClientSites, setSelectedClientSites] = useState<string[]>([]);
  const [selectedAreaOfficers, setSelectedAreaOfficers] = useState<string[]>([]);
  const [selectedTrustScores, setSelectedTrustScores] = useState<string[]>([]);
  const [clientSiteSearch, setClientSiteSearch] = useState("");
  const [areaOfficerSearch, setAreaOfficerSearch] = useState("");
  const [shiftStartTime, setShiftStartTime] = useState("");
  const [shiftEndTime, setShiftEndTime] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: sitesResponse, isLoading: isLoadingSites } = useGetClientSites(clientId || "");
  const sites = sitesResponse?.data || [];

  const { data: guardsResponse, isLoading: isLoadingGuards, error: guardsError } = useGetClientGuards(clientId!);
  const guards = (guardsResponse && (guardsResponse as any).data.guards) || [];

  const areaOfficers = Array.from(new Set(guards.map((guard: any) => guard.areaOfficer).filter(Boolean))) as string[];

  const guardTypes = Array.from(new Set(guards.map((guard: any) => guard.type).filter(Boolean))) as string[];

  const transformedGuards: GuardItem[] = guards.map((guard: any) => ({
    id: guard.guardId,
    name: guard.guardName,
    type: guard.type,
    clientSite: guard.clientSite,
    areaOfficer: guard.areaOfficer,
    upAndUpAsliTrust: Math.floor(Math.random() * 5) + 1,
    guardImage: guard.photo || "",
    phoneNumber: guard.phoneNumber,
    bloodGroup: guard.bloodGroup || "",
    email: guard.email || "",
    sex: guard.sex || "",
    status: "ACTIVE",
    shiftTime: guard.shiftTime || "",
  }));

  const handleRowClick = (params: any) => {
    const guardId = params.row.id;
    navigate(`/guards/${guardId}/performance`);
  };

  const applyFilters = (guards: GuardItem[]) => {
    let result = [...guards];

    if (selectedSite !== "ALL SITES") {
      const selectedSiteData = sites.find((site: any) => site.id === selectedSite);
      if (selectedSiteData) {
        result = result.filter((guard) => guard.clientSite === selectedSiteData.siteName);
      }
    }

    if (selectedGuardTypes.length > 0) {
      result = result.filter((guard) => selectedGuardTypes.includes(guard.type));
    }

    if (selectedClientSites.length > 0) {
      result = result.filter((guard) => selectedClientSites.includes(guard.clientSite));
    }

    if (selectedAreaOfficers.length > 0) {
      result = result.filter((guard) => selectedAreaOfficers.includes(guard.areaOfficer));
    }

    if (selectedTrustScores.length > 0) {
      result = result.filter((guard) => {
        const score = guard.upAndUpAsliTrust;
        return selectedTrustScores.some((range) => {
          switch (range) {
            case "4 +":
              return score >= 4;
            case "3 +":
              return score >= 3;
            case "Upto 3":
              return score <= 3;
            case "Upto 2":
              return score <= 2;
            default:
              return true;
          }
        });
      });
    }

    if (shiftStartTime || shiftEndTime) {
      result = result.filter((guard) => {
        const guardShiftTime = (guard as any).shiftTime;
        if (!guardShiftTime) return false;

        const [guardStart, guardEnd] = guardShiftTime.split("-");

        if (shiftStartTime && guardStart) {
          const filterStartTime = new Date(`1970-01-01T${shiftStartTime}:00`);
          const guardStartTime = new Date(`1970-01-01T${guardStart}:00`);
          if (guardStartTime < filterStartTime) return false;
        }

        if (shiftEndTime && guardEnd) {
          const filterEndTime = new Date(`1970-01-01T${shiftEndTime}:00`);
          const guardEndTime = new Date(`1970-01-01T${guardEnd}:00`);
          if (guardEndTime > filterEndTime) return false;
        }

        return true;
      });
    }

    return result;
  };

  const filteredGuards = applyFilters(transformedGuards);
  const currentPageData = filteredGuards;
  const totalPages = Math.ceil(currentPageData.length / pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const clientSites = Array.from(new Set(sites.map((site: any) => site.siteName).filter(Boolean))) as string[];

  const certificationStatuses = ["Pending", "Completed"];
  const trustScoreRanges = ["4 +", "3 +", "Upto 3", "Upto 2"];

  const openFilter = () => setIsFilterOpen(true);
  const closeFilter = () => setIsFilterOpen(false);
  const resetFilters = () => {
    setSelectedGuardTypes([]);
    setSelectedCertificationStatus([]);
    setSelectedClientSites([]);
    setSelectedAreaOfficers([]);
    setSelectedTrustScores([]);
    setClientSiteSearch("");
    setAreaOfficerSearch("");
    setShiftStartTime("");
    setShiftEndTime("");
  };

  const isFilterActive = () =>
    selectedGuardTypes.length > 0 ||
    selectedCertificationStatus.length > 0 ||
    selectedClientSites.length > 0 ||
    selectedAreaOfficers.length > 0 ||
    selectedTrustScores.length > 0 ||
    shiftStartTime ||
    shiftEndTime;

  const handleGuardTypeToggle = (type: string) =>
    setSelectedGuardTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  const handleCertificationStatusToggle = (status: string) =>
    setSelectedCertificationStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  const handleClientSiteToggle = (site: string) =>
    setSelectedClientSites((prev) => (prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site]));
  const handleAreaOfficerToggle = (officer: string) =>
    setSelectedAreaOfficers((prev) =>
      prev.includes(officer) ? prev.filter((o) => o !== officer) : [...prev, officer]
    );
  const handleTrustScoreToggle = (score: string) =>
    setSelectedTrustScores((prev) => (prev.includes(score) ? prev.filter((s) => s !== score) : [...prev, score]));

  const filteredClientSites = clientSites.filter((site) => site.toLowerCase().includes(clientSiteSearch.toLowerCase()));

  const filteredAreaOfficers = areaOfficers.filter((officer) =>
    officer.toLowerCase().includes(areaOfficerSearch.toLowerCase())
  );

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  const handlePageClick = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (event: any) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const getTrustScoreIcon = (score: string): React.ReactElement | undefined => {
    const iconStyle = { fontSize: 20, marginRight: 1 };
    switch (score) {
      case "4 +":
        return <StarIcon style={{ ...iconStyle, color: "#76CB80" }} />;
      case "3 +":
        return <StarIcon style={{ ...iconStyle, color: "#FFD700" }} />;
      case "Upto 3":
        return <StarIcon style={{ ...iconStyle, color: "#E89E59" }} />;
      case "Upto 2":
        return <StarIcon style={{ ...iconStyle, color: "#f44336" }} />;
      default:
        return undefined;
    }
  };

  if (isLoadingGuards) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading guards data...</Typography>
      </div>
    );
  }

  if (guardsError) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography color="error">Error loading guards data</Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-4">
          <div className="flex flex-row items-center text-lg gap-2 font-semibold">
            <h2 className="">GUARDS</h2>
            <p className="text-[#707070]">{filteredGuards.length}</p>
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
        <Button
          ref={filterButtonRef}
          variant="contained"
          onClick={openFilter}
          color={isFilterActive() ? "primary" : "inherit"}
        >
          <FilterListOutlinedIcon sx={{ typography: { fontSize: "14px" } }} />
          <Typography sx={{ typography: { fontSize: "14px" } }}>Filters</Typography>
        </Button>
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
              width: 320,
              maxHeight: "80vh",
              overflow: "auto",
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
              }}
            >
              RESET
            </Button>
          </Box>

          {/* Guard Type */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontSize: "12px", fontWeight: 600, color: "text.secondary" }}>
              Guard Type
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {guardTypes.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => handleGuardTypeToggle(type)}
                  color={selectedGuardTypes.includes(type) ? "primary" : "default"}
                  variant={selectedGuardTypes.includes(type) ? "filled" : "outlined"}
                  sx={{
                    borderRadius: "20px",
                    borderColor: "#2A77D5",
                    bgcolor: "#F7F7F7",
                    color: "#2A77D5",
                    "&:hover": {
                      bgcolor: "#F7F7F7",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* PSARA Certification Status */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontSize: "12px", fontWeight: 600, color: "text.secondary" }}>
              PSARA Certification Status
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {certificationStatuses.map((status) => (
                <Chip
                  key={status}
                  label={status}
                  onClick={() => handleCertificationStatusToggle(status)}
                  color={selectedCertificationStatus.includes(status) ? "primary" : "default"}
                  variant={selectedCertificationStatus.includes(status) ? "filled" : "outlined"}
                  sx={{
                    borderRadius: "20px",
                    borderColor: "#2A77D5",
                    bgcolor: "#F7F7F7",
                    color: "#2A77D5",
                    "&:hover": {
                      bgcolor: "#F7F7F7",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Client Sites */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontSize: "12px", fontWeight: 600, color: "text.secondary" }}>
              Client Sites
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Client Site By Name Or ID"
              value={clientSiteSearch}
              onChange={(e) => setClientSiteSearch(e.target.value)}
              slotProps={{
                input: {
                  sx: {
                    fontSize: "12px",
                  },
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" sx={{ fontSize: "14px" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 1 }}>
              {filteredClientSites.map((site) => (
                <FormControlLabel
                  key={site}
                  control={
                    <Checkbox
                      checked={selectedClientSites.includes(site)}
                      onChange={() => handleClientSiteToggle(site)}
                      sx={{ color: "#2A77D5", py: 0.2 }}
                    />
                  }
                  label={site}
                  sx={{
                    padding: 0,
                    "& .MuiFormControlLabel-label": {
                      fontSize: "14px",
                    },
                  }}
                  labelPlacement="end"
                />
              ))}
            </Box>
          </Box>

          {/* Shift */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontSize: "12px", fontWeight: 600, color: "text.secondary" }}>
              Shift
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Starting
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter HH:MM"
                  value={shiftStartTime}
                  onChange={(e) => setShiftStartTime(e.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: "12px",
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Ending
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter HH:MM"
                  value={shiftEndTime}
                  onChange={(e) => setShiftEndTime(e.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: "12px",
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Area Officer */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontSize: "12px", fontWeight: 600, color: "text.secondary" }}>
              Area Officer
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Area Officer By Name Or ID"
              value={areaOfficerSearch}
              onChange={(e) => setAreaOfficerSearch(e.target.value)}
              slotProps={{
                input: {
                  sx: {
                    fontSize: "12px",
                  },
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" sx={{ fontSize: "14px" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {filteredAreaOfficers.map((officer) => (
                <FormControlLabel
                  key={officer}
                  control={
                    <Checkbox
                      checked={selectedAreaOfficers.includes(officer)}
                      onChange={() => handleAreaOfficerToggle(officer)}
                      sx={{ color: "#2A77D5", py: 0.2 }}
                    />
                  }
                  label={officer}
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "14px",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Trust Score */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontSize: "12px", fontWeight: 600, color: "text.secondary" }}>
              Trust Score
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {trustScoreRanges.map((score) => (
                <Chip
                  key={score}
                  icon={getTrustScoreIcon(score)}
                  label={score}
                  onClick={() => handleTrustScoreToggle(score)}
                  color={selectedTrustScores.includes(score) ? "primary" : "default"}
                  variant={selectedTrustScores.includes(score) ? "filled" : "outlined"}
                  sx={{
                    borderRadius: "20px",
                    borderColor: "#2A77D5",
                    color: selectedTrustScores.includes(score) ? "white" : "#2A77D5",
                    "& .MuiChip-icon": {
                      color: selectedTrustScores.includes(score) ? "white" : "inherit",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Popover>

      <Box sx={{ display: "inline-block" }}>
        <DataGrid
          rows={currentPageData}
          columns={GuardColumns}
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
            "& .MuiDataGrid-row": {
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(42, 119, 213, 0.04)",
              },
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
          <IconButton onClick={handlePreviousPage} disabled={currentPage === 1} size="small">
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
                  color: currentPage === page ? "#2A77D5" : "black",
                }}
              >
                {page}
              </Button>
            ))}
          </div>

          <IconButton onClick={handleNextPage} disabled={currentPage >= totalPages} size="small">
            <KeyboardArrowRightIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
