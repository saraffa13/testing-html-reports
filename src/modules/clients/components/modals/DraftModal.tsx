import { Box, Button, Modal, Typography } from "@mui/material";
import { X } from "lucide-react";
import React from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffffff",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  width: "400px",
};

interface DraftModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  onDiscard: () => void;
  savedAt: string;
}

export const DraftModal: React.FC<DraftModalProps> = ({ open, onClose, onContinue, onDiscard, savedAt }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6" component="h2" className="text-[#2A77D5] font-semibold">
            Draft Found
          </Typography>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <Typography variant="body1" className="mb-4 text-gray-600">
          Found a saved draft from{" "}
          <span className="font-semibold text-gray-800">{new Date(savedAt).toLocaleString()}</span>. Would you like to
          continue where you left off?
        </Typography>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outlined" onClick={onDiscard} color="error">
            Discard Draft
          </Button>
          <Button variant="contained" onClick={onContinue}>
            Continue Draft
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
