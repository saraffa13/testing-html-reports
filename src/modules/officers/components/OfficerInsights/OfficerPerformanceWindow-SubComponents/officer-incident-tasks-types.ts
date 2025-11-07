// officer-data-types.ts
// Consolidated file for all officer-related data types and services

import {
  Assignment,
  Block,
  Construction,
  Lightbulb,
  LocalFireDepartment,
  LocalHospital,
  Security,
  Warning,
} from "@mui/icons-material";
import React from "react";

// ============================
// INCIDENT TYPES
// ============================

export type OfficerIncidentType =
  | "fire"
  | "theft"
  | "medical"
  | "property_damage"
  | "fight"
  | "substance"
  | "lights_on"
  | "other";

export type OfficerIncidentStatus = "OPEN" | "CLOSED";

export interface OfficerIncidentReport {
  id: string;
  type: OfficerIncidentType;
  status: OfficerIncidentStatus;
  latestAlert: string; // Date and time string
  evidenceCount: number;
  evidenceUrls?: string[];
  description?: string;
  assignedGuard?: string;
  site?: string;
  clientName?: string;
  title?: string;
  date?: string;
}

export interface OfficerIncidentReports {
  officerId: string;
  date: string;
  incidents: OfficerIncidentReport[];
}

// Detailed incident information for incident details page
export interface IncidentDetails {
  id: string;
  type: OfficerIncidentType;
  status: OfficerIncidentStatus;
  client: string;
  site: string;
  duration: string;
  closedOn?: string;
  closedTime?: string;
  firstReported: string;
  firstReportedTime: string;
  areaOfficer: {
    name: string;
    area: string;
    phone: string;
    photo?: string;
  };
  reports: IncidentReport[];
  evidences: Evidence[];
}

export interface IncidentReport {
  id: string;
  reporterName: string;
  reporterPhoto?: string;
  reportedOn: string;
  reportedTime: string;
  description?: string;
}

export interface Evidence {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  uploadedBy: string;
  uploadedOn: string;
}

// ============================
// TASK TYPES
// ============================

export type OfficerTaskStatus = "PENDING" | "OVERDUE" | "DONE";
export type OfficerTaskType = "sitevisit" | "training" | "document" | "inspection" | "other";

export interface OfficerTask {
  id: string;
  type?: OfficerTaskType;
  types?: OfficerTaskType[];
  assignedBy: string;
  assignedTo: string; // Guard name
  taskTime: string; // Date and time string
  dueDate: string; // Due date
  status: OfficerTaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH";
  note?: string;
  site?: string;
  title?: string;
  description?: string;
}

export interface OfficerTasks {
  officerId: string;
  date: string;
  tasks: OfficerTask[];
}

// Detailed task information for task details page
export interface TaskDetails {
  id: string;
  type: OfficerTaskType;
  types: OfficerTaskType[];
  title: string;
  description: string;
  status: OfficerTaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedBy: string;
  assignedTo: string;
  taskTime: string;
  dueDate: string;
  site: string;
  client: string;
  note?: string;
  attachments?: TaskAttachment[];
  progress?: TaskProgress[];
  comments?: TaskComment[];
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: "document" | "image" | "video";
  url: string;
  uploadedBy: string;
  uploadedOn: string;
  size?: string;
}

export interface TaskProgress {
  id: string;
  timestamp: string;
  status: OfficerTaskStatus;
  updatedBy: string;
  note?: string;
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorPhoto?: string;
  timestamp: string;
  content: string;
}

// ============================
// MOCK DATA
// ============================

