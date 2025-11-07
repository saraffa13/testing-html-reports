// File: src/modules/settings/utils/imageUtils.ts

export interface Point {
  x: number;
  y: number;
}

export interface TaggedElement {
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
  // Add source information to track which form step it came from
  source?: "top" | "bottom" | "accessories";
}

/**
 * Convert a data URL to a File object
 */
export const dataURLToFile = (dataURL: string, filename: string): File => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

/**
 * Crop image from canvas based on coordinates and shape
 */
export const cropImageFromCanvas = (
  originalImage: File,
  coordinates: any,
  shape: string,
  canvasWidth: number = 288,
  canvasHeight: number = 400
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        if (shape === "rectangle" && coordinates.width && coordinates.height) {
          canvas.width = coordinates.width;
          canvas.height = coordinates.height;

          const scaleX = img.naturalWidth / canvasWidth;
          const scaleY = img.naturalHeight / canvasHeight;

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

          const scaleX = img.naturalWidth / canvasWidth;
          const scaleY = img.naturalHeight / canvasHeight;

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

          const scaleX = img.naturalWidth / canvasWidth;
          const scaleY = img.naturalHeight / canvasHeight;

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
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(originalImage);
  });
};

/**
 * Determine category based on the source step (which form the element came from)
 * This is more reliable than keyword matching
 */
export const categorizeBySource = (source?: string): "top" | "bottom" | "accessory" => {
  switch (source) {
    case "top":
      return "top";
    case "bottom":
      return "bottom";
    case "accessories":
    default:
      return "accessory";
  }
};

/**
 * Enhanced categorization logic for tagged elements (fallback only)
 */
export const categorizeTaggedElement = (elementName: string): "top" | "bottom" | "accessory" => {
  const elementNameLower = elementName.toLowerCase().trim();

  // Top part keywords (shirts, jackets, upper body items)
  const topKeywords = [
    "top",
    "shirt",
    "blouse",
    "jacket",
    "blazer",
    "vest",
    "collar",
    "sleeve",
    "chest",
    "shoulder",
    "upper",
    "tunic",
    "jumper",
    "logo",
    "emblem",
    "patch",
    "button",
    "head",
    "hair",
    "face",
    "nose",
    "eye",
    "mouth",
    "neck",
  ];

  // Bottom part keywords (pants, skirts, lower body items)
  const bottomKeywords = [
    "bottom",
    "pant",
    "pants",
    "trouser",
    "trousers",
    "skirt",
    "short",
    "shorts",
    "lower",
    "leg",
    "knee",
    "waist",
    "belt loop",
    "hem",
    "foot",
    "ankle",
    "thigh",
  ];

  // Accessory keywords (everything else)
  const accessoryKeywords = [
    "accessory",
    "accessories",
    "badge",
    "belt",
    "cap",
    "hat",
    "helmet",
    "tie",
    "bow",
    "scarf",
    "glove",
    "gloves",
    "watch",
    "band",
    "strap",
    "buckle",
    "pin",
    "zipper",
    "velcro",
    "name tag",
    "id",
    "insignia",
    "rank",
    "medal",
    "award",
    "lanyard",
    "clip",
    "holder",
  ];

  // Check for top keywords first
  for (const keyword of topKeywords) {
    if (elementNameLower.includes(keyword)) {
      console.log(`📝 Categorized "${elementName}" as TOP (matched: ${keyword})`);
      return "top";
    }
  }

  // Check for bottom keywords
  for (const keyword of bottomKeywords) {
    if (elementNameLower.includes(keyword)) {
      console.log(`📝 Categorized "${elementName}" as BOTTOM (matched: ${keyword})`);
      return "bottom";
    }
  }

  // Check for accessory keywords or default to accessory
  for (const keyword of accessoryKeywords) {
    if (elementNameLower.includes(keyword)) {
      console.log(`📝 Categorized "${elementName}" as ACCESSORY (matched: ${keyword})`);
      return "accessory";
    }
  }

  // Default case - if no matches, categorize as accessory
  console.log(`📝 Categorized "${elementName}" as ACCESSORY (default)`);
  return "accessory";
};

/**
 * Create base image files with proper naming
 */
export const createBaseImageFiles = (
  uploadedImages: File[],
  uniformName: string,
  category: "top" | "bottom" | "accessory"
): File[] => {
  const baseImageFiles: File[] = [];
  const timestamp = Date.now();
  const sanitizedUniformName = uniformName.replace(/[^a-zA-Z0-9]/g, "_");

  uploadedImages.forEach((originalImage, index) => {
    // Create a new File with a descriptive name
    const filename = `${sanitizedUniformName}_${category}_base_image_${index + 1}_${timestamp}.${originalImage.name.split(".").pop() || "jpg"}`;

    // Create new File object with the original image data but new name
    const baseImageFile = new File([originalImage], filename, {
      type: originalImage.type,
      lastModified: originalImage.lastModified,
    });

    baseImageFiles.push(baseImageFile);
    console.log(`📷 Created base image: ${filename} (${(baseImageFile.size / 1024).toFixed(1)} KB)`);
  });

  return baseImageFiles;
};

