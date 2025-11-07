import LabeledInput from "@components/LabeledInput";
import type { ClientFormData } from "@modules/clients/types";
import { Button, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

export default function ContactDetailsForm() {
  const {
    register,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    unregister,
  } = useFormContext<ClientFormData>();
  const [showContactPerson2, setShowContactPerson2] = useState(false);

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      const contactPhone = values?.contactDetails?.contactPerson?.phoneNumber;
      const emergencyPhone = values?.contactDetails?.emergencyContact?.phoneNumber;
      if (
        name === "contactDetails.contactPerson.phoneNumber" ||
        name === "contactDetails.emergencyContact.phoneNumber"
      ) {
        if (contactPhone && emergencyPhone && contactPhone === emergencyPhone) {
          setError("contactDetails.emergencyContact.phoneNumber", {
            type: "manual",
            message: "Emergency contact phone number cannot be the same as contact person phone number",
          });
        } else {
          const err = errors?.contactDetails?.emergencyContact?.phoneNumber;
          if (err && err.type === "manual") {
            clearErrors("contactDetails.emergencyContact.phoneNumber");
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setError, clearErrors, errors]);

  useEffect(() => {
    if (!showContactPerson2) {
      unregister("contactDetails.emergencyContact.fullName");
      unregister("contactDetails.emergencyContact.designation");
      unregister("contactDetails.emergencyContact.phoneNumber");
      unregister("contactDetails.emergencyContact.email");
    }
  }, [showContactPerson2, unregister]);

  return (
    <div className="flex flex-col gap-2 bg-white mt-2 rounded-xl p-6 pb-10">
      <h2 className="text-xl text-[#2A77D5] mb-2">CONTACT DETAILS</h2>

      <h3>CONTACT PERSON</h3>
      <Divider />
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
        <LabeledInput
          label="Full Name"
          name="contactDetails.contactPerson.fullName"
          placeholder="Enter Full Name"
          required
          register={register}
          validation={{
            required: "Full Name is required",
          }}
          error={!!errors.contactDetails?.contactPerson?.fullName}
          helperText={errors.contactDetails?.contactPerson?.fullName?.message}
        />
        <LabeledInput
          label="Designation"
          name="contactDetails.contactPerson.designation"
          placeholder="Enter Designation"
          required
          register={register}
          validation={{
            required: "Designation is required",
          }}
          error={!!errors.contactDetails?.contactPerson?.designation}
          helperText={errors.contactDetails?.contactPerson?.designation?.message}
        />
        <LabeledInput
          label="Phone Number"
          name="contactDetails.contactPerson.phoneNumber"
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
          error={!!errors.contactDetails?.contactPerson?.phoneNumber}
          helperText={errors.contactDetails?.contactPerson?.phoneNumber?.message}
        />
        <LabeledInput
          label="Email"
          name="contactDetails.contactPerson.email"
          placeholder="Enter Email Address"
          required
          register={register}
          validation={{
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Please enter a valid email address",
            },
          }}
          error={!!errors.contactDetails?.contactPerson?.email}
          helperText={errors.contactDetails?.contactPerson?.email?.message}
        />
      </div>
      <div className="mt-4">
        <Button type="button" variant="contained" onClick={() => setShowContactPerson2((prev) => !prev)}>
          {showContactPerson2 ? "Remove additional contact" : "Add another contact"}
        </Button>
      </div>
      {showContactPerson2 && (
        <div className="mt-6 flex flex-col gap-2">
          <h3>CONTACT PERSON 2 (Optional)</h3>
          <Divider />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            <LabeledInput
              label="Full Name"
              name="contactDetails.emergencyContact.fullName"
              placeholder="Enter Full Name"
              register={register}
              validation={{}}
              error={!!errors.contactDetails?.emergencyContact?.fullName}
              helperText={errors.contactDetails?.emergencyContact?.fullName?.message}
            />
            <LabeledInput
              label="Designation"
              name="contactDetails.emergencyContact.designation"
              placeholder="Enter Designation"
              register={register}
              validation={{}}
              error={!!errors.contactDetails?.emergencyContact?.designation}
              helperText={errors.contactDetails?.emergencyContact?.designation?.message}
            />
            <LabeledInput
              label="Phone Number"
              name="contactDetails.emergencyContact.phoneNumber"
              placeholder="Enter Phone Number"
              register={register}
              validation={{
                pattern: {
                  value: /^\+91[0-9]{10}$/,
                  message: "Please enter a valid Indian phone number starting with +91 and 10 digits",
                },
              }}
              error={!!errors.contactDetails?.emergencyContact?.phoneNumber}
              helperText={errors.contactDetails?.emergencyContact?.phoneNumber?.message}
            />
            <LabeledInput
              label="Email"
              name="contactDetails.emergencyContact.email"
              placeholder="Enter Email Address"
              register={register}
              validation={{
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Please enter a valid email address",
                },
              }}
              error={!!errors.contactDetails?.emergencyContact?.email}
              helperText={errors.contactDetails?.emergencyContact?.email?.message}
            />
          </div>
        </div>
      )}
    </div>
  );
}
