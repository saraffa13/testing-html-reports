// File: src/modules/officers/service/taskService.ts - Final errorless version
import { authApi } from "../../../config/axios";

// API Request interfaces matching the backend
export interface CreateTaskRequest {
  clientId?: string;
  siteId?: string;
  customLocation?: string;
  areaOfficerId: string;
  deadline: string; // ISO string format
  subtasks: TaskSubtaskType[];
}

export interface CreateTaskResponse {
  success: boolean;
  data: {
    id: string;
    clientId?: string;
    siteId?: string;
    customLocation?: string;
    areaOfficerId: string;
    deadline: string;
    taskStatus: "PENDING" | "INPROGRESS" | "COMPLETED";
    subtasks: {
      id: string;
      type: TaskSubtaskType;
      isCompleted: boolean;
    }[];
    createdAt: string;
    updatedAt: string;
  };
  timestamp: string;
}

// Task subtask types from API
export type TaskSubtaskType = "SITE_VISIT" | "INSPECTION" | "DOCUMENTS" | "TRAINING" | "OTHER";

// Frontend form data types
export interface TaskFormData {
  taskLocation: {
    selectedSites: Array<{
      siteId: string;
      clientId: string;
      siteName: string;
      clientName: string;
      clientLogo?: string;
    }>;
    customLocation?: string;
    isCustomLocation: boolean;
  };
  taskSelection: {
    selectedTasks: string[];
  };
  taskDeadline: {
    dueDate: string; // YYYY-MM-DD format
    dueTime: string; // HH:MM format
    amPm: "AM" | "PM";
  };
}

// Legacy interface for backward compatibility (no longer used)
export interface Client {
  id: number;
  name: string;
  companyId: string;
  logo?: string;
}

// Map frontend task types to API subtask types
const mapTaskTypeToSubtask = (taskType: string): TaskSubtaskType => {
  const mapping: Record<string, TaskSubtaskType> = {
    site_visit: "SITE_VISIT",
    inspection: "INSPECTION",
    document: "DOCUMENTS",
    training: "TRAINING",
    other: "OTHER",
  };

  return mapping[taskType] || "OTHER";
};

// Convert form date/time to ISO string
const formatDeadlineToISO = (dueDate: string, dueTime: string, amPm: "AM" | "PM"): string => {
  if (!dueDate || !dueTime || !amPm) {
    throw new Error("Invalid date/time format");
  }

  // Parse time
  const [hours, minutes] = dueTime.split(":").map((num) => parseInt(num));
  let hour24 = hours;

  // Convert to 24-hour format
  if (amPm === "PM" && hours !== 12) {
    hour24 = hours + 12;
  } else if (amPm === "AM" && hours === 12) {
    hour24 = 0;
  }

  // Create date string in IST directly (no timezone conversion)
  const [year, month, day] = dueDate.split("-");
  const paddedHour = String(hour24).padStart(2, "0");
  const paddedMinute = String(minutes).padStart(2, "0");

  // Return IST format directly for backend (format: 2025-09-21T16:00:00.000+05:30)
  return `${year}-${month}-${day}T${paddedHour}:${paddedMinute}:00.000+05:30`;

  // OLD CODE (causes timezone conversion issue):
  // const dateTime = new Date(dueDate);
  // dateTime.setHours(hour24, minutes, 0, 0);
  // return formatDateForBackend(dateTime);
};

// Transform form data to API request format
const transformFormDataToApiRequest = (formData: TaskFormData, areaOfficerId: string): CreateTaskRequest => {
  const { taskLocation, taskSelection, taskDeadline } = formData;

  // Convert deadline to ISO format
  const deadline = formatDeadlineToISO(taskDeadline.dueDate, taskDeadline.dueTime, taskDeadline.amPm);

  // Convert selected tasks to subtasks
  const subtasks = taskSelection.selectedTasks.map(mapTaskTypeToSubtask);

  // Base request - ensure all required fields are present
  const request: CreateTaskRequest = {
    areaOfficerId: areaOfficerId.trim(), // Ensure no whitespace
    deadline,
    subtasks,
  };

  // Add location data based on selection type
  if (taskLocation.isCustomLocation && taskLocation.customLocation) {
    request.customLocation = taskLocation.customLocation.trim();
  } else if (taskLocation.selectedSites.length > 0) {
    // For existing sites, include both clientId and siteId
    const selectedSite = taskLocation.selectedSites[0];
    request.clientId = selectedSite.clientId.trim();
    request.siteId = selectedSite.siteId.trim();
  } else {
    throw new Error("Please select a location or provide a custom location");
  }

  return request;
};

