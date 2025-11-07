// Types for Incident Reports
export type IncidentType =
  | "fire"
  | "theft"
  | "medical"
  | "property_damage"
  | "fight"
  | "substance"
  | "lights_on"
  | "other";

export interface IncidentReport {
  id: string;
  type: IncidentType;
  latestAlert: string; // Date and time string
  evidenceCount: number;
  evidenceUrls?: string[];
  description?: string;
}

export interface GuardIncidentReports {
  guardId: string;
  date: string;
  incidents: IncidentReport[];
}

// Types for Tasks
export interface Task {
  id: string;
  assignedBy: string;
  taskTime: string; // Date and time string
  note?: string;
  status?: "PENDING" | "INPROGRESS" | "COMPLETED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deadline?: string;
  completedAt?: string | null;
  taskType?: string;
  estimatedDuration?: number;
  actualDuration?: number | null;
  attachments?: string[];
  // Additional fields from API
  customLocation?: string;
  site?: {
    siteName: string;
    addressLine1?: string | null;
    city: string;
    pinCode: string;
  };
  client?: {
    clientName: string;
    clientLogo?: string | null;
  };
  subtasks?: Array<{
    id: string;
    taskId: string;
    type: string;
    isCompleted: boolean;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  startedAt?: string;
}

export interface GuardTasks {
  guardId: string;
  date: string;
  tasks: Task[];
}

// Helper function to get incident type display name
export const getIncidentTypeDisplayName = (type: IncidentType): string => {
  switch (type) {
    case "fire":
      return "Fire Hazard";
    case "theft":
      return "Theft/Security";
    case "medical":
      return "Medical Emergency";
    case "property_damage":
      return "Property Damage";
    case "fight":
      return "Altercation";
    case "substance":
      return "Substance Issue";
    case "lights_on":
      return "Lighting Issue";
    case "other":
      return "Other";
    default:
      return "Unknown";
  }
};

// Helper function to get incident type icon
export const getIncidentTypeIcon = (type: IncidentType): string => {
  switch (type) {
    case "fire":
      return "🔥";
    case "theft":
      return "🔒";
    case "medical":
      return "🏥";
    case "property_damage":
      return "🔨";
    case "fight":
      return "⚠️";
    case "substance":
      return "🚫";
    case "lights_on":
      return "💡";
    case "other":
      return "📋";
    default:
      return "❓";
  }
};