/**
 * Process tagged elements and convert them to files organized by category
 * Now includes base images and proper categorization
 */
export const processTaggedElements = async (
  allTaggedElements: TaggedElement[],
  allUploadedImages: File[],
  uniformName: string
): Promise<{
  topPartFiles: File[];
  bottomPartFiles: File[];
  accessoryFiles: File[];
}> => {
  const topPartFiles: File[] = [];
  const bottomPartFiles: File[] = [];
  const accessoryFiles: File[] = [];

  console.log(`📝 Processing tagged elements and base images...`);
  console.log(`📊 Input data:`, {
    totalTaggedElements: allTaggedElements.length,
    totalUploadedImages: allUploadedImages.length,
  });

  // Separate elements by their source step
  const topElements = allTaggedElements.filter((el) => el.source === "top");
  const bottomElements = allTaggedElements.filter((el) => el.source === "bottom");
  const accessoryElements = allTaggedElements.filter((el) => el.source === "accessories");

  console.log(`📊 Elements by source:`, {
    top: topElements.length,
    bottom: bottomElements.length,
    accessories: accessoryElements.length,
  });

  // Helper function to process elements for a specific category
  const processElementsForCategory = async (
    elements: TaggedElement[],
    categoryImages: File[],
    category: "top" | "bottom" | "accessory",
    targetFiles: File[]
  ) => {
    // First, add base images for this category
    const baseImages = createBaseImageFiles(categoryImages, uniformName, category);
    targetFiles.push(...baseImages);

    // Then process tagged elements
    for (const element of elements) {
      try {
        const originalImage = categoryImages[element.imageIndex];
        if (!originalImage) {
          console.warn(
            `⚠️ Original image not found for element ${element.id} at index ${element.imageIndex} in ${category}`
          );
          continue;
        }

        // Crop the image based on the tagged coordinates
        const croppedDataURL = await cropImageFromCanvas(originalImage, element.coordinates, element.shape);

        // Create meaningful filename
        const timestamp = Date.now();
        const sanitizedName = element.name.replace(/[^a-zA-Z0-9]/g, "_");
        const sanitizedUniformName = uniformName.replace(/[^a-zA-Z0-9]/g, "_");
        const filename = `${sanitizedUniformName}_${category}_${sanitizedName}_tagged_${timestamp}.png`;

        const file = dataURLToFile(croppedDataURL, filename);
        targetFiles.push(file);

        console.log(`✅ Processed tagged element: "${element.name}" -> ${category.toUpperCase()} (${filename})`);
      } catch (error) {
        console.error(`❌ Error processing element ${element.id} ("${element.name}") in ${category}:`, error);
      }
    }
  };

  // Process each category separately
  // We need to separate uploaded images by category based on the step they came from

  // For now, we'll work with the existing structure where all images are mixed
  // But we need to track which images belong to which step

  // Since we don't have step separation in the current structure,
  // we'll use the element source to determine which images to process

  const topImageIndices = new Set(topElements.map((el) => el.imageIndex));
  const bottomImageIndices = new Set(bottomElements.map((el) => el.imageIndex));
  const accessoryImageIndices = new Set(accessoryElements.map((el) => el.imageIndex));

  // Create separate image arrays (this is a workaround - ideally images should be separated by step)
  const topImages = allUploadedImages.filter((_, index) => topImageIndices.has(index));
  const bottomImages = allUploadedImages.filter((_, index) => bottomImageIndices.has(index));
  const accessoryImages = allUploadedImages.filter((_, index) => accessoryImageIndices.has(index));

  // Process each category
  await processElementsForCategory(topElements, topImages, "top", topPartFiles);
  await processElementsForCategory(bottomElements, bottomImages, "bottom", bottomPartFiles);
  await processElementsForCategory(accessoryElements, accessoryImages, "accessory", accessoryFiles);

  console.log(`📊 Processing complete:
    - Top parts: ${topPartFiles.length} files (${topImages.length} base + ${topElements.length} tagged)
    - Bottom parts: ${bottomPartFiles.length} files (${bottomImages.length} base + ${bottomElements.length} tagged)
    - Accessories: ${accessoryFiles.length} files (${accessoryImages.length} base + ${accessoryElements.length} tagged)
    - Total: ${topPartFiles.length + bottomPartFiles.length + accessoryFiles.length} files`);

  return {
    topPartFiles,
    bottomPartFiles,
    accessoryFiles,
  };
};

/**
 * Validate image files
 */
export const validateImageFiles = (files: File[]): string[] => {
  const errors: string[] = [];
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

  files.forEach((file, index) => {
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File ${index + 1} (${file.name}): Invalid file type. Please use JPEG, PNG, or GIF.`);
    }

    if (file.size > maxFileSize) {
      errors.push(`File ${index + 1} (${file.name}): File size exceeds 5MB limit.`);
    }
  });

  return errors;
};
