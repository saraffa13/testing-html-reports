import { CheckCircle, Home, Image, LocalFireDepartment, Settings } from "@mui/icons-material";
import type { GridColDef } from "@mui/x-data-grid";

interface IncidentReport {
  id: number;
  incidentType: string;
  incidentIcon: string;
  latestAlertDate: string;
  latestAlertTime: string;
  evidence: boolean;
  status: "open" | "closed";
}

export const incidentReportItems: IncidentReport[] = [
  {
    id: 1,
    incidentType: "Fire Hazard",
    incidentIcon: "fire",
    latestAlertDate: "23/01/25",
    latestAlertTime: "02:35 PM",
    evidence: true,
    status: "open",
  },
  {
    id: 2,
    incidentType: "Property Damage",
    incidentIcon: "property",
    latestAlertDate: "23/01/25",
    latestAlertTime: "03:56 PM",
    evidence: true,
    status: "open",
  },
  {
    id: 3,
    incidentType: "Security Breach",
    incidentIcon: "security",
    latestAlertDate: "22/01/25",
    latestAlertTime: "11:20 AM",
    evidence: false,
    status: "closed",
  },
];

const getIncidentIcon = (iconType: string) => {
  const iconProps = {
    sx: {
      fontSize: 24,
      color: "#666",
      mr: 1,
    },
  };

  switch (iconType) {
    case "fire":
      return <LocalFireDepartment {...iconProps} sx={{ ...iconProps.sx, color: "#FF6B6B" }} />;
    case "property":
      return <Home {...iconProps} />;
    case "security":
      return <Settings {...iconProps} />;
    case "equipment":
      return <Settings {...iconProps} />;
    case "medical":
      return <CheckCircle {...iconProps} sx={{ ...iconProps.sx, color: "#FF6B6B" }} />;
    case "theft":
      return <Settings {...iconProps} />;
    case "vandalism":
      return <Home {...iconProps} />;
    case "suspicious":
      return <Settings {...iconProps} />;
    default:
      return <Settings {...iconProps} />;
  }
};

export const IncidentReportColumns: GridColDef[] = [
  {
    field: "incidentType",
    headerName: "INCIDENT TYPE",
    width: 200,
    headerAlign: "left" as const,
    align: "left" as const,
    renderCell: (params) => (
      <div className="flex items-center">
        {getIncidentIcon(params.row.incidentIcon)}
        <span className="font-medium text-gray-700">{params.row.incidentType}</span>
      </div>
    ),
  },
  {
    field: "latestAlert",
    headerName: "LATEST ALERT",
    width: 200,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params) => (
      <div className="text-center">
        <div className="font-medium text-gray-800">{params.row.latestAlertDate}</div>
        <div className="text-gray-600 text-sm">{params.row.latestAlertTime}</div>
      </div>
    ),
  },
  {
    field: "evidence",
    headerName: "EVIDENCE",
    width: 150,
    headerAlign: "center" as const,
    align: "center" as const,
    renderCell: (params) => (
      <div className="flex w-full h-full items-center justify-center">
        <div className="bg-white rounded-full shadow w-10 h-10 flex items-center justify-center">
          {params.row.evidence ? (
            <Image
              sx={{
                fontSize: 20,
                color: "#5A9FD4",
              }}
            />
          ) : (
            <div className="w-6 h-6"></div>
          )}
        </div>
      </div>
    ),
  },
];

// Filter functions for open and closed incidents
export const getOpenIncidents = () => {
  return incidentReportItems.filter((item) => item.status === "open");
};

export const getClosedIncidents = () => {
  return incidentReportItems.filter((item) => item.status === "closed");
};

// Get counts for tabs
export const getIncidentCounts = () => {
  const openCount = getOpenIncidents().length;
  const closedCount = getClosedIncidents().length;

  return {
    open: openCount.toString().padStart(2, "0"),
    closed: closedCount.toString().padStart(2, "0"),
  };
};
