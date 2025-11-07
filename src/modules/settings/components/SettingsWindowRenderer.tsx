import React from "react";

// Define section types for settings navigation
type SettingSectionType = "OPERATIONAL" | "UNIFORM" | "DATA";

interface SettingsWindowRendererProps {
  activeSection: SettingSectionType;
}

/**
 * Component that renders the appropriate settings window based on the active section
 * This follows the same pattern as GuardPerformance WindowRenderer
 */
const SettingsWindowRenderer: React.FC<SettingsWindowRendererProps> = ({ activeSection }) => {
  // Render the appropriate window component based on the active section
  switch (activeSection) {
    case "OPERATIONAL":
      return <OperationalWindow />;
    case "UNIFORM":
      return <UniformWindow />;
    case "DATA":
      return <DataWindow />;
    default:
      return <OperationalWindow />;
  }
};

// Import OperationalWindow from separate file
import DataWindow from "./DataWindow";
import OperationalWindow from "./OperationalWindow";
import UniformWindow from "./UniformWindow";

export default SettingsWindowRenderer;
