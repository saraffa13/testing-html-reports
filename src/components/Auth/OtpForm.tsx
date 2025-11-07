// File: components/OtpForm.tsx
import { Box, Button, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import FormTitle from "./FormTitle";

interface OtpFormProps {
  onBack?: () => void;
  onVerify?: (otp: string) => void;
}

const OtpForm: React.FC<OtpFormProps> = ({ onVerify }) => {
  // OTP form state
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(105); // 1:45 in seconds
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  // Timer for OTP countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;

    // Handle input of a single character
    if (value.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      // Auto-focus next input if value is entered
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
    // Handle paste of multiple characters
    else if (value.length > 1) {
      const valueArray = value.split("").slice(0, 6);
      const newOtpValues = [...otpValues];

      valueArray.forEach((char, i) => {
        if (index + i < 6) {
          newOtpValues[index + i] = char;
        }
      });

      setOtpValues(newOtpValues);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtpValues.findIndex((val) => !val);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        otpInputRefs.current[nextEmptyIndex]?.focus();
      } else {
        otpInputRefs.current[5]?.focus();
      }
    }
  };

  // Using a generic React.KeyboardEvent to avoid TypeScript errors
  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      } else if (otpValues[index]) {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = "";
        setOtpValues(newOtpValues);

        if (index > 0) {
          setTimeout(() => {
            otpInputRefs.current[index - 1]?.focus();
          }, 10);
        }
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    // Handle right arrow key to navigate to next field
    if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otpValues.join("");
    console.log("Verifying OTP:", otpString);
    if (onVerify) {
      onVerify(otpString);
    }
  };

  const handleResendOtp = () => {
    console.log("Resending OTP");
    setTimeLeft(105);
  };

  return (
    <>
      <FormTitle title="Enter OTP" />

      <Box
        component="form"
        onSubmit={handleVerifyOtp}
        sx={{
          width: "400px",
          height: "280px",
          display: "flex",
          flexDirection: "column",
          gap: "56px",
        }}
      >
        {/* OTP Sent Text */}
        <Typography
          sx={{
            width: "100%",
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "16px",
            color: "#A3A3A3",
            textAlign: "center",
            marginTop: "0",
          }}
        >
          OTP Sent On +91 XXXX XX0043
        </Typography>

        {/* OTP Fields Container */}
        <Box
          sx={{
            width: "400px",
            height: "176px",
            display: "flex",
            flexDirection: "column",
            gap: "40px",
            justifyContent: "space-between",
          }}
        >
          {/* OTP Input Boxes */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextField
                key={index}
                variant="outlined"
                value={otpValues[index]}
                placeholder="0"
                inputRef={(input) => {
                  otpInputRefs.current[index] = input;
                }}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    padding: "10px",
                    fontSize: "16px",
                    color: "#888",
                  },
                }}
                sx={{
                  width: "48px",
                  height: "48px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "4px",
                    height: "48px",
                    width: "48px",
                    background: "#FFFFFF",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#DDDDDD",
                    borderWidth: "1px",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#DDDDDD",
                    borderWidth: "1px",
                  },
                }}
              />
            ))}
          </Box>

          {/* Supporting Actions for OTP */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: "0 10px",
            }}
          >
            {/* Didn't receive code? */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#A3A3A3",
                }}
              >
                Didn't receive code?
              </Typography>

              <Button
                disabled={timeLeft > 0}
                variant="text"
                onClick={handleResendOtp}
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#2E7CF6",
                  padding: "0",
                  minWidth: "auto",
                  lineHeight: "16px",
                  textTransform: "uppercase",
                }}
              >
                FORGOT PASSWORD ?
              </Button>
            </Box>

            {/* Timer */}
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#A3A3A3",
                lineHeight: "16px",
              }}
            >
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        </Box>

        {/* Verify OTP Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: "0",
          }}
        >
          <Button
            type="submit"
            disabled={otpValues.some((value) => !value)}
            sx={{
              width: "280px",
              height: "48px",
              backgroundColor: "#FFFFFF",
              color: "#2A77D5",
              borderRadius: "8px",
              padding: "16px 24px",
              textTransform: "uppercase",
              fontWeight: 700,
              fontSize: "24px",
              lineHeight: "40px",
              letterSpacing: "0%",
              boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
              "&:hover": {
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
              },
              "&.Mui-disabled": {
                backgroundColor: "#F0F0F0",
                color: "#A0A0A0",
                boxShadow: "none",
              },
            }}
          >
            VERIFY OTP
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default OtpForm;
