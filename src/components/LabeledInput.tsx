import { Box, FormHelperText, TextField, Typography } from "@mui/material";
import React from "react";

interface LabeledInputProps {
  label: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  error?: boolean;
  helperText?: string;
  register?: any;
  validation?: any;
  disabled?: boolean;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  type = "text",
  error,
  helperText,
  register,
  validation,
  disabled,
}) => {
  const inputProps = register ? { ...register(name, validation) } : { name, value, onChange };

  // Remove up/down arrows for number input
  const numberInputProps =
    type === "number"
      ? {
          inputProps: { inputMode: "numeric", pattern: "[0-9]*", style: { MozAppearance: "textfield" } },
          InputProps: {
            inputProps: { style: { MozAppearance: "textfield" } },
            sx: {
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
              "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
                WebkitAppearance: "none",
                margin: 0,
              },
            },
          },
        }
      : {};

  return (
    <Box>
      <Typography
        sx={{
          typography: {
            fontSize: "12px",
          },
          mb: 0.5,
          color: error ? "error.main" : "#707070",
        }}
      >
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </Typography>

      <TextField
        {...inputProps}
        placeholder={placeholder}
        type={type}
        fullWidth
        variant="outlined"
        size="small"
        error={error}
        sx={{
          borderRadius: "4px",
          width: "100%",
          flexGrow: 1,
          bgcolor: "white",
          ...(type === "number"
            ? {
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
                "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
              }
            : {}),
        }}
        disabled={disabled}
        {...numberInputProps}
      />

      {helperText && (
        <FormHelperText
          error={error}
          sx={{
            margin: 0,
            marginTop: "4px",
            fontSize: "0.75rem",
            lineHeight: "1.2",
            color: error ? "error.main" : "text.secondary",
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default LabeledInput;
