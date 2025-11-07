import { CustomSwitch } from "@components/CustomSwitch";
import LabeledDropdown from "@components/LabeledDropdown";
import LabeledInput from "@components/LabeledInput";
import { SelectPatrolRoutesModal } from "@modules/clients/components/modals/SelectPatrolRoutesModal";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
import MapsHomeWorkOutlinedIcon from "@mui/icons-material/MapsHomeWorkOutlined";
import { Button, Divider, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useAuth } from "../../../../../hooks/useAuth";
import { transformUniformsToOptions, useAgencyUniforms } from "../../../../../services/agencyUniforms.service";
import { useGuardTypes } from "../../../../dashboard/apis/hooks/useGuardTypes";
import { DaysOfWeek } from "../../../constants";
import GeofenceModal from "../../modals/GeoFencingModal";
import type { ClientSite } from "./types";

const geofenceOptions = [
  { value: "Circular Geofence", label: "Circular Geofence" },
  { value: "Polygon Geofence", label: "Polygon Geofence" },
];

// Remove hardcoded uniform options - now fetched dynamically from API

const days = [
  { short: "M", full: DaysOfWeek.MONDAY },
  { short: "T", full: DaysOfWeek.TUESDAY },
  { short: "W", full: DaysOfWeek.WEDNESDAY },
  { short: "T", full: DaysOfWeek.THURSDAY },
  { short: "F", full: DaysOfWeek.FRIDAY },
  { short: "S", full: DaysOfWeek.SATURDAY },
  { short: "S", full: DaysOfWeek.SUNDAY },
];

interface GuardRequirementProps {
  guardIndex: number;
  shiftIndex: number;
  sitePostIndex: number;
  onDelete: () => void;
  canDelete: boolean;
}

