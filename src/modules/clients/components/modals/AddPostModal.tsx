import { CustomSwitch } from "@components/CustomSwitch";
import LabeledDropdown from "@components/LabeledDropdown";
import LabeledInput from "@components/LabeledInput";
import { useCreatePost } from "@modules/clients/apis/hooks/useCreatePost";
import { useGetAreaOfficers } from "@modules/clients/apis/hooks/useGuards";
import { SelectPatrolRoutesModal } from "@modules/clients/components/modals/SelectPatrolRoutesModal";
import { useGuardTypes } from "@modules/dashboard/apis/hooks/useGuardTypes";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
import MapsHomeWorkOutlinedIcon from "@mui/icons-material/MapsHomeWorkOutlined";
import { Alert, Box, Button, CircularProgress, Divider, IconButton, Modal, Typography } from "@mui/material";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { transformUniformsToOptions, useAgencyUniforms } from "../../../../services/agencyUniforms.service";
import GeofenceModal from "./GeoFencingModal";

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

const geofenceOptions = [
  { value: "CIRCLE", label: "Circular Geofence" },
  { value: "POLYGON", label: "Polygon Geofence" },
];


// Default uniform types when API data is not available
const defaultUniformOptions = [
  { value: "standard_security", label: "Standard Security Uniform" },
  { value: "formal_blazer", label: "Formal Blazer Uniform" },
  { value: "casual_polo", label: "Casual Polo Uniform" },
];

const days = [
  { short: "M", full: "MONDAY" },
  { short: "T", full: "TUESDAY" },
  { short: "W", full: "WEDNESDAY" },
  { short: "T", full: "THURSDAY" },
  { short: "F", full: "FRIDAY" },
  { short: "S", full: "SATURDAY" },
  { short: "S", full: "SUNDAY" },
];

interface PostFormData {
  postName: string;
  geofenceType: string;
  areaOfficerId: string;
  geoLocation: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  geoFencing: {
    type: "Circular Geofence" | "Polygon Geofence";
    radius?: number;
    coordinates?: Array<{ lat: number; lng: number }>;
  };
  shifts: Array<{
    daysOfWeek: string[];
    includePublicHolidays: boolean;
    dutyStartTime: string;
    dutyEndTime: string;
    checkInTime: string;
    latenessFrom: string;
    latenessTo: string;
    guardRequirement: {
      guardTypeId: string;
      guardCount: number;
      uniformBy: string;
      uniformType: string;
      tasksEnabled: boolean;
      alertnessChallengeEnabled: boolean;
      alertnessChallengeCount?: number;
      patrolEnabled: boolean;
      selectedPatrolRoutes: string[];
    };
  }>;
}

interface GuardRequirementProps {
  shiftIndex: number;
}

