import FileUpload from "@components/FileUpload";
import LabeledDropdown from "@components/LabeledDropdown";
import LabeledInput from "@components/LabeledInput";
import type { ClientFormData } from "@modules/clients/types";
import { Divider } from "@mui/material";
import { City, State } from "country-state-city";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

const indianStates = State.getStatesOfCountry("IN").map((s) => ({ value: s.name, label: s.name }));

export default function ClientInfoForm({
  clientLogo,
  setClientLogo,
  onLogoChange,
}: {
  clientLogo: File | null;
  setClientLogo: (file: File | null) => void;
  onLogoChange: (file: File | null) => void;
}) {
  const {
    register,
    setValue,
    formState: { errors },
    watch,
    trigger,
  } = useFormContext<ClientFormData>();

  // Register the clientLogo field with validation
  useEffect(() => {
    register("clientLogo", {
      required: "Client logo is required",
      validate: (value) => {
        if (!value) return "Client logo is required";
        return true;
      },
    });
  }, [register]);

  const selectedState = watch("address.state");
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (selectedState) {
      const cities = City.getCitiesOfState(
        "IN",
        State.getStatesOfCountry("IN").find((s) => s.name === selectedState)?.isoCode || ""
      );
      setCityOptions(cities.map((c) => ({ value: c.name, label: c.name })));
    } else {
      setCityOptions([]);
    }
  }, [selectedState]);

  const handleLogoChange = (file: File | null) => {
    setClientLogo(file);
    onLogoChange(file);
    setValue("clientLogo", file, { shouldValidate: true });
    trigger("clientLogo");
  };

  // Sync the form value with clientLogo state when clientLogo changes
  useEffect(() => {
    if (clientLogo) {
      setValue("clientLogo", clientLogo, { shouldValidate: true });
    }
  }, [clientLogo, setValue]);

  return (
    <div className="flex flex-col gap-2 bg-white mt-2 rounded-xl p-6 pb-10">
      <h2 className="text-xl text-[#2A77D5] mb-2">CLIENT INFORMATION</h2>
      <h3>BASIC DETAILS</h3>
      <Divider />
      <div className="flex flex-row gap-4">
        <div className="w-[10vw] max-w-xs">
          <FileUpload
            label="Add Logo"
            required
            maxSize={2}
            acceptedFileTypes="image/*"
            onFileChange={handleLogoChange}
            initialFile={clientLogo}
            errorText={errors.clientLogo?.message}
          />
        </div>
        <div className="flex flex-col gap-2 w-[25vw]">
          <LabeledInput
            label="Client Name"
            name="clientName"
            placeholder="Enter Client's Full Name"
            required
            register={register}
            validation={{
              required: "Client's Full Name is required",
            }}
            error={!!errors.clientName}
            helperText={errors.clientName?.message}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <h3>ADDRESS</h3>
        <Divider />
        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            label="Address Line 1"
            name="address.addressLine1"
            placeholder="Enter Flat no./House No./  Floor/ Building/Apartment Name"
            required
            register={register}
            validation={{
              required: "Address Line 1 is required",
            }}
            error={!!errors.address?.addressLine1}
            helperText={errors.address?.addressLine1?.message}
          />
          <LabeledInput
            label="Address Line 2"
            name="address.addressLine2"
            placeholder="Enter Street Name/ Road /Lane"
            register={register}
          />
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
          <LabeledDropdown
            label="State"
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
            validation={{ required: "City/Town/Village is required" }}
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
            validation={{ required: "District is required" }}
            error={!!errors.address?.district}
            helperText={errors.address?.district?.message}
          />
          <LabeledInput
            label="Pin Code"
            name="address.pincode"
            placeholder="Enter Pin Code"
            required
            register={register}
            validation={{
              required: "Pin Code is required",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "Please enter a valid 6-digit pin code",
              },
            }}
            error={!!errors.address?.pincode}
            helperText={errors.address?.pincode?.message}
          />

          <LabeledInput
            label="Landmark"
            name="address.landmark"
            placeholder="Enter Landmark"
            register={register}
            error={!!errors.address?.landmark}
            helperText={errors.address?.landmark?.message}
          />
        </div>
      </div>
    </div>
  );
}
