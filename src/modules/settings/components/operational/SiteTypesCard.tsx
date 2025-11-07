// File: components/settings/operational/SiteTypesCard.tsx
import EditIcon from "@mui/icons-material/Edit";
// File: components/settings/operational/SiteTypesCard.tsx
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

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

interface EditingSiteType {
  id?: string;
  name: string;
  isNew?: boolean;
  originalName?: string;
}

interface SiteTypesCardProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const SiteTypesCard: React.FC<SiteTypesCardProps> = ({ onSuccess, onError }) => {
  const { operationalSettings, siteTypesLoading, createSiteType, updateSiteType, deleteSiteType } = useSettings();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSiteTypes, setEditingSiteTypes] = useState<EditingSiteType[]>([]);

  const handleOpenModal = useCallback(() => {
    if (!operationalSettings) return;

    setEditingSiteTypes(
      operationalSettings.siteTypes.map((siteType) => ({
        id: siteType.id,
        name: siteType.name,
        originalName: siteType.name,
        isNew: false,
      }))
    );
    setModalOpen(true);
  }, [operationalSettings]);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const addSiteType = () => {
    setEditingSiteTypes([...editingSiteTypes, { name: "", isNew: true }]);
  };

  const updateSiteTypeLocal = (index: number, name: string) => {
    const newSiteTypes = [...editingSiteTypes];
    newSiteTypes[index].name = name;
    setEditingSiteTypes(newSiteTypes);
  };

  const deleteSiteTypeLocal = (index: number) => {
    setEditingSiteTypes(editingSiteTypes.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    try {
      const promises: Promise<void>[] = [];

      // Validate all site types have names
      for (const siteType of editingSiteTypes) {
        if (!siteType.name.trim()) {
          onError?.("Please fill in all site type names");
          return;
        }

        if (siteType.isNew) {
          // Create new site type
          promises.push(createSiteType(siteType.name.trim()));
        } else if (siteType.originalName !== siteType.name) {
          // Update existing site type
          if (siteType.id) {
            promises.push(updateSiteType(siteType.id, siteType.name.trim()));
          }
        }
      }

      // Handle deletions - find site types that were removed
      const currentSiteTypeIds = editingSiteTypes
        .filter((siteType) => !siteType.isNew && siteType.id)
        .map((siteType) => siteType.id!);

      const originalSiteTypeIds = operationalSettings?.siteTypes.map((siteType) => siteType.id) || [];
      const deletedIds = originalSiteTypeIds.filter((id) => !currentSiteTypeIds.includes(id));

      for (const deletedId of deletedIds) {
        promises.push(deleteSiteType(deletedId));
      }

      // Execute all API calls
      await Promise.all(promises);

      onSuccess?.("Site types updated successfully!");
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving site types:", error);
      onError?.(error.message || "Failed to save site types");
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
            Site Types ({operationalSettings.siteTypes.length})
          </Typography>
          <IconButton
            onClick={handleOpenModal}
            disabled={siteTypesLoading}
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
            {siteTypesLoading ? (
              <CircularProgress size={14} />
            ) : (
              <EditIcon sx={{ color: "#2A77D5", fontSize: "14px" }} />
            )}
          </IconButton>
        </Box>

        {/* Content - REMOVED slice(0, 12) limitation to show ALL site types */}
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
          {operationalSettings.siteTypes.map((siteType) => (
            <Chip
              key={siteType.id}
              label={siteType.name}
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
          {operationalSettings.siteTypes.length === 0 && (
            <Typography sx={{ color: "#A3A3A3", fontStyle: "italic" }}>No site types configured</Typography>
          )}
        </Box>
      </Box>

      {/* Edit Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#2A77D5", fontFamily: "Mukta", fontWeight: 600 }}>
            SITE TYPES
          </Typography>
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", mt: 2 }}>
            {editingSiteTypes.map((siteType, index) => (
              <Box key={index} sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <TextField
                  fullWidth
                  value={siteType.name}
                  onChange={(e) => updateSiteTypeLocal(index, e.target.value)}
                  variant="outlined"
                  size="small"
                  label={`Site Type ${index + 1}`}
                />
                <IconButton onClick={() => deleteSiteTypeLocal(index)} sx={{ color: "#2A77D5" }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={addSiteType} sx={{ color: "#2A77D5", textTransform: "none" }}>
              ADD NEW SITE TYPE
            </Button>
            <Button
              startIcon={<CheckIcon />}
              onClick={handleSaveChanges}
              disabled={siteTypesLoading}
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
              {siteTypesLoading ? <CircularProgress size={20} /> : "SAVE CHANGES"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SiteTypesCard;
