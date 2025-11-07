import { Close } from "@mui/icons-material";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import { format, getDay, getDaysInMonth, startOfMonth } from "date-fns";
import React, { useState } from "react";
import OfficerDefaultsCard from "./OfficerDefaultsComponent";
import type { OfficerDefault, OfficerDefaultData } from "./officer-defaults-types";

interface OfficerCalendarOverlayProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date;
  defaultsData: OfficerDefault[];
  title: string;
}

/**
 * Calendar overlay component that shows officer defaults for week/month view
 */
const OfficerCalendarOverlay: React.FC<OfficerCalendarOverlayProps> = ({
  open,
  onClose,
  selectedDate,
  defaultsData,
  title,
}) => {
  const [selectedDateDetails, setSelectedDateDetails] = useState<OfficerDefaultData[] | null>(null);
  const [showingDateDetails, setShowingDateDetails] = useState(false);
  const [selectedDateString, setSelectedDateString] = useState("");

  // Generate calendar days for the month
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDayOfMonth = startOfMonth(selectedDate);
    const startingDayOfWeek = getDay(firstDayOfMonth);

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const hasDefaults = defaultsData.some((od) => od.date === dateStr && od.defaults.length > 0);

      days.push({
        day,
        date: currentDate,
        hasDefaults,
        defaults: defaultsData.find((od) => od.date === dateStr)?.defaults || [],
      });
    }

    return days;
  };

  // Generate week days for week view
  const generateWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay() + 1); // Start from Monday

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const hasDefaults = defaultsData.some((od) => od.date === dateStr && od.defaults.length > 0);

      days.push({
        day: currentDate.getDate(),
        date: currentDate,
        hasDefaults,
        defaults: defaultsData.find((od) => od.date === dateStr)?.defaults || [],
        dayName: format(currentDate, "EEE").toUpperCase(),
      });
    }

    return days;
  };

  const isWeekView = title.includes("WEEK");
  const calendarDays = isWeekView ? generateWeekDays() : generateCalendarDays();

  const handleDateClick = (defaults: OfficerDefaultData[], date: Date) => {
    if (defaults.length > 0) {
      setSelectedDateDetails(defaults);
      setSelectedDateString(format(date, "MMM dd, yyyy"));
      setShowingDateDetails(true);
    }
  };

  const handleBackToCalendar = () => {
    setShowingDateDetails(false);
    setSelectedDateDetails(null);
  };

  const handleCloseModal = () => {
    setShowingDateDetails(false);
    setSelectedDateDetails(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: showingDateDetails ? "550px" : "600px",
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          padding: "24px",
          outline: "none",
          boxShadow: "0px 8px 32px 0px rgba(0, 0, 0, 0.16)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "20px",
              color: "#3B3B3B",
            }}
          >
            {showingDateDetails ? `DEFAULTS : ${selectedDateString}` : title}
          </Typography>
          <Box sx={{ display: "flex", gap: "8px" }}>
            {showingDateDetails && (
              <IconButton onClick={handleBackToCalendar}>
                <Typography sx={{ fontSize: "14px", color: "#2A77D5" }}>Back</Typography>
              </IconButton>
            )}
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        {showingDateDetails ? (
          // Show OfficerDefaultsCard for selected date
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            {selectedDateDetails && <OfficerDefaultsCard defaults={selectedDateDetails} width="502px" height="auto" />}
          </Box>
        ) : (
          // Show Calendar Grid
          <>
            {isWeekView ? (
              // Week View
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {/* Week day headers */}
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      padding: "8px",
                      textAlign: "center",
                      fontFamily: "Mukta",
                      fontWeight: 500,
                      fontSize: "12px",
                      color: "#707070",
                    }}
                  >
                    {day}
                  </Box>
                ))}

                {/* Week days */}
                {calendarDays.map((dayData, index) => (
                  <Box
                    key={index}
                    onClick={() => dayData && handleDateClick(dayData.defaults, dayData.date)}
                    sx={{
                      padding: "12px",
                      textAlign: "center",
                      cursor: dayData?.hasDefaults ? "pointer" : "default",
                      borderRadius: "8px",
                      backgroundColor: dayData?.hasDefaults ? "#FFE6E6" : "transparent",
                      border: dayData?.hasDefaults ? "2px solid #FF6B6B" : "1px solid #F0F0F0",
                      "&:hover": {
                        backgroundColor: dayData?.hasDefaults ? "#FFD6D6" : "#F9F9F9",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Mukta",
                        fontWeight: 400,
                        fontSize: "14px",
                        color: dayData?.hasDefaults ? "#FF6B6B" : "#3B3B3B",
                      }}
                    >
                      {dayData?.day}
                    </Typography>
                    {dayData?.hasDefaults && (
                      <Typography
                        sx={{
                          fontFamily: "Mukta",
                          fontWeight: 500,
                          fontSize: "10px",
                          color: "#FF6B6B",
                          marginTop: "4px",
                        }}
                      >
                        {dayData.defaults.length} error{dayData.defaults.length > 1 ? "s" : ""}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              // Month View
              <Box>
                {/* Month day headers */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                    <Box
                      key={index}
                      sx={{
                        padding: "8px",
                        textAlign: "center",
                        fontFamily: "Mukta",
                        fontWeight: 500,
                        fontSize: "12px",
                        color: "#707070",
                      }}
                    >
                      {day}
                    </Box>
                  ))}
                </Box>

                {/* Month calendar grid */}
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
                      onClick={() => dayData && handleDateClick(dayData.defaults, dayData.date)}
                      sx={{
                        padding: "8px",
                        textAlign: "center",
                        minHeight: "40px",
                        cursor: dayData?.hasDefaults ? "pointer" : "default",
                        borderRadius: "6px",
                        backgroundColor: dayData?.hasDefaults ? "#FFE6E6" : "transparent",
                        border: dayData?.hasDefaults ? "2px solid #FF6B6B" : "1px solid transparent",
                        "&:hover": {
                          backgroundColor: dayData?.hasDefaults ? "#FFD6D6" : "#F9F9F9",
                        },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {dayData && (
                        <>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontWeight: 400,
                              fontSize: "14px",
                              color: dayData.hasDefaults ? "#FF6B6B" : "#3B3B3B",
                            }}
                          >
                            {dayData.day}
                          </Typography>
                          {dayData.hasDefaults && (
                            <Box
                              sx={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "#FF6B6B",
                                marginTop: "2px",
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
          </>
        )}
      </Box>
    </Modal>
  );
};

export default OfficerCalendarOverlay;
