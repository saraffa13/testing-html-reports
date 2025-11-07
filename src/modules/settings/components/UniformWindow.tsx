import {
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import UniformsApiService, { type AgencyUniform } from "../services/api/uniformsApi";

interface PhotoSectionProps {
  title: string;
  photos: string[];
  uniformId: string;
  onDeletePhoto: (photoUrl: string) => void;
  onDeleteSuccess: () => void;
}

const PhotoSection: React.FC<PhotoSectionProps> = ({ title, photos, uniformId, onDeletePhoto }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (photoUrl: string) => {
    setPhotoToDelete(photoUrl);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!photoToDelete) return;

    setDeleting(true);
    try {
      // Call the delete image API
      await UniformsApiService.deleteUniformImage(uniformId, photoToDelete);
      onDeletePhoto(photoToDelete);
      setDeleteDialogOpen(false);
      setPhotoToDelete("");
    } catch (error) {
      console.error("Error deleting photo:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Box sx={{ width: "100%", height: "120px", gap: "24px", display: "flex", alignItems: "flex-start" }}>
        <Typography
          sx={{
            width: "100px",
            height: "16px",
            paddingTop: "4px",
            paddingBottom: "4px",
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "12px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: "#3B3B3B",
            flexShrink: 0,
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            flex: 1,
            height: "120px",
            gap: "8px",
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
          }}
        >
          {photos.map((photoUrl, index) => (
            <Box
              key={index}
              sx={{
                width: "120px",
                height: "120px",
                borderRadius: "8px",
                background: "#E0E0E0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                "&:hover .edit-overlay": {
                  opacity: 1,
                },
                "&:hover .delete-overlay": {
                  opacity: 1,
                },
              }}
            >
              <img
                src={photoUrl}
                alt={`${title} ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const nextSibling = e.currentTarget.nextSibling as HTMLElement | null;
                  if (nextSibling) {
                    nextSibling.style.display = "flex";
                  }
                }}
              />
              <Box
                sx={{
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#707070",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "8px",
                }}
              >
                Image not available
              </Box>

              {/* Delete overlay that appears on hover */}
              <Box
                className="delete-overlay"
                sx={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "rgba(255, 0, 0, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  cursor: "pointer",
                }}
                onClick={() => handleDeleteClick(photoUrl)}
              >
                <DeleteIcon sx={{ fontSize: "14px", color: "#FFFFFF" }} />
              </Box>

              {/* Edit overlay that appears on hover */}
              <Box
                className="edit-overlay"
                sx={{
                  position: "absolute",
                  bottom: "4px",
                  right: "4px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0px 1px 4px rgba(0,0,0,0.2)",
                  opacity: 0,
                  transition: "opacity 0.2s",
                }}
              >
                <EditIcon sx={{ fontSize: "12px", color: "#2A77D5" }} />
              </Box>
            </Box>
          ))}
          {photos.length === 0 && (
            <Typography
              sx={{
                color: "#A3A3A3",
                fontSize: "12px",
                fontStyle: "italic",
                display: "flex",
                alignItems: "center",
                height: "120px",
              }}
            >
              No {title.toLowerCase()} photos available
            </Typography>
          )}
        </Box>
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Photo</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this photo? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            color="error"
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// UniformListItem Component
interface UniformListItemProps {
  uniformName: string;
  photoCount: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const UniformListItem: React.FC<UniformListItemProps> = ({
  uniformName,
  photoCount,
  isSelected,
  onClick,
  onDelete,
}) => {
  return (
    <Box
      sx={{
        width: "160px",
        height: "52px",
        padding: "8px",
        borderBottom: "1px solid #F0F0F0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: isSelected ? "#F1F7FE" : "#ffffff",
        cursor: "pointer",
        "&:hover": {
          background: "#E3F2FD",
        },
        "&:hover .delete-button": {
          opacity: 1,
        },
      }}
    >
      <Box
        onClick={onClick}
        sx={{
          width: "100px",
          height: "36px",
          gap: "4px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Typography
          sx={{
            width: "fit-content",
            height: "16px",
            paddingTop: "3px",
            paddingBottom: "4px",
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "16px",
            textTransform: "capitalize",
            color: isSelected ? "#1D68C3" : "#707070",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100px",
          }}
        >
          {uniformName}
        </Typography>
        <Box sx={{ width: "60px", height: "16px", gap: "8px", display: "flex", alignItems: "center" }}>
          <Typography
            sx={{
              width: "35px",
              height: "16px",
              paddingTop: "4px",
              paddingBottom: "4px",
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              color: isSelected ? "#1D68C3" : "#707070",
            }}
          >
            Photos
          </Typography>
          <Typography
            sx={{
              width: "20px",
              height: "16px",
              paddingTop: "4px",
              paddingBottom: "4px",
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              color: isSelected ? "#1D68C3" : "#707070",
            }}
          >
            {photoCount}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <IconButton
          className="delete-button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{
            width: "20px",
            height: "20px",
            opacity: 0,
            transition: "opacity 0.2s",
            "&:hover": {
              backgroundColor: "rgba(255, 0, 0, 0.1)",
            },
          }}
        >
          <DeleteIcon sx={{ fontSize: "14px", color: "#FF0000" }} />
        </IconButton>

        <ChevronRightIcon
          sx={{
            width: "20px",
            height: "20px",
            color: isSelected ? "#1D68C3" : "#707070",
          }}
        />
      </Box>
    </Box>
  );
};

// Main UniformWindow Component
const UniformWindow: React.FC = () => {
  const [selectedUniformId, setSelectedUniformId] = useState<string>("");
  const [uniformData, setUniformData] = useState<AgencyUniform[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uniformToDelete, setUniformToDelete] = useState<string>("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "warning" | "info" = "success") => {
      setSnackbar({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Fetch uniforms data
  const fetchUniforms = useCallback(async () => {
    if (!user?.agencyId) return;

    try {
      setLoading(true);
      const uniforms = await UniformsApiService.getUniforms(user.agencyId);
      setUniformData(uniforms);

      // Set the first uniform as selected by default
      if (uniforms.length > 0 && !selectedUniformId) {
        setSelectedUniformId(uniforms[0].id);
      }
    } catch (error) {
      console.error("Error fetching uniforms:", error);
      showSnackbar("Failed to fetch uniforms", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.agencyId, selectedUniformId, showSnackbar]);

  useEffect(() => {
    fetchUniforms();
  }, [fetchUniforms]);

  // Get selected uniform data
  const selectedUniform = uniformData.find((item) => item.id === selectedUniformId);

  const handleAddUniform = () => {
    navigate("/add-new-uniform");
  };

  const handleDeleteUniform = (uniformId: string) => {
    setUniformToDelete(uniformId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!uniformToDelete) return;

    setDeleting(true);
    try {
      await UniformsApiService.deleteUniform(uniformToDelete);
      showSnackbar("Uniform deleted successfully", "success");

      // Remove from local state
      setUniformData((prev) => prev.filter((uniform) => uniform.id !== uniformToDelete));

      // Reset selection if deleted uniform was selected
      if (selectedUniformId === uniformToDelete) {
        const remaining = uniformData.filter((uniform) => uniform.id !== uniformToDelete);
        setSelectedUniformId(remaining.length > 0 ? remaining[0].id : "");
      }

      setDeleteDialogOpen(false);
      setUniformToDelete("");
    } catch (error) {
      console.error("Error deleting uniform:", error);
      showSnackbar("Failed to delete uniform", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePhoto = (photoUrl: string) => {
    // Update local state to remove the deleted photo
    setUniformData((prev) =>
      prev.map((uniform) => {
        if (uniform.id === selectedUniformId) {
          return {
            ...uniform,
            topPartUrls: uniform.topPartUrls.filter((url) => url !== photoUrl),
            bottomPartUrls: uniform.bottomPartUrls.filter((url) => url !== photoUrl),
            accessoriesUrls: uniform.accessoriesUrls.filter((url) => url !== photoUrl),
          };
        }
        return uniform;
      })
    );
    showSnackbar("Photo deleted successfully", "success");
  };

  const getTotalPhotoCount = (uniform: AgencyUniform): number => {
    return uniform.topPartUrls.length + uniform.bottomPartUrls.length + uniform.accessoriesUrls.length;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          borderRadius: "12px",
          padding: "16px",
          background: "#F7F7F7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          width: "1052px",
          height: "840px",
          borderRadius: "12px",
          padding: "16px",
          background: "#F7F7F7",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "1020px",
            height: "808px",
            gap: "12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box sx={{ width: "100%", height: "32px", gap: "8px", display: "flex", flexDirection: "column" }}>
            <Box sx={{ width: "1020px", height: "24px", gap: "16px", display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  width: "163px",
                  height: "24px",
                  paddingTop: "5px",
                  paddingBottom: "4px",
                  fontFamily: "Mukta",
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "32px",
                  textTransform: "capitalize",
                  color: "#3B3B3B",
                }}
              >
                Uniforms Setup
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Box
            sx={{
              width: "100%",
              height: "1px",
              background: "#FFFFFF",
            }}
          />

          {/* Main Card */}
          <Box
            sx={{
              width: "1020px",
              height: "752px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "16px",
              gap: "16px",
              background: "#FFFFFF",
              borderRadius: "10px",
            }}
          >
            {/* Card Header */}
            <Box
              sx={{
                width: "988px",
                height: "32px",
                paddingLeft: "8px",
                display: "flex",
                gap: "8px",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ width: "832px", flex: 1, height: "18px", gap: "16px" }}>
                <Typography
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontFamily: "Mukta",
                    fontWeight: 600,
                    fontSize: "16px",
                    lineHeight: "20px",
                    textTransform: "capitalize",
                    color: "#3B3B3B",
                    padding: "5px 0 3px 0", // shorthand for top/right/bottom/left
                    whiteSpace: "nowrap", // prevents wrapping
                  }}
                >
                  Uploaded Uniform ({uniformData.length})
                </Typography>
              </Box>
              <Button
                startIcon={<AddIcon sx={{ width: "16px", height: "16px", color: "#2A77D5" }} />}
                onClick={handleAddUniform}
                sx={{
                  width: "140px",
                  height: "32px",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  background: "#FFFFFF",
                  boxShadow: "0px 1px 4px rgba(112, 112, 112, 0.2)",
                  textTransform: "uppercase",
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "16px",
                  color: "#2A77D5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    background: "#F8F9FA",
                  },
                }}
              >
                Add Uniform
              </Button>
            </Box>

            {/* Content */}
            <Box
              sx={{
                width: "988px",
                height: "672px",
                flex: 1,
                borderRadius: "12px",
                border: "1px solid #F0F0F0",
                display: "flex",
                overflow: "hidden",
              }}
            >
              {/* Left Sidebar - List */}
              <Box
                sx={{
                  width: "160px",
                  height: "672px",
                  border: "1px solid #F0F0F0",
                  borderTopLeftRadius: "8px",
                  borderBottomLeftRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "auto",
                }}
              >
                {uniformData.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Mukta",
                        fontSize: "14px",
                        color: "#A3A3A3",
                        fontStyle: "italic",
                      }}
                    >
                      No uniforms found
                    </Typography>
                  </Box>
                ) : (
                  uniformData.map((uniform) => (
                    <UniformListItem
                      key={uniform.id}
                      uniformName={uniform.uniformName}
                      photoCount={getTotalPhotoCount(uniform)}
                      isSelected={selectedUniformId === uniform.id}
                      onClick={() => setSelectedUniformId(uniform.id)}
                      onDelete={() => handleDeleteUniform(uniform.id)}
                    />
                  ))
                )}
              </Box>

              {/* Right Side - Overview */}
              <Box
                sx={{
                  flex: 1,
                  height: "672px",
                  width: "828px",
                  borderTopRightRadius: "10px",
                  borderBottomRightRadius: "10px",
                  padding: "16px",
                  background: "#F1F7FE",
                  boxShadow: "0px 1px 4px rgba(78, 81, 95, 0.06)",
                }}
              >
                <Box
                  sx={{
                    width: "796px",
                    height: "640px",
                    gap: "12px",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "10px ",
                    background: "#FFFFFF",
                    padding: "8px 12px",
                  }}
                >
                  <Box
                    sx={{
                      width: "796px",
                      height: "640px",
                      gap: "16px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Card Header */}
                    {selectedUniform && (
                      <Box
                        sx={{
                          width: "772px",
                          height: "16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            height: "16px",
                            paddingTop: "4px",
                            paddingBottom: "4px",
                            fontFamily: "Mukta",
                            fontWeight: 500,
                            fontSize: "12px",
                            lineHeight: "16px",
                            textTransform: "capitalize",
                            color: "#707070",
                          }}
                        >
                          Last Uploaded : {formatDate(selectedUniform.createdAt)}
                        </Typography>
                        <IconButton
                          onClick={() => {
                            /* TODO: Implement edit mode */
                          }}
                          sx={{
                            width: "12px",
                            height: "12px",
                            padding: 0,
                            minWidth: "12px",
                          }}
                        >
                          <EditIcon sx={{ fontSize: "12px", color: "#2A77D5" }} />
                        </IconButton>
                      </Box>
                    )}

                    {/* Content */}
                    <Box
                      sx={{
                        width: "100%",
                        flex: 1,
                        paddingTop: "16px",
                        paddingBottom: "16px",
                        gap: "40px",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "auto",
                      }}
                    >
                      {selectedUniform ? (
                        <>
                          <PhotoSection
                            title="Uniform Top"
                            photos={selectedUniform.topPartUrls}
                            uniformId={selectedUniform.id}
                            onDeletePhoto={handleDeletePhoto}
                            onDeleteSuccess={fetchUniforms}
                          />
                          <PhotoSection
                            title="Uniform Bottom"
                            photos={selectedUniform.bottomPartUrls}
                            uniformId={selectedUniform.id}
                            onDeletePhoto={handleDeletePhoto}
                            onDeleteSuccess={fetchUniforms}
                          />
                          <PhotoSection
                            title="Accessories"
                            photos={selectedUniform.accessoriesUrls}
                            uniformId={selectedUniform.id}
                            onDeletePhoto={handleDeletePhoto}
                            onDeleteSuccess={fetchUniforms}
                          />
                        </>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            flexDirection: "column",
                            gap: "16px",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontSize: "18px",
                              color: "#A3A3A3",
                              textAlign: "center",
                            }}
                          >
                            No uniform selected
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Mukta",
                              fontSize: "14px",
                              color: "#A3A3A3",
                              textAlign: "center",
                            }}
                          >
                            Select a uniform from the list to view its details
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Delete uniform confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Uniform</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this entire uniform? This will delete all associated photos and cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            color="error"
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? "Deleting..." : "Delete Uniform"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UniformWindow;
