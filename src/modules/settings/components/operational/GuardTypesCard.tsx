// File: components/settings/operational/GuardTypesCard.tsx
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

interface EditingGuardType {
  id?: string;
  name: string;
  isNew?: boolean;
  originalName?: string;
}

interface GuardTypesCardProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const GuardTypesCard: React.FC<GuardTypesCardProps> = ({ onSuccess, onError }) => {
  const { operationalSettings, guardTypesLoading, createGuardType, updateGuardType, deleteGuardType } = useSettings();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuardTypes, setEditingGuardTypes] = useState<EditingGuardType[]>([]);

  const handleOpenModal = useCallback(() => {
    if (!operationalSettings) return;

    setEditingGuardTypes(
      operationalSettings.securityGuardTypes.map((gt) => ({
        id: gt.id,
        name: gt.name,
        originalName: gt.name,
        isNew: false,
      }))
    );
    setModalOpen(true);
  }, [operationalSettings]);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const addGuardType = () => {
    setEditingGuardTypes([...editingGuardTypes, { name: "", isNew: true }]);
  };

  const updateGuardTypeLocal = (index: number, name: string) => {
    const newGuardTypes = [...editingGuardTypes];
    newGuardTypes[index].name = name;
    setEditingGuardTypes(newGuardTypes);
  };

  const deleteGuardTypeLocal = (index: number) => {
    setEditingGuardTypes(editingGuardTypes.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    try {
      const promises: Promise<void>[] = [];

      // Validate all guard types have names
      for (const guardType of editingGuardTypes) {
        if (!guardType.name.trim()) {
          onError?.("Please fill in all guard type names");
          return;
        }

        if (guardType.isNew) {
          // Create new guard type
          promises.push(createGuardType(guardType.name.trim()));
        } else if (guardType.originalName !== guardType.name) {
          // Update existing guard type
          if (guardType.id) {
            promises.push(updateGuardType(guardType.id, guardType.name.trim()));
          }
        }
      }

      // Handle deletions - find guard types that were removed
      const currentGuardTypeIds = editingGuardTypes.filter((gt) => !gt.isNew && gt.id).map((gt) => gt.id!);

      const originalGuardTypeIds = operationalSettings?.securityGuardTypes.map((gt) => gt.id) || [];
      const deletedIds = originalGuardTypeIds.filter((id) => !currentGuardTypeIds.includes(id));

      for (const deletedId of deletedIds) {
        promises.push(deleteGuardType(deletedId));
      }

      // Execute all API calls
      await Promise.all(promises);

      onSuccess?.("Guard types updated successfully!");
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving guard types:", error);
      onError?.(error.message || "Failed to save guard types");
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
            Security Guard Types ({operationalSettings.securityGuardTypes.length})
          </Typography>
          <IconButton
            onClick={handleOpenModal}
            disabled={guardTypesLoading}
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
            {guardTypesLoading ? (
              <CircularProgress size={14} />
            ) : (
              <EditIcon sx={{ color: "#2A77D5", fontSize: "14px" }} />
            )}
          </IconButton>
        </Box>

        {/* Content - REMOVED slice(0, 6) limitation to show ALL guard types */}
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
          {operationalSettings.securityGuardTypes.map((guardType) => (
            <Chip
              key={guardType.id}
              label={guardType.name}
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
          {operationalSettings.securityGuardTypes.length === 0 && (
            <Typography sx={{ color: "#A3A3A3", fontStyle: "italic" }}>No guard types configured</Typography>
          )}
        </Box>
      </Box>

      {/* Edit Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#2A77D5", fontFamily: "Mukta", fontWeight: 600 }}>
            SECURITY GUARD TYPE
          </Typography>
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", mt: 2 }}>
            {editingGuardTypes.map((guardType, index) => (
              <Box key={index} sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <TextField
                  fullWidth
                  value={guardType.name}
                  onChange={(e) => updateGuardTypeLocal(index, e.target.value)}
                  variant="outlined"
                  size="small"
                  label={`Guard Type ${index + 1}`}
                />
                <IconButton onClick={() => deleteGuardTypeLocal(index)} sx={{ color: "#2A77D5" }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={addGuardType} sx={{ color: "#2A77D5", textTransform: "none" }}>
              ADD NEW GUARD TYPE
            </Button>
            <Button
              startIcon={<CheckIcon />}
              onClick={handleSaveChanges}
              disabled={guardTypesLoading}
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
              {guardTypesLoading ? <CircularProgress size={20} /> : "SAVE CHANGES"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GuardTypesCard;
