import LabeledInput from "@components/LabeledInput";
import { useUpdateClient } from "@modules/clients/apis/hooks/useClient";
import { useClientContext } from "@modules/clients/context/ClientContext";
import { Alert, Box, Button, CircularProgress, Divider, Modal } from "@mui/material";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

interface FormData {
  address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    district: string;
    pincode: string;
    state: string;
  };
  contactDetails: {
    contactPerson: {
      fullName: string;
      designation: string;
      phoneNumber: string;
    };
    emergencyContact: {
      fullName: string;
      designation: string;
      phoneNumber: string;
    };
  };
}

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
};

interface MainOfficeModalProps {
  open: boolean;
  onClose: () => void;
}
export const MainOfficeModal: React.FC<MainOfficeModalProps> = ({ open, onClose }) => {
  const { clientId } = useParams();
  const { clientDetails } = useClientContext();
  const { mutate: updateClient, isPending, error, isSuccess } = useUpdateClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  // Initialize form with client data when modal opens
  useEffect(() => {
    if (open && clientDetails) {
      reset({
        address: {
          addressLine1: clientDetails.addressLine1 || "",
          addressLine2: clientDetails.addressLine2 || "",
          city: clientDetails.city || "",
          district: clientDetails.district || "",
          pincode: clientDetails.pinCode?.toString() || "",
          state: clientDetails.state || "",
        },
        contactDetails: {
          contactPerson: {
            fullName: clientDetails.contactPersonFullName || "",
            designation: clientDetails.designation || "",
            phoneNumber: clientDetails.contactPhone || "",
          },
          emergencyContact: {
            fullName: clientDetails.emergencyContactName || "",
            designation: clientDetails.emergencyContactDesignation || "",
            phoneNumber: clientDetails.emergencyContactPhone || "",
          },
        },
      });
    }
  }, [open, clientDetails, reset]);

  // Close modal on successful update
  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  const onSubmit = (data: FormData) => {
    if (!clientId) return;

    console.log("Form data:", data);

    // Create FormData according to the backend API specification
    const formData = new FormData();

    // Address fields (if supported by backend)
    if (data.address?.addressLine1) {
      formData.append("addressLine1", data.address.addressLine1);
    }
    if (data.address?.addressLine2) {
      formData.append("addressLine2", data.address.addressLine2);
    }
    if (data.address?.city) {
      formData.append("city", data.address.city);
    }
    if (data.address?.district) {
      formData.append("district", data.address.district);
    }
    if (data.address?.pincode) {
      formData.append("pinCode", data.address.pincode);
    }
    if (data.address?.state) {
      formData.append("state", data.address.state);
    }

    // Client name (preserve existing)
    if (clientDetails?.clientName) {
      formData.append("clientName", clientDetails.clientName);
    }

    // Contact person details
    if (data.contactDetails?.contactPerson?.fullName) {
      formData.append("contactPersonFullName", data.contactDetails.contactPerson.fullName);
    }
    if (data.contactDetails?.contactPerson?.designation) {
      formData.append("designation", data.contactDetails.contactPerson.designation);
    }
    if (data.contactDetails?.contactPerson?.phoneNumber) {
      formData.append("contactPhone", data.contactDetails.contactPerson.phoneNumber);
    }

    // Contact email (preserve existing)
    if (clientDetails?.contactEmail) {
      formData.append("contactEmail", clientDetails.contactEmail);
    }

    // Emergency contact details
    if (data.contactDetails?.emergencyContact?.fullName) {
      formData.append("emergencyContactName", data.contactDetails.emergencyContact.fullName);
    }
    if (data.contactDetails?.emergencyContact?.designation) {
      formData.append("emergencyContactDesignation", data.contactDetails.emergencyContact.designation);
    }
    if (data.contactDetails?.emergencyContact?.phoneNumber) {
      formData.append("emergencyContactPhone", data.contactDetails.emergencyContact.phoneNumber);
    }

    // Emergency contact email (preserve existing)
    if (clientDetails?.emergencyContactEmail) {
      formData.append("emergencyContactEmail", clientDetails.emergencyContactEmail);
    }

    // Landmark (preserve existing)
    if (clientDetails?.landMark) {
      formData.append("landMark", clientDetails.landMark);
    }

    console.log("FormData entries:", Object.fromEntries(formData.entries()));

    updateClient({ clientId, data: formData });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Update Basic Details</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            type="button"
          >
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update client details. Please try again.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 flex flex-col gap-2">
            <span className="text-xs text-[#707070]">ADDRESS</span>
            <Divider />
            <div className="grid grid-cols-3 gap-4">
              <LabeledInput
                label="Address Line 1"
                name="address.addressLine1"
                placeholder="Enter Flat no./House No./  Floor/ Building/Apartment Name"
                required
                register={register}
                validation={{
                  required: "Address Line 1 is required",
                }}
                error={!!(errors as any).address?.addressLine1}
                helperText={(errors as any).address?.addressLine1?.message}
              />
              <LabeledInput
                label="Address Line 2"
                name="address.addressLine2"
                placeholder="Enter Street Name/ Road /Lane"
                register={register}
                validation={{
                  required: "Address Line 2 is required",
                }}
                error={!!(errors as any).address?.addressLine2}
                helperText={(errors as any).address?.addressLine2?.message}
              />
              <LabeledInput
                label="Village/Town/City"
                name="address.city"
                placeholder="Enter City/Town/Village Name"
                required
                register={register}
                validation={{
                  required: "City/Town/Village is required",
                }}
                error={!!(errors as any).address?.city}
                helperText={(errors as any).address?.city?.message}
              />
              <LabeledInput
                label="District"
                name="address.district"
                placeholder="Enter District Name"
                required
                register={register}
                validation={{
                  required: "District is required",
                }}
                error={!!(errors as any).address?.district}
                helperText={(errors as any).address?.district?.message}
              />
              <LabeledInput
                label="Pin Code"
                name="address.pincode"
                placeholder="Enter Pin Code"
                required
                register={register}
                validation={{
                  required: "Pin Code is required",
                }}
                error={!!(errors as any).address?.pincode}
                helperText={(errors as any).address?.pincode?.message}
              />
              <LabeledInput
                label="State"
                name="address.state"
                placeholder="Enter State Name"
                required
                register={register}
                validation={{
                  required: "State is required",
                }}
                error={!!(errors as any).address?.state}
                helperText={(errors as any).address?.state?.message}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <span className="text-xs text-[#707070]">CONTACT PERSON</span>
            <Divider />
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-2">
              <LabeledInput
                label="Full Name"
                name="contactDetails.contactPerson.fullName"
                placeholder="Enter Full Name"
                required
                register={register}
                validation={{
                  required: "Full Name is required",
                }}
                error={!!(errors as any).contactDetails?.contactPerson?.fullName}
                helperText={(errors as any).contactDetails?.contactPerson?.fullName?.message}
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
                error={!!(errors as any).contactDetails?.contactPerson?.designation}
                helperText={(errors as any).contactDetails?.contactPerson?.designation?.message}
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
                    message: "Please enter a valid phone number in format +911234567890",
                  },
                }}
                error={!!(errors as any).contactDetails?.contactPerson?.phoneNumber}
                helperText={(errors as any).contactDetails?.contactPerson?.phoneNumber?.message}
              />
            </div>
          </div>
          {/* Emergency Contact Section */}
          <div className="mt-4 flex flex-col gap-2">
            <span className="text-xs text-[#707070]">CONTACT PERSON 2</span>
            <Divider />
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-2">
              <LabeledInput
                label="Full Name"
                name="contactDetails.emergencyContact.fullName"
                placeholder="Enter Full Name"
                required
                register={register}
                validation={{
                  required: "Full Name is required",
                }}
                error={!!(errors as any).contactDetails?.emergencyContact?.fullName}
                helperText={(errors as any).contactDetails?.emergencyContact?.fullName?.message}
              />
              <LabeledInput
                label="Designation"
                name="contactDetails.emergencyContact.designation"
                placeholder="Enter Designation"
                required
                register={register}
                validation={{
                  required: "Designation is required",
                }}
                error={!!(errors as any).contactDetails?.emergencyContact?.designation}
                helperText={(errors as any).contactDetails?.emergencyContact?.designation?.message}
              />
              <LabeledInput
                label="Phone Number"
                name="contactDetails.emergencyContact.phoneNumber"
                placeholder="Enter Phone Number"
                required
                register={register}
                validation={{
                  required: "Phone Number is required",
                  pattern: {
                    value: /^\+91[0-9]{10}$/,
                    message: "Please enter a valid phone number in format +911234567890",
                  },
                }}
                error={!!(errors as any).contactDetails?.emergencyContact?.phoneNumber}
                helperText={(errors as any).contactDetails?.emergencyContact?.phoneNumber?.message}
              />
            </div>
          </div>

          {/* Submit Buttons */}
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
