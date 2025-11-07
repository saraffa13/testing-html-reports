import { Box } from "@mui/material";
import React from "react";
import type { TimeWheelData } from "./defaults-types";

interface TimeWheelProps {
  data: TimeWheelData;
  size?: number;
}

/**
 * Time wheel component for showing guard status indicators
 */
const TimeWheel: React.FC<TimeWheelProps> = ({ data, size = 104 }) => {
  const radius = size / 2;
  const strokeWidth = 8;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  // Calculate segments based on active states
  const segments = [];

  if (data.lateIn) {
    segments.push({ color: "#FF6B6B", percent: 25 }); // Red for late
  }
  if (data.outOfGeofence) {
    segments.push({ color: "#FF8C42", percent: 25 }); // Orange for geofence
  }
  if (data.earlyOut) {
    segments.push({ color: "#FFD93D", percent: 25 }); // Yellow for early out
  }
  if (data.firstAlertnessTestMissed || data.secondAlertnessTestMissed) {
    segments.push({ color: "#6BCF7F", percent: 25 }); // Green for alertness
  }

  // If no issues, show complete circle in blue
  if (segments.length === 0) {
    segments.push({ color: "#2A77D5", percent: 100 });
  }

  let currentOffset = 0;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: "rotate(-90deg)", // Start from top
        }}
      >
        {/* Background circle */}
        <circle cx={radius} cy={radius} r={innerRadius} stroke="#F0F0F0" strokeWidth={strokeWidth} fill="transparent" />

        {/* Segment circles */}
        {segments.map((segment, index) => {
          const segmentLength = (circumference * segment.percent) / 100;
          const offset = currentOffset;
          currentOffset += segmentLength;

          return (
            <circle
              key={index}
              cx={radius}
              cy={radius}
              r={innerRadius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Center content - can be customized based on needs */}
      <Box
        sx={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: "50%",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Center icon or content can go here */}
      </Box>
    </Box>
  );
};

export default TimeWheel;