// API service class
class TaskService {
  // Create a new task using the real API
  async createTask(formData: TaskFormData, areaOfficerId: string): Promise<CreateTaskResponse> {
    try {
      console.log(`🔄 Creating task for area officer: ${areaOfficerId}`, formData);

      // Validate areaOfficerId
      if (!areaOfficerId || !areaOfficerId.trim()) {
        throw new Error("Area Officer ID is required");
      }

      // Transform form data to API request format
      const apiRequest = transformFormDataToApiRequest(formData, areaOfficerId);

      // Clean request - remove undefined values
      const cleanRequest = {
        areaOfficerId: apiRequest.areaOfficerId,
        deadline: apiRequest.deadline,
        subtasks: apiRequest.subtasks,
        ...(apiRequest.clientId && { clientId: apiRequest.clientId }),
        ...(apiRequest.siteId && { siteId: apiRequest.siteId }),
        ...(apiRequest.customLocation && { customLocation: apiRequest.customLocation }),
      };

      console.log(`📤 Sending task creation request:`, cleanRequest);

      // 🔥 FIXED: Use "/tasks" since base URL already includes "/api/v2"
      // Base URL: https://upandup.shilltube.fun/api/v2
      // Endpoint: /tasks
      // Final URL: https://upandup.shilltube.fun/api/v2/tasks ✅
      const response = await authApi.post<CreateTaskResponse>("/tasks", cleanRequest, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*", // Match curl/swagger headers
        },
      });

      console.log(`✅ Task created successfully:`, response.data);

      if (!response.data.success) {
        throw new Error("Failed to create task");
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Task creation error:", error);

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        console.error("🔍 API Error Details:", {
          status,
          statusText: error.response.statusText,
          data: errorData,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullURL: `${error.config?.baseURL}${error.config?.url}`,
        });

        // Handle specific HTTP status codes
        switch (status) {
          case 400:
            throw new Error(errorData?.message || "Invalid request data. Please check all fields.");
          case 401:
            throw new Error("Unauthorized. Please login again.");
          case 403:
            throw new Error("You do not have permission to create tasks.");
          case 404:
            throw new Error("Area officer, client, or site not found.");
          case 422:
            throw new Error("Invalid data format. Please check your input.");
          case 500:
            throw new Error("Server error occurred. Please try again or contact support.");
          default:
            throw new Error(errorData?.message || `Request failed with status ${status}`);
        }
      } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK") {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.message || "An unexpected error occurred.");
      }
    }
  }

  // Validate form data before submission
  validateFormData(formData: TaskFormData): string[] {
    const errors: string[] = [];

    // Validate task location
    if (formData.taskLocation.isCustomLocation) {
      if (!formData.taskLocation.customLocation?.trim()) {
        errors.push("Custom location is required");
      } else if (formData.taskLocation.customLocation.trim().length < 3) {
        errors.push("Custom location must be at least 3 characters long");
      } else if (formData.taskLocation.customLocation.trim().length > 100) {
        errors.push("Custom location must be less than 100 characters");
      }
    } else {
      if (formData.taskLocation.selectedSites.length === 0) {
        errors.push("Please select at least one client site");
      }
    }

    // Validate task selection
    if (formData.taskSelection.selectedTasks.length === 0) {
      errors.push("Please select at least one task type");
    }

    // Validate deadline
    if (!formData.taskDeadline.dueDate) {
      errors.push("Due date is required");
    }

    if (!formData.taskDeadline.dueTime) {
      errors.push("Due time is required");
    }

    if (!formData.taskDeadline.amPm) {
      errors.push("Please select AM/PM");
    }

    // Validate time format
    if (formData.taskDeadline.dueTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.taskDeadline.dueTime)) {
        errors.push("Invalid time format. Please use HH:MM format");
      }
    }

    // Validate date is not in the past
    if (formData.taskDeadline.dueDate && formData.taskDeadline.dueTime && formData.taskDeadline.amPm) {
      try {
        const deadline = formatDeadlineToISO(
          formData.taskDeadline.dueDate,
          formData.taskDeadline.dueTime,
          formData.taskDeadline.amPm
        );
        const deadlineDate = new Date(deadline);
        const now = new Date();

        if (deadlineDate < now) {
          errors.push("Task deadline cannot be in the past");
        }
      } catch (error) {
        errors.push("Invalid deadline format");
      }
    }

    return errors;
  }

  // Save draft (local storage only for now)
  async saveDraft(formData: TaskFormData): Promise<boolean> {
    try {
      localStorage.setItem("taskDraft", JSON.stringify(formData));
      console.log("✅ Draft saved to localStorage");
      return true;
    } catch (error) {
      console.error("❌ Error saving draft:", error);
      return false;
    }
  }

  // Load draft from local storage
  loadDraft(): TaskFormData | null {
    try {
      const savedDraft = localStorage.getItem("taskDraft");
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        console.log("📥 Loaded draft from localStorage");
        return draftData;
      }
    } catch (error) {
      console.error("❌ Error loading draft:", error);
    }
    return null;
  }

  // Clear draft from local storage
  clearDraft(): void {
    try {
      localStorage.removeItem("taskDraft");
      console.log("🗑️ Draft cleared from localStorage");
    } catch (error) {
      console.error("❌ Error clearing draft:", error);
    }
  }

  // Format deadline for display
  formatDeadlineForDisplay(dueDate: string, dueTime: string, amPm: "AM" | "PM"): string {
    try {
      const isoString = formatDeadlineToISO(dueDate, dueTime, amPm);
      const date = new Date(isoString);

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return `${dueDate} ${dueTime} ${amPm}`;
    }
  }

  // Get task type display name
  getTaskTypeDisplayName(taskType: string): string {
    const displayNames: Record<string, string> = {
      site_visit: "Site Visit",
      inspection: "Inspection",
      document: "Document",
      training: "Training",
      other: "Other",
    };

    return displayNames[taskType] || taskType;
  }

  // Legacy method for backward compatibility (no longer needed)
  async getClients(): Promise<Client[]> {
    console.warn("⚠️ getClients() is deprecated. Use useClientSites hook instead.");
    return [];
  }
}

