import { MainOfficeModal } from "@modules/clients/components/modals/MainOfficeModal";
import { UniformSetupModal } from "@modules/clients/components/modals/UniformSetupModal";
import { useClientContext } from "@modules/clients/context/ClientContext";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import { CircularProgress, Divider, Typography } from "@mui/material";
import { useState } from "react";

export default function Profile() {
  const { clientDetails, isLoadingClient, clientError } = useClientContext();

  const [uniformSetupOpen, setUniformSetupOpen] = useState(false);
  const [mainOfficeOpen, setMainOfficeOpen] = useState(false);

  if (isLoadingClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading client data...</Typography>
      </div>
    );
  }

  if (clientError) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography color="error">Error loading client data</Typography>
      </div>
    );
  }

  const client = clientDetails || ({} as any);

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-center">
        <div className="inline-flex gap-2 items-center">
          <h2 className="font-semibold">Profile</h2>
        </div>
      </div>
      <div className="flex flex-row gap-4 mt-4">
        <div className="flex flex-col gap-2 bg-white p-4 rounded-lg w-[20vw]">
          <div className="inline-flex justify-between">
            <span className="font-semibold">Basic Details</span>
            <button
              onClick={() => setMainOfficeOpen(true)}
              className="bg-white shadow-lg p-2 rounded-full text-[#2A77D5]"
            >
              <ModeEditOutlineOutlinedIcon />
            </button>
          </div>
          <span className="font-semibold text-[#707070]">Address</span>
          <div className="grid gap-x-4 gap-y-1 w-fit grid-cols-[1fr_3fr]">
            <span className="text-[#A3A3A3]">Address</span>
            <span>
              {client.addressLine1
                ? `${client.addressLine1}${client.addressLine2 ? `, ${client.addressLine2}` : ""}, ${client.city || ""}, ${client.state || ""} ${client.pinCode || ""}`
                : "No address available"}
            </span>
            <span className="text-[#A3A3A3]">Landmark</span>
            <span>{client.landMark || "No landmark specified"}</span>
          </div>
          <Divider />

          <span className="font-semibold text-[#707070]">Contact Person</span>
          <div className="flex flex-row bg-[#F7F7F7] p-2 rounded-lg justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{client.contactPersonFullName || "No contact person"}</span>
              <span>{client.designation || "No designation"}</span>
              <span>{client.contactPhone || "No phone number"}</span>
              <span className="text-sm text-gray-600">{client.contactEmail || "No email"}</span>
            </div>
          </div>

          <span className="font-semibold text-[#707070]">Emergency Contact</span>
          <div className="flex flex-row bg-[#F7F7F7] p-2 rounded-lg justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{client.emergencyContactName || "No emergency contact"}</span>
              <span>{client.emergencyContactDesignation || "No designation"}</span>
              <span>{client.emergencyContactPhone || "No phone number"}</span>
              <span className="text-sm text-gray-600">{client.emergencyContactEmail || "No email"}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 bg-white p-4 rounded-lg w-[20vw] h-fit">
          <div className="inline-flex justify-between">
            <span className="font-semibold">Uniform Setup</span>
            <button
              onClick={() => {
                setUniformSetupOpen(true);
              }}
              className="bg-white shadow-lg p-2 rounded-full text-[#2A77D5]"
            >
              <ModeEditOutlineOutlinedIcon />
            </button>
          </div>
          <span className="font-semibold text-[#707070]">Address</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-fit">
            <span className="text-[#A3A3A3]">Uniform Type</span>
            <span>Custom </span>
            <span className="text-[#A3A3A3]">Uniform Count</span>
            <span>4 </span>
            <span className="text-[#A3A3A3]">Uploaded Images</span>
            <span>23 </span>
          </div>
          <Divider />

          <span className="font-semibold text-[#707070]">Uniform Names</span>
          <div className="flex flex-col gap-1">
            <span>1. Regular Day Guard</span>
            <span>2. Regular Lady Guard</span>
            <span>3. Gun Man</span>
            <span>4. Personal Guard</span>
          </div>
        </div>
      </div>
      <UniformSetupModal
        open={uniformSetupOpen}
        onClose={() => {
          setUniformSetupOpen(false);
        }}
      />
      <MainOfficeModal open={mainOfficeOpen} onClose={() => setMainOfficeOpen(false)} />
    </div>
  );
}
