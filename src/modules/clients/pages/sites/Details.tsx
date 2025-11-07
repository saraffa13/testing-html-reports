import { useClientSiteUpdate } from "@modules/clients/apis/hooks/useClientSiteUpdate";
import { useGetClientSiteById } from "@modules/clients/apis/hooks/useGetClientSitesById";
import { PatrolModal } from "@modules/clients/components/modals/PatrolModal";
import { SiteGeofenceModal } from "@modules/clients/components/modals/SiteGeofenceModal";
import {
  AssignedOfficerModal,
  BasicDetailsModal,
  ContactPersonModal,
} from "@modules/clients/components/modals/SiteUpdateModals";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import { useState } from "react";
import { useParams } from "react-router-dom";

export const SiteDetails = () => {
  const [geofenceModal, setGeofenceModal] = useState(false);
  const [patrolModal, setPatrolModal] = useState(false);
  const [basicModal, setBasicModal] = useState(false);
  const [officerModal, setOfficerModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const { siteId } = useParams();
  const { data: siteRaw, isLoading, refetch } = useGetClientSiteById(siteId!);
  const siteUpdateMutation = useClientSiteUpdate();
  const site = (siteRaw as any)?.data?.siteData || {};

  const handlePatrollingToggle = async () => {
    try {
      await siteUpdateMutation.mutateAsync({
        siteId: siteId!,
        data: {
          patrolling: !site.patrolling,
        },
      });
      refetch();
    } catch (error) {
      console.error("Failed to update patrolling status:", error);
    }
  };

  const handleGeofenceToggle = async () => {
    try {
      await siteUpdateMutation.mutateAsync({
        siteId: siteId!,
        data: {
          geoFenceStatus: !site.geoFenceStatus,
        },
      });
      refetch();
    } catch (error) {
      console.error("Failed to update geofence status:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!site) return <div>No site data found.</div>;

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="grid grid-cols-2 gap-4 w-[60vw]">
        <div className="flex flex-col gap-2 bg-white p-4 rounded-lg min-w-[20vw]">
          <div className="inline-flex justify-between">
            <span className="font-semibold">Basic Details</span>
            <button className="bg-white shadow-lg p-2 rounded-full text-[#2A77D5]" onClick={() => setBasicModal(true)}>
              <ModeEditOutlineOutlinedIcon />
            </button>
          </div>

          <div className="grid gap-x-4 gap-y-1 w-fit grid-cols-[1fr_3fr]">
            <span className="text-[#A3A3A3]">Site Type</span>
            <span>{Array.isArray(site.siteType) ? site.siteType.join(", ") : site.siteType}</span>
            <span className="text-[#A3A3A3]">Address</span>
            <span>
              {[site.addressLine1, site.addressLine2, site.city, site.district, site.state, site.pinCode]
                .filter(Boolean)
                .join(", ")}
            </span>
            <span className="text-[#A3A3A3]">Geolocation</span>
            <button
              className="w-fit text-[#2A77D5] cursor-pointer text-sm"
              disabled={!site.siteLocationMapLink}
              onClick={() => site.siteLocationMapLink && window.open(site.siteLocationMapLink, "_blank")}
            >
              <LocationOnOutlinedIcon />
              VIEW ON MAP
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-white p-4 rounded-lg min-w-[20vw]">
          <div className="inline-flex justify-between">
            <span className="font-semibold">Contact Person</span>
            <button
              className="bg-white shadow-lg p-2 rounded-full text-[#2A77D5]"
              onClick={() => setContactModal(true)}
            >
              <ModeEditOutlineOutlinedIcon />
            </button>
          </div>
          <div className="grid gap-x-2 gap-y-1 grid-cols-[1fr_3fr]">
            <span className="text-[#A3A3A3]">Name</span>
            <span>{site.siteContactPersonFullName || "-"}</span>
            <span className="text-[#A3A3A3]">Designation</span>
            <span>{site.siteContactDesignation || "-"}</span>
            <span className="text-[#A3A3A3]">Phone</span>
            <span>{site.siteContactPhone || "-"}</span>
            <span className="text-[#A3A3A3]">Email</span>
            <span>{site.siteContactEmail || "-"}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-2 bg-white p-4 rounded-lg min-w-[15vw]">
          <span className="font-semibold">Assigned Officers</span>
          {site.areaOfficer ? (
            <div className="flex flex-row bg-[#F7F7F7] p-2 rounded-lg justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {site.areaOfficer.firstName} {site.areaOfficer.lastName}
                </span>
                <span>Area Officer</span>
                <span>{site.areaOfficer.phoneNumber}</span>
              </div>
              <button
                className="bg-white shadow-lg p-2 rounded-full text-[#2A77D5] h-fit w-fit"
                onClick={() => setOfficerModal(true)}
              >
                <ModeEditOutlineOutlinedIcon />
              </button>
            </div>
          ) : (
            <span className="text-[#A3A3A3]">No officer assigned</span>
          )}
        </div>
        <div className="flex flex-col gap-2 bg-white p-4 rounded-lg min-w-[15vw]">
          <div className="inline-flex justify-between">
            <span className="font-semibold">Geofencing</span>
            <button
              onClick={() => setGeofenceModal(true)}
              className="bg-white shadow-lg p-2 rounded-full text-[#2A77D5]"
            >
              <ModeEditOutlineOutlinedIcon />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 h-fit">
            <span className="text-[#A3A3A3]">Status</span>
            <button
              onClick={handleGeofenceToggle}
              className="inline-flex gap-2 w-fit items-center cursor-pointer hover:opacity-70 transition-opacity"
              disabled={siteUpdateMutation.isPending}
            >
              {site.geoFenceStatus ? (
                <ToggleOnIcon className="text-[#5CC168]" />
              ) : (
                <ToggleOffIcon className="text-[#A3A3A3]" />
              )}
              {site.geoFenceStatus ? "ON" : "OFF"}
            </button>
            <span className="text-[#A3A3A3]">Geofence Type</span>
            <span>{site.geofenceType || "-"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 bg-white p-4 rounded-lg min-w-[15vw]">
          <div className="inline-flex justify-between">
            <span className="font-semibold">Patrolling</span>
            <button onClick={() => setPatrolModal(true)} className="bg-white shadow-lg p-2 rounded-full text-[#2A77D5]">
              <ModeEditOutlineOutlinedIcon />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 h-fit">
            <span className="text-[#A3A3A3]">Status</span>
            <button
              onClick={handlePatrollingToggle}
              className="inline-flex gap-2 w-fit items-center cursor-pointer hover:opacity-70 transition-opacity"
              disabled={siteUpdateMutation.isPending}
            >
              {site.patrolling ? (
                <ToggleOnIcon className="text-[#5CC168]" />
              ) : (
                <ToggleOffIcon className="text-[#A3A3A3]" />
              )}
              {site.patrolling ? "ON" : "OFF"}
            </button>
            <span className="text-[#A3A3A3]">Patrol Routes</span>
            <span>{Array.isArray(site.PatrolRoutes) ? site.PatrolRoutes.length : 0}</span>
          </div>
        </div>
      </div>
      <SiteGeofenceModal
        open={geofenceModal}
        onClose={() => {
          setGeofenceModal(false);
          refetch();
        }}
        siteData={site}
      />
      <PatrolModal
        open={patrolModal}
        onClose={() => {
          setPatrolModal(false);
        }}
        refetch={refetch}
        siteData={site}
      />
      <BasicDetailsModal
        open={basicModal}
        onClose={() => {
          setBasicModal(false);
          refetch();
        }}
        siteData={site}
      />
      <AssignedOfficerModal
        open={officerModal}
        onClose={() => {
          setOfficerModal(false);
          refetch();
        }}
        siteData={site}
      />
      <ContactPersonModal
        open={contactModal}
        onClose={() => {
          setContactModal(false);
          refetch();
        }}
        siteData={site}
      />
    </div>
  );
};
