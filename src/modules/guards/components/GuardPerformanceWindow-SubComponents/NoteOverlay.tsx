import { Close } from "@mui/icons-material";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import React from "react";

interface NoteOverlayProps {
  open: boolean;
  onClose: () => void;
  note: string;
  taskId: string;
  assignedBy: string;
  taskTime: string;
}

/**
 * Note overlay modal component for displaying task notes
 */
const NoteOverlay: React.FC<NoteOverlayProps> = ({ open, onClose, note, assignedBy, taskTime }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "400px",
          maxWidth: "90vw",
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          padding: "24px",
          outline: "none",
          boxShadow: "0px 8px 32px 0px rgba(0, 0, 0, 0.16)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "18px",
              color: "#3B3B3B",
            }}
          >
            Task Note
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Task Details */}
        <Box
          sx={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#F9F9F9",
            borderRadius: "8px",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 500,
              fontSize: "12px",
              color: "#707070",
              marginBottom: "4px",
            }}
          >
            ASSIGNED BY: {assignedBy.toUpperCase()}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 500,
              fontSize: "12px",
              color: "#707070",
            }}
          >
            TASK TIME: {taskTime}
          </Typography>
        </Box>

        {/* Note Content */}
        <Box
          sx={{
            padding: "16px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #F0F0F0",
            borderRadius: "8px",
            minHeight: "100px",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#3B3B3B",
              whiteSpace: "pre-wrap",
            }}
          >
            {note || "No note available for this task."}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

export default NoteOverlay;