function GuardRequirement({ shiftIndex }: GuardRequirementProps) {
  const [selectPatrolRoutesModalOpen, setSelectPatrolRoutesModalOpen] = useState(false);
  const { user } = useAuth();

  const {
    data: agencyUniforms = [],
    isLoading: uniformsLoading,
    error: uniformsError,
  } = useAgencyUniforms(user?.agencyId || null, !!user?.agencyId);

  const {
    data: guardTypesResponse,
    isLoading: guardTypesLoading,
    error: guardTypesError,
  } = useGuardTypes(user?.agencyId || "");

  // Use agency uniforms if available, otherwise use default options
  const uniformOptions = useMemo(() => {
    const apiUniforms = transformUniformsToOptions(agencyUniforms);

    // If API uniforms exist and is an array with items, use them
    if (Array.isArray(apiUniforms) && apiUniforms.length > 0) {
      return apiUniforms;
    }

    // Otherwise, use default uniform options
    return defaultUniformOptions;
  }, [agencyUniforms]);

  // Prepare guard type options from API
  const guardTypeOptions = useMemo(() => {
    if (guardTypesResponse?.data) {
      return guardTypesResponse.data.map((guardType) => ({
        value: guardType.id,
        label: guardType.typeName,
      }));
    }
    return [];
  }, [guardTypesResponse]);

  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<PostFormData>();

  const tasksEnabled = watch(`shifts.${shiftIndex}.guardRequirement.tasksEnabled`) ?? true;
  const alertnessEnabled = watch(`shifts.${shiftIndex}.guardRequirement.alertnessChallengeEnabled`) ?? false;
  const patrolEnabled = watch(`shifts.${shiftIndex}.guardRequirement.patrolEnabled`) ?? false;
  const selectedPatrolRoutes = watch(`shifts.${shiftIndex}.guardRequirement.selectedPatrolRoutes`) || [];
  const uniformBy = watch(`shifts.${shiftIndex}.guardRequirement.uniformBy`) === "PSA";

  return (
    <div className="bg-white p-4 rounded-lg flex flex-col relative border-2 border-gray-200">
      <div className="mb-4">
        <Typography variant="subtitle2" sx={{ color: "#2A77D5", fontWeight: "bold" }}>
          GUARD REQUIREMENTS
        </Typography>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-4">
        <LabeledDropdown
          label="Guard Type"
          name={`shifts.${shiftIndex}.guardRequirement.guardTypeId`}
          placeholder={
            guardTypesLoading ? "Loading guard types..." : guardTypesError ? "Using default guard types" : "Select Guard Type"
          }
          required
          register={register}
          validation={{ required: "Guard type is required" }}
          options={guardTypeOptions}
          disabled={guardTypesLoading}
          error={!!errors.shifts?.[shiftIndex]?.guardRequirement?.guardTypeId}
          helperText={
            guardTypesError
              ? "Error loading guard types from API"
              : errors.shifts?.[shiftIndex]?.guardRequirement?.guardTypeId?.message
          }
        />

        <LabeledInput
          label="Number of Guards"
          name={`shifts.${shiftIndex}.guardRequirement.guardCount`}
          placeholder="Enter Count"
          required
          type="number"
          register={register}
          validation={{
            required: "Number of guards is required",
            min: { value: 1, message: "At least 1 guard is required" },
            valueAsNumber: true,
          }}
          error={!!errors.shifts?.[shiftIndex]?.guardRequirement?.guardCount}
          helperText={errors.shifts?.[shiftIndex]?.guardRequirement?.guardCount?.message}
        />

        <div className="">
          <Typography sx={{ typography: { fontSize: "12px" }, mb: 0.5, color: "#707070" }}>Uniform By</Typography>
          <CustomSwitch
            checked={uniformBy}
            onChange={(checked) => {
              setValue(`shifts.${shiftIndex}.guardRequirement.uniformBy`, checked ? "PSA" : "CLIENT", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            labelOff="Client"
            labelOn="PSA"
          />
        </div>

        <LabeledDropdown
          label="Uniform Type"
          name={`shifts.${shiftIndex}.guardRequirement.uniformType`}
          placeholder={
            uniformsLoading ? "Loading uniforms..." : uniformsError ? "Using default uniforms" : "Select Uniform Type"
          }
          required
          register={register}
          validation={{ required: "Uniform type is required" }}
          options={uniformOptions}
          disabled={uniformsLoading}
          error={!!errors.shifts?.[shiftIndex]?.guardRequirement?.uniformType}
          helperText={
            uniformsError
              ? "Using default uniform options. Agency uniforms unavailable."
              : errors.shifts?.[shiftIndex]?.guardRequirement?.uniformType?.message
          }
        />

        <div className="mb-4">
          <Typography sx={{ typography: { fontSize: "12px" }, mb: 0.5, color: "#707070" }}>Tasks</Typography>
          <CustomSwitch
            checked={tasksEnabled}
            onChange={(checked) => {
              setValue(`shifts.${shiftIndex}.guardRequirement.tasksEnabled`, checked, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        </div>
      </div>

      <Divider sx={{ my: 2 }} />

      <div className="flex flex-row gap-4">
        <div className="grid grid-cols-2 w-1/2 gap-4">
          <div>
            <span className="text-sm mb-1 text-[#707070]">Alertness Challenge</span>
            <CustomSwitch
              checked={alertnessEnabled}
              onChange={(checked) => {
                setValue(`shifts.${shiftIndex}.guardRequirement.alertnessChallengeEnabled`, checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          </div>

          <LabeledInput
            label="Alertness Challenge Count"
            name={`shifts.${shiftIndex}.guardRequirement.alertnessChallengeCount`}
            placeholder="Enter Count e.g. 5 in a Shift"
            type="number"
            register={register}
            disabled={!alertnessEnabled}
            validation={{
              min: { value: 0, message: "Cannot be negative" },
              valueAsNumber: true,
            }}
            error={!!errors.shifts?.[shiftIndex]?.guardRequirement?.alertnessChallengeCount}
            helperText={errors.shifts?.[shiftIndex]?.guardRequirement?.alertnessChallengeCount?.message}
          />
        </div>

        <Divider orientation="vertical" flexItem sx={{ borderColor: "#FFFFFF" }} />

        <div className="grid grid-cols-2 gap-4 w-1/2">
          <div>
            <span className="text-sm mb-1 text-[#707070]">Patrol</span>
            <CustomSwitch
              checked={patrolEnabled}
              onChange={(checked) => {
                setValue(`shifts.${shiftIndex}.guardRequirement.patrolEnabled`, checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                if (!checked) {
                  setValue(`shifts.${shiftIndex}.guardRequirement.selectedPatrolRoutes`, [], {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            />
          </div>

          <div className="h-full items-center flex pt-4 w-fit whitespace-nowrap">
            <Button onClick={() => setSelectPatrolRoutesModalOpen(true)} variant="contained" disabled={!patrolEnabled}>
              <DirectionsRunOutlinedIcon />
              {selectedPatrolRoutes.length > 0 ? `Routes Selected (${selectedPatrolRoutes.length})` : "Select Patrol"}
            </Button>
          </div>
        </div>
      </div>

      <SelectPatrolRoutesModal
        open={selectPatrolRoutesModalOpen}
        onClose={() => setSelectPatrolRoutesModalOpen(false)}
        siteIndex={0}
        shiftIndex={shiftIndex}
        guardIndex={0}
      />
    </div>
  );
}

interface ShiftFormProps {
  shiftIndex: number;
  onDelete: () => void;
  canDelete: boolean;
}

function ShiftForm({ shiftIndex, onDelete, canDelete }: ShiftFormProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<PostFormData>();

  const selectedDays = watch(`shifts.${shiftIndex}.daysOfWeek`) || [];

  const toggleDay = (dayFull: string) => {
    const newSelectedDays = selectedDays.includes(dayFull)
      ? selectedDays.filter((day) => day !== dayFull)
      : [...selectedDays, dayFull];

    setValue(`shifts.${shiftIndex}.daysOfWeek`, newSelectedDays, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="bg-[#F7F7F7] rounded-xl p-4 flex flex-row relative">
      {canDelete && (
        <div className="absolute top-2 right-2 z-10">
          <IconButton
            onClick={onDelete}
            size="small"
            sx={{
              color: "#ff4444",
              "&:hover": { backgroundColor: "rgba(255, 68, 68, 0.1)" },
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </div>
      )}

      <div className="flex flex-col gap-4 w-1/3 pr-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-[#2A77D5]">SHIFT {String(shiftIndex + 1).padStart(2, "0")}</h3>
        </div>

        <div>
          <Typography sx={{ typography: { fontSize: "12px" }, mb: 1, color: "#707070" }}>
            Days (Select All Applicable Days)
          </Typography>
          <div className="flex flex-row gap-2 flex-wrap">
            {days.map((day, index) => (
              <div
                key={index}
                className={`w-12 h-12 flex items-center justify-center text-white rounded-lg cursor-pointer transition-colors ${
                  selectedDays.includes(day.full) ? "bg-[#2A77D5]" : "bg-gray-400"
                }`}
                onClick={() => toggleDay(day.full)}
              >
                {day.short}
              </div>
            ))}
          </div>
          {selectedDays.length === 0 && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
              At least one day must be selected
            </Typography>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`publicHolidays-${shiftIndex}`}
            {...register(`shifts.${shiftIndex}.includePublicHolidays`)}
          />
          <label htmlFor={`publicHolidays-${shiftIndex}`} className="text-sm text-[#707070]">
            Guards Required On Public Holidays
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            label="Duty Starting Time"
            name={`shifts.${shiftIndex}.dutyStartTime`}
            placeholder="HH:MM (e.g., 18:00)"
            required
            register={register}
            validation={{
              required: "Duty start time is required",
              pattern: {
                value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: "Please enter time in HH:MM format",
              },
            }}
            error={!!errors.shifts?.[shiftIndex]?.dutyStartTime}
            helperText={errors.shifts?.[shiftIndex]?.dutyStartTime?.message}
          />

          <LabeledInput
            label="Duty Ending Time"
            name={`shifts.${shiftIndex}.dutyEndTime`}
            placeholder="HH:MM (e.g., 06:00)"
            required
            register={register}
            validation={{
              required: "Duty end time is required",
              pattern: {
                value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: "Please enter time in HH:MM format",
              },
            }}
            error={!!errors.shifts?.[shiftIndex]?.dutyEndTime}
            helperText={errors.shifts?.[shiftIndex]?.dutyEndTime?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            label="Check-In Time"
            name={`shifts.${shiftIndex}.checkInTime`}
            placeholder="HH:MM (e.g., 17:45)"
            required
            register={register}
            validation={{
              required: "Check-in time is required",
              pattern: {
                value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: "Please enter time in HH:MM format",
              },
            }}
            error={!!errors.shifts?.[shiftIndex]?.checkInTime}
            helperText={errors.shifts?.[shiftIndex]?.checkInTime?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            label="Lateness From"
            name={`shifts.${shiftIndex}.latenessFrom`}
            placeholder="HH:MM (e.g., 18:10)"
            required
            register={register}
            validation={{
              required: "Lateness from time is required",
              pattern: {
                value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: "Please enter time in HH:MM format",
              },
            }}
            error={!!errors.shifts?.[shiftIndex]?.latenessFrom}
            helperText={errors.shifts?.[shiftIndex]?.latenessFrom?.message}
          />

          <LabeledInput
            label="Lateness To"
            name={`shifts.${shiftIndex}.latenessTo`}
            placeholder="HH:MM (e.g., 18:20)"
            required
            register={register}
            validation={{
              required: "Lateness to time is required",
              pattern: {
                value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: "Please enter time in HH:MM format",
              },
            }}
            error={!!errors.shifts?.[shiftIndex]?.latenessTo}
            helperText={errors.shifts?.[shiftIndex]?.latenessTo?.message}
          />
        </div>
      </div>

      <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#E0E0E0" }} />

      <div className="flex flex-col gap-4 flex-1">
        <h3 className="text-sm font-semibold text-[#707070]">GUARD REQUIREMENTS</h3>
        <Divider sx={{ borderColor: "#E0E0E0" }} />

        <GuardRequirement shiftIndex={shiftIndex} />
      </div>
    </div>
  );
}

interface AddPostModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddPostModal: React.FC<AddPostModalProps> = ({ open, onClose, onSuccess }) => {
  const { siteId } = useParams();
  const { clientId } = useParams(); // Get clientId from URL params
  const [geofenceModalOpen, setGeofenceModalOpen] = useState(false);
  const createPostMutation = useCreatePost();

  const { data: areaOfficersData } = useGetAreaOfficers({ page: 1, limit: 100 });
  const areaOfficerOptions = (areaOfficersData?.data?.guards || []).map((officer: any) => ({
    value: officer.guardId,
    label: `${officer.firstName} ${officer.middleName || ""} ${officer.lastName}`.trim(),
    disabled: officer.status !== "ACTIVE",
  }));

  const methods = useForm<PostFormData>({
    defaultValues: {
      postName: "",
      geofenceType: "CIRCLE",
      areaOfficerId: "",
      geoLocation: {
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      },
      geoFencing: {
        type: "Circular Geofence",
        radius: 25,
        coordinates: [],
      },
      shifts: [
        {
          daysOfWeek: [],
          includePublicHolidays: false,
          dutyStartTime: "",
          dutyEndTime: "",
          checkInTime: "",
          latenessFrom: "",
          latenessTo: "",
          guardRequirement: {
            guardTypeId: "",
            guardCount: 1,
            uniformBy: "PSA",
            uniformType: "",
            tasksEnabled: true,
            alertnessChallengeEnabled: false,
            alertnessChallengeCount: 0,
            patrolEnabled: false,
            selectedPatrolRoutes: [],
          },
        },
      ],
    },
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "shifts",
  });

  const addShift = () => {
    append({
      daysOfWeek: [],
      includePublicHolidays: false,
      dutyStartTime: "",
      dutyEndTime: "",
      checkInTime: "",
      latenessFrom: "",
      latenessTo: "",
      guardRequirement: {
        guardTypeId: "",
        guardCount: 1,
        uniformBy: "PSA",
        uniformType: "",
        tasksEnabled: true,
        alertnessChallengeEnabled: false,
        alertnessChallengeCount: 0,
        patrolEnabled: false,
        selectedPatrolRoutes: [],
      },
    });
  };

  const removeShift = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: PostFormData) => {
    if (!siteId || !clientId) return;

    // Validate that at least one day is selected for each shift
    const invalidShifts = data.shifts.filter((shift) => shift.daysOfWeek.length === 0);
    if (invalidShifts.length > 0) {
      alert("Please select at least one day for each shift");
      return;
    }

    try {
      // Process shifts to conditionally exclude alertnessChallengeCount
      const processedShifts = data.shifts.map((shift) => {
        const { guardRequirement, ...restShift } = shift;
        const { alertnessChallengeCount, ...restGuardRequirement } = guardRequirement;

        return {
          ...restShift,
          guardRequirement: {
            ...restGuardRequirement,
            ...(guardRequirement.alertnessChallengeEnabled && alertnessChallengeCount !== undefined
              ? { alertnessChallengeCount }
              : {}),
          },
        };
      });

      // Transform form data to match API expectations
      const geoFenceMapData =
        data.geoFencing.type === "Circular Geofence"
          ? {
              type: "circle" as const,
              center: {
                lat: data.geoLocation.coordinates.latitude,
                lng: data.geoLocation.coordinates.longitude,
              },
              radius: data.geoFencing.radius || 25,
            }
          : {
              type: "polygon" as const,
              coordinates: data.geoFencing.coordinates || [],
            };

      await createPostMutation.mutateAsync({
        siteId,
        clientId,
        postName: data.postName,
        geofenceType: data.geofenceType,
        areaOfficerId: data.areaOfficerId,
        geoFenceMapData,
        shifts: processedShifts,
      });

      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Watch form state for validation feedback

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#2A77D5]">Add New Post</h2>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" type="button">
              <X className="w-6 h-6 text-[#2A77D5]" />
            </button>
          </div>

          {createPostMutation.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to create post: {createPostMutation.error?.message || "Please try again."}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-4 w-full">
                  <LabeledInput
                    label="Post Name"
                    name="postName"
                    placeholder="Enter Post Name"
                    required
                    register={register}
                    validation={{
                      required: "Post Name is required",
                      minLength: { value: 2, message: "Post name must be at least 2 characters" },
                    }}
                    error={!!errors.postName}
                    helperText={errors.postName?.message}
                  />

                  <LabeledDropdown
                    label="Geofence Type"
                    name="geofenceType"
                    placeholder="Select Geofence Type"
                    required
                    register={register}
                    validation={{ required: "Geofence type is required" }}
                    options={geofenceOptions}
                    error={!!errors.geofenceType}
                    helperText={errors.geofenceType?.message}
                  />

                  <LabeledDropdown
                    label="Area Officer"
                    name="areaOfficerId"
                    placeholder="Select Area Officer"
                    required
                    register={register}
                    validation={{ required: "Area Officer is required" }}
                    options={areaOfficerOptions}
                    error={!!errors.areaOfficerId}
                    helperText={errors.areaOfficerId?.message}
                  />

                  <div className="h-full items-center flex pt-4 w-fit whitespace-nowrap">
                    <Button variant="contained" onClick={() => setGeofenceModalOpen(true)} sx={{ gap: 1 }}>
                      <MapsHomeWorkOutlinedIcon /> MARK POST-GEOFENCE ON MAP
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                  {fields.map((field, index) => (
                    <ShiftForm
                      key={field.id}
                      shiftIndex={index}
                      onDelete={() => removeShift(index)}
                      canDelete={fields.length > 1}
                    />
                  ))}
                </div>

                <div className="w-fit">
                  <Button variant="contained" onClick={addShift} sx={{ gap: 1 }}>
                    <AddOutlinedIcon /> ADD SHIFT
                  </Button>
                </div>
              </div>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={handleClose} disabled={createPostMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createPostMutation.isPending}
                  startIcon={createPostMutation.isPending ? <CircularProgress size={20} /> : null}
                >
                  {createPostMutation.isPending ? "Creating..." : "Create Post"}
                </Button>
              </Box>
            </form>
            <GeofenceModal
              isOpen={geofenceModalOpen}
              onClose={() => setGeofenceModalOpen(false)}
              mode="site"
              title="Mark Post Geofence"
            />
          </FormProvider>
        </Box>
      </Modal>
    </>
  );
};
