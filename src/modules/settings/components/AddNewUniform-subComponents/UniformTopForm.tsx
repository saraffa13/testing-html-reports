import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TimelineIcon from "@mui/icons-material/Timeline";
import UploadIcon from "@mui/icons-material/Upload";
import { Box, Button, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface Point {
  x: number;
  y: number;
}

interface TaggedElement {
  id: string;
  name: string;
  imageIndex: number;
  shape: "rectangle" | "circle" | "polyline";
  coordinates: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    points?: Point[];
  };
  croppedImage: string;
}

interface UniformTopErrors {
  photos?: { message?: string };
}

interface FormErrors {
  uniformTop?: UniformTopErrors;
}

interface UniformTopFormProps {
  register: UseFormRegister<any>;
  errors: FormErrors;
  setValue?: UseFormSetValue<any>;
  watch?: UseFormWatch<any>;
  onTaggedElementsUpdate?: (taggedElements: TaggedElement[], uploadedImages: File[]) => void;
}

const UniformTopForm: React.FC<UniformTopFormProps> = ({ setValue, onTaggedElementsUpdate }) => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTool, setSelectedTool] = useState<"rectangle" | "circle" | "polyline">("rectangle");
  const [taggedElements, setTaggedElements] = useState<TaggedElement[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<any>(null);
  const [tagName, setTagName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const isUploadStage = uploadedImages.length === 0;

  // Notify parent component when tagged elements change
  useEffect(() => {
    if (onTaggedElementsUpdate) {
      onTaggedElementsUpdate(taggedElements, uploadedImages);
    }
  }, [taggedElements, uploadedImages]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 2 * 1024 * 1024
    );

    if (validFiles.length > 0) {
      setUploadedImages(validFiles);
      setCurrentImageIndex(0);
      if (setValue) {
        setValue("uniformTop.photos", validFiles);
      }
      console.log(`📝 UniformTopForm: Uploaded ${validFiles.length} files`);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (!canvasRef.current || !uploadedImages[currentImageIndex]) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentImage = uploadedImages[currentImageIndex];
    const imageUrl = URL.createObjectURL(currentImage);

    const img = new Image();
    img.onload = () => {
      // Store the loaded image in the ref for later use
      if (imageRef.current) {
        imageRef.current.src = imageUrl;
      }

      canvas.width = 288;
      canvas.height = 400;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawExistingTags(ctx);

      console.log(`📝 Image loaded for canvas: ${currentImage.name}`);
    };

    img.onerror = () => {
      console.error("❌ Failed to load image:", currentImage.name);
    };

    img.src = imageUrl;

    // Cleanup function to revoke the object URL
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [currentImageIndex, uploadedImages]);

  // Separate effect for redrawing existing tags when they change
  useEffect(() => {
    if (!canvasRef.current || !uploadedImages[currentImageIndex] || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Only redraw if we have a loaded image
    if (imageRef.current.complete && imageRef.current.naturalWidth > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      drawExistingTags(ctx);
    }
  }, [taggedElements]);

  const drawExistingTags = (ctx: CanvasRenderingContext2D) => {
    taggedElements
      .filter((el) => el.imageIndex === currentImageIndex)
      .forEach((element) => {
        ctx.save();
        ctx.strokeStyle = "#00660E";
        ctx.fillStyle = "rgba(0, 255, 34, 0.4)";
        ctx.lineWidth = 2;

        const coords = element.coordinates;

        if (element.shape === "rectangle" && coords.width && coords.height) {
          ctx.fillRect(coords.x, coords.y, coords.width, coords.height);
          ctx.strokeRect(coords.x, coords.y, coords.width, coords.height);
        } else if (element.shape === "circle" && coords.radius) {
          ctx.beginPath();
          ctx.arc(coords.x, coords.y, coords.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (element.shape === "polyline" && coords.points) {
          ctx.beginPath();
          coords.points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setStartPoint(pos);
    setIsDrawing(true);

    if (selectedTool === "polyline") {
      setPolylinePoints((prev) => [...prev, pos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentPos = getMousePos(e);

    // Only redraw if we have a loaded image
    if (imageRef.current.complete && imageRef.current.naturalWidth > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      drawExistingTags(ctx);
    }

    ctx.save();
    ctx.strokeStyle = "#00660E";
    ctx.fillStyle = "rgba(0, 255, 34, 0.4)";
    ctx.lineWidth = 2;

    if (selectedTool === "polyline" && polylinePoints.length > 0) {
      ctx.beginPath();
      polylinePoints.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    }

    if (isDrawing && startPoint) {
      if (selectedTool === "rectangle") {
        const width = currentPos.x - startPoint.x;
        const height = currentPos.y - startPoint.y;
        ctx.fillRect(startPoint.x, startPoint.y, width, height);
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.sqrt(Math.pow(currentPos.x - startPoint.x, 2) + Math.pow(currentPos.y - startPoint.y, 2));
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const currentPos = getMousePos(e);
    let drawingData: any = null;

    if (selectedTool === "rectangle") {
      const width = Math.abs(currentPos.x - startPoint.x);
      const height = Math.abs(currentPos.y - startPoint.y);
      const x = Math.min(startPoint.x, currentPos.x);
      const y = Math.min(startPoint.y, currentPos.y);

      if (width > 5 && height > 5) {
        drawingData = {
          shape: "rectangle",
          coordinates: { x, y, width, height },
        };
      }
    } else if (selectedTool === "circle") {
      const radius = Math.sqrt(Math.pow(currentPos.x - startPoint.x, 2) + Math.pow(currentPos.y - startPoint.y, 2));

      if (radius > 5) {
        drawingData = {
          shape: "circle",
          coordinates: { x: startPoint.x, y: startPoint.y, radius },
        };
      }
    }

    if (drawingData) {
      setCurrentDrawing(drawingData);
      setShowTagModal(true);
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const handlePolylineComplete = () => {
    if (polylinePoints.length >= 3) {
      const drawingData = {
        shape: "polyline",
        coordinates: { x: 0, y: 0, points: polylinePoints },
      };
      setCurrentDrawing(drawingData);
      setShowTagModal(true);
    }
    setPolylinePoints([]);
  };

  const cropImage = (coordinates: any, shape: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx || !uploadedImages[currentImageIndex]) {
        resolve("");
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (shape === "rectangle" && coordinates.width && coordinates.height) {
          canvas.width = coordinates.width;
          canvas.height = coordinates.height;

          const scaleX = img.naturalWidth / 288;
          const scaleY = img.naturalHeight / 400;

          ctx.drawImage(
            img,
            coordinates.x * scaleX,
            coordinates.y * scaleY,
            coordinates.width * scaleX,
            coordinates.height * scaleY,
            0,
            0,
            coordinates.width,
            coordinates.height
          );
        } else if (shape === "circle" && coordinates.radius) {
          const diameter = coordinates.radius * 2;
          canvas.width = diameter;
          canvas.height = diameter;

          ctx.beginPath();
          ctx.arc(coordinates.radius, coordinates.radius, coordinates.radius, 0, Math.PI * 2);
          ctx.clip();

          const scaleX = img.naturalWidth / 288;
          const scaleY = img.naturalHeight / 400;

          ctx.drawImage(
            img,
            (coordinates.x - coordinates.radius) * scaleX,
            (coordinates.y - coordinates.radius) * scaleY,
            diameter * scaleX,
            diameter * scaleY,
            0,
            0,
            diameter,
            diameter
          );
        } else if (shape === "polyline" && coordinates.points) {
          const xs = coordinates.points.map((p: Point) => p.x);
          const ys = coordinates.points.map((p: Point) => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);

          canvas.width = maxX - minX;
          canvas.height = maxY - minY;

          ctx.beginPath();
          coordinates.points.forEach((point: Point, index: number) => {
            const x = point.x - minX;
            const y = point.y - minY;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.clip();

          const scaleX = img.naturalWidth / 288;
          const scaleY = img.naturalHeight / 400;

          ctx.drawImage(
            img,
            minX * scaleX,
            minY * scaleY,
            (maxX - minX) * scaleX,
            (maxY - minY) * scaleY,
            0,
            0,
            maxX - minX,
            maxY - minY
          );
        }

        resolve(canvas.toDataURL());
      };
      img.src = URL.createObjectURL(uploadedImages[currentImageIndex]);
    });
  };

  const cancelTagging = () => {
    setTagName("");
    setCurrentDrawing(null);
    setShowTagModal(false);
    setPolylinePoints([]);
  };

  const saveTaggedElement = async () => {
    if (!currentDrawing || !tagName.trim()) return;

    const croppedImage = await cropImage(currentDrawing.coordinates, currentDrawing.shape);

    const newElement: TaggedElement = {
      id: Date.now().toString(),
      name: tagName.trim(),
      imageIndex: currentImageIndex,
      shape: currentDrawing.shape,
      coordinates: currentDrawing.coordinates,
      croppedImage,
    };

    setTaggedElements((prev) => {
      const updated = [...prev, newElement];
      console.log(`📝 UniformTopForm: Tagged element added - ${newElement.name}. Total: ${updated.length}`);
      return updated;
    });

    setTagName("");
    setCurrentDrawing(null);
    setShowTagModal(false);
  };

  const deleteTaggedElement = (id: string) => {
    setTaggedElements((prev) => {
      const updated = prev.filter((el) => el.id !== id);
      console.log(`📝 UniformTopForm: Tagged element removed. Total: ${updated.length}`);
      return updated;
    });
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => Math.min(uploadedImages.length - 1, prev + 1));
  };

  if (isUploadStage) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "40px",
        }}
      >
        <Box
          sx={{
            width: "760px",
            height: "272px",
            borderRadius: "8px",
            padding: "16px",
            gap: "16px",
            background: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 600,
              fontSize: "24px",
              lineHeight: "32px",
              textTransform: "capitalize",
              color: "#2A77D5",
            }}
          >
            UNIFORM - TOP
          </Typography>

          <Box
            sx={{
              width: "728px",
              height: "200px",
              gap: "8px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "16px",
                color: "#A3A3A3",
              }}
            >
              Upload Photos
            </Typography>

            <Box
              onClick={handleUploadClick}
              sx={{
                width: "150px",
                height: "184px",
                borderRadius: "8px",
                border: "1px solid #A3A3A3",
                background: "#FFFFFFA3",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                },
              }}
            >
              <UploadIcon
                sx={{
                  width: "24px",
                  height: "24px",
                  color: "#2A77D5",
                  marginBottom: "8px",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "#3B3B3B",
                  marginBottom: "4px",
                }}
              >
                Add Photo
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "#A3A3A3",
                }}
              >
                Max size: 2MB
              </Typography>
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              style={{ display: "none" }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "640px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "20px",
      }}
    >
      <Box
        sx={{
          width: "760px",
          height: "620px",
          borderRadius: "8px",
          padding: "16px",
          gap: "16px",
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Mukta",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "32px",
            textTransform: "capitalize",
            color: "#2A77D5",
          }}
        >
          UNIFORM TOP ({taggedElements.length} tagged)
        </Typography>

        <Box
          sx={{
            width: "728px",
            height: "548px",
            gap: "4px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Mukta",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              color: "#707070",
            }}
          >
            Tag Images With Uniform Elements
          </Typography>

          <Box
            sx={{
              width: "728px",
              height: "528px",
              borderRadius: "8px",
              background: "#F7F7F7",
              display: "flex",
            }}
          >
            <Box
              sx={{
                width: "336px",
                height: "528px",
                padding: "16px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: "16px",
                }}
              >
                <Button
                  onClick={() => setSelectedTool("rectangle")}
                  sx={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "4px",
                    padding: "4px",
                    minWidth: "24px",
                    background: selectedTool === "rectangle" ? "#2A77D5" : "#FFFFFF",
                    boxShadow: "0px 1px 4px 0px #70707033",
                    "&:hover": {
                      background: selectedTool === "rectangle" ? "#2A77D5" : "#F5F5F5",
                    },
                  }}
                >
                  <CropSquareIcon
                    sx={{
                      width: "16px",
                      height: "16px",
                      color: selectedTool === "rectangle" ? "#FFFFFF" : "#707070",
                    }}
                  />
                </Button>

                <Button
                  onClick={() => setSelectedTool("circle")}
                  sx={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "4px",
                    padding: "4px",
                    minWidth: "24px",
                    background: selectedTool === "circle" ? "#2A77D5" : "#FFFFFF",
                    boxShadow: "0px 1px 4px 0px #70707033",
                    "&:hover": {
                      background: selectedTool === "circle" ? "#2A77D5" : "#F5F5F5",
                    },
                  }}
                >
                  <RadioButtonUncheckedIcon
                    sx={{
                      width: "16px",
                      height: "16px",
                      color: selectedTool === "circle" ? "#FFFFFF" : "#707070",
                    }}
                  />
                </Button>

                <Button
                  onClick={() => setSelectedTool("polyline")}
                  sx={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "4px",
                    padding: "4px",
                    minWidth: "24px",
                    background: selectedTool === "polyline" ? "#2A77D5" : "#FFFFFF",
                    boxShadow: "0px 1px 4px 0px #70707033",
                    "&:hover": {
                      background: selectedTool === "polyline" ? "#2A77D5" : "#F5F5F5",
                    },
                  }}
                >
                  <TimelineIcon
                    sx={{
                      width: "16px",
                      height: "16px",
                      color: selectedTool === "polyline" ? "#FFFFFF" : "#707070",
                    }}
                  />
                </Button>
              </Box>

              <Box
                sx={{
                  width: "288px",
                  height: "400px",
                  border: "1px solid #00660E",
                  position: "relative",
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={288}
                  height={400}
                  style={{
                    cursor: "crosshair",
                    display: "block",
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onDoubleClick={selectedTool === "polyline" ? handlePolylineComplete : undefined}
                />

                {uploadedImages[currentImageIndex] && (
                  <img
                    ref={imageRef}
                    src={URL.createObjectURL(uploadedImages[currentImageIndex])}
                    alt="Reference"
                    style={{ display: "none" }}
                  />
                )}
              </Box>

              {selectedTool === "polyline" && (
                <Typography sx={{ fontSize: "10px", color: "#707070", textAlign: "center" }}>
                  Click to add points, double-click to finish
                </Typography>
              )}

              {/* Enhanced Navigation with Image Thumbnails Carousel */}
              <Box
                sx={{
                  width: "288px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {/* Thumbnail Carousel */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <IconButton onClick={goToPreviousImage} disabled={currentImageIndex === 0} sx={{ padding: "4px" }}>
                    <ChevronLeftIcon sx={{ width: "20px", height: "20px" }} />
                  </IconButton>

                  {/* Thumbnail Images Container */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: "4px",
                      maxWidth: "200px",
                      overflowX: "auto",
                      padding: "4px",
                      "&::-webkit-scrollbar": {
                        height: "2px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#2A77D5",
                        borderRadius: "2px",
                      },
                    }}
                  >
                    {uploadedImages.map((image, index) => (
                      <Box
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        sx={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "4px",
                          border: index === currentImageIndex ? "2px solid #2A77D5" : "1px solid #D1D1D1",
                          overflow: "hidden",
                          cursor: "pointer",
                          flexShrink: 0,
                          "&:hover": {
                            border: "2px solid #2A77D5",
                          },
                        }}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Thumbnail ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>

                  <IconButton
                    onClick={goToNextImage}
                    disabled={currentImageIndex === uploadedImages.length - 1}
                    sx={{ padding: "4px" }}
                  >
                    <ChevronRightIcon sx={{ width: "20px", height: "20px" }} />
                  </IconButton>
                </Box>

                {/* Current Image Indicator */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #2A77D5",
                      background: "#FFFFFF",
                      boxShadow: "0px 1px 4px 0px #70707033",
                      fontSize: "12px",
                      fontFamily: "Mukta",
                      fontWeight: 500,
                      color: "#2A77D5",
                    }}
                  >
                    {currentImageIndex + 1} of {uploadedImages.length}
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                width: "1px",
                height: "528px",
                background: "#D9D9D9",
              }}
            />

            <Box
              sx={{
                width: "391px",
                height: "528px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "#707070",
                }}
              >
                Tagged Elements ({taggedElements.length})
              </Typography>

              <Box sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                {taggedElements.map((element) => (
                  <Box
                    key={element.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px",
                      border: "1px solid #F0F0F0",
                      borderRadius: "4px",
                      gap: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "4px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#F5F5F5",
                      }}
                    >
                      <img
                        src={element.croppedImage}
                        alt={element.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        flex: 1,
                        fontFamily: "Mukta",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "16px",
                        color: "#3B3B3B",
                      }}
                    >
                      {element.name}
                    </Typography>

                    <IconButton onClick={() => deleteTaggedElement(element.id)} sx={{ padding: 0 }}>
                      <DeleteIcon sx={{ width: "16px", height: "16px", color: "#FF0000" }} />
                    </IconButton>
                  </Box>
                ))}
                {taggedElements.length === 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "200px",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Mukta",
                        fontSize: "14px",
                        color: "#A3A3A3",
                        textAlign: "center",
                      }}
                    >
                      No uniform top elements tagged yet
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Mukta",
                        fontSize: "12px",
                        color: "#A3A3A3",
                        textAlign: "center",
                      }}
                    >
                      Draw shapes on the image to tag top elements like shirts, logos, collars, etc.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog open={showTagModal} onClose={() => setShowTagModal(false)}>
        <DialogContent>
          <Box
            sx={{
              width: "288px",
              height: "188px",
              borderRadius: "8px",
              padding: "24px",
              background: "#F1F7FE",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Mukta",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "16px",
                textTransform: "capitalize",
                color: "#3B3B3B",
              }}
            >
              Name Tagged Element
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Typography
                sx={{
                  fontFamily: "Mukta",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "#707070",
                }}
              >
                Tagged Element (e.g., shirt logo, collar, pocket, etc.)
              </Typography>
              <input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Enter Name Of Tagged Element"
                style={{
                  width: "240px",
                  height: "40px",
                  borderRadius: "6px",
                  border: "1px solid #A3A3A3",
                  padding: "0 16px",
                  background: "#FFFFFF",
                  fontFamily: "Mukta",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button
                onClick={cancelTagging}
                sx={{
                  width: "75px",
                  height: "36px",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  background: "#FFFFFF",
                  border: "1px solid #A3A3A3",
                  color: "#707070",
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "16px",
                  textTransform: "uppercase",
                  "&:hover": {
                    background: "#F5F5F5",
                  },
                }}
              >
                CANCEL
              </Button>

              <Button
                onClick={saveTaggedElement}
                disabled={!tagName.trim()}
                sx={{
                  width: "75px",
                  height: "36px",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  background: "#FFFFFF",
                  boxShadow: "0px 1px 4px 0px #70707033",
                  color: "#2A77D5",
                  fontFamily: "Mukta",
                  fontWeight: 500,
                  fontSize: "16px",
                  textTransform: "uppercase",
                  "&:hover": {
                    background: "#F5F5F5",
                  },
                  "&:disabled": {
                    background: "#F0F0F0",
                    color: "#A3A3A3",
                  },
                }}
              >
                SAVE
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UniformTopForm;
