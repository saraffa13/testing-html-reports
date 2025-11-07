import { Box, Typography } from "@mui/material";
import React from "react";
import { formatDate } from "../utils/dateRangeUtils";

interface CustomDateDisplayProps {
  startDate?: Date;
  endDate?: Date;
}

export const CustomDateDisplay: React.FC<CustomDateDisplayProps> = ({ startDate, endDate }) => {
  if (!startDate || !endDate) {
    return (
      <Typography variant="body2" color="text.secondary">
        No custom date range selected
      </Typography>
    );
  }

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        Custom Range
      </Typography>
      <Typography variant="body1" fontWeight="medium">
        {start.day}/{start.month}/{start.year} - {end.day}/{end.month}/{end.year}
      </Typography>
    </Box>
  );
};
