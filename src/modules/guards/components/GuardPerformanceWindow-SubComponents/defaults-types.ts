// Types for defaults system

export type DefaultType = "LATE" | "UNIFORM" | "ALERTNESS" | "GEOFENCE" | "PATROL";

export interface TimeWheelData {
  showCenterButton: boolean;
  lateIn: boolean;
  outOfGeofence: boolean;
  earlyOut: boolean;
  firstAlertnessTestMissed: boolean;
  secondAlertnessTestMissed: boolean;
}

export interface UniformError {
  id: string;
  icon: string;
  name: string;
  status: "Approved" | "Pending" | "Rejected";
  evidenceUrl?: string;
}

export interface PatrolError {
  id: string;
  startTime: string;
  patrolRoute: string;
  patrolRound: string;
  checkPoint: string;
  error: string;
}

export interface DefaultData {
  type: DefaultType;
  timeWheel?: TimeWheelData;
  displayText?: string;
  uniformErrors?: UniformError[];
  patrolErrors?: PatrolError[];
}

export interface GuardDefault {
  guardId: string;
  date: string;
  defaults: DefaultData[];
}
