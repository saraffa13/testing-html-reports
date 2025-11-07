import { Box, CircularProgress, Divider, MenuItem, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useAreasAndManagers } from "../../hooks/useAreasAndManagers";
import LabeledInput from "../LabeledInput";

// Define props interface for the component
interface OfficerEmploymentDetailsFormProps {
  register: any;
  errors: any; // Using any type for errors to avoid TypeScript issues
  watch?: any;
  setValue?: any;
}

const OfficerEmploymentDetailsForm: React.FC<OfficerEmploymentDetailsFormProps> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const { user } = useAuth(); // Get the logged-in user
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  // Use the new hooks to fetch areas and managers
  const { areas, managers, isLoading, hasError, error, refetchAll } = useAreasAndManagers(user?.agencyId || null);

  // Auto-fill company ID with agency ID when component mounts
  useEffect(() => {
    if (user?.agencyId && setValue) {
      setValue("employmentDetails.companyId", user.agencyId);
    }
  }, [user, setValue]);

  // Helper functions to check and get errors
  const hasFieldError = (fieldName: string) => {
    return errors?.employmentDetails && errors.employmentDetails[fieldName] ? true : false;
  };

  const getErrorMessage = (fieldName: string) => {
    return hasFieldError(fieldName) ? errors.employmentDetails[fieldName].message : "";
  };

  // Get values from watch
  const assignedDutyArea = watch ? watch("employmentDetails.assignedDutyArea") || "" : "";
  const assignedDutyAreaId = watch ? watch("employmentDetails.assignedDutyAreaId") || "" : "";
  const areaManager = watch ? watch("employmentDetails.areaManager") || "" : "";
  const areaManagerId = watch ? watch("employmentDetails.areaManagerId") || "" : "";

  // Handle area selection change
  const handleAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const areaId = event.target.value;
    const selectedArea = areas.find((area) => area.id === areaId);

    console.log("🎯 Area selection changed:", {
      areaId,
      areaName: selectedArea?.name,
      currentManagerId: areaManagerId,
      managersInThisArea: managers.filter((m) => m.areaId === areaId).length,
    });

    setSelectedAreaId(areaId);

    if (setValue) {
      // Store both ID and name for backward compatibility
      setValue("employmentDetails.assignedDutyArea", selectedArea?.name || "", {
        shouldValidate: true, // Trigger validation immediately
      });
      setValue("employmentDetails.assignedDutyAreaId", areaId);

      // Only clear area manager if the current manager is not from the selected area
      if (areaManagerId) {
        const currentManager = managers.find((m) => m.id === areaManagerId);
        if (currentManager && currentManager.areaId !== areaId) {
          // Manager is from a different area, clear it
          console.log("🧹 Clearing manager because they are from different area");
          setValue("employmentDetails.areaManager", "", {
            shouldValidate: true,
          });
          setValue("employmentDetails.areaManagerId", "");
        } else {
          console.log("✅ Keeping current manager as they belong to selected area");
        }
      }
    }
  };

  // Handle area manager selection change
  const handleAreaManagerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const managerId = event.target.value;
    const selectedManager = managers.find((manager) => manager.id === managerId);

    console.log("👤 Manager selection changed:", {
      managerId,
      managerName: selectedManager?.fullName,
      managerAreaId: selectedManager?.areaId,
      currentAreaId: selectedAreaId,
    });

    if (setValue) {
      // Store both ID and name for backward compatibility
      setValue("employmentDetails.areaManager", selectedManager?.fullName || "", {
        shouldValidate: true, // Trigger validation immediately
      });
      setValue("employmentDetails.areaManagerId", managerId);
    }
  };

  // Get available managers for the selected area
  const availableManagers = selectedAreaId ? managers.filter((manager) => manager.areaId === selectedAreaId) : managers; // Show all managers if no area selected

  console.log("🔍 Manager filtering debug:", {
    selectedAreaId,
    totalManagers: managers.length,
    availableManagers: availableManagers.length,
    managerAreaIds: managers.map((m) => ({ name: m.fullName, areaId: m.areaId })),
  });

  // Find area ID from area name (for initial load)
  useEffect(() => {
    if (assignedDutyArea && areas.length > 0 && !selectedAreaId) {
      const area = areas.find((a) => a.name === assignedDutyArea);
      if (area) {
        setSelectedAreaId(area.id);
      }
    }
    // If we have an area ID stored, use that
    if (assignedDutyAreaId && areas.length > 0) {
      setSelectedAreaId(assignedDutyAreaId);
    }
  }, [assignedDutyArea, assignedDutyAreaId, areas.length, selectedAreaId]); // Fixed dependencies

  // Simple phone number formatting - only allow digits and limit to 10
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");

    // Limit to 10 digits
    return digitsOnly.substring(0, 10);
  };

  // Handle phone number input change - no +91 prefix (handled by backend)
  const handlePhoneChange = (fieldName: string, value: string) => {
    const formatted = formatPhoneNumber(value);
    if (setValue) {
      setValue(fieldName, formatted);
    }
  };

  return (
    <Box
      sx={{
        width: "1136px",
        height: "632px",
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "-ms-overflow-style": "none",
        "scrollbar-width": "none",
      }}
    >
      {/* Employment Details Heading */}
      <Typography
        variant="h1"
        sx={{
          fontFamily: "Mukta",
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "32px",
          color: "#2A77D5",
          textTransform: "capitalize",
        }}
      >
        EMPLOYMENT DETAILS
      </Typography>

      {/* Error Display */}
      {hasError && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">
            {error?.message || "Failed to load areas and managers"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#2A77D5", cursor: "pointer", textDecoration: "underline" }}
            onClick={refetchAll}
          >
            Retry
          </Typography>
        </Box>
      )}

      {/* Section 1 - Duty Details */}
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "20px",
            color: "#707070",
            textTransform: "capitalize",
            mb: 1,
          }}
        >
          DUTY DETAILS
          <Box component="span" sx={{ color: "red", ml: "2px" }}>
            *
          </Box>
        </Typography>
        <Divider />

        <Box sx={{ mt: 2 }}>
          {/* Row 1 - Company ID, Date of Joining, Designation */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box sx={{ width: "352px" }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  color: hasFieldError("companyId") ? "error.main" : "#707070",
                }}
              >
                Company ID <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={user?.agencyId || ""}
                disabled
                placeholder="Agency ID will be auto-filled"
                {...register("employmentDetails.companyId", {
                  required: "Company ID is required",
                  pattern: {
                    value: /^[a-zA-Z0-9-_]+$/,
                    message: "Invalid Company ID format",
                  },
                })}
                error={hasFieldError("companyId")}
                helperText={getErrorMessage("companyId") || "This field is automatically filled with your Agency ID"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "4px",
                    backgroundColor: "#F5F5F5",
                  },
                  "& .MuiInputBase-input": {
                    padding: "8.5px 14px",
                    height: "20px",
                  },
                }}
              />
            </Box>
            <Box sx={{ width: "352px" }}>
              <LabeledInput
                label="Date Of Joining"
                name="employmentDetails.dateOfJoining"
                placeholder="DD/MM/YYYY"
                type="date"
                register={register}
                validation={{
                  required: "Date of Joining is required",
                  validate: {
                    notInFuture: (value: string) => {
                      if (!value) return true;
                      return new Date(value) <= new Date() || "Date of Joining cannot be in the future";
                    },
                  },
                }}
                error={hasFieldError("dateOfJoining")}
                helperText={getErrorMessage("dateOfJoining")}
              />
            </Box>
            <Box sx={{ width: "352px" }}>
              <LabeledInput
                label="Designation"
                name="employmentDetails.designation"
                placeholder="Enter Designation"
                register={register}
                validation={{
                  required: "Designation is required",
                  pattern: {
                    value: /^[a-zA-Z\s.]+$/,
                    message: "Invalid characters in Designation",
                  },
                }}
                error={hasFieldError("designation")}
                helperText={getErrorMessage("designation")}
              />
            </Box>
          </Box>

          {/* Row 2 - Assigned Duty Area and Area Manager */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ width: "352px" }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  color: hasFieldError("assignedDutyArea") ? "error.main" : "#707070",
                }}
              >
                Assigned Duty Area <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedAreaId || assignedDutyAreaId || ""}
                error={hasFieldError("assignedDutyArea")}
                helperText={getErrorMessage("assignedDutyArea")}
                onChange={handleAreaChange}
                disabled={isLoading}
                sx={{
                  "& .MuiInputLabel-root": {
                    fontFamily: "Mukta",
                    fontSize: "14px",
                  },
                  "& .MuiSelect-select": {
                    fontFamily: "Mukta",
                  },
                }}
              >
                {isLoading
                  ? [
                      <MenuItem key="loading" disabled>
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
                          Select Duty Area
                        </MenuItem>,
                        ...areas.map((area) => (
                          <MenuItem key={area.id} value={area.id}>
                            {area.name}
                          </MenuItem>
                        )),
                      ]}
              </TextField>
            </Box>
            <Box sx={{ width: "352px" }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  color: hasFieldError("areaManager") ? "error.main" : "#707070",
                }}
              >
                Area Manager <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={
                  areaManagerId ||
                  // Fallback: find manager ID from name for backward compatibility
                  managers.find((m) => m.fullName === areaManager)?.id ||
                  ""
                }
                error={hasFieldError("areaManager")}
                helperText={getErrorMessage("areaManager")}
                onChange={handleAreaManagerChange}
                disabled={isLoading}
                sx={{
                  "& .MuiInputLabel-root": {
                    fontFamily: "Mukta",
                    fontSize: "14px",
                  },
                  "& .MuiSelect-select": {
                    fontFamily: "Mukta",
                  },
                }}
              >
                {isLoading
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
              </TextField>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Section 2 - Referral Information (Optional) */}
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "20px",
            color: "#707070",
            textTransform: "capitalize",
            mb: 1,
          }}
        >
          REFERRAL INFORMATION (Optional)
        </Typography>
        <Divider />

        <Box sx={{ mt: 2 }}>
          {/* Row for Referred By, Contact Number, and Relationship - All Optional */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ width: "352px" }}>
              <LabeledInput
                label="Referred By"
                name="employmentDetails.referredBy"
                placeholder="Enter Referrer's Full Name (Optional)"
                register={register}
                validation={{
                  pattern: {
                    value: /^[a-zA-Z\s.]*$/,
                    message: "Invalid characters in Referrer's Name",
                  },
                }}
                error={hasFieldError("referredBy")}
                helperText={getErrorMessage("referredBy")}
              />
            </Box>
            <Box sx={{ width: "352px" }}>
              <LabeledInput
                label="Referral Contact Number"
                name="employmentDetails.referralContactNumber"
                placeholder="Enter 10-digit Contact Number (Optional)"
                register={register}
                validation={{
                  validate: {
                    exactTenDigits: (value: string) => {
                      if (!value) return true; // Optional field

                      if (!/^\d{10}$/.test(value)) {
                        return "Please enter exactly 10 digits";
                      }

                      // Check if first digit is valid (6-9)
                      if (!/^[6-9]/.test(value)) {
                        return "Mobile number must start with 6, 7, 8, or 9";
                      }

                      return true;
                    },
                  },
                }}
                error={hasFieldError("referralContactNumber")}
                helperText={
                  getErrorMessage("referralContactNumber") || "Optional. Enter 10 digits only (6-9 first digit)"
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handlePhoneChange("employmentDetails.referralContactNumber", e.target.value);
                }}
              />
            </Box>
            <Box sx={{ width: "352px" }}>
              <LabeledInput
                label="Relationship With Officer"
                name="employmentDetails.relationshipWithOfficer"
                placeholder="Enter Relationship (Optional)"
                register={register}
                validation={{
                  pattern: {
                    value: /^[a-zA-Z\s-]*$/,
                    message: "Invalid characters or format",
                  },
                }}
                error={hasFieldError("relationshipWithOfficer")}
                helperText={getErrorMessage("relationshipWithOfficer")}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Optional: Add a form-level error message area */}
      {errors?.employmentDetails?.root && (
        <Box
          sx={{
            backgroundColor: "#FFEBEE",
            color: "#D32F2F",
            p: 2,
            borderRadius: 1,
            mt: 2,
            fontFamily: "Mukta",
          }}
        >
          {errors.employmentDetails.root.message}
        </Box>
      )}

      {/* Hidden fields to store names (for validation) and IDs */}
      <input
        type="hidden"
        {...register("employmentDetails.assignedDutyArea", {
          required: "Assigned Duty Area is required",
        })}
      />
      <input type="hidden" {...register("employmentDetails.assignedDutyAreaId")} />
      <input
        type="hidden"
        {...register("employmentDetails.areaManager", {
          required: "Area Manager is required",
        })}
      />
      <input type="hidden" {...register("employmentDetails.areaManagerId")} />
    </Box>
  );
};

export default OfficerEmploymentDetailsForm;