// Export singleton instance
export const taskService = new TaskService();

// // File: src/modules/officers/service/taskService.ts - Final errorless version
// import { formatDateForBackend } from "@modules/clients/utils/dateFormatUtils";
// import { authApi } from "../../../config/axios";

// // API Request interfaces matching the backend
// export interface CreateTaskRequest {
//   clientId?: string;
//   siteId?: string;
//   customLocation?: string;
//   areaOfficerId: string;
//   deadline: string; // ISO string format
//   subtasks: TaskSubtaskType[];
// }

// export interface CreateTaskResponse {
//   success: boolean;
//   data: {
//     id: string;
//     clientId?: string;
//     siteId?: string;
//     customLocation?: string;
//     areaOfficerId: string;
//     deadline: string;
//     taskStatus: "PENDING" | "INPROGRESS" | "COMPLETED";
//     subtasks: {
//       id: string;
//       type: TaskSubtaskType;
//       isCompleted: boolean;
//     }[];
//     createdAt: string;
//     updatedAt: string;
//   };
//   timestamp: string;
// }

// // Task subtask types from API
// export type TaskSubtaskType = "SITE_VISIT" | "INSPECTION" | "DOCUMENTS" | "TRAINING" | "OTHER";

// // Frontend form data types
// export interface TaskFormData {
//   taskLocation: {
//     selectedSites: Array<{
//       siteId: string;
//       clientId: string;
//       siteName: string;
//       clientName: string;
//       clientLogo?: string;
//     }>;
//     customLocation?: string;
//     isCustomLocation: boolean;
//   };
//   taskSelection: {
//     selectedTasks: string[];
//   };
//   taskDeadline: {
//     dueDate: string; // YYYY-MM-DD format
//     dueTime: string; // HH:MM format
//     amPm: "AM" | "PM";
//   };
// }

// // Legacy interface for backward compatibility (no longer used)
// export interface Client {
//   id: number;
//   name: string;
//   companyId: string;
//   logo?: string;
// }

// // Map frontend task types to API subtask types
// const mapTaskTypeToSubtask = (taskType: string): TaskSubtaskType => {
//   const mapping: Record<string, TaskSubtaskType> = {
//     site_visit: "SITE_VISIT",
//     inspection: "INSPECTION",
//     document: "DOCUMENTS",
//     training: "TRAINING",
//     other: "OTHER",
//   };

//   return mapping[taskType] || "OTHER";
// };

// // Convert form date/time to ISO string
// const formatDeadlineToISO = (dueDate: string, dueTime: string, amPm: "AM" | "PM"): string => {
//   if (!dueDate || !dueTime || !amPm) {
//     throw new Error("Invalid date/time format");
//   }

//   // Parse time
//   const [hours, minutes] = dueTime.split(":").map((num) => parseInt(num));
//   let hour24 = hours;

