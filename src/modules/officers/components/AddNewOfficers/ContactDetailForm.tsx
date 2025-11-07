import {
  Box,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { usePhoneValidation } from "../../hooks/usePhoneValidation";
import LabeledInput from "../LabeledInput";

// Define nested error types for better TypeScript support
interface ContactDetailsErrors {
  mobileNumber?: { message?: string };
  alternateNumber?: { message?: string };
  emergencyContact?: {
    firstName?: { message?: string };
    middleName?: { message?: string };
    lastName?: { message?: string };
    relationship?: { message?: string };
    contactNumber?: { message?: string };
  };
}

interface FormErrors {
  contactDetails?: ContactDetailsErrors;
}

interface OfficerContactDetailsFormProps {
  register: UseFormRegister<any>;
  errors: FormErrors;
  watch?: UseFormWatch<any>;
  setValue?: UseFormSetValue<any>;
}

const OfficerContactDetailsForm: React.FC<OfficerContactDetailsFormProps> = ({ register, errors, watch, setValue }) => {
  // Phone validation hook
  const { isChecking, exists, message, existingGuard, hasError, validatePhone, clearValidation } = usePhoneValidation();

  // Use useRef for timer to avoid stale closures
  const phoneDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [lastValidatedNumber, setLastValidatedNumber] = useState<string>("");

  // Get current values
  const relationshipValue = watch ? (watch("contactDetails.emergencyContact.relationship") ?? "") : "";
  const currentMobileNumber = watch ? (watch("contactDetails.mobileNumber") ?? "") : "";

  // Memoized validation function
  const triggerValidation = useCallback(
    (phoneNumber: string) => {
      console.log("📞 Triggering API validation for:", phoneNumber);
      validatePhone(phoneNumber);
      setLastValidatedNumber(phoneNumber);
    },
    [validatePhone]
  );

  // Phone validation effect with proper cleanup
  useEffect(() => {
    // Clear existing timer first
    if (phoneDebounceTimer.current) {
      clearTimeout(phoneDebounceTimer.current);
      phoneDebounceTimer.current = null;
    }

    // Early returns for invalid states
    if (!currentMobileNumber || !watch || !setValue) {
      clearValidation();
      setLastValidatedNumber("");
      return;
    }

    const cleaned = currentMobileNumber.replace(/\D/g, "");

    // Auto-format the input
    if (cleaned !== currentMobileNumber && cleaned.length <= 10) {
      setValue("contactDetails.mobileNumber", cleaned);
      return;
    }

    // Clear validation if insufficient digits
    if (cleaned.length < 10) {
      clearValidation();
      setLastValidatedNumber("");
      return;
    }

    // Only validate if exactly 10 digits, valid format, and different from last validated
    if (cleaned.length === 10 && cleaned !== lastValidatedNumber && /^[6-9]\d{9}$/.test(cleaned)) {
      console.log("🚀 Setting up validation for:", cleaned);

      // Set up new debounced validation
      phoneDebounceTimer.current = setTimeout(() => {
        triggerValidation(cleaned);
      }, 500);
    }

    // Cleanup function
    return () => {
      if (phoneDebounceTimer.current) {
        clearTimeout(phoneDebounceTimer.current);
        phoneDebounceTimer.current = null;
      }
    };
  }, [currentMobileNumber, watch, setValue, clearValidation, lastValidatedNumber, triggerValidation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (phoneDebounceTimer.current) {
        clearTimeout(phoneDebounceTimer.current);
        phoneDebounceTimer.current = null;
      }
    };
  }, []);

  // Handle relationship change
  const handleRelationshipChange = (value: string) => {
    if (setValue) {
      setValue("contactDetails.emergencyContact.relationship", value);
    }
  };

  // Enhanced phone number validation for 10 digits
  const phoneValidation = {
    required: "Mobile number is required",
    validate: {
      exactTenDigits: (value: string) => {
        if (!value) return "Mobile number is required";

        const cleaned = value.replace(/\D/g, "");
        if (!/^\d{10}$/.test(cleaned)) {
          return "Please enter exactly 10 digits";
        }

        if (!/^[6-9]/.test(cleaned)) {
          return "Mobile number must start with 6, 7, 8, or 9";
        }

        // Show error if phone exists and validation is complete
        if (exists && !isChecking && cleaned === lastValidatedNumber) {
          return `This number is already registered${existingGuard ? ` to ${existingGuard.firstName} ${existingGuard.lastName}` : ""}`;
        }

        return true;
      },
    },
  };

  // Alternate number validation (optional but if provided, must be 10 digits)
  const alternatePhoneValidation = {
    validate: {
      exactTenDigits: (value: string) => {
        if (!value) return true;
        const cleaned = value.replace(/\D/g, "");
        if (!/^\d{10}$/.test(cleaned)) {
          return "Please enter exactly 10 digits";
        }
        if (!/^[6-9]/.test(cleaned)) {
          return "Mobile number must start with 6, 7, 8, or 9";
        }
        return true;
      },
      differentFromPrimary: (value: string, formValues: any) => {
        if (!value) return true;
        const cleaned = value.replace(/\D/g, "");
        const primaryCleaned = formValues.contactDetails?.mobileNumber?.replace(/\D/g, "") || "";
        if (cleaned === primaryCleaned) {
          return "Alternate number cannot be the same as the primary number";
        }
        return true;
      },
    },
  };

  // Emergency contact validation (required and must be 10 digits)
  const emergencyContactValidation = {
    required: "Emergency contact number is required",
    validate: {
      exactTenDigits: (value: string) => {
        if (!value) return "Emergency contact number is required";
        const cleaned = value.replace(/\D/g, "");
        if (!/^\d{10}$/.test(cleaned)) {
          return "Please enter exactly 10 digits";
        }
        if (!/^[6-9]/.test(cleaned)) {
          return "Mobile number must start with 6, 7, 8, or 9";
        }
        return true;
      },
      differentFromPrimary: (value: string, formValues: any) => {
        if (!value) return "Emergency contact number is required";
        const cleaned = value.replace(/\D/g, "");
        const primaryCleaned = formValues.contactDetails?.mobileNumber?.replace(/\D/g, "") || "";
        if (cleaned === primaryCleaned) {
          return "Emergency contact number cannot be the same as the primary number";
        }
        return true;
      },
    },
  };

  // Get validation status display
  const getValidationDisplay = () => {
    const cleaned = currentMobileNumber.replace(/\D/g, "");

    if (cleaned.length !== 10) {
      return null;
    }

    if (isChecking) {
      return {
        color: "#1976d2",
        message: "Checking availability...",
        icon: <CircularProgress size={12} sx={{ mr: 0.5 }} />,
      };
    }

    if (hasError) {
      return {
        color: "#d32f2f",
        message: message,
        icon: "⚠️",
      };
    }

    if (message && cleaned === lastValidatedNumber) {
      if (exists) {
        return {
          color: "#d32f2f",
          message: message,
          icon: "❌",
          existingGuard: existingGuard,
        };
      } else {
        return {
          color: "#2e7d32",
          message: message,
          icon: "✅",
        };
      }
    }

    return null;
  };

  const validationDisplay = getValidationDisplay();

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
        gap: "16px",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "-ms-overflow-style": "none",
        "scrollbar-width": "none",
      }}
    >
      {/* Contact Details Heading */}
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
        CONTACT DETAILS
      </Typography>

      {/* Section 1 - Contact Number */}
      <Box sx={{ mt: 1 }}>
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
          CONTACT NUMBER
        </Typography>
        <Divider />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Box sx={{ flex: 1 }}>
            {/* Mobile Number Field with Validation */}
            <Box>
              <LabeledInput
                label="Mobile Number"
                name="contactDetails.mobileNumber"
                placeholder="Enter 10-digit Mobile Number"
                required
                register={register}
                validation={phoneValidation}
                error={
                  !!(
                    errors?.contactDetails?.mobileNumber ||
                    (exists && !isChecking && currentMobileNumber.replace(/\D/g, "") === lastValidatedNumber)
                  )
                }
                helperText={errors?.contactDetails?.mobileNumber?.message || "Enter 10 digits only (6-9 first digit)"}
              />

              {/* Phone Validation Display */}
              {validationDisplay && (
                <Box
                  sx={{
                    mt: 0.5,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 0.5,
                    minHeight: "20px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {typeof validationDisplay.icon === "string" ? (
                      <span style={{ fontSize: "12px" }}>{validationDisplay.icon}</span>
                    ) : (
                      validationDisplay.icon
                    )}
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: validationDisplay.color,
                        fontFamily: "Mukta",
                        fontWeight: exists ? 500 : 400,
                      }}
                    >
                      {validationDisplay.message}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <LabeledInput
              label="Alternate Phone Number"
              name="contactDetails.alternateNumber"
              placeholder="Enter 10-digit Alternate Number"
              register={register}
              validation={alternatePhoneValidation}
              error={!!errors?.contactDetails?.alternateNumber}
              helperText={errors?.contactDetails?.alternateNumber?.message || "Optional. Enter 10 digits only"}
            />
          </Box>
        </Box>
      </Box>

      {/* Section 2 - Emergency Contact Person Details */}
      <Box sx={{ mt: 2 }}>
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
          EMERGENCY CONTACT PERSON DETAILS
        </Typography>
        <Divider />

        {/* Name Fields */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LabeledInput
              label="First Name"
              name="contactDetails.emergencyContact.firstName"
              placeholder="Enter First Name"
              required
              register={register}
              validation={{
                required: "First name is required",
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "First name should contain only letters and spaces",
                },
              }}
              error={!!errors?.contactDetails?.emergencyContact?.firstName}
              helperText={errors?.contactDetails?.emergencyContact?.firstName?.message}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <LabeledInput
              label="Middle Name"
              name="contactDetails.emergencyContact.middleName"
              placeholder="Enter Middle Name (if applicable)"
              register={register}
              validation={{
                pattern: {
                  value: /^[a-zA-Z\s]*$/,
                  message: "Middle name should contain only letters and spaces",
                },
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <LabeledInput
              label="Last Name"
              name="contactDetails.emergencyContact.lastName"
              placeholder="Enter Last Name"
              required
              register={register}
              validation={{
                required: "Last name is required",
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Last name should contain only letters and spaces",
                },
              }}
              error={!!errors?.contactDetails?.emergencyContact?.lastName}
              helperText={errors?.contactDetails?.emergencyContact?.lastName?.message}
            />
          </Box>
        </Box>

        {/* Relationship and Contact Number */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {/* Relationship Dropdown */}
          <Box sx={{ flex: 0.75 }}>
            <FormControl fullWidth size="small" error={!!errors?.contactDetails?.emergencyContact?.relationship}>
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  color: errors?.contactDetails?.emergencyContact?.relationship ? "error.main" : "#707070",
                }}
              >
                Relationship <span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                value={relationshipValue}
                displayEmpty
                sx={{ borderRadius: "4px" }}
                onChange={(e) => {
                  const value = e.target.value as string;
                  handleRelationshipChange(value);
                }}
                inputProps={{
                  ...register("contactDetails.emergencyContact.relationship", {
                    required: "Please select a relationship",
                  }),
                }}
              >
                <MenuItem value="" disabled>
                  Select Relationship
                </MenuItem>
                <MenuItem value="Father">Father</MenuItem>
                <MenuItem value="Mother">Mother</MenuItem>
                <MenuItem value="Brother">Brother</MenuItem>
                <MenuItem value="Sister">Sister</MenuItem>
                <MenuItem value="Brother-in-Law">Brother-in-Law</MenuItem>
                <MenuItem value="Sister-in-Law">Sister-in-Law</MenuItem>
                <MenuItem value="Son">Son</MenuItem>
                <MenuItem value="Daughter">Daughter</MenuItem>
                <MenuItem value="Spouse">Spouse</MenuItem>
                <MenuItem value="Relative">Relative</MenuItem>
                <MenuItem value="Neighbour">Neighbour</MenuItem>
                <MenuItem value="Friend">Friend</MenuItem>
                <MenuItem value="Colleague">Colleague</MenuItem>
              </Select>
              {errors?.contactDetails?.emergencyContact?.relationship && (
                <FormHelperText>{errors?.contactDetails?.emergencyContact?.relationship?.message}</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Emergency Contact Number */}
          <Box sx={{ flex: 1 }}>
            <LabeledInput
              label="Contact Number"
              name="contactDetails.emergencyContact.contactNumber"
              placeholder="Enter 10-digit Emergency Contact"
              required
              register={register}
              validation={emergencyContactValidation}
              error={!!errors?.contactDetails?.emergencyContact?.contactNumber}
              helperText={
                errors?.contactDetails?.emergencyContact?.contactNumber?.message ||
                "Enter 10 digits only (6-9 first digit)"
              }
            />
          </Box>

          {/* Empty box to maintain grid alignment */}
          <Box sx={{ flex: 1 }}></Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerContactDetailsForm;