// Mock incident reports data
export const mockOfficerIncidentReportsData: OfficerIncidentReports[] = [
  {
    officerId: "OFF002",
    date: "2025-06-24",
    incidents: [
      {
        id: "001",
        type: "fire",
        status: "OPEN",
        latestAlert: "24/06/25 02:35 PM",
        evidenceCount: 3,
        evidenceUrls: ["/evidence/fire_off_001.jpg"],
        description: "Fire alarm triggered at GK2 site",
        assignedGuard: "Ramakrishnan",
        site: "Greater Kailash 2",
        clientName: "Axis Bank",
        title: "Fire Hazard Alert",
        date: "2025-06-24",
      },
      {
        id: "002",
        type: "property_damage",
        status: "CLOSED",
        latestAlert: "24/06/25 10:15 AM",
        evidenceCount: 2,
        evidenceUrls: ["/evidence/damage_off_001.jpg"],
        description: "Window damage reported and resolved",
        assignedGuard: "Sachin Kumar",
        site: "Nehru Place",
        clientName: "Haldiram's",
        title: "Property Damage Report",
        date: "2025-06-24",
      },
      {
        id: "003",
        type: "theft",
        status: "OPEN",
        latestAlert: "23/06/25 08:45 PM",
        evidenceCount: 1,
        description: "Suspicious activity reported by guard",
        assignedGuard: "Vikram Singh",
        site: "GK2 Mall",
        clientName: "Client Name",
        title: "Theft Investigation",
        date: "2025-06-23",
      },
    ],
  },
  {
    officerId: "OFF002",
    date: "2025-06-24",
    incidents: [
      {
        id: "004",
        type: "medical",
        status: "CLOSED",
        latestAlert: "24/06/25 11:20 AM",
        evidenceCount: 1,
        description: "Medical emergency handled successfully",
        assignedGuard: "Gaurav Sharma",
        site: "Vasant Vihar",
        clientName: "Corporate Client",
        title: "Medical Emergency",
        date: "2025-06-24",
      },
    ],
  },
];

// Mock tasks data
export const mockOfficerTasksData: OfficerTasks[] = [
  {
    officerId: "OFF001",
    date: "2025-06-24",
    tasks: [
      {
        id: "001",
        type: "inspection",
        types: ["inspection", "document"],
        assignedBy: "Regional Manager",
        assignedTo: "Ramakrishnan",
        taskTime: "24/06/25 09:00 AM",
        dueDate: "24/06/25 06:00 PM",
        status: "PENDING",
        priority: "HIGH",
        note: "Complete security audit of all assigned locations and submit detailed report",
        site: "Greater Kailash 2",
        title: "Security Audit",
        description: "Comprehensive security assessment and documentation",
      },
      {
        id: "002",
        type: "training",
        types: ["training", "document"],
        assignedBy: "Area Head",
        assignedTo: "Sachin Kumar",
        taskTime: "23/06/25 02:00 PM",
        dueDate: "24/06/25 02:00 PM",
        status: "OVERDUE",
        priority: "MEDIUM",
        note: "Update guard training records and certification status",
        site: "Nehru Place",
        title: "Training Records Update",
        description: "Update training documentation and certifications",
      },
      {
        id: "003",
        type: "sitevisit",
        types: ["sitevisit", "inspection"],
        assignedBy: "Supervisor",
        assignedTo: "Vikram Singh",
        taskTime: "24/06/25 08:00 AM",
        dueDate: "24/06/25 12:00 PM",
        status: "DONE",
        priority: "LOW",
        note: "Routine equipment check and maintenance log update",
        site: "GK2 Mall",
        title: "Equipment Inspection",
        description: "Regular maintenance and equipment verification",
      },
      {
        id: "004",
        type: "other",
        types: ["other", "training"],
        assignedBy: "Regional Manager",
        assignedTo: "Multiple Guards",
        taskTime: "24/06/25 10:30 AM",
        dueDate: "25/06/25 05:00 PM",
        status: "PENDING",
        priority: "HIGH",
        note: "Coordinate monthly safety drill across all sites",
        site: "All Sites",
        title: "Safety Drill Coordination",
        description: "Monthly safety training and drill coordination",
      },
      {
        id: "005",
        type: "document",
        types: ["document", "inspection"],
        assignedBy: "Area Head",
        assignedTo: "Ramakrishnan",
        taskTime: "22/06/25 04:00 PM",
        dueDate: "23/06/25 11:59 PM",
        status: "OVERDUE",
        priority: "MEDIUM",
        note: "Submit incident analysis report for last week",
        site: "Greater Kailash 2",
        title: "Incident Analysis Report",
        description: "Weekly incident analysis and reporting",
      },
    ],
  },
];

