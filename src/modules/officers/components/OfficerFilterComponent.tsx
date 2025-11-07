import StarIcon from "@mui/icons-material/Star";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { type Officer } from "../context/OfficerContext";

// Interface for filter state
interface FilterState {
  assignedAreas: string[];
  guardsCountMin: number | null;
  guardsCountMax: number | null;
  sitesCountMin: number | null;
  sitesCountMax: number | null;
  trustScore: number | null;
}

interface OfficerFilterComponentProps {
  onApplyFilters: (filters: FilterState) => void;
  onClose: () => void;
  allOfficers: Officer[];
}

const OfficerFilterComponent: React.FC<OfficerFilterComponentProps> = ({ onApplyFilters, allOfficers }) => {
  // Initial filter state
  const initialFilterState: FilterState = {
    assignedAreas: [],
    guardsCountMin: null,
    guardsCountMax: null,
    sitesCountMin: null,
    sitesCountMax: null,
    trustScore: null,
  };

  // Filter state
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Search state for areas
  const [, setAreaSearch] = useState("");

  // Get unique values from officer data
  const allAreas = Array.from(new Set(allOfficers.map((officer) => officer.assignedArea)));

  // Filtered areas based on search

  // Apply filters automatically when they change
  useEffect(() => {
    onApplyFilters(filters);
  }, [filters, onApplyFilters]);

  // Handler for selecting areas
  const handleAreaChange = (area: string) => {
    setFilters((prev) => {
      if (prev.assignedAreas.includes(area)) {
        return { ...prev, assignedAreas: prev.assignedAreas.filter((a) => a !== area) };
      } else {
        return { ...prev, assignedAreas: [...prev.assignedAreas, area] };
      }
    });
  };

  // Handler for selecting trust score
  const handleTrustScoreChange = (score: number | null) => {
    setFilters((prev) => ({ ...prev, trustScore: score }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters(initialFilterState);
    setAreaSearch("");
  };

  return (
    <Box
      sx={{
        width: 323,
        height: 550,
        position: "absolute",
        top: "50px",
        left: "707px",
        paddingTop: "16px",
        paddingRight: "16px",
        paddingBottom: "24px",
        paddingLeft: "16px",
        gap: "12px",
        borderRadius: "10px",
        background: "#FFFFFF",
        boxShadow: "0px 1px 4px 0px #70707033",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
      }}
    >
      {/* Title Bar */}
      <Box
        sx={{
          width: 291,
          height: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
        }}
      >
        <Typography
          sx={{
            height: 10,
            fontFamily: "Mukta",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0%",
            color: "#A3A3A3",
            paddingTop: "3px",
            paddingBottom: "3px",
          }}
        >
          FILTER BY
        </Typography>
        <Button
          onClick={handleResetFilters}
          sx={{
            marginTop: "15px",
            height: "9px",
            width: "37px",
            padding: "15px",
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "16px",
            letterSpacing: "0%",
            textTransform: "uppercase",
            color: "#2A77D5",
          }}
        >
          RESET
        </Button>
      </Box>

      <Divider sx={{ width: 291, border: "1px solid #F0F0F0" }} />

      {/* List Container */}
      <Box
        sx={{
          width: 291,
          height: 732,
          gap: "16px",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#dddddd",
            borderRadius: "4px",
          },
        }}
      >
        {/* Area */}
        <Box sx={{ width: 291, gap: "8px", display: "flex", flexDirection: "column" }}>
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "16px",
              letterSpacing: "0%",
              textTransform: "capitalize",
              color: "#707070",
              paddingTop: "3px",
              paddingBottom: "4px",
            }}
          >
            Area
          </Typography>
          <Box sx={{ width: 291, display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {/* Show only first few areas as chips like in the screenshot */}
            {allAreas.slice(0, 4).map((area) => (
              <Box
                key={area}
                onClick={() => handleAreaChange(area)}
                sx={{
                  height: 24,
                  paddingTop: "4px",
                  paddingRight: "12px",
                  paddingBottom: "4px",
                  paddingLeft: "12px",
                  borderRadius: "20px",
                  background: filters.assignedAreas.includes(area) ? "#F1F7FE" : "#F7F7F7",
                  border: filters.assignedAreas.includes(area)
                    ? "2px solid var(--Blue-600, #2A77D5)"
                    : "2px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    letterSpacing: "0%",
                    color: "#629DE4",
                  }}
                >
                  {area.length > 15 ? `${area.substring(0, 15)}...` : area}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ width: 291, border: "1px solid #F0F0F0" }} />

        {/* Guards Count */}
        <Box sx={{ width: 291, height: "auto", gap: "8px", display: "flex", flexDirection: "column" }}>
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "16px",
              letterSpacing: "0%",
              textTransform: "capitalize",
              color: "#707070",
              paddingTop: "3px",
              paddingBottom: "4px",
            }}
          >
            Guards Count
          </Typography>
          <Box sx={{ width: 291, display: "flex", gap: "16px", alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  letterSpacing: "0%",
                  color: "#707070",
                }}
              >
                Min
              </Typography>
              <TextField
                placeholder="Count"
                type="number"
                value={filters.guardsCountMin || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    guardsCountMin: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
                size="small"
                sx={{
                  width: 120,
                  height: 32,
                  "& .MuiOutlinedInput-root": {
                    height: 32,
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "Mukta",
                    "& fieldset": {
                      borderColor: "#A3A3A3",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: "8px 12px",
                    height: "16px",
                    fontFamily: "Mukta",
                    fontSize: "14px",
                    color: "#3B3B3B",
                  },
                }}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  letterSpacing: "0%",
                  color: "#707070",
                }}
              >
                Max
              </Typography>
              <TextField
                placeholder="Count"
                type="number"
                value={filters.guardsCountMax || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    guardsCountMax: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
                size="small"
                sx={{
                  width: 120,
                  height: 32,
                  "& .MuiOutlinedInput-root": {
                    height: 32,
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "Mukta",
                    "& fieldset": {
                      borderColor: "#A3A3A3",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: "8px 12px",
                    height: "16px",
                    fontFamily: "Mukta",
                    fontSize: "14px",
                    color: "#3B3B3B",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ width: 291, border: "1px solid #F0F0F0" }} />

        {/* Client Sites Count */}
        <Box sx={{ width: 291, height: "auto", gap: "8px", display: "flex", flexDirection: "column" }}>
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "16px",
              letterSpacing: "0%",
              textTransform: "capitalize",
              color: "#707070",
              paddingTop: "3px",
              paddingBottom: "4px",
            }}
          >
            Client Sites Count
          </Typography>
          <Box sx={{ width: 291, display: "flex", gap: "16px", alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  letterSpacing: "0%",
                  color: "#707070",
                }}
              >
                Min
              </Typography>
              <TextField
                placeholder="Count"
                type="number"
                value={filters.sitesCountMin || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sitesCountMin: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
                size="small"
                sx={{
                  width: 120,
                  height: 32,
                  "& .MuiOutlinedInput-root": {
                    height: 32,
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "Mukta",
                    "& fieldset": {
                      borderColor: "#A3A3A3",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: "8px 12px",
                    height: "16px",
                    fontFamily: "Mukta",
                    fontSize: "14px",
                    color: "#3B3B3B",
                  },
                }}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  letterSpacing: "0%",
                  color: "#707070",
                }}
              >
                Max
              </Typography>
              <TextField
                placeholder="Count"
                type="number"
                value={filters.sitesCountMax || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sitesCountMax: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
                size="small"
                sx={{
                  width: 120,
                  height: 32,
                  "& .MuiOutlinedInput-root": {
                    height: 32,
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "Mukta",
                    "& fieldset": {
                      borderColor: "#A3A3A3",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: "8px 12px",
                    height: "16px",
                    fontFamily: "Mukta",
                    fontSize: "14px",
                    color: "#3B3B3B",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ width: 291, border: "1px solid #F0F0F0" }} />

        {/* Trust Score */}
        <Box sx={{ width: 291, height: "auto", gap: "8px", display: "flex", flexDirection: "column" }}>
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "16px",
              letterSpacing: "0%",
              textTransform: "capitalize",
              color: "#707070",
              paddingTop: "3px",
              paddingBottom: "4px",
            }}
          >
            Trust Score
          </Typography>
          <Box sx={{ width: 291, display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {[
              { score: 4, label: "4 +", color: "#41AA4D", minValue: 4.0 },
              { score: 3, label: "3 +", color: "#E4C710", minValue: 3.0 },
              { score: 2, label: "Upto 3", color: "#E38631", minValue: 2.0, maxValue: 3.0 },
              { score: 1, label: "Upto 2", color: "#E05952", minValue: 0.0, maxValue: 2.0 },
            ].map((item) => (
              <Box
                key={item.score}
                onClick={() => handleTrustScoreChange(filters.trustScore === item.score ? null : item.score)}
                sx={{
                  height: 28,
                  paddingTop: "4px",
                  paddingRight: "12px",
                  paddingBottom: "4px",
                  paddingLeft: "12px",
                  borderRadius: "20px",
                  background: filters.trustScore === item.score ? "#629DE4" : "#F7F7F7",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <StarIcon
                  sx={{
                    width: 20,
                    height: 20,
                    color: filters.trustScore === item.score ? "#FFFFFF" : item.color,
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    letterSpacing: "0%",
                    color: filters.trustScore === item.score ? "#FFFFFF" : "#3B3B3B",
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerFilterComponent;
