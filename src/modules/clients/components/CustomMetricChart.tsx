import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import { Button } from "@mui/material";
import { ShirtIcon } from "lucide-react";
import React, { useState } from "react";

interface MetricData {
  id: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface MetricChartProps {
  metrics?: {
    absent: number;
    late: number;
    uniform: number;
    alertness: number;
    geofence: number;
    patrol: number;
  };
  guardCounts?: {
    absent: number;
    late: number;
    uniform: number;
    alertness: number;
    geofence: number;
    patrol: number;
  };
  onMetricSelect?: (metricId: string) => void;
}

export default function MetricChart({ guardCounts, onMetricSelect }: MetricChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("time");

  const handleMetricClick = (metricId: string) => {
    setSelectedMetric(metricId);
    onMetricSelect?.(metricId);
  };

  const metrics: MetricData[] = [
    {
      id: "absent",
      label: "ABSENT",
      value: guardCounts?.absent || 0,
      icon: <PersonOffOutlinedIcon sx={{ fontSize: 24 }} />,
      color: "#3B82F6",
    },
    {
      id: "time",
      label: "LATE",
      value: guardCounts?.late || 0,
      icon: <AccessTimeOutlinedIcon sx={{ fontSize: 24 }} />,
      color: "#3B82F6",
    },
    {
      id: "uniform",
      label: "UNIFORM",
      value: guardCounts?.uniform || 0,
      icon: <ShirtIcon />,
      color: "#3B82F6",
    },
    {
      id: "alertness",
      label: "ALERTNESS",
      value: guardCounts?.alertness || 0,
      icon: <img src="/client_icons/alertness.svg" alt="Alertness" className="w-6 h-6" />,
      color: "#3B82F6",
    },
    {
      id: "geofence",
      label: "GEOFENCE",
      value: guardCounts?.geofence || 0,
      icon: <HomeWorkOutlinedIcon sx={{ fontSize: 24 }} />,
      color: "#3B82F6",
    },
    {
      id: "patrol",
      label: "PATROL",
      value: guardCounts?.patrol || 0,
      icon: <DirectionsRunOutlinedIcon sx={{ fontSize: 24 }} />,
      color: "#3B82F6",
    },
  ];

  const maxValue = Math.max(...metrics.map((m) => m.value));

  const getButtonStyles = (metricId: string) => ({
    width: "70px",
    padding: "12px 8px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    bgcolor: selectedMetric === metricId ? "#2A77D5" : "#ffffff",
    color: selectedMetric === metricId ? "white" : "#2A77D5",
    border: selectedMetric === metricId ? "2px solid #2A77D5" : "2px solid #e0e0e0",
    "&:hover": {
      bgcolor: selectedMetric === metricId ? "#1E5A96" : "#E3F2FD",
      border: "2px solid #2A77D5",
    },
    "& .MuiSvgIcon-root": {
      color: selectedMetric === metricId ? "white" : "#2A77D5",
    },
  });

  return (
    <div className="flex flex-col items-center">
      <span className="text-lg">GUARDS : DEFAULTS</span>
      <span className="text-[#A3A3A3]">SELECT A DEFAULT TO VIEW DETAILS</span>
      <div className="flex items-end justify-center space-x-4 mb-6 mt-20">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex flex-col items-center">
            <div className="relative mb-4">
              <div
                className="bg-blue-200 rounded-t-md"
                style={{
                  height: `${(metric.value / maxValue) * 120}px`,
                  width: "40px",
                  minHeight: "20px",
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-700 font-semibold text-sm">
                  {metric.value}
                </div>
              </div>
            </div>

            <Button variant="contained" sx={getButtonStyles(metric.id)} onClick={() => handleMetricClick(metric.id)}>
              <div className={selectedMetric === metric.id ? "text-white" : "text-[#2A77D5]"}>{metric.icon}</div>
              <span className="text-xs font-medium mt-1">{metric.label}</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
