import LabeledDropdown from "@components/LabeledDropdown";
import LabeledInput from "@components/LabeledInput";
import { useClientSiteUpdate } from "@modules/clients/apis/hooks/useClientSiteUpdate";
import { useGuardRequirementUpdate } from "@modules/clients/apis/hooks/useGuardRequirementUpdate";
import { useGetAreaOfficers, useGetGuards } from "@modules/clients/apis/hooks/useGuards";
import { usePatchGuardSelection } from "@modules/clients/apis/hooks/usePatchGuardSelection";
import { useReplaceGuard } from "@modules/clients/apis/hooks/useReplaceGuard";
import { usePostUpdate } from "@modules/clients/apis/hooks/usePostUpdate";
import { useShiftUpdate } from "@modules/clients/apis/hooks/useShiftUpdate";
import { useGuardTypes } from "@modules/dashboard/apis/hooks/useGuardTypes";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { BriefcaseBusiness, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import {
  availableGuardsColumns,
  getSelectedGuardsColumnsWithActions,
} from "../../../../modules/clients/columns/GuardSelectionUpdateColumns";
import { DaysOfWeek } from "../../types";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffffff",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  maxHeight: "95vh",
  overflow: "auto",
  width: "90vw",
  maxWidth: "1200px",
};
const guardsStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffffff",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  maxHeight: "95vh",
  overflow: "auto",
  width: "90vw",
};


interface GuardData {
  id: string;
  companyId: string;
  photo: string;
  guardName: string;
  guardTypeId?: string;
  guardSelectionId?: string;
  alertnessChallenge: boolean;
  occurrenceCount: number;
  patrolling: boolean;
}