// Mock detailed incident data
const mockIncidentDetailsData: Record<string, IncidentDetails> = {
  "001": {
    id: "001",
    type: "fire",
    status: "OPEN",
    client: "Axis Bank",
    site: "GK 2",
    duration: "05 hours 23 minutes",
    closedOn: "13/01/2025",
    closedTime: "02:56PM",
    firstReported: "12/01/2025",
    firstReportedTime: "04:56PM",
    areaOfficer: {
      name: "Sachin Sharma",
      area: "South Delhi",
      phone: "+91 8436 388 569",
      photo: "https://source.unsplash.com/random/40x40?person=1",
    },
    reports: [
      {
        id: "1",
        reporterName: "Sachin Sharma",
        reporterPhoto: "https://source.unsplash.com/random/40x40?person=1",
        reportedOn: "13/01/25",
        reportedTime: "04:56 PM",
        description: "Fire alarm triggered in main building area",
      },
      {
        id: "2",
        reporterName: "Ramakrishnan Venkatraman",
        reporterPhoto: "https://source.unsplash.com/random/40x40?person=2",
        reportedOn: "12/01/25",
        reportedTime: "04:56 PM",
        description: "Smoke detected in basement storage area",
      },
      {
        id: "3",
        reporterName: "Neetu Kumari",
        reporterPhoto: "https://source.unsplash.com/random/40x40?person=3",
        reportedOn: "12/01/25",
        reportedTime: "04:56 PM",
        description: "Emergency evacuation procedures initiated",
      },
    ],
    evidences: [
      {
        id: "1",
        type: "image",
        url: "https://source.unsplash.com/160x160?fire,building",
        uploadedBy: "Sachin Sharma",
        uploadedOn: "13/01/25",
      },
      {
        id: "2",
        type: "video",
        url: "/evidence/fire_video_1.mp4",
        thumbnail: "https://source.unsplash.com/160x160?smoke,emergency",
        uploadedBy: "Ramakrishnan",
        uploadedOn: "12/01/25",
      },
      {
        id: "3",
        type: "image",
        url: "https://source.unsplash.com/160x160?fire,emergency",
        uploadedBy: "Neetu Kumari",
        uploadedOn: "12/01/25",
      },
    ],
  },
  "002": {
    id: "002",
    type: "property_damage",
    status: "CLOSED",
    client: "Haldiram's",
    site: "Nehru Place",
    duration: "02 hours 15 minutes",
    closedOn: "24/06/25",
    closedTime: "12:15PM",
    firstReported: "24/06/25",
    firstReportedTime: "10:15AM",
    areaOfficer: {
      name: "Sachin Sharma",
      area: "South Delhi",
      phone: "+91 8436 388 569",
      photo: "https://source.unsplash.com/random/40x40?person=1",
    },
    reports: [
      {
        id: "1",
        reporterName: "Sachin Kumar",
        reporterPhoto: "https://source.unsplash.com/random/40x40?person=4",
        reportedOn: "24/06/25",
        reportedTime: "10:15 AM",
        description: "Window damage reported in east wing",
      },
    ],
    evidences: [
      {
        id: "1",
        type: "image",
        url: "https://source.unsplash.com/160x160?broken,window",
        uploadedBy: "Sachin Kumar",
        uploadedOn: "24/06/25",
      },
    ],
  },
  "003": {
    id: "003",
    type: "theft",
    status: "OPEN",
    client: "Client Name",
    site: "GK2 Mall",
    duration: "12 hours 30 minutes",
    firstReported: "23/06/25",
    firstReportedTime: "08:45PM",
    areaOfficer: {
      name: "Sachin Sharma",
      area: "South Delhi",
      phone: "+91 8436 388 569",
      photo: "https://source.unsplash.com/random/40x40?person=1",
    },
    reports: [
      {
        id: "1",
        reporterName: "Vikram Singh",
        reporterPhoto: "https://source.unsplash.com/random/40x40?person=6",
        reportedOn: "23/06/25",
        reportedTime: "08:45 PM",
        description: "Suspicious activity observed near main entrance",
      },
    ],
    evidences: [
      {
        id: "1",
        type: "video",
        url: "/evidence/theft_video_1.mp4",
        thumbnail: "https://source.unsplash.com/160x160?security,camera",
        uploadedBy: "Vikram Singh",
        uploadedOn: "23/06/25",
      },
    ],
  },
};

