// This service file will be used to fetch officer performance data
// It currently uses mock data but can be easily replaced with real API calls

import { format } from "date-fns";

// Interface for officer assignment data
export interface OfficerAssignment {
  assignedArea: string;
  guardsAssigned: number;
  sitesAssigned: number;
  shiftTime: string;
  psaraStatus: string;
  supervisor: string;
}

// Mock database of assignments for different dates and officers
const mockOfficerAssignmentDatabase = [
  {
    officerId: "OFF001",
    date: "2025-06-24", // Today
    assignedArea: "South Delhi",
    guardsAssigned: 12,
    sitesAssigned: 8,
    shiftTime: "08:00 AM - 08:00 PM",
    psaraStatus: "Completed",
    supervisor: "Regional Manager",
  },
  {
    officerId: "OFF001",
    date: "2025-06-23", // Yesterday
    assignedArea: "South Delhi",
    guardsAssigned: 11,
    sitesAssigned: 7,
    shiftTime: "08:00 AM - 08:00 PM",
    psaraStatus: "Completed",
    supervisor: "Regional Manager",
  },
  {
    officerId: "OFF002",
    date: "2025-06-24", // Today
    assignedArea: "North Delhi",
    guardsAssigned: 15,
    sitesAssigned: 10,
    shiftTime: "09:00 AM - 09:00 PM",
    psaraStatus: "Pending",
    supervisor: "Area Head",
  },
  {
    officerId: "OFF003",
    date: "2025-06-24", // Today
    assignedArea: "Gurgaon",
    guardsAssigned: 20,
    sitesAssigned: 12,
    shiftTime: "24x7 Rotation",
    psaraStatus: "Completed",
    supervisor: "Operations Head",
  },
  // Add more entries for other officer IDs and dates
];

class OfficerPerformanceDataService {
  /**
   * Get assignment details for an officer on a specific date
   * @param officerId The ID of the officer
   * @param date The date to get assignment for
   * @returns Officer assignment data or null if not found
   */
  async getOfficerAssignment(officerId: string, date: Date): Promise<OfficerAssignment | null> {
    // This would be an API call in production
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const formattedDate = format(date, "yyyy-MM-dd");

        // Find assignment for the specific date
        const assignment = mockOfficerAssignmentDatabase.find(
          (a) => a.officerId === officerId && a.date === formattedDate
        );

        if (assignment) {
          resolve({
            assignedArea: assignment.assignedArea,
            guardsAssigned: assignment.guardsAssigned,
            sitesAssigned: assignment.sitesAssigned,
            shiftTime: assignment.shiftTime,
            psaraStatus: assignment.psaraStatus,
            supervisor: assignment.supervisor,
          });
        } else {
          // For dates not in the database, return the most recent assignment before the requested date
          const sortedAssignments = [...mockOfficerAssignmentDatabase]
            .filter((a) => a.officerId === officerId && new Date(a.date) <= date)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          if (sortedAssignments.length > 0) {
            const latestAssignment = sortedAssignments[0];
            resolve({
              assignedArea: latestAssignment.assignedArea,
              guardsAssigned: latestAssignment.guardsAssigned,
              sitesAssigned: latestAssignment.sitesAssigned,
              shiftTime: latestAssignment.shiftTime,
              psaraStatus: latestAssignment.psaraStatus,
              supervisor: latestAssignment.supervisor,
            });
          } else {
            // If no assignment found before the date, look for the closest future assignment
            const futureAssignments = [...mockOfficerAssignmentDatabase]
              .filter((a) => a.officerId === officerId && new Date(a.date) > date)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (futureAssignments.length > 0) {
              const earliestFutureAssignment = futureAssignments[0];
              resolve({
                assignedArea: earliestFutureAssignment.assignedArea,
                guardsAssigned: earliestFutureAssignment.guardsAssigned,
                sitesAssigned: earliestFutureAssignment.sitesAssigned,
                shiftTime: earliestFutureAssignment.shiftTime,
                psaraStatus: earliestFutureAssignment.psaraStatus,
                supervisor: earliestFutureAssignment.supervisor,
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
   * Get performance metrics for a specific period
   * This is just a skeleton and would be expanded as needed
   */
  async getOfficerPerformanceData() {
    // This would fetch different performance metrics from the API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock response structure - this would come from the API
        resolve({
          metrics: {
            guardsSupervised: 15,
            sitesManaged: 8,
            taskCompletionRate: 92,
            incidentResolutionRate: 88,
          },
          // Add more data as needed
        });
      }, 800);
    });
  }
}

// Export a singleton instance
export const officerPerformanceDataService = new OfficerPerformanceDataService();
