import { Badge, CameraAlt, Security } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import React from "react";
import type { OfficerUniformError } from "./officer-defaults-types";

interface OfficerUniformContentProps {
  errors: OfficerUniformError[];
}

const getOfficerUniformIcon = (iconName: string) => {
  switch (iconName) {
    case "identity_card":
      return <Badge sx={{ width: 20, height: 20, color: "#707070" }} />;
    case "hat":
      return <Security sx={{ width: 20, height: 20, color: "#707070" }} />;
    case "badge":
      return <Badge sx={{ width: 20, height: 20, color: "#707070" }} />;
    default:
      return <Security sx={{ width: 20, height: 20, color: "#707070" }} />;
  }
};

/**
 * Content component for officer uniform defaults
 */
const OfficerUniformContent: React.FC<OfficerUniformContentProps> = ({ errors }) => {
  const handleEvidenceUpload = (errorId: string) => {
    // Handle evidence upload logic here
    console.log("Upload evidence for officer uniform error:", errorId);
  };

  return (
    <Box
      sx={{
        width: "470px",
        height: "168px",
        gap: "16px",
        paddingTop: "16px",
        paddingBottom: "16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Table Heading */}
      <Box
        sx={{
          width: "470px",
          height: "16px",
          borderRadius: "8px",
          gap: "16px",
          paddingRight: "16px",
          paddingLeft: "16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            width: "211px",
            height: "16px",
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            paddingTop: "4px",
            paddingBottom: "4px",
          }}
        >
          ERROR
        </Typography>
        <Typography
          sx={{
            width: "82px",
            height: "16px",
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            paddingTop: "4px",
            paddingBottom: "4px",
          }}
        >
          STATUS
        </Typography>
        <Typography
          sx={{
            width: "56px",
            height: "16px",
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            paddingTop: "4px",
            paddingBottom: "4px",
          }}
        >
          EVIDENCE
        </Typography>
      </Box>

      {/* Table Content */}
      <Box
        sx={{
          width: "470px",
          height: "120px",
          gap: "10px",
          maxHeight: "120px",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "12px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#F0F0F0",
            borderRadius: "40px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#D9D9D9",
            borderRadius: "60px",
          },
        }}
      >
        <Box
          sx={{
            width: "448px",
            gap: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {errors.map((error) => (
            <Box
              key={error.id}
              sx={{
                width: "448px",
                height: "64px",
                gap: "16px",
                paddingRight: "16px",
                paddingLeft: "16px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #F0F0F0",
                boxShadow: "0px 1px 4px 0px #70707033",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Type */}
              <Box
                sx={{
                  width: "212px",
                  height: "64px",
                  gap: "8px",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {getOfficerUniformIcon(error.icon)}
                <Typography
                  sx={{
                    width: "auto",
                    height: "16px",
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#3B3B3B",
                    marginLeft: "8px",
                  }}
                >
                  {error.name}
                </Typography>
              </Box>

              {/* Status */}
              <Box
                sx={{
                  width: "84px",
                  height: "64px",
                  gap: "4px",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    width: "84px",
                    height: "16px",
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "16px",
                    textTransform: "capitalize",
                    color: "#3B3B3B",
                  }}
                >
                  {error.status}
                </Typography>
              </Box>

              {/* Evidence Upload Button */}
              <Box
                sx={{
                  width: "56px",
                  height: "36px",
                  gap: "4px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <IconButton
                  onClick={() => handleEvidenceUpload(error.id)}
                  sx={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "14px",
                    backgroundColor: "#2A77D5",
                    boxShadow: "0px 1px 4px 0px #70707033",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#2364B6",
                    },
                  }}
                >
                  <CameraAlt sx={{ width: 20, height: 20 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerUniformContent;
