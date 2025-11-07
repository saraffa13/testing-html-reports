import AddIcon from "@mui/icons-material/Add";
import DraftsIcon from "@mui/icons-material/Drafts";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Badge, Box, Button, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GuardTable from "../columns/guardtable";
import FilterComponent from "../components/GuardFilterComponent";
import { useGuards } from "../context/GuardContext";

// Interface for filter state
interface FilterState {
  guardTypes: string[];
  psaraStatus: string[];
  shiftStart: Date | null;
  shiftEnd: Date | null;
  clients: string[];
  areaOfficers: string[];
  trustScore: number | null;
}

const ContentWindow: React.FC = () => {
  const { guards, loading, error, total, initialized, refreshGuards, forceRefreshGuards, initializeGuards } =
    useGuards();

  const navigate = useNavigate();
  const initializationAttempted = useRef(false); // ✅ Track if initialization was attempted

  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Fixed initialization - only run once and track attempts
  useEffect(() => {
    if (!initialized && !loading && !initializationAttempted.current) {
      console.log("📍 Guards ContentWindow mounted - initializing guards...");
      initializationAttempted.current = true;
      initializeGuards().catch((error) => {
        console.error("❌ Failed to initialize guards:", error);
        initializationAttempted.current = false; // Reset on error to allow retry
      });
    }
  }, [initialized, loading, initializeGuards]); // ✅ Stable dependencies

  // Debug effect to log when guards array changes
  useEffect(() => {
    console.log("📊 Guards list updated:", guards.length, "guards");
  }, [guards.length]); // ✅ Only depend on length, not the entire array

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
  const toggleFilters = React.useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  const handleApplyFilters = React.useCallback((filters: FilterState) => {
    setActiveFilters(filters);
  }, []);

  const handleAddNewGuard = React.useCallback(() => {
    navigate("/add-guard");
  }, [navigate]);

  // Handle refresh with force refresh option
  const handleRefresh = React.useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        setIsRefreshing(true);
        console.log(`🔄 ${forceRefresh ? "Force refreshing" : "Refreshing"} guards list...`);

        if (forceRefresh) {
          await forceRefreshGuards();
        } else {
          await refreshGuards();
        }

        console.log("✅ Guards list refreshed successfully!");
      } catch (error) {
        console.error("Failed to refresh guards:", error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [forceRefreshGuards, refreshGuards]
  );

  // Show loading state (only if not initialized or currently loading)
  if ((loading && !initialized) || (loading && guards.length === 0)) {
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
          {initialized ? "Refreshing guards data..." : "Loading guards data..."}
        </Typography>
        <Typography sx={{ fontFamily: "Mukta", fontSize: "14px", color: "#A0A0A0" }}>
          This may take a few moments
        </Typography>
      </Box>
    );
  }

  // Show error state with retry button
  if (error && !initialized && guards.length === 0) {
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
      {error && initialized && guards.length > 0 && (
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
            width: "847px",
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
                Guards
              </Typography>
            </Box>
            {/* Guard count */}
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
                  color: "#707070",
                }}
              >
                {total || guards.length}
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
          <Tooltip title={initialized ? "Refresh data (Hold Shift for force refresh)" : "Initialize guards first"}>
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

          {/* Add New Guard Button */}
          <Button
            variant="contained"
            className="button2"
            onClick={handleAddNewGuard}
            sx={{
              minWidth: "157px",
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
              Add New Guard
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
        <FilterComponent onApplyFilters={handleApplyFilters} onClose={() => setShowFilters(false)} allGuards={guards} />
      )}

      {/* Table Frame Layout - Only show if initialized */}
      {initialized && <GuardTable filters={activeFilters} />}
    </Box>
  );
};

export default ContentWindow;
