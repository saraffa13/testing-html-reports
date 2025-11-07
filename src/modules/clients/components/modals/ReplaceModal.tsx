import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import SignalCellularAltOutlinedIcon from "@mui/icons-material/SignalCellularAltOutlined";
import { Avatar, Box, Button, Modal } from "@mui/material";
import { X } from "lucide-react";
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
  overflow: "auto",
};

interface ReplaceModalProps {
  open: boolean;
  onClose: () => void;
}
export const ReplaceModal: React.FC<ReplaceModalProps> = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Replacement guard</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            type="button"
          >
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>
        <div className="bg-[#F7F7F7] flex flex-row p-4 gap-4">
          <div className="w-[140px] h-[140px] flex items-center justify-center">
            <Avatar variant="square" src="" alt="Client Logo" sx={{ width: 140, height: 140, borderRadius: "10px" }} />
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 min-w-[20vw]">
            <span className="text-[#A3A3A3]">ID</span>
            <span>12445</span>
            <span className="text-[#A3A3A3]">Name</span>
            <span>Ramendra Sharma</span>
            <span className="text-[#A3A3A3]">Phone Number</span>
            <span>+91 9999 333333</span>
            <span className="text-[#A3A3A3]">Designation</span>
            <span>Security Guard</span>
            <span className="text-[#A3A3A3]">Reporting Officer</span>
            <span>Sachin Sharma</span>
            <span className="text-[#A3A3A3]">Phone Number</span>
            <span>+91 9999 99999</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 min-w-[20vw]">
              <span className="text-[#A3A3A3]">Client</span>
              <span>Axis Bank</span>
              <span className="text-[#A3A3A3]">Site</span>
              <span>Nehru Place</span>
              <span className="text-[#A3A3A3]">Post</span>
              <span>Entrance Gate</span>
              <span className="text-[#A3A3A3]">Shift</span>
              <span>8:00 PM - 8:00 AM</span>
            </div>
            <Button variant="contained" size="small" sx={{ whiteSpace: "nowrap", width: "fit-content" }}>
              <SignalCellularAltOutlinedIcon /> VIEW PERFORMANCE
            </Button>
          </div>
        </div>
        <div className="flex flex-col mt-8 items-center gap-4">
          <div className="flex flex-row gap-4 items-center">
            <Avatar src="" alt="profile" sx={{ width: 60, height: 60 }} />
            <ArrowForwardOutlinedIcon sx={{ fontSize: 40 }} />
            <Avatar src="" alt="client logo" sx={{ width: 60, height: 60 }} />
          </div>
          <span className="text-[#707070]">Assign Ramendra Sharma to Axis Bank, Nehru Place </span>
          <span>Duty Time - 08:00 AM</span>
          <Button onClick={onClose} variant="contained" size="small" sx={{ px: 8 }}>
            <CheckOutlinedIcon />
            Assign
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
