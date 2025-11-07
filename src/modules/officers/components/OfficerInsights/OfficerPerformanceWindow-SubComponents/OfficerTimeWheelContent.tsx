import { Box, Typography } from "@mui/material";
import React from "react";
import OfficerTimeWheel from "./OfficerTimeWheel";
import type { OfficerTimeWheelData } from "./officer-defaults-types";

interface OfficerTimeWheelContentProps {
  timeWheelData: OfficerTimeWheelData;
  displayText: string;
}

/**
 * Content component for officer defaults that use time wheel (Late)
 */
const OfficerTimeWheelContent: React.FC<OfficerTimeWheelContentProps> = ({ timeWheelData, displayText }) => {
  // Extract late minutes from display text (e.g., "08:15 AM - 15 MIN. LATE")
  const lateMinutesMatch = displayText.match(/(\d+)\s*MIN/i);
  const lateMinutes = lateMinutesMatch ? parseInt(lateMinutesMatch[1], 10) : 15;

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
      <OfficerTimeWheel
        data={timeWheelData}
        size={104}
        lateMinutes={lateMinutes}
        totalShiftMinutes={720} // 12 hour shift
      />

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

export default OfficerTimeWheelContent;
