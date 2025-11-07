import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { Avatar } from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";

export const livelinessColumns: GridColDef[] = [
  {
    field: "guardId",
    headerName: "ID NUMBER",
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "photo",
    headerName: "PHOTO",
    width: 80,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Avatar src={params.value} alt={params.row.guardName} sx={{ width: 40, height: 40 }} />
      </div>
    ),
  },
  {
    field: "guardName",
    headerName: "GUARD NAME",
    flex: 1,
    minWidth: 120,
  },
  {
    field: "designation",
    headerName: "DESIGNATION",
    width: 120,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "clientName",
    headerName: "CLIENT NAME",
    flex: 1,
    minWidth: 140,
  },
  {
    field: "siteName",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 140,
  },

  {
    field: "dateAndTime",
    headerName: "DATE & TIME",
    width: 120,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
      const date = new Date(params.value);
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            lineHeight: "1.2",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 500 }}>{date.toLocaleDateString("en-GB")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>
      );
    },
  },
  {
    field: "where",
    headerName: "WHERE",
    width: 100,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
      // Map different location/alert types to icons
      const getMetricIcon = (location: string) => {
        const locationLower = location.toLowerCase();

        if (locationLower.includes("gate") || locationLower.includes("entrance")) {
          return <SecurityOutlinedIcon sx={{ color: "#2A77D5", fontSize: "24px" }} />;
        } else if (locationLower.includes("patrol") || locationLower.includes("round")) {
          return <Person2OutlinedIcon sx={{ color: "#2A77D5", fontSize: "24px" }} />;
        } else if (locationLower.includes("parking") || locationLower.includes("vehicle")) {
          return <LocationOnOutlinedIcon sx={{ color: "#2A77D5", fontSize: "24px" }} />;
        } else if (locationLower.includes("incident") || locationLower.includes("alert")) {
          return <ReportProblemOutlinedIcon sx={{ color: "#FF6B35", fontSize: "24px" }} />;
        } else if (locationLower.includes("shift") || locationLower.includes("duty")) {
          return <AccessTimeIcon sx={{ color: "#2A77D5", fontSize: "24px" }} />;
        } else {
          return <AssignmentTurnedInOutlinedIcon sx={{ color: "#2A77D5", fontSize: "24px" }} />;
        }
      };

      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          {getMetricIcon(params.value || params.row.siteName || "")}
        </div>
      );
    },
  },
];

export const livelinessDatagridStyle = {
  width: "100%",
  height: "100%",
  border: "none",
  minWidth: 300,
  "& .MuiDataGrid-main": {
    borderRadius: "12px",
    overflow: "hidden",
  },
  "& .MuiDataGrid-virtualScroller": {
    "&::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#c1c1c1",
      borderRadius: "10px",
      "&:hover": {
        background: "#a8a8a8",
      },
    },
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#ffffff",
    borderBottom: "none",
    fontSize: "14px",
    fontWeight: 600,
    color: "#6c757d",
    minHeight: "56px !important",
    maxHeight: "56px !important",
  },
  "& .MuiDataGrid-columnHeader": {
    mb: 1,
    "&:focus": {
      outline: "none",
    },
    "&:focus-within": {
      outline: "none",
    },
  },
  "& .MuiDataGrid-cell": {
    borderLeft: "1px solid #F0F0F0",
    borderRight: "1px solid #F0F0F0",
    fontSize: "14px",
    fontWeight: 500,
    color: "#212529",
    display: "flex",
    alignItems: "center",
    "&:focus": {
      outline: "none",
    },
    "&:focus-within": {
      outline: "none",
    },
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#ffffff",
    marginBottom: "8px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #f0f0f0",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f8f9fa",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
      transform: "translateY(-2px)",
    },
    "&.Mui-selected": {
      backgroundColor: "#e3f2fd",
      boxShadow: "0 4px 16px rgba(42, 119, 213, 0.2)",
      "&:hover": {
        backgroundColor: "#e3f2fd",
        boxShadow: "0 6px 20px rgba(42, 119, 213, 0.25)",
      },
    },
  },
  "& .MuiDataGrid-footerContainer": {
    display: "none",
  },
};
