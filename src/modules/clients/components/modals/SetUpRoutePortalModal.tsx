import { CustomSwitch } from "@components/CustomSwitch";
import FileUpload from "@components/FileUpload";
import LabeledInput from "@components/LabeledInput";
import { Add, Check } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PinDropOutlinedIcon from "@mui/icons-material/PinDropOutlined";
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Modal,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ClientSite } from "../forms/add_client_site/types";

interface SetUpRoutePortalProps {
  open: boolean;
  onClose: () => void;
}

interface CheckpointFile {
  qrFile: File | null;
  photoFile: File | null;
  locationFile: File | null;
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
  width: "90vw",
  maxHeight: "95vh",
  overflow: "auto",
};

export const SetUpRoutePortal: React.FC<SetUpRoutePortalProps> = ({ open, onClose }) => {
  const [patrolFrequency, setPatrolFrequency] = useState<boolean>(false);
  const [checkpointFiles, setCheckpointFiles] = useState<CheckpointFile[]>([
    { qrFile: null, photoFile: null, locationFile: null },
  ]);
  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0);
  const [savePatrolRoute, setSavePatrolRoute] = useState<boolean>(false);

  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<ClientSite>();

  // const currentPatrolDetails = watch("patroling.patrolRouteDetails") || [];

  const {
    fields: routeFields,
    append: appendRoute,
    // remove: removeRoute,
  } = useFieldArray({
    control,
    name: "patroling.patrolRouteDetails",
  });

  const {
    fields: checkpointFields,
    append: appendCheckpoint,
    remove: removeCheckpoint,
  } = useFieldArray({
    control,
    name: `patroling.patrolRouteDetails.${activeRouteIndex}.patrolCheckpoints`,
  });

  useEffect(() => {
    if (routeFields.length > 0) {
      const frequencyType = watch(`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.type`);
      setPatrolFrequency(frequencyType === "count");
    }
  }, [activeRouteIndex, watch, routeFields.length]);

  const handleQrUpload = (file: File | null, index: number) => {
    setCheckpointFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qrFile: file };
      return updated;
    });

    if (file) {
      setValue(`patroling.patrolRouteDetails.${activeRouteIndex}.patrolCheckpoints.${index}.qrCode`, file.name, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handlePhotoUpload = (file: File | null, index: number) => {
    setCheckpointFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], photoFile: file };
      return updated;
    });

    if (file) {
      setValue(`patroling.patrolRouteDetails.${activeRouteIndex}.patrolCheckpoints.${index}.photo`, file.name, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleLocationUpload = (file: File | null, index: number) => {
    setCheckpointFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], locationFile: file };
      return updated;
    });
  };

  const handleCheckpointTypeChange = (checked: boolean, index: number) => {
    setValue(
      `patroling.patrolRouteDetails.${activeRouteIndex}.patrolCheckpoints.${index}.type`,
      checked ? "photo" : "qr code",
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  const addCheckpoint = () => {
    appendCheckpoint({
      type: "qr code",
      qrCode: "",
      photo: "",
    });
    setCheckpointFiles((prev) => [...prev, { qrFile: null, photoFile: null, locationFile: null }]);
  };

  const removeCheckpointHandler = (index: number) => {
    if (checkpointFields.length > 1) {
      removeCheckpoint(index);
      setCheckpointFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addNewPatrolRoute = () => {
    const newRouteIndex = routeFields.length;
    appendRoute({
      name: "",
      routeCode: "",
      patrolFrequency: {
        type: "time",
        hours: 1,
        minutes: 0,
        count: 0,
        numberOfPatrols: 1,
      },
      patrolCheckpoints: [
        {
          type: "qr code",
          qrCode: "",
          photo: "",
        },
      ],
    });
    setActiveRouteIndex(newRouteIndex);
    setCheckpointFiles([{ qrFile: null, photoFile: null, locationFile: null }]);
    setPatrolFrequency(false);
  };

  const switchToRoute = (index: number) => {
    setActiveRouteIndex(index);
    const currentRoute = routeFields[index];
    if (currentRoute) {
      const checkpointCount = watch(`patroling.patrolRouteDetails.${index}.patrolCheckpoints`)?.length || 1;
      setCheckpointFiles(Array(checkpointCount).fill({ qrFile: null, photoFile: null, locationFile: null }));
    }
    const frequencyType = watch(`patroling.patrolRouteDetails.${index}.patrolFrequency.type`);
    setPatrolFrequency(frequencyType === "count");
  };

  const handlePatrolRouteSave = () => {
    const currentRoute = watch(`patroling.patrolRouteDetails.${activeRouteIndex}`);
    if (!currentRoute?.name?.trim()) {
      alert("Please enter a patrol route name before saving.");
      return;
    }

    if (currentRoute.patrolFrequency?.type === "time") {
      const hours = currentRoute.patrolFrequency.hours || 0;
      const minutes = currentRoute.patrolFrequency.minutes || 0;
      if (hours === 0 && minutes === 0) {
        alert("Please set a valid time frequency (hours or minutes must be greater than 0).");
        return;
      }
    } else if (currentRoute.patrolFrequency?.type === "count") {
      const count = currentRoute.patrolFrequency.count || 0;
      if (count === 0) {
        alert("Please set a valid count for patrol frequency.");
        return;
      }
    }

    setValue("patroling.patrol", true, { shouldDirty: true, shouldValidate: true });
    setSavePatrolRoute(true);
  };

  const handleAddAnotherPatrolRoute = () => {
    setSavePatrolRoute(false);
    addNewPatrolRoute();
  };

  const handleCloseModal = () => {
    setSavePatrolRoute(false);
    onClose();
  };

  const renderCheckpoint = (field: any, index: number) => {
    const checkpointType =
      watch(`patroling.patrolRouteDetails.${activeRouteIndex}.patrolCheckpoints.${index}.type`) || "qr code";
    const isPhotoType = checkpointType === "photo";

    return (
      <div key={field.id} className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#707070] font-semibold text-sm">CHECKPOINT {index + 1}</span>
          {checkpointFields.length > 1 && (
            <IconButton
              onClick={() => removeCheckpointHandler(index)}
              size="small"
              className="text-red-500 hover:bg-red-50"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </div>

        <div className="flex flex-row gap-4 min-h-36">
          <div>
            <Typography
              sx={{
                typography: {
                  fontSize: "12px",
                },
                mb: 0.5,
                color: "#707070",
              }}
            >
              Check Type
            </Typography>
            <CustomSwitch
              checked={isPhotoType}
              onChange={(checked: boolean) => handleCheckpointTypeChange(checked, index)}
              labelOff="QR Code"
              labelOn="Photo"
            />
          </div>

          {/* Show QR code images for QR type checkpoints */}
          {!isPhotoType && (
            <div className="flex flex-row gap-4">
              {/* QR Code Image */}
              {checkpointFiles[index]?.qrFile && (
                <div>
                  <span className="text-sm mb-1 text-[#707070]">QR Code</span>
                  <div className="h-24 w-24 border rounded bg-gray-100 flex items-center justify-center relative">
                    <img
                      src={URL.createObjectURL(checkpointFiles[index].qrFile!)}
                      className="h-20 w-20 object-cover rounded"
                      alt={`QR Code ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        setValue(
                          `patroling.patrolRouteDetails.${activeRouteIndex}.patrolCheckpoints.${index}.qrCode`,
                          ""
                        );
                        setCheckpointFiles((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], qrFile: null };
                          return updated;
                        });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* QR Location Image */}
              {checkpointFiles[index]?.locationFile && (
                <div>
                  <span className="text-sm mb-1 text-[#707070]">QR Location</span>
                  <div className="h-24 w-24 border rounded bg-gray-100 flex items-center justify-center relative">
                    <img
                      src={URL.createObjectURL(checkpointFiles[index].locationFile!)}
                      className="h-20 w-20 object-cover rounded"
                      alt={`QR Location ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        setCheckpointFiles((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], locationFile: null };
                          return updated;
                        });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show photo image for photo type checkpoints */}
          {isPhotoType && (
            <div className="flex flex-row gap-4">
              {checkpointFiles[index]?.photoFile && (
                <div>
                  <span className="text-sm mb-1 text-[#707070]">Checkpoint Photo</span>
                  <div className="h-24 w-24 border rounded bg-gray-100 flex items-center justify-center relative">
                    <img
                      src={URL.createObjectURL(checkpointFiles[index].photoFile!)}
                      className="h-20 w-20 object-cover rounded"
                      alt={`Photo ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        setValue(
                          `patroling.patrolRouteDetails.${activeRouteIndex}.patrolCheckpoints.${index}.photo`,
                          ""
                        );
                        setCheckpointFiles((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], photoFile: null };
                          return updated;
                        });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload section for QR type */}
          {!isPhotoType && (
            <div className="flex flex-row gap-2">
              {/* Show QR Code upload only if no QR code exists */}
              {!checkpointFiles[index]?.qrFile && (
                <div className="w-[10vw] h-20">
                  <FileUpload
                    label="QR Code Image"
                    maxSize={10}
                    acceptedFileTypes="image/*"
                    onFileChange={(file) => handleQrUpload(file, index)}
                    placeholder="Upload QR Code"
                  />
                </div>
              )}
              {/* Show QR Location upload only if no QR location image exists */}
              {!checkpointFiles[index]?.locationFile && (
                <div className="w-[10vw] h-20">
                  <FileUpload
                    label="QR Location Photo"
                    maxSize={10}
                    acceptedFileTypes="image/*"
                    onFileChange={(file) => handleLocationUpload(file, index)}
                    placeholder="Upload Location Photo"
                  />
                </div>
              )}
            </div>
          )}

          {/* Upload section for photo type */}
          {isPhotoType && !checkpointFiles[index]?.photoFile && (
            <div className="w-[10vw] h-20">
              <FileUpload
                label="Checkpoint Photo"
                maxSize={10}
                acceptedFileTypes="image/*"
                onFileChange={(file) => handlePhotoUpload(file, index)}
                placeholder="Upload Photo"
              />
            </div>
          )}

          <div className="flex flex-row mt-auto">
            <div className="flex flex-col">
              <span className="text-sm mb-[0.5px] text-[#707070]">
                GPS Coordinate From {isPhotoType ? "Photo" : "QR Location"}
              </span>
              <span className="text-sm font-medium">41.40338, 2.17403</span>
            </div>
            <div className="h-10 w-10 flex justify-center items-center bg-white rounded-full ml-2">
              <PinDropOutlinedIcon sx={{ color: "#2A77D5" }} />
            </div>
          </div>
        </div>

        {index < checkpointFields.length - 1 && <Divider sx={{ borderColor: "#ffffff", mt: 2 }} />}
      </div>
    );
  };

  const Sidebar = () => (
    <div className="w-64 border bg-white border-[#F0F0F0] rounded-l-lg">
      <List dense disablePadding>
        {routeFields.map((route, index) => {
          const routeName = watch(`patroling.patrolRouteDetails.${index}.name`) || `Route ${index + 1}`;
          const checkPoints = watch(`patroling.patrolRouteDetails.${index}.patrolCheckpoints`)?.length || 0;
          return (
            <ListItem key={route.id} disablePadding>
              <ListItemButton
                selected={activeRouteIndex === index}
                onClick={() => switchToRoute(index)}
                sx={{
                  border: "1px solid #F0F0F0",
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "#ffffff",
                    borderColor: "#2A77D5",
                  },
                }}
              >
                <ListItemText
                  primary={routeName}
                  secondary={`Checkpoints ${checkPoints}`}
                  slotProps={{
                    primary: {
                      fontWeight: "bold",
                      color: "#707070",
                    },
                    secondary: { color: "#A3A3A3" },
                  }}
                />
                <ArrowForwardIosIcon sx={{ color: "#707070", fontSize: "16px" }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  const showSidebar = routeFields.length > 1;
  const currentRouteName =
    watch(`patroling.patrolRouteDetails.${activeRouteIndex}.name`) || `Route ${activeRouteIndex + 1}`;
  const currentCheckpointCount = checkpointFields.length;

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-[#2A77D5]">Set up Patrol Route</h2>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            type="button"
          >
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>
        {savePatrolRoute ? (
          <div className="flex flex-col justify-between">
            <div className="flex flex-col items-center justify-center h-[40vh]">
              <span className="text-2xl text-[#707070]">You have successfully added a Patrol Route.</span>
              <span className="text-2xl text-[#707070]">Route Name: {currentRouteName}</span>
              <span className="text-2xl text-[#707070]">Checkpoint Count: {currentCheckpointCount}</span>

              <div className="flex gap-4 mt-6">
                <Button onClick={handleAddAnotherPatrolRoute} variant="contained">
                  <Add /> ADD ANOTHER PATROL ROUTE
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex ${showSidebar ? "gap-0" : ""} h-full`}>
            {showSidebar && <Sidebar />}
            <div className={`flex-1 ${showSidebar ? "p-4 bg-[#F1F7FE] rounded-r-lg" : ""}`}>
              {showSidebar && <h2 className="text-2xl font-semibold text-[#2A77D5] mb-2">New Patrol Route</h2>}
              <div className="flex flex-row gap-6">
                <div className="flex flex-col gap-2 min-w-[300px]">
                  <span className="text-[#707070] font-semibold text-sm">
                    Patrol Route Details{" "}
                    {showSidebar &&
                      `- ${watch(`patroling.patrolRouteDetails.${activeRouteIndex}.name`) || `Route ${activeRouteIndex + 1}`}`}
                  </span>
                  <Divider />
                  <div className="flex flex-col gap-4 mt-2">
                    <LabeledInput
                      key={`route-name-${activeRouteIndex}`}
                      label="Patrol Route Name"
                      name={`patroling.patrolRouteDetails.${activeRouteIndex}.name`}
                      placeholder="Enter Patrol Route"
                      required
                      register={register}
                      validation={{
                        required: "Patrol Route Name is required",
                      }}
                      error={!!errors.patroling?.patrolRouteDetails?.[activeRouteIndex]?.name}
                      helperText={errors.patroling?.patrolRouteDetails?.[activeRouteIndex]?.name?.message}
                    />

                    <LabeledInput
                      key={`route-code-${activeRouteIndex}`}
                      label="Enter Patrol Route Code (Optional)"
                      name={`patroling.patrolRouteDetails.${activeRouteIndex}.routeCode`}
                      placeholder="Enter Route Code"
                      register={register}
                    />

                    <div>
                      <Typography
                        sx={{
                          typography: {
                            fontSize: "12px",
                          },
                          mb: 0.5,
                          color: "#707070",
                        }}
                      >
                        Patrol Frequency
                      </Typography>
                      <CustomSwitch
                        checked={patrolFrequency}
                        onChange={(checked: boolean) => {
                          setPatrolFrequency(checked);
                          setValue(
                            `patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.type`,
                            checked ? "count" : "time",
                            { shouldDirty: true, shouldValidate: true }
                          );

                          if (checked) {
                            setValue(`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.hours`, 0);
                            setValue(`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.minutes`, 0);
                            setValue(`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.count`, 1);
                          } else {
                            setValue(`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.count`, 0);
                            setValue(`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.hours`, 1);
                            setValue(`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.minutes`, 0);
                          }
                        }}
                        labelOff="Time"
                        labelOn="Count"
                      />
                    </div>

                    {!patrolFrequency && (
                      <div className="flex flex-row gap-4">
                        <LabeledInput
                          label="Hours"
                          name={`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.hours`}
                          placeholder="Enter Hours"
                          type="number"
                          register={register}
                          validation={{
                            min: { value: 0, message: "Hours cannot be negative" },
                            max: { value: 23, message: "Hours cannot exceed 23" },
                          }}
                          error={!!errors.patroling?.patrolRouteDetails?.[activeRouteIndex]?.patrolFrequency?.hours}
                          helperText={
                            errors.patroling?.patrolRouteDetails?.[activeRouteIndex]?.patrolFrequency?.hours?.message
                          }
                        />
                        <LabeledInput
                          label="Minutes"
                          name={`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.minutes`}
                          placeholder="Enter Minutes"
                          type="number"
                          register={register}
                          validation={{
                            min: { value: 0, message: "Minutes cannot be negative" },
                            max: { value: 59, message: "Minutes cannot exceed 59" },
                          }}
                          error={!!errors.patroling?.patrolRouteDetails?.[activeRouteIndex]?.patrolFrequency?.minutes}
                          helperText={
                            errors.patroling?.patrolRouteDetails?.[activeRouteIndex]?.patrolFrequency?.minutes?.message
                          }
                        />
                      </div>
                    )}

                    {patrolFrequency && (
                      <LabeledInput
                        label="Number of Patrol Rounds"
                        name={`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.count`}
                        placeholder="Enter number of rounds"
                        type="number"
                        register={register}
                        validation={{
                          required: "Number of patrol rounds is required",
                          min: { value: 1, message: "At least 1 patrol round is required" },
                        }}
                        error={!!errors.patroling?.patrolRouteDetails?.[activeRouteIndex]?.patrolFrequency?.count}
                        helperText={
                          errors.patroling?.patrolRouteDetails?.[activeRouteIndex]?.patrolFrequency?.count?.message
                        }
                      />
                    )}

                    <LabeledInput
                      label="No. of Patrol Rounds In A Shift"
                      name={`patroling.patrolRouteDetails.${activeRouteIndex}.patrolFrequency.numberOfPatrols`}
                      placeholder="Enter rounds in shift"
                      required
                      register={register}
                      validation={{
                        required: "Number of patrols is required",
                        min: { value: 1, message: "At least 1 patrol round is required" },
                      }}
                      error={
                        !!errors.patroling?.patrolRouteDetails?.[activeRouteIndex]?.patrolFrequency?.numberOfPatrols
                      }
                      helperText={
                        errors.patroling?.patrolRouteDetails?.[activeRouteIndex]?.patrolFrequency?.numberOfPatrols
                          ?.message
                      }
                      type="number"
                    />
                  </div>
                </div>

                <div className="flex flex-col bg-[#F7F7F7] p-4 rounded-lg gap-2 w-full">
                  <span className="text-[#707070] font-semibold text-sm">Patrol Checkpoints</span>
                  <Divider sx={{ borderColor: "#ffffff" }} />

                  <div className="flex flex-col mt-2">
                    {checkpointFields.map((field, index) => renderCheckpoint(field, index))}
                  </div>

                  <Button variant="contained" className="mt-4 w-fit" onClick={addCheckpoint} startIcon={<AddIcon />}>
                    ADD CHECKPOINT
                  </Button>
                </div>
              </div>
              <Button onClick={handlePatrolRouteSave} variant="contained" sx={{ mx: "auto", mt: 4 }}>
                <Check /> SAVE PATROL ROUTE
              </Button>
            </div>
          </div>
        )}
      </Box>
    </Modal>
  );
};
