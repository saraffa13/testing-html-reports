// File: src/modules/officers/components/AddTaskForm/CustomLocationModal.tsx
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

interface CustomLocationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (locationName: string) => void;
  initialValue?: string;
}

const CustomLocationModal: React.FC<CustomLocationModalProps> = ({ open, onClose, onSave, initialValue = "" }) => {
  const [locationName, setLocationName] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setLocationName(initialValue);
      setError(null);
    }
  }, [open, initialValue]);

  const handleSave = () => {
    const trimmedName = locationName.trim();

    if (!trimmedName) {
      setError("Location name is required");
      return;
    }

    if (trimmedName.length < 3) {
      setError("Location name must be at least 3 characters long");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Location name must be less than 100 characters");
      return;
    }

    onSave(trimmedName);
    onClose();
  };

  const handleCancel = () => {
    setLocationName(initialValue);
    setError(null);
    onClose();
  };

  const handleLocationNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationName(event.target.value);
    if (error) {
      setError(null); // Clear error when user starts typing
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSave();
    } else if (event.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          minHeight: "300px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px",
          paddingBottom: "16px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocationOnIcon sx={{ color: "#2A77D5", fontSize: "24px" }} />
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "20px",
              color: "#2A77D5",
            }}
          >
            Add Custom Location
          </Typography>
        </Box>

        <IconButton
          onClick={handleCancel}
          sx={{
            color: "#707070",
            "&:hover": {
              backgroundColor: "#F5F5F5",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "0 24px 24px 24px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Description */}
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontSize: "14px",
              color: "#707070",
              lineHeight: "20px",
            }}
          >
            Enter the name of the custom location where the task should be performed. This could be a new site,
            building, or any specific location.
          </Typography>

          {/* Location Name Input */}
          <Box>
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "14px",
                color: "#3B3B3B",
                marginBottom: "8px",
              }}
            >
              Location Name <span style={{ color: "red" }}>*</span>
            </Typography>

            <TextField
              fullWidth
              placeholder="Enter location name (e.g., New Office Building, Client Site A)"
              value={locationName}
              onChange={handleLocationNameChange}
              onKeyPress={handleKeyPress}
              error={!!error}
              helperText={error}
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: error ? "1px solid #E05952" : "1px solid #A3A3A3",
                  "&:hover": {
                    border: error ? "1px solid #E05952" : "1px solid #2A77D5",
                  },
                  "&.Mui-focused": {
                    border: error ? "2px solid #E05952" : "2px solid #2A77D5",
                  },
                },
                "& .MuiInputBase-input": {
                  fontFamily: "Mukta",
                  fontSize: "14px",
                  padding: "12px 16px",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#A3A3A3",
                  opacity: 1,
                },
                "& .MuiFormHelperText-root": {
                  fontFamily: "Mukta",
                  fontSize: "12px",
                  marginLeft: 0,
                  marginTop: "4px",
                },
              }}
            />

            {/* Character Counter */}
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontSize: "12px",
                color: "#A3A3A3",
                textAlign: "right",
                marginTop: "4px",
              }}
            >
              {locationName.length}/100 characters
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              marginTop: "16px",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "14px",
                textTransform: "uppercase",
                borderRadius: "8px",
                padding: "8px 24px",
                color: "#707070",
                borderColor: "#A3A3A3",
                "&:hover": {
                  borderColor: "#707070",
                  backgroundColor: "#F5F5F5",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!locationName.trim()}
              sx={{
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "14px",
                textTransform: "uppercase",
                borderRadius: "8px",
                padding: "8px 24px",
                backgroundColor: "#2A77D5",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#1E5AA3",
                },
                "&:disabled": {
                  backgroundColor: "#F0F0F0",
                  color: "#A3A3A3",
                },
              }}
            >
              Save Location
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CustomLocationModal;
