import { Badge, CameraAlt, Security, Close } from "@mui/icons-material";
import { Box, IconButton, Typography, Modal } from "@mui/material";
import React, { useState } from "react";
import type { UniformError } from "./defaults-types";

interface UniformContentProps {
  errors: UniformError[];
}

const getUniformIcon = (iconName: string) => {
  switch (iconName) {
    case "identity_card":
      return <Badge sx={{ width: 20, height: 20, color: "#707070" }} />;
    case "hat":
      return <Security sx={{ width: 20, height: 20, color: "#707070" }} />;
    default:
      return <Security sx={{ width: 20, height: 20, color: "#707070" }} />;
  }
};

/**
 * Content component for uniform defaults
 */
const UniformContent: React.FC<UniformContentProps> = ({ errors }) => {
  const [imageOverlayOpen, setImageOverlayOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Define upper and lower uniform categories
  const upperUniformItems = ["HAT", "ID_CARD", "SHIRT", "EPAULETTES"];
  const lowerUniformItems = ["BELT", "SHOES", "BATON", "TROUSER"];

  const getUniformImage = (uniformItem: string, evidenceUrl?: string): string => {
    if (!evidenceUrl) return "";
    
    const images = evidenceUrl.split(",");
    
    // Show upper uniform image for upper uniform items
    if (upperUniformItems.includes(uniformItem.toUpperCase())) {
      return images[0] || ""; // First image is upper uniform
    }
    
    // Show lower uniform image for lower uniform items
    if (lowerUniformItems.includes(uniformItem.toUpperCase())) {
      return images[1] || images[0] || ""; // Second image is lower uniform, fallback to first
    }
    
    return images[0] || "";
  };

  const handleEvidenceClick = (uniformItem: string, evidenceUrl?: string) => {
    const imageUrl = getUniformImage(uniformItem, evidenceUrl);
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setImageOverlayOpen(true);
    }
  };

  const closeImageOverlay = () => {
    setImageOverlayOpen(false);
    setSelectedImage("");
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
          height: "174px",
          gap: "10px",
          maxHeight: "174px",
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
                {getUniformIcon(error.icon)}
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

              {/* Evidence View Button */}
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
                  onClick={() => handleEvidenceClick(error.name, error.evidenceUrl)}
                  sx={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "14px",
                    backgroundColor: error.evidenceUrl ? "#2A77D5" : "#CCCCCC",
                    boxShadow: "0px 1px 4px 0px #70707033",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: error.evidenceUrl ? "#2364B6" : "#AAAAAA",
                    },
                    cursor: error.evidenceUrl ? "pointer" : "default",
                  }}
                  disabled={!error.evidenceUrl}
                >
                  <CameraAlt sx={{ width: 20, height: 20 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Image Overlay Modal */}
      <Modal
        open={imageOverlayOpen}
        onClose={closeImageOverlay}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflow: "hidden",
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={closeImageOverlay}
            sx={{
              position: "absolute",
              top: "12px",
              right: "12px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
              zIndex: 1,
            }}
          >
            <Close sx={{ width: 24, height: 24 }} />
          </IconButton>

          {/* Image Container */}
          {selectedImage && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img
                src={selectedImage}
                alt="Uniform Evidence"
                style={{
                  maxWidth: "calc(90vw - 60px)", // Account for padding and close button
                  maxHeight: "calc(90vh - 60px)", // Account for padding and close button
                  width: "auto",
                  height: "auto",
                  borderRadius: "8px",
                  objectFit: "contain",
                  display: "block",
                }}
                onError={(e) => {
                  console.error("Error loading image:", selectedImage);
                  e.currentTarget.style.display = "none";
                }}
              />
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default UniformContent;
