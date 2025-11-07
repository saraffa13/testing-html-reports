import AddIcon from "@mui/icons-material/Add";
import DraftsIcon from "@mui/icons-material/Drafts";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Badge, Box, Button, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import OfficerFilterComponent from "../components/OfficerFilterComponent";
import OfficerTable from "../components/OfficerTable";
import { useOfficers } from "../context/OfficerContext";

// Interface for filter state
interface FilterState {
  assignedAreas: string[];
  guardsCountMin: number | null;
  guardsCountMax: number | null;
  sitesCountMin: number | null;
  sitesCountMax: number | null;
  trustScore: number | null;
}

const OfficerContentWindow: React.FC = () => {
  const { officers, loading, error, total, initialized, refreshOfficers, forceRefreshOfficers, initializeOfficers } =
    useOfficers();

  const navigate = useNavigate();
  const initializationAttempted = useRef(false); // ✅ Track if initialization was attempted

  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Fixed initialization - only run once and track attempts
  useEffect(() => {
    if (!initialized && !loading && !initializationAttempted.current) {
      console.log("📍 Officers ContentWindow mounted - initializing officers...");
      initializationAttempted.current = true;
      initializeOfficers().catch((error) => {
        console.error("❌ Failed to initialize officers:", error);
        initializationAttempted.current = false; // Reset on error to allow retry
      });
    }
  }, [initialized, loading, initializeOfficers]); // ✅ Stable dependencies

  // Debug effect to log when officers array changes
  useEffect(() => {
    console.log("📊 Officers list updated:", officers.length, "officers");
  }, [officers.length]); // ✅ Only depend on length, not the entire array

  // Calculate filtered count
  const filterCount = activeFilters
    ? Object.entries(activeFilters).reduce((count, [_key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          return count + 1;
        } else if (value !== null && !Array.isArray(value)) {
          return count + 1;
        }
        return count;
      }, 0)
    : 0;

  // Memoized handlers to prevent unnecessary re-renders
  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  const handleApplyFilters = useCallback((filters: FilterState) => {
    setActiveFilters(filters);
  }, []);

  const handleAddNewOfficer = useCallback(() => {
    navigate("/add-officer");
  }, [navigate]);

  // Handle refresh with force refresh option
  const handleRefresh = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        setIsRefreshing(true);
        console.log(`🔄 ${forceRefresh ? "Force refreshing" : "Refreshing"} officers list...`);

        if (forceRefresh) {
          await forceRefreshOfficers();
        } else {
          await refreshOfficers();
        }

        console.log("✅ Officers list refreshed successfully!");
      } catch (error) {
        console.error("Failed to refresh officers:", error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [forceRefreshOfficers, refreshOfficers]
  );

  // Show loading state (only if not initialized or currently loading)
  if ((loading && !initialized) || (loading && officers.length === 0)) {
    return (
      <Box
        sx={{
          width: "1272px",
          height: "872px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <CircularProgress color="primary" size={48} />
        <Typography sx={{ fontFamily: "Mukta", fontSize: "16px", color: "#707070" }}>
          {initialized ? "Refreshing officers data..." : "Loading officers data..."}
        </Typography>
        <Typography sx={{ fontFamily: "Mukta", fontSize: "14px", color: "#A0A0A0" }}>
          This may take a few moments
        </Typography>
      </Box>
    );
  }

  // Show error state with retry button
  if (error && !initialized && officers.length === 0) {
    return (
      <Box
        sx={{
          width: "1272px",
          height: "872px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 3,
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          padding: 4,
        }}
      >
        <Alert
          severity="error"
          sx={{
            mb: 2,
            "& .MuiAlert-message": {
              fontFamily: "Mukta",
            },
          }}
        >
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            initializationAttempted.current = false; // Reset flag
            handleRefresh(true);
          }}
          startIcon={<RefreshIcon />}
          disabled={isRefreshing}
          sx={{
            borderRadius: "8px",
            backgroundColor: "#2A77D5",
            fontFamily: "Mukta",
            "&:hover": {
              backgroundColor: "#1E5AA3",
            },
          }}
        >
          {isRefreshing ? "Retrying..." : "Retry"}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      className="content-window"
      sx={{
        width: "1272px",
        height: "872px",
        padding: "16px",
        borderRadius: "16px",
        backgroundColor: "#FFFFFF",
        gap: "16px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Error banner (for non-blocking errors) */}
      {error && initialized && officers.length > 0 && (
        <Alert
          severity="warning"
          onClose={() => {}}
          sx={{
            mb: 1,
            "& .MuiAlert-message": {
              fontFamily: "Mukta",
              fontSize: "14px",
            },
          }}
        >
          {error} - Showing cached data
        </Alert>
      )}

      {/* Content Heading */}
      <Box
        className="content-heading"
        sx={{
          width: "1240px",
          height: "32px",
          gap: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Frame 1 - Left side with title */}
        <Box
          className="frame-1"
          sx={{
            width: "840px",
            height: "24px",
            gap: "16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Text container */}
          <Box
            className="text-container"
            sx={{
              width: "auto",
              height: "24px",
              gap: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              className="text1-box"
              sx={{
                height: "24px",
                gap: "10px",
                paddingTop: "5px",
                paddingBottom: "4px",
              }}
            >
              <Typography
                variant="h1"
                className="text1-properties"
                sx={{
                  height: "15px",
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "32px",
                  letterSpacing: "0%",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                }}
              >
                Officers
              </Typography>
            </Box>

            {/* Officer count */}
            <Box
              className="text2-box"
              sx={{
                height: "24px",
                gap: "10px",
                paddingTop: "5px",
                paddingBottom: "4px",
              }}
            >
              <Typography
                variant="h1"
                className="text2-properties"
                sx={{
                  height: "15px",
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "32px",
                  letterSpacing: "0%",
                  textTransform: "capitalize",
                  color: "#707070",
                }}
              >
                {total || officers.length}
              </Typography>
            </Box>

            {/* Loading indicator when refreshing */}
            {(loading || isRefreshing) && initialized && (
              <Box sx={{ ml: 1 }}>
                <CircularProgress size={16} sx={{ color: "#2A77D5" }} />
              </Box>
            )}

            {/* Initialization status */}
            {!initialized && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#A0A0A0",
                  fontFamily: "Mukta",
                  ml: 1,
                }}
              >
                (Initializing...)
              </Typography>
            )}
          </Box>
        </Box>

        {/* Frame 2 - Right side with buttons */}
        <Box
          className="frame-2"
          sx={{
            width: "auto",
            height: "32px",
            gap: "16px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {/* Refresh Button */}
          <Tooltip title={initialized ? "Refresh data (Hold Shift for force refresh)" : "Initialize officers first"}>
            <IconButton
              onClick={(e) => handleRefresh(e.shiftKey)}
              disabled={isRefreshing || !initialized}
              sx={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 1px 4px rgba(112, 112, 112, 0.2)",
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#F0F0F0",
                },
              }}
            >
              <RefreshIcon
                sx={{
                  width: "16px",
                  height: "16px",
                  color: isRefreshing || !initialized ? "#A0A0A0" : "#2A77D5",
                  ...(isRefreshing && {
                    animation: "spin 1s linear infinite",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }),
                }}
              />
            </IconButton>
          </Tooltip>

          {/* Filters Button */}
          <Badge
            badgeContent={filterCount}
            color="primary"
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#2A77D5",
                color: "white",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "10px",
                minWidth: "16px",
                height: "16px",
                right: 4,
                top: 4,
              },
            }}
          >
            <Button
              variant="contained"
              className="button1"
              onClick={toggleFilters}
              disabled={!initialized}
              sx={{
                width: "97px",
                height: "32px",
                px: "16px",
                borderRadius: "8px",
                backgroundColor: showFilters ? "#F0F7FF" : "#FFFFFF",
                border: showFilters ? "1px solid #2A77D5" : "none",
                boxShadow: "0px 1px 4px rgba(112, 112, 112, 0.2)",
                "&:hover": {
                  backgroundColor: showFilters ? "#E3F0FF" : "#F5F5F5",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#F0F0F0",
                  color: "#A0A0A0",
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <FilterListIcon
                className="filter-icon"
                sx={{
                  width: "16px",
                  height: "16px",
                  color: !initialized ? "#A0A0A0" : "#2A77D5",
                }}
              />
              <Typography
                className="text-inside-box"
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "16px",
                  textTransform: "uppercase",
                  color: !initialized ? "#A0A0A0" : "#2A77D5",
                  whiteSpace: "nowrap",
                }}
              >
                Filters
              </Typography>
            </Button>
          </Badge>

          {/* Add New Officer Button */}
          <Button
            variant="contained"
            className="button2"
            onClick={handleAddNewOfficer}
            sx={{
              minWidth: "164px",
              height: "32px",
              px: "16px",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <AddIcon
              sx={{
                width: "16px",
                height: "16px",
                color: "#2A77D5",
              }}
            />
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "16px",
                textTransform: "uppercase",
                color: "#2A77D5",
                whiteSpace: "nowrap",
              }}
            >
              Add New Officer
            </Typography>
          </Button>

          {/* Drafts Button */}
          <Button
            variant="contained"
            className="button3"
            sx={{
              width: "99px",
              height: "32px",
              px: "16px",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 1px 4px rgba(112, 112, 112, 0.2)",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <DraftsIcon
              className="drafts-icon"
              sx={{
                width: "16px",
                height: "16px",
                color: "#2A77D5",
              }}
            />
            <Typography
              className="text-inside-box"
              sx={{
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "16px",
                textTransform: "uppercase",
                color: "#2A77D5",
                whiteSpace: "nowrap",
              }}
            >
              Drafts
            </Typography>
          </Button>
        </Box>
      </Box>

      {/* Filter Component (conditionally rendered) */}
      {showFilters && initialized && (
        <OfficerFilterComponent
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFilters(false)}
          allOfficers={officers}
        />
      )}

      {/* Table Frame Layout - Only show if initialized */}
      {initialized && <OfficerTable filters={activeFilters} />}
    </Box>
  );
};

export default OfficerContentWindow;
