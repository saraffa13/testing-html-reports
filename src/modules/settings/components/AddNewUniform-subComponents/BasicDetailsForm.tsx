import { Box, Typography } from "@mui/material";
import React from "react";
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

// Define nested error types for better TypeScript support
interface BasicDetailsErrors {
  uniformName?: { message?: string };
  uniformTop?: { message?: string };
  uniformBottom?: { message?: string };
  accessories?: { message?: string };
}

interface FormErrors {
  basicDetails?: BasicDetailsErrors;
}

interface BasicDetailsFormProps {
  register: UseFormRegister<any>;
  errors: FormErrors;
  setValue?: UseFormSetValue<any>;
  watch?: UseFormWatch<any>;
}

const BasicDetailsForm: React.FC<BasicDetailsFormProps> = ({ register, errors }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "40px", // Add some top spacing
      }}
    >
      <Box
        sx={{
          width: "760px",
          height: "240px",
          gap: "16px",
          padding: "16px",
          borderRadius: "8px",
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* BASIC DETAILS Heading */}
        <Typography
          sx={{
            width: "1104px",
            height: "24px",
            paddingTop: "5px",
            paddingBottom: "4px",
            gap: "10px",
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "32px",
            textTransform: "capitalize",
            color: "#2A77D5",
          }}
        >
          BASIC DETAILS
        </Typography>

        {/* Content */}
        <Box
          sx={{
            width: "728px",
            height: "160px",
            gap: "8px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Form */}
          <Box
            sx={{
              width: "728px",
              height: "160px",
              gap: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Uniform Name Input */}
            <Box
              sx={{
                width: "352px",
                height: "56px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "#707070",
                }}
              >
                Uniform Name
              </Typography>
              <Box
                component="input"
                {...register("basicDetails.uniformName", {
                  required: "Uniform name is required",
                  minLength: {
                    value: 2,
                    message: "Uniform name must be at least 2 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9\s-_]+$/,
                    message: "Invalid characters in uniform name",
                  },
                })}
                placeholder="Enter Uniform Name"
                sx={{
                  width: "352px",
                  height: "40px",
                  padding: "8px 12px",
                  border: errors?.basicDetails?.uniformName ? "1px solid #FF0000" : "1px solid #D1D1D1",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: "Mukta",
                  outline: "none",
                  "&:focus": {
                    borderColor: "#2A77D5",
                  },
                  "&::placeholder": {
                    color: "#A3A3A3",
                    fontFamily: "Mukta",
                    fontSize: "14px",
                  },
                }}
              />
              {errors?.basicDetails?.uniformName && (
                <Typography sx={{ color: "#FF0000", fontSize: "12px", fontFamily: "Mukta" }}>
                  {errors.basicDetails.uniformName.message}
                </Typography>
              )}
            </Box>

            {/* Select Parts of Uniform */}
            <Box
              sx={{
                width: "352px",
                height: "88px",
                gap: "8px",
                display: "flex",
                flexDirection: "column",
                marginTop: "10px",
              }}
            >
              {/* Label */}
              <Box
                sx={{
                  width: "238px",
                  height: "16px",
                  paddingRight: "8px",
                  paddingLeft: "8px",
                  borderRadius: "2px",
                }}
              >
                <Typography
                  sx={{
                    width: "222px",
                    height: "16px",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    gap: "10px",
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "16px",
                    color: "#707070",
                  }}
                >
                  Select Parts Of Uniform You Want To Upload
                </Typography>
              </Box>

              {/* Checkboxes Container */}
              <Box
                sx={{
                  width: "352px",
                  height: "64px",
                  paddingRight: "24px",
                  paddingLeft: "24px",
                  gap: "8px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Uniform Top Checkbox */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Box
                    component="input"
                    type="checkbox"
                    {...register("basicDetails.uniformTop")}
                    sx={{
                      width: "16px",
                      height: "16px",
                      accentColor: "#2A77D5",
                    }}
                  />
                  <Typography
                    sx={{
                      width: "280px",
                      height: "16px",
                      paddingTop: "3px",
                      paddingBottom: "4px",
                      gap: "10px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "16px",
                      color: "#3B3B3B",
                    }}
                  >
                    Uniform Top
                  </Typography>
                </Box>

                {/* Uniform Bottom Checkbox */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Box
                    component="input"
                    type="checkbox"
                    {...register("basicDetails.uniformBottom")}
                    sx={{
                      width: "16px",
                      height: "16px",
                      accentColor: "#2A77D5",
                    }}
                  />
                  <Typography
                    sx={{
                      width: "280px",
                      height: "16px",
                      paddingTop: "3px",
                      paddingBottom: "4px",
                      gap: "10px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "16px",
                      color: "#3B3B3B",
                    }}
                  >
                    Uniform Bottom
                  </Typography>
                </Box>

                {/* Accessories Checkbox */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Box
                    component="input"
                    type="checkbox"
                    {...register("basicDetails.accessories")}
                    sx={{
                      width: "16px",
                      height: "16px",
                      accentColor: "#2A77D5",
                    }}
                  />
                  <Typography
                    sx={{
                      width: "280px",
                      height: "16px",
                      paddingTop: "3px",
                      paddingBottom: "4px",
                      gap: "10px",
                      fontFamily: "Mukta",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "16px",
                      color: "#3B3B3B",
                    }}
                  >
                    Accessories
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BasicDetailsForm;
