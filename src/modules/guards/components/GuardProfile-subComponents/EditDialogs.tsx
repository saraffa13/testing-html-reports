// File: src/components/profile/EditDialogs.tsx
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
import React from "react";
import { useGuardTypes } from "../../hooks/useGuardTypes";

// Personal Details Edit Dialog
interface PersonalDetailsEditDialogProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  isLoading: boolean;
}

export const PersonalDetailsEditDialog: React.FC<PersonalDetailsEditDialogProps> = ({
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
          {/* Dialog Header */}
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
              Personal Details
            </Typography>
            <IconButton onClick={onClose} sx={{ width: "32px", height: "32px" }}>
              <CloseIcon sx={{ color: "#707070" }} />
            </IconButton>
          </Box>

          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "14px",
              color: "#707070",
              textTransform: "uppercase",
            }}
          >
            Basic Details
          </Typography>

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

          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "14px",
              color: "#707070",
              textTransform: "uppercase",
            }}
          >
            Relations
          </Typography>

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
                <MenuItem value="Widow/Widower">Widow/Widower</MenuItem>
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

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "16px", gap: "16px" }}>
            <Button
              variant="contained"
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} sx={{ color: "#ffffff" }} />
                ) : (
                  <CheckIcon sx={{ color: "#ffffff" }} />
                )
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
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Contact Details Edit Dialog
interface ContactDetailsEditDialogProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  isLoading: boolean;
}

export const ContactDetailsEditDialog: React.FC<ContactDetailsEditDialogProps> = ({
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
          {/* Dialog Header */}
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
              Contact Details
            </Typography>
            <IconButton onClick={onClose} sx={{ width: "32px", height: "32px" }}>
              <CloseIcon sx={{ color: "#707070" }} />
            </IconButton>
          </Box>

          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "14px",
              color: "#707070",
              textTransform: "uppercase",
            }}
          >
            Contact Number
          </Typography>

          <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <TextField
              label="Phone Number"
              variant="outlined"
              size="small"
              value={formData.mobileNumber || ""}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
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

          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "14px",
              color: "#707070",
              textTransform: "uppercase",
            }}
          >
            Permanent Address
          </Typography>

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

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "16px", gap: "16px" }}>
            <Button
              variant="contained"
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} sx={{ color: "#ffffff" }} />
                ) : (
                  <CheckIcon sx={{ color: "#ffffff" }} />
                )
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
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Emergency Contact Edit Dialog
interface EmergencyContactEditDialogProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  isLoading: boolean;
}

export const EmergencyContactEditDialog: React.FC<EmergencyContactEditDialogProps> = ({
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
          {/* Dialog Header */}
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
              Emergency Contact
            </Typography>
            <IconButton onClick={onClose} sx={{ width: "32px", height: "32px" }}>
              <CloseIcon sx={{ color: "#707070" }} />
            </IconButton>
          </Box>

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

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "16px", gap: "16px" }}>
            <Button
              variant="contained"
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} sx={{ color: "#ffffff" }} />
                ) : (
                  <CheckIcon sx={{ color: "#ffffff" }} />
                )
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
        </Box>
      </DialogContent>
    </Dialog>
  );
};

interface EmploymentDetailsEditDialogProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  isLoading: boolean;
  agencyId?: string; // Add agencyId for fetching guard types
}

export const EmploymentDetailsEditDialog: React.FC<EmploymentDetailsEditDialogProps> = ({
  open,
  onClose,
  formData,
  setFormData,
  onSave,
  isLoading,
  agencyId,
}) => {
  // Fetch guard types for the dropdown
  const {
    data: guardTypes,
    isLoading: guardTypesLoading,
    error: guardTypesError,
  } = useGuardTypes(agencyId || "", { enabled: !!agencyId && open });
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
          {/* Dialog Header */}
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
              Employment Details
            </Typography>
            <IconButton onClick={onClose} sx={{ width: "32px", height: "32px" }}>
              <CloseIcon sx={{ color: "#707070" }} />
            </IconButton>
          </Box>

          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "14px",
              color: "#707070",
              textTransform: "uppercase",
            }}
          >
            Employment Information
          </Typography>

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

            <FormControl size="small" fullWidth>
              <Typography variant="body2" sx={{ mb: "8px", color: "#707070", fontFamily: "Mukta", fontSize: "12px" }}>
                Guard Type / Designation
              </Typography>
              <Select
                value={formData.guardType || ""}
                onChange={(e) => setFormData({ ...formData, guardType: e.target.value })}
                sx={{ borderRadius: "4px" }}
                disabled={guardTypesLoading}
              >
                {guardTypesLoading ? (
                  <MenuItem value="" disabled>
                    Loading guard types...
                  </MenuItem>
                ) : guardTypesError ? (
                  <MenuItem value="" disabled>
                    Error loading guard types
                  </MenuItem>
                ) : guardTypes && guardTypes.length > 0 ? (
                  guardTypes.map((guardType) => (
                    <MenuItem key={guardType.id} value={guardType.id}>
                      {guardType.typeName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No guard types available
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <Typography variant="body2" sx={{ mb: "8px", color: "#707070", fontFamily: "Mukta", fontSize: "12px" }}>
                PSARA Certification Status
              </Typography>
              <Select
                value={formData.psaraCertificationStatus || ""}
                onChange={(e) => setFormData({ ...formData, psaraCertificationStatus: e.target.value })}
                sx={{ borderRadius: "4px" }}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="EXPIRED">Expired</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "16px", gap: "16px" }}>
            <Button
              variant="contained"
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} sx={{ color: "#ffffff" }} />
                ) : (
                  <CheckIcon sx={{ color: "#ffffff" }} />
                )
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
        </Box>
      </DialogContent>
    </Dialog>
  );
};
