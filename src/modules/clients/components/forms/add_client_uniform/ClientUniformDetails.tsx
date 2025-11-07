import LabeledInput from "@components/LabeledInput";
import { useCreateClientUniform } from "@modules/clients/apis/hooks/useCreateClientUniform";
import UniformPhotoUploader from "@modules/clients/components/UniformPhotoUploader";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PhotoIcon from "@mui/icons-material/Photo";
import { Button, Checkbox, CircularProgress, Divider, FormControlLabel, FormGroup, IconButton } from "@mui/material";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useParams } from "react-router-dom";

interface ClientUniformForm {
  uniformName: string;
  top: boolean;
  bottom: boolean;
  accessories: boolean;
  topPhotos: (File | string)[];
  bottomPhotos: (File | string)[];
  accessoriesPhotos: (File | string)[];
}

const checkboxStyle = {
  color: "#2A77D5",
  p: 0.5,
  pr: 1,
  borderRadius: "4px",
  "&.Mui-checked": {
    color: "#2A77D5",
  },
};

export default function ClientUniformDetails() {
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);
  const [uniforms, setUniforms] = useState<ClientUniformForm[]>([]);
  const [uniformSubmitted, setUniformSubmitted] = useState(false);
  const { clientId } = useParams<{ clientId: string }>();

  const {
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useFormContext<ClientUniformForm>();

  const createUniformMutation = useCreateClientUniform((data) => {
    console.log("Uniform created successfully:", data);
    reset({
      uniformName: "",
      top: false,
      bottom: false,
      accessories: false,
      topPhotos: [],
      bottomPhotos: [],
      accessoriesPhotos: [],
    });
  });

  const uniformName = watch("uniformName") || "";
  const top = watch("top") || false;
  const bottom = watch("bottom") || false;
  const accessories = watch("accessories") || false;
  const topPhotos = watch("topPhotos") || [];
  const bottomPhotos = watch("bottomPhotos") || [];
  const accessoriesPhotos = watch("accessoriesPhotos") || [];

  const handleAddPhotos = () => {
    setShowPhotoUploader(true);
  };

  const handlePhotoUploaderComplete = () => {
    setShowPhotoUploader(false);

    if (
      top &&
      hasUploadedTopPhotos &&
      bottom &&
      hasUploadedBottomPhotos &&
      accessories &&
      hasUploadedAccessoriesPhotos
    ) {
      handleSubmitUniform();
    }
  };

  const handleSubmitUniform = async () => {
    if (!clientId) {
      console.error("Client ID is missing");
      alert("Client ID is required");
      return;
    }

    try {
      const topPartImages = topPhotos.filter((photo: any): photo is File => photo instanceof File);
      const bottomPartImages = bottomPhotos.filter((photo: any): photo is File => photo instanceof File);
      const accessoryImages = accessoriesPhotos.filter((photo: any): photo is File => photo instanceof File);

      const apiData = {
        clientId,
        uniformName,
        topPartImages: top ? topPartImages : undefined,
        bottomPartImages: bottom ? bottomPartImages : undefined,
        accessoryImages: accessories ? accessoryImages : undefined,
      };

      await createUniformMutation.mutateAsync(apiData);

      const newUniform: ClientUniformForm = {
        uniformName,
        top,
        bottom,
        accessories,
        topPhotos: top ? topPhotos.filter((p: any) => p) : [],
        bottomPhotos: bottom ? bottomPhotos.filter((p: any) => p) : [],
        accessoriesPhotos: accessories ? accessoriesPhotos.filter((p: any) => p) : [],
      };

      setUniforms([...uniforms, newUniform]);
      setUniformSubmitted(true);

      reset({
        uniformName: "",
        top: false,
        bottom: false,
        accessories: false,
        topPhotos: [],
        bottomPhotos: [],
        accessoriesPhotos: [],
      });
    } catch (error) {
      console.error("Error submitting uniform:", error);
      alert("There was an error submitting the uniform. Please try again.");
    }
  };

  const handleDeleteUniform = (index: number) => {
    const updatedUniforms = [...uniforms];
    updatedUniforms.splice(index, 1);
    setUniforms(updatedUniforms);
  };

  const hasUploadedTopPhotos = top && topPhotos.length > 0 && topPhotos.some((url: any) => url);
  const hasUploadedBottomPhotos = bottom && bottomPhotos.length > 0 && bottomPhotos.some((url: any) => url);
  const hasUploadedAccessoriesPhotos =
    accessories && accessoriesPhotos.length > 0 && accessoriesPhotos.some((url: any) => url);

  const allRequiredPhotosUploaded =
    (!top || hasUploadedTopPhotos) &&
    (!bottom || hasUploadedBottomPhotos) &&
    (!accessories || hasUploadedAccessoriesPhotos);

  if (showPhotoUploader) {
    return <UniformPhotoUploader onCancel={handlePhotoUploaderComplete} />;
  }

  return (
    <div className="flex flex-col gap-4 bg-white mt-2 rounded-xl p-6 pb-10 h-full">
      <div className="inline-flex justify-between">
        <h2 className="text-xl text-[#2A77D5] mb-2">CLIENT UNIFORMS</h2>
      </div>

      {uniformSubmitted && uniforms.length > 0 && (
        <div className="flex flex-row gap-6 mb-6">
          {uniforms.map((uniform, index) => (
            <div key={`uniform-${index}`} className="relative flex flex-col p-4 rounded-lg bg-[#F7F7F7] w-[20vw]">
              <h3 className="text-gray-700 font-medium">UNIFORM TYPE {String(index + 1).padStart(2, "0")}</h3>

              <Divider className="my-2" />

              <div className="space-y-2 mt-2">
                <LabeledInput
                  label="Uniform Name"
                  name="uniformName"
                  placeholder={uniform.uniformName}
                  register={register}
                  validation={{ required: "Uniform name is required" }}
                  error={!!errors.uniformName}
                  helperText={errors.uniformName?.message as string}
                  required
                />
                <div>
                  <span className="text-xs text-[#707070]">Select Parts Of Uniform You Want To Upload</span>

                  <div className="mt-2 ml-6 space-y-1">
                    {uniform.top && (
                      <div className="flex items-center">
                        <Checkbox
                          size="small"
                          checked={true}
                          disabled
                          sx={checkboxStyle}
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckIcon />}
                        />
                        <span className="text-sm">Uniform Top</span>
                      </div>
                    )}

                    {uniform.bottom && (
                      <div className="flex items-center">
                        <Checkbox
                          size="small"
                          checked={true}
                          disabled
                          sx={checkboxStyle}
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckIcon />}
                        />
                        <span className="text-sm">Uniform Bottom</span>
                      </div>
                    )}

                    {uniform.accessories && (
                      <div className="flex items-center">
                        <Checkbox
                          size="small"
                          checked={true}
                          disabled
                          sx={checkboxStyle}
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckIcon />}
                        />
                        <span className="text-sm">Accessories</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between mt-auto">
                <Button variant="contained" startIcon={<PhotoIcon />} sx={{ textTransform: "none" }}>
                  PHOTOS ({getTotalPhotos(uniform)})
                </Button>
                <IconButton onClick={() => handleDeleteUniform(index)} sx={{ color: "#2A77D5" }}>
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </div>
            </div>
          ))}

          <div className="border-2 border-dashed border-[#D9D9D9] p-4 rounded-lg w-[20vw]">
            <div className="flex justify-between items-center">
              <h3 className="text-[#707070] text-base">UNIFORM TYPE {String(uniforms.length + 1).padStart(2, "0")}</h3>
            </div>
            <Divider className="my-2" />
            <div className="flex flex-col gap-3 mt-2">
              <LabeledInput
                label="Uniform Name"
                name="uniformName"
                placeholder="Enter Uniform Name"
                register={register}
                validation={{ required: "Uniform name is required" }}
                error={!!errors.uniformName}
                helperText={errors.uniformName?.message as string}
                required
              />
              <span className="text-xs text-[#707070]">Select Parts Of Uniform You Want To Upload</span>
              <FormGroup className="flex flex-col gap-1 ml-6">
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={top}
                      onChange={(e) => setValue("top", e.target.checked, { shouldValidate: true })}
                      sx={checkboxStyle}
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckIcon />}
                    />
                  }
                  label={<span className="text-sm">Uniform Top</span>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={bottom}
                      onChange={(e) => setValue("bottom", e.target.checked, { shouldValidate: true })}
                      sx={checkboxStyle}
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckIcon />}
                    />
                  }
                  label={<span className="text-sm">Uniform Bottom</span>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={accessories}
                      onChange={(e) => setValue("accessories", e.target.checked, { shouldValidate: true })}
                      sx={checkboxStyle}
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckIcon />}
                    />
                  }
                  label={<span className="text-sm">Accessories</span>}
                />
              </FormGroup>

              <div className="inline-flex justify-between mt-4">
                <Button
                  variant="contained"
                  disabled={!(top || bottom || accessories) || !uniformName}
                  onClick={handleAddPhotos}
                  startIcon={<AddIcon />}
                >
                  ADD PHOTOS
                </Button>
              </div>

              {(top || bottom || accessories) && uniformName && allRequiredPhotosUploaded && (
                <div className="mt-4">
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSubmitUniform}
                    disabled={createUniformMutation.isPending}
                    startIcon={createUniformMutation.isPending ? <CircularProgress size={16} /> : undefined}
                  >
                    {createUniformMutation.isPending ? "SUBMITTING..." : "ADD UNIFORM"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!uniformSubmitted && (
        <div className="border-2 border-dashed border-[#D9D9D9] p-4 rounded-lg w-[20vw]">
          <div className="flex justify-between items-center">
            <h3 className="text-[#707070] text-base">UNIFORM TYPE 01</h3>
          </div>
          <Divider className="my-2" />
          <div className="flex flex-col gap-3">
            <LabeledInput
              label="Uniform Name"
              name="uniformName"
              placeholder="Enter Uniform Name"
              register={register}
              validation={{ required: "Uniform name is required" }}
              error={!!errors.uniformName}
              helperText={errors.uniformName?.message as string}
              required
            />
            <span className="text-xs text-[#707070]">Select Parts Of Uniform You Want To Upload</span>
            <FormGroup className="flex flex-col gap-1 ml-6">
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={top}
                    onChange={(e) => setValue("top", e.target.checked, { shouldValidate: true })}
                    sx={checkboxStyle}
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckIcon />}
                  />
                }
                label={<span className="text-sm">Uniform Top</span>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={bottom}
                    onChange={(e) => setValue("bottom", e.target.checked, { shouldValidate: true })}
                    sx={checkboxStyle}
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckIcon />}
                  />
                }
                label={<span className="text-sm">Uniform Bottom</span>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={accessories}
                    onChange={(e) => setValue("accessories", e.target.checked, { shouldValidate: true })}
                    sx={checkboxStyle}
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckIcon />}
                  />
                }
                label={<span className="text-sm">Accessories</span>}
              />
            </FormGroup>

            <div className="inline-flex justify-between mt-4">
              <Button
                variant="contained"
                disabled={!(top || bottom || accessories) || !uniformName}
                onClick={handleAddPhotos}
                startIcon={<AddIcon />}
              >
                ADD PHOTOS
              </Button>
            </div>

            {(top || bottom || accessories) && uniformName && allRequiredPhotosUploaded && (
              <div className="mt-4">
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSubmitUniform}
                  disabled={createUniformMutation.isPending}
                  startIcon={createUniformMutation.isPending ? <CircularProgress size={16} /> : undefined}
                >
                  {createUniformMutation.isPending ? "SUBMITTING..." : "ADD UNIFORM"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getTotalPhotos(uniform: ClientUniformForm): number {
  let total = 0;
  if (uniform.topPhotos) total += uniform.topPhotos.length;
  if (uniform.bottomPhotos) total += uniform.bottomPhotos.length;
  if (uniform.accessoriesPhotos) total += uniform.accessoriesPhotos.length;
  return total;
}