// Basic Details Modal
export const BasicDetailsModal = ({ open, onClose, siteData }: any) => {
  const { siteId } = useParams();
  const { mutate: updateSite, isPending, error, isSuccess } = useClientSiteUpdate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      siteName: siteData?.siteName || "",
      siteType: siteData?.siteType || [],
    },
  });
  useEffect(() => {
    if (open && siteData) reset({ siteName: siteData.siteName || "", siteType: siteData.siteType || [] });
  }, [open, siteData, reset]);
  useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess, onClose]);
  const onSubmit = (data: any) => {
    if (!siteId) return;
    updateSite({ siteId, data });
  };
  const handleClose = () => {
    reset();
    onClose();
  };
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Update Basic Details</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" type="button">
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update site details. Please try again.
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Divider />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <LabeledInput
                label="Site Name"
                name="siteName"
                required
                register={register}
                error={!!errors.siteName}
                helperText={typeof errors.siteName?.message === "string" ? errors.siteName?.message : undefined}
              />
              <LabeledInput
                label="Site Type"
                name="siteType"
                required
                register={register}
                error={!!errors.siteType}
                helperText={typeof errors.siteType?.message === "string" ? errors.siteType?.message : undefined}
              />
            </div>
          </div>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} /> : null}
            >
              {isPending ? "Updating..." : "Save Changes"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

// Assigned Officer Modal
export const AssignedOfficerModal = ({ open, onClose, siteData }: any) => {
  const { siteId } = useParams();
  const { mutate: updateSite, isPending, error, isSuccess } = useClientSiteUpdate();
  const { data: areaOfficersData } = useGetAreaOfficers({ page: 1, limit: 100 });
  const areaOfficerOptions = (areaOfficersData?.data?.guards || []).map((officer: any) => ({
    value: officer.guardId,
    label: `${officer.firstName} ${officer.middleName || ""} ${officer.lastName}`.trim(),
    disabled: officer.status !== "ACTIVE",
  }));
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      areaOfficerId: siteData?.areaOfficerId || "",
    },
  });
  useEffect(() => {
    if (open && siteData) reset({ areaOfficerId: siteData.areaOfficerId || "" });
  }, [open, siteData, reset]);
  useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess, onClose]);
  const onSubmit = (data: any) => {
    if (!siteId) return;
    updateSite({ siteId, data });
  };
  const handleClose = () => {
    reset();
    onClose();
  };
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Update Assigned Officer</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" type="button">
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update site details. Please try again.
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Divider />
            <div className="grid grid-cols-1 gap-4 mt-4">
              <LabeledDropdown
                label="Assign Area Officer"
                name="areaOfficerId"
                placeholder="Select Area Officer"
                required
                register={register}
                validation={{ required: "Area Officer assignment is required" }}
                options={areaOfficerOptions}
                error={!!errors.areaOfficerId}
                helperText={
                  typeof errors.areaOfficerId?.message === "string"
                    ? errors.areaOfficerId?.message
                    : "Select an area officer to supervise this site"
                }
                onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                  setValue("areaOfficerId", e.target.value as string);
                }}
              />
            </div>
          </div>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} /> : null}
            >
              {isPending ? "Updating..." : "Save Changes"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

// Contact Person Modal
export const ContactPersonModal = ({ open, onClose, siteData }: any) => {
  const { siteId } = useParams();
  const { mutate: updateSite, isPending, error, isSuccess } = useClientSiteUpdate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      siteContactPersonFullName: siteData?.siteContactPersonFullName || "",
      siteContactDesignation: siteData?.siteContactDesignation || "",
      siteContactPhone: siteData?.siteContactPhone || "",
      siteContactEmail: siteData?.siteContactEmail || "",
    },
  });
  useEffect(() => {
    if (open && siteData)
      reset({
        siteContactPersonFullName: siteData.siteContactPersonFullName || "",
        siteContactDesignation: siteData.siteContactDesignation || "",
        siteContactPhone: siteData.siteContactPhone || "",
        siteContactEmail: siteData.siteContactEmail || "",
      });
  }, [open, siteData, reset]);
  useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess, onClose]);
  const onSubmit = (data: any) => {
    if (!siteId) return;
    updateSite({ siteId, data });
  };
  const handleClose = () => {
    reset();
    onClose();
  };
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Update Contact Person</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" type="button">
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update site details. Please try again.
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Divider />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <LabeledInput
                label="Full Name"
                name="siteContactPersonFullName"
                required
                register={register}
                error={!!errors.siteContactPersonFullName}
                helperText={
                  typeof errors.siteContactPersonFullName?.message === "string"
                    ? errors.siteContactPersonFullName?.message
                    : undefined
                }
              />
              <LabeledInput
                label="Designation"
                name="siteContactDesignation"
                required
                register={register}
                error={!!errors.siteContactDesignation}
                helperText={
                  typeof errors.siteContactDesignation?.message === "string"
                    ? errors.siteContactDesignation?.message
                    : undefined
                }
              />
              <LabeledInput
                label="Phone"
                name="siteContactPhone"
                required
                register={register}
                error={!!errors.siteContactPhone}
                helperText={
                  typeof errors.siteContactPhone?.message === "string" ? errors.siteContactPhone?.message : undefined
                }
              />
              <LabeledInput
                label="Email"
                name="siteContactEmail"
                required
                register={register}
                error={!!errors.siteContactEmail}
                helperText={
                  typeof errors.siteContactEmail?.message === "string" ? errors.siteContactEmail?.message : undefined
                }
              />
            </div>
          </div>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} /> : null}
            >
              {isPending ? "Updating..." : "Save Changes"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

interface GuardAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  shiftPostId: string;
  initialAssignments?: any[];
  totalGuardsRequired?: number;
  sitePosts?: any[];
  activePostIndex?: number;
  activeShiftIndex?: number;
}

