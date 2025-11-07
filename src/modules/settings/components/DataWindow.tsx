import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";

// Mock data for last import/export dates
const mockDataInfo = {
  clientData: {
    lastImported: "20/01/2024",
    lastExported: "20/01/2024",
  },
  guardData: {
    lastImported: "20/01/2024",
    lastExported: "20/01/2024",
  },
  areaOfficer: {
    lastImported: "20/01/2024",
    lastExported: "20/01/2024",
  },
};

interface DataItemProps {
  title: string;
  lastDate: string;
  actionText: string;
  onAction: () => void;
  isExport?: boolean;
}

const DataItem: React.FC<DataItemProps> = ({ title, lastDate, actionText, onAction, isExport = false }) => {
  return (
    <Box
      sx={{
        width: "988px",
        height: "36px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <Box
        sx={{
          // Remove fixed width to allow flexible sizing
          minWidth: "200px", // Ensure minimum width for longer text
          height: "36px",
          gap: "4px",
          display: "flex",
          flexDirection: "column",
          flex: 1, // Allow this to grow and take available space
        }}
      >
        <Typography
          sx={{
            // Remove fixed width constraint
            height: "16px",
            paddingTop: "3px",
            paddingBottom: "4px",
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            whiteSpace: "nowrap", // Prevent text wrapping
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            // Remove fixed width constraint
            height: "16px",
            paddingTop: "3px",
            paddingBottom: "4px",
            fontFamily: "Mukta",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "16px",
            color: "#A3A3A3",
            whiteSpace: "nowrap", // Prevent text wrapping
          }}
        >
          {`Last ${isExport ? "Exported" : "Imported"}: ${lastDate}`}
        </Typography>
      </Box>

      <Button
        onClick={onAction}
        sx={{
          width: "94px",
          height: "36px",
          borderRadius: "8px",
          gap: "12px",
          padding: "8px 20px", // Simplified padding
          background: "#FFFFFF",
          boxShadow: "0px 1px 4px 0px #70707033",
          display: "flex", // Add flex display
          alignItems: "center", // Center content vertically
          justifyContent: "center", // Center content horizontally
          "&:hover": {
            background: "#F5F5F5",
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "24px",
            textTransform: "uppercase",
            color: "#2A77D5",
            textAlign: "center", // Center text alignment
          }}
        >
          {actionText}
        </Typography>
      </Button>
    </Box>
  );
};

const DataWindow: React.FC = () => {
  const [dataInfo] = useState(mockDataInfo);

  // Import handlers
  const handleImportClientData = () => {
    console.log("Importing client data...");
    // TODO: Implement file import logic
  };

  const handleImportGuardData = () => {
    console.log("Importing guard data...");
    // TODO: Implement file import logic
  };

  const handleImportAreaOfficer = () => {
    console.log("Importing area officer data...");
    // TODO: Implement file import logic
  };

  // Export handlers
  const handleExportClientData = () => {
    console.log("Exporting client data...");
    // TODO: Implement file export logic
  };

  const handleExportGuardData = () => {
    console.log("Exporting guard data...");
    // TODO: Implement file export logic
  };

  const handleExportAreaOfficer = () => {
    console.log("Exporting area officer data...");
    // TODO: Implement file export logic
  };

  return (
    <Box
      sx={{
        width: "1052px",
        height: "840px",
        borderRadius: "12px",
        padding: "16px",
        background: "#F7F7F7",
      }}
    >
      <Box
        sx={{
          width: "1020px",
          height: "808px",
          gap: "12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            width: "1020px",
            height: "32px",
            gap: "8px",
          }}
        >
          <Box
            sx={{
              width: "49px",
              height: "24px",
              gap: "10px",
              paddingTop: "5px",
              paddingBottom: "4px",
            }}
          >
            <Typography
              sx={{
                width: "49px",
                height: "15px",
                fontFamily: "Mukta",
                fontWeight: 600,
                fontSize: "24px",
                lineHeight: "32px",
                textTransform: "capitalize",
                color: "#3B3B3B",
              }}
            >
              Data
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <Box
          sx={{
            width: "1020px",
            height: "752px",
            gap: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Import Files Card */}
          <Box
            sx={{
              width: "1020px",
              height: "232px",
              borderRadius: "10px",
              gap: "16px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "16px",
              paddingLeft: "16px",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Card Header */}
            <Box
              sx={{
                width: "988px",
                height: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <Typography
                sx={{
                  width: "83px",
                  height: "16px",
                  gap: "10px",
                  paddingTop: "3px",
                  paddingBottom: "3px",
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "20px",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                }}
              >
                Import Files
              </Typography>
              <Typography
                sx={{
                  width: "259px",
                  height: "16px",
                  gap: "10px",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "#A3A3A3",
                }}
              >
                Supported formats are CSV, XLS, XLSX, JSON or XML
              </Typography>
            </Box>

            {/* Import Items */}
            <Box
              sx={{
                width: "988px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                paddingTop: "16px",
              }}
            >
              <DataItem
                title="Client Data"
                lastDate={dataInfo.clientData.lastImported}
                actionText="Import"
                onAction={handleImportClientData}
              />

              <DataItem
                title="Guard Data"
                lastDate={dataInfo.guardData.lastImported}
                actionText="Import"
                onAction={handleImportGuardData}
              />

              <DataItem
                title="Area Officer"
                lastDate={dataInfo.areaOfficer.lastImported}
                actionText="Import"
                onAction={handleImportAreaOfficer}
              />
            </Box>
          </Box>

          {/* Export Files Card */}
          <Box
            sx={{
              width: "1020px",
              height: "232px",
              borderRadius: "10px",
              gap: "16px",
              paddingTop: "12px",
              paddingRight: "16px",
              paddingBottom: "16px",
              paddingLeft: "16px",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Card Header */}
            <Box
              sx={{
                width: "988px",
                height: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <Typography
                sx={{
                  width: "81px",
                  height: "16px",
                  gap: "10px",
                  paddingTop: "3px",
                  paddingBottom: "3px",
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "20px",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                }}
              >
                Export Files
              </Typography>
              <Typography
                sx={{
                  width: "259px",
                  height: "16px",
                  gap: "10px",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "#A3A3A3",
                }}
              >
                Supported formats are CSV, XLS, XLSX, JSON or XML
              </Typography>
            </Box>

            {/* Export Items */}
            <Box
              sx={{
                width: "988px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                paddingTop: "16px",
              }}
            >
              <DataItem
                title="Client Data"
                lastDate={dataInfo.clientData.lastExported}
                actionText="Export"
                onAction={handleExportClientData}
                isExport={true}
              />

              <DataItem
                title="Guard Data"
                lastDate={dataInfo.guardData.lastExported}
                actionText="Export"
                onAction={handleExportGuardData}
                isExport={true}
              />

              <DataItem
                title="Area Officer"
                lastDate={dataInfo.areaOfficer.lastExported}
                actionText="Export"
                onAction={handleExportAreaOfficer}
                isExport={true}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DataWindow;
