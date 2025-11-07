import LabeledDropdown from "@components/LabeledDropdown";
import LabeledInput from "@components/LabeledInput";
import { Divider } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useGetAreaOfficers } from "../../../apis/hooks/useGuards";
import type { ClientSite } from "./types";

const siteTypeOptions = [
  { value: "OFFICE", label: "Corporate & Commercial Building" },
  { value: "RESIDENTIAL", label: "Residential & Gated Community" },
  { value: "INDUSTRIAL", label: "Industrial & Warehousing Unit" },
  { value: "HEALTHCARE", label: "Healthcare & Education Unit" },
  { value: "PUBLIC", label: "Public Infrastructure & Government Facilities" },
  { value: "EVENT", label: "Event-Based & Temporary Site" },
  { value: "HIGH_SECURITY", label: "High-Security / Sensitive Sites" },
  { value: "RELIGIOUS", label: "Religious & Cultural Establishment" },
];

export default function ClientSiteInfoForm() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<ClientSite>();

  const {
    data: areaOfficersData,
    // isLoading: isLoadingAreaOfficers,
    // error: areaOfficersError,
  } = useGetAreaOfficers({
    page: 1,
    limit: 100,
  });

  // Transform API data to dropdown options
  const areaOfficerOptions = useMemo(() => {
    if (!areaOfficersData?.data?.guards) return [];

    return areaOfficersData.data.guards.map((officer) => ({
      value: officer.guardId,
      label: `${officer.firstName} ${officer.middleName || ""} ${officer.lastName}`.trim(),
      disabled: officer.status !== "ACTIVE",
    }));
  }, [areaOfficersData]);

  const siteName = watch("name");
  const siteType = watch("type");

  useEffect(() => {
    if (siteName && siteType && !watch("id")) {
      const generateId = () => {
        const namePrefix = siteName.substring(0, 3).toUpperCase();
        const typePrefix = Array.isArray(siteType) ? siteType[0].substring(0, 2) : siteType.substring(0, 2);
        const randomNumber = Math.floor(Math.random() * 9999)
          .toString()
          .padStart(4, "0");
        return `${namePrefix}${typePrefix}${randomNumber}`;
      };
      setValue("id", generateId());
    }
  }, [siteName, siteType, setValue, watch]);

  return (
    <div className="flex flex-col gap-2 bg-white mt-2 rounded-xl p-6 pb-10">
      <h2 className="text-xl text-[#2A77D5] mb-2">SITE INFORMATION</h2>

      {/* Basic Details Section */}
      <h3>BASIC DETAILS</h3>
      <Divider />

      <div className="grid grid-cols-3 gap-4 w-full">
        <LabeledInput
          label="Site ID"
          name="id"
          type="number"
          placeholder="Auto-generated or enter manually"
          required
          register={register}
          validation={{
            required: "Site ID is required",
            pattern: {
              value: /^[0-9]{5,15}$/,
              message: "Site ID must be 5-15 numeric characters",
            },
          }}
          error={!!errors.id}
          helperText={errors.id?.message}
        />

        <LabeledInput
          label="Site Name"
          name="name"
          placeholder="Enter Site Name"
          required
          register={register}
          validation={{
            required: "Site Name is required",
            minLength: {
              value: 2,
              message: "Site name must be at least 2 characters",
            },
            maxLength: {
              value: 100,
              message: "Site name cannot exceed 100 characters",
            },
          }}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <LabeledDropdown
          label="Site Type"
          name="type"
          placeholder="Select Site Type"
          required
          register={register}
          validation={{
            required: "Site Type is required",
          }}
          options={siteTypeOptions}
          error={!!errors.type}
          helperText={errors.type?.message}
        />
      </div>

      {/* Site Contact Person Section */}
      <div className="mt-6 flex flex-col gap-4">
        <h3>SITE CONTACT PERSON</h3>
        <Divider />

        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            label="Full Name"
            name="contactPerson.fullName"
            placeholder="Enter Full Name"
            required
            register={register}
            validation={{
              required: "Full Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
              pattern: {
                value: /^[a-zA-Z\s.'-]+$/,
                message: "Name can only contain letters, spaces, dots, hyphens and apostrophes",
              },
            }}
            error={!!errors.contactPerson?.fullName}
            helperText={errors.contactPerson?.fullName?.message}
          />

          <LabeledInput
            label="Designation"
            name="contactPerson.designation"
            placeholder="Enter Designation"
            required
            register={register}
            validation={{
              required: "Designation is required",
              minLength: {
                value: 2,
                message: "Designation must be at least 2 characters",
              },
            }}
            error={!!errors.contactPerson?.designation}
            helperText={errors.contactPerson?.designation?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            label="Phone Number"
            name="contactPerson.phoneNumber"
            placeholder="Enter Phone Number"
            required
            register={register}
            validation={{
              required: "Phone Number is required",
              pattern: {
                value: /^\+91[0-9]{10}$/,
                message: "Please enter a valid Indian phone number starting with +91 and 10 digits",
              },
            }}
            error={!!errors.contactPerson?.phoneNumber}
            helperText={errors.contactPerson?.phoneNumber?.message}
          />

          <LabeledInput
            label="Email Address"
            name="contactPerson.email"
            placeholder="Enter E-mail Address"
            type="email"
            required
            register={register}
            validation={{
              required: "Email Address is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            }}
            error={!!errors.contactPerson?.email}
            helperText={errors.contactPerson?.email?.message}
          />
        </div>

        {/* Area Officer Assignment */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="max-w-md">
            <LabeledDropdown
              label="Assign Area Officer"
              name="areaOfficerId"
              placeholder="Select Area Officer"
              required
              register={register}
              validation={{
                required: "Area Officer assignment is required",
              }}
              options={areaOfficerOptions}
              error={!!errors.areaOfficerId}
              helperText={errors.areaOfficerId?.message || "Select an area officer to supervise this site"}
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                const selectedValue = e.target.value as string;
                setValue("areaOfficerId", selectedValue);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