//   // Convert to 24-hour format
//   if (amPm === "PM" && hours !== 12) {
//     hour24 = hours + 12;
//   } else if (amPm === "AM" && hours === 12) {
//     hour24 = 0;
//   }

//   // Create ISO string (assuming local timezone)
//   const dateTime = new Date(dueDate);
//   dateTime.setHours(hour24, minutes, 0, 0);

//   return formatDateForBackend(dateTime);
// };

// // Transform form data to API request format
// const transformFormDataToApiRequest = (formData: TaskFormData, areaOfficerId: string): CreateTaskRequest => {
//   const { taskLocation, taskSelection, taskDeadline } = formData;

//   // Convert deadline to ISO format
//   const deadline = formatDeadlineToISO(taskDeadline.dueDate, taskDeadline.dueTime, taskDeadline.amPm);

//   // Convert selected tasks to subtasks
//   const subtasks = taskSelection.selectedTasks.map(mapTaskTypeToSubtask);

//   // Base request - ensure all required fields are present
//   const request: CreateTaskRequest = {
//     areaOfficerId: areaOfficerId.trim(), // Ensure no whitespace
//     deadline,
//     subtasks,
//   };

//   // Add location data based on selection type
//   if (taskLocation.isCustomLocation && taskLocation.customLocation) {
//     request.customLocation = taskLocation.customLocation.trim();
//   } else if (taskLocation.selectedSites.length > 0) {
//     // For existing sites, include both clientId and siteId
//     const selectedSite = taskLocation.selectedSites[0];
//     request.clientId = selectedSite.clientId.trim();
//     request.siteId = selectedSite.siteId.trim();
//   } else {
//     throw new Error("Please select a location or provide a custom location");
//   }

//   return request;
// };

// // API service class
// class TaskService {
//   // Create a new task using the real API
//   async createTask(formData: TaskFormData, areaOfficerId: string): Promise<CreateTaskResponse> {
//     try {
//       console.log(`🔄 Creating task for area officer: ${areaOfficerId}`, formData);

//       // Validate areaOfficerId
//       if (!areaOfficerId || !areaOfficerId.trim()) {
//         throw new Error("Area Officer ID is required");
//       }

//       // Transform form data to API request format
//       const apiRequest = transformFormDataToApiRequest(formData, areaOfficerId);

//       // Clean request - remove undefined values
//       const cleanRequest = {
//         areaOfficerId: apiRequest.areaOfficerId,
//         deadline: apiRequest.deadline,
//         subtasks: apiRequest.subtasks,
//         ...(apiRequest.clientId && { clientId: apiRequest.clientId }),
//         ...(apiRequest.siteId && { siteId: apiRequest.siteId }),
//         ...(apiRequest.customLocation && { customLocation: apiRequest.customLocation }),
//       };

//       console.log(`📤 Sending task creation request:`, cleanRequest);

//       // 🔥 FIXED: Use "/tasks" since base URL already includes "/api/v2"
//       // Base URL: https://upandup.shilltube.fun/api/v2
//       // Endpoint: /tasks
//       // Final URL: https://upandup.shilltube.fun/api/v2/tasks ✅
//       const response = await authApi.post<CreateTaskResponse>("/tasks", cleanRequest, {
//         headers: {
//           "Content-Type": "application/json",
//           accept: "*/*", // Match curl/swagger headers
//         },
//       });

//       console.log(`✅ Task created successfully:`, response.data);

//       if (!response.data.success) {
//         throw new Error("Failed to create task");
//       }

//       return response.data;
//     } catch (error: any) {
//       console.error("❌ Task creation error:", error);

//       if (error.response) {
//         const errorData = error.response.data;
//         const status = error.response.status;

//         console.error("🔍 API Error Details:", {
//           status,
//           statusText: error.response.statusText,
//           data: errorData,
//           url: error.config?.url,
//           baseURL: error.config?.baseURL,
//           fullURL: `${error.config?.baseURL}${error.config?.url}`,
//         });

//         // Handle specific HTTP status codes
//         switch (status) {
//           case 400:
//             throw new Error(errorData?.message || "Invalid request data. Please check all fields.");
//           case 401:
//             throw new Error("Unauthorized. Please login again.");
//           case 403:
//             throw new Error("You do not have permission to create tasks.");
//           case 404:
//             throw new Error("Area officer, client, or site not found.");
//           case 422:
//             throw new Error("Invalid data format. Please check your input.");
//           case 500:
//             throw new Error("Server error occurred. Please try again or contact support.");
//           default:
//             throw new Error(errorData?.message || `Request failed with status ${status}`);
//         }
//       } else if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK") {
//         throw new Error("Network error. Please check your connection.");
//       } else {
//         throw new Error(error.message || "An unexpected error occurred.");
//       }
//     }
//   }

