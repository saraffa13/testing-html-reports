import { Box, Typography } from "@mui/material";
import React from "react";
import type { PatrolError } from "./defaults-types";

interface PatrolContentProps {
  errors: PatrolError[];
}

/**
 * Content component for patrol defaults
 */
const PatrolContent: React.FC<PatrolContentProps> = ({ errors }) => {
  return (
    <Box
      sx={{
        width: "470px",
        height: "242px",
        gap: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Table Head */}
      <Box
        sx={{
          width: "470px",
          height: "32px",
          borderRadius: "8px",
          gap: "8px",
          paddingRight: "8px",
          paddingLeft: "8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            width: "72px",
            height: "32px",
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            paddingTop: "4px",
            paddingBottom: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          START TIME
        </Typography>
        <Typography
          sx={{
            width: "72px",
            height: "32px",
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            paddingTop: "4px",
            paddingBottom: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          PATROL ROUTE
        </Typography>
        <Typography
          sx={{
            width: "72px",
            height: "32px",
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            paddingTop: "4px",
            paddingBottom: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          PATROL ROUND
        </Typography>
        <Typography
          sx={{
            width: "72px",
            height: "32px",
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            paddingTop: "4px",
            paddingBottom: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          CHECK POINT
        </Typography>
        <Typography
          sx={{
            width: "112px",
            height: "32px",
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            paddingTop: "4px",
            paddingBottom: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          ERROR
        </Typography>
      </Box>

      {/* Table Contents */}
      <Box
        sx={{
          width: "470px",
          height: "200px",
          gap: "10px",
          maxHeight: "200px",
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
            width: "470px",
            gap: "10px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {errors.map((error) => (
            <Box
              key={error.id}
              sx={{
                width: "448px",
                height: "56px",
                borderRadius: "8px",
                gap: "8px",
                border: "2px solid #F0F0F0",
                boxShadow: "0px 2px 4px 2px #70707012",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                paddingLeft: "8px",
                paddingRight: "8px",
              }}
            >
              {/* Start Time */}
              <Box
                sx={{
                  width: "72px",
                  height: "16px",
                  gap: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#3B3B3B",
                  }}
                >
                  {error.startTime}
                </Typography>
              </Box>

              {/* Route */}
              <Box
                sx={{
                  width: "72px",
                  height: "16px",
                  gap: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#3B3B3B",
                  }}
                >
                  {error.patrolRoute}
                </Typography>
              </Box>

              {/* Patrol Round */}
              <Box
                sx={{
                  width: "72px",
                  height: "16px",
                  gap: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#3B3B3B",
                  }}
                >
                  {error.patrolRound}
                </Typography>
              </Box>

              {/* Checkpoint */}
              <Box
                sx={{
                  width: "72px",
                  height: "16px",
                  gap: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#3B3B3B",
                  }}
                >
                  {error.checkPoint}
                </Typography>
              </Box>

              {/* Error */}
              <Box
                sx={{
                  width: "112px",
                  height: "16px",
                  gap: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#3B3B3B",
                  }}
                >
                  {error.error}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PatrolContent;
