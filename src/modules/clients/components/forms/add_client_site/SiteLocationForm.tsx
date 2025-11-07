import { CustomSwitch } from "@components/CustomSwitch";
import LabeledDropdown from "@components/LabeledDropdown";
import LabeledInput from "@components/LabeledInput";
import { SetUpRoutePortal } from "@modules/clients/components/modals/SetUpRoutePortalModal";
import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
import MapsHomeWorkOutlinedIcon from "@mui/icons-material/MapsHomeWorkOutlined";
import { Button, Divider, Typography } from "@mui/material";
import { City, State } from "country-state-city";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useAuth } from "../../../../../hooks/useAuth";
import { useGuardTypes } from "../../../../dashboard/apis/hooks/useGuardTypes";
import GeofenceModal from "../../modals/GeoFencingModal";
import type { ClientSite } from "./types";

const geofenceOptions = [
  { value: "Circular Geofence", label: "Circular Geofence" },
  { value: "Polygon Geofence", label: "Polygon Geofence" },
];

const indianStates = State.getStatesOfCountry("IN").map((s) => ({ value: s.name, label: s.name }));

export default function SiteLocationForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<ClientSite>();

  const isPatrolOn = watch("patroling.patrol") ?? false;
  const selectedState = watch("address.state");
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);

  const handlePatrolChange = (checked: boolean) => {
    setValue("patroling.patrol", checked, { shouldDirty: true, shouldValidate: true });
  };

  const { user } = useAuth();
  useGuardTypes(user?.agencyId);


  useEffect(() => {
    if (selectedState) {
      const cities = City.getCitiesOfState(
        "IN",
        State.getStatesOfCountry("IN").find((s) => s.name === selectedState)?.isoCode || ""
      );
      setCityOptions(cities.map((c) => ({ value: c.name, label: c.name })));
      setValue("address.city", "");
    } else {
      setCityOptions([]);
      setValue("address.city", "");
    }
  }, [selectedState, setValue]);

  return (
    <div className="flex flex-col gap-2 bg-white mt-2 rounded-xl p-6 pb-10">
      <h2 className="text-xl text-[#2A77D5] mb-2">SITE LOCATION</h2>

      <h3 className="text-lg font-semibold text-[#707070]">ADDRESS</h3>
      <Divider />

      <div className="grid grid-cols-2 gap-4 w-full">
        <LabeledInput
          label="Address Line 1"
          name="address.addressLine1"
          placeholder="Enter Flat no./House No./ Floor/ Building/Apartment Name"
          required
          register={register}
          validation={{
            required: "Address Line 1 is required",
            minLength: { value: 5, message: "Address must be at least 5 characters" },
          }}
          error={!!errors.address?.addressLine1}
          helperText={errors.address?.addressLine1?.message}
        />
        <LabeledInput
          label="Address Line 2"
          name="address.addressLine2"
          placeholder="Enter Street Name/ Road /Lane"
          register={register}
          error={!!errors.address?.addressLine2}
          helperText={errors.address?.addressLine2?.message}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <LabeledDropdown
          label="State / Union Territory"
          name="address.state"
          placeholder="Select State"
          required
          register={register}
          validation={{ required: "State is required" }}
          error={!!errors.address?.state}
          helperText={errors.address?.state?.message}
          options={indianStates}
        />
        <LabeledDropdown
          label="Village/Town/City"
          name="address.city"
          placeholder="Select City"
          required
          register={register}
          validation={{ required: "City is required" }}
          error={!!errors.address?.city}
          helperText={errors.address?.city?.message}
          options={cityOptions}
        />
        <LabeledInput
          label="District"
          name="address.district"
          placeholder="Enter District Name"
          required
          register={register}
          validation={{
            required: "District is required",
            minLength: { value: 2, message: "District name must be at least 2 characters" },
          }}
          error={!!errors.address?.district}
          helperText={errors.address?.district?.message}
        />
        <LabeledInput
          label="Pincode"
          name="address.pincode"
          placeholder="Enter Pincode"
          required
          register={register}
          validation={{
            required: "Pincode is required",
            pattern: {
              value: /^[0-9]{6}$/,
              message: "Pincode must be 6 digits",
            },
          }}
          error={!!errors.address?.pincode}
          helperText={errors.address?.pincode?.message}
        />
        <LabeledInput
          label="Landmark"
          name="address.landmark"
          placeholder="Enter Nearby Landmark (Optional)"
          register={register}
          error={!!errors.address?.landmark}
          helperText={errors.address?.landmark?.message}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-[#707070]">GEOLOCATION</h3>
        <Divider />

        <div className="grid grid-cols-3 gap-4 w-full">
          <LabeledInput
            label="Site Location Map Link"
            name="geoLocation.mapLink"
            placeholder="Enter Location Map Link"
            register={register}
            validation={{
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Please enter a valid URL starting with http:// or https://",
              },
            }}
            error={!!errors.geoLocation?.mapLink}
            helperText={errors.geoLocation?.mapLink?.message}
          />
          <LabeledInput
            label="Latitude Coordinates"
            name="geoLocation.coordinates.latitude"
            placeholder="Auto-generated Latitude"
            type="number"
            register={register}
            validation={{
              required: "Latitude is required",
              min: { value: -90, message: "Latitude must be between -90 and 90" },
              max: { value: 90, message: "Latitude must be between -90 and 90" },
            }}
            error={!!errors.geoLocation?.coordinates?.latitude}
            helperText={errors.geoLocation?.coordinates?.latitude?.message}
          />
          <LabeledInput
            label="Longitude Coordinates"
            name="geoLocation.coordinates.longitude"
            placeholder="Auto-generated Longitude"
            type="number"
            register={register}
            validation={{
              required: "Longitude is required",
              min: { value: -180, message: "Longitude must be between -180 and 180" },
              max: { value: 180, message: "Longitude must be between -180 and 180" },
            }}
            error={!!errors.geoLocation?.coordinates?.longitude}
            helperText={errors.geoLocation?.coordinates?.longitude?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 w-full">
          <LabeledInput
            label="Plus Code"
            name="geoLocation.plusCode"
            placeholder="Auto-generated Plus Code (e.g., 7FG3+V3, XYZ12345)"
            register={register}
            validation={{
              pattern: {
                value: /^[A-Z0-9+]{8,}$/,
                message: "Please enter a valid Plus Code format",
              },
            }}
            error={!!errors.geoLocation?.plusCode}
            helperText={errors.geoLocation?.plusCode?.message}
          />
        </div>

        <div className="flex flex-row w-full gap-4">
          <div className="mt-4 flex flex-col w-1/2 gap-4">
            <h3 className="text-lg font-semibold text-[#707070]">GEOFENCE TYPE</h3>
            <Divider />
            <div className="flex flex-row gap-4 items-center h-full w-full">
              <div className="w-full">
                <LabeledDropdown
                  label="Geofence Type"
                  name="geoFencing.type"
                  placeholder="Select Geofence Type"
                  defaultValue=""
                  required
                  register={register}
                  validation={{
                    required: "Geofence type is required",
                  }}
                  options={geofenceOptions}
                  error={!!errors.geoFencing?.type}
                  helperText={
                    typeof errors.geoFencing?.type === "object" && "message" in errors.geoFencing?.type
                      ? errors.geoFencing.type.message
                      : undefined
                  }
                />
              </div>
              <div className="h-full items-center flex pt-4 w-fit whitespace-nowrap">
                <Button onClick={() => setIsModalOpen(true)} variant="contained" sx={{ gap: 1 }}>
                  <MapsHomeWorkOutlinedIcon /> MARK GEOFENCE ON MAP
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#707070]">PATROLLING</h3>
            <Divider />
            <div className="grid grid-cols-2 gap-4 items-center h-full">
              <div className="h-full items-center flex pt-4 w-full gap-4">
                <div>
                  <Typography
                    sx={{
                      typography: { fontSize: "12px" },
                      mb: 0.5,
                      color: "#707070",
                    }}
                  >
                    Patrol
                  </Typography>
                  <CustomSwitch checked={isPatrolOn} onChange={handlePatrolChange} />
                </div>
                <div className="h-full items-center flex pt-4 w-fit whitespace-nowrap">
                  <Button onClick={() => setIsRouteModalOpen(true)} variant="contained" sx={{ gap: 1 }}>
                    <DirectionsRunOutlinedIcon /> SETUP PATROL ROUTE
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GeofenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="site"
        title="Mark Site Geofence"
      />
      <SetUpRoutePortal open={isRouteModalOpen} onClose={() => setIsRouteModalOpen(false)} />
    </div>
  );
}
