import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import DocsIcon from "@mui/icons-material/Description";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import FrameInspectIcon from "@mui/icons-material/Visibility"; // Using Visibility as FrameInspect doesn't exist
import { Box, Typography } from "@mui/material";
import React from "react";

interface TaskSelectionData {
  selectedTasks: string[];
}

interface TaskSelectionFormProps {
  data: TaskSelectionData;
  onUpdate: (data: Partial<TaskSelectionData>) => void;
}

const TaskSelectionForm: React.FC<TaskSelectionFormProps> = ({ data, onUpdate }) => {
  const taskTypes = [
    { id: "site_visit", name: "Site Visit", icon: HomeWorkIcon },
    { id: "inspection", name: "Inspection", icon: FrameInspectIcon },
    { id: "documents", name: "Document", icon: DocsIcon },
    { id: "training", name: "Training", icon: MilitaryTechIcon },
    { id: "other", name: "Other", icon: DashboardCustomizeIcon },
  ];

  const handleTaskSelect = (taskId: string) => {
    const selectedTasks = data.selectedTasks.includes(taskId)
      ? data.selectedTasks.filter((id) => id !== taskId)
      : [...data.selectedTasks, taskId];

    onUpdate({ selectedTasks });
  };

  return (
    <Box
      sx={{
        width: "1136px",
        height: "552px",
        padding: "24px",
        gap: "24px",
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Title */}
      <Typography
        variant="h1"
        sx={{
          fontFamily: "Mukta",
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "32px",
          color: "#2A77D5",
          textTransform: "capitalize",
          mb: 3,
        }}
      >
        TASK SELECTION
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Label */}
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 500,
            fontSize: "16px",
            color: "#707070",
            textTransform: "capitalize",
          }}
        >
          Select Multiple If Required
        </Typography>

        {/* Task Types Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
            gap: "16px",
            maxWidth: "100%",
          }}
        >
          {taskTypes.map((task) => {
            const IconComponent = task.icon;
            const isSelected = data.selectedTasks.includes(task.id);

            return (
              <Box
                key={task.id}
                onClick={() => handleTaskSelect(task.id)}
                sx={{
                  width: "112px",
                  height: "90px",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: isSelected ? "#E3F0FF" : "#FFFFFF",
                  border: isSelected ? "2px solid #2A77D5" : "none",
                  boxShadow: "0px 1px 4px 0px #70707033",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: isSelected ? "#E3F0FF" : "#F5F5F5",
                  },
                }}
              >
                <IconComponent
                  sx={{
                    width: "32px",
                    height: "32px",
                    color: "#2A77D5",
                    mb: 1,
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Mukta",
                    fontWeight: 500,
                    fontSize: "14px",
                    textAlign: "center",
                    textTransform: "uppercase",
                    color: "#3B3B3B",
                  }}
                >
                  {task.name}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default TaskSelectionForm;