// Mock detailed task data
const mockTaskDetailsData: Record<string, TaskDetails> = {
  "001": {
    id: "001",
    type: "inspection",
    types: ["inspection", "document"],
    title: "Security Audit",
    description: "Comprehensive security assessment and documentation of all assigned locations",
    status: "PENDING",
    priority: "HIGH",
    assignedBy: "Regional Manager",
    assignedTo: "Ramakrishnan",
    taskTime: "24/06/25 09:00 AM",
    dueDate: "24/06/25 06:00 PM",
    site: "Greater Kailash 2",
    client: "Axis Bank",
    note: "Complete security audit of all assigned locations and submit detailed report",
    attachments: [
      {
        id: "1",
        name: "Security_Checklist.pdf",
        type: "document",
        url: "/attachments/security_checklist.pdf",
        uploadedBy: "Regional Manager",
        uploadedOn: "24/06/25",
        size: "2.4 MB",
      },
    ],
    progress: [
      {
        id: "1",
        timestamp: "24/06/25 09:15 AM",
        status: "PENDING",
        updatedBy: "System",
        note: "Task assigned to Ramakrishnan",
      },
    ],
    comments: [
      {
        id: "1",
        authorName: "Regional Manager",
        authorPhoto: "https://source.unsplash.com/random/40x40?manager",
        timestamp: "24/06/25 09:00 AM",
        content: "Please prioritize main entrance and perimeter security checks",
      },
    ],
  },
  "002": {
    id: "002",
    type: "training",
    types: ["training", "document"],
    title: "Training Records Update",
    description: "Update guard training records and certification status for all personnel",
    status: "OVERDUE",
    priority: "MEDIUM",
    assignedBy: "Area Head",
    assignedTo: "Sachin Kumar",
    taskTime: "23/06/25 02:00 PM",
    dueDate: "24/06/25 02:00 PM",
    site: "Nehru Place",
    client: "Haldiram's",
    note: "Update guard training records and certification status",
    attachments: [],
    progress: [
      {
        id: "1",
        timestamp: "23/06/25 02:00 PM",
        status: "PENDING",
        updatedBy: "System",
        note: "Task assigned",
      },
      {
        id: "2",
        timestamp: "24/06/25 02:01 PM",
        status: "OVERDUE",
        updatedBy: "System",
        note: "Task became overdue",
      },
    ],
    comments: [],
  },
};

// ============================
// SERVICE CLASSES
// ============================

export class OfficerIncidentReportsService {
  static async getIncidentReportsForOfficer(officerId: string, date: Date): Promise<OfficerIncidentReport[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dateStr = date.toISOString().split("T")[0];
        const officerIncidents = mockOfficerIncidentReportsData.find(
          (oi) => oi.officerId === officerId && oi.date === dateStr
        );
        resolve(officerIncidents?.incidents || []);
      }, 500);
    });
  }

  static async getIncidentReportsForDateRange(
    officerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<OfficerIncidentReports[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredIncidents = mockOfficerIncidentReportsData.filter((oi) => {
          const incidentDate = new Date(oi.date);
          return oi.officerId === officerId && incidentDate >= startDate && incidentDate <= endDate;
        });
        resolve(filteredIncidents);
      }, 500);
    });
  }

  // Get detailed incident information
  static async getIncidentDetails(incidentId: string): Promise<IncidentDetails | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const incident = mockIncidentDetailsData[incidentId];
        resolve(incident || null);
      }, 800);
    });
  }

  // Update incident status
  static async updateIncidentStatus(incidentId: string, status: OfficerIncidentStatus): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockIncidentDetailsData[incidentId]) {
          mockIncidentDetailsData[incidentId].status = status;
          if (status === "CLOSED") {
            mockIncidentDetailsData[incidentId].closedOn = new Date().toLocaleDateString("en-GB");
            mockIncidentDetailsData[incidentId].closedTime = new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          }
          resolve(true);
        } else {
          resolve(false);
        }
      }, 600);
    });
  }

  // Upload evidence
  static async uploadEvidence(
    _incidentId: string,
    evidenceData: {
      type: "image" | "video";
      file: File;
      uploadedBy: string;
    }
  ): Promise<Evidence> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newEvidence: Evidence = {
          id: Date.now().toString(),
          type: evidenceData.type,
          url: URL.createObjectURL(evidenceData.file),
          uploadedBy: evidenceData.uploadedBy,
          uploadedOn: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }),
        };

        if (evidenceData.type === "video") {
          newEvidence.thumbnail = URL.createObjectURL(evidenceData.file);
        }

        resolve(newEvidence);
      }, 1000);
    });
  }
}

