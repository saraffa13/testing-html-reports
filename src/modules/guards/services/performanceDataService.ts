// This service file will be used to fetch performance data
// It currently uses mock data but can be easily replaced with real API calls

import { format } from "date-fns";

// Interface for client assignment data
export interface ClientAssignment {
  clientName: string;
  site: string;
  areaOfficer: string;
  startingDate: string;
  shiftDay: string;
  shiftTime: string;
}

// Mock database of assignments for different dates and guards
const mockAssignmentDatabase = [
  {
    guardId: "24658",
    date: "2025-05-16", // Today
    clientName: "SBI",
    site: "Greater Kailash 2",
    areaOfficer: "Sachin Sharma",
    startingDate: "12/01/2024",
    shiftDay: "Mon - Sun",
    shiftTime: "08:00 AM - 06:00PM",
  },
  {
    guardId: "24658",
    date: "2025-05-15", // Yesterday
    clientName: "SBI",
    site: "Greater Kailash 2",
    areaOfficer: "Sachin Sharma",
    startingDate: "12/01/2024",
    shiftDay: "Mon - Sun",
    shiftTime: "08:00 AM - 06:00PM",
  },
  {
    guardId: "24658",
    date: "2025-05-10", // Last week
    clientName: "HDFC Bank",
    site: "Connaught Place",
    areaOfficer: "Rahul Yadav",
    startingDate: "10/01/2024",
    shiftDay: "Mon - Fri",
    shiftTime: "09:00 AM - 07:00PM",
  },
  {
    guardId: "24658",
    date: "2025-04-16", // Last month
    clientName: "Axis Bank",
    site: "Malviya Nagar",
    areaOfficer: "Vikas Kumar",
    startingDate: "09/15/2024",
    shiftDay: "Mon - Sat",
    shiftTime: "10:00 AM - 08:00PM",
  },
  // Add more entries for other guard IDs
  {
    guardId: "13563",
    date: "2025-05-16", // Today
    clientName: "Axis Bank",
    site: "Vasant Vihar",
    areaOfficer: "Rajesh Verma",
    startingDate: "11/15/2024",
    shiftDay: "Mon - Sat",
    shiftTime: "09:00 AM - 05:00PM",
  },
  {
    guardId: "14659",
    date: "2025-05-16", // Today
    clientName: "APC Technologies",
    site: "Cyber Hub",
    areaOfficer: "Sachin Sharma",
    startingDate: "01/10/2025",
    shiftDay: "Mon - Fri",
    shiftTime: "10:00 AM - 07:00PM",
  },
];

class PerformanceDataService {
  /**
   * Get client assignment for a guard on a specific date
   * @param guardId The ID of the guard
   * @param date The date to get assignment for
   * @returns Client assignment data or null if not found
   */
  async getClientAssignment(guardId: string, date: Date): Promise<ClientAssignment | null> {
    // This would be an API call in production
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const formattedDate = format(date, "yyyy-MM-dd");

        // Find assignment for the specific date
        const assignment = mockAssignmentDatabase.find((a) => a.guardId === guardId && a.date === formattedDate);

        if (assignment) {
          resolve({
            clientName: assignment.clientName,
            site: assignment.site,
            areaOfficer: assignment.areaOfficer,
            startingDate: assignment.startingDate,
            shiftDay: assignment.shiftDay,
            shiftTime: assignment.shiftTime,
          });
        } else {
          // For dates not in the database, return the most recent assignment before the requested date
          const sortedAssignments = [...mockAssignmentDatabase]
            .filter((a) => a.guardId === guardId && new Date(a.date) <= date)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          if (sortedAssignments.length > 0) {
            const latestAssignment = sortedAssignments[0];
            resolve({
              clientName: latestAssignment.clientName,
              site: latestAssignment.site,
              areaOfficer: latestAssignment.areaOfficer,
              startingDate: latestAssignment.startingDate,
              shiftDay: latestAssignment.shiftDay,
              shiftTime: latestAssignment.shiftTime,
            });
          } else {
            // If no assignment found before the date, look for the closest future assignment
            const futureAssignments = [...mockAssignmentDatabase]
              .filter((a) => a.guardId === guardId && new Date(a.date) > date)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (futureAssignments.length > 0) {
              const earliestFutureAssignment = futureAssignments[0];
              resolve({
                clientName: earliestFutureAssignment.clientName,
                site: earliestFutureAssignment.site,
                areaOfficer: earliestFutureAssignment.areaOfficer,
                startingDate: earliestFutureAssignment.startingDate,
                shiftDay: earliestFutureAssignment.shiftDay,
                shiftTime: earliestFutureAssignment.shiftTime,
              });
            } else {
              resolve(null);
            }
          }
        }
      }, 800); // Simulate network delay
    });
  }

  /**
   * Get performance data for a specific period
   * This is just a skeleton and would be expanded as needed
   */
  async getPerformanceData(
    _guardId: string,
    _startDate: Date,
    _endDate: Date,
    _type: "day" | "week" | "month" | "custom"
  ) {
    // This would fetch different performance metrics from the API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock response structure - this would come from the API
        resolve({
          metrics: {
            attendanceRate: 95,
            punctualityScore: 4.2,
            taskCompletionRate: 87,
          },
          // Add more data as needed
        });
      }, 800);
    });
  }
}

// Export a singleton instance
export const performanceDataService = new PerformanceDataService();
