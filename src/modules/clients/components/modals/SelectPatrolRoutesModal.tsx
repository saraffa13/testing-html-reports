import { Check } from "@mui/icons-material";
import { Box, Button, Divider, Modal } from "@mui/material";
import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { ClientSite } from "../forms/add_client_site/types";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffffff",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  width: "50vw",
  maxHeight: "95vh",
  overflow: "auto",
};

interface SelectPatrolRoutesModalProps {
  open: boolean;
  onClose: () => void;
  siteIndex?: number;
  shiftIndex?: number;
  guardIndex?: number;
}

const fallbackRoutes = ["Backgate", "Parking", "1st Floor", "Basement Godown"];

export const SelectPatrolRoutesModal: React.FC<SelectPatrolRoutesModalProps> = ({
  open,
  onClose,
  siteIndex = 0,
  shiftIndex = 0,
  guardIndex = 0,
}) => {
  const { watch, setValue } = useFormContext<ClientSite>();

  const fieldPath: `sitePosts.${number}.shifts.${number}.guardRequirements.${number}.selectPatrolRoutes` = `sitePosts.${siteIndex}.shifts.${shiftIndex}.guardRequirements.${guardIndex}.selectPatrolRoutes`;

  const selectedRoutes = watch(fieldPath) || [];

  const sitePatrolRoutes = watch("patroling.patrolRouteDetails") || [];

  const availableRoutes =
    sitePatrolRoutes.length > 0
      ? sitePatrolRoutes.filter((route) => route && route.name && route.name.trim()).map((route) => route.name.trim())
      : fallbackRoutes;

  const handleRouteToggle = (route: string) => {
    const isSelected = selectedRoutes.includes(route);
    let newSelectedRoutes: string[];

    if (isSelected) {
      newSelectedRoutes = selectedRoutes.filter((r: string) => r !== route);
    } else {
      newSelectedRoutes = [...selectedRoutes, route];
    }

    setValue(fieldPath, newSelectedRoutes, { shouldDirty: true, shouldValidate: true });
  };

  const handleSave = () => {
    onClose();
  };

  const isRouteSelected = (route: string) => selectedRoutes.includes(route);

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-[#2A77D5]">Set up Patrol Route</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            type="button"
          >
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>

        <div className="flex flex-col w-full text-left">
          <div className="flex flex-col mx-auto">
            <span className="text-[#707070] font-semibold text-sm">Multi-Select If Applicable</span>
            <Divider />

            <div className="grid grid-cols-2 mt-2 gap-4">
              {availableRoutes.map((route, index) => {
                const isSelected = isRouteSelected(route);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleRouteToggle(route)}
                    className={`px-4 py-2 border-2 rounded-full shadow inline-flex gap-2 items-center transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? "border-[#2A77D5] bg-[#F1F7FE] text-[#2A77D5]"
                        : "border-gray-300 bg-white text-gray-600 hover:border-[#2A77D5] hover:bg-[#F1F7FE]"
                    }`}
                  >
                    {isSelected && (
                      <Check
                        sx={{
                          color: "#2A77D5",
                          transition: "color 0.2s ease",
                        }}
                      />
                    )}
                    {route}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 mx-auto">
            <Button variant="contained" onClick={handleSave}>
              Save Selection ({selectedRoutes.length})
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};
