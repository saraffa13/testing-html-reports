import React from "react";
import AssignmentWindow from "./GuardPerformance-subComponents/AssignmentWindow";
import HistoryWindow from "./GuardPerformance-subComponents/HistoryWindow";
import PerformanceWindow from "./GuardPerformance-subComponents/PerformanceWindow";
import ProfileWindow from "./GuardPerformance-subComponents/ProfileWindow";

// Define section types for navigation
type SectionType = "PERFORMANCE" | "PROFILE" | "ASSIGNMENT" | "HISTORY";

interface WindowRendererProps {
  activeSection: SectionType;
  guardData?: any; // Guard data from parent component
}

/**
 * Component that renders the appropriate window based on the active section
 * Each window component handles its own data fetching and URL param extraction
 */
const WindowRenderer: React.FC<WindowRendererProps> = ({ activeSection, guardData }) => {
  // Log the current section for debugging
  console.log("🖼️ WindowRenderer:", {
    activeSection,
    guardId: guardData?.id,
    guardName: guardData?.name,
    timestamp: new Date().toISOString(),
  });

  // Render the appropriate window component based on the active section
  switch (activeSection) {
    case "PERFORMANCE":
      return <PerformanceWindow />;

    case "PROFILE":
      return <ProfileWindow />;

    case "ASSIGNMENT":
      // AssignmentWindow gets guardId from useParams internally
      return <AssignmentWindow />;

    case "HISTORY":
      // ✅ Pass guardId to HistoryWindow
      return <HistoryWindow guardId={guardData?.id} />;

    default:
      console.warn("Unknown section type:", activeSection, "defaulting to PERFORMANCE");
      return <PerformanceWindow />;
  }
};

export default WindowRenderer;
