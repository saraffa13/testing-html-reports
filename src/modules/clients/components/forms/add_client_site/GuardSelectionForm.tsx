import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Box, Button, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { BriefcaseBusiness, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  availableGuardsColumns,
  selectedGuardsColumns,
} from "../../../../../modules/clients/columns/GuardSelectionColumns";
import { useGetGuards } from "../../../apis/hooks/useGuards";
import { useGuardTypes } from "@modules/dashboard/apis/hooks/useGuardTypes";
import { useAuth } from "../../../../../hooks/useAuth";
import type { ClientSite } from "./types";

interface GuardData {
  id: string;
  companyId: string;
  photo: string;
  guardName: string;
  guardTypeId?: string;
  alertnessChallenge: boolean;
  occurrenceCount: number;
  patrolling: boolean;
}


export default function GuardSelection() {
  const [activePostIndex, setActivePostIndex] = useState<number>(0);
  const [activeShiftIndex, setActiveShiftIndex] = useState<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuardIds, setSelectedGuardIds] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const {
    data: guardTypesResponse,
  } = useGuardTypes(user?.agencyId || "");

  // Must declare useFormContext BEFORE using watch
  const { control, watch, setValue } = useFormContext<ClientSite>();

  const {
    data: guardsData,
    // isLoading: isLoadingGuards,
    // error: guardsError,
  } = useGetGuards({
    page: 1,
    limit: 100,
    userType: "GUARD",
    status: "ACTIVE",
    search: searchQuery,
    agencyId: user?.agencyId || "",
  });

  const allGuards: GuardData[] =
    guardsData?.data?.guards?.map((guard) => ({
      id: guard.guardId,
      companyId: guard.guardId,
      photo: guard.photo || "/api/placeholder/40/40",
      guardName: `${guard.firstName} ${guard.middleName || ""} ${guard.lastName}`.trim(),
      guardTypeId: guard.guardTypeId,
      alertnessChallenge: false,
      occurrenceCount: 0,
      patrolling: false,
    })) || [];

  const { fields: sitePostsFields } = useFieldArray({
    control,
    name: "sitePosts",
  });

  useEffect(() => {
    setSelectedGuardIds([]);
  }, [activePostIndex, activeShiftIndex]);

  useEffect(() => {
    setValue(
      `sitePosts.${activePostIndex}.shifts.${activeShiftIndex}.guardSelections` as any,
      selectedGuardIds.map((guardId) => ({
        guardId,
        alertnessChallenge: false,
        occurenceCount: 0,
        patrolling: false,
      }))
    );
  }, [selectedGuardIds, activePostIndex, activeShiftIndex, setValue]);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, []);

  const scrollContainer = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const switchToPost = (index: number) => {
    setActivePostIndex(index);
    setActiveShiftIndex(0);
  };

  const switchToShift = (index: number) => {
    setActiveShiftIndex(index);
  };

  const currentPost = sitePostsFields[activePostIndex];

  const dutyDays = watch(`sitePosts.${activePostIndex}.shifts.${activeShiftIndex}.days`) || [];
  const dutyStartTime = watch(`sitePosts.${activePostIndex}.shifts.${activeShiftIndex}.dutyStartTime`) || "";
  const dutyEndTime = watch(`sitePosts.${activePostIndex}.shifts.${activeShiftIndex}.dutyEndTime`) || "";
  const guardRequirements = watch(`sitePosts.${activePostIndex}.shifts.${activeShiftIndex}.guardRequirements`) || [];

  const totalGuardsRequired = guardRequirements.reduce((total, req) => total + (req.count || 0), 0);

  // Create guard type name lookup from API data
  const guardTypeNameLookup = guardTypesResponse?.data?.reduce((acc, guardType) => {
    acc[guardType.id] = guardType.typeName;
    return acc;
  }, {} as Record<string, string>) || {};

  const guardTypesSummary = guardRequirements.map((requirement) => ({
    name: guardTypeNameLookup[requirement.guardTypeId] || requirement.guardTypeId,
    count: `0/${requirement.count || 0}`,
    guardType: requirement.guardTypeId,
    required: requirement.count || 0,
  }));

  // Get selected guard type IDs from guard requirements
  const selectedGuardTypeIds = guardRequirements.map((req) => req.guardTypeId);

  // Filter guards by:
  // 1. Guard type matches one of the selected types
  // 2. Not already selected
  const availableGuards = allGuards.filter(
    (guard) =>
      !selectedGuardIds.includes(guard.id) &&
      (selectedGuardTypeIds.length === 0 || (guard.guardTypeId && selectedGuardTypeIds.includes(guard.guardTypeId)))
  );

  const selectedGuards = allGuards.filter((guard) => selectedGuardIds.includes(guard.id));

  const Sidebar = () => (
    <div className="w-40 border bg-white border-[#F0F0F0] rounded-l-lg">
      <List dense disablePadding>
        {sitePostsFields.map((post, index) => {
          const postName = watch(`sitePosts.${index}.name`) || `Site Post ${index + 1}`;
          const postGuardRequirements = watch(`sitePosts.${index}.shifts.0.guardRequirements`) || [];
          const totalRequired = postGuardRequirements.reduce((total, req) => total + (req.count || 0), 0);

          return (
            <ListItem key={post.id} disablePadding>
              <ListItemButton
                selected={activePostIndex === index}
                onClick={() => switchToPost(index)}
                sx={{
                  border: "1px solid #F0F0F0",
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "#ffffff",
                    borderColor: "#2A77D5",
                  },
                }}
              >
                <ListItemText
                  primary={postName}
                  secondary={`Required Guards ${totalRequired}`}
                  slotProps={{
                    primary: {
                      fontWeight: "bold",
                      color: "#707070",
                    },
                    secondary: { color: "#A3A3A3" },
                  }}
                />
                <ArrowForwardIosIcon sx={{ color: "#707070", fontSize: "16px" }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  const handleRemoveGuard = (guardId: string) => {
    setSelectedGuardIds((prev) => prev.filter((id) => id !== guardId));
  };

  const handleAvailableGuardsSelection = (newSelection: any) => {
    let selectedIds: string[] = [];
    if (Array.isArray(newSelection)) {
      selectedIds = newSelection.map((id) => String(id));
    } else if (newSelection && typeof newSelection === "object") {
      if ("ids" in newSelection && newSelection.ids instanceof Set) {
        selectedIds = Array.from(newSelection.ids).map((id) => String(id));
      } else if ("ids" in newSelection && Array.isArray(newSelection.ids)) {
        selectedIds = (newSelection.ids as (string | number)[]).map((id: string | number) => String(id));
      } else {
        selectedIds = Object.keys(newSelection).filter(
          (key) => key !== "type" && newSelection[key as keyof typeof newSelection]
        );
      }
    }
    // Limit selection to totalGuardsRequired
    let allSelected = [...new Set([...selectedGuardIds, ...selectedIds])];
    if (allSelected.length > totalGuardsRequired) {
      allSelected = allSelected.slice(0, totalGuardsRequired);
    }
    setSelectedGuardIds(allSelected);
  };

  const selectedGuardsColumnsWithRemove: GridColDef[] = [
    ...selectedGuardsColumns,
    {
      field: "remove",
      headerName: "Remove",
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Button color="error" size="small" onClick={() => handleRemoveGuard(params.row.id)} variant="outlined">
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-2 bg-white mt-2 rounded-xl p-6 pb-10">
        <h2 className="text-xl text-[#2A77D5] mb-2">GUARD SELECTION</h2>
        <div className="flex flex-row">
          <Sidebar />
          <div className="p-4 bg-[#F1F7FE] w-full rounded-r-lg">
            <div className="flex gap-2 mb-4">
              {currentPost?.shifts?.map((_, index) => {
                const shiftLabel = `Shift ${index + 1}`;
                return (
                  <Button
                    key={index}
                    variant="contained"
                    onClick={() => switchToShift(index)}
                    sx={{
                      bgcolor: activeShiftIndex === index ? "#2A77D5" : "white",
                      color: activeShiftIndex === index ? "white" : "#2A77D5",
                      "&:hover": {
                        bgcolor: activeShiftIndex === index ? "#1e5ba8" : "#f5f5f5",
                      },
                    }}
                  >
                    <BriefcaseBusiness
                      className={`mr-2 text-${activeShiftIndex === index ? "white" : "[#2A77D5]"}`}
                      size={16}
                    />
                    {shiftLabel}
                  </Button>
                );
              })}
            </div>
            <div className="flex flex-row my-2 justify-between">
              <div>
                <span className="text-[#A3A3A3]">Days: </span>
                {dutyDays.length > 0 ? (
                  dutyDays.map((day, index) => (
                    <span key={String(day)}>
                      {day.slice(0, 3)}
                      {index < dutyDays.length - 1 ? ", " : ""}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Not set</span>
                )}
              </div>
              <div>
                <span className="text-[#A3A3A3]">Shift Timings: </span>
                <span>{dutyStartTime && dutyEndTime ? `${dutyStartTime} - ${dutyEndTime}` : "Not set"}</span>
              </div>
              <div>
                <span className="text-[#A3A3A3]">Guards Required: </span>
                <span>{totalGuardsRequired}</span>
              </div>
              <div />
            </div>

            <div className="bg-white p-2 rounded-lg flex flex-col">
              <div className="flex items-center max-w-full mx-auto mb-2">
                <button
                  onClick={() => scrollContainer("left")}
                  type="button"
                  disabled={!canScrollLeft}
                  className={`flex-shrink-0 p-2 rounded-l-lg transition-colors ${
                    canScrollLeft
                      ? "text-[#2A77D5] hover:bg-blue-50 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto scrollbar-hide py-1 px-1 flex-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {guardTypesSummary.map((guard, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 px-2 py-1 mx-1 text-center cursor-pointer hover:bg-blue-50 rounded transition-colors min-w-max"
                    >
                      <div className="text-[#2A77D5] whitespace-nowrap">
                        {guard.name} ({guard.count})
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => scrollContainer("right")}
                  type="button"
                  disabled={!canScrollRight}
                  className={`flex-shrink-0 p-2 rounded-r-lg transition-colors ${
                    canScrollRight
                      ? "text-[#2A77D5] hover:bg-blue-50 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="flex flex-row gap-2">
                <div
                  className="bg-[#F7F7F7] p-2 rounded-lg flex flex-col gap-2"
                  style={{ minWidth: 360, maxWidth: 400 }}
                >
                  <span className="text-sm text-[#707070] font-semibold">
                    AVAILABLE GUARDS ({availableGuards.length})
                  </span>
                  <div className="relative w-auto">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[#2A77D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search Guards"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-gray-700 bg-white border-2 border-blue-100 rounded-lg 
                         placeholder-gray-400 focus:outline-none focus:border-[#C2DBFA] hover:border-blue-200 
                         transition-colors duration-200 text-base"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                          }
                        }}
                      />
                    </div>
                  </div>
                  <Box sx={{ display: "inline-block", width: 360, maxWidth: 400 }}>
                    <DataGrid
                      rows={availableGuards}
                      columns={availableGuardsColumns}
                      hideFooter={true}
                      hideFooterSelectedRowCount
                      checkboxSelection
                      onRowSelectionModelChange={handleAvailableGuardsSelection}
                      isRowSelectable={(params) =>
                        selectedGuardIds.length < totalGuardsRequired || selectedGuardIds.includes(params.row.id)
                      }
                      sx={{
                        width: 360,
                        maxWidth: 400,
                        ".MuiDataGrid-columnHeaders": {
                          backgroundColor: "#f5f5f5",
                        },
                        border: 0,
                      }}
                      slots={{
                        noRowsOverlay: () => (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            {searchQuery ? "No guards found matching your search" : "No guards available"}
                          </div>
                        ),
                      }}
                    />
                  </Box>
                </div>
                <div className="flex flex-col gap-2 p-2">
                  <span className="text-sm text-[#707070] font-semibold">
                    SELECTED GUARDS ({selectedGuards.length}/{totalGuardsRequired})
                  </span>
                  <Box sx={{ display: "inline-block", maxHeight: 350, overflow: "auto" }}>
                    <DataGrid
                      rows={selectedGuards}
                      columns={selectedGuardsColumnsWithRemove}
                      hideFooter={true}
                      initialState={{
                        pagination: {
                          paginationModel: {
                            pageSize: 5,
                          },
                        },
                      }}
                      hideFooterSelectedRowCount
                      disableRowSelectionOnClick
                      sx={{
                        ".MuiDataGrid-columnHeaders": {
                          backgroundColor: "#f5f5f5",
                          whiteSpace: "break-spaces",
                        },
                      }}
                      slots={{
                        noRowsOverlay: () => (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No guards selected
                          </div>
                        ),
                      }}
                    />
                  </Box>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
