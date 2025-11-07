import { Avatar, Box, Button, Modal } from "@mui/material";
import { X } from "lucide-react";
import { useState } from "react";

interface LivelinessModalProps {
  open: boolean;
  onClose: () => void;
  rowData: any;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffffff",
  borderRadius: "8px",
  boxShadow: 24,
  p: 0,
  maxHeight: "95vh",
  width: "85vw",
  maxWidth: "1200px",
  overflow: "hidden",
};

export default function LivelinessModal({ open, onClose, rowData }: LivelinessModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!open || !rowData) return null;

  const capturedImages = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop&crop=face",
  ];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : capturedImages.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < capturedImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="liveliness-modal-title">
      <Box sx={style}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Liveliness Test Alert</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-row my-10 gap-4">
          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="p-6 max-h-[80vh] w-[15vw] overflow-y-auto">
                <div className="col-span-2">
                  <Avatar
                    variant="square"
                    src={
                      rowData.photo ||
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=250&fit=crop&crop=face"
                    }
                    alt={rowData.personName}
                    sx={{ width: "100%", height: 200, borderRadius: "12px" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                <span className="text-gray-500 block">ID</span>
                <span className="text-gray-800 font-medium">{rowData.idNumber}</span>

                <span className="text-gray-500 block">Name</span>
                <span className="text-gray-800 font-medium">{rowData.personName}</span>

                <span className="text-gray-500 block">Phone Number</span>
                <span className="text-gray-800 font-medium">+91 9999 333333</span>

                <span className="text-gray-500 block">Designation</span>
                <span className="text-gray-800 font-medium">{rowData.designation}</span>

                <span className="text-gray-500 block">Client</span>
                <span className="text-gray-800 font-medium">{rowData.clientName}</span>
                <span className="text-gray-500 block">Site</span>
                <span className="text-gray-800 font-medium">{rowData.siteName}</span>

                <span className="text-gray-500 block">Post</span>
                <span className="text-gray-800 font-medium">Entrance Gate</span>

                <span className="text-gray-500 block">Shift</span>
                <span className="text-gray-800 font-medium">8:00 PM - 8:00 AM</span>
                <span className="text-gray-500 block">Reporting Officer</span>
                <span className="text-gray-800 font-medium">Sachin Sharma</span>
                <span className="text-gray-500 block">Phone Number</span>
                <span className="text-gray-800 font-medium">+91 9999 99999</span>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="contained"
                startIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                }
              >
                ALLOW
              </Button>
              <Button
                variant="contained"
                startIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                DENY
              </Button>
            </div>
          </div>
          <div className="flex flex-row bg-[#F7F7F7] p-4 rounded-lg gap-4">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm h-fit">
              <span className="text-gray-500 block">Date of Alert</span>
              <span className="text-gray-800 font-medium">23/01/2025</span>
              <span className="text-gray-500 block">Time of Alert</span>
              <span className="text-gray-800 font-medium">07:57 PM</span>
              <span className="text-gray-500 block">Where</span>
              <span className="text-gray-800 font-medium">Duty Check-In</span>
              <span className="text-gray-500 block">System Note</span>
              <span className="text-gray-800 font-medium">Face doesn't match</span>
            </div>

            <div>
              <div className="space-y-4">
                <h3 className="font-medium text-gray-600 text-right">Captured Images And Video</h3>

                <div className="relative">
                  <img
                    src={capturedImages[currentImageIndex]}
                    alt="Captured"
                    className="w-full h-80 object-cover rounded-lg shadow-sm"
                  />

                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-2 justify-center">
                  {capturedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-12 h-12 rounded border-2 overflow-hidden transition-all shadow-sm ${
                        index === currentImageIndex ? "border-[#2A77D5]" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={capturedImages[index]}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}