function GuardRequirement({ guardIndex, shiftIndex, sitePostIndex, onDelete, canDelete }: GuardRequirementProps) {
  const [selectPatrolRoutesModalOpen, setSelectPatrolRoutesModalOpen] = useState(false);

  // Get current user data for agency ID
  const { user } = useAuth();

  // Fetch agency uniforms
  const {
    data: agencyUniforms = [],
    isLoading: uniformsLoading,
    error: uniformsError,
  } = useAgencyUniforms(user?.agencyId || null, !!user?.agencyId);

  // Fetch guard types
  const { data: guardTypesResponse } = useGuardTypes(user?.agencyId);

  // Transform uniforms to dropdown options
  const uniformOptions = transformUniformsToOptions(agencyUniforms);

  // Transform guard types to dropdown options
  const guardTypeOptions =
    guardTypesResponse?.data?.map((guardType) => ({
      value: guardType.id,
      label: guardType.typeName,
    })) || [];

  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<ClientSite>();

  const tasksEnabled =
    watch(`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.tasks`) ?? true;
  const alertnessEnabled =
    watch(`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.alertnessChallenge`) ??
    false;
  const patrolEnabled =
    watch(`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.patrolEnabled`) ?? false;
  const selectedPatrolRoutes =
    watch(`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.selectPatrolRoutes`) || [];

  // Watch uniformBy field - true = PSA, false = Client
  const uniformBy =
    watch(`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.uniformBy`) === "PSA";

  return (
    <div className="bg-white p-4 rounded-lg flex flex-col relative border-2 border-gray-200">
      {canDelete && (
        <div className="absolute top-2 right-2">
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

      <div className="mb-4">
        <Typography variant="subtitle2" sx={{ color: "#2A77D5", fontWeight: "bold" }}>
          GUARD TYPE {guardIndex + 1}
        </Typography>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-4">
        <LabeledDropdown
          label="Guard Type"
          name={`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.guardTypeId`}
          placeholder="Select Guard Type"
          required
          register={register}
          validation={{
            required: "Guard type is required",
          }}
          options={guardTypeOptions}
          error={
            !!errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.guardRequirements?.[guardIndex]?.guardTypeId
          }
          helperText={
            errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.guardRequirements?.[guardIndex]?.guardTypeId
              ?.message
          }
        />

        <LabeledInput
          label="Number of Guards"
          name={`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.count`}
          placeholder="Enter Count"
          required
          type="number"
          register={register}
          validation={{
            required: "Number of guards is required",
            min: { value: 1, message: "At least 1 guard is required" },
          }}
          error={!!errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.guardRequirements?.[guardIndex]?.count}
          helperText={
            errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.guardRequirements?.[guardIndex]?.count?.message
          }
        />

        {/* Fixed Uniform By CustomSwitch */}
        <div className="">
          <Typography
            sx={{
              typography: { fontSize: "12px" },
              mb: 0.5,
              color: "#707070",
            }}
          >
            Uniform By
          </Typography>
          <CustomSwitch
            checked={uniformBy}
            onChange={(checked) => {
              setValue(
                `sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.uniformBy`,
                checked ? "PSA" : "client",
                {
                  shouldDirty: true,
                  shouldValidate: true,
                }
              );
            }}
            labelOff="Client"
            labelOn="PSA"
          />
        </div>

        <LabeledDropdown
          label="Uniform Type"
          name={`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.uniformType`}
          placeholder={
            uniformsLoading ? "Loading uniforms..." : uniformsError ? "Error loading uniforms" : "Select Uniform Type"
          }
          required
          register={register}
          validation={{
            required: "Uniform type is required",
          }}
          options={uniformOptions}
          disabled={uniformsLoading || !!uniformsError}
          error={
            !!errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.guardRequirements?.[guardIndex]?.uniformType
          }
          helperText={
            uniformsError
              ? "Failed to load uniforms. Please refresh and try again."
              : errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.guardRequirements?.[guardIndex]?.uniformType
                  ?.message
          }
        />

        {/* Fixed Tasks CustomSwitch */}

        <div className="mb-4">
          <Typography
            sx={{
              typography: { fontSize: "12px" },
              mb: 0.5,
              color: "#707070",
            }}
          >
            Tasks
          </Typography>
          <CustomSwitch
            checked={tasksEnabled}
            onChange={(checked) => {
              setValue(
                `sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.tasks`,
                checked,
                {
                  shouldDirty: true,
                  shouldValidate: true,
                }
              );
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
                setValue(
                  `sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.alertnessChallenge`,
                  checked,
                  { shouldDirty: true, shouldValidate: true }
                );
              }}
            />
          </div>

          <LabeledInput
            label="Alertness Challenge Occurrence"
            name={`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.alertnessChallengeOccurrence`}
            placeholder="Enter Count e.g. 5 in a Shift"
            type="number"
            register={register}
            disabled={!alertnessEnabled}
            validation={{
              min: { value: 0, message: "Cannot be negative" },
            }}
            error={
              !!errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.guardRequirements?.[guardIndex]
                ?.alertnessChallengeOccurrence
            }
            helperText={
              errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.guardRequirements?.[guardIndex]
                ?.alertnessChallengeOccurrence?.message
            }
          />
        </div>

        <Divider orientation="vertical" flexItem sx={{ borderColor: "#FFFFFF" }} />

        <div className="grid grid-cols-2 gap-4 w-1/2">
          <div>
            <span className="text-sm mb-1 text-[#707070]">Patrol</span>
            <CustomSwitch
              checked={patrolEnabled}
              onChange={(checked) => {
                console.log("Uniform By changed:", checked ? "PSA" : "CLIENT");
                setValue(
                  `sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.patrolEnabled`,
                  checked,
                  { shouldDirty: true, shouldValidate: true }
                );

                if (!checked) {
                  setValue(
                    `sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.selectPatrolRoutes`,
                    [],
                    { shouldDirty: true, shouldValidate: true }
                  );
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
        siteIndex={sitePostIndex}
        shiftIndex={shiftIndex}
        guardIndex={guardIndex}
      />
    </div>
  );
}

interface ShiftFormProps {
  shiftIndex: number;
  sitePostIndex: number;
  onDelete: () => void;
  canDelete: boolean;
}

function ShiftForm({ shiftIndex, sitePostIndex, onDelete, canDelete }: ShiftFormProps) {
  const {
    register,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useFormContext<ClientSite>();

  const selectedDays = watch(`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.days`) || [];
  const publicHolidaysRequired =
    watch(`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.publicHolidayGuardRequired`) ?? false;

  const {
    fields: guardFields,
    append: appendGuard,
    remove: removeGuard,
  } = useFieldArray({
    control,
    name: `sitePosts.${sitePostIndex}.shifts.${shiftIndex}.guardRequirements`,
  });

  useEffect(() => {
    if (guardFields.length === 0) {
      appendGuard({
        guardTypeId: "",
        count: 1,
        uniformBy: "PSA",
        uniformType: "",
        tasks: true,
        alertnessChallenge: false,
        alertnessChallengeOccurrence: 0,
        patrolEnabled: false,
        selectPatrolRoutes: [],
      });
    }
  }, [guardFields.length, appendGuard]);

  const toggleDay = (dayFull: string) => {
    const newSelectedDays = selectedDays.includes(dayFull)
      ? selectedDays.filter((day) => day !== dayFull)
      : [...selectedDays, dayFull];

    setValue(`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.days`, newSelectedDays, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const addGuardType = () => {
    appendGuard({
      guardTypeId: "",
      count: 1,
      uniformBy: "PSA",
      uniformType: "",
      tasks: true,
      alertnessChallenge: false,
      alertnessChallengeOccurrence: 0,
      patrolEnabled: false,
      selectPatrolRoutes: [],
    });
  };

  const removeGuardType = (guardIndex: number) => {
    if (guardFields.length > 1) {
      removeGuard(guardIndex);
    }
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
          <Typography
            sx={{
              typography: { fontSize: "12px" },
              mb: 1,
              color: "#707070",
            }}
          >
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
            id={`publicHolidays-${sitePostIndex}-${shiftIndex}`}
            checked={publicHolidaysRequired}
            {...register(`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.publicHolidayGuardRequired`)}
          />
          <label htmlFor={`publicHolidays-${sitePostIndex}-${shiftIndex}`} className="text-sm text-[#707070]">
            Guards Required On Public Holidays
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            label="Duty Starting Time"
            name={`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.dutyStartTime`}
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
            error={!!errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.dutyStartTime}
            helperText={errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.dutyStartTime?.message}
          />

          <LabeledInput
            label="Duty Ending Time"
            name={`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.dutyEndTime`}
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
            error={!!errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.dutyEndTime}
            helperText={errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.dutyEndTime?.message}
          />
        </div>

        <LabeledInput
          label="Check-In Time"
          name={`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.checkInTime`}
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
          error={!!errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.checkInTime}
          helperText={errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.checkInTime?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            label="Lateness From"
            name={`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.latenessFrom`}
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
            error={!!errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.latenessFrom}
            helperText={errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.latenessFrom?.message}
          />

          <LabeledInput
            label="Lateness To"
            name={`sitePosts.${sitePostIndex}.shifts.${shiftIndex}.latenessTo`}
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
            error={!!errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.latenessTo}
            helperText={errors.sitePosts?.[sitePostIndex]?.shifts?.[shiftIndex]?.latenessTo?.message}
          />
        </div>
      </div>

      <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#E0E0E0" }} />

      <div className="flex flex-col gap-4 flex-1">
        <h3 className="text-sm font-semibold text-[#707070]">GUARD REQUIREMENTS</h3>
        <Divider sx={{ borderColor: "#E0E0E0" }} />

        <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto">
          {guardFields.map((field, guardIndex) => (
            <GuardRequirement
              key={field.id}
              guardIndex={guardIndex}
              shiftIndex={shiftIndex}
              sitePostIndex={sitePostIndex}
              onDelete={() => removeGuardType(guardIndex)}
              canDelete={guardFields.length > 1}
            />
          ))}
        </div>

        <div className="flex items-center justify-center border-2 border-[#D9D9D9] border-dashed rounded-lg py-6">
          <Button variant="contained" onClick={addGuardType} sx={{ gap: 1 }}>
            <AddOutlinedIcon /> ADD GUARD TYPE
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SitePostProps {
  sitePostIndex: number;
  onDelete: () => void;
  canDelete: boolean;
}

function SitePost({ sitePostIndex, onDelete, canDelete }: SitePostProps) {
  const [geofenceModalOpen, setGeofenceModalOpen] = useState(false);

  const {
    register,
    formState: { errors },
    control,
    watch,
  } = useFormContext<ClientSite>();

  const postName = watch(`sitePosts.${sitePostIndex}.name`) || "";

  const { fields, append, remove } = useFieldArray({
    control,
    name: `sitePosts.${sitePostIndex}.shifts`,
  });

  const addShift = () => {
    append({
      days: [],
      publicHolidayGuardRequired: false,
      dutyStartTime: "",
      dutyEndTime: "",
      checkInTime: "",
      latenessFrom: "",
      latenessTo: "",
      guardRequirements: [
        {
          guardTypeId: "",
          count: 1,
          uniformBy: "PSA",
          uniformType: "",
          tasks: true,
          alertnessChallenge: false,
          alertnessChallengeOccurrence: 0,
          patrolEnabled: false,
          selectPatrolRoutes: [],
        },
      ],
    });
  };

  useEffect(() => {
    if (fields.length === 0) {
      append({
        days: [],
        publicHolidayGuardRequired: false,
        dutyStartTime: "",
        dutyEndTime: "",
        checkInTime: "",
        latenessFrom: "",
        latenessTo: "",
        guardRequirements: [
          {
            guardTypeId: "",
            count: 1,
            uniformBy: "PSA",
            uniformType: "",
            tasks: true,
            alertnessChallenge: false,
            alertnessChallengeOccurrence: 0,
            patrolEnabled: false,
            selectPatrolRoutes: [],
          },
        ],
      });
    }
  }, [fields.length, append]);

  const removeShift = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white mt-2 rounded-xl p-6 pb-10 relative shadow-sm border border-gray-100">
      {canDelete && (
        <div className="absolute top-4 right-4">
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

      <h2 className="text-xl text-[#2A77D5] mb-2 font-semibold">
        SITE POST {sitePostIndex + 1}
        {postName && ` - ${postName}`}
      </h2>

      <div className="grid grid-cols-3 gap-4 w-full">
        <LabeledInput
          label="Post Name"
          name={`sitePosts.${sitePostIndex}.name`}
          placeholder="Enter Post Name"
          required
          register={register}
          validation={{
            required: "Post Name is required",
            minLength: { value: 2, message: "Post name must be at least 2 characters" },
          }}
          error={!!errors.sitePosts?.[sitePostIndex]?.name}
          helperText={errors.sitePosts?.[sitePostIndex]?.name?.message}
        />

        <LabeledDropdown
          label="Geofence Type"
          name={`sitePosts.${sitePostIndex}.geoFenceType`}
          placeholder="Select Geofence Type"
          required
          register={register}
          validation={{
            required: "Geofence type is required",
          }}
          options={geofenceOptions}
          error={!!errors.sitePosts?.[sitePostIndex]?.geoFenceType}
          helperText={errors.sitePosts?.[sitePostIndex]?.geoFenceType?.message}
        />

        <div className="h-full items-center flex pt-4 w-fit whitespace-nowrap">
          <Button variant="contained" onClick={() => setGeofenceModalOpen(true)} sx={{ gap: 1 }}>
            <MapsHomeWorkOutlinedIcon /> MARK POST-GEOFENCE ON MAP
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        {fields.map((field, index) => (
          <ShiftForm
            key={field.id}
            shiftIndex={index}
            sitePostIndex={sitePostIndex}
            onDelete={() => removeShift(index)}
            canDelete={fields.length > 1}
          />
        ))}
      </div>

      <div className="w-fit mt-4">
        <Button variant="contained" onClick={addShift} sx={{ gap: 1 }}>
          <AddOutlinedIcon /> ADD SHIFT
        </Button>
      </div>

      <GeofenceModal
        isOpen={geofenceModalOpen}
        onClose={() => setGeofenceModalOpen(false)}
        mode="post"
        sitePostIndex={sitePostIndex}
      />
    </div>
  );
}

export default function SitePostForm() {
  const { control } = useFormContext<ClientSite>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sitePosts",
  });

  const addSitePost = () => {
    append({
      name: "",
      geoFenceType: "Circular Geofence",
      shifts: [
        {
          days: [],
          publicHolidayGuardRequired: false,
          dutyStartTime: "",
          dutyEndTime: "",
          checkInTime: "",
          latenessFrom: "",
          latenessTo: "",
          guardRequirements: [
            {
              guardTypeId: "",
              count: 1,
              uniformBy: "PSA",
              uniformType: "",
              tasks: true,
              alertnessChallenge: false,
              alertnessChallengeOccurrence: 0,
              patrolEnabled: false,
              selectPatrolRoutes: [],
            },
          ],
        },
      ],
    });
  };

  const removeSitePost = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-6">
        {fields.map((field, index) => (
          <SitePost
            key={field.id}
            sitePostIndex={index}
            onDelete={() => removeSitePost(index)}
            canDelete={fields.length > 1}
          />
        ))}
      </div>

      <div className="bg-[#F1F7FE] p-4 rounded-lg mt-6">
        <Button variant="contained" onClick={addSitePost} sx={{ gap: 1 }}>
          <AddOutlinedIcon /> ADD SITE POST
        </Button>
      </div>
    </div>
  );
}
