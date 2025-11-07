import { useGetFieldTasksByClientId } from "@modules/clients/apis/hooks/useFieldTasks";
import { useGetClientSites } from "@modules/clients/apis/hooks/useGetClientSites";
import { useGetGuards } from "@modules/clients/apis/hooks/useGuards";
import TaskNoteModal from "@modules/clients/components/modals/TaskNoteModal";
import { datagridStyle } from "@modules/clients/lib/datagridStyle";
import { Avatar, Box } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

const guardDetailsColumns: GridColDef[] = [
  {
    field: "guardName",
    headerName: "GUARD NAME",
    minWidth: 140,
    align: "left",
    headerAlign: "left",
    renderCell: (params) => (
      <div className="flex w-full h-full items-center gap-2">
        <Avatar
          src={params.row.guardPhoto}
          alt={params.value}
          sx={{
            width: 32,
            height: 32,
            border: "1px solid #e0e0e0",
          }}
        />
        <span className="text-sm">{params.value}</span>
      </div>
    ),
  },
  {
    field: "assignedBy",
    headerName: "ASSIGNED BY",
    width: 120,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "taskTime",
    headerName: "TASK TIME",
    width: 100,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => (
      <div className="flex flex-col w-full h-full">
        <span className="text-xs">{params.row.taskDate}</span>
        <span className="text-xs">{params.value}</span>
      </div>
    ),
  },
  {
    field: "note",
    headerName: "NOTE",
    width: 60,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
      const [modalVisible, setModalVisible] = useState<boolean>(false);
      return (
        <div>
          <button onClick={() => setModalVisible(true)} className="bg-white rounded-full text-[#2A77D5] shadow-lg p-1">
            <SquarePen size={16} />
          </button>
          <TaskNoteModal
            open={modalVisible}
            onClose={() => setModalVisible(false)}
            viewMode="task"
            guardData={params.row.guardData}
            taskData={params.row.taskData}
          />
        </div>
      );
    },
  },
];

const guardTasksColumns: GridColDef[] = [
  {
    field: "siteId",
    headerName: "SITE ID",
    width: 80,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => <span style={{ fontSize: "14px", fontWeight: 500 }}>{params.value}</span>,
  },
  {
    field: "siteName",
    headerName: "SITE NAME",
    flex: 1,
    minWidth: 150,
    align: "left",
    headerAlign: "left",
    renderCell: (params) => <span style={{ fontSize: "14px", fontWeight: 500 }}>{params.value}</span>,
  },
  {
    field: "tasks",
    headerName: "TASKS",
    width: 80,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => (
      <span style={{ fontSize: "14px", fontWeight: 500 }}>{String(params.value).padStart(2, "0")}</span>
    ),
  },
];

export default function GuardsTasks() {
  const { clientId } = useParams();
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const agencyId = user.agencyId || "";

  const { data: sitesData, isLoading: isLoadingSites } = useGetClientSites(clientId || "");
  const sites = sitesData?.data || [];

  const { data: guardsData, isLoading: isLoadingGuards } = useGetGuards({
    agencyId,
    limit: 1000,
  });
  const guards = guardsData?.data?.guards || [];

  const { data: fieldTasksData, isLoading: isLoadingTasks } = useGetFieldTasksByClientId(
    clientId || "",
    selectedSiteId || undefined,
    {
      limit: 1000,
      sortOrder: "desc",
    }
  );

  const fieldTasks = fieldTasksData?.data?.data || [];

  const siteTaskCounts = sites
    .map((site: any) => {
      const siteTasks = fieldTasks.filter((task: any) => task.siteId === site.id);
      return {
        id: site.id,
        siteId: site.id,
        siteName: site.siteName,
        tasks: siteTasks.length,
      };
    })
    .filter((site: any) => site.tasks > 0);

  const selectedSiteTasks = selectedSiteId ? fieldTasks.filter((task: any) => task.siteId === selectedSiteId) : [];

  const guardDetailsData = selectedSiteTasks.map((task: any, index: number) => {
    const guard = guards.find((g: any) => g.guardId === task.guardId);
    const site = sites.find((s: any) => s.id === task.siteId);
    const taskDate = new Date(task.createdAt);

    const guardData = {
      id: task.guardId,
      name: (guard as any)?.name || (guard as any)?.guardName || `Guard ${task.guardId}`,
      photo: guard?.photo || "/guards/default.jpg",
      phoneNumber: (guard as any)?.phoneNumber || (guard as any)?.phone || "N/A",
      designation: "Security Guard",
      client: "N/A",
      site: site?.siteName || "Unknown Site",
      post: "N/A",
      shift: "N/A",
      reportingOfficer: "N/A",
      reportingOfficerPhone: "N/A",
    };

    const taskData = {
      assignedBy: task.assignedBy === "CLIENT" ? "Client" : "Area Officer",
      date: taskDate.toLocaleDateString("en-GB"),
      time: taskDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      status: task.status || "PENDING",
      note: task.note || "",
    };

    return {
      id: index + 1,
      guardName: guardData.name,
      guardPhoto: guardData.photo,
      assignedBy: taskData.assignedBy,
      taskTime: taskData.time,
      taskDate: taskData.date,
      taskId: task.id,
      note: task.note,
      guardData: guardData,
      taskData: taskData,
    };
  });

  if (isLoadingSites || isLoadingGuards || isLoadingTasks) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex flex-row w-full gap-2">
      <div className="bg-white my-2 p-2 rounded-lg flex flex-col gap-2 w-1/2 items-center">
        <h2 className="font-semibold text-sm">GUARDS : TASKS</h2>
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            minHeight: 300,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DataGrid
            rows={siteTaskCounts}
            columns={guardTasksColumns}
            hideFooter={true}
            onRowClick={(params) => {
              setSelectedSiteId(params.row.siteId);
            }}
            disableColumnMenu
            disableMultipleRowSelection={true}
            sx={datagridStyle}
          />
        </Box>
      </div>
      <div className="bg-white my-2 p-2 rounded-lg flex flex-col gap-2 w-1/2 border-l border-gray-200 items-center">
        <h2 className="font-semibold text-sm">DETAILS</h2>
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            minHeight: 300,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DataGrid
            rows={guardDetailsData}
            columns={guardDetailsColumns}
            hideFooter={true}
            disableColumnMenu
            disableRowSelectionOnClick
            sx={datagridStyle}
          />
        </Box>
      </div>
    </div>
  );
}
