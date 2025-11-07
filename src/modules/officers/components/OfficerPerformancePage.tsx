import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import { Avatar, Box, Button, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type Officer, useOfficers } from "../context/OfficerContext";
import OfficerWindowRenderer from "./OfficerWindowRenderer";

// Define section types as string literals - only 3 sections for officers
type SectionType = "PERFORMANCE" | "PROFILE" | "CLIENT SITES";

// Component for the left menu with officer details and navigation options
const OfficerPerformancePage: React.FC = () => {
  // Get the officer ID from URL params (this is the guardId)
  const { officerId } = useParams<{ officerId: string }>();

  // Get officer data from context
  const { officers, loading, initializeOfficers, initialized } = useOfficers();

  // State for the current officer data
  const [officerData, setOfficerData] = useState<Officer | null>(null);
  const [isLoadingOfficerData, setIsLoadingOfficerData] = useState<boolean>(true);

  const navigate = useNavigate();

  // Active section state
  const [activeSection, setActiveSection] = useState<SectionType>("PERFORMANCE");

  // Find the officer data based on URL parameter when component mounts
  useEffect(() => {
    const findAndSetOfficerData = async () => {
      if (!officerId) {
        setIsLoadingOfficerData(false);
        return;
      }

      // If context is not initialized and not loading, initialize it
      if (!initialized && !loading) {
        console.log("🚀 Context not initialized, initializing officers...");
        try {
          await initializeOfficers();
        } catch (error) {
          console.error("❌ Failed to initialize officers:", error);
          setIsLoadingOfficerData(false);
          return;
        }
      }

      // If we're still loading, wait
      if (loading) {
        return;
      }

      // Try to find the officer by guardId
      const officer = officers.find(o => o.guardId === officerId);

      if (officer) {
        setOfficerData(officer);
        console.log("🔍 Officer data found:", {
          name: officer.name,
          referenceId: officer.id,
          guardId: officer.guardId,
          displayingGuardId: officer.guardId, // This is what we'll show as Officer ID
        });
      } else {
        console.log("⚠️ Officer not found in context:", {
          searchId: officerId,
          totalOfficersInContext: officers.length,
        });
      }

      setIsLoadingOfficerData(false);
    };

    findAndSetOfficerData();
  }, [officerId, initializeOfficers, initialized, loading, officers]);

  // Function to render stars based on trust score
  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score - fullStars >= 0.5;

    // Star colors based on rating
    let starColor = "#41AA4D"; // Default green for 4+
    if (score < 3) {
      starColor = "#E05952"; // Red for under 2
    } else if (score < 4) {
      starColor = "#E4C710"; // Yellow for 3+
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

  // Function to handle section change
  const handleSectionChange = (section: SectionType) => {
    setActiveSection(section);
  };

  // Show loading state while fetching officer data
  if (isLoadingOfficerData || loading || !officerData) {
    return (
      <Box
        sx={{
          width: "1272px",
          height: "872px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="primary" />
        <Typography sx={{ fontFamily: "Mukta", fontSize: "20px", color: "#707070" }}>
          Loading officer details...
        </Typography>
      </Box>
    );
  }

  // Navigation button config - only 3 sections for officers
  const navButtons: Array<{ section: SectionType; label: string }> = [
    { section: "PERFORMANCE", label: "PERFORMANCE" },
    { section: "PROFILE", label: "PROFILE" },
    { section: "CLIENT SITES", label: "CLIENT SITES" },
  ];

  return (
    <Box
      sx={{
        width: "1272px",
        height: "872px",
        paddingTop: "16px",
        paddingRight: "16px",
        paddingBottom: "16px",
        paddingLeft: "16px",
        gap: "8px",
        borderRadius: "16px",
        background: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          width: "1256px",
          height: "840px",
          display: "flex",
        }}
      >
        {/* Left Menu - Second Menu */}
        <Box
          sx={{
            width: "204px",
            height: "840px",
            gap: "16px",
            display: "flex",
            flexDirection: "column",
            background: "#FFFFFF",
            alignItems: "center",
            pt: 2,
          }}
        >
          {/* Officer Photo and Details */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              mb: 2,
            }}
          >
            <div className="flex flex-row justify-between">
              <div className="flex flex-row items-center text-sm gap-2 font-semibold mb-2">
                <ArrowBackIcon
                  className="cursor-pointer !text-[22px]"
                  fontSize="inherit"
                  onClick={() => navigate(-1)}
                />
                <h2>Officer's Performance Page</h2>
              </div>
            </div>
            {/* Photo */}
            <Avatar
              src={officerData.photo}
              alt={officerData.name}
              sx={{
                width: "56px",
                height: "56px",
                borderRadius: "120px",
                border: "2px solid #F0F0F0",
                mb: 1,
              }}
            />

            {/* Name */}
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 600,
                fontSize: "16px",
                lineHeight: "20px",
                textAlign: "center",
                color: "#3B3B3B",
                width: "176px",
                height: "auto",
              }}
            >
              {officerData.name}
            </Typography>

            {/* 🔥 FIXED: Officer ID - Now showing Guard ID instead of Reference ID */}
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "16px",
                color: "#707070",
                textAlign: "center",
                mt: 0.5,
              }}
            >
              Officer ID : {officerData.guardId || officerData.id}
            </Typography>
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ width: "100%", mt: 2, display: "flex", flexDirection: "column", gap: "8px" }}>
            {navButtons.map((btn) => (
              <Button
                key={btn.section}
                onClick={() => handleSectionChange(btn.section)}
                sx={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "6px",
                  justifyContent: "center",
                  textAlign: "center",
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: btn.section === "PERFORMANCE" ? "16px" : "14px",
                  lineHeight: btn.section === "PERFORMANCE" ? "24px" : "16px",
                  textTransform: "uppercase",
                  backgroundColor: activeSection === btn.section ? "#2A77D5" : "transparent",
                  color: activeSection === btn.section ? "#FFFFFF" : "#707070",
                  "&:hover": {
                    backgroundColor: activeSection === btn.section ? "#2A77D5" : "#F5F5F5",
                  },
                }}
              >
                {btn.label}
              </Button>
            ))}
          </Box>

          {/* Trust Score at bottom */}
          <Box
            sx={{
              width: "148px",
              height: "148px",
              padding: "12px 16px 16px 16px",
              borderRadius: "12px",
              background: "#F7F7F7",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              mt: "auto",
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                width: "80px",
                height: "118px",
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

              <Box sx={{ marginTop: "5px" }}>
                {/* Stars */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: "1px" }}>
                  {renderStars(officerData.upAndUpTrust || 0)}
                </Box>

                {/* Score */}
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 600,
                    fontSize: "24px",
                    lineHeight: "30px",
                    color: "#2A77D5",
                    marginBottom: "15px",
                    textAlign: "center",
                  }}
                >
                  {officerData.upAndUpTrust ? officerData.upAndUpTrust.toFixed(2) : "0.00"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right content area - Now using OfficerWindowRenderer */}
        <Box
          sx={{
            width: "1052px",
            height: "840px",
            borderRadius: "16px",
            marginLeft: "16px",
          }}
        >
          <OfficerWindowRenderer activeSection={activeSection} />
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerPerformancePage;
