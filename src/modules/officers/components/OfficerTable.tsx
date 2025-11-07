import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SortIcon from "@mui/icons-material/Sort";
import {
  Avatar,
  Box,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Officer, useOfficers } from "../context/OfficerContext";

// Interface for filtering
interface FilterState {
  assignedAreas: string[];
  guardsCountMin: number | null;
  guardsCountMax: number | null;
  sitesCountMin: number | null;
  sitesCountMax: number | null;
  trustScore: number | null;
}

// Interface for column definition
interface Column {
  id: keyof Officer;
  label: string;
  width: number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  format?: (value: any) => React.ReactNode;
}

// Column definitions - Adjusted widths to fit within 1240px container
const columns: Column[] = [
  { id: "companyId", label: "Company ID", width: 95, sortable: true },
  {
    id: "photo",
    label: "Photo",
    width: 65,
    align: "center",
    format: (value: string) => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Avatar
          src={value}
          alt="Officer"
          sx={{
            width: 35,
            height: 35,
            borderRadius: "10px",
            border: "2px solid #F0F0F0",
          }}
        />
      </Box>
    ),
  },
  { id: "name", label: "Officer Name", width: 180, sortable: true },
  { id: "designation", label: "Designation", width: 130, sortable: true },
  { id: "assignedArea", label: "Assigned Area", width: 160, sortable: true },
  { id: "shiftTime", label: "Shift", width: 100 },
  {
    id: "assignedSites",
    label: "Assigned Sites",
    width: 110,
    align: "center",
    sortable: true,
    format: (value: number) => (
      <Typography
        sx={{
          fontFamily: "Mukta",
          fontWeight: 400,
          fontSize: "13px",
          lineHeight: "16px",
          color: "#3B3B3B",
          textAlign: "center",
        }}
      >
        {value}
      </Typography>
    ),
  },
  {
    id: "assignedGuards",
    label: "Assigned Guards",
    width: 120,
    align: "center",
    sortable: true,
    format: (value: number) => (
      <Typography
        sx={{
          fontFamily: "Mukta",
          fontWeight: 400,
          fontSize: "13px",
          lineHeight: "16px",
          color: "#3B3B3B",
          textAlign: "center",
        }}
      >
        {value}
      </Typography>
    ),
  },
  { id: "phoneNumber", label: "Phone Number", width: 125 },
  {
    id: "upAndUpTrust",
    label: "UpAndUp Trust",
    width: 110,
    align: "center",
    sortable: true,
    format: (value: number) => (
      <Box
        sx={{
          width: "40px",
          height: "17px",
          gap: "10px",
          borderRadius: "4px",
          padding: "4px",
          backgroundColor: getTrustScoreColor(value),
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "16px",
            color: "#FFFFFF",
          }}
        >
          {value.toFixed(2)}
        </Typography>
      </Box>
    ),
  },
];

// Helper function to get color based on trust score
const getTrustScoreColor = (score: number): string => {
  if (score >= 4.5) return "#76CB80"; // Green-400
  if (score >= 4.0) return "#48BB78"; // Green-500
  if (score >= 3.5) return "#F6AD55"; // Orange-400
  if (score >= 3.0) return "#ED8936"; // Orange-500
  return "#F56565"; // Red-500
};

// Main OfficerTable component
interface OfficerTableProps {
  filters?: FilterState | null;
}

