import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { CircularProgress, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetTasksByClientId } from "../../apis/hooks/useClientTasks";
import type { Task } from "../../apis/services/tasks";
import { useClientContext } from "../../context/ClientContext";
import { useAuth } from "../../../../hooks/useAuth";

export default function AreaOfficersTasks() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overdue" | "pending" | "done">("pending");
  const { clientId, siteId } = useParams();
  const { selectedSite } = useClientContext();

  // Fetch tasks using the API
  const {
    data: tasksResponse,
    isLoading,
    error,
  } = useGetTasksByClientId(
    user?.agencyId || "",
    clientId || "",
    selectedSite !== "ALL SITES" ? selectedSite : undefined
  );

  const tasks = tasksResponse?.data?.tasks || [];

  // Filter and transform tasks based on status and deadline
  const transformedTasks = useMemo(() => {
    const now = new Date();

    return tasks.map((task: Task) => {
      const deadline = new Date(task.deadline);
      const createdAt = new Date(task.createdAt);

      // Determine if task is overdue - compare deadline with current time
      const isOverdue = deadline < now && task.taskStatus !== "COMPLETED";

      return {
        id: task.id.slice(-6), // Show last 6 characters like in the original
        siteId: task.siteId.slice(-6), // Show last 6 characters of siteId
        clientName: task.client.clientName,
        siteName: task.site.siteName,
        areaOfficerId: task.areaOfficerId,
        time: createdAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        date: createdAt.toLocaleDateString("en-GB"),
        deadline: deadline.toLocaleDateString("en-GB"),
        deadlineTime: deadline.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        taskStatus: task.taskStatus,
        isOverdue,
        originalId: task.id,
      };
    });
  }, [tasks]);

  // Filter tasks by current active tab
  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case "overdue":
        return transformedTasks.filter((task) => task.isOverdue);
      case "pending":
        // Include both PENDING and INPROGRESS tasks that are not overdue
        return transformedTasks.filter(
          (task) => (task.taskStatus === "PENDING" || task.taskStatus === "INPROGRESS") && !task.isOverdue
        );
      case "done":
        return transformedTasks.filter((task) => task.taskStatus === "COMPLETED");
      default:
        return transformedTasks;
    }
  }, [transformedTasks, activeTab]);

  // Calculate counts for each tab
  const counts = useMemo(() => {
    const overdue = transformedTasks.filter((task) => task.isOverdue).length;
    // Count both PENDING and INPROGRESS as pending
    const pending = transformedTasks.filter(
      (task) => (task.taskStatus === "PENDING" || task.taskStatus === "INPROGRESS") && !task.isOverdue
    ).length;
    const done = transformedTasks.filter((task) => task.taskStatus === "COMPLETED").length;

    return { overdue, pending, done };
  }, [transformedTasks]);

  if (isLoading) {
    return (
      <div className="pt-4">
        <div className="bg-white flex flex-col p-4 rounded-lg items-center gap-4">
          <CircularProgress />
          <Typography>Loading tasks...</Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4">
        <div className="bg-white flex flex-col p-4 rounded-lg items-center gap-4">
          <Typography color="error">Error loading tasks</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="bg-white flex flex-col p-4 rounded-lg items-center gap-4">
        <h2 className="font-semibold">AREA OFFICERS : TASKS</h2>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("overdue")}
            className={`flex flex-row items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors w-[12vw] h-fit justify-center ${
              activeTab === "overdue" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <ReportProblemOutlinedIcon />
            overdue ({counts.overdue.toString().padStart(2, "0")})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex flex-row items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors w-[12vw] h-fit justify-center ${
              activeTab === "pending" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <CheckCircleIcon />
            pending ({counts.pending.toString().padStart(2, "0")})
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={`flex flex-row items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors w-[12vw] h-fit justify-center ${
              activeTab === "done" ? "bg-[#2A77D5] text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <CheckCircleIcon />
            done ({counts.done.toString().padStart(2, "0")})
          </button>
        </div>
        <div className="overflow-hidden whitespace-nowrap text-left w-[36vw]">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-2 py-2">
            <div className="text-gray-600 font-medium text-sm">SITE ID</div>
            <div className="text-gray-600 font-medium text-sm">SITE NAME</div>
            <div className="text-gray-600 font-medium text-sm">DUE BY</div>
            <div className="text-gray-600 font-medium text-sm">ASSIGNED BY</div>
          </div>
          <div className="flex flex-col gap-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No {activeTab} tasks found</div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.originalId}
                  className={`bg-white border rounded-lg shadow-sm ${
                    task.isOverdue ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                >
                  {/* Table Data Row */}
                  <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-2 py-2 bg-white items-center">
                    <div className={`font-medium ${task.isOverdue ? "text-red-800" : "text-gray-800"}`}>
                      {task.siteId}
                    </div>
                    <a href={`/clients/${clientId}/performance/area-officers-tasks/${siteId}`}>
                      <div className={`font-medium ${task.isOverdue ? "text-red-800" : "text-gray-800"}`}>
                        {task.siteName}
                      </div>
                    </a>
                    <div className={`font-medium ${task.isOverdue ? "text-red-800" : "text-gray-800"}`}>
                      <div>{task.deadline}</div>
                      <div className={task.isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}>
                        {task.deadlineTime}
                      </div>
                    </div>
                    <div className={`font-medium ${task.isOverdue ? "text-red-800" : "text-gray-800"}`}>
                      {task.areaOfficerId}
                    </div>
                  </div>

                  {/* Action Icons Row */}
                  <div className="bg-blue-50 px-6 py-2 border-t border-gray-200">
                    <div className="flex justify-center gap-4">
                      <button className="">
                        <LocalFireDepartmentOutlinedIcon sx={{ color: "#2A77D5" }} />
                      </button>
                      <button className="">
                        <HomeOutlinedIcon sx={{ color: "#2A77D5" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