//   // Validate form data before submission
//   validateFormData(formData: TaskFormData): string[] {
//     const errors: string[] = [];

//     // Validate task location
//     if (formData.taskLocation.isCustomLocation) {
//       if (!formData.taskLocation.customLocation?.trim()) {
//         errors.push("Custom location is required");
//       } else if (formData.taskLocation.customLocation.trim().length < 3) {
//         errors.push("Custom location must be at least 3 characters long");
//       } else if (formData.taskLocation.customLocation.trim().length > 100) {
//         errors.push("Custom location must be less than 100 characters");
//       }
//     } else {
//       if (formData.taskLocation.selectedSites.length === 0) {
//         errors.push("Please select at least one client site");
//       }
//     }

//     // Validate task selection
//     if (formData.taskSelection.selectedTasks.length === 0) {
//       errors.push("Please select at least one task type");
//     }

//     // Validate deadline
//     if (!formData.taskDeadline.dueDate) {
//       errors.push("Due date is required");
//     }

//     if (!formData.taskDeadline.dueTime) {
//       errors.push("Due time is required");
//     }

//     if (!formData.taskDeadline.amPm) {
//       errors.push("Please select AM/PM");
//     }

//     // Validate time format
//     if (formData.taskDeadline.dueTime) {
//       const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//       if (!timeRegex.test(formData.taskDeadline.dueTime)) {
//         errors.push("Invalid time format. Please use HH:MM format");
//       }
//     }

//     // Validate date is not in the past
//     if (formData.taskDeadline.dueDate && formData.taskDeadline.dueTime && formData.taskDeadline.amPm) {
//       try {
//         const deadline = formatDeadlineToISO(
//           formData.taskDeadline.dueDate,
//           formData.taskDeadline.dueTime,
//           formData.taskDeadline.amPm
//         );
//         const deadlineDate = new Date(deadline);
//         const now = new Date();

//         if (deadlineDate < now) {
//           errors.push("Task deadline cannot be in the past");
//         }
//       } catch (error) {
//         errors.push("Invalid deadline format");
//       }
//     }

//     return errors;
//   }

//   // Save draft (local storage only for now)
//   async saveDraft(formData: TaskFormData): Promise<boolean> {
//     try {
//       localStorage.setItem("taskDraft", JSON.stringify(formData));
//       console.log("✅ Draft saved to localStorage");
//       return true;
//     } catch (error) {
//       console.error("❌ Error saving draft:", error);
//       return false;
//     }
//   }

//   // Load draft from local storage
//   loadDraft(): TaskFormData | null {
//     try {
//       const savedDraft = localStorage.getItem("taskDraft");
//       if (savedDraft) {
//         const draftData = JSON.parse(savedDraft);
//         console.log("📥 Loaded draft from localStorage");
//         return draftData;
//       }
//     } catch (error) {
//       console.error("❌ Error loading draft:", error);
//     }
//     return null;
//   }

//   // Clear draft from local storage
//   clearDraft(): void {
//     try {
//       localStorage.removeItem("taskDraft");
//       console.log("🗑️ Draft cleared from localStorage");
//     } catch (error) {
//       console.error("❌ Error clearing draft:", error);
//     }
//   }

//   // Format deadline for display
//   formatDeadlineForDisplay(dueDate: string, dueTime: string, amPm: "AM" | "PM"): string {
//     try {
//       const isoString = formatDeadlineToISO(dueDate, dueTime, amPm);
//       const date = new Date(isoString);

//       return date.toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });
//     } catch (error) {
//       return `${dueDate} ${dueTime} ${amPm}`;
//     }
//   }

//   // Get task type display name
//   getTaskTypeDisplayName(taskType: string): string {
//     const displayNames: Record<string, string> = {
//       site_visit: "Site Visit",
//       inspection: "Inspection",
//       document: "Document",
//       training: "Training",
//       other: "Other",
//     };

//     return displayNames[taskType] || taskType;
//   }

//   // Legacy method for backward compatibility (no longer needed)
//   async getClients(): Promise<Client[]> {
//     console.warn("⚠️ getClients() is deprecated. Use useClientSites hook instead.");
//     return [];
//   }
// }

// // Export singleton instance
// export const taskService = new TaskService();