const OfficerTable: React.FC<OfficerTableProps> = ({ filters }) => {
  const navigate = useNavigate();
  const { officers } = useOfficers(); // Use officers from context
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Officer>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Use officers from context
  const fullOfficerList = useMemo(() => officers, [officers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  // Apply filters to the data
  const filteredOfficers = useMemo(() => {
    if (!filters) return fullOfficerList;

    return fullOfficerList.filter((officer) => {
      // Filter by assigned area
      if (filters.assignedAreas.length > 0 && !filters.assignedAreas.includes(officer.assignedArea)) {
        return false;
      }

      // Filter by guards count
      if (filters.guardsCountMin !== null && officer.assignedGuards < filters.guardsCountMin) {
        return false;
      }

      if (filters.guardsCountMax !== null && officer.assignedGuards > filters.guardsCountMax) {
        return false;
      }

      // Filter by sites count
      if (filters.sitesCountMin !== null && officer.assignedSites < filters.sitesCountMin) {
        return false;
      }

      if (filters.sitesCountMax !== null && officer.assignedSites > filters.sitesCountMax) {
        return false;
      }

      // Filter by trust score
      if (filters.trustScore !== null) {
        const scoreMap = {
          4: { min: 4.0, max: Infinity },
          3: { min: 3.0, max: Infinity },
          2: { min: 2.0, max: 3.0 },
          1: { min: 0.0, max: 2.0 },
        };

        const scoreRange = scoreMap[filters.trustScore as keyof typeof scoreMap];
        if (scoreRange) {
          if (officer.upAndUpTrust < scoreRange.min || officer.upAndUpTrust > scoreRange.max) {
            return false;
          }
        }
      }

      return true;
    });
  }, [filters, fullOfficerList]);

  // Handle sort column
  const handleRequestSort = (property: keyof Officer) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle dropdown rows per page change
  const handleRowsPerPageDropdownChange = (event: any) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  // Handle row click to navigate to officer details
  const handleRowClick = (officer: Officer) => {
    // Navigate to officer performance page using guardId
    navigate(`/officers/${officer.guardId}/performance`);
  };

  // Sort function
  const sortedOfficers = React.useMemo(() => {
    const comparator = (a: Officer, b: Officer) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (typeof aValue === "string" && typeof bValue === "string") {
        if (order === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        if (order === "asc") {
          return (aValue as any) - (bValue as any);
        } else {
          return (bValue as any) - (aValue as any);
        }
      }
    };

    return [...filteredOfficers].sort(comparator);
  }, [order, orderBy, filteredOfficers]);

  // Get current page data
  const currentPageOfficers = sortedOfficers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Get sort icon
  const getSortIcon = (column: Column) => {
    if (!column.sortable) return null;

    if (orderBy === column.id) {
      return order === "asc" ? (
        <ArrowUpwardIcon sx={{ width: 16, height: 16 }} />
      ) : (
        <ArrowDownwardIcon sx={{ width: 16, height: 16 }} />
      );
    } else {
      return <SortIcon sx={{ width: 16, height: 16, opacity: 0.5 }} />;
    }
  };

  return (
    <Box sx={{ width: "1240px", minHeight: "400px", maxHeight: "812px", gap: "16px", borderRadius: "16px" }}>
      <TableContainer
        component={Paper}
        sx={{
          width: "1240px",
          minHeight: "200px",
          maxHeight: "705.2px",
          borderRadius: "16px",
          backgroundColor: "#F7F7F7",
          overflow: "hidden", // Remove horizontal scroll
          overflowY: "auto", // Only allow vertical scroll
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#dddddd",
            borderRadius: "4px",
          },
        }}
      >
        <Table
          stickyHeader
          sx={{
            width: "100%", // Use 100% instead of fixed width
            minWidth: "1200px", // Minimum width to ensure content fits
            borderRadius: "16px",
            border: "1px solid #F0F0F0",
            tableLayout: "fixed", // Fixed layout for consistent column widths
            // Remove fixed height so table adapts to content
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  sx={{
                    width: `${column.width}px`,
                    maxWidth: `${column.width}px`,
                    minWidth: `${column.width}px`,
                    height: "56px",
                    padding: column.id === "photo" ? "4px 8px 4px 8px" : "4px 8px 4px 8px",
                    gap: "8px",
                    borderBottom: "1px solid #F0F0F0",
                    background: "#FFFFFF",
                    cursor: column.sortable ? "pointer" : "default",
                    "&:hover": column.sortable ? { backgroundColor: "#fafafa" } : {},
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    if (column.sortable) {
                      handleRequestSort(column.id);
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: column.sortable ? "space-between" : "flex-start",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: "Mukta",
                        fontWeight: 600,
                        fontSize: "12px",
                        lineHeight: "16px",
                        letterSpacing: "0%",
                        textTransform: "capitalize",
                        color: "#3B3B3B",
                        padding: "4px 0",
                      }}
                    >
                      {column.label}
                    </Typography>
                    {column.sortable && getSortIcon(column)}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageOfficers.length > 0 ? (
              currentPageOfficers.map((officer, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => handleRowClick(officer)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#fafafa",
                      cursor: "pointer",
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = officer[column.id];
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align || "left"}
                        sx={{
                          width: `${column.width}px`,
                          maxWidth: `${column.width}px`,
                          minWidth: `${column.width}px`,
                          height: "56px",
                          padding: column.id === "photo" ? "8px 12px" : "8px 8px",
                          borderBottom: "1px solid #F0F0F0",
                          backgroundColor: "#FFFFFF",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {column.format ? (
                          column.format(value)
                        ) : (
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 400,
                              fontSize: "13px",
                              lineHeight: "16px",
                              color: "#3B3B3B",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={value as string} // Add tooltip for full text
                          >
                            {value as string}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  <Typography sx={{ color: "#707070", fontFamily: "Mukta" }}>
                    No officers match the current filters. Try adjusting your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box
        sx={{
          width: "1240px",
          height: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingRight: "24px",
          paddingBottom: "8px",
          paddingLeft: "24px",
          marginTop: "16px", // Add margin to separate from table
        }}
      >
        {/* Left side - Show rows dropdown */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "0%",
              textTransform: "capitalize",
              color: "#898989",
            }}
          >
            Show
          </Typography>
          <FormControl size="small">
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageDropdownChange}
              sx={{
                minWidth: "60px",
                height: "24px",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "12px",
                color: "#2A77D5",
                border: "none",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid #2A77D5",
                },
                "& .MuiSelect-select": {
                  padding: "2px 24px 2px 8px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiSelect-icon": {
                  color: "#2A77D5",
                  fontSize: "16px",
                },
              }}
              IconComponent={KeyboardArrowDownIcon}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 200,
                    borderRadius: "8px",
                    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.1)",
                    "& .MuiMenuItem-root": {
                      fontFamily: "Mukta",
                      fontSize: "12px",
                      color: "#3B3B3B",
                      "&:hover": {
                        backgroundColor: "#F0F7FF",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "#E3F0FF",
                        color: "#2A77D5",
                        "&:hover": {
                          backgroundColor: "#E3F0FF",
                        },
                      },
                    },
                  },
                },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "0%",
              textTransform: "capitalize",
              color: "#898989",
            }}
          >
            rows
          </Typography>
        </Box>

        {/* Right side - Pagination controls */}
        <TablePagination
          component="div"
          count={sortedOfficers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[]} // Hide the default rows per page selector
          sx={{
            ".MuiTablePagination-toolbar": {
              padding: 0,
            },
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              fontFamily: "Mukta",
              fontWeight: 500,
              fontSize: "12px",
              color: "#898989",
            },
            ".MuiTablePagination-select": {
              display: "none",
            },
            ".MuiTablePagination-actions": {
              marginLeft: 0,
            },
          }}
          ActionsComponent={() => (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Box
                onClick={() => handleChangePage({} as any, Math.max(0, page - 1))}
                sx={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  cursor: page === 0 ? "default" : "pointer",
                  opacity: page === 0 ? 0.5 : 1,
                }}
              >
                <ChevronLeftIcon />
              </Box>
              {[...Array(Math.min(5, Math.ceil(sortedOfficers.length / rowsPerPage)))].map((_, index) => (
                <Box
                  key={index}
                  onClick={() => handleChangePage({} as any, index)}
                  sx={{
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                    backgroundColor: page === index ? "#2A77D5" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "16px",
                      color: page === index ? "#FFFFFF" : "#898989",
                    }}
                  >
                    {index + 1}
                  </Typography>
                </Box>
              ))}
              <Box
                onClick={() =>
                  handleChangePage({} as any, Math.min(Math.ceil(sortedOfficers.length / rowsPerPage) - 1, page + 1))
                }
                sx={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  cursor: page >= Math.ceil(sortedOfficers.length / rowsPerPage) - 1 ? "default" : "pointer",
                  opacity: page >= Math.ceil(sortedOfficers.length / rowsPerPage) - 1 ? 0.5 : 1,
                }}
              >
                <ChevronRightIcon />
              </Box>
            </Box>
          )}
        />
      </Box>
    </Box>
  );
};

export default OfficerTable;
