import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import { Avatar, Box, Button, Modal } from "@mui/material";
import { AlertTriangle, Play, X } from "lucide-react";
import { useState } from "react";
interface GuardData {
  id: string;
  name: string;
  photo: string;
  phoneNumber: string;
  designation: string;
  client: string;
  site: string;
  post: string;
  shift: string;
  reportingOfficer: string;
  reportingOfficerPhone: string;
}

interface TaskData {
  assignedBy: string;
  date: string;
  time: string;
  reason: string;
  status: string;
}

interface IncidentData {
  id: string;
  clientName: string;
  siteName: string;
  time: string;
  date: string;
}

interface GeofenceBreachModalProps {
  open: boolean;
  onClose: () => void;
  viewMode?: "audio" | "task" | "incident";
  guardData?: GuardData;
  taskData?: TaskData;
  incidentData?: IncidentData;
}
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffffff",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  maxHeight: "95vh",
  width: "70vw",
  overflow: "auto",
};

export default function GeofenceBreachModal({
  open,
  onClose,
  viewMode = "audio",
  guardData = {
    id: "12445",
    name: "Ramendra Sharma",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=280&h=350&fit=crop&crop=face",
    phoneNumber: "+91 9999 333333",
    designation: "Security Guard",
    client: "Axis Bank",
    site: "Nehru Place",
    post: "Entrance Gate",
    shift: "8:00 PM - 8:00 AM",
    reportingOfficer: "Sachin Sharma",
    reportingOfficerPhone: "+91 9999 99999",
  },
  taskData = {
    assignedBy: "Area Officer",
    date: "23/01/2025",
    time: "08:51 AM",
    reason: "Task",
    status: "Not Approved By Area Officer",
  },
  incidentData = {
    id: "12443",
    clientName: "Axis Bank",
    siteName: "Nehru Place",
    time: "04:35 PM",
    date: "23/01/25",
  },
}: GeofenceBreachModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [taskDescription, setTaskDescription] = useState("crosin from kemist");

  if (!open) return null;

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
  };

  // Audio Waveform Component
  const AudioWaveform = () => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-blue-400 rounded-full transition-all duration-200 ${isPlaying ? "animate-pulse" : ""}`}
          style={{
            height: isPlaying ? `${Math.random() * 24 + 8}px` : "16px",
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );

  const renderAudioView = () => (
    <div className="flex gap-8 w-full">
      <div className="flex-shrink-0">
        <Avatar
          variant="square"
          src={guardData.photo}
          alt={guardData.name}
          //   className="w-64 h-80 object-cover rounded-xl shadow-lg"
          sx={{ width: 200, height: 200, borderRadius: "16px" }}
        />
      </div>

      <div className="flex flex-row gap-20 whitespace-nowrap">
        <div className="grid grid-cols-2 gap-x-4 h-fit gap-y-2">
          <span className="text-gray-500 block">ID</span>
          <span className="text-gray-800 font-medium">{guardData.id}</span>
          <span className="text-gray-500 block">Name</span>
          <span className="text-gray-800 font-medium">{guardData.name}</span>
          <span className="text-gray-500 block">Phone Number</span>
          <span className="text-gray-800 font-medium">{guardData.phoneNumber}</span>
          <span className="text-gray-500 block">Designation</span>
          <span className="text-gray-800 font-medium">{guardData.designation}</span>
          <span className="text-gray-500 block">Client</span>
          <span className="text-gray-800 font-medium">{guardData.client}</span>
          <span className="text-gray-500 block">Site</span>
          <span className="text-gray-800 font-medium">{guardData.site}</span>
          <span className="text-gray-500 block">Post</span>
          <span className="text-gray-800 font-medium">{guardData.post}</span>
          <span className="text-gray-500 block">Shift</span>
          <span className="text-gray-800 font-medium">{guardData.shift}</span>
          <span className="text-gray-500 block">Reporting Officer</span>
          <span className="text-gray-800 font-medium">{guardData.reportingOfficer}</span>
          <span className="text-gray-500 block">Phone Number</span>
          <span className="text-gray-800 font-medium">{guardData.reportingOfficerPhone}</span>
        </div>

        <div className="flex flex-col gap-4 bg-[#F7F7F7] p-4 rounded-lg w-[30vw] items-center">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-fit">
            <span className="text-gray-500 block">Assigned By</span>
            <span className="text-gray-800 font-medium">{taskData.assignedBy}</span>
            <span className="text-gray-500 block">Date</span>
            <span className="text-gray-800 font-medium">{taskData.date}</span>
            <span className="text-gray-500 block">Time</span>
            <span className="text-gray-800 font-medium">{taskData.time}</span>
            <span className="text-gray-500 block">Reason</span>
            <span className="text-gray-800 font-medium">Other</span>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center bg-white p-8 rounded-lg">
              <AudioWaveform />
              <Button variant="contained" onClick={toggleAudio} sx={{ height: 60, width: 60, borderRadius: "100%" }}>
                <Play className="w-6 h-6" />
              </Button>
              <span className="font-medium text-lg">Play To Listen</span>
            </div>
            <div className="">
              <span className="text-gray-600 font-medium text-lg">
                Status: <span className="text-gray-800">{taskData.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaskView = () => (
    <div className="flex gap-8">
      <div className="flex-shrink-0">
        <img src={guardData.photo} alt={guardData.name} className="w-64 h-80 object-cover rounded-xl shadow-lg" />
      </div>

      <div className="flex flex-row gap-20 whitespace-nowrap">
        <div className="grid grid-cols-2 gap-x-4 h-fit gap-y-2">
          <span className="text-gray-500 block">ID</span>
          <span className="text-gray-800 font-medium">{guardData.id}</span>
          <span className="text-gray-500 block">Name</span>
          <span className="text-gray-800 font-medium">{guardData.name}</span>
          <span className="text-gray-500 block">Phone Number</span>
          <span className="text-gray-800 font-medium">{guardData.phoneNumber}</span>
          <span className="text-gray-500 block">Designation</span>
          <span className="text-gray-800 font-medium">{guardData.designation}</span>
          <span className="text-gray-500 block">Client</span>
          <span className="text-gray-800 font-medium">{guardData.client}</span>
          <span className="text-gray-500 block">Site</span>
          <span className="text-gray-800 font-medium">{guardData.site}</span>
          <span className="text-gray-500 block">Post</span>
          <span className="text-gray-800 font-medium">{guardData.post}</span>
          <span className="text-gray-500 block">Shift</span>
          <span className="text-gray-800 font-medium">{guardData.shift}</span>
          <span className="text-gray-500 block">Reporting Officer</span>
          <span className="text-gray-800 font-medium">{guardData.reportingOfficer}</span>
          <span className="text-gray-500 block">Phone Number</span>
          <span className="text-gray-800 font-medium">{guardData.reportingOfficerPhone}</span>
        </div>

        <div className="flex flex-col gap-4 bg-[#F7F7F7] p-4 rounded-lg w-[30vw] items-center">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-fit">
            <span className="text-gray-500 block">Assigned By</span>
            <span className="text-gray-800 font-medium">{taskData.assignedBy}</span>
            <span className="text-gray-500 block">Date</span>
            <span className="text-gray-800 font-medium">{taskData.date}</span>
            <span className="text-gray-500 block">Time</span>
            <span className="text-gray-800 font-medium">{taskData.time}</span>
            <span className="text-gray-500 block">Reason</span>
            <span className="text-gray-800 font-medium">Other</span>
          </div>
          <div className="space-y-4">
            <div className="">
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="bg-white w-full h-40 p-4 border-2 border-blue-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 text-gray-700"
                placeholder="Enter task description..."
              />
            </div>
            <div className="">
              <span className="text-gray-600 font-medium text-lg">
                Status: <span className="text-gray-800">{taskData.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIncidentView = () => (
    <div className="text-center p-4">
      {/* Incident Icon */}
      <div className="mb-4">
        <AlertTriangle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-700">INCIDENT</h3>
      </div>

      <div className="overflow-hidden whitespace-nowrap text-left">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 px-2 py-2">
          <div className="text-gray-600 font-medium text-sm">INCIDENT ID</div>
          <div className="text-gray-600 font-medium text-sm">CLIENT NAME</div>
          <div className="text-gray-600 font-medium text-sm">SITE NAME</div>
          <div className="text-gray-600 font-medium text-sm">TIME</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Table Data Row */}
          <div className="grid grid-cols-4 gap-4 px-2 py-2 bg-white items-center">
            <div className="text-gray-800 font-medium">{incidentData.id}</div>
            <div className="text-gray-800 font-medium">{incidentData.clientName}</div>
            <div className="text-gray-800 font-medium">{incidentData.siteName}</div>
            <div className="text-gray-800 font-medium">
              <div>{incidentData.date}</div>
              <div>{incidentData.time}</div>
            </div>
          </div>

          {/* Action Icons Row */}
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
      </div>

      <Button variant="contained" sx={{ mx: "auto", mt: 4 }}>
        <span className="text-xl">→</span>
        <span>VIEW INCIDENT</span>
      </Button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Geofence Breach Reason</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 w-full">
          {viewMode === "audio" && renderAudioView()}
          {viewMode === "task" && renderTaskView()}
          {viewMode === "incident" && renderIncidentView()}
        </div>
      </Box>
    </Modal>
  );
}
