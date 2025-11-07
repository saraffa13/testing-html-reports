import { Box, Typography } from "@mui/material";
import React, { useState } from "react";
import SettingsWindowRenderer from "../components/SettingsWindowRenderer";

// Define section types for settings navigation
type SettingSectionType = "OPERATIONAL" | "UNIFORM" | "DATA";
type MainSectionType = "GLOBAL SETUP" | "DATA";

interface SettingsPageProps {}

const SettingsPage: React.FC<SettingsPageProps> = () => {
  // State for active main section and sub-section
  const [activeMainSection, setActiveMainSection] = useState<MainSectionType>("GLOBAL SETUP");
  const [activeSubSection, setActiveSubSection] = useState<SettingSectionType>("OPERATIONAL");

  // Handle main section change
  const handleMainSectionChange = (section: MainSectionType) => {
    setActiveMainSection(section);
    // Reset sub-section when main section changes
    if (section === "GLOBAL SETUP") {
      setActiveSubSection("OPERATIONAL");
    }
  };

  // Handle sub-section change
  const handleSubSectionChange = (section: SettingSectionType) => {
    setActiveSubSection(section);
  };

  // Render sub-options for Global Setup
  const renderGlobalSetupSubOptions = () => {
    const subOptions: Array<{ section: SettingSectionType; label: string }> = [
      { section: "OPERATIONAL", label: "OPERATIONAL" },
      { section: "UNIFORM", label: "UNIFORM" },
    ];

    return (
      <Box sx={{ width: "160px", height: "66px", gap: "8px", display: "flex", flexDirection: "column" }}>
        {subOptions.map((option) => (
          <Box
            key={option.section}
            onClick={() => handleSubSectionChange(option.section)}
            sx={{
              width: "160px",
              height: "29px",
              borderRadius: "6px",
              padding: "10px 8px",
              backgroundColor: activeSubSection === option.section ? "#2A77D5" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: activeSubSection === option.section ? "#2A77D5" : "#F5F5F5",
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "16px",
                textAlign: "left",
                textTransform: "uppercase",
                color: activeSubSection === option.section ? "#FFFFFF" : "#A3A3A3",
              }}
            >
              • {option.label}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: "1272px",
        height: "872px",
        borderRadius: "16px",
        paddingTop: "16px",
        paddingRight: "16px",
        paddingBottom: "16px",
        paddingLeft: "16px",
        gap: "16px",
        background: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          width: "1240px",
          height: "840px",
          display: "flex",
          gap: "16px",
        }}
      >
        {/* Left Sidebar - Settings Menu */}
        <Box
          sx={{
            width: "204px",
            height: "840px",
            gap: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#FFFFFF",
          }}
        >
          {/* Settings Header */}
          <Box
            sx={{
              width: "176px",
              height: "120px",
              gap: "8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "16px",
            }}
          >
            {/* Settings Title */}
            <Box
              sx={{
                width: "176px",
                height: "56px",
                gap: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  width: "176px",
                  height: "16px",
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "20px",
                  textAlign: "center",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                  paddingTop: "3px",
                  paddingBottom: "3px",
                }}
              >
                Settings
              </Typography>

              {/* Last Modified */}
              <Typography
                sx={{
                  width: "82px",
                  height: "32px",
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "16px",
                  textAlign: "center",
                  textTransform: "capitalize",
                  color: "#707070",
                  paddingTop: "3px",
                  paddingBottom: "4px",
                }}
              >
                Last Modified
                <br />
                12/02/205
              </Typography>
            </Box>
          </Box>

          {/* Navigation Options */}
          <Box
            sx={{
              width: "204px",
              height: "704px",
              gap: "4px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Global Setup Section */}
            <Box
              sx={{
                width: "204px",
                paddingLeft: "20px",
                gap: "10px",
              }}
            >
              {/* Selection Layer */}
              <Box
                sx={{
                  width: "180px",
                  height: "135px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  paddingLeft: "16px",
                  gap: "16px",
                  borderTopLeftRadius: "12px",
                  borderBottomLeftRadius: "12px",
                  background: activeMainSection === "GLOBAL SETUP" ? "#F7F7F7" : "transparent",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Main Button */}
                <Box
                  sx={{
                    width: "148px",
                    height: "24px",
                    borderRadius: "10px",
                    paddingRight: "8px",
                    paddingLeft: "12px",
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => handleMainSectionChange("GLOBAL SETUP")}
                >
                  {activeMainSection === "GLOBAL SETUP" && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: "-16px",
                        width: "4px",
                        height: "24px",
                        backgroundColor: "#2A77D5",
                        borderRadius: "0 2px 2px 0",
                      }}
                    />
                  )}
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "24px",
                      textAlign: "left",
                      textTransform: "uppercase",
                      color: "#3B3B3B",
                    }}
                  >
                    GLOBAL SETUP
                  </Typography>
                </Box>

                {/* Sub List - Only show when Global Setup is active */}
                {activeMainSection === "GLOBAL SETUP" && renderGlobalSetupSubOptions()}
              </Box>
            </Box>

            {/* Data Section */}
            <Box
              sx={{
                width: "204px",
                height: "56px",
                paddingLeft: "20px",
                gap: "10px",
              }}
            >
              {/* Selection Layer */}
              <Box
                sx={{
                  width: "184px",
                  height: "56px",
                  padding: "8px",
                  gap: "10px",
                }}
              >
                <Box
                  sx={{
                    width: "148px",
                    height: "40px",
                    borderRadius: "6px",
                    paddingTop: "15px",
                    paddingRight: "16px",
                    paddingBottom: "15px",
                    paddingLeft: "24px",
                    background: activeMainSection === "DATA" ? "#2A77D5" : "#F7F7F7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => handleMainSectionChange("DATA")}
                >
                  {activeMainSection === "DATA" && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: "-8px",
                        width: "4px",
                        height: "40px",
                        backgroundColor: "#2A77D5",
                        borderRadius: "0 2px 2px 0",
                      }}
                    />
                  )}
                  <Typography
                    sx={{
                      fontFamily: "Mukta",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "16px",
                      textAlign: "left",
                      textTransform: "uppercase",
                      color: activeMainSection === "DATA" ? "#FFFFFF" : "#707070",
                    }}
                  >
                    DATA
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Content Area */}
        <Box
          sx={{
            width: "1020px",
            height: "840px",
            borderRadius: "16px",
          }}
        >
          <SettingsWindowRenderer activeSection={activeMainSection === "GLOBAL SETUP" ? activeSubSection : "DATA"} />
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;
