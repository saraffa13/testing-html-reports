import { StickyNote2 as NoteIcon } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import { type Task } from "./incident-tasks-types";
import NoteOverlay from "./NoteOverlay";

interface TasksProps {
  tasks: Task[];
  width?: string | number;
  height?: string | number;
}

/**
 * Tasks component that displays guard tasks
 */
const TasksComponent: React.FC<TasksProps> = ({ tasks, width = "502px", height = "676px" }) => {
  const [noteOverlayOpen, setNoteOverlayOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleNoteClick = (task: Task) => {
    setSelectedTask(task);
    setNoteOverlayOpen(true);
  };

  const handleCloseNoteOverlay = () => {
    setNoteOverlayOpen(false);
    setSelectedTask(null);
  };

  return (
    <Box
      sx={{
        width: width,
        height: height,
        borderRadius: "10px",
        padding: "16px",
        gap: "16px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Heading */}
      <Box
        sx={{
          width: "470px",
          height: "16px",
          backdropFilter: "blur(4px)",
        }}
      >
        <Typography
          sx={{
            width: "44px",
            height: "16px",
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "20px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            paddingTop: "3px",
            paddingBottom: "3px",
          }}
        >
          TASKS
        </Typography>
      </Box>

      {/* Content */}
      {tasks.length > 0 ? (
        <Box
          sx={{
            width: "470px",
            height: "600px",
            gap: "12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Table Header */}
          <Box
            sx={{
              width: "470px",
              height: "16px",
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
                width: "150px",
                height: "16px",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "16px",
                textTransform: "capitalize",
                color: "#3B3B3B",
                paddingTop: "4px",
                paddingBottom: "4px",
              }}
            >
              ASSIGNED BY
            </Typography>
            <Typography
              sx={{
                width: "150px",
                height: "16px",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "16px",
                textTransform: "capitalize",
                color: "#3B3B3B",
                paddingTop: "4px",
                paddingBottom: "4px",
              }}
            >
              TASK TIME
            </Typography>
            <Typography
              sx={{
                width: "88px",
                height: "16px",
                fontFamily: "Mukta",
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "16px",
                textTransform: "capitalize",
                color: "#3B3B3B",
                paddingTop: "4px",
                paddingBottom: "4px",
              }}
            >
              NOTE
            </Typography>
          </Box>

          {/* Scroll Window */}
          <Box
            sx={{
              width: "470px",
              height: "572px",
              gap: "8px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Table Content */}
            <Box
              sx={{
                width: "470px",
                height: "572px",
                overflowY: "auto",
                paddingRight: "8px",
                "&::-webkit-scrollbar": {
                  width: "12px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#F0F0F0",
                  borderRadius: "40px",
                  marginRight: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#D9D9D9",
                  borderRadius: "20px",
                  marginRight: "8px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#CCCCCC",
                },
              }}
            >
              <Box
                sx={{
                  width: "450px",
                  gap: "16px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {tasks.map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      width: "450px",
                      minHeight: "56px",
                      borderRadius: "10px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #F0F0F0",
                      boxShadow: "0px 1px 4px 0px #70707033",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      paddingRight: "16px",
                      paddingLeft: "16px",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#F9F9F9",
                        transform: "translateY(-1px)",
                        boxShadow: "0px 4px 8px 0px #70707033",
                      },
                    }}
                  >
                    {/* Priority Indicator */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "4px",
                        borderTopLeftRadius: "10px",
                        borderBottomLeftRadius: "10px",
                      }}
                    />

                    {/* Assigned By */}
                    <Box
                      sx={{
                        width: "150px",
                        minHeight: "40px",
                        display: "flex",
                        alignItems: "center",
                        marginLeft: "8px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Mukta",
                          fontWeight: 400,
                          fontSize: "14px",
                          lineHeight: "18px",
                          color: "#3B3B3B",
                        }}
                      >
                        {task.assignedBy}
                      </Typography>
                    </Box>

                    {/* Task Time */}
                    <Box
                      sx={{
                        width: "150px",
                        minHeight: "40px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Mukta",
                          fontWeight: 400,
                          fontSize: "12px",
                          lineHeight: "16px",
                          color: "#3B3B3B",
                        }}
                      >
                        {task.taskTime}
                      </Typography>
                    </Box>

                    {/* Note */}
                    <Box
                      sx={{
                        width: "88px",
                        minHeight: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        onClick={() => handleNoteClick(task)}
                        disabled={!task.note}
                        sx={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          backgroundColor: task.note ? "#2A77D5" : "#F0F0F0",
                          color: task.note ? "#FFFFFF" : "#CCCCCC",
                          "&:hover": {
                            backgroundColor: task.note ? "#2364B6" : "#F0F0F0",
                          },
                          "&:disabled": {
                            opacity: 0.5,
                          },
                        }}
                      >
                        <NoteIcon sx={{ width: 20, height: 20 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        // Empty State
        <Box
          sx={{
            width: "450px",
            height: "600px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          {/* Empty State Icon */}
          <Box
            sx={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#F0F0F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "32px",
                color: "#CCCCCC",
              }}
            >
              ✓
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "16px",
              color: "#CCCCCC",
              textAlign: "center",
            }}
          >
            NO TASKS
          </Typography>
        </Box>
      )}

      {/* Note Overlay Modal */}
      {selectedTask && (
        <NoteOverlay
          open={noteOverlayOpen}
          onClose={handleCloseNoteOverlay}
          note={selectedTask.note || ""}
          taskId={selectedTask.id}
          assignedBy={selectedTask.assignedBy}
          taskTime={selectedTask.taskTime}
        />
      )}
    </Box>
  );
};

export default TasksComponent;
