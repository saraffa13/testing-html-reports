import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import { CircularProgress, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useClientIncidentReport } from "../../apis/hooks/useIncidentReport";
import { useClientContext } from "../../context/ClientContext";

export default function IncidentReports() {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState<"open" | "close">("open");
  const { selectedSite } = useClientContext();

  const {
    data: incidentResponse,
    isLoading,
    error,
  } = useClientIncidentReport({
    clientId: clientId || "",
  });

  const allIncidentData = incidentResponse?.data || [];

  const incidentData = useMemo(() => {
    return allIncidentData.filter((incident: any) =>
      activeTab === "open" ? incident.status === "OPEN" : incident.status === "CLOSED"
    );
  }, [allIncidentData, activeTab]);

  const filteredIncidentData = useMemo(() => {
    if (selectedSite === "ALL SITES") return incidentData;
    return incidentData.filter((incident: any) => incident.site?.id === selectedSite);
  }, [incidentData, selectedSite]);

  const filteredOpenCount = useMemo(() => {
    const openIncidents = allIncidentData.filter((incident: any) => incident.status === "OPEN");
    if (selectedSite === "ALL SITES") return openIncidents.length;
    return openIncidents.filter((incident: any) => incident.site?.id === selectedSite).length;
  }, [allIncidentData, selectedSite]);

  const filteredClosedCount = useMemo(() => {
    const closedIncidents = allIncidentData.filter((incident: any) => incident.status === "CLOSED");
    if (selectedSite === "ALL SITES") return closedIncidents.length;
    return closedIncidents.filter((incident: any) => incident.site?.id === selectedSite).length;
  }, [allIncidentData, selectedSite]);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("en-GB"),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading incident reports...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography color="error">Error loading incident reports</Typography>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="bg-white flex flex-col p-4 rounded-lg items-center gap-4">
        <h2 className="font-semibold">INCIDENT REPORTS</h2>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("open")}
            className={`flex flex-row items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors w-[10vw] h-fit justify-center ${
              activeTab === "open" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <CheckCircleOutlineIcon />
            open ({filteredOpenCount})
          </button>
          <button
            onClick={() => setActiveTab("close")}
            className={`flex flex-row items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors w-[10vw] h-fit justify-center ${
              activeTab === "close" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <CheckCircleIcon />
            close ({filteredClosedCount})
          </button>
        </div>
        <div className="overflow-hidden text-left w-[50vw]">
          <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 px-2 py-2">
            <div className="text-gray-600 font-medium text-sm">INCIDENT ID</div>
            <div className="text-gray-600 font-medium text-sm">SITE NAME</div>
            <div className="text-gray-600 font-medium text-sm">TIME</div>
          </div>
          <div className="flex flex-col gap-2">
            {filteredIncidentData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No {activeTab} incidents found for selected site</div>
            ) : (
              filteredIncidentData.map((incident) => {
                const { date, time } = formatDateTime(incident.dateAndTime);
                return (
                  <div key={incident.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 px-2 py-2 bg-white items-center">
                      <div className="text-gray-800 font-medium truncate">{incident.id.slice(-6)}</div>
                      <div className="text-gray-800 font-medium break-words">{incident.site?.siteName}</div>
                      <div className="text-gray-800 font-medium">
                        <div>{date}</div>
                        <div>{time}</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 px-6 py-2 border-t border-gray-200">
                      <div className="flex justify-center gap-4">
                        <button className="">
                          <LocalFireDepartmentOutlinedIcon sx={{ color: "#2A77D5" }} />
                        </button>
                        <button className="">
                          <HomeOutlinedIcon sx={{ color: "#2A77D5" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
