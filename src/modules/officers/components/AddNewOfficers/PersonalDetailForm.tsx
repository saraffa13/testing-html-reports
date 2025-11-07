import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Box, Divider, FormControl, FormHelperText, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import type { UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import LabeledInput from "../LabeledInput";

// Define nested error types to match our form structure
interface PersonalDetailsErrors {
  firstName?: { message?: string };
  middleName?: { message?: string };
  lastName?: { message?: string };
  email?: { message?: string };
  dateOfBirth?: { message?: string };
  age?: { message?: string };
  isDobSelected?: { message?: string };
  sex?: { message?: string };
  bloodGroup?: { message?: string };
  nationality?: { message?: string };
  height?: { message?: string };
  weight?: { message?: string };
  identificationMark?: { message?: string };
  fatherName?: { message?: string };
  motherName?: { message?: string };
  maritalStatus?: { message?: string };
  spouseName?: { message?: string };
  spouseDob?: { message?: string };
  spouseAge?: { message?: string };
  isSpouseDobSelected?: { message?: string };
}

interface FormErrors {
  personalDetails?: PersonalDetailsErrors;
}

interface OfficerPersonalDetailsFormProps {
  register: UseFormRegister<any>;
  errors: FormErrors;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
}

// Blood group options
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const OfficerPersonalDetailsForm: React.FC<OfficerPersonalDetailsFormProps> = ({
  register,
  errors,
  watch,
  setValue,
  getValues,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore image preview from form data when component mounts
  useEffect(() => {
    const existingPhoto = getValues("personalDetails.profilePhoto");
    if (existingPhoto && existingPhoto instanceof File) {
      setSelectedFile(existingPhoto);
    }
  }, [getValues]);

  const maritalStatus = watch("personalDetails.maritalStatus") || "";
  const sex = watch("personalDetails.sex") || "";
  const bloodGroup = watch("personalDetails.bloodGroup") || "";
  const heightUnit = watch("personalDetails.heightUnit") || "cm";

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files ? files[0] : null;

    console.log("📁 File selected:", {
      file: file,
      name: file?.name,
      size: file?.size,
      type: file?.type,
      lastModified: file?.lastModified,
    });

    if (file && file.size <= 2 * 1024 * 1024) {
      // 2MB limit
      // 🔥 CRITICAL FIX: Ensure the file has a proper name
      let processedFile = file;

      // Check if the file name is missing or undefined
      if (!file.name || file.name === "undefined" || file.name.trim() === "" || file.name === "blob") {
        console.log("⚠️ File has invalid name, generating a proper one...");

        const timestamp = Date.now();
        let extension = "jpg"; // default

        // Determine extension from MIME type
        if (file.type) {
          const mimeTypes: { [key: string]: string } = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp",
            "image/bmp": "bmp",
            "image/tiff": "tiff",
          };
          extension = mimeTypes[file.type] || "jpg";
        }

        const newFileName = `profile_photo_${timestamp}.${extension}`;

        // Create a new File object with the proper name
        processedFile = new File([file], newFileName, {
          type: file.type,
          lastModified: file.lastModified || Date.now(),
        });

        console.log("✅ File renamed:", {
          originalName: file.name,
          newName: newFileName,
          size: processedFile.size,
          type: processedFile.type,
        });
      } else {
        console.log("✅ File has valid name:", file.name);
      }

      setSelectedFile(processedFile);
      setValue("personalDetails.profilePhoto", processedFile);

      console.log("💾 File saved to form state:", {
        name: processedFile.name,
        size: processedFile.size,
        type: processedFile.type,
        constructor: processedFile.constructor.name,
      });
    } else if (file) {
      alert("File size exceeds 2MB limit");
    }
  };

  // Fixed date input styling - Enhanced for direct typing
  const dateInputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "4px",
    },
    "& .MuiOutlinedInput-input": {
      padding: "8.5px 14px",
      height: "20px",
      cursor: "text", // Ensure text cursor for typing
    },
    "& input[type='date']": {
      cursor: "text",
      appearance: "textfield", // Better cross-browser support
    },
    "& input[type='date']::-webkit-calendar-picker-indicator": {
      cursor: "pointer",
    },
    width: "100%",
  };

  return (
    <Box
      sx={{
        width: "1136px",
        height: "632px",
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
        padding: "24px ",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "-ms-overflow-style": "none",
        "scrollbar-width": "none",
      }}
    >
      {/* Personal Details Heading */}
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
        PERSONAL DETAILS
      </Typography>

      {/* Section 1 - Basic Details */}
      <Box sx={{ mt: 1 }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "16px",
            color: "#707070",
            mb: 1,
          }}
        >
          BASIC DETAILS
        </Typography>
        <Divider />

        <Box
          sx={{
            display: "flex",
            mt: 2,
            gap: 2,
          }}
        >
          {/* Profile Photo Upload */}
          <Box sx={{ width: "150px" }}>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                color: "#707070",
                fontSize: "12px",
              }}
            >
              Profile Photo <span style={{ color: "red" }}>*</span>
            </Typography>
            <Box
              onClick={handlePhotoClick}
              sx={{
                width: "150px",
                height: "200px",
                border: "2px dashed #D1D1D1",
                borderRadius: "4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background-color 0.3s",
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                },
              }}
            >
              {!selectedFile ? (
                <>
                  <FileUploadIcon sx={{ color: "#2A77D5", fontSize: "32px", mb: 1 }} />
                  <Typography sx={{ fontSize: "14px", color: "#3B3B3B" }}>Add Photo</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#707070", mt: 0.5 }}>Max size: 2MB</Typography>
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "100%",
                    p: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: "130px",
                      height: "140px",
                      overflow: "hidden",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Profile Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  </Box>
                  <Box sx={{ textAlign: "center", mt: 1 }}>
                    <Typography sx={{ fontSize: "12px", color: "#3B3B3B", fontWeight: "500" }}>
                      {selectedFile.name.length > 15 ? selectedFile.name.substring(0, 15) + "..." : selectedFile.name}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", color: "#707070" }}>
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </Typography>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setValue("personalDetails.profilePhoto", null);
                      }}
                      sx={{
                        mt: 0.5,
                        color: "#E05952",
                        fontSize: "10px",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Remove
                    </Box>
                  </Box>
                </Box>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </Box>
          </Box>

          {/* Name and Email Inputs */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <LabeledInput
                  label="First Name"
                  name="personalDetails.firstName"
                  placeholder="Enter First Name"
                  required
                  register={register}
                  validation={{
                    required: "First Name is required",
                  }}
                  error={!!errors?.personalDetails?.firstName}
                  helperText={errors?.personalDetails?.firstName?.message}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <LabeledInput
                  label="Middle Name"
                  name="personalDetails.middleName"
                  placeholder="Enter Middle Name (if applicable)"
                  register={register}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <LabeledInput
                  label="Last Name"
                  name="personalDetails.lastName"
                  placeholder="Enter Last Name"
                  required
                  register={register}
                  validation={{
                    required: "Last Name is required",
                  }}
                  error={!!errors?.personalDetails?.lastName}
                  helperText={errors?.personalDetails?.lastName?.message}
                />
              </Box>
            </Box>

            {/* Email Field */}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Box sx={{ flex: 1 }}>
                <LabeledInput
                  label="Email Address"
                  name="personalDetails.email"
                  placeholder="Enter Email Address"
                  type="email"
                  required
                  register={register}
                  validation={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }}
                  error={!!errors?.personalDetails?.email}
                  helperText={errors?.personalDetails?.email?.message}
                />
              </Box>
              <Box sx={{ flex: 1 }}></Box> {/* Empty space for alignment */}
              <Box sx={{ flex: 1 }}></Box> {/* Empty space for alignment */}
            </Box>

            {/* Date of Birth - Removed age option */}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Box sx={{ width: "200px" }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, color: errors?.personalDetails?.dateOfBirth ? "error.main" : "#707070" }}
                >
                  Date of Birth <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  sx={dateInputStyle}
                  error={!!errors?.personalDetails?.dateOfBirth}
                  helperText={errors?.personalDetails?.dateOfBirth?.message}
                  inputProps={{
                    placeholder: "DD/MM/YYYY",
                    max: new Date().toISOString().split("T")[0], // Prevent future dates
                  }}
                  {...register("personalDetails.dateOfBirth", {
                    required: "Date of Birth is required",
                    validate: {
                      notInFuture: (value: string) => {
                        if (!value) return "Date of Birth is required";
                        const birthDate = new Date(value);
                        const today = new Date();
                        const age = today.getFullYear() - birthDate.getFullYear();
                        return age >= 18 || "Must be at least 18 years old";
                      },
                    },
                  })}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              {/* Sex, Blood Group, Nationality */}
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size="small" error={!!errors?.personalDetails?.sex}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                      color: errors?.personalDetails?.sex ? "error.main" : "#707070",
                    }}
                  >
                    Sex <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Select
                    value={sex}
                    {...register("personalDetails.sex", {
                      required: "Sex is required",
                    })}
                    displayEmpty
                    sx={{ borderRadius: "4px" }}
                    onChange={(e) => setValue("personalDetails.sex", e.target.value)}
                  >
                    <MenuItem value="" disabled>
                      Select Sex
                    </MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {errors?.personalDetails?.sex && (
                    <FormHelperText>{errors?.personalDetails?.sex?.message}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size="small" error={!!errors?.personalDetails?.bloodGroup}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                      color: errors?.personalDetails?.bloodGroup ? "error.main" : "#707070",
                    }}
                  >
                    Blood Group <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Select
                    value={bloodGroup}
                    {...register("personalDetails.bloodGroup", {
                      required: "Blood Group is required",
                    })}
                    displayEmpty
                    sx={{ borderRadius: "4px" }}
                    onChange={(e) => setValue("personalDetails.bloodGroup", e.target.value)}
                  >
                    <MenuItem value="" disabled>
                      Select Blood Group
                    </MenuItem>
                    {BLOOD_GROUPS.map((group) => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors?.personalDetails?.bloodGroup && (
                    <FormHelperText>{errors?.personalDetails?.bloodGroup?.message}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <LabeledInput
                  label="Nationality"
                  name="personalDetails.nationality"
                  placeholder="Enter Nationality"
                  required
                  register={register}
                  validation={{
                    required: "Nationality is required",
                  }}
                  error={!!errors?.personalDetails?.nationality}
                  helperText={errors?.personalDetails?.nationality?.message}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Section 2 - Physical Attributes */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "16px",
            color: "#3B3B3B",
            mb: 1,
          }}
        >
          PHYSICAL ATTRIBUTES
        </Typography>
        <Divider />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {/* Height with unit selector */}
          <Box sx={{ flex: 1, display: "flex", gap: 1 }}>
            <Box sx={{ flex: 2 }}>
              <LabeledInput
                label="Height"
                name="personalDetails.height"
                placeholder="Enter Height"
                required
                register={register}
                validation={{
                  required: "Height is required",
                  pattern: {
                    value: /^[0-9]+(\.[0-9]+)?$/,
                    message: "Please enter a valid number",
                  },
                  validate: {
                    maxThreeDigits: (value: string) => {
                      const numValue = parseFloat(value);
                      return numValue <= 999 || "Height cannot exceed 3 digits";
                    },
                  },
                }}
                error={!!errors?.personalDetails?.height}
                helperText={errors?.personalDetails?.height?.message}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth size="small">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.5,
                    color: "#707070",
                  }}
                >
                  Unit <span style={{ color: "red" }}>*</span>
                </Typography>
                <Select
                  value={heightUnit}
                  {...register("personalDetails.heightUnit", {
                    required: "Height unit is required",
                  })}
                  sx={{ borderRadius: "4px" }}
                  onChange={(e) => setValue("personalDetails.heightUnit", e.target.value)}
                >
                  <MenuItem value="cm">cm</MenuItem>
                  <MenuItem value="ft">ft</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <LabeledInput
              label="Weight"
              name="personalDetails.weight"
              placeholder="Enter Weight (in kg)"
              required
              register={register}
              validation={{
                required: "Weight is required",
                pattern: {
                  value: /^[0-9]+(\.[0-9]+)?$/,
                  message: "Please enter a valid number",
                },
                validate: {
                  maxThreeDigits: (value: string) => {
                    const numValue = parseFloat(value);
                    return numValue <= 999 || "Weight cannot exceed 3 digits";
                  },
                },
              }}
              error={!!errors?.personalDetails?.weight}
              helperText={errors?.personalDetails?.weight?.message}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <LabeledInput
              label="Identification Mark"
              name="personalDetails.identificationMark"
              placeholder="Describe Any Distinctive Mark"
              required
              register={register}
              validation={{
                required: "Identification Mark is required",
              }}
              error={!!errors?.personalDetails?.identificationMark}
              helperText={errors?.personalDetails?.identificationMark?.message}
            />
          </Box>
        </Box>
      </Box>

      {/* Section 3 - Family Details */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "16px",
            color: "#3B3B3B",
            mb: 1,
          }}
        >
          FAMILY DETAILS
        </Typography>
        <Divider />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LabeledInput
              label="Father's Name"
              name="personalDetails.fatherName"
              placeholder="Enter Father's Full Name"
              required
              register={register}
              validation={{
                required: "Father's Name is required",
              }}
              error={!!errors?.personalDetails?.fatherName}
              helperText={errors?.personalDetails?.fatherName?.message}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <LabeledInput
              label="Mother's Name"
              name="personalDetails.motherName"
              placeholder="Enter Mother's Full Name"
              required
              register={register}
              validation={{
                required: "Mother's Name is required",
              }}
              error={!!errors?.personalDetails?.motherName}
              helperText={errors?.personalDetails?.motherName?.message}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {/* Marital Status */}
          <Box sx={{ width: "25%" }}>
            <FormControl fullWidth size="small" error={!!errors?.personalDetails?.maritalStatus}>
              <Typography
                variant="body2"
                sx={{
                  mb: 0.5,
                  color: errors?.personalDetails?.maritalStatus ? "error.main" : "#707070",
                }}
              >
                Marital Status <span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                value={maritalStatus}
                {...register("personalDetails.maritalStatus", {
                  required: "Marital Status is required",
                })}
                displayEmpty
                sx={{ borderRadius: "4px" }}
                onChange={(e) => setValue("personalDetails.maritalStatus", e.target.value)}
              >
                <MenuItem value="" disabled>
                  Select Marital Status
                </MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Divorced">Divorced</MenuItem>
                <MenuItem value="Widow/Widower">Widow/Widower</MenuItem>
                <MenuItem value="Legally Separated">Legally Separated</MenuItem>
              </Select>
              {errors?.personalDetails?.maritalStatus && (
                <FormHelperText>{errors?.personalDetails?.maritalStatus?.message}</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Conditional Spouse Details */}
          {maritalStatus === "Married" && (
            <>
              <Box sx={{ flex: 1 }}>
                <LabeledInput
                  label="Spouse's Name"
                  name="personalDetails.spouseName"
                  placeholder="Enter Spouse's Full Name"
                  required
                  register={register}
                  validation={{
                    required: "Spouse's Name is required",
                  }}
                  error={!!errors?.personalDetails?.spouseName}
                  helperText={errors?.personalDetails?.spouseName?.message}
                />
              </Box>
              <Box sx={{ width: "15%" }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, color: errors?.personalDetails?.spouseDob ? "error.main" : "#707070" }}
                >
                  Spouse's Date of Birth <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  sx={dateInputStyle}
                  error={!!errors?.personalDetails?.spouseDob}
                  helperText={errors?.personalDetails?.spouseDob?.message}
                  inputProps={{
                    placeholder: "DD/MM/YYYY",
                    max: new Date().toISOString().split("T")[0], // Prevent future dates
                  }}
                  {...register("personalDetails.spouseDob", {
                    required: "Spouse's Date of Birth is required",
                  })}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerPersonalDetailsForm;
