export interface ClientAssignment {
  clientName: string;
  site: string;
  areaOfficer: string;
  startingDate: string;
  shiftDay: string;
  shiftTime: string;
}

// Performance metrics interface
export interface PerformanceMetrics {
  attendanceRate: number;
  punctualityScore: number;
  taskCompletionRate: number;
  // More metrics can be added as needed
}

// Date range interface for querying data by period
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Service interfaces
export interface IPerformanceDataService {
  getClientAssignment(guardId: string, date: Date): Promise<ClientAssignment | null>;
  getPerformanceData(
    guardId: string,
    dateRange: DateRange,
    type: "day" | "week" | "month" | "custom"
  ): Promise<PerformanceMetrics>;
}

// Future services can be added here
export interface IIncidentReportService {
  getIncidentReports(guardId: string, dateRange: DateRange): Promise<any[]>;
}

export interface ITaskService {
  getTasks(guardId: string, dateRange: DateRange): Promise<any[]>;
}
