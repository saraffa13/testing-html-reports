import React from "react";
import { useParams } from "react-router-dom";
import OfficerClientSitesWindow from "./OfficerInsights/Insights-SubComponents/OfficerClientSitesWindow";
import OfficerPerformanceWindow from "./OfficerInsights/Insights-SubComponents/OfficerPerformanceWindow";
import OfficerProfileWindow from "./OfficerInsights/Insights-SubComponents/OfficerProfileWindow";

// Define section types for navigation - only 3 sections for officers
type SectionType = "PERFORMANCE" | "PROFILE" | "CLIENT SITES";

interface OfficerWindowRendererProps {
  activeSection: SectionType;
}

/**
 * Component that renders the appropriate window based on the active section for officers
 */
const OfficerWindowRenderer: React.FC<OfficerWindowRendererProps> = ({ activeSection }) => {
  // Get officer name from URL params for passing to the appropriate window component
  useParams<{ officerName: string }>();

  // Render the appropriate window component based on the active section
  switch (activeSection) {
    case "PERFORMANCE":
      return <OfficerPerformanceWindow />;
    case "PROFILE":
      return <OfficerProfileWindow />;
    case "CLIENT SITES":
      return <OfficerClientSitesWindow />;
    default:
      return <OfficerPerformanceWindow />;
  }
};

export default OfficerWindowRenderer;
