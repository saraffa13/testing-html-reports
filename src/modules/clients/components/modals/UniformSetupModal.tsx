import LabeledInput from "@components/LabeledInput";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Checkbox, FormControlLabel, Modal } from "@mui/material";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
  width: "80vw",
  overflow: "auto",
};

interface UniformSetupModalProps {
  open: boolean;
  onClose: () => void;
}

interface UniformType {
  id: string;
  name: string;
  imageCount: number;
  isActive: boolean;
}

interface UniformPhoto {
  id: string;
  url: string;
  category: "top" | "bottom" | "accessories";
}

interface FormData {
  uniformName: string;
}
export const UniformSetupModal: React.FC<UniformSetupModalProps> = ({ open, onClose }) => {
  const [activeUniformIndex, setActiveUniformIndex] = useState(0);
  const [uniformParts, setUniformParts] = useState({
    top: true,
    bottom: true,
    accessories: true,
  });

  const {
    register,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      uniformName: "Regular Day Guard",
    },
  });

  // Mock uniform types data
  const [uniformTypes] = useState<UniformType[]>([
    { id: "1", name: "Regular Day Guard", imageCount: 6, isActive: true },
    { id: "2", name: "Regular Lady Guard", imageCount: 2, isActive: false },
    { id: "3", name: "Gun Man", imageCount: 2, isActive: false },
    { id: "4", name: "Personal Guard", imageCount: 2, isActive: false },
  ]);

  // Mock photos data
  const [photos] = useState<UniformPhoto[]>([
    { id: "1", url: "https://via.placeholder.com/150x200/8FBC8F/000000?text=Top+1", category: "top" },
    { id: "2", url: "https://via.placeholder.com/150x200/2F4F4F/FFFFFF?text=Top+2", category: "top" },
    { id: "3", url: "https://via.placeholder.com/150x200/8FBC8F/000000?text=Top+3", category: "top" },
    { id: "4", url: "https://via.placeholder.com/150x200/2F4F4F/FFFFFF?text=Top+4", category: "top" },
    { id: "5", url: "https://via.placeholder.com/150x200/8FBC8F/000000?text=Top+5", category: "top" },
    { id: "6", url: "https://via.placeholder.com/150x200/2F4F4F/FFFFFF?text=Top+6", category: "top" },
    { id: "7", url: "https://via.placeholder.com/150x200/228B22/000000?text=Bottom+1", category: "bottom" },
    { id: "8", url: "https://via.placeholder.com/150x200/228B22/000000?text=Bottom+2", category: "bottom" },
    { id: "9", url: "https://via.placeholder.com/150x200/228B22/000000?text=Acc+1", category: "accessories" },
    { id: "10", url: "https://via.placeholder.com/150x200/228B22/000000?text=Acc+2", category: "accessories" },
  ]);

  const handleUniformPartChange = (part: keyof typeof uniformParts) => {
    setUniformParts((prev) => ({
      ...prev,
      [part]: !prev[part],
    }));
  };

  const handleDeletePhoto = (photoId: string) => {
    // Handle photo deletion
    console.log("Delete photo:", photoId);
  };

  const handleAddPhotos = () => {
    // Handle adding new photos
    console.log("Add photos");
  };

  // const handleAddUniform = () => {
  //   // Handle adding new uniform type
  //   console.log("Add new uniform");
  // };

  const handleDeleteUniform = () => {
    // Handle deleting current uniform
    console.log("Delete uniform");
  };

  // const onSubmit = (data: FormData) => {
  //   console.log("Form data:", data);
  // };

  const getPhotosByCategory = (category: "top" | "bottom" | "accessories") => {
    return photos.filter((photo) => photo.category === category);
  };

  const Sidebar = () => (
    <div className="w-70 bg-white rounded-l-lg p-4">
      <div className="space-y-2">
        {uniformTypes.map((uniform, index) => (
          <div key={uniform.id} className="w-full">
            <button
              onClick={() => setActiveUniformIndex(index)}
              className={`w-full p-3 border rounded-lg text-left transition-colors ${
                activeUniformIndex === index
                  ? "bg-blue-50 border-blue-500 text-blue-600"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm ${activeUniformIndex === index ? "font-semibold" : "font-normal"}`}>
                    {uniform.name}
                  </div>
                  <div className="text-xs text-gray-500">Image Uploaded {uniform.imageCount}</div>
                </div>
                <ArrowForwardIosIcon sx={{ color: "#666", fontSize: "14px" }} />
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const PhotoSection = ({ title, category }: { title: string; category: "top" | "bottom" | "accessories" }) => {
    const categoryPhotos = getPhotosByCategory(category);

    return (
      <div className="mb-8">
        <span className="font-semibold text-gray-600 text-base block mb-4">{title}</span>
        <div className="flex flex-wrap gap-4">
          {categoryPhotos.map((photo) => (
            <div key={photo.id} className="relative">
              <img
                src={photo.url}
                alt={`${title} ${photo.id}`}
                className="w-30 h-40 object-cover rounded-lg border border-gray-300"
              />
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute bottom-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <DeleteIcon sx={{ fontSize: 16, color: "#2A77D5" }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2A77D5]">Uniform Setup</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            type="button"
          >
            <X className="w-6 h-6 text-[#2A77D5]" />
          </button>
        </div>

        <div className="flex flex-row w-full">
          <Sidebar />
          <div className="bg-[#F1F7FE] p-4 rounded-lg w-full">
            <div className="mb-8 bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-gray-600 text-lg mb-6">BASIC DETAILS</h3>

              <div className="flex flex-row gap-8 items-start">
                <div className="flex-1 max-w-96">
                  <LabeledInput
                    label="Uniform Name"
                    name="uniformName"
                    placeholder="Enter Uniform Name"
                    required
                    register={register}
                    validation={{
                      required: "Uniform name is required",
                    }}
                    error={!!errors.uniformName}
                    helperText={errors.uniformName?.message}
                  />
                </div>

                <div>
                  <span className="text-gray-600 text-sm block mb-4">Select Parts Of Uniform You Want To Upload</span>
                  <div className="flex flex-col gap-2">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={uniformParts.top}
                          onChange={() => handleUniformPartChange("top")}
                          sx={{ color: "#2A77D5" }}
                        />
                      }
                      label="Uniform Top"
                      sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={uniformParts.bottom}
                          onChange={() => handleUniformPartChange("bottom")}
                          sx={{ color: "#2A77D5" }}
                        />
                      }
                      label="Uniform Bottom"
                      sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={uniformParts.accessories}
                          onChange={() => handleUniformPartChange("accessories")}
                          sx={{ color: "#2A77D5" }}
                        />
                      }
                      label="Accessories"
                      sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
                    />
                  </div>
                </div>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteUniform}
                  sx={{ mt: "auto" }}
                >
                  DELETE UNIFORM
                </Button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-600 text-sm">Last Uploaded : 12/03/2025</span>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPhotos}>
                  ADD PHOTOS
                </Button>
              </div>

              {/* Photo Sections */}
              {uniformParts.top && <PhotoSection title="Uniform Top" category="top" />}

              {uniformParts.bottom && <PhotoSection title="Uniform Bottom" category="bottom" />}

              {uniformParts.accessories && <PhotoSection title="Accessories" category="accessories" />}
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};
