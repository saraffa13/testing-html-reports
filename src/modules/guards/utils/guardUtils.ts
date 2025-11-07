// File: src/utils/guardUtils.ts

import type { Guard } from "../services/guards-api.service";

/**
 * Utility functions for working with guard data
 */

// Extract guard ID from URL parameter or guard name
export const getGuardIdFromParam = (
  guardParam: string | undefined,
  getGuardByName: (name: string) => Guard | undefined
): string | null => {
  if (!guardParam) return null;

  // First check if the param is already a guard ID (starts with specific pattern or is UUID-like)
  if (guardParam.includes("-") && guardParam.length > 10) {
    // Could be a UUID or formatted ID, return as is
    return guardParam;
  }

  // Otherwise, try to find guard by name
  const guard = getGuardByName(guardParam);
  return guard?.id || null;
};

// Format guard name for URL (replace spaces with hyphens, lowercase)
export const formatGuardNameForURL = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, ""); // Remove special characters except hyphens
};

// Extract guard name from URL parameter
export const formatGuardNameFromURL = (urlParam: string): string => {
  return urlParam
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Validate guard ID format
export const isValidGuardId = (guardId: string | null | undefined): boolean => {
  if (!guardId) return false;

  // Basic validation - should be non-empty string with reasonable length
  return guardId.trim().length > 0 && guardId.length >= 3;
};

// Get full guard name
export const getFullGuardName = (guard: Guard): string => {
  return guard.name || "Unknown Guard";
};

// Extract coordinates from various map link formats
export const extractCoordinatesFromMapLink = (mapLink: string): { lat: number; lng: number } | null => {
  if (!mapLink) return null;

  try {
    // Try different Google Maps URL patterns
    const patterns = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // @lat,lng
      /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // q=lat,lng
      /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ll=lat,lng
      /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // center=lat,lng
    ];

    for (const pattern of patterns) {
      const match = mapLink.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);

        // Validate coordinates are reasonable
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }

    console.warn("Could not extract valid coordinates from map link:", mapLink);
    return null;
  } catch (error) {
    console.error("Error extracting coordinates:", error);
    return null;
  }
};

// Default coordinates for different regions (fallback)
export const getDefaultCoordinates = (region?: string): { lat: number; lng: number } => {
  const defaults: { [key: string]: { lat: number; lng: number } } = {
    pune: { lat: 18.5204, lng: 73.8567 },
    mumbai: { lat: 19.076, lng: 72.8777 },
    delhi: { lat: 28.6139, lng: 77.209 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
    india: { lat: 20.5937, lng: 78.9629 },
  };

  return defaults[region?.toLowerCase() || "india"] || defaults.india;
};
