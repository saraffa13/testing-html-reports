import { Avatar, Box, Button, Modal } from "@mui/material";
import { Play, X } from "lucide-react";
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
  status: string;
  note?: string;
}

interface TaskNoteModalProps {
  open: boolean;
  onClose: () => void;
  viewMode?: "audio" | "task" | "incident";
  guardData?: GuardData;
  taskData?: TaskData;
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

export default function TaskNoteModal({
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
    status: "Not Approved By Area Officer",
  },
}: TaskNoteModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [taskDescription, setTaskDescription] = useState(taskData?.note || "");
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
          </div>
          <div className="space-y-4">
            <div className="">
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                disabled={true}
                className="bg-gray-100 w-full h-40 p-4 border-2 border-gray-300 rounded-lg resize-none focus:outline-none text-gray-700 cursor-not-allowed"
                placeholder="No task description available..."
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

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Task Note</h2>
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
        </div>
      </Box>
    </Modal>
  );
}
