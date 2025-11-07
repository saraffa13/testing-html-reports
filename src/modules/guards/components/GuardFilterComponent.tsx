import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import { Box, Button, Divider, InputAdornment, TextField, Typography } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import React, { useEffect, useState } from "react";
import type { Guard } from "../context/GuardContext"; // Import the Guard interface
// Import the Guard interface

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

// Interface for filter component props
interface FilterComponentProps {
  onApplyFilters: (filters: FilterState) => void;
  onClose: () => void;
  allGuards: Guard[]; // Now properly typed with the Guard interface
}

const FilterComponent: React.FC<FilterComponentProps> = ({ onApplyFilters, allGuards }) => {
  // Initial filter state
  const initialFilterState: FilterState = {
    guardTypes: [],
    psaraStatus: [],
    shiftStart: null,
    shiftEnd: null,
    clients: [],
    areaOfficers: [],
    trustScore: null,
  };

  // The rest of your component remains unchanged
  // Filter state
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Search states for clients and area officers
  const [clientSearch, setClientSearch] = useState("");
  const [officerSearch, setOfficerSearch] = useState("");

  // Get unique values from guard data
  const guardTypes = Array.from(new Set(allGuards.map((guard) => guard.type)));
  const allClients = Array.from(new Set(allGuards.map((guard) => guard.assignedClient)));
  const allOfficers = Array.from(new Set(allGuards.map((guard) => guard.areaOfficer)));

  // Filtered clients and officers based on search
  const filteredClients = allClients.filter((client) => client.toLowerCase().includes(clientSearch.toLowerCase()));

  const filteredOfficers = allOfficers.filter((officer) => officer.toLowerCase().includes(officerSearch.toLowerCase()));

  // Apply filters automatically when they change
  useEffect(() => {
    onApplyFilters(filters);
  }, [filters, onApplyFilters]);

  // Handler for selecting guard types
  const handleGuardTypeChange = (type: string) => {
    setFilters((prev) => {
      if (prev.guardTypes.includes(type)) {
        return { ...prev, guardTypes: prev.guardTypes.filter((t) => t !== type) };
      } else {
        return { ...prev, guardTypes: [...prev.guardTypes, type] };
      }
    });
  };

  // Handler for selecting PSARA status
  const handlePsaraStatusChange = (status: string) => {
    setFilters((prev) => {
      if (prev.psaraStatus.includes(status)) {
        return { ...prev, psaraStatus: prev.psaraStatus.filter((s) => s !== status) };
      } else {
        return { ...prev, psaraStatus: [...prev.psaraStatus, status] };
      }
    });
  };

  // Handler for selecting clients
  const handleClientChange = (client: string) => {
    setFilters((prev) => {
      if (prev.clients.includes(client)) {
        return { ...prev, clients: prev.clients.filter((c) => c !== client) };
      } else {
        return { ...prev, clients: [...prev.clients, client] };
      }
    });
  };

  // Handler for selecting area officers
  const handleOfficerChange = (officer: string) => {
    setFilters((prev) => {
      if (prev.areaOfficers.includes(officer)) {
        return { ...prev, areaOfficers: prev.areaOfficers.filter((o) => o !== officer) };
      } else {
        return { ...prev, areaOfficers: [...prev.areaOfficers, officer] };
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
    setClientSearch("");
    setOfficerSearch("");
  };

  // The rest of your component remains unchanged - the UI JSX stays exactly the same
  return (
    <Box
      sx={{
        width: 323,
        height: 820,
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
      {/* The rest of your JSX stays exactly the same */}
      {/* Only the import at the top needs to change */}

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
        {/* Guard Type */}
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
            Guard Type
          </Typography>
          <Box sx={{ width: 291, display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {guardTypes.map((type) => (
              <Box
                key={type}
                onClick={() => handleGuardTypeChange(type)}
                sx={{
                  height: 24,
                  paddingTop: "4px",
                  paddingRight: "12px",
                  paddingBottom: "4px",
                  paddingLeft: "12px",
                  borderRadius: "20px",
                  background: filters.guardTypes.includes(type) ? "#F1F7FE" : "#F7F7F7",
                  border: filters.guardTypes.includes(type)
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
                  {type}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Divider sx={{ width: 291, border: "1px solid #F0F0F0" }} />
        {/* PSARA Certification Status */}
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
            PSARA Certification Status
          </Typography>
          <Box sx={{ width: 291, display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {["Pending", "Completed"].map((status) => (
              <Box
                key={status}
                onClick={() => handlePsaraStatusChange(status)}
                sx={{
                  height: 24,
                  paddingTop: "4px",
                  paddingRight: "12px",
                  paddingBottom: "4px",
                  paddingLeft: "12px",
                  borderRadius: "20px",
                  background: filters.psaraStatus.includes(status) ? "#F1F7FE" : "#F7F7F7",
                  border: filters.psaraStatus.includes(status)
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
                  {status}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Divider sx={{ width: 291, border: "1px solid #F0F0F0" }} />
        {/* Shifts */}
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
            Shift
          </Typography>
          <Box sx={{ width: 254, display: "flex", gap: "32px" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ width: 111, height: 48, display: "flex", flexDirection: "column" }}>
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "16px",
                    letterSpacing: "0%",
                    color: "#707070",
                    paddingRight: "8px",
                    paddingLeft: "8px",
                    marginBottom: "2px",
                  }}
                >
                  Starting
                </Typography>
                <TimePicker
                  value={filters.shiftStart}
                  onChange={(newValue) => setFilters((prev) => ({ ...prev, shiftStart: newValue }))}
                  ampm={false}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      placeholder: "hh:mm",
                      size: "small",
                      sx: {
                        width: 111,
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
                          padding: "8px 16px",
                          height: "16px",
                          fontFamily: "Mukta",
                          fontSize: "14px",
                          color: "#3B3B3B",
                        },
                      },
                    },
                  }}
                  slots={{
                    openPickerIcon: AccessTimeIcon,
                  }}
                />
              </Box>
              <Box sx={{ width: 111, height: 48, display: "flex", flexDirection: "column" }}>
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "16px",
                    letterSpacing: "0%",
                    color: "#707070",
                    paddingRight: "8px",
                    paddingLeft: "8px",
                    marginBottom: "2px",
                  }}
                >
                  Ending
                </Typography>
                <TimePicker
                  value={filters.shiftEnd}
                  onChange={(newValue) => setFilters((prev) => ({ ...prev, shiftEnd: newValue }))}
                  ampm={false}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      placeholder: "hh:mm",
                      size: "small",
                      sx: {
                        width: 111,
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
                          padding: "8px 16px",
                          height: "16px",
                          fontFamily: "Mukta",
                          fontSize: "14px",
                          color: "#3B3B3B",
                        },
                      },
                    },
                  }}
                  slots={{
                    openPickerIcon: AccessTimeIcon,
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </Box>
        <Divider sx={{ width: 291, border: "1px solid #F0F0F0" }} />
        {/* Clients */}
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
            Client
          </Typography>
          <Box sx={{ width: 291, gap: "8px", display: "flex", flexDirection: "column" }}>
            <TextField
              placeholder="Search Client By Name Or ID"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              size="small"
              sx={{
                width: 291,
                height: 24,
                "& .MuiOutlinedInput-root": {
                  height: 24,
                  paddingTop: "3px",
                  paddingBottom: "3px",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontFamily: "Mukta",
                  letterSpacing: "2%",
                  "& fieldset": {
                    borderColor: "#C2DBFA",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: 0,
                  height: "18px",
                  fontFamily: "Mukta",
                  fontSize: "16px",
                  color: "#BDBDBD",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ width: 16, height: 16, color: "#BDBDBD" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box
              sx={{
                maxHeight: 150,
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
              {filteredClients.map((client) => (
                <Box
                  key={client}
                  sx={{
                    width: "100%",
                    height: 16,
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    paddingLeft: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleClientChange(client)}
                >
                  {filters.clients.includes(client) ? (
                    <CheckBoxIcon sx={{ width: 16, height: 16, color: "#2A77D5" }} />
                  ) : (
                    <CheckBoxOutlineBlankIcon sx={{ width: 16, height: 16, color: "#2A77D5" }} />
                  )}
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "16px",
                      letterSpacing: "0%",
                      color: "#3B3B3B",
                    }}
                  >
                    {client}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        <Divider sx={{ width: 291, border: "1px solid #F0F0F0" }} />
        {/* Area Officer */}
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
            Area Officer
          </Typography>
          <Box sx={{ width: 291, gap: "8px", display: "flex", flexDirection: "column" }}>
            <TextField
              placeholder="Search Area Officer By Name Or ID"
              value={officerSearch}
              onChange={(e) => setOfficerSearch(e.target.value)}
              size="small"
              sx={{
                width: 291,
                height: 24,
                "& .MuiOutlinedInput-root": {
                  height: 24,
                  paddingTop: "3px",
                  paddingBottom: "3px",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontFamily: "Mukta",
                  letterSpacing: "2%",
                  "& fieldset": {
                    borderColor: "#C2DBFA",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: 0,
                  height: "18px",
                  fontFamily: "Mukta",
                  fontSize: "16px",
                  color: "#BDBDBD",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ width: 16, height: 16, color: "#BDBDBD" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box
              sx={{
                maxHeight: 150,
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
              {filteredOfficers.map((officer) => (
                <Box
                  key={officer}
                  sx={{
                    width: "100%",
                    height: 16,
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    paddingLeft: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOfficerChange(officer)}
                >
                  {filters.areaOfficers.includes(officer) ? (
                    <CheckBoxIcon sx={{ width: 16, height: 16, color: "#2A77D5" }} />
                  ) : (
                    <CheckBoxOutlineBlankIcon sx={{ width: 16, height: 16, color: "#2A77D5" }} />
                  )}
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "16px",
                      letterSpacing: "0%",
                      color: "#3B3B3B",
                    }}
                  >
                    {officer}
                  </Typography>
                </Box>
              ))}
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

export default FilterComponent;
