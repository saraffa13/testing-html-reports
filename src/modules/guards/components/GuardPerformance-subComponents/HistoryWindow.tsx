import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { useGuardHistory, useGuardHistoryUtils } from "../../hooks/useGuardHistory";

const cellStyle = {
  fontFamily: "Mukta",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "16px",
  color: "#3B3B3B",
  border: "none",
  padding: "16px",
};

const headerCellStyle = {
  fontFamily: "Mukta",
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: "16px",
  color: "#A3A3A3",
  textTransform: "uppercase" as const,
  border: "none",
  padding: "16px",
};

/**
 * History Window Component
 * Shows guard history information with real API integration
 */

type TabType = "OVERTIME" | "TENURE";

interface HistoryWindowProps {
  guardId?: string; // Optional guard ID prop
}

const HistoryWindow: React.FC<HistoryWindowProps> = ({ guardId }) => {
  const [activeTab, setActiveTab] = useState<TabType>("OVERTIME");
  const { sortHistory, getHistoryStats } = useGuardHistoryUtils();

  // Fetch guard history using the custom hook - Fix TypeScript error
  const {
    data: historyRecords = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useGuardHistory(guardId || null, !!guardId);

  // Memoized data processing
  const processedData = useMemo(() => {
    if (!historyRecords.length) return { overtimeRecords: [], tenureRecords: [], stats: null };

    const sortedRecords = sortHistory(historyRecords);

    // For now, we'll treat all records as both overtime and tenure
    // In the future, you can categorize based on business logic
    const overtimeRecords = sortedRecords; // All records show as overtime
    const tenureRecords = sortedRecords; // All records show as tenure

    const stats = getHistoryStats(sortedRecords);

    return {
      overtimeRecords,
      tenureRecords,
      stats,
    };
  }, [historyRecords, sortHistory, getHistoryStats]);

  // Get current data based on active tab
  const currentData = activeTab === "OVERTIME" ? processedData.overtimeRecords : processedData.tenureRecords;

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <TableContainer sx={{ background: "#FFFFFF", borderRadius: "8px" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ background: "#F8F9FA" }}>
            <TableCell sx={headerCellStyle}>Start Date</TableCell>
            <TableCell sx={headerCellStyle}>End Date</TableCell>
            <TableCell sx={headerCellStyle}>Shift</TableCell>
            <TableCell sx={headerCellStyle}>Client</TableCell>
            <TableCell sx={headerCellStyle}>Site</TableCell>
            <TableCell sx={headerCellStyle}>Designation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3, 4, 5].map((index) => (
            <TableRow key={index}>
              {[1, 2, 3, 4, 5, 6].map((cellIndex) => (
                <TableCell key={cellIndex} sx={cellStyle}>
                  <Skeleton variant="text" width="80%" height={20} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Error state component
  const ErrorState = () => (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? <CircularProgress size={16} /> : "Retry"}
          </Button>
        }
      >
        {error?.message || "Failed to load history data"}
      </Alert>
    </Box>
  );

  // No data state component
  const NoDataState = () => (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography
        sx={{
          fontFamily: "Mukta",
          fontWeight: 500,
          fontSize: "16px",
          color: "#707070",
          mb: 2,
        }}
      >
        No history records found
      </Typography>
      <Typography
        sx={{
          fontFamily: "Mukta",
          fontWeight: 400,
          fontSize: "14px",
          color: "#9E9E9E",
        }}
      >
        {guardId ? "This guard has no recorded history yet." : "Please select a guard to view history."}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        width: "1052px",
        height: "840px",
        padding: "16px",
        borderRadius: "12px",
        background: "#F7F7F7",
      }}
    >
      <Box
        sx={{
          width: "1020px",
          height: "808px",
          gap: "12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Content Heading */}
        <Box
          sx={{
            width: "1020px",
            height: "24px",
            gap: "8px",
          }}
        >
          <Box
            sx={{
              width: "1020px",
              height: "24px",
              gap: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 600,
                fontSize: "24px",
                lineHeight: "32px",
                textTransform: "capitalize",
                color: "#3B3B3B",
              }}
            >
              History
            </Typography>
            {isRefetching && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                <Typography sx={{ fontSize: "12px", color: "#707070" }}>Refreshing...</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Divider */}
        <Divider
          sx={{
            width: "1020px",
            border: "1px solid #FFFFFF",
          }}
        />

        {/* Stats Display */}
        {!isLoading && !isError}

        {/* Tab Buttons */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: "494px",
              height: "42px",
              borderRadius: "11px",
              padding: "8px",
              gap: "8px",
              background: "#FFFFFF",
              display: "flex",
              mb: 2,
            }}
          >
            <Button
              onClick={() => setActiveTab("OVERTIME")}
              sx={{
                width: "235px",
                height: "26px",
                borderRadius: "8px",
                padding: "8px 24px",
                background: activeTab === "OVERTIME" ? "#2A77D5" : "#FFFFFF",
                color: activeTab === "OVERTIME" ? "#FFFFFF" : "#2A77D5",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                textTransform: "uppercase",
                border: "none",
                boxShadow: "0px 1px 4px 0px #70707033",
                "&:hover": {
                  background: activeTab === "OVERTIME" ? "#2A77D5" : "#F5F5F5",
                  border: "none",
                  boxShadow: "0px 1px 4px 0px #70707033",
                },
                "&:focus": {
                  outline: "none",
                  border: "none",
                },
              }}
            >
              Overtime
            </Button>
            <Button
              onClick={() => setActiveTab("TENURE")}
              sx={{
                width: "235px",
                height: "26px",
                borderRadius: "8px",
                padding: "8px 24px",
                background: activeTab === "TENURE" ? "#2A77D5" : "#FFFFFF",
                color: activeTab === "TENURE" ? "#FFFFFF" : "#2A77D5",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                textTransform: "uppercase",
                border: "none",
                boxShadow: "0px 1px 4px 0px #70707033",
                "&:hover": {
                  background: activeTab === "TENURE" ? "#2A77D5" : "#F5F5F5",
                  border: "none",
                  boxShadow: "0px 1px 4px 0px #70707033",
                },
                "&:focus": {
                  outline: "none",
                  border: "none",
                },
              }}
            >
              Tenure
            </Button>
          </Box>
        </Box>

        {/* Table Container */}
        <Box
          sx={{
            width: "1020px",
            background: "#FFFFFF",
            borderRadius: "8px",
            minHeight: "400px",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* Loading State */}
          {isLoading && <LoadingSkeleton />}

          {/* Error State */}
          {isError && <ErrorState />}

          {/* No Data State */}
          {!isLoading && !isError && currentData.length === 0 && <NoDataState />}

          {/* Data Table */}
          {!isLoading && !isError && currentData.length > 0 && (
            <TableContainer
              sx={{
                background: "#FFFFFF",
                borderRadius: "8px",
                height: "100%",
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ background: "#F8F9FA" }}>
                    {activeTab === "OVERTIME" ? (
                      <>
                        <TableCell sx={headerCellStyle}>Start Date</TableCell>
                        <TableCell sx={headerCellStyle}>End Date</TableCell>
                        <TableCell sx={headerCellStyle}>Shift</TableCell>
                        <TableCell sx={headerCellStyle}>Client</TableCell>
                        <TableCell sx={headerCellStyle}>Site</TableCell>
                        <TableCell sx={headerCellStyle}>Designation</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={headerCellStyle}>Tenure Start</TableCell>
                        <TableCell sx={headerCellStyle}>Tenure End</TableCell>
                        <TableCell sx={headerCellStyle}>Shift</TableCell>
                        <TableCell sx={headerCellStyle}>Client</TableCell>
                        <TableCell sx={headerCellStyle}>Site</TableCell>
                        <TableCell sx={headerCellStyle}>Designation</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#F8F9FA",
                        },
                      }}
                    >
                      {activeTab === "OVERTIME" ? (
                        <>
                          <TableCell sx={cellStyle}>{row.startDate}</TableCell>
                          <TableCell sx={cellStyle}>{row.endDate}</TableCell>
                          <TableCell sx={cellStyle}>{row.shift}</TableCell>
                          <TableCell sx={cellStyle}>{row.client}</TableCell>
                          <TableCell sx={cellStyle}>{row.site}</TableCell>
                          <TableCell sx={cellStyle}>{row.designation}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={cellStyle}>{row.startDate}</TableCell>
                          <TableCell sx={cellStyle}>{row.endDate}</TableCell>
                          <TableCell sx={cellStyle}>{row.shift}</TableCell>
                          <TableCell sx={cellStyle}>{row.client}</TableCell>
                          <TableCell sx={cellStyle}>{row.site}</TableCell>
                          <TableCell sx={cellStyle}>{row.designation}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default HistoryWindow;