export const GuardAssignmentModal = ({
  open,
  onClose,
  shiftPostId,
  initialAssignments = [],
  totalGuardsRequired = 0,
  sitePosts = [],
  activePostIndex = 0,
  activeShiftIndex = 0,
}: GuardAssignmentModalProps) => {
  const patchGuardSelectionsMutation = usePatchGuardSelection();
  const [selectedGuardIds, setSelectedGuardIds] = useState<string[]>(initialAssignments.map((a: any) => a.guardId));
  const [guardSettings, setGuardSettings] = useState<
    Record<string, { alertnessChallenge: boolean; patrolling: boolean; occurrenceCount?: number }>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [guardToReplace, setGuardToReplace] = useState<{
    guardId: string;
    guardSelectionId: string;
    guardName: string;
    guardTypeId: string;
  } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const replaceGuardMutation = useReplaceGuard();

  const {
    data: guardTypesResponse,
  } = useGuardTypes(user?.agencyId || "");

  // Update guardSettings to include occurrenceCount
  useEffect(() => {
    if (open) {
      const settings: Record<string, { alertnessChallenge: boolean; patrolling: boolean; occurrenceCount?: number }> =
        {};
      initialAssignments.forEach((assignment: any) => {
        settings[assignment.guardId] = {
          alertnessChallenge: assignment.alertnessChallenge || false,
          patrolling: assignment.patrolling || false,
          occurrenceCount: assignment.occurenceCount ?? 0,
        };
      });
      setGuardSettings(settings);
    }
  }, [open, initialAssignments, selectedGuardIds]);

  const {
    data: guardsData,
    isLoading: isLoadingGuards,
    error: guardsError,
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

  // Filter available guards - in replace mode, only show guards with matching guard type
  const availableGuards = allGuards.filter((guard) => {
    const isNotSelected = !selectedGuardIds.includes(guard.id);
    const isNotBeingReplaced = guard.id !== guardToReplace?.guardId;

    if (isReplaceMode && guardToReplace) {
      // In replace mode: show only guards with matching guard type, excluding selected and the one being replaced
      return isNotSelected && isNotBeingReplaced && guard.guardTypeId === guardToReplace.guardTypeId;
    }

    // Normal mode: show all guards except selected ones
    return isNotSelected;
  });

  // Map selected guards with guardSelectionId from initialAssignments
  const selectedGuards = allGuards
    .filter((guard) => selectedGuardIds.includes(guard.id))
    .map((guard) => {
      const assignment = initialAssignments.find((a: any) => a.guardId === guard.id);
      return {
        ...guard,
        guardSelectionId: assignment?.id || "",
        guardTypeId: assignment?.guardReference?.guardTypeId || guard.guardTypeId,
      };
    });

  const currentPost = sitePosts[activePostIndex];
  const currentShift = currentPost?.shifts?.[activeShiftIndex];

  const guardRequirements = currentShift?.guardRequirements || [];

  // Create guard type name lookup from API data
  const guardTypeNameLookup = guardTypesResponse?.data?.reduce((acc, guardType) => {
    acc[guardType.id] = guardType.typeName;
    return acc;
  }, {} as Record<string, string>) || {};

  const guardTypesSummary = guardRequirements.map((requirement: { guardType: string; count: number }) => ({
    name: guardTypeNameLookup[requirement.guardType] || requirement.guardType,
    count: `0/${requirement.count || 0}`,
    guardType: requirement.guardType,
    required: requirement.count || 0,
  }));

  useEffect(() => {
    const checkScrollButtons = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
      }
    };

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

  const handleReplaceGuard = (guardId: string, guardSelectionId?: string) => {
    // Find the guard in the selected guards list to get its info
    const guard = selectedGuards.find((g) => g.id === guardId);

    if (!guard || !guardSelectionId) {
      console.error("❌ Guard or guardSelectionId not found for replacement", { guard, guardSelectionId });
      return;
    }

    // Get guard type ID from initial assignments
    const guardAssignment = initialAssignments.find((a: any) => a.guardId === guardId);
    const guardTypeId = guardAssignment?.guardReference?.guardTypeId || guard.guardTypeId || guardRequirements[0]?.guardTypeId || "";

    // Enter replace mode
    setGuardToReplace({
      guardId,
      guardSelectionId,
      guardName: guard.guardName,
      guardTypeId,
    });
    setIsReplaceMode(true);
    setError(null);
  };

  // Handle selecting a guard for replacement
  const handleSelectReplacementGuard = async (newGuardId: string) => {
    if (!guardToReplace) return;

    setLoading(true);
    setError(null);

    try {
      await replaceGuardMutation.mutateAsync({
        guardSelectionId: guardToReplace.guardSelectionId,
        data: {
          guardId: newGuardId,
        },
      });

      // Exit replace mode and close modal
      setIsReplaceMode(false);
      setGuardToReplace(null);
      onClose(); // This will trigger refetch in the parent
    } catch (err: any) {
      // Handle specific error messages from API
      const errorMessage = err.response?.data?.message || err.message || "Failed to replace guard";

      // Check for time overlap error
      if (errorMessage.includes("overlapping shifts") || errorMessage.includes("overlap detected")) {
        setError(errorMessage);
      } else if (errorMessage.includes("guard type mismatch")) {
        setError("The selected guard's type does not match the required type for this position");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cancel replace mode
  const handleCancelReplace = () => {
    setIsReplaceMode(false);
    setGuardToReplace(null);
    setError(null);
  };

  // Update handleGuardSettingChange to support occurrenceCount
  const handleGuardSettingChange = (
    guardId: string,
    setting: "alertnessChallenge" | "patrolling" | "occurrenceCount",
    value: boolean | number
  ) => {
    setGuardSettings((prev) => ({
      ...prev,
      [guardId]: {
        ...prev[guardId],
        [setting]: value,
      },
    }));
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

    // If in replace mode, call the replace handler with the first selected guard
    if (isReplaceMode && selectedIds.length > 0) {
      handleSelectReplacementGuard(selectedIds[0]);
      return;
    }

    // Normal selection mode
    let allSelected = [...new Set([...selectedGuardIds, ...selectedIds])];
    if (allSelected.length > guardsRequired) {
      allSelected = allSelected.slice(0, guardsRequired);
    }

    const newSettings = { ...guardSettings };
    allSelected.forEach((guardId) => {
      if (!newSettings[guardId]) {
        newSettings[guardId] = {
          alertnessChallenge: false,
          patrolling: false,
        };
      }
    });

    setSelectedGuardIds(allSelected);
    setGuardSettings(newSettings);
  };

  // Use the updated columns factory
  const selectedGuardsColumnsWithReplace: GridColDef[] = getSelectedGuardsColumnsWithActions(
    guardSettings,
    handleGuardSettingChange,
    handleReplaceGuard
  );

  const guardsRequired = totalGuardsRequired;

  const handleClose = () => {
    setSelectedGuardIds(initialAssignments.map((a: any) => a.guardId));

    const initialSettings: Record<string, { alertnessChallenge: boolean; patrolling: boolean }> = {};
    initialAssignments.forEach((assignment: any) => {
      initialSettings[assignment.guardId] = {
        alertnessChallenge: assignment.alertnessChallenge || false,
        patrolling: assignment.patrolling || false,
      };
    });
    setGuardSettings(initialSettings);

    setError(null);
    onClose();
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      const assignments = allGuards
        .map((guard) => {
          if (selectedGuardIds.includes(guard.id)) {
            const settings = guardSettings[guard.id] || {
              alertnessChallenge: false,
              patrolling: false,
              occurrenceCount: 0,
            };
            return {
              guardId: guard.id,
              action: "ASSIGN",
              occurenceCount: settings.occurrenceCount ?? 0,
              patrolling: settings.patrolling,
              alertnessChallenge: settings.alertnessChallenge,
            };
          } else if (initialAssignments.some((a: any) => a.guardId === guard.id)) {
            return {
              guardId: guard.id,
              action: "UNASSIGN",
            };
          }
          return null;
        })
        .filter(Boolean);
      await patchGuardSelectionsMutation.mutateAsync({ shiftPostId: shiftPostId, assignments });

      onClose();
    } catch (err: any) {
      setError("Failed to update guard assignments.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={guardsStyle} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">GUARD SELECTION</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" type="button">
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Replace Mode Indicator */}
        {isReplaceMode && guardToReplace && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleCancelReplace}>
                Cancel
              </Button>
            }
          >
            <strong>Replace Mode:</strong> Select a guard from the left to replace <strong>{guardToReplace.guardName}</strong>.
            Only guards with matching guard type are shown.
          </Alert>
        )}

        <div className="flex flex-row">
          <div className="">
            <div className="flex gap-2 mb-4">
              {currentPost?.shifts?.map((_: any, index: number) => {
                const shiftLabel = `Shift ${index + 1}`;
                return (
                  <Button
                    key={index}
                    variant="contained"
                    onClick={() => {}}
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

            <div>
              <span className="text-[#A3A3A3]">Guards Required: </span>
              <span>{totalGuardsRequired}</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center max-w-[64vw] mx-auto mb-4">
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
                  className="flex overflow-x-auto scrollbar-hide py-2 px-1 flex-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {guardTypesSummary.map((guard: any, index: number) => (
                    <div
                      key={index}
                      className="flex-shrink-0 px-4 py-2 mx-1 text-center cursor-pointer hover:bg-blue-50 rounded transition-colors min-w-max"
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

              <form onSubmit={handleSubmit}>
                <div className="flex flex-row gap-4" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-[#F7F7F7] p-2 rounded-lg flex flex-col gap-2">
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
                        />
                      </div>
                    </div>
                    <Box sx={{ display: "inline-block" }}>
                      {isLoadingGuards ? (
                        <div className="flex items-center justify-center h-48">
                          <CircularProgress />
                          <span className="ml-2 text-gray-500">Loading guards...</span>
                        </div>
                      ) : guardsError ? (
                        <div className="flex items-center justify-center h-48">
                          <span className="text-red-500">Failed to load guards. Please try again.</span>
                        </div>
                      ) : (
                        <DataGrid
                          key={`available-guards-${availableGuards.length}-${isReplaceMode}`}
                          rows={availableGuards}
                          columns={availableGuardsColumns}
                          hideFooter={true}
                          hideFooterSelectedRowCount
                          checkboxSelection={!isReplaceMode}
                          onRowSelectionModelChange={handleAvailableGuardsSelection}
                          onRowClick={(params) => {
                            if (isReplaceMode) {
                              handleSelectReplacementGuard(params.row.id);
                            }
                          }}
                          isRowSelectable={(params) =>
                            isReplaceMode || selectedGuardIds.length < totalGuardsRequired || selectedGuardIds.includes(params.row.id)
                          }
                          sx={{
                            width: "100%",
                            minWidth: 400,
                            maxWidth: "100%",
                            ".MuiDataGrid-columnHeaders": {
                              backgroundColor: "#f5f5f5",
                            },
                            border: 0,
                            ...(isReplaceMode && {
                              "& .MuiDataGrid-row": {
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "#E3F2FD",
                                },
                              },
                            }),
                          }}
                          slots={{
                            noRowsOverlay: () => (
                              <div className="flex items-center justify-center h-full text-gray-500">
                                {searchQuery ? "No guards found matching your search" : "No guards available"}
                              </div>
                            ),
                          }}
                        />
                      )}
                    </Box>
                  </div>
                  <div className="flex flex-col gap-2 p-2">
                    <span className="text-sm text-[#707070] font-semibold">
                      SELECTED GUARDS ({selectedGuards.length}/{guardsRequired})
                    </span>
                    <Box sx={{ display: "inline-block", width: "100%" }}>
                      <DataGrid
                        rows={selectedGuards}
                        columns={selectedGuardsColumnsWithReplace}
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
                          width: "100%",
                          minWidth: 400,
                          ".MuiDataGrid-columnHeaders": {
                            backgroundColor: "#f5f5f5",
                            whiteSpace: "break-spaces",
                          },
                          minHeight: 300,
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
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                  <Button type="button" variant="outlined" onClick={handleClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? "Updating..." : "Save Changes"}
                  </Button>
                </Box>
              </form>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export const PostDetailsModal = ({ open, onClose, postData, onSuccess }: any) => {
  const { mutate: updatePost, isPending, error, isSuccess } = usePostUpdate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      postName: postData?.postName || "",
      geofenceType: postData?.geofenceType || "CIRCLE",
    },
  });

  useEffect(() => {
    if (open && postData) {
      reset({
        postName: postData.postName || "",
        geofenceType: postData.geofenceType || "CIRCLE",
      });
    }
  }, [open, postData, reset]);

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const onSubmit = (data: any) => {
    if (!postData?.id) return;
    updatePost({ postId: postData.id, data });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Update Post Details</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" type="button">
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update post details. Please try again.
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Divider />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <LabeledInput
                label="Post Name"
                name="postName"
                required
                register={register}
                error={!!errors.postName}
                helperText={typeof errors.postName?.message === "string" ? errors.postName?.message : undefined}
              />
              <LabeledDropdown
                label="Geofence Type"
                name="geofenceType"
                placeholder="Select Geofence Type"
                required
                register={register}
                validation={{ required: "Geofence type is required" }}
                options={[
                  { value: "CIRCLE", label: "Circular Geofence" },
                  { value: "POLYGON", label: "Polygon Geofence" },
                ]}
                error={!!errors.geofenceType}
                helperText={
                  typeof errors.geofenceType?.message === "string"
                    ? errors.geofenceType?.message
                    : "Select the geofence shape for this post"
                }
                onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                  setValue("geofenceType", e.target.value as string);
                }}
              />
            </div>
          </div>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} /> : null}
            >
              {isPending ? "Updating..." : "Save Changes"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export const ShiftDetailsModal = ({ open, onClose, shiftData, onSuccess }: any) => {
  const { mutate: updateShift, isPending, error, isSuccess } = useShiftUpdate();

  const daysOfWeekOptions = [
    { value: DaysOfWeek.MONDAY, label: "Monday" },
    { value: DaysOfWeek.TUESDAY, label: "Tuesday" },
    { value: DaysOfWeek.WEDNESDAY, label: "Wednesday" },
    { value: DaysOfWeek.THURSDAY, label: "Thursday" },
    { value: DaysOfWeek.FRIDAY, label: "Friday" },
    { value: DaysOfWeek.SATURDAY, label: "Saturday" },
    { value: DaysOfWeek.SUNDAY, label: "Sunday" },
  ];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      daysOfWeek: shiftData?.daysOfWeek || [],
      dutyStartTime: shiftData?.dutyStartTime || "",
      dutyEndTime: shiftData?.dutyEndTime || "",
      checkInTime: shiftData?.checkInTime || "",
      latenessFrom: shiftData?.latenessFrom || "",
      latenessTo: shiftData?.latenessTo || "",
      includePublicHolidays: shiftData?.includePublicHolidays || false,
    },
  });

  useEffect(() => {
    if (open && shiftData) {
      reset({
        daysOfWeek: shiftData.daysOfWeek || [],
        dutyStartTime: shiftData.dutyStartTime || "",
        dutyEndTime: shiftData.dutyEndTime || "",
        checkInTime: shiftData.checkInTime || "",
        latenessFrom: shiftData.latenessFrom || "",
        latenessTo: shiftData.latenessTo || "",
        includePublicHolidays: shiftData.includePublicHolidays || false,
      });
    }
  }, [open, shiftData, reset]);

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const selectedDays = watch("daysOfWeek");

  const onSubmit = (data: any) => {
    if (!shiftData?.id) return;
    updateShift({ shiftId: shiftData.id, data });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDayChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setValue("daysOfWeek", typeof value === "string" ? value.split(",") : value);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Update Shift Details</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" type="button">
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update shift details. Please try again.
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Divider />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Controller
                name="daysOfWeek"
                control={control}
                render={() => (
                  <FormControl fullWidth>
                    <InputLabel id="days-of-week-label">Days of Week</InputLabel>
                    <Select
                      labelId="days-of-week-label"
                      multiple
                      value={selectedDays}
                      onChange={handleDayChange}
                      input={<OutlinedInput label="Days of Week" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip
                              key={value}
                              label={daysOfWeekOptions.find((d) => d.value === value)?.label || value}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {daysOfWeekOptions.map((day) => (
                        <MenuItem key={day.value} value={day.value}>
                          {day.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <LabeledDropdown
                label="Include Public Holidays"
                name="includePublicHolidays"
                placeholder="Include Holidays"
                register={register}
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
                error={!!errors.includePublicHolidays}
                onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                  setValue("includePublicHolidays", e.target.value === "true");
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <LabeledInput
                label="Duty Start Time"
                name="dutyStartTime"
                type="time"
                required
                register={register}
                error={!!errors.dutyStartTime}
                helperText={
                  typeof errors.dutyStartTime?.message === "string" ? errors.dutyStartTime?.message : undefined
                }
              />
              <LabeledInput
                label="Duty End Time"
                name="dutyEndTime"
                type="time"
                required
                register={register}
                error={!!errors.dutyEndTime}
                helperText={typeof errors.dutyEndTime?.message === "string" ? errors.dutyEndTime?.message : undefined}
              />
              <LabeledInput
                label="Check-in Time"
                name="checkInTime"
                type="time"
                register={register}
                error={!!errors.checkInTime}
                helperText={
                  typeof errors.checkInTime?.message === "string"
                    ? errors.checkInTime?.message
                    : "Latest allowed check-in time"
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <LabeledInput
                label="Lateness From"
                name="latenessFrom"
                type="time"
                register={register}
                error={!!errors.latenessFrom}
                helperText={
                  typeof errors.latenessFrom?.message === "string"
                    ? errors.latenessFrom?.message
                    : "Start of lateness calculation window"
                }
              />
              <LabeledInput
                label="Lateness To"
                name="latenessTo"
                type="time"
                register={register}
                error={!!errors.latenessTo}
                helperText={
                  typeof errors.latenessTo?.message === "string"
                    ? errors.latenessTo?.message
                    : "End of lateness calculation window"
                }
              />
            </div>
          </div>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} /> : null}
            >
              {isPending ? "Updating..." : "Save Changes"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export const PatrollingModal = ({ open, onClose, postData, onSuccess }: any) => {
  const { siteId } = useParams();
  const { mutate: updateSite, isPending, error, isSuccess } = useClientSiteUpdate();
  const [localPatrollingEnabled, setLocalPatrollingEnabled] = useState(false);

  useEffect(() => {
    if (open && postData) {
      setLocalPatrollingEnabled(postData?.patrolling || false);
    }
  }, [open, postData]);

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const handlePatrollingToggle = () => {
    setLocalPatrollingEnabled(!localPatrollingEnabled);
  };

  const handleSave = async () => {
    if (!siteId) return;
    updateSite({
      siteId,
      data: { patrolling: localPatrollingEnabled },
    });
  };

  const handleClose = () => {
    setLocalPatrollingEnabled(postData?.patrolling || false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#ffffff",
          borderRadius: "8px",
          boxShadow: 24,
          p: 4,
          width: "400px",
          maxWidth: "90vw",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Patrolling Settings</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" type="button">
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update patrolling settings. Please try again.
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          <Divider />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Enable Patrolling</h3>
              <p className="text-sm text-gray-500">
                {localPatrollingEnabled ? "Patrolling will be enabled" : "Patrolling will be disabled"}
              </p>
            </div>

            <button
              onClick={handlePatrollingToggle}
              className="inline-flex gap-2 w-fit items-center cursor-pointer hover:opacity-70 transition-opacity"
              disabled={isPending}
            >
              {localPatrollingEnabled ? (
                <ToggleOnIcon className="text-[#5CC168]" />
              ) : (
                <ToggleOffIcon className="text-[#A3A3A3]" />
              )}
              {localPatrollingEnabled ? "ON" : "OFF"}
            </button>
          </div>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} /> : null}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </Box>
        </div>
      </Box>
    </Modal>
  );
};

// Alertness Modal
export const AlertnessModal = ({ open, onClose, shiftData, guardRequirement, onSuccess }: any) => {
  const { mutate: updateGuardRequirement, isPending, error, isSuccess } = useGuardRequirementUpdate();
  const { mutate: updateGuardSelections } = usePatchGuardSelection();
  const [localAlertnessEnabled, setLocalAlertnessEnabled] = useState(false);
  const [alertnessCount, setAlertnessCount] = useState(1);

  useEffect(() => {
    if (open && guardRequirement) {
      setLocalAlertnessEnabled(guardRequirement?.alertnessChallengeEnabled || false);
      setAlertnessCount(guardRequirement?.alertnessChallengeCount || 1);
    }
  }, [open, guardRequirement]);

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const handleAlertnessToggle = () => {
    setLocalAlertnessEnabled(!localAlertnessEnabled);
  };

  const handleSave = async () => {
    if (!guardRequirement?.id) return;

    try {
      // Update guard requirement
      await updateGuardRequirement({
        requirementId: guardRequirement.id,
        data: {
          alertnessChallengeEnabled: localAlertnessEnabled,
          alertnessChallengeCount: localAlertnessEnabled ? alertnessCount : 0,
        },
      });

      // Update all currently assigned guards
      if (shiftData?.GuardSelection?.length > 0) {
        const assignments = shiftData.GuardSelection.map((guard: any) => ({
          guardId: guard.guardId,
          action: "ASSIGN",
          alertnessChallenge: localAlertnessEnabled,
          patrolling: guard.patrolling || false,
          occurenceCount: localAlertnessEnabled ? alertnessCount : 0,
        }));

        await updateGuardSelections({
          shiftPostId: shiftData.id,
          assignments,
        });
      }
    } catch (err) {
      console.error("Failed to update alertness settings:", err);
    }
  };

  const handleClose = () => {
    setLocalAlertnessEnabled(guardRequirement?.alertnessChallengeEnabled || false);
    setAlertnessCount(guardRequirement?.alertnessChallengeCount || 1);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#ffffff",
          borderRadius: "8px",
          boxShadow: 24,
          p: 4,
          width: "400px",
          maxWidth: "90vw",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Alertness Challenge Settings</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" type="button">
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update alertness settings. Please try again.
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          <Divider />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Enable Alertness Challenge</h3>
              <p className="text-sm text-gray-500">
                {localAlertnessEnabled
                  ? "Alertness challenges will be enabled"
                  : "Alertness challenges will be disabled"}
              </p>
            </div>

            <button
              onClick={handleAlertnessToggle}
              className="inline-flex gap-2 w-fit items-center cursor-pointer hover:opacity-70 transition-opacity"
              disabled={isPending}
            >
              {localAlertnessEnabled ? (
                <ToggleOnIcon className="text-[#5CC168]" />
              ) : (
                <ToggleOffIcon className="text-[#A3A3A3]" />
              )}
              {localAlertnessEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {localAlertnessEnabled && (
            <div className="flex items-center gap-4">
              <label htmlFor="alertnessCount" className="text-sm font-medium text-gray-700">
                Challenge Count:
              </label>
              <input
                id="alertnessCount"
                type="number"
                min="1"
                max="24"
                value={alertnessCount}
                onChange={(e) => setAlertnessCount(parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A77D5]"
              />
            </div>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} /> : null}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </Box>
        </div>
      </Box>
    </Modal>
  );
};

// Patrol Settings Modal
export const PatrolSettingsModal = ({
  open,
  onClose,
  shiftData,
  guardRequirement,
  patrolRoutes = [],
  onSuccess,
}: any) => {
  const { mutate: updateGuardRequirement, isPending, error, isSuccess } = useGuardRequirementUpdate();
  const { mutate: updateGuardSelections } = usePatchGuardSelection();
  const [localPatrolEnabled, setLocalPatrolEnabled] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  useEffect(() => {
    if (open && guardRequirement) {
      setLocalPatrolEnabled(guardRequirement?.patrolEnabled || false);
      setSelectedRoutes(guardRequirement?.selectedPatrolRoutes || []);
    }
  }, [open, guardRequirement]);

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const handlePatrolToggle = () => {
    setLocalPatrolEnabled(!localPatrolEnabled);
    if (!localPatrolEnabled) {
      setSelectedRoutes([]);
    }
  };

  const handleRouteSelection = (routeId: string) => {
    setSelectedRoutes((prev) => (prev.includes(routeId) ? prev.filter((id) => id !== routeId) : [...prev, routeId]));
  };

  const handleSave = async () => {
    if (!guardRequirement?.id) return;

    try {
      // Update guard requirement
      await updateGuardRequirement({
        requirementId: guardRequirement.id,
        data: {
          patrolEnabled: localPatrolEnabled,
          selectedPatrolRoutes: localPatrolEnabled ? selectedRoutes : [],
        },
      });

      // Update all currently assigned guards
      if (shiftData?.GuardSelection?.length > 0) {
        const assignments = shiftData.GuardSelection.map((guard: any) => ({
          guardId: guard.guardId,
          action: "ASSIGN",
          alertnessChallenge: guard.alertnessChallenge || false,
          patrolling: localPatrolEnabled,
          occurenceCount: guard.occurenceCount || 0,
        }));

        await updateGuardSelections({
          shiftPostId: shiftData.id,
          assignments,
        });
      }
    } catch (err) {
      console.error("Failed to update patrol settings:", err);
    }
  };

  const handleClose = () => {
    setLocalPatrolEnabled(guardRequirement?.patrolEnabled || false);
    setSelectedRoutes(guardRequirement?.selectedPatrolRoutes || []);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#ffffff",
          borderRadius: "8px",
          boxShadow: 24,
          p: 4,
          width: "500px",
          maxWidth: "90vw",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Patrol Settings</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" type="button">
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update patrol settings. Please try again.
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          <Divider />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Enable Patrol</h3>
              <p className="text-sm text-gray-500">
                {localPatrolEnabled ? "Patrol will be enabled" : "Patrol will be disabled"}
              </p>
            </div>

            <button
              onClick={handlePatrolToggle}
              className="inline-flex gap-2 w-fit items-center cursor-pointer hover:opacity-70 transition-opacity"
              disabled={isPending}
            >
              {localPatrolEnabled ? (
                <ToggleOnIcon className="text-[#5CC168]" />
              ) : (
                <ToggleOffIcon className="text-[#A3A3A3]" />
              )}
              {localPatrolEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {localPatrolEnabled && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Select Patrol Routes</h4>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {patrolRoutes.length > 0 ? (
                  patrolRoutes.map((route: any) => (
                    <div key={route.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={`route-${route.id}`}
                        checked={selectedRoutes.includes(route.id)}
                        onChange={() => handleRouteSelection(route.id)}
                        className="w-4 h-4 text-[#2A77D5] focus:ring-[#2A77D5]"
                      />
                      <label htmlFor={`route-${route.id}`} className="text-sm text-gray-700 cursor-pointer">
                        {route.name || `Route ${route.id}`}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 p-2">No patrol routes available</p>
                )}
              </div>
              {localPatrolEnabled && selectedRoutes.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Please select at least one patrol route</p>
              )}
            </div>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isPending || (localPatrolEnabled && selectedRoutes.length === 0)}
              startIcon={isPending ? <CircularProgress size={20} /> : null}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </Box>
        </div>
      </Box>
    </Modal>
  );
};