export class OfficerTasksService {
  static async getTasksForOfficer(officerId: string, date: Date): Promise<OfficerTask[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dateStr = date.toISOString().split("T")[0];
        const officerTasks = mockOfficerTasksData.find((ot) => ot.officerId === officerId && ot.date === dateStr);
        resolve(officerTasks?.tasks || []);
      }, 500);
    });
  }

  static async getTasksForDateRange(officerId: string, startDate: Date, endDate: Date): Promise<OfficerTasks[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredTasks = mockOfficerTasksData.filter((ot) => {
          const taskDate = new Date(ot.date);
          return ot.officerId === officerId && taskDate >= startDate && taskDate <= endDate;
        });
        resolve(filteredTasks);
      }, 500);
    });
  }

  // Get detailed task information
  static async getTaskDetails(taskId: string): Promise<TaskDetails | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const task = mockTaskDetailsData[taskId];
        resolve(task || null);
      }, 800);
    });
  }

  // Update task status
  static async updateTaskStatus(taskId: string, status: OfficerTaskStatus, note?: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockTaskDetailsData[taskId]) {
          mockTaskDetailsData[taskId].status = status;

          // Add progress entry
          const newProgress: TaskProgress = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleString("en-GB"),
            status: status,
            updatedBy: "Current User",
            note: note,
          };

          if (!mockTaskDetailsData[taskId].progress) {
            mockTaskDetailsData[taskId].progress = [];
          }
          mockTaskDetailsData[taskId].progress!.push(newProgress);

          resolve(true);
        } else {
          resolve(false);
        }
      }, 600);
    });
  }

  // Add task comment
  static async addTaskComment(
    taskId: string,
    comment: {
      authorName: string;
      authorPhoto?: string;
      content: string;
    }
  ): Promise<TaskComment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newComment: TaskComment = {
          id: Date.now().toString(),
          authorName: comment.authorName,
          authorPhoto: comment.authorPhoto,
          timestamp: new Date().toLocaleString("en-GB"),
          content: comment.content,
        };

        if (mockTaskDetailsData[taskId]) {
          if (!mockTaskDetailsData[taskId].comments) {
            mockTaskDetailsData[taskId].comments = [];
          }
          mockTaskDetailsData[taskId].comments!.push(newComment);
        }

        resolve(newComment);
      }, 500);
    });
  }
}

// ============================
// HELPER FUNCTIONS
// ============================

// Get incident type display name
export const getOfficerIncidentTypeDisplayName = (type: OfficerIncidentType): string => {
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

// Get incident type icon
export const getOfficerIncidentTypeIcon = (type: OfficerIncidentType) => {
  const iconProps = {
    sx: {
      width: 20,
      height: 20,
      color: "#2A77D5",
    },
  };

  switch (type) {
    case "fire":
      return React.createElement(LocalFireDepartment, iconProps);
    case "theft":
      return React.createElement(Security, iconProps);
    case "medical":
      return React.createElement(LocalHospital, iconProps);
    case "property_damage":
      return React.createElement(Construction, iconProps);
    case "fight":
      return React.createElement(Warning, iconProps);
    case "substance":
      return React.createElement(Block, iconProps);
    case "lights_on":
      return React.createElement(Lightbulb, iconProps);
    case "other":
      return React.createElement(Assignment, iconProps);
    default:
      return React.createElement(Assignment, iconProps);
  }
};

// Get incident type display with icon
export const getIncidentTypeDisplay = (type: OfficerIncidentType): { name: string; icon: string } => {
  switch (type) {
    case "fire":
      return { name: "FIRE", icon: "🔥" };
    case "theft":
      return { name: "THEFT", icon: "🔒" };
    case "medical":
      return { name: "MEDICAL", icon: "🏥" };
    case "property_damage":
      return { name: "PROPERTY DAMAGE", icon: "🔨" };
    case "fight":
      return { name: "ALTERCATION", icon: "⚠️" };
    case "substance":
      return { name: "SUBSTANCE", icon: "🚫" };
    case "lights_on":
      return { name: "LIGHTING", icon: "💡" };
    default:
      return { name: type.toUpperCase(), icon: "📋" };
  }
};

// Get task type icon with Material UI icons
export const getTaskTypeIcon = (taskType: OfficerTaskType) => {
  const iconProps = {
    sx: {
      width: 20,
      height: 20,
      color: "#2A77D5",
    },
  };

  switch (taskType) {
    case "sitevisit":
      return React.createElement(LocalHospital, iconProps); // Using available icon
    case "training":
      return React.createElement(Assignment, iconProps);
    case "document":
      return React.createElement(Assignment, iconProps);
    case "inspection":
      return React.createElement(Security, iconProps);
    case "other":
    default:
      return React.createElement(Assignment, iconProps);
  }
};

// Get task priority color
export const getTaskPriorityColor = (priority: "LOW" | "MEDIUM" | "HIGH"): string => {
  switch (priority) {
    case "HIGH":
      return "#FF6B6B";
    case "MEDIUM":
      return "#FFA726";
    case "LOW":
      return "#4CAF50";
    default:
      return "#707070";
  }
};

// Get task status color
export const getTaskStatusColor = (status: OfficerTaskStatus): string => {
  switch (status) {
    case "DONE":
      return "#4CAF50";
    case "PENDING":
      return "#2A77D5";
    case "OVERDUE":
      return "#FF6B6B";
    default:
      return "#707070";
  }
};
