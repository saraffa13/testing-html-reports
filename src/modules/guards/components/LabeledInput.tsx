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
}) => {
  const inputProps = register ? { ...register(name, validation) } : { name, value, onChange };

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{
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
        }}
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
