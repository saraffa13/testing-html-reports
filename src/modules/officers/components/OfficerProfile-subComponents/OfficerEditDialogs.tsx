// File: src/components/OfficerProfile-subComponents/OfficerEditDialogs.tsx
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useAreasAndManagers } from "../../hooks/useAreasAndManagers";

// Base interface for all dialogs
interface BaseEditDialogProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  isLoading: boolean;
}

// Reusable Dialog Header Component
const DialogHeader: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Typography
      sx={{
        fontFamily: "Mukta",
        fontWeight: 600,
        fontSize: "18px",
        color: "#2A77D5",
        textTransform: "capitalize",
      }}
    >
      {title}
    </Typography>
    <IconButton onClick={onClose} sx={{ width: "32px", height: "32px" }}>
      <CloseIcon sx={{ color: "#707070" }} />
    </IconButton>
  </Box>
);

// Reusable Section Header Component
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Typography
    sx={{
      fontFamily: "Mukta",
      fontWeight: 600,
      fontSize: "14px",
      color: "#707070",
      textTransform: "uppercase",
    }}
  >
    {title}
  </Typography>
);

// Reusable Action Buttons Component
const ActionButtons: React.FC<{ onSave: () => void; isLoading: boolean }> = ({ onSave, isLoading }) => (
  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "16px", gap: "16px" }}>
    <Button
      variant="contained"
      startIcon={
        isLoading ? <CircularProgress size={16} sx={{ color: "#ffffff" }} /> : <CheckIcon sx={{ color: "#ffffff" }} />
      }
      onClick={onSave}
      disabled={isLoading}
      sx={{
        backgroundColor: "#2A77D5",
        fontFamily: "Mukta",
        textTransform: "uppercase",
        color: "#ffffff",
        fontSize: "12px",
        "&:hover": { backgroundColor: "#1E5AA3" },
        "&.Mui-disabled": { backgroundColor: "#A0A0A0" },
      }}
    >
      {isLoading ? "Saving..." : "Save Changes"}
    </Button>
  </Box>
);

