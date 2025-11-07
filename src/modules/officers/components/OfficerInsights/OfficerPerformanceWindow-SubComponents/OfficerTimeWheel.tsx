import { Box } from "@mui/material";
import React from "react";
import type { OfficerTimeWheelData } from "./officer-defaults-types";

interface OfficerTimeWheelProps {
  data: OfficerTimeWheelData;
  size?: number;
  lateMinutes?: number; // Number of minutes late
  totalShiftMinutes?: number; // Total shift duration in minutes (e.g., 12 hours = 720 minutes)
}

/**
 * Time wheel component for showing officer status indicators (simplified for officers)
 * Shows the proportion of lateness relative to total shift time
 */
const OfficerTimeWheel: React.FC<OfficerTimeWheelProps> = ({
  data,
  size = 104,
  lateMinutes = 15,
  totalShiftMinutes = 720, // Default: 12 hour shift
}) => {
  const radius = size / 2;
  const strokeWidth = 8;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  // Calculate what percentage of the circle should be colored based on lateness
  // For example: if 15 minutes late out of 720 minute shift = ~2% of circle
  const latePercentage = Math.min((lateMinutes / totalShiftMinutes) * 100, 25); // Cap at 25% for visibility

  // Calculate segments based on active states
  const segments = [];

  if (data.lateIn && lateMinutes > 0) {
    segments.push({
      color: "#FF6B6B", // Red for late
      percent: latePercentage,
    });
  }

  // If no issues or very small lateness, show minimal indicator
  if (segments.length === 0 || latePercentage < 1) {
    segments.push({ color: "#2A77D5", percent: 5 }); // Small blue indicator for on-time
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

      {/* Center content */}
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
      ></Box>
    </Box>
  );
};

export default OfficerTimeWheel;
