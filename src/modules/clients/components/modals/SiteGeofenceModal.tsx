import { CustomSwitch } from "@components/CustomSwitch";
import LabeledInput from "@components/LabeledInput";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MapIcon from "@mui/icons-material/Map";
import { Box, Button, Divider, MenuItem, Modal, Select } from "@mui/material";
import { X } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useClientSiteUpdate } from "../../apis/hooks/useClientSiteUpdate";
import { useSiteGeofenceUpdate } from "../../apis/hooks/useSiteGeofenceUpdate";
import GeoFencingModal from "./GeoFencingModal";

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
  width: "60vw",
};

interface SiteGeofenceModalProps {
  open: boolean;
  onClose: () => void;
  siteData: any;
}

export const SiteGeofenceModal: React.FC<SiteGeofenceModalProps> = ({ open, onClose, siteData }) => {
  const geofenceUpdateMutation = useSiteGeofenceUpdate();
  const siteUpdateMutation = useClientSiteUpdate();
  const [geoFencingModalOpen, setGeoFencingModalOpen] = useState(false);

  const methods = useForm({
    defaultValues: {
      geoFenceStatus: siteData?.geoFenceStatus || false,
      geofenceType: siteData?.geofenceType || "CIRCLE",
      geoFenceMapData: siteData?.geoFenceMapData || "",
      latitude: siteData?.latitude || "",
      longitude: siteData?.longitude || "",
      siteLocationMapLink: siteData?.siteLocationMapLink || "",
      plusCode: siteData?.plusCode || "",
      landMark: siteData?.landMark || "",
      geoLocation: {
        coordinates: {
          latitude: siteData?.latitude || "",
          longitude: siteData?.longitude || "",
        },
      },
      geoFencing: {
        type: siteData?.geofenceType || "CIRCLE",
      },
    },
  });

  const { register, handleSubmit, watch, setValue } = methods;

  const handleGeofenceSave = async (formData: any) => {
    try {
      if (!siteData?.id) return;
      await siteUpdateMutation.mutateAsync({
        siteId: siteData.id,
        data: {
          geoFenceStatus: formData.geoFenceStatus,
        },
      });
      if (formData.geoFenceStatus && formData.geofenceType && (formData.latitude || formData.longitude)) {
        await geofenceUpdateMutation.mutateAsync({
          siteId: siteData.id,
          data: {
            geoFenceStatus: formData.geoFenceStatus,
            geofenceType: formData.geofenceType,
            geoFenceMapData: formData.geoFenceMapData,
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0,
            siteLocationMapLink: formData.siteLocationMapLink,
            plusCode: formData.plusCode,
            landMark: formData.landMark,
          },
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to update geofence:", error);
      alert("Failed to update geofence configuration. Please try again.");
    }
  };

  const handleGeofenceToggle = async () => {
    const currentStatus = watch("geoFenceStatus");
    const newStatus = !currentStatus;
    try {
      if (!siteData?.id) return;
      setValue("geoFenceStatus", newStatus);
      await siteUpdateMutation.mutateAsync({
        siteId: siteData.id,
        data: {
          geoFenceStatus: newStatus,
        },
      });
    } catch (error) {
      console.error("Failed to toggle geofence status:", error);
      setValue("geoFenceStatus", currentStatus);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleGeofenceSave)}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2A77D5]">Geofencing</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                type="button"
              >
                <X className="w-6 h-6 text-[#2A77D5]" />
              </button>
            </div>
            <div>
              <h2 className="text-gray-600 text-sm font-medium">Geofence Status</h2>
              <CustomSwitch checked={watch("geoFenceStatus")} onChange={handleGeofenceToggle} />
            </div>
            <div className="space-y-4">
              <h2 className="text-gray-600 text-sm font-medium">GeoLocation</h2>
              <Divider sx={{ mb: 1 }} />
              <div className="space-y-4">
                <div className="inline-flex w-full gap-4 items-center">
                  <LabeledInput
                    label="Site Location Map Link"
                    name="siteLocationMapLink"
                    placeholder="https://www.google.com/maps?q=21.146633,79.088860"
                    register={register}
                  />
                  <Button
                    variant="contained"
                    startIcon={<MapIcon />}
                    sx={{ height: "fit-content", mt: 2 }}
                    onClick={() => {
                      if (watch("siteLocationMapLink")) {
                        window.open(watch("siteLocationMapLink"), "_blank");
                      }
                    }}
                  >
                    OPEN ON MAP
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 w-[30vw]">
                  <LabeledInput
                    label="Latitude Coordinates"
                    name="latitude"
                    placeholder="21.146633"
                    register={register}
                  />
                  <LabeledInput
                    label="Longitude Coordinates"
                    name="longitude"
                    placeholder="79.088860"
                    register={register}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 w-[30vw]">
                  <LabeledInput
                    label="Plus Code"
                    name="plusCode"
                    placeholder="7FG3+V3, XYZ12345)"
                    register={register}
                  />
                  <LabeledInput label="Landmark" name="landMark" placeholder="Near XYZ Building" register={register} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-gray-600 text-sm font-medium">Geofence Type</h2>
              <Divider sx={{ mb: 1 }} />
              <div className="space-y-4">
                <div className="inline-flex gap-4 items-center">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Geofence</label>
                    <Select
                      value={watch("geofenceType")}
                      onChange={(e) => setValue("geofenceType", e.target.value)}
                      size="small"
                      IconComponent={KeyboardArrowDownIcon}
                      sx={{
                        borderRadius: "8px",
                        "& .MuiSelect-select": {
                          padding: "10px 14px",
                        },
                      }}
                    >
                      <MenuItem value="CIRCLE">Circular Geofence</MenuItem>
                      <MenuItem value="POLYGON">Polygon Geofence</MenuItem>
                    </Select>
                  </div>
                  <Button
                    variant="contained"
                    startIcon={<MapIcon />}
                    sx={{
                      mt: 2,
                    }}
                    onClick={() => setGeoFencingModalOpen(true)}
                  >
                    MARK GEOFENCE ON MAP
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" onClick={onClose} variant="outlined">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={geofenceUpdateMutation.isPending || siteUpdateMutation.isPending}
              >
                {geofenceUpdateMutation.isPending || siteUpdateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
          <GeoFencingModal
            isOpen={geoFencingModalOpen}
            onClose={() => setGeoFencingModalOpen(false)}
            mode="site"
            title="Mark Site Geofence"
          />
        </FormProvider>
      </Box>
    </Modal>
  );
};
