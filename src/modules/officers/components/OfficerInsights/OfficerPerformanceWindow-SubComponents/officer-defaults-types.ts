// Types for officer defaults system - only Late and Uniform
export type OfficerDefaultType = "LATE" | "UNIFORM";

export interface OfficerTimeWheelData {
  showCenterButton: boolean;
  lateIn: boolean;
}

export interface OfficerUniformError {
  id: string;
  icon: string;
  name: string;
  status: "Approved" | "Pending" | "Rejected";
  evidenceUrl?: string;
}

export interface OfficerDefaultData {
  type: OfficerDefaultType;
  timeWheel?: OfficerTimeWheelData;
  displayText?: string;
  uniformErrors?: OfficerUniformError[];
}

export interface OfficerDefault {
  officerId: string;
  date: string;
  defaults: OfficerDefaultData[];
}

// Mock data for officer defaults - only Late and Uniform
export const mockOfficerDefaultsData: OfficerDefault[] = [
  {
    officerId: "OFF001",
    date: "2025-06-24", // Today
    defaults: [
      {
        type: "LATE",
        timeWheel: {
          showCenterButton: false,
          lateIn: true,
        },
        displayText: "08:15 AM - 15 MIN. LATE",
      },
      {
        type: "UNIFORM",
        uniformErrors: [
          {
            id: "1",
            icon: "identity_card",
            name: "ID Card Missing",
            status: "Pending",
          },
        ],
      },
    ],
  },
  {
    officerId: "OFF001",
    date: "2025-06-23", // Yesterday
    defaults: [
      {
        type: "LATE",
        timeWheel: {
          showCenterButton: false,
          lateIn: true,
        },
        displayText: "08:10 AM - 10 MIN. LATE",
      },
    ],
  },
  {
    officerId: "OFF002",
    date: "2025-06-24", // Today
    defaults: [
      {
        type: "UNIFORM",
        uniformErrors: [
          {
            id: "2",
            icon: "hat",
            name: "Hat Missing",
            status: "Approved",
          },
          {
            id: "3",
            icon: "badge",
            name: "Badge Not Visible",
            status: "Pending",
          },
        ],
      },
    ],
  },
  // Add more mock data for different dates and officers
];

// Service to get officer defaults data
export class OfficerDefaultsService {
  static async getDefaultsForOfficer(officerId: string, date: Date): Promise<OfficerDefaultData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dateStr = date.toISOString().split("T")[0];
        const officerDefaults = mockOfficerDefaultsData.find((od) => od.officerId === officerId && od.date === dateStr);
        resolve(officerDefaults?.defaults || []);
      }, 500);
    });
  }

  static async getDefaultsForDateRange(officerId: string, startDate: Date, endDate: Date): Promise<OfficerDefault[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredDefaults = mockOfficerDefaultsData.filter((od) => {
          const defaultDate = new Date(od.date);
          return od.officerId === officerId && defaultDate >= startDate && defaultDate <= endDate;
        });
        resolve(filteredDefaults);
      }, 500);
    });
  }
}
