import { AccessTime, Schedule } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { format, getDay, getDaysInMonth, startOfMonth, startOfWeek } from "date-fns";
import React from "react";
import { LuShirt } from "react-icons/lu";
import type { OfficerDefault, OfficerDefaultData } from "./officer-defaults-types";

interface OfficerDefaultsCalendarViewProps {
  defaultsData: OfficerDefault[];
  selectedDate: Date;
  dateView: "WEEK" | "MONTH";
  onDayClick: (dayDefaults: OfficerDefaultData[], date: Date) => void;
}

/**
 * Calendar view component for displaying officer defaults in week/month view
 */
const OfficerDefaultsCalendarView: React.FC<OfficerDefaultsCalendarViewProps> = ({
  defaultsData,
  selectedDate,
  dateView,
  onDayClick,
}) => {
  // Generate week days for week view
  const generateWeekDays = () => {
    const days = [];
    const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeekDate);
      currentDate.setDate(startOfWeekDate.getDate() + i);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const dayDefaults = defaultsData.find((od) => od.date === dateStr)?.defaults || [];

      days.push({
        day: currentDate.getDate(),
        date: currentDate,
        hasDefaults: dayDefaults.length > 0,
        defaults: dayDefaults,
        dayName: format(currentDate, "EEE").toUpperCase(),
      });
    }

    return days;
  };

  // Generate calendar days for month view
  const generateMonthDays = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDayOfMonth = startOfMonth(selectedDate);
    const startingDayOfWeek = getDay(firstDayOfMonth);

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const dayDefaults = defaultsData.find((od) => od.date === dateStr)?.defaults || [];

      days.push({
        day,
        date: currentDate,
        hasDefaults: dayDefaults.length > 0,
        defaults: dayDefaults,
      });
    }

    return days;
  };

  const isWeekView = dateView === "WEEK";
  const calendarDays = isWeekView ? generateWeekDays() : generateMonthDays();

  // Get default type icons
  const getDefaultTypeIcon = (type: string) => {
    switch (type) {
      case "LATE":
        return <AccessTime sx={{ width: 12, height: 12, color: "#FF6B6B" }} />;
      case "UNIFORM":
        return <LuShirt style={{ width: 12, height: 12, color: "#FFA726" }} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        width: "502px",
        height: "288px",
        borderRadius: "10px",
        padding: "16px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        <Schedule sx={{ color: "#2A77D5", width: 20, height: 20 }} />
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "16px",
            color: "#3B3B3B",
            textTransform: "uppercase",
          }}
        >
          DEFAULTS : PATROL
        </Typography>
      </Box>

      {/* Calendar Content */}
      {isWeekView ? (
        // Week View
        <Box sx={{ flex: 1 }}>
          {/* Week Headers */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <Box
                key={index}
                sx={{
                  textAlign: "center",
                  padding: "4px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#707070",
                    fontWeight: 500,
                  }}
                >
                  {day}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Week Days */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "8px",
            }}
          >
            {calendarDays.map((dayData, index) => (
              <Box
                key={index}
                onClick={() => dayData && onDayClick(dayData.defaults, dayData.date)}
                sx={{
                  height: "80px",
                  borderRadius: "8px",
                  border: dayData?.hasDefaults ? "2px solid #FF6B6B" : "1px solid #F0F0F0",
                  backgroundColor: dayData?.hasDefaults ? "#FFE6E6" : "#F9F9F9",
                  cursor: dayData?.hasDefaults ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  "&:hover": dayData?.hasDefaults
                    ? {
                        backgroundColor: "#FFD1D1",
                        transform: "scale(1.02)",
                      }
                    : {},
                  transition: "all 0.2s ease",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: dayData?.hasDefaults ? "#FF6B6B" : "#3B3B3B",
                  }}
                >
                  {dayData?.day}
                </Typography>
                {dayData?.hasDefaults && (
                  <Box sx={{ display: "flex", gap: "2px", flexWrap: "wrap", justifyContent: "center" }}>
                    {dayData.defaults.slice(0, 2).map((defaultItem, idx) => (
                      <Box key={idx}>{getDefaultTypeIcon(defaultItem.type)}</Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        // Month View
        <Box sx={{ flex: 1 }}>
          {/* Month Headers */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px",
              marginBottom: "8px",
            }}
          >
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <Box
                key={index}
                sx={{
                  textAlign: "center",
                  padding: "4px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "10px",
                    color: "#707070",
                    fontWeight: 500,
                  }}
                >
                  {day}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Month Calendar Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px",
            }}
          >
            {calendarDays.map((dayData, index) => (
              <Box
                key={index}
                onClick={() => dayData && onDayClick(dayData.defaults, dayData.date)}
                sx={{
                  height: "32px",
                  borderRadius: "6px",
                  border: dayData?.hasDefaults ? "2px solid #FF6B6B" : "1px solid transparent",
                  backgroundColor: dayData?.hasDefaults ? "#FFE6E6" : "transparent",
                  cursor: dayData?.hasDefaults ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": dayData?.hasDefaults
                    ? {
                        backgroundColor: "#FFD1D1",
                        transform: "scale(1.05)",
                      }
                    : {},
                  transition: "all 0.2s ease",
                }}
              >
                {dayData && (
                  <>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: dayData.hasDefaults ? "#FF6B6B" : "#3B3B3B",
                      }}
                    >
                      {dayData.day}
                    </Typography>
                    {dayData.hasDefaults && (
                      <Box
                        sx={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          backgroundColor: "#FF6B6B",
                          marginTop: "1px",
                        }}
                      />
                    )}
                  </>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          paddingTop: "8px",
          borderTop: "1px solid #F0F0F0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <AccessTime sx={{ width: 16, height: 16, color: "#2A77D5" }} />
          <Typography sx={{ fontSize: "12px", color: "#707070" }}>Late</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <LuShirt style={{ width: 16, height: 16, color: "#2A77D5" }} />
          <Typography sx={{ fontSize: "12px", color: "#707070" }}>Uniform</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerDefaultsCalendarView;
