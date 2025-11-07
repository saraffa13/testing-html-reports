import { Autocomplete, Box, Checkbox, Divider, FormControlLabel, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { UseFormRegister, UseFormSetValue, UseFormTrigger, UseFormWatch } from "react-hook-form";
import LabeledInput from "../LabeledInput";

// Define error types
interface AddressFieldErrors {
  addressLine1?: { message?: string };
  addressLine2?: { message?: string };
  city?: { message?: string };
  district?: { message?: string };
  pincode?: { message?: string };
  state?: { message?: string };
  landmark?: { message?: string };
}

interface AddressErrors {
  localAddress?: AddressFieldErrors;
  permanentAddress?: AddressFieldErrors;
  sameAsPermanent?: { message?: string };
}

interface FormErrors {
  address?: AddressErrors;
}

interface OfficerAddressFormProps {
  register: UseFormRegister<any>;
  errors: FormErrors;
  setValue?: UseFormSetValue<any>;
  watch?: UseFormWatch<any>;
  trigger?: UseFormTrigger<any>;
}

// Indian States and Union Territories
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const OfficerAddressForm: React.FC<OfficerAddressFormProps> = ({ register, errors, setValue, watch, trigger }) => {
  const [sameAddress, setSameAddress] = useState(false);
  const [localState, setLocalState] = useState<string>("");
  const [permanentState, setPermanentState] = useState<string>("");

  // Watch checkbox value
  const watchSameAddress = watch ? watch("address.sameAsPermanent") : false;

  // Sync checkbox state
  useEffect(() => {
    setSameAddress(watchSameAddress);
  }, [watchSameAddress]);

  // Register state fields for validation
  useEffect(() => {
    if (register) {
      register("address.localAddress.state", {
        required: "State/UT selection is required",
        validate: {
          notEmpty: (value: string) => {
            if (!value || value.trim() === "") {
              return "Please select a State/Union Territory";
            }
            return true;
          },
          validState: (value: string) => {
            if (value && !INDIAN_STATES.includes(value)) {
              return "Please select a valid state from the dropdown list";
            }
            return true;
          },
        },
      });

      register("address.permanentAddress.state", {
        required: "State/UT selection is required",
        validate: {
          notEmpty: (value: string) => {
            if (!value || value.trim() === "") {
              return "Please select a State/Union Territory";
            }
            return true;
          },
          validState: (value: string) => {
            if (value && !INDIAN_STATES.includes(value)) {
              return "Please select a valid state from the dropdown list";
            }
            return true;
          },
        },
      });
    }
  }, [register]);

  // Initialize state values from form data
  useEffect(() => {
    if (watch) {
      const localStateValue = watch("address.localAddress.state") || "";
      const permanentStateValue = watch("address.permanentAddress.state") || "";

      setLocalState(localStateValue);
      setPermanentState(permanentStateValue);
    }
  }, [watch]);

  // Sync permanent address when local address changes (if same address is checked)
  useEffect(() => {
    if (sameAddress && setValue && watch) {
      const localAddressFields = ["addressLine1", "addressLine2", "city", "district", "pincode", "state", "landmark"];

      localAddressFields.forEach((field) => {
        const localValue = watch(`address.localAddress.${field}`) || "";
        setValue(`address.permanentAddress.${field}`, localValue);
      });

      // Update permanent state dropdown
      const currentLocalState = watch("address.localAddress.state") || "";
      setPermanentState(currentLocalState);

      // Trigger validation for permanent address state
      if (trigger) {
        trigger("address.permanentAddress.state");
      }
    }
  }, [
    watch ? watch("address.localAddress.addressLine1") : null,
    watch ? watch("address.localAddress.addressLine2") : null,
    watch ? watch("address.localAddress.city") : null,
    watch ? watch("address.localAddress.district") : null,
    watch ? watch("address.localAddress.pincode") : null,
    watch ? watch("address.localAddress.state") : null,
    watch ? watch("address.localAddress.landmark") : null,
    sameAddress,
    setValue,
    watch,
    trigger,
  ]);

  // Handle local state change
  const handleLocalStateChange = (_event: any, newValue: string | null) => {
    const stateValue = newValue || "";
    setLocalState(stateValue);

    if (setValue) {
      setValue("address.localAddress.state", stateValue, { shouldValidate: true });

      // Manually trigger validation
      if (trigger) {
        trigger("address.localAddress.state");
      }

      // If same address, also update permanent
      if (sameAddress) {
        setPermanentState(stateValue);
        setValue("address.permanentAddress.state", stateValue, { shouldValidate: true });
        if (trigger) {
          trigger("address.permanentAddress.state");
        }
      }
    }
  };

  // Handle permanent state change
  const handlePermanentStateChange = (_event: any, newValue: string | null) => {
    const stateValue = newValue || "";
    setPermanentState(stateValue);

    if (setValue) {
      setValue("address.permanentAddress.state", stateValue, { shouldValidate: true });

      // Manually trigger validation
      if (trigger) {
        trigger("address.permanentAddress.state");
      }
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
      {/* Address Heading */}
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
        ADDRESS DETAILS
      </Typography>

      {/* Section 1 - Local Address */}
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
          LOCAL ADDRESS
        </Typography>
        <Divider />

        <Box sx={{ mt: 2 }}>
          {/* Row 1 - Address Line 1 & 2 */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <LabeledInput
                label="Address Line 1"
                name="address.localAddress.addressLine1"
                placeholder="Enter Flat no./House No./ Floor/ Building/Apartment Name"
                required
                register={register}
                validation={{
                  required: "Address Line 1 is required",
                  minLength: {
                    value: 3,
                    message: "Address Line 1 must be at least 3 characters long",
                  },
                  validate: {
                    notEmpty: (value: string) => {
                      if (!value || value.trim() === "") {
                        return "Address Line 1 cannot be empty";
                      }
                      return true;
                    },
                  },
                }}
                error={!!errors?.address?.localAddress?.addressLine1}
                helperText={errors?.address?.localAddress?.addressLine1?.message}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <LabeledInput
                label="Address Line 2"
                name="address.localAddress.addressLine2"
                placeholder="Enter Street Name/ Road /Lane"
                required
                register={register}
                validation={{
                  required: "Address Line 2 is required",
                  minLength: {
                    value: 3,
                    message: "Address Line 2 must be at least 3 characters long",
                  },
                  validate: {
                    notEmpty: (value: string) => {
                      if (!value || value.trim() === "") {
                        return "Address Line 2 cannot be empty";
                      }
                      return true;
                    },
                  },
                }}
                error={!!errors?.address?.localAddress?.addressLine2}
                helperText={errors?.address?.localAddress?.addressLine2?.message}
              />
            </Box>
          </Box>

          {/* Row 2 - City, District, Pincode */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <LabeledInput
                label="Village/Town/City"
                name="address.localAddress.city"
                placeholder="Enter City/Town/Village Name"
                required
                register={register}
                validation={{
                  required: "City/Town/Village is required",
                  minLength: {
                    value: 2,
                    message: "City/Town/Village must be at least 2 characters long",
                  },
                  validate: {
                    notEmpty: (value: string) => {
                      if (!value || value.trim() === "") {
                        return "City/Town/Village cannot be empty";
                      }
                      return true;
                    },
                  },
                }}
                error={!!errors?.address?.localAddress?.city}
                helperText={errors?.address?.localAddress?.city?.message}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <LabeledInput
                label="District"
                name="address.localAddress.district"
                placeholder="Enter District Name"
                required
                register={register}
                validation={{
                  required: "District is required",
                  minLength: {
                    value: 2,
                    message: "District must be at least 2 characters long",
                  },
                  validate: {
                    notEmpty: (value: string) => {
                      if (!value || value.trim() === "") {
                        return "District cannot be empty";
                      }
                      return true;
                    },
                  },
                }}
                error={!!errors?.address?.localAddress?.district}
                helperText={errors?.address?.localAddress?.district?.message}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <LabeledInput
                label="Pincode"
                name="address.localAddress.pincode"
                placeholder="Enter Pincode"
                required
                register={register}
                validation={{
                  required: "Pincode is required",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "Pincode must be exactly 6 digits",
                  },
                  validate: {
                    notEmpty: (value: string) => {
                      if (!value || value.trim() === "") {
                        return "Pincode cannot be empty";
                      }
                      return true;
                    },
                  },
                }}
                error={!!errors?.address?.localAddress?.pincode}
                helperText={errors?.address?.localAddress?.pincode?.message}
              />
            </Box>
          </Box>

          {/* Row 3 - State (Dropdown), Landmark */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  color: errors?.address?.localAddress?.state ? "error.main" : "#707070",
                  fontFamily: "Mukta",
                }}
              >
                State / Union Territory <span style={{ color: "red" }}>*</span>
              </Typography>

              <Autocomplete
                value={localState}
                onChange={handleLocalStateChange}
                options={INDIAN_STATES}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select State/Union Territory"
                    size="small"
                    error={!!errors?.address?.localAddress?.state}
                    helperText={errors?.address?.localAddress?.state?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "4px",
                      },
                    }}
                  />
                )}
                sx={{ width: "100%" }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <LabeledInput
                label="Landmark"
                name="address.localAddress.landmark"
                placeholder="Enter Nearby Landmark"
                required
                register={register}
                validation={{
                  required: "Landmark is required",
                  minLength: {
                    value: 2,
                    message: "Landmark must be at least 2 characters long",
                  },
                  validate: {
                    notEmpty: (value: string) => {
                      if (!value || value.trim() === "") {
                        return "Landmark cannot be empty";
                      }
                      return true;
                    },
                  },
                }}
                error={!!errors?.address?.localAddress?.landmark}
                helperText={errors?.address?.localAddress?.landmark?.message}
              />
            </Box>
            <Box sx={{ flex: 1 }}></Box> {/* Empty space for alignment */}
          </Box>
        </Box>
      </Box>

      {/* Checkbox for same address */}
      <FormControlLabel
        control={
          <Checkbox
            checked={sameAddress}
            sx={{ color: "#2A77D5", "&.Mui-checked": { color: "#2A77D5" } }}
            {...register("address.sameAsPermanent")}
          />
        }
        label="Tick if permanent address is same as local address"
        sx={{
          margin: 0,
          ".MuiFormControlLabel-label": {
            fontFamily: "Mukta",
            fontSize: "12px",
            color: "#707070",
          },
        }}
      />

      {/* Section 2 - Permanent Address */}
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
          PERMANENT ADDRESS
        </Typography>
        <Divider />

        <Box sx={{ mt: 2 }}>
          {/* Row 1 - Address Line 1 & 2 */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ pointerEvents: sameAddress ? "none" : "auto", opacity: sameAddress ? 0.6 : 1 }}>
                <LabeledInput
                  label="Address Line 1"
                  name="address.permanentAddress.addressLine1"
                  placeholder="Enter Flat no./House No./ Floor/ Building/Apartment Name"
                  required
                  register={register}
                  validation={
                    !sameAddress
                      ? {
                          required: "Address Line 1 is required",
                          minLength: {
                            value: 3,
                            message: "Address Line 1 must be at least 3 characters long",
                          },
                          validate: {
                            notEmpty: (value: string) => {
                              if (!value || value.trim() === "") {
                                return "Address Line 1 cannot be empty";
                              }
                              return true;
                            },
                          },
                        }
                      : {}
                  }
                  error={!!errors?.address?.permanentAddress?.addressLine1}
                  helperText={errors?.address?.permanentAddress?.addressLine1?.message}
                />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ pointerEvents: sameAddress ? "none" : "auto", opacity: sameAddress ? 0.6 : 1 }}>
                <LabeledInput
                  label="Address Line 2"
                  name="address.permanentAddress.addressLine2"
                  placeholder="Enter Street Name/ Road /Lane"
                  required
                  register={register}
                  validation={
                    !sameAddress
                      ? {
                          required: "Address Line 2 is required",
                          minLength: {
                            value: 3,
                            message: "Address Line 2 must be at least 3 characters long",
                          },
                          validate: {
                            notEmpty: (value: string) => {
                              if (!value || value.trim() === "") {
                                return "Address Line 2 cannot be empty";
                              }
                              return true;
                            },
                          },
                        }
                      : {}
                  }
                  error={!!errors?.address?.permanentAddress?.addressLine2}
                  helperText={errors?.address?.permanentAddress?.addressLine2?.message}
                />
              </Box>
            </Box>
          </Box>

          {/* Row 2 - City, District, Pincode */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ pointerEvents: sameAddress ? "none" : "auto", opacity: sameAddress ? 0.6 : 1 }}>
                <LabeledInput
                  label="Village/Town/City"
                  name="address.permanentAddress.city"
                  placeholder="Enter City/Town/Village Name"
                  required
                  register={register}
                  validation={
                    !sameAddress
                      ? {
                          required: "City/Town/Village is required",
                          minLength: {
                            value: 2,
                            message: "City/Town/Village must be at least 2 characters long",
                          },
                          validate: {
                            notEmpty: (value: string) => {
                              if (!value || value.trim() === "") {
                                return "City/Town/Village cannot be empty";
                              }
                              return true;
                            },
                          },
                        }
                      : {}
                  }
                  error={!!errors?.address?.permanentAddress?.city}
                  helperText={errors?.address?.permanentAddress?.city?.message}
                />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ pointerEvents: sameAddress ? "none" : "auto", opacity: sameAddress ? 0.6 : 1 }}>
                <LabeledInput
                  label="District"
                  name="address.permanentAddress.district"
                  placeholder="Enter District Name"
                  required
                  register={register}
                  validation={
                    !sameAddress
                      ? {
                          required: "District is required",
                          minLength: {
                            value: 2,
                            message: "District must be at least 2 characters long",
                          },
                          validate: {
                            notEmpty: (value: string) => {
                              if (!value || value.trim() === "") {
                                return "District cannot be empty";
                              }
                              return true;
                            },
                          },
                        }
                      : {}
                  }
                  error={!!errors?.address?.permanentAddress?.district}
                  helperText={errors?.address?.permanentAddress?.district?.message}
                />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ pointerEvents: sameAddress ? "none" : "auto", opacity: sameAddress ? 0.6 : 1 }}>
                <LabeledInput
                  label="Pincode"
                  name="address.permanentAddress.pincode"
                  placeholder="Enter Pincode"
                  required
                  register={register}
                  validation={
                    !sameAddress
                      ? {
                          required: "Pincode is required",
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: "Pincode must be exactly 6 digits",
                          },
                          validate: {
                            notEmpty: (value: string) => {
                              if (!value || value.trim() === "") {
                                return "Pincode cannot be empty";
                              }
                              return true;
                            },
                          },
                        }
                      : {}
                  }
                  error={!!errors?.address?.permanentAddress?.pincode}
                  helperText={errors?.address?.permanentAddress?.pincode?.message}
                />
              </Box>
            </Box>
          </Box>

          {/* Row 3 - State (Dropdown), Landmark */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  color: errors?.address?.permanentAddress?.state ? "error.main" : "#707070",
                  fontFamily: "Mukta",
                }}
              >
                State / Union Territory <span style={{ color: "red" }}>*</span>
              </Typography>

              <Autocomplete
                value={permanentState}
                onChange={handlePermanentStateChange}
                options={INDIAN_STATES}
                disabled={sameAddress}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select State/Union Territory"
                    size="small"
                    disabled={sameAddress}
                    error={!!errors?.address?.permanentAddress?.state}
                    helperText={errors?.address?.permanentAddress?.state?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "4px",
                      },
                    }}
                  />
                )}
                sx={{ width: "100%" }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ pointerEvents: sameAddress ? "none" : "auto", opacity: sameAddress ? 0.6 : 1 }}>
                <LabeledInput
                  label="Landmark"
                  name="address.permanentAddress.landmark"
                  placeholder="Enter Nearby Landmark"
                  required
                  register={register}
                  validation={
                    !sameAddress
                      ? {
                          required: "Landmark is required",
                          minLength: {
                            value: 2,
                            message: "Landmark must be at least 2 characters long",
                          },
                          validate: {
                            notEmpty: (value: string) => {
                              if (!value || value.trim() === "") {
                                return "Landmark cannot be empty";
                              }
                              return true;
                            },
                          },
                        }
                      : undefined
                  }
                  error={!!errors?.address?.permanentAddress?.landmark}
                  helperText={errors?.address?.permanentAddress?.landmark?.message}
                />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}></Box> {/* Empty space for alignment */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerAddressForm;
