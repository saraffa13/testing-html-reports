import { Button, Divider } from "@mui/material";
import { CheckCircle, Circle, Hand, MapPin, Navigation, Plus, Redo, Square, Undo, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFormContext } from "react-hook-form";
import type { ClientSite } from "../forms/add_client_site/types";

interface Geofence {
  id: number;
  name: string;
  polygon?: any;
  circle?: any;
  type: "polygon" | "circle";
  data?: any;
}

interface GeofenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "site" | "post";
  sitePostIndex?: number;
  title?: string;
}

type ToolType = "pan" | "circle" | "polygon" | "navigation" | "undo" | "redo";

interface LatLng {
  lat: number;
  lng: number;
}

declare global {
  interface Window {
    L: any;
  }
}

const GeofenceModal: React.FC<GeofenceModalProps> = ({ isOpen, onClose, mode = "site", sitePostIndex = 0, title }) => {
  const [selectedTool, setSelectedTool] = useState<ToolType>("pan");
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [currentGeofence, setCurrentGeofence] = useState<Geofence | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawLayerRef = useRef<any>(null);
  const currentDrawingRef = useRef<any>(null);
  const highlightMarkerRef = useRef<any>(null);

  const { setValue, watch } = useFormContext<ClientSite>();

  const getModalTitle = () => {
    if (title) return title;
    if (mode === "post") return `Mark Post Geofence - Site Post ${sitePostIndex + 1}`;
    return "Mark Geofence";
  };

  const getButtonText = () => {
    if (mode === "post") return "ADD POST GEOFENCE";
    return "ADD THIS GEOFENCE";
  };

  const addLocationHighlight = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    // Remove existing highlight marker
    if (highlightMarkerRef.current) {
      mapInstanceRef.current.removeLayer(highlightMarkerRef.current);
    }

    // Create a pulsing circle marker to highlight the location
    const pulsingIcon = window.L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 60px;
            height: 60px;
            background: rgba(42, 119, 213, 0.2);
            border: 3px solid #2A77D5;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
          <div style="
            position: absolute;
            width: 12px;
            height: 12px;
            background: #2A77D5;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 5px rgba(0,0,0,0.3);
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        </style>
      `,
      iconSize: [60, 60],
      iconAnchor: [30, 30],
      className: "location-highlight-marker",
    });

    // Add the highlight marker
    highlightMarkerRef.current = window.L.marker([lat, lng], { icon: pulsingIcon }).addTo(mapInstanceRef.current);

    // Add a label for the location with existing geofence info
    const existingGeofenceType = mode === "site" ? watch("geoFencing.type") : null;
    const existingRadius = mode === "site" ? watch("geoFencing.radius") : null;

    let labelText = `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    if (existingGeofenceType && existingGeofenceType !== "NO_GEOFENCE") {
      if (existingGeofenceType === "Circular Geofence" && existingRadius) {
        labelText = `Existing Circular Geofence (${existingRadius}m)`;
      } else if (existingGeofenceType === "Polygon Geofence") {
        labelText = `Existing Polygon Geofence`;
      } else {
        labelText = `Existing ${existingGeofenceType}`;
      }
    }

    const labelIcon = window.L.divIcon({
      html: `<div class="bg-white px-3 py-1 rounded-lg shadow-lg text-sm font-semibold border border-gray-200">${labelText}</div>`,
      iconSize: [200, 30],
      iconAnchor: [0, 15],
      className: "location-tooltip-label",
    });

    // Add label marker slightly offset from the main marker
    window.L.marker([lat + 0.0003, lng + 0.0003], { icon: labelIcon }).addTo(drawLayerRef.current);

    // Add a tooltip
    highlightMarkerRef.current.bindTooltip(`${labelText}`, {
      permanent: false,
      direction: "top",
      className: "location-tooltip",
    });

    // Set map view to the location
    mapInstanceRef.current.setView([lat, lng], 16);
  };

  useEffect(() => {
    if (!isOpen || !mapRef.current || mapInstanceRef.current) return;

    const initializeMap = (): void => {
      let initialCenter: [number, number] = [28.6139, 77.209];
      let shouldHighlight = false;
      let highlightLat = 0;
      let highlightLng = 0;

      if (mode === "site") {
        const lat = watch("geoLocation.coordinates.latitude");
        const lng = watch("geoLocation.coordinates.longitude");
        if (lat && lng && lat !== 0 && lng !== 0) {
          initialCenter = [lat, lng];
          shouldHighlight = true;
          highlightLat = lat;
          highlightLng = lng;
        }
      } else if (mode === "post") {
        const siteLat = watch("geoLocation.coordinates.latitude");
        const siteLng = watch("geoLocation.coordinates.longitude");
        if (siteLat && siteLng && siteLat !== 0 && siteLng !== 0) {
          initialCenter = [siteLat, siteLng];
          shouldHighlight = true;
          highlightLat = siteLat;
          highlightLng = siteLng;
        }
      }

      mapInstanceRef.current = window.L.map(mapRef.current, {
        center: initialCenter,
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
      });

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      drawLayerRef.current = window.L.layerGroup().addTo(mapInstanceRef.current);

      // Add location highlight if coordinates are available
      if (shouldHighlight) {
        setTimeout(() => {
          addLocationHighlight(highlightLat, highlightLng);
        }, 500); // Small delay to ensure map is fully loaded
      }
    };

    if (typeof window.L === "undefined") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        highlightMarkerRef.current = null;
      }
    };
  }, [isOpen, mode, watch]);

  const handleToolSelect = (tool: ToolType): void => {
    // Prevent drawing if a geofence already exists
    if (isDrawingMode || currentGeofence) return;

    setSelectedTool(tool);

    if (tool === "polygon") {
      setIsDrawingMode(true);
      enablePolygonDrawing();
    } else if (tool === "circle") {
      setIsDrawingMode(true);
      enableCircleDrawing();
    } else {
      setIsDrawingMode(false);
      disableDrawingMode();
    }
  };

  const enablePolygonDrawing = (): void => {
    if (!mapInstanceRef.current || currentGeofence) return;

    let isDrawing = false;
    let polygonPoints: LatLng[] = [];

    const handleClick = (e: any): void => {
      if (currentGeofence) return; // Prevent drawing if geofence exists
      if (!isDrawing) {
        isDrawing = true;
        polygonPoints = [e.latlng];

        currentDrawingRef.current = window.L.polygon([e.latlng], {
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.15,
          weight: 2,
          dashArray: "8, 4",
        }).addTo(drawLayerRef.current);
      } else {
        polygonPoints.push(e.latlng);
        currentDrawingRef.current.setLatLngs(polygonPoints);
      }
    };

    const handleDoubleClick = (): void => {
      if (currentGeofence) return; // Prevent drawing if geofence exists
      if (isDrawing && polygonPoints.length >= 3) {
        isDrawing = false;
        currentDrawingRef.current.setStyle({
          fillOpacity: 0.25,
          dashArray: null,
        });

        const geofenceData = {
          type: "polygon",
          coordinates: polygonPoints.map((point) => ({ lat: point.lat, lng: point.lng })),
        };

        const geofenceName = mode === "post" ? `Post ${sitePostIndex + 1} Polygon Geofence` : `Polygon Geofence`;

        const newGeofence: Geofence = {
          id: Date.now(),
          name: geofenceName,
          polygon: currentDrawingRef.current,
          type: "polygon",
          data: geofenceData,
        };

        setCurrentGeofence(newGeofence);
        addGeofenceMarkers(newGeofence, polygonPoints[0]);

        polygonPoints = [];
        currentDrawingRef.current = null;
        setIsDrawingMode(false);
        setSelectedTool("pan");
      }
    };

    mapInstanceRef.current.on("click", handleClick);
    mapInstanceRef.current.on("dblclick", handleDoubleClick);
    mapInstanceRef.current.getContainer().style.cursor = "crosshair";

    mapInstanceRef.current._drawingHandlers = { handleClick, handleDoubleClick };
  };

  const enableCircleDrawing = (): void => {
    if (!mapInstanceRef.current || currentGeofence) return;

    let isDrawing = false;
    let centerPoint: LatLng | null = null;

    const handleClick = (e: any): void => {
      if (currentGeofence) return; // Prevent drawing if geofence exists
      if (!isDrawing) {
        isDrawing = true;
        centerPoint = e.latlng;

        currentDrawingRef.current = window.L.circle(e.latlng, {
          radius: 50,
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.15,
          weight: 2,
          dashArray: "8, 4",
        }).addTo(drawLayerRef.current);
      } else {
        if (currentGeofence) return; // Prevent drawing if geofence exists (double check)
        const distance = mapInstanceRef.current.distance(centerPoint, e.latlng);
        currentDrawingRef.current.setRadius(distance);
        currentDrawingRef.current.setStyle({
          fillOpacity: 0.25,
          dashArray: null,
        });

        const geofenceData = {
          type: "circle",
          center: { lat: centerPoint!.lat, lng: centerPoint!.lng },
          radius: distance,
        };

        const geofenceName = mode === "post" ? `Post ${sitePostIndex + 1} Circle Geofence` : `Circle Geofence`;

        const newGeofence: Geofence = {
          id: Date.now(),
          name: geofenceName,
          circle: currentDrawingRef.current,
          type: "circle",
          data: geofenceData,
        };

        setCurrentGeofence(newGeofence);
        addGeofenceMarkers(newGeofence, centerPoint!);

        isDrawing = false;
        centerPoint = null;
        currentDrawingRef.current = null;
        setIsDrawingMode(false);
        setSelectedTool("pan");
        disableDrawingMode(); // Remove drawing handlers after geofence is set
      }
    };

    const handleMouseMove = (e: any): void => {
      if (isDrawing && centerPoint && currentDrawingRef.current && !currentGeofence) {
        const distance = mapInstanceRef.current.distance(centerPoint, e.latlng);
        currentDrawingRef.current.setRadius(distance);
      }
    };

    mapInstanceRef.current.on("click", handleClick);
    mapInstanceRef.current.on("mousemove", handleMouseMove);
    mapInstanceRef.current.getContainer().style.cursor = "crosshair";

    mapInstanceRef.current._drawingHandlers = { handleClick, handleMouseMove };
  };

  const disableDrawingMode = (): void => {
    if (!mapInstanceRef.current) return;

    if (mapInstanceRef.current._drawingHandlers) {
      mapInstanceRef.current.off("click", mapInstanceRef.current._drawingHandlers.handleClick);
      mapInstanceRef.current.off("dblclick", mapInstanceRef.current._drawingHandlers.handleDoubleClick);
      mapInstanceRef.current.off("mousemove", mapInstanceRef.current._drawingHandlers.handleMouseMove);
      delete mapInstanceRef.current._drawingHandlers;
    }

    mapInstanceRef.current.getContainer().style.cursor = "";

    if (currentDrawingRef.current) {
      drawLayerRef.current.removeLayer(currentDrawingRef.current);
      currentDrawingRef.current = null;
    }
  };

  const addGeofenceMarkers = (geofence: Geofence, position: LatLng): void => {
    const numberIcon = window.L.divIcon({
      html: `<div class="bg-[#2A77D5] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">1</div>`,
      iconSize: [28, 28] as [number, number],
      iconAnchor: [14, 14] as [number, number],
      className: "geofence-number",
    });

    window.L.marker([position.lat, position.lng] as [number, number], { icon: numberIcon }).addTo(drawLayerRef.current);

    // Add radius label for circular geofence
    let labelText = geofence.name;
    if (geofence.type === "circle" && geofence.data?.radius) {
      const radiusInMeters = Math.round(geofence.data.radius);
      labelText += ` (${radiusInMeters}m)`;
    }

    const labelIcon = window.L.divIcon({
      html: `<div class="bg-white px-3 py-1 rounded-lg shadow-lg text-sm font-semibold border border-gray-200">${labelText}</div>`,
      iconSize: [120, 30] as [number, number],
      iconAnchor: [0, 15] as [number, number],
      className: "geofence-label",
    });

    window.L.marker([position.lat + 0.0003, position.lng + 0.0003] as [number, number], { icon: labelIcon }).addTo(
      drawLayerRef.current
    );
  };

  const handleAddGeofence = (): void => {
    if (currentGeofence) {
      setGeofences([currentGeofence]); // Always only one geofence

      if (mode === "site") {
        const geofenceType = currentGeofence.type === "circle" ? "Circular Geofence" : "Polygon Geofence";
        setValue("geoFencing.type", geofenceType, { shouldDirty: true, shouldValidate: true });

        if (currentGeofence.data) {
          if (currentGeofence.type === "circle") {
            setValue("geoLocation.coordinates.latitude", currentGeofence.data.center.lat, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue("geoLocation.coordinates.longitude", currentGeofence.data.center.lng, {
              shouldDirty: true,
              shouldValidate: true,
            });
            console.log("Saving circular geofence with radius:", currentGeofence.data.radius);
            const currentGeoFencing = { type: geofenceType, radius: currentGeofence.data.radius };
            setValue("geoFencing", currentGeoFencing as any, {
              shouldDirty: true,
              shouldValidate: true,
            });
          } else if (currentGeofence.type === "polygon" && currentGeofence.data.coordinates.length > 0) {
            setValue("geoLocation.coordinates.latitude", currentGeofence.data.coordinates[0].lat, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue("geoLocation.coordinates.longitude", currentGeofence.data.coordinates[0].lng, {
              shouldDirty: true,
              shouldValidate: true,
            });
            console.log("Saving polygon geofence with coordinates:", currentGeofence.data.coordinates);
            const currentGeoFencing = { type: geofenceType, coordinates: currentGeofence.data.coordinates };
            setValue("geoFencing", currentGeoFencing as any, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        }
      } else if (mode === "post") {
        const geofenceType = currentGeofence.type === "circle" ? "Circular Geofence" : "Polygon Geofence";
        setValue(`sitePosts.${sitePostIndex}.geoFenceType`, geofenceType, { shouldDirty: true, shouldValidate: true });

        if (currentGeofence.data) {
          if (currentGeofence.type === "circle") {
            console.log(
              "Saving post circular geofence with center and radius:",
              currentGeofence.data.center,
              currentGeofence.data.radius
            );
            setValue(
              `sitePosts.${sitePostIndex}.geofenceData` as any,
              {
                type: "circle",
                center: currentGeofence.data.center,
                radius: currentGeofence.data.radius,
              },
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            );
          } else if (currentGeofence.type === "polygon") {
            console.log("Saving post polygon geofence with coordinates:", currentGeofence.data.coordinates);
            setValue(
              `sitePosts.${sitePostIndex}.geofenceData` as any,
              {
                type: "polygon",
                coordinates: currentGeofence.data.coordinates,
              },
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            );
          }
        }
      }

      // Show success message
      setShowSuccessMessage(true);

      // Hide success message and close modal after 2 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setCurrentGeofence(null);
        onClose();
      }, 2000);
    }
  };

  const handleClearGeofence = (): void => {
    if (currentGeofence) {
      if (currentGeofence.polygon) {
        drawLayerRef.current.removeLayer(currentGeofence.polygon);
      }
      if (currentGeofence.circle) {
        drawLayerRef.current.removeLayer(currentGeofence.circle);
      }

      drawLayerRef.current.clearLayers();
      setCurrentGeofence(null);
      setGeofences([]);

      // Re-add location highlight if coordinates exist
      if (mode === "site") {
        const lat = watch("geoLocation.coordinates.latitude");
        const lng = watch("geoLocation.coordinates.longitude");
        if (lat && lng && lat !== 0 && lng !== 0) {
          setTimeout(() => addLocationHighlight(lat, lng), 100);
        }
      } else if (mode === "post") {
        const siteLat = watch("geoLocation.coordinates.latitude");
        const siteLng = watch("geoLocation.coordinates.longitude");
        if (siteLat && siteLng && siteLat !== 0 && siteLng !== 0) {
          setTimeout(() => addLocationHighlight(siteLat, siteLng), 100);
        }
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        zIndex: 99999,
      }}
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" style={{ zIndex: 99998 }} />

      <div
        className="relative bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden"
        style={{ zIndex: 99999 }}
      >
        {/* Success Message Overlay */}
        {showSuccessMessage && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-2xl font-semibold text-green-800 mb-2">Geofence Added Successfully!</h3>
              <p className="text-green-700">
                {mode === "site"
                  ? "Site geofence has been configured successfully."
                  : `Post geofence for Site Post ${sitePostIndex + 1} has been configured successfully.`}
              </p>
              <div className="mt-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <p className="text-sm text-green-600 mt-2">Closing modal...</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 bg-white">
          <h2 className="text-2xl font-semibold text-[#2A77D5]">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            type="button"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <Divider sx={{ mb: "20px", mx: "20px" }} />
        <div className="absolute flex items-center justify-between px-4 py-3 top-22 left-16 z-20">
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-white rounded-lg border border-gray-300 shadow-sm">
              <button
                onClick={handleClearGeofence}
                disabled={!currentGeofence && geofences.length === 0}
                className={`p-3 border-r border-gray-300 transition-colors duration-200 rounded-l-lg ${
                  !currentGeofence && geofences.length === 0
                    ? "text-gray-400 cursor-not-allowed bg-gray-50"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                title="Clear Geofence"
                type="button"
              >
                <Undo className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleToolSelect("redo")}
                className="p-3 hover:bg-gray-100 text-gray-700 transition-colors duration-200 rounded-r-lg"
                title="Redo"
                type="button"
                disabled
              >
                <Redo className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center bg-white rounded-lg border border-gray-300 shadow-sm">
              <button
                onClick={() => handleToolSelect("pan")}
                className={`p-3 border-r border-gray-300 transition-colors duration-200 rounded-l-lg ${
                  selectedTool === "pan"
                    ? "bg-blue-50 text-[#2A77D5] border-blue-200"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                title="Pan Tool"
                type="button"
              >
                <Hand className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleToolSelect("circle")}
                disabled={isDrawingMode || !!currentGeofence}
                className={`p-3 border-r border-gray-300 transition-colors duration-200 ${
                  selectedTool === "circle"
                    ? "bg-blue-50 text-[#2A77D5] border-blue-200"
                    : isDrawingMode || !!currentGeofence
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "hover:bg-gray-100 text-gray-700"
                }`}
                title="Circle Tool"
                type="button"
              >
                <Circle className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleToolSelect("polygon")}
                disabled={isDrawingMode || !!currentGeofence}
                className={`p-3 border-r border-gray-300 transition-colors duration-200 ${
                  selectedTool === "polygon"
                    ? "bg-blue-50 text-[#2A77D5] border-blue-200"
                    : isDrawingMode || !!currentGeofence
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "hover:bg-gray-100 text-gray-700"
                }`}
                title="Polygon Tool"
                type="button"
              >
                <Square className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleToolSelect("navigation")}
                className={`p-3 transition-colors duration-200 rounded-r-lg ${
                  selectedTool === "navigation"
                    ? "bg-blue-50 text-[#2A77D5] border-blue-200"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                title="Navigation"
                type="button"
              >
                <Navigation className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 mx-5 bg-gray-100 z-10">
          <div ref={mapRef} className="w-full h-full" />

          {isDrawingMode && (
            <div className="absolute top-4 left-4 bg-[#2A77D5] text-white px-4 py-3 rounded-lg shadow-lg z-[1000]">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <p className="text-sm font-medium">
                  {selectedTool === "polygon"
                    ? "Click to add points • Double-click to finish"
                    : "Click center • Click edge to set radius"}
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
            <div className="text-xs text-gray-600">
              Tool: <span className="font-medium capitalize">{selectedTool}</span>
              {isDrawingMode && <span className="text-[#2A77D5] ml-2">• Drawing Active</span>}
              {currentGeofence && <span className="text-green-600 ml-2">• Geofence Ready</span>}
            </div>
          </div>
        </div>
        <div className="my-4 flex">
          {currentGeofence && (
            <div className="mx-auto my-auto">
              <Button onClick={handleAddGeofence} variant="contained">
                <Plus className="w-5 h-5" />
                <span>{getButtonText()}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .company-marker,
        .geofence-number,
        .geofence-label,
        .location-highlight-marker {
          background: transparent !important;
          border: none !important;
        }
        .location-tooltip {
          background: rgba(42, 119, 213, 0.9) !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          padding: 4px 8px !important;
        }
        .location-tooltip:before {
          border-top-color: rgba(42, 119, 213, 0.9) !important;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default GeofenceModal;
