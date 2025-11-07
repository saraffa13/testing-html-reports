import { Box, Typography } from "@mui/material";
import React from "react";
import TimeWheel from "./TimeWheel";
import type { TimeWheelData } from "./defaults-types";

interface TimeWheelContentProps {
  timeWheelData: TimeWheelData;
  displayText: string;
}

/**
 * Content component for defaults that use time wheel (Late, Alertness, Geofence)
 */
const TimeWheelContent: React.FC<TimeWheelContentProps> = ({ timeWheelData, displayText }) => {
  return (
    <Box
      sx={{
        width: "470px",
        height: "168px",
        gap: "16px",
        paddingTop: "16px",
        paddingBottom: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Time Wheel */}
      <TimeWheel data={timeWheelData} size={104} />

      {/* Display Text */}
      <Box
        sx={{
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "20px",
            textTransform: "capitalize",
            color: "#2A77D5",
            textAlign: "center",
          }}
        >
          {displayText}
        </Typography>
      </Box>
    </Box>
  );
};

export default TimeWheelContent;
