// File: src/components/profile/VerifiedDocumentsCard.tsx
import CheckIcon from "@mui/icons-material/Check";
import StarIcon from "@mui/icons-material/Star";
import { Box, Divider, Typography } from "@mui/material";
import React from "react";

// Props interface
interface VerifiedDocumentsCardProps {
  documents: {
    aadhaarCard: boolean;
    birthCertificate: boolean;
    educationCertificate: boolean;
    panCard: boolean;
  };
  upAndUpTrust: number;
}

// Document Card Component
const DocumentCard: React.FC<{
  title: string;
  documentNumber: string;
  verified: boolean;
  image?: string;
}> = ({ title, documentNumber, verified, image }) => (
  <Box
    sx={{
      width: "100%",
      height: "80px",
      borderRadius: "12px",
      padding: "8px",
      border: "2px solid #F7F7F7",
      backgroundColor: "#FFFFFF",
      mb: "8px",
    }}
  >
    <Box
      sx={{
        width: "100%",
        height: "64px",
        borderRadius: "8px",
        backgroundColor: "#FEFCF1",
        padding: "8px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
      }}
    >
      {/* Document Photo */}
      <Box
        sx={{
          width: "48px",
          height: "48px",
          borderRadius: "4px",
          backgroundColor: "#F0F0F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {image ? (
          <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Typography sx={{ fontSize: "10px", color: "#707070" }}>Doc</Typography>
        )}
      </Box>

      {/* Document Details */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "16px",
            color: "#575757",
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "16px",
            color: "#575757",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {documentNumber}
        </Typography>
      </Box>

      {/* Verification Icon */}
      {verified && (
        <CheckIcon
          sx={{
            width: "20px",
            height: "20px",
            color: "#4CAF50",
            flexShrink: 0,
          }}
        />
      )}
    </Box>
  </Box>
);

const VerifiedDocumentsCard: React.FC<VerifiedDocumentsCardProps> = ({ documents, upAndUpTrust }) => {
  // Function to render stars based on trust score
  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score - fullStars >= 0.5;

    let starColor = "#41AA4D";
    if (score < 3) {
      starColor = "#E05952";
    } else if (score < 4) {
      starColor = "#E4C710";
    }

    for (let i = 0; i < 5; i++) {
      const isFilled = i < fullStars || (i === fullStars && hasHalfStar);
      stars.push(
        <StarIcon
          key={i}
          sx={{
            color: isFilled ? starColor : "#D9D9D9",
            width: 16,
            height: 16,
          }}
        />
      );
    }

    return stars;
  };

  return (
    <Box
      sx={{
        flex: "0 0 350px",
        borderRadius: "10px",
        padding: "16px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "fit-content",
      }}
    >
      {/* Title */}
      <Typography
        sx={{
          fontFamily: "Mukta",
          fontWeight: 600,
          fontSize: "16px",
          lineHeight: "20px",
          color: "#575757",
          textTransform: "capitalize",
        }}
      >
        Verified Documents
      </Typography>

      {/* Trust Score */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "32px",
          width: "313px",
          justifyContent: "center",
          height: "62px",
        }}
      >
        <Box sx={{}}>
          {/* Logo */}
          <Box
            component="div"
            sx={{
              width: "67px",
              height: "62px",
              mb: 1,
              display: "flex",
              justifyContent: "center",
              color: "#2A77D5",
              fontWeight: "bold",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box>
              <img src="/logo.svg" alt="UpAndUp.Life Logo" className="w-[60px] h-[50px]" />
            </Box>
            <Typography
              variant="caption"
              sx={{ width: "67px", height: "10px", fontSize: "16px", fontWeight: "600", marginBottom: "5px" }}
            >
              UpAndUp
            </Typography>
            <Typography
              variant="caption"
              sx={{ width: "37px", height: "10px", fontSize: "16px", fontWeight: "500", paddingBottom: "10px" }}
            >
              Trust
            </Typography>
          </Box>
        </Box>

        <Box sx={{ paddingTop: "25px" }}>
          {/* Stars */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: "1px", width: "80", height: "16" }}>
            {renderStars(upAndUpTrust || 0)}
          </Box>

          {/* Score */}
          <Typography
            sx={{
              width: "40",
              height: "20",
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "32px",
              lineHeight: "40px",
              color: "#575757",
              textAlign: "center",
            }}
          >
            {upAndUpTrust ? upAndUpTrust.toFixed(2) : "0.00"}
          </Typography>
        </Box>
      </Box>
      {/* Line */}
      <Divider sx={{ borderColor: "#F7F7F7" }} />

      {/* Cross Checked Label */}
      <Typography
        sx={{
          fontFamily: "Mukta",
          fontWeight: 400,
          fontSize: "12px",
          lineHeight: "16px",
          color: "#575757",
          textTransform: "uppercase",
        }}
      >
        CROSS CHECKED WITH GOVT
      </Typography>

      {/* Documents List */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {documents.aadhaarCard && (
          <DocumentCard
            title="AADHAAR CARD"
            documentNumber="XXXXXXXXX6454"
            verified={true}
            image="https://via.placeholder.com/48x48/4CAF50/FFFFFF?text=AD"
          />
        )}
        {documents.birthCertificate && (
          <DocumentCard
            title="BIRTH CERTIFICATE"
            documentNumber="XX/XX/XX58"
            verified={true}
            image="https://via.placeholder.com/48x48/2196F3/FFFFFF?text=BC"
          />
        )}
        {documents.educationCertificate && (
          <DocumentCard
            title="RATION CARD"
            documentNumber="XXXXXXX645"
            verified={true}
            image="https://via.placeholder.com/48x48/FF9800/FFFFFF?text=RC"
          />
        )}
        {documents.panCard && (
          <DocumentCard
            title="PAN CARD"
            documentNumber="XXXXX1234X"
            verified={true}
            image="https://via.placeholder.com/48x48/9C27B0/FFFFFF?text=PC"
          />
        )}
      </Box>
    </Box>
  );
};

export default VerifiedDocumentsCard;
