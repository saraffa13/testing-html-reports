// Updated GuardDefaultsComponent.tsx

import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { format } from "date-fns";
import React, { useState } from "react";
import DefaultFilterTabs from "./DefaultFilterTabs";
import PatrolContent from "./PatrolContent";
import TimeWheelContent from "./TimeWheelContent";
import UniformContent from "./UniformContent";
import type { DefaultData, DefaultType } from "./defaults-types";

interface DefaultsCardProps {
  defaults: DefaultData[];
  width?: string | number;
  height?: string | number;
  // New props for week/month dropdown view
  isWeekOrMonthView?: boolean;
  availableDatesInPeriod?: Array<{
    date: Date;
    defaultsCount: number;
  }>;
  selectedDateInPeriod?: Date | null;
  onDateSelectionInPeriod?: (date: Date) => void;
  periodType?: "WEEK" | "MONTH";
  periodRange?: string;
}

// Helper function to format date as DD-MM-YYYY
const formatDateDDMMYYYY = (date: Date): string => {
  return format(date, "dd-MM-yyyy");
};

// Helper function to format date with day name for dropdown
const formatDateForDropdown = (date: Date): string => {
  const dayName = format(date, "EEE");
  const dateStr = formatDateDDMMYYYY(date);
  return `${dayName} ${dateStr}`;
};

/**
 * Main defaults card component that displays guard defaults with filter tabs
 * Enhanced to support week/month view with dropdown date selection
 */
