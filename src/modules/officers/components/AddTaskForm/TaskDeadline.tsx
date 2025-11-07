import { Box, Divider, FormControl, MenuItem, Select, TextField, Typography } from "@mui/material";
import React from "react";

interface TaskDeadlineData {
  dueDate: string;
  dueTime: string;
  amPm: "AM" | "PM";
}

interface TaskDeadlineFormProps {
  data: TaskDeadlineData;
  onUpdate: (data: Partial<TaskDeadlineData>) => void;
}

const TaskDeadlineForm: React.FC<TaskDeadlineFormProps> = ({ data, onUpdate }) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ dueDate: event.target.value });
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ dueTime: event.target.value });
  };

  const handleAmPmChange = (event: any) => {
    onUpdate({ amPm: event.target.value });
  };

  return (
    <Box
      sx={{
        width: "564px",
        height: "552px",
        padding: "24px",
        gap: "24px",
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Title */}
      <Typography
        variant="h1"
        sx={{
          fontFamily: "Mukta",
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "32px",
          color: "#2A77D5",
          textTransform: "capitalize",
          mb: 3,
        }}
      >
        TASK DEADLINE
      </Typography>

      {/* Select Due Date Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "14px",
            color: "#707070",
            textTransform: "capitalize",
            mb: 1,
          }}
        >
          SELECT DUE DATE
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Calendar would go here - for now using date input */}
        <TextField
          type="date"
          value={data.dueDate}
          onChange={handleDateChange}
          sx={{
            width: "320px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              padding: "16px",
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>

      {/* Select Due Time Section */}
      <Box>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "14px",
            color: "#707070",
            textTransform: "capitalize",
            mb: 1,
          }}
        >
          SELECT DUE TIME
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Due Time Input */}
          <Box sx={{ width: "372px" }}>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                color: "#707070",
                fontFamily: "Mukta",
                fontWeight: 400,
                fontSize: "12px",
              }}
            >
              Due Time <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              placeholder="Enter time HH:MM"
              value={data.dueTime}
              onChange={handleTimeChange}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #A3A3A3",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#A3A3A3",
                  fontFamily: "Mukta",
                  fontSize: "14px",
                },
              }}
            />
          </Box>

          {/* AM/PM Dropdown */}
          <Box sx={{ width: "128px" }}>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                color: "#707070",
                fontFamily: "Mukta",
                fontWeight: 400,
                fontSize: "12px",
              }}
            >
              Select AM/PM <span style={{ color: "red" }}>*</span>
            </Typography>
            <FormControl fullWidth>
              <Select
                value={data.amPm}
                onChange={handleAmPmChange}
                displayEmpty
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: data.amPm ? "2px solid #2A77D5" : "1px solid #A3A3A3",
                  "& .MuiSelect-select": {
                    padding: "8px 16px",
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                <MenuItem value="AM">AM</MenuItem>
                <MenuItem value="PM">PM</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TaskDeadlineForm;
