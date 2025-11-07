// File: components/settings/operational/AreasCard.tsx
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import { useSettings } from "../../context/SettingsContext";

interface EditingArea {
  id?: string;
  name: string;
  isNew?: boolean;
  originalName?: string;
}

interface AreasCardProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const AreasCard: React.FC<AreasCardProps> = ({ onSuccess, onError }) => {
  const { operationalSettings, areasLoading, createArea, updateArea, deleteArea } = useSettings();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAreas, setEditingAreas] = useState<EditingArea[]>([]);

  const handleOpenModal = useCallback(() => {
    if (!operationalSettings) return;

    setEditingAreas(
      operationalSettings.areas.map((area) => ({
        id: area.id,
        name: area.name,
        originalName: area.name,
        isNew: false,
      }))
    );
    setModalOpen(true);
  }, [operationalSettings]);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const addArea = () => {
    setEditingAreas([...editingAreas, { name: "", isNew: true }]);
  };

  const updateAreaLocal = (index: number, name: string) => {
    const newAreas = [...editingAreas];
    newAreas[index].name = name;
    setEditingAreas(newAreas);
  };

  const deleteAreaLocal = (index: number) => {
    setEditingAreas(editingAreas.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    try {
      const promises: Promise<void>[] = [];

      // Validate all areas have names
      for (const area of editingAreas) {
        if (!area.name.trim()) {
          onError?.("Please fill in all area names");
          return;
        }

        if (area.isNew) {
          // Create new area
          promises.push(createArea(area.name.trim()));
        } else if (area.originalName !== area.name) {
          // Update existing area
          if (area.id) {
            promises.push(updateArea(area.id, area.name.trim()));
          }
        }
      }

      // Handle deletions - find areas that were removed
      const currentAreaIds = editingAreas.filter((area) => !area.isNew && area.id).map((area) => area.id!);

      const originalAreaIds = operationalSettings?.areas.map((area) => area.id) || [];
      const deletedIds = originalAreaIds.filter((id) => !currentAreaIds.includes(id));

      for (const deletedId of deletedIds) {
        promises.push(deleteArea(deletedId));
      }

      // Execute all API calls
      await Promise.all(promises);

      onSuccess?.("Areas updated successfully!");
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving areas:", error);
      onError?.(error.message || "Failed to save areas");
    }
  };

  if (!operationalSettings) {
    return (
      <Box
        sx={{
          width: "420px",
          minHeight: "208px",
          borderRadius: "10px",
          padding: "16px",
          background: "#FFFFFF",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography sx={{ color: "#707070" }}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          width: "420px",
          minHeight: "208px",
          height: "auto",
          borderRadius: "10px",
          padding: "12px 16px 16px 16px",
          gap: "16px",
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            width: "388px",
            height: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "20px",
              textTransform: "capitalize",
              color: "#3B3B3B",
            }}
          >
            Areas ({operationalSettings.areas.length})
          </Typography>
          <IconButton
            onClick={handleOpenModal}
            disabled={areasLoading}
            sx={{
              width: "24px",
              height: "24px",
              borderRadius: "14px",
              background: "#FFFFFF",
              boxShadow: "0px 1px 4px 0px #70707033",
              "&:hover": {
                background: "#F5F5F5",
              },
              "&:disabled": {
                background: "#F5F5F5",
              },
            }}
          >
            {areasLoading ? <CircularProgress size={14} /> : <EditIcon sx={{ color: "#2A77D5", fontSize: "14px" }} />}
          </IconButton>
        </Box>

        {/* Content - REMOVED slice(0, 6) limitation to show ALL areas */}
        <Box
          sx={{
            width: "388px",
            minHeight: "152px",
            gap: "8px",
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
            maxHeight: "200px", // Add max height for better layout
            overflowY: "auto", // Add scroll if needed
          }}
        >
          {operationalSettings.areas.map((area) => (
            <Chip
              key={area.id}
              label={area.name}
              sx={{
                height: "36px",
                borderRadius: "36px",
                padding: "8px 16px",
                background: "#F7F7F7",
                color: "#629DE4",
                fontFamily: "Mukta",
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "24px",
                "& .MuiChip-label": {
                  padding: 0,
                },
              }}
            />
          ))}
          {operationalSettings.areas.length === 0 && (
            <Typography sx={{ color: "#A3A3A3", fontStyle: "italic" }}>No areas configured</Typography>
          )}
        </Box>
      </Box>

      {/* Edit Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#2A77D5", fontFamily: "Mukta", fontWeight: 600 }}>
            AREAS
          </Typography>
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", mt: 2 }}>
            {editingAreas.map((area, index) => (
              <Box key={index} sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <TextField
                  fullWidth
                  value={area.name}
                  onChange={(e) => updateAreaLocal(index, e.target.value)}
                  variant="outlined"
                  size="small"
                  label={`Area ${index + 1}`}
                />
                <IconButton onClick={() => deleteAreaLocal(index)} sx={{ color: "#2A77D5" }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={addArea} sx={{ color: "#2A77D5", textTransform: "none" }}>
              ADD NEW AREA
            </Button>
            <Button
              startIcon={<CheckIcon />}
              onClick={handleSaveChanges}
              disabled={areasLoading}
              variant="outlined"
              sx={{
                backgroundColor: "#FFFFFF",
                color: "#2A77D5",
                borderColor: "#2A77D5",
                textTransform: "none",
                mt: 2,
                height: "40px",
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                  borderColor: "#2A77D5",
                },
                "&:disabled": {
                  backgroundColor: "#F5F5F5",
                  borderColor: "#CCCCCC",
                  color: "#CCCCCC",
                },
              }}
            >
              {areasLoading ? <CircularProgress size={20} /> : "SAVE CHANGES"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AreasCard;
