import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IncidentReportsResponse } from "../apis/services/dashboard";

interface IncidentReportsViewProps {
  incidentReportsData?: IncidentReportsResponse;
  isLoading: boolean;
  error: Error | null;
}

export default function IncidentReportsView({ incidentReportsData, isLoading, error }: IncidentReportsViewProps) {
  const [activeTab, setActiveTab] = useState<"open" | "close">("open");
  const navigate = useNavigate();

  // Enhanced incident click handler - Navigate to dashboard specific route
  const handleIncidentClick = (incident: any) => {
    console.log("🔍 Dashboard Incident clicked:", {
      incidentId: incident.incidentId,
      clientName: incident.clientName,
      siteName: incident.siteName,
      status: incident.status,
      latestAlert: incident.latestAlert,
      events: incident.events,
    });

    // Validate incident ID before navigation
    if (!incident.incidentId || incident.incidentId.trim() === "") {
      console.error("❌ Invalid incident ID:", incident.incidentId);
      alert("Error: Invalid incident ID. Cannot open incident details.");
      return;
    }

    // Navigate to dashboard-specific incident details route
    console.log(`➡️ Navigating to dashboard incident details: /dashboard/incidents/${incident.incidentId}/details`);
    navigate(`/dashboard/incidents/${incident.incidentId}/details`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading incident reports...</Typography>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Typography color="error">Error loading incident reports</Typography>
      </div>
    );
  }

  // Extract data from API response
  const apiData = incidentReportsData?.data?.data?.[0];
  const incidentReports = apiData?.incidentReports || [];
  const openIncidents = incidentReports.filter((incident) => incident.status === "OPEN");
  const closedIncidents = incidentReports.filter((incident) => incident.status === "CLOSED");

  const openCount = apiData?.openIncidents || openIncidents.length;
  const closedCount = apiData?.closedIncidents || closedIncidents.length;

  const currentData = activeTab === "open" ? openIncidents : closedIncidents;

  const getActionIcons = (clientName: string, isOpen: boolean) => {
    if (isOpen) {
      return (
        <div className="flex justify-center gap-4">
          <button>
            <LocalFireDepartmentOutlinedIcon sx={{ color: "#2A77D5" }} />
          </button>
          <button>
            <HomeOutlinedIcon sx={{ color: "#2A77D5" }} />
          </button>
        </div>
      );
    }

    switch (clientName) {
      case "Axis Bank":
        return (
          <div className="flex justify-center gap-4">
            <HomeOutlinedIcon sx={{ color: "#2A77D5" }} />
            <DirectionsRunOutlinedIcon sx={{ color: "#2A77D5" }} />
            <LightbulbOutlinedIcon sx={{ color: "#2A77D5" }} />
          </div>
        );
      case "Bikaner":
        return (
          <div className="flex justify-center gap-4">
            <BusinessOutlinedIcon sx={{ color: "#2A77D5" }} />
            <LightbulbOutlinedIcon sx={{ color: "#2A77D5" }} />
          </div>
        );
      case "SFS School":
        return (
          <div className="flex justify-center gap-4">
            <FavoriteOutlinedIcon sx={{ color: "#2A77D5" }} />
          </div>
        );
      case "Danceworx":
        return (
          <div className="flex justify-center gap-4">
            <WarningAmberOutlinedIcon sx={{ color: "#2A77D5" }} />
          </div>
        );
      default:
        return (
          <div className="flex justify-center gap-4">
            <HomeOutlinedIcon sx={{ color: "#2A77D5" }} />
            <HomeOutlinedIcon sx={{ color: "#2A77D5" }} />
          </div>
        );
    }
  };

  return (
    <div className="bg-white flex flex-col p-6 rounded-lg h-full">
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab("open")}
          className={`flex flex-row items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors min-w-[120px] justify-center ${
            activeTab === "open" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          <CheckCircleOutlineIcon fontSize="small" />
          OPEN ({openCount.toString().padStart(2, "0")})
        </button>
        <button
          onClick={() => setActiveTab("close")}
          className={`flex flex-row items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors min-w-[120px] justify-center ${
            activeTab === "close" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          <CheckCircleIcon fontSize="small" />
          CLOSED ({closedCount.toString().padStart(2, "0")})
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 rounded-t-lg border-b">
          <div className="text-gray-600 font-semibold text-sm">INCIDENT ID</div>
          <div className="text-gray-600 font-semibold text-sm">CLIENT NAME</div>
          <div className="text-gray-600 font-semibold text-sm">SITE NAME</div>
          <div className="text-gray-600 font-semibold text-sm">
            {activeTab === "open" ? "LATEST ALERT" : "CLOSED ON"}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {currentData.map((incident) => (
            <div
              key={incident.incidentId}
              onClick={() => handleIncidentClick(incident)}
              className="border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all duration-200"
            >
              <div className="grid grid-cols-4 gap-4 px-4 py-3 items-center">
                <div className="text-gray-800 font-medium">{incident.incidentId}</div>
                <div className="text-gray-800 font-medium">{incident.clientName}</div>
                <div className="text-gray-800 font-medium">{incident.siteName}</div>
                <div className="text-gray-800 font-medium">
                  <div>{new Date(incident.latestAlert).toLocaleDateString("en-GB")}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(incident.latestAlert).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 px-4 py-3 border-t border-gray-200">
                {getActionIcons(incident.clientName, activeTab === "open")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
