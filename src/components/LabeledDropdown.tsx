import { Box, FormHelperText, MenuItem, Select, Typography } from "@mui/material";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface OptionType {
  value: string | number;
  label: string;
}

interface LabeledDropdownProps {
  label: string;
  name: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<{ value: unknown }>) => void;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  register?: any;
  validation?: any;
  disabled?: boolean;
  options: OptionType[];
  fullWidth?: boolean;
  maxMenuHeight?: number;
  defaultValue?: any;
}

const LabeledDropdown: React.FC<LabeledDropdownProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  error,
  helperText,
  register,
  validation,
  disabled,
  options,
  fullWidth = true,
  maxMenuHeight = 200,
  defaultValue = "",
}) => {
  const formContext = useFormContext();

  if (formContext && register) {
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

        <Controller
          name={name}
          control={formContext.control}
          rules={validation}
          defaultValue={defaultValue}
          render={({ field, fieldState }) => (
            <>
              <Select
                {...field}
                displayEmpty
                fullWidth={fullWidth}
                variant="outlined"
                size="small"
                error={!!fieldState.error || error}
                disabled={disabled}
                value={field.value || ""}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: maxMenuHeight,
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      marginTop: "4px",
                      backgroundColor: "white",
                    },
                  },
                  MenuListProps: {
                    style: {
                      padding: "8px 0",
                    },
                  },
                }}
                renderValue={(selected) => {
                  if (selected === undefined || selected === null || selected === "") {
                    return <span style={{ color: "rgba(0, 0, 0, 0.38)" }}>{placeholder}</span>;
                  }
                  const selectedOption = options.find((option) => option.value === selected);
                  return selectedOption ? selectedOption.label : "";
                }}
                sx={{
                  borderRadius: "4px",
                  width: "100%",
                  flexGrow: 1,
                  bgcolor: "white",
                }}
              >
                {options.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{
                      padding: "8px 16px",
                      fontSize: "14px",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "#e3f2fd",
                        "&:hover": {
                          backgroundColor: "#bbdefb",
                        },
                      },
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>

              {(fieldState.error?.message || helperText) && (
                <FormHelperText
                  error={!!fieldState.error || error}
                  sx={{
                    margin: 0,
                    marginTop: "4px",
                    fontSize: "0.75rem",
                    lineHeight: "1.2",
                    color: !!fieldState.error || error ? "error.main" : "text.secondary",
                  }}
                >
                  {fieldState.error?.message || helperText}
                </FormHelperText>
              )}
            </>
          )}
        />
      </Box>
    );
  }

  const selectProps = register
    ? register(name, validation)
    : {
        name,
        value: value !== undefined ? value : defaultValue,
        onChange,
      };

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

      <Select
        {...selectProps}
        displayEmpty
        fullWidth={fullWidth}
        variant="outlined"
        size="small"
        error={error}
        disabled={disabled}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: maxMenuHeight,
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              marginTop: "4px",
              bgcolor: "white",
            },
          },
          MenuListProps: {
            style: {
              padding: "8px 0",
            },
          },
        }}
        renderValue={(selected) => {
          if (selected === undefined || selected === null || selected === "") {
            return <span style={{ color: "rgba(0, 0, 0, 0.38)" }}>{placeholder}</span>;
          }
          const selectedOption = options.find((option) => option.value === selected);
          return selectedOption ? selectedOption.label : "";
        }}
        sx={{
          borderRadius: "4px",
          width: "100%",
          flexGrow: 1,
          bgcolor: "white",
        }}
      >
        {placeholder && (
          <MenuItem
            value=""
            disabled
            sx={{
              padding: "8px 16px",
              fontSize: "14px",
              "&.Mui-disabled": {
                opacity: 0.6,
              },
            }}
          >
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              padding: "8px 16px",
              fontSize: "14px",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              "&.Mui-selected": {
                backgroundColor: "#e3f2fd",
                "&:hover": {
                  backgroundColor: "#bbdefb",
                },
              },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>

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

export default LabeledDropdown;
