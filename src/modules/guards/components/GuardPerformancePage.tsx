import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import { Avatar, Box, Button, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type Guard, useGuards } from "../context/GuardContext";
import WindowRenderer from "./WindowRenderer";

// Define section types as string literals
type SectionType = "PERFORMANCE" | "PROFILE" | "ASSIGNMENT" | "HISTORY";

// Component for the left menu with guard details and navigation options
const GuardPerformancePage: React.FC = () => {
  // Get the guard ID from URL params
  const { guardId } = useParams<{ guardId: string }>();

  // Get guard data from context
  const { loading, initializeGuards, initialized, guards } = useGuards();

  // State for the current guard data
  const [guardData, setGuardData] = useState<Guard | null>(null);
  const [isLoadingGuardData, setIsLoadingGuardData] = useState<boolean>(true);

  // Active section state
  const [activeSection, setActiveSection] = useState<SectionType>("PERFORMANCE");

  const navigate = useNavigate();

  // Find the guard data based on URL parameter when component mounts
  useEffect(() => {
    const findAndSetGuardData = async () => {
      if (!guardId) {
        setIsLoadingGuardData(false);
        return;
      }

      // If context is not initialized and not loading, initialize it
      if (!initialized && !loading) {
        console.log("🚀 Context not initialized, initializing guards...");
        try {
          await initializeGuards();
        } catch (error) {
          console.error("❌ Failed to initialize guards:", error);
          setIsLoadingGuardData(false);
          return;
        }
      }

      // If we're still loading, wait
      if (loading) {
        return;
      }

      // Try to find the guard by ID
      const guard = guards.find((g) => g.id === guardId);

      if (guard) {
        setGuardData(guard);
        console.log("✅ Guard found:", {
          id: guard.id,
          name: guard.name,
          companyId: guard.companyId,
        });
      } else {
        console.log("⚠️ Guard not found in context:", {
          searchId: guardId,
          totalGuardsInContext: guards.length,
        });
      }

      setIsLoadingGuardData(false);
    };

    findAndSetGuardData();
  }, [guardId, initializeGuards, initialized, loading, guards]);

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
    console.log("🔄 Section changed:", {
      previousSection: activeSection,
      newSection: section,
      guardId: guardData?.id,
    });
  };

  // Show loading state while fetching guard data
  if (isLoadingGuardData || loading || !guardData) {
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
          Loading guard details...
        </Typography>
      </Box>
    );
  }

  // Navigation button config for less repetition
  const navButtons: Array<{ section: SectionType; label: string }> = [
    { section: "PERFORMANCE", label: "PERFORMANCE" },
    { section: "PROFILE", label: "PROFILE" },
    { section: "ASSIGNMENT", label: "ASSIGNMENT" },
    { section: "HISTORY", label: "HISTORY" },
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
          <div className="flex flex-row justify-between">
            <div className="flex flex-row items-center text-sm gap-2 font-semibold mb-2">
              <ArrowBackIcon className="cursor-pointer !text-[22px]" fontSize="inherit" onClick={() => navigate(-1)} />
              <h2>Guard's Performance Page</h2>
            </div>
          </div>
          {/* Guard Photo and Details */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              mb: 2,
            }}
          >
            {/* Photo */}
            <Avatar
              src={guardData.photo}
              alt={guardData.name}
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
              {guardData.name}
            </Typography>

            {/* Company ID */}
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
              Company ID : {guardData.companyId}
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
                  {renderStars(guardData.upAndUpTrust || 0)}
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
                  {guardData.upAndUpTrust ? guardData.upAndUpTrust.toFixed(2) : "0.00"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right content area - Now using WindowRenderer with guardData */}
        <Box
          sx={{
            width: "1052px",
            height: "840px",
            borderRadius: "16px",
            marginLeft: "16px",
          }}
        >
          {/* ✅ Pass guardData to WindowRenderer */}
          <WindowRenderer activeSection={activeSection} guardData={guardData} />
        </Box>
      </Box>
    </Box>
  );
};

export default GuardPerformancePage;
