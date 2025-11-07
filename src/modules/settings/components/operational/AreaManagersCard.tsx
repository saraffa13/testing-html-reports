// File: components/settings/operational/AreaManagersCard.tsx
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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import { useSettings } from "../../context/SettingsContext";

interface EditingAreaManager {
  id?: string;
  name: string;
  phone: string;
  areaId: string;
  isNew?: boolean;
  originalData?: {
    name: string;
    phone: string;
    areaId: string;
  };
}

interface AreaManagersCardProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const AreaManagersCard: React.FC<AreaManagersCardProps> = ({ onSuccess, onError }) => {
  const { operationalSettings, areaManagersLoading, createAreaManager, updateAreaManager, deleteAreaManager } =
    useSettings();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAreaManagers, setEditingAreaManagers] = useState<EditingAreaManager[]>([]);

  const handleOpenModal = useCallback(() => {
    if (!operationalSettings) return;

    setEditingAreaManagers(
      operationalSettings.areaManagers.map((manager) => ({
        id: manager.id,
        name: manager.name,
        phone: manager.phone,
        areaId: manager.areaId,
        isNew: false,
        originalData: {
          name: manager.name,
          phone: manager.phone,
          areaId: manager.areaId,
        },
      }))
    );
    setModalOpen(true);
  }, [operationalSettings]);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const addAreaManager = () => {
    setEditingAreaManagers([...editingAreaManagers, { name: "", phone: "", areaId: "", isNew: true }]);
  };

  const updateAreaManagerLocal = (index: number, field: string, value: string) => {
    const newManagers = [...editingAreaManagers];
    (newManagers[index] as any)[field] = value;
    setEditingAreaManagers(newManagers);
  };

  const deleteAreaManagerLocal = (index: number) => {
    setEditingAreaManagers(editingAreaManagers.filter((_, i) => i !== index));
  };

  const hasChanges = (manager: EditingAreaManager): boolean => {
    if (manager.isNew) return true;
    if (!manager.originalData) return false;

    return (
      manager.name !== manager.originalData.name ||
      manager.phone !== manager.originalData.phone ||
      manager.areaId !== manager.originalData.areaId
    );
  };

  const handleSaveChanges = async () => {
    try {
      const promises: Promise<void>[] = [];

      // Validate all area managers have required fields
      for (const manager of editingAreaManagers) {
        if (!manager.name.trim() || !manager.phone.trim() || !manager.areaId) {
          onError?.("Please fill in all required fields for area managers");
          return;
        }

        if (manager.isNew) {
          // Create new area manager
          promises.push(createAreaManager(manager.name.trim(), manager.phone.trim(), manager.areaId));
        } else if (hasChanges(manager)) {
          // Update existing area manager
          if (manager.id) {
            promises.push(updateAreaManager(manager.id, manager.name.trim(), manager.phone.trim(), manager.areaId));
          }
        }
      }

      // Handle deletions - find area managers that were removed
      const currentManagerIds = editingAreaManagers
        .filter((manager) => !manager.isNew && manager.id)
        .map((manager) => manager.id!);

      const originalManagerIds = operationalSettings?.areaManagers.map((manager) => manager.id) || [];
      const deletedIds = originalManagerIds.filter((id) => !currentManagerIds.includes(id));

      for (const deletedId of deletedIds) {
        promises.push(deleteAreaManager(deletedId));
      }

      // Execute all API calls
      await Promise.all(promises);

      onSuccess?.("Area managers updated successfully!");
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving area managers:", error);
      onError?.(error.message || "Failed to save area managers");
    }
  };

  // Helper function to get area name by ID
  const getAreaName = (areaId: string): string => {
    const area = operationalSettings?.areas.find((area) => area.id === areaId);
    return area?.name || "Unknown Area";
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
            Area Managers ({operationalSettings.areaManagers.length})
          </Typography>
          <IconButton
            onClick={handleOpenModal}
            disabled={areaManagersLoading}
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
            {areaManagersLoading ? (
              <CircularProgress size={14} />
            ) : (
              <EditIcon sx={{ color: "#2A77D5", fontSize: "14px" }} />
            )}
          </IconButton>
        </Box>

        {/* Content - Show ALL area managers with enhanced display */}
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
          {operationalSettings.areaManagers.map((manager) => (
            <Box key={manager.id} sx={{ width: "100%", mb: 1 }}>
              <Chip
                label={`${manager.name} - ${getAreaName(manager.areaId)}`}
                sx={{
                  height: "36px",
                  borderRadius: "36px",
                  padding: "8px 16px",
                  background: "#F7F7F7",
                  color: "#629DE4",
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "14px", // Slightly smaller to fit more text
                  lineHeight: "20px",
                  maxWidth: "100%",
                  "& .MuiChip-label": {
                    padding: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            </Box>
          ))}
          {operationalSettings.areaManagers.length === 0 && (
            <Typography sx={{ color: "#A3A3A3", fontStyle: "italic" }}>No area managers configured</Typography>
          )}
        </Box>
      </Box>

      {/* Edit Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#2A77D5", fontFamily: "Mukta", fontWeight: 600 }}>
            AREA MANAGERS
          </Typography>
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", mt: 2 }}>
            {editingAreaManagers.map((manager, index) => (
              <Box key={index} sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <TextField
                  value={manager.name}
                  onChange={(e) => updateAreaManagerLocal(index, "name", e.target.value)}
                  variant="outlined"
                  size="small"
                  label="Full Name"
                  sx={{ flex: 1 }}
                />
                <TextField
                  value={manager.phone}
                  onChange={(e) => updateAreaManagerLocal(index, "phone", e.target.value)}
                  variant="outlined"
                  size="small"
                  label="Contact Number"
                  sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel>Area</InputLabel>
                  <Select
                    value={manager.areaId}
                    onChange={(e) => updateAreaManagerLocal(index, "areaId", e.target.value)}
                    label="Area"
                  >
                    {operationalSettings?.areas.map((area) => (
                      <MenuItem key={area.id} value={area.id}>
                        {area.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton onClick={() => deleteAreaManagerLocal(index)} sx={{ color: "#2A77D5" }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={addAreaManager} sx={{ color: "#2A77D5", textTransform: "none" }}>
              ADD NEW AREA MANAGER
            </Button>
            <Button
              startIcon={<CheckIcon />}
              onClick={handleSaveChanges}
              disabled={areaManagersLoading}
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
              {areaManagersLoading ? <CircularProgress size={20} /> : "SAVE CHANGES"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AreaManagersCard;