// Officer Personal Details Edit Dialog
export const OfficerPersonalDetailsEditDialog: React.FC<BaseEditDialogProps> = ({
  open,
  onClose,
  formData,
  setFormData,
  onSave,
  isLoading,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "8px",
          maxWidth: "600px",
          width: "90%",
        },
      }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <DialogHeader title="Personal Details" onClose={onClose} />

          <SectionHeader title="Basic Details" />

          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <TextField
                label="First Name"
                variant="outlined"
                size="small"
                value={formData.firstName || ""}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                sx={{ flex: "1 1 150px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
              />
              <TextField
                label="Middle Name"
                variant="outlined"
                size="small"
                value={formData.middleName || ""}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                sx={{ flex: "1 1 150px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
              />
              <TextField
                label="Last Name"
                variant="outlined"
                size="small"
                value={formData.lastName || ""}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                sx={{ flex: "1 1 150px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
              />
            </Box>

            <TextField
              label="Email"
              variant="outlined"
              size="small"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{ "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
            />

            <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <TextField
                label="Date Of Birth"
                variant="outlined"
                size="small"
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                sx={{ flex: "1 1 150px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl size="small" sx={{ flex: "1 1 150px" }}>
                <Typography variant="body2" sx={{ mb: "8px", color: "#707070", fontFamily: "Mukta", fontSize: "12px" }}>
                  Sex
                </Typography>
                <Select
                  value={formData.sex || ""}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  sx={{ borderRadius: "4px" }}
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <TextField
                label="Blood Group"
                variant="outlined"
                size="small"
                value={formData.bloodGroup || ""}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                sx={{ flex: "1 1 120px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
              />
              <TextField
                label="Nationality"
                variant="outlined"
                size="small"
                value={formData.nationality || ""}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                sx={{ flex: "1 1 120px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <TextField
                label="Height (cm)"
                variant="outlined"
                size="small"
                type="number"
                value={formData.height || ""}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                sx={{ flex: "1 1 120px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
              />
              <TextField
                label="Weight (kg)"
                variant="outlined"
                size="small"
                type="number"
                value={formData.weight || ""}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                sx={{ flex: "1 1 120px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
              />
            </Box>

            <TextField
              label="Identification Mark"
              variant="outlined"
              size="small"
              value={formData.identificationMark || ""}
              onChange={(e) => setFormData({ ...formData, identificationMark: e.target.value })}
              sx={{ "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
            />
          </Box>

          <Divider />

          <SectionHeader title="Relations" />

          <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <TextField
              label="Father's Name"
              variant="outlined"
              size="small"
              value={formData.fatherName || ""}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              sx={{ flex: "1 1 200px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
            />
            <TextField
              label="Mother's Name"
              variant="outlined"
              size="small"
              value={formData.motherName || ""}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              sx={{ flex: "1 1 200px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ flex: "1 1 200px" }}>
              <Typography variant="body2" sx={{ mb: "8px", color: "#707070", fontFamily: "Mukta", fontSize: "12px" }}>
                Marital Status
              </Typography>
              <Select
                value={formData.maritalStatus || ""}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                sx={{ borderRadius: "4px" }}
              >
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Divorced">Divorced</MenuItem>
                <MenuItem value="Widowed">Widowed</MenuItem>
                <MenuItem value="">Not Specified</MenuItem>
              </Select>
            </FormControl>
            {formData.maritalStatus === "Married" && (
              <TextField
                label="Spouse's Name"
                variant="outlined"
                size="small"
                value={formData.spouseName || ""}
                onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                sx={{ flex: "1 1 200px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
              />
            )}
          </Box>

          <ActionButtons onSave={onSave} isLoading={isLoading} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Officer Contact Details Edit Dialog
export const OfficerContactDetailsEditDialog: React.FC<BaseEditDialogProps> = ({
  open,
  onClose,
  formData,
  setFormData,
  onSave,
  isLoading,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "8px",
          maxWidth: "700px",
          width: "95%",
        },
      }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <DialogHeader title="Contact Details" onClose={onClose} />

          <SectionHeader title="Contact Number" />

          <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <TextField
              label="Phone Number"
              variant="outlined"
              size="small"
              value={formData.phoneNumber || ""}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              sx={{ flex: "1 1 200px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
            />
            <TextField
              label="Alternate Number"
              variant="outlined"
              size="small"
              value={formData.alternateNumber || ""}
              onChange={(e) => setFormData({ ...formData, alternateNumber: e.target.value })}
              sx={{ flex: "1 1 200px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
            />
          </Box>

          <Divider />

          <SectionHeader title="Local Address" />

          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField
              fullWidth
              label="Address Line 1"
              variant="outlined"
              size="small"
              value={formData.localAddress?.addressLine1 || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  localAddress: { ...formData.localAddress, addressLine1: e.target.value },
                })
              }
            />
            <TextField
              fullWidth
              label="Address Line 2"
              variant="outlined"
              size="small"
              value={formData.localAddress?.addressLine2 || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  localAddress: { ...formData.localAddress, addressLine2: e.target.value },
                })
              }
            />
            <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <TextField
                label="City"
                variant="outlined"
                size="small"
                value={formData.localAddress?.city || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    localAddress: { ...formData.localAddress, city: e.target.value },
                  })
                }
                sx={{ flex: "1 1 150px" }}
              />
              <TextField
                label="District"
                variant="outlined"
                size="small"
                value={formData.localAddress?.district || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    localAddress: { ...formData.localAddress, district: e.target.value },
                  })
                }
                sx={{ flex: "1 1 150px" }}
              />
              <TextField
                label="Pincode"
                variant="outlined"
                size="small"
                value={formData.localAddress?.pincode || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    localAddress: { ...formData.localAddress, pincode: e.target.value },
                  })
                }
                sx={{ flex: "1 1 100px" }}
              />
            </Box>
            <TextField
              fullWidth
              label="State"
              variant="outlined"
              size="small"
              value={formData.localAddress?.state || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  localAddress: { ...formData.localAddress, state: e.target.value },
                })
              }
            />
          </Box>

          <Divider />

          <SectionHeader title="Permanent Address" />

          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField
              fullWidth
              label="Address Line 1"
              variant="outlined"
              size="small"
              value={formData.permanentAddress?.addressLine1 || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  permanentAddress: { ...formData.permanentAddress, addressLine1: e.target.value },
                })
              }
            />
            <TextField
              fullWidth
              label="Address Line 2"
              variant="outlined"
              size="small"
              value={formData.permanentAddress?.addressLine2 || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  permanentAddress: { ...formData.permanentAddress, addressLine2: e.target.value },
                })
              }
            />
            <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <TextField
                label="City"
                variant="outlined"
                size="small"
                value={formData.permanentAddress?.city || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    permanentAddress: { ...formData.permanentAddress, city: e.target.value },
                  })
                }
                sx={{ flex: "1 1 150px" }}
              />
              <TextField
                label="District"
                variant="outlined"
                size="small"
                value={formData.permanentAddress?.district || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    permanentAddress: { ...formData.permanentAddress, district: e.target.value },
                  })
                }
                sx={{ flex: "1 1 150px" }}
              />
              <TextField
                label="Pincode"
                variant="outlined"
                size="small"
                value={formData.permanentAddress?.pincode || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    permanentAddress: { ...formData.permanentAddress, pincode: e.target.value },
                  })
                }
                sx={{ flex: "1 1 100px" }}
              />
            </Box>
            <TextField
              fullWidth
              label="State"
              variant="outlined"
              size="small"
              value={formData.permanentAddress?.state || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  permanentAddress: { ...formData.permanentAddress, state: e.target.value },
                })
              }
            />
          </Box>

          <ActionButtons onSave={onSave} isLoading={isLoading} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Officer Emergency Contact Edit Dialog
export const OfficerEmergencyContactEditDialog: React.FC<BaseEditDialogProps> = ({
  open,
  onClose,
  formData,
  setFormData,
  onSave,
  isLoading,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "8px",
          maxWidth: "600px",
          width: "90%",
        },
      }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <DialogHeader title="Emergency Contact" onClose={onClose} />

          <TextField
            fullWidth
            label="Full Name"
            variant="outlined"
            size="small"
            value={formData.contactName || ""}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            sx={{ "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
          />

          <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ flex: "1 1 200px" }}>
              <Typography variant="body2" sx={{ mb: "8px", color: "#707070", fontFamily: "Mukta", fontSize: "12px" }}>
                Relationship
              </Typography>
              <Select
                value={formData.relationship || ""}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                sx={{ borderRadius: "4px" }}
              >
                <MenuItem value="Brother">Brother</MenuItem>
                <MenuItem value="Sister">Sister</MenuItem>
                <MenuItem value="Father">Father</MenuItem>
                <MenuItem value="Mother">Mother</MenuItem>
                <MenuItem value="Spouse">Spouse</MenuItem>
                <MenuItem value="Friend">Friend</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Contact Number"
              variant="outlined"
              size="small"
              value={formData.contactNumber || ""}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              sx={{ flex: "1 1 200px", "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
            />
          </Box>

          <ActionButtons onSave={onSave} isLoading={isLoading} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Officer Employment Details Edit Dialog - WITH DYNAMIC DROPDOWNS
export const OfficerEmploymentDetailsEditDialog: React.FC<BaseEditDialogProps> = ({
  open,
  onClose,
  formData,
  setFormData,
  onSave,
  isLoading,
}) => {
  const { user } = useAuth();
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  // Use the areas and managers hooks
  const {
    areas,
    managers,
    isLoading: dataLoading,
    hasError,
    error,
    getManagersByArea,
  } = useAreasAndManagers(user?.agencyId || null);

  // Set initial area selection based on form data
  useEffect(() => {
    if (formData.assignedArea && areas.length > 0) {
      const area = areas.find((a) => a.name === formData.assignedArea);
      if (area) {
        setSelectedAreaId(area.id);
      }
    }
  }, [formData.assignedArea, areas]);

  // Handle area change
  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    const selectedArea = areas.find((area) => area.id === areaId);

    setFormData({
      ...formData,
      assignedArea: selectedArea?.name || "",
      areaManager: "", // Clear manager when area changes
    });
  };

  // Handle manager change
  const handleManagerChange = (managerId: string) => {
    const selectedManager = managers.find((manager) => manager.id === managerId);

    setFormData({
      ...formData,
      areaManager: selectedManager?.fullName || "",
    });
  };

  // Get available managers for selected area
  const availableManagers = selectedAreaId ? getManagersByArea(selectedAreaId) : managers;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "8px",
          maxWidth: "600px",
          width: "90%",
        },
      }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <DialogHeader title="Employment Details" onClose={onClose} />

          <SectionHeader title="Employment Information" />

          {/* Error Display */}
          {hasError && (
            <Box sx={{ p: 2, backgroundColor: "#FFEBEE", borderRadius: 1 }}>
              <Typography color="error" variant="body2">
                {error?.message || "Failed to load areas and managers"}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField
              fullWidth
              label="Company ID"
              variant="outlined"
              size="small"
              value={formData.companyId || ""}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              sx={{ "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
              disabled // Company ID is usually not editable
            />

            <TextField
              fullWidth
              label="Date of Joining"
              variant="outlined"
              size="small"
              type="date"
              value={formData.dateOfJoining || ""}
              onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
              sx={{ "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Designation"
              variant="outlined"
              size="small"
              value={formData.designation || ""}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              sx={{ "& .MuiInputLabel-root": { fontFamily: "Mukta" } }}
            />

            {/* Dynamic Assigned Area Dropdown */}
            <FormControl size="small" fullWidth>
              <Typography variant="body2" sx={{ mb: "8px", color: "#707070", fontFamily: "Mukta", fontSize: "12px" }}>
                Assigned Area
              </Typography>
              <Select
                value={selectedAreaId}
                onChange={(e) => handleAreaChange(e.target.value as string)}
                sx={{ borderRadius: "4px" }}
                disabled={dataLoading || areas.length === 0}
              >
                {dataLoading
                  ? [
                      <MenuItem key="loading-areas" disabled>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        Loading areas...
                      </MenuItem>,
                    ]
                  : areas.length === 0
                    ? [
                        <MenuItem key="no-areas" disabled>
                          No areas available
                        </MenuItem>,
                      ]
                    : [
                        <MenuItem key="select-area" value="">
                          Select Area
                        </MenuItem>,
                        ...areas.map((area) => (
                          <MenuItem key={area.id} value={area.id}>
                            {area.name}
                          </MenuItem>
                        )),
                      ]}
              </Select>
            </FormControl>

            {/* Dynamic Area Manager Dropdown */}
            <FormControl size="small" fullWidth>
              <Typography variant="body2" sx={{ mb: "8px", color: "#707070", fontFamily: "Mukta", fontSize: "12px" }}>
                Area Manager
              </Typography>
              <Select
                value={
                  // Find manager ID from name for controlled component
                  managers.find((m) => m.fullName === formData.areaManager)?.id || ""
                }
                onChange={(e) => handleManagerChange(e.target.value as string)}
                sx={{ borderRadius: "4px" }}
                disabled={dataLoading || availableManagers.length === 0}
              >
                {dataLoading
                  ? [
                      <MenuItem key="loading-managers" disabled>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        Loading managers...
                      </MenuItem>,
                    ]
                  : availableManagers.length === 0
                    ? [
                        <MenuItem key="no-managers" disabled>
                          {selectedAreaId ? "No managers for selected area" : "Select an area first"}
                        </MenuItem>,
                      ]
                    : [
                        <MenuItem key="select-manager" value="">
                          Select Area Manager
                        </MenuItem>,
                        ...availableManagers.map((manager) => (
                          <MenuItem key={manager.id} value={manager.id}>
                            {manager.fullName}
                            {manager.area && ` (${manager.area.name})`}
                          </MenuItem>
                        )),
                      ]}
              </Select>
            </FormControl>
          </Box>

          <ActionButtons onSave={onSave} isLoading={isLoading} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
