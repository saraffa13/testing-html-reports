
import type React from "react"
import { Box } from "@mui/material"

interface PageLayoutProps {
  children: React.ReactNode
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div
      className="flex items-center justify-center min-h-screen w-full relative overflow-hidden"
      style={{ 
        background: "var(--Blue-200, #C2DBFA)",
        maxWidth: "100vw",
        height: "min(1028px, 100vh)",
      }}
    >
      {/* Star SVG Background - Increased visibility */}
      <div
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1162px] h-[1214px] bg-[url('/star.svg')] bg-no-repeat bg-contain pointer-events-none"
        style={{
          filter: "blur(2px)", 
          zIndex: 1,
          opacity: 1, 
        }}
      />

      {/* White Background Container - With subtle border */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: "calc(100% - 24px)",
          height: "calc(100vh - 24px)",
          maxHeight: "calc(100% - 24px)",
          margin: "12px",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.64)",
          backdropFilter: "blur(3px)",  
          overflow: "hidden",
          boxShadow: "none", 
          outline: "none",
        }}
      >
        {/* Main Content Area */}
        <div
          className="relative z-20 flex flex-col items-center justify-center"
          style={{ width: "512px", gap: "40px" }}
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-2" style={{ width: "160px", gap: "8px" }}>
            <div className="flex flex-col items-center justify-center">
              {/* Logo Icon */}
              <div className="w-[56px] h-[99px] flex items-center justify-center text-blue-500">
                <img src="/logo.svg" alt="UpAndUp.Life Logo" className="w-full h-full object-contain" />
              </div>

              {/* Logo Type */}
              <div className="mt-1 w-[160px] h-[29px] p-4.67px">
                <img src="/LogoType_Blue.svg" alt="UpAndUp.Life" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Card Container */}
          <Box
            sx={{
              width: "512px",
              height: "472px",
              borderRadius: "32px",
              padding: "56px",
              background: "rgba(255, 255, 255, 0.64)",
              boxShadow: "0px 2px 4px 2px rgba(112, 112, 112, 0.07)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Inner Frame */}
            <Box
              sx={{
                width: "400px",
                height: "360px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "56px",
                borderRadius: "32px",
              }}
            >
              {children}
            </Box>
          </Box>
        </div>
      </div>
    </div>
  )
}

export default PageLayout