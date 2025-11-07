import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { CircularProgress, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Task, TasksApiResponse } from "../../clients/apis/services/tasks";
import { useAreaOfficerTasks } from "../apis/hooks/useDashboard";

interface AreaOfficersTasksViewProps {
  opAgencyId: string;
  areaOfficerTasksData?: TasksApiResponse;
  isLoading?: boolean;
  error?: Error | null;
}

export default function AreaOfficersTasksView({
  opAgencyId,
  areaOfficerTasksData,
  isLoading: propIsLoading,
  error: propError,
}: AreaOfficersTasksViewProps) {
  const [activeTab, setActiveTab] = useState<"overdue" | "pending" | "done">("overdue");
  const navigate = useNavigate();

  // Only use hook as fallback if no props data is provided
  const {
    data: hookData,
    isLoading: hookIsLoading,
    error: hookError,
  } = useAreaOfficerTasks({
    opAgencyId,
    page: 1,
    limit: 50,
  });

  // Prioritize props data - use hook data only if props data is undefined/null
  const data = areaOfficerTasksData !== undefined ? areaOfficerTasksData : hookData;
  const isLoading = propIsLoading !== undefined ? propIsLoading : hookIsLoading;
  const error = propError !== undefined ? propError : hookError;


  const tasks = data?.data?.tasks || [];
  const now = new Date();


  // Type guard function to check if an object is a valid Task
  const isValidTask = (task: any): task is Task => {
    return (
      task &&
      typeof task === "object" &&
      typeof task.id === "string" &&
      typeof task.areaOfficerId === "string" &&
      task.client &&
      typeof task.client === "object" &&
      typeof task.client.clientName === "string" &&
      task.site &&
      typeof task.site === "object" &&
      typeof task.site.siteName === "string" &&
      "taskStatus" in task &&
      "deadline" in task
    );
  };

  // Filter out invalid tasks from both count and display
  const overdueTasks = useMemo(
    () =>
      tasks.filter((task: any): task is Task => {
        return (
          isValidTask(task) &&
          (task.taskStatus === "PENDING" || task.taskStatus === "INPROGRESS") &&
          new Date(task.deadline) < now
        );
      }),
    [tasks, now]
  );

  const pendingTasks = useMemo(
    () =>
      tasks.filter((task: any): task is Task => {
        return (
          isValidTask(task) &&
          (task.taskStatus === "PENDING" || task.taskStatus === "INPROGRESS") &&
          new Date(task.deadline) >= now
        );
      }),
    [tasks, now]
  );

  const doneTasks = useMemo(
    () =>
      tasks.filter((task: any): task is Task => {
        return isValidTask(task) && task.taskStatus === "COMPLETED";
      }),
    [tasks]
  );

  const overdueCount = overdueTasks.length;
  const pendingCount = pendingTasks.length;
  const doneCount = doneTasks.length;


  const getCurrentData = () => {
    switch (activeTab) {
      case "overdue":
        return overdueTasks;
      case "pending":
        return pendingTasks;
      case "done":
        return doneTasks;
      default:
        return overdueTasks;
    }
  };

  // Enhanced task click handler - Navigate to dashboard specific route
  const handleTaskClick = (task: Task) => {
    console.log("🔍 Dashboard Task clicked:", {
      taskId: task.id,
      areaOfficerId: task.areaOfficerId,
      clientName: task.client?.clientName,
      siteName: task.site?.siteName,
      status: task.taskStatus,
      deadline: task.deadline,
    });

    // Validate task ID before navigation
    if (!task.id || task.id.trim() === "") {
      console.error("❌ Invalid task ID:", task.id);
      alert("Error: Invalid task ID. Cannot open task details.");
      return;
    }

    // Navigate to dashboard-specific task details route
    console.log(`➡️ Navigating to dashboard task details: /dashboard/tasks/${task.id}/details`);
    navigate(`/dashboard/tasks/${task.id}/details`);
  };

  const getActionIcons = (task: Task, tabStatus: string) => {
    const isOverdue =
      (task.taskStatus === "PENDING" || task.taskStatus === "INPROGRESS") && new Date(task.deadline) < new Date();
    if (tabStatus === "overdue" || isOverdue) {
      return (
        <div className="flex justify-center gap-4">
          <button>
            <HomeOutlinedIcon sx={{ color: "#2A77D5" }} />
          </button>
          <button>
            <PersonOutlinedIcon sx={{ color: "#2A77D5" }} />
          </button>
          <button>
            <ReceiptOutlinedIcon sx={{ color: "#2A77D5" }} />
          </button>
        </div>
      );
    }
    if (tabStatus === "pending") {
      return (
        <div className="flex justify-center gap-4">
          <button>
            <HomeOutlinedIcon sx={{ color: "#2A77D5" }} />
          </button>
          <button>
            <PersonOutlinedIcon sx={{ color: "#2A77D5" }} />
          </button>
          <button>
            <ReceiptOutlinedIcon sx={{ color: "#2A77D5" }} />
          </button>
        </div>
      );
    }
    if (tabStatus === "done") {
      return (
        <div className="flex justify-center gap-4">
          <button>
            <CheckCircleIcon sx={{ color: "#2A77D5" }} />
          </button>
          <button>
            <ReceiptOutlinedIcon sx={{ color: "#2A77D5" }} />
          </button>
        </div>
      );
    }
    return (
      <div className="flex justify-center gap-4">
        <button>
          <HomeOutlinedIcon sx={{ color: "#2A77D5" }} />
        </button>
        <button>
          <PersonOutlinedIcon sx={{ color: "#2A77D5" }} />
        </button>
      </div>
    );
  };

  const currentData = getCurrentData();

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading tasks...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Typography color="error">Error loading tasks</Typography>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col p-6 rounded-lg h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">AREA OFFICERS TASKS</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search List"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab("overdue")}
          className={`flex flex-row items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors min-w-[120px] justify-center ${
            activeTab === "overdue" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          <WarningAmberOutlinedIcon fontSize="small" />
          OVERDUE ({overdueCount.toString().padStart(2, "0")})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex flex-row items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors min-w-[120px] justify-center ${
            activeTab === "pending" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          <HistoryToggleOffIcon fontSize="small" />
          PENDING ({pendingCount.toString().padStart(2, "0")})
        </button>
        <button
          onClick={() => setActiveTab("done")}
          className={`flex flex-row items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors min-w-[120px] justify-center ${
            activeTab === "done" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          <CheckCircleIcon fontSize="small" />
          DONE ({doneCount.toString().padStart(2, "0")})
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-gray-50 rounded-t-lg border-b">
          <div className="text-gray-600 font-semibold text-sm">TASK ID</div>
          <div className="text-gray-600 font-semibold text-sm">NAME</div>
          <div className="text-gray-600 font-semibold text-sm">CLIENT NAME</div>
          <div className="text-gray-600 font-semibold text-sm">SITE NAME</div>
          <div className="text-gray-600 font-semibold text-sm">DUE ON</div>
          <div className="text-gray-600 font-semibold text-sm">ASSIGNED BY</div>
        </div>
        <div className="flex flex-col gap-3 mt-2">
          {currentData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No {activeTab} tasks found</div>
          ) : (
            currentData.map((task, index) => {
              // Only display valid tasks (invalid tasks are already filtered out from currentData)
              if (isValidTask(task)) {
                return (
                  <div
                    key={`task-${index}`}
                    onClick={() => handleTaskClick(task)}
                    className="border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="grid grid-cols-6 gap-4 px-4 py-3 items-center">
                      <div className="text-gray-800 font-medium" title={`Full ID: ${task.id}`}>
                        {task.id.slice(-6)}
                      </div>
                      <div className="text-gray-800 font-medium">{task.areaOfficerId}</div>
                      <div className="text-gray-800 font-medium">{task.client.clientName}</div>
                      <div className="text-gray-800 font-medium">{task.site.siteName}</div>
                      <div className="text-gray-800 font-medium">
                        <div>{new Date(task.deadline).toLocaleDateString("en-GB")}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(task.deadline).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      </div>
                      <div className="text-gray-800 font-medium">{task.areaOfficerId}</div>
                    </div>
                    <div className="bg-blue-50 px-4 py-3 border-t border-gray-200">
                      {getActionIcons(task, activeTab)}
                    </div>
                  </div>
                );
              }
              return null;
            })
          )}
        </div>
      </div>
    </div>
  );
}
