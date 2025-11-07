import { Business, Description, School } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { Avatar, Box } from "@mui/material";
import { DataGrid, type GridColDef, type GridRowSelectionModel } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { datagridStyle } from "../../lib/datagridStyle";

interface SubtaskRow {
  id: number;
  subtask: string;
  icon: string;
  completedOn: string;
  status: "completed" | "incomplete";
  evidence: "available" | "unavailable";
}

export const subtaskColumns: GridColDef[] = [
  {
    field: "subtask",
    headerName: "SUBTASK",
    flex: 1,
    minWidth: 200,
    renderCell: (params) => {
      const getIcon = (iconType: string) => {
        switch (iconType) {
          case "site":
            return <Business sx={{ color: "#666", mr: 2 }} />;
          case "training":
            return <School sx={{ color: "#666", mr: 2 }} />;
          case "documents":
            return <Description sx={{ color: "#666", mr: 2 }} />;
          default:
            return <Business sx={{ color: "#666", mr: 2 }} />;
        }
      };

      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          {getIcon(params.row.icon)}
          <span style={{ fontSize: "16px", fontWeight: 500 }}>{params.value}</span>
        </div>
      );
    },
  },
  {
    field: "completedOn",
    headerName: "COMPLETED ON",
    width: 150,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
      if (!params.value) {
        return <span style={{ color: "#999" }}>-</span>;
      }
      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>{params.value.split(" ")[0]}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{params.value.split(" ")[1]}</div>
        </div>
      );
    },
  },
  {
    field: "status",
    headerName: "STATUS",
    width: 120,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
      const isCompleted = params.value === "completed";
      return (
        <div className="flex items-center justify-center w-full h-full">
          {isCompleted ? (
            <CheckOutlinedIcon sx={{ color: "#4CAF50", fontSize: 28 }} />
          ) : (
            <CloseOutlinedIcon sx={{ color: "#f44336", fontSize: 28 }} />
          )}
        </div>
      );
    },
  },
  {
    field: "evidence",
    headerName: "EVIDENCE",
    width: 120,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
      const isAvailable = params.value === "available";
      return (
        <div className="flex items-center justify-center w-full h-full">
          {isAvailable ? (
            <CheckOutlinedIcon sx={{ color: "#4CAF50", fontSize: 28 }} />
          ) : (
            <CloseOutlinedIcon sx={{ color: "#f44336", fontSize: 28 }} />
          )}
        </div>
      );
    },
  },
];

export const subtaskData: SubtaskRow[] = [
  {
    id: 1,
    subtask: "Site Visit",
    icon: "site",
    completedOn: "12/01/25 04:56 PM",
    status: "completed",
    evidence: "available",
  },
  {
    id: 2,
    subtask: "Training",
    icon: "training",
    completedOn: "12/01/25 04:56 PM",
    status: "completed",
    evidence: "unavailable",
  },
  {
    id: 3,
    subtask: "Documents",
    icon: "documents",
    completedOn: "",
    status: "incomplete",
    evidence: "unavailable",
  },
];

export default function AreaOfficersTasksDetails() {
  const { siteId } = useParams();
  const [selectedTask, setSelectedTask] = useState<SubtaskRow | null>(null);
  console.log("Selected Task:", selectedTask);
  const [selectTaskIndex] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between">
        <div className="inline-flex gap-2">
          <ArrowBackIcon onClick={() => navigate(-1)} className="cursor-pointer" />

          <h2 className="font-semibold text-lg">Axis Bank - Nehru Place</h2>
        </div>
      </div>

      <div className="flex flex-col bg-[#F7F7F7] p-4 rounded-lg mt-4 gap-y-4">
        <div className="flex flex-row gap-4">
          <div className="bg-white p-4 rounded-lg w-[140px] h-[140px] flex items-center justify-center">
            <Avatar src="" alt="Client Logo" sx={{ width: 100, height: 100 }} />
          </div>

          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg min-w-[20vw]">
            <span className="font-semibold">Details</span>
            <div className="grid grid-cols-2 gap-x-2">
              <span className="text-[#A3A3A3]">Client</span>
              <span>Axis Bank</span>
              <span className="text-[#A3A3A3]">Site</span>
              <span>Nehru Place</span>
              <span className="text-[#A3A3A3]">Site ID</span>
              <span>{siteId}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg min-w-[20vw]">
            <span className="font-semibold">Status - Pending</span>
            <div className="grid grid-cols-2 gap-x-2">
              <span className="text-[#A3A3A3]">Due Date</span>
              <span>23/01/2025 04:35PM</span>
              <span className="text-[#A3A3A3]">Duration</span>
              <span>05 hours 23 minutes</span>
              <span className="text-[#A3A3A3]">Started On</span>
              <span>12/01/2025 02:56PM</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-white p-4 rounded-lg min-w-[20vw]">
            <span className="font-semibold">Area officer</span>
            <div className="grid grid-cols-2 gap-x-2">
              <span className="text-[#A3A3A3]">Name</span>
              <span>Sachin Sharma</span>
              <span className="text-[#A3A3A3]">Area</span>
              <span>South Delhi</span>
              <span className="text-[#A3A3A3]">Phone</span>
              <span>+91 9999 999999</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row">
          <div className="bg-white p-4 w-fit rounded-lg">
            <div className="flex flex-col gap-2 items-center">
              <span className="uppercase text-lg">SUBTASKS</span>
              <span className="text-[#A3A3A3]">Select a row to view Details</span>
            </div>
            <Box
              sx={{
                width: "100%",
                flexGrow: 1,
                minHeight: 400,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <DataGrid
                rows={subtaskData}
                columns={subtaskColumns}
                hideFooter={true}
                onRowSelectionModelChange={(newRowSelectionModel) => {
                  const selectedId = Array.from(newRowSelectionModel.ids)[0];
                  if (selectedId !== undefined) {
                    setSelectedTask(subtaskData[Number(selectedId)] as SubtaskRow);
                  }
                }}
                rowSelectionModel={selectTaskIndex}
                disableColumnMenu
                disableMultipleRowSelection={true}
                sx={datagridStyle}
              />
            </Box>
          </div>
          <div className="bg-white p-4 w-full rounded-lg flex flex-col gap-4 items-center border-l border-gray-200">
            <span className="uppercase text-lg">SUBTASKS</span>
            <span className="text-[#707070]">Photos & videos</span>
            <div className="flex flex-row gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <img
                  key={index}
                  src={`https://picsum.photos/200/150?random=${index}`}
                  className="w-32 h-24 object-cover rounded-lg mb-2"
                />
              ))}
            </div>
            <div className="w-full mt-20">
              <span className="text-[#707070] text-sm">Notes</span>
              <div className="p-4 bg-[#F7F7F7] rounded-lg">
                Met with the main client, problems with some security cameras
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