const DefaultsCard: React.FC<DefaultsCardProps> = ({
  defaults,
  width = "502px",
  height = "288px",
  isWeekOrMonthView = false,
  availableDatesInPeriod = [],
  selectedDateInPeriod,
  onDateSelectionInPeriod,
  periodType,
  periodRange,
}) => {
  // Get available default types
  const availableTypes = defaults.map((d) => d.type);

  // Set initial selected type to first available type
  const [selectedType, setSelectedType] = useState<DefaultType>(availableTypes.length > 0 ? availableTypes[0] : "LATE");

  // Get selected default data
  const selectedDefault = defaults.find((d) => d.type === selectedType);

  // Get title text based on selected type and view
  const getTitleText = (): string => {
    if (isWeekOrMonthView) {
      if (selectedDateInPeriod) {
        return `DEFAULTS : ${formatDateDDMMYYYY(selectedDateInPeriod)}`;
      }
      return `DEFAULTS : ${periodType} (${periodRange})`;
    }

    switch (selectedType) {
      case "LATE":
        return "DEFAULTS : LATE";
      case "UNIFORM":
        return "DEFAULTS : UNIFORM";
      case "ALERTNESS":
        return "DEFAULTS : ALERTNESS";
      case "GEOFENCE":
        return "DEFAULTS : GEOFENCE";
      case "PATROL":
        return "DEFAULTS : PATROL";
      default:
        return "DEFAULTS";
    }
  };

  // Handle dropdown date selection
  const handleDropdownDateChange = (dateString: string) => {
    const selectedDate = availableDatesInPeriod.find((item) => formatDateDDMMYYYY(item.date) === dateString);
    if (selectedDate && onDateSelectionInPeriod) {
      onDateSelectionInPeriod(selectedDate.date);
    }
  };

  // Render dropdown for week/month view
  const renderDropdownView = () => {
    return (
      <Box
        sx={{
          width: "470px",
          height: "168px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          paddingTop: "16px",
          paddingBottom: "16px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {availableDatesInPeriod.length > 0 ? (
          <>
            {/* Dropdown for date selection */}
            <FormControl
              sx={{
                minWidth: 280,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E0E0E0",
                  "&:hover": {
                    borderColor: "#2A77D5",
                  },
                  "&.Mui-focused": {
                    borderColor: "#2A77D5",
                  },
                },
              }}
            >
              <Select
                value={selectedDateInPeriod ? formatDateDDMMYYYY(selectedDateInPeriod) : ""}
                onChange={(e) => handleDropdownDateChange(e.target.value)}
                displayEmpty
                sx={{
                  height: "40px",
                  fontFamily: "Mukta",
                  fontSize: "14px",
                  "& .MuiSelect-select": {
                    paddingTop: "10px",
                    paddingBottom: "10px",
                  },
                }}
              >
                <MenuItem disabled value="">
                  <Typography sx={{ fontFamily: "Mukta", color: "#707070", fontSize: "14px" }}>
                    Select a date with defaults
                  </Typography>
                </MenuItem>
                {availableDatesInPeriod.map((item) => (
                  <MenuItem
                    key={formatDateDDMMYYYY(item.date)}
                    value={formatDateDDMMYYYY(item.date)}
                    sx={{
                      fontFamily: "Mukta",
                      fontSize: "14px",
                      "&:hover": {
                        backgroundColor: "#F0F7FF",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <Typography sx={{ fontFamily: "Mukta", fontSize: "14px" }}>
                        {formatDateForDropdown(item.date)}
                      </Typography>
                      <Typography sx={{ fontFamily: "Mukta", fontSize: "12px", color: "#707070" }}>
                        {item.defaultsCount} default{item.defaultsCount > 1 ? "s" : ""}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Summary */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: "8px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#707070",
                  textAlign: "center",
                }}
              >
                {availableDatesInPeriod.length} day{availableDatesInPeriod.length > 1 ? "s" : ""} with defaults in this{" "}
                {periodType?.toLowerCase()}
              </Typography>
            </Box>
          </>
        ) : (
          // No dates with defaults
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Box
              sx={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#F0F0F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "20px",
                  color: "#CCCCCC",
                }}
              >
                📅
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "14px",
                color: "#707070",
                textAlign: "center",
              }}
            >
              No defaults found in this {periodType?.toLowerCase()}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Render content based on selected type
  const renderContent = () => {
    if (isWeekOrMonthView) {
      return renderDropdownView();
    }

    if (!selectedDefault) {
      return (
        <Box
          sx={{
            width: "470px",
            height: "168px",
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
              color: "#707070",
            }}
          >
            No data available for this default type.
          </Typography>
        </Box>
      );
    }

    switch (selectedType) {
      case "UNIFORM":
        return <UniformContent errors={selectedDefault.uniformErrors || []} />;
      case "PATROL":
        return <PatrolContent errors={selectedDefault.patrolErrors || []} />;
      case "LATE":
      case "ALERTNESS":
      case "GEOFENCE":
        return (
          <TimeWheelContent
            timeWheelData={selectedDefault.timeWheel!}
            displayText={selectedDefault.displayText || ""}
          />
        );
      default:
        return null;
    }
  };

  // If no defaults available and not week/month view, show empty state
  if (defaults.length === 0 && !isWeekOrMonthView) {
    return (
      <Box
        sx={{
          width: width,
          height: height,
          borderRadius: "10px",
          padding: "16px",
          gap: "16px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Empty State Icon */}
        <Box
          sx={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#F0F0F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "32px",
              color: "#CCCCCC",
            }}
          >
            👤
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "16px",
            color: "#CCCCCC",
            textAlign: "center",
          }}
        >
          DEFAULTS
        </Typography>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 400,
            fontSize: "14px",
            color: "#CCCCCC",
            textAlign: "center",
          }}
        >
          NO RECENT
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: width,
        height: height,
        borderRadius: "10px",
        padding: "16px",
        gap: "16px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Heading */}
      <Box
        sx={{
          width: "470px",
          height: isWeekOrMonthView ? "40px" : "72px",
          gap: "8px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title */}
        <Box
          sx={{
            width: "470px",
            height: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "3px",
            paddingBottom: "3px",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "20px",
              textAlign: "center",
              textTransform: "capitalize",
              color: "#3B3B3B",
            }}
          >
            {getTitleText()}
          </Typography>
        </Box>

        {/* Filter Tabs - Only show for day view when we have defaults */}
        {!isWeekOrMonthView && defaults.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              paddingTop: "8px",
            }}
          >
            <DefaultFilterTabs
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              availableTypes={availableTypes}
            />
          </Box>
        )}
      </Box>

      {/* Content */}
      {renderContent()}
    </Box>
  );
};

export default DefaultsCard;
