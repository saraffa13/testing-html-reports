import { Box, Button, Stack } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useState } from "react";

interface CustomDateRangePickerProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onCancel: () => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  onDateRangeChange,
  onCancel,
  initialStartDate,
  initialEndDate,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);

  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate);
    }
  };

  const isApplyDisabled = !startDate || !endDate || startDate > endDate;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, minWidth: 300 }}>
        <Stack spacing={3}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            maxDate={endDate || new Date()}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            minDate={startDate || undefined}
            maxDate={new Date()}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleApply} disabled={isApplyDisabled}>
              Apply
            </Button>
          </Stack>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};
