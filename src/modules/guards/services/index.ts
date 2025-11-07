// This file exports all components from the guards module
// It makes importing components easier and more organized

// Main Components
export { default as GuardTable } from "../columns/guardtable";
export { default as GuardFilter } from "../components/GuardFilterComponent";
export { default as GuardPerformancePage } from "../components/GuardPerformancePage";
export { default as GuardContentWindow } from "../pages/GuardContentWindow";

// Context
export * from "../context/GuardContext";

// Sub Components
export { default as AssignmentWindow } from "../components/GuardPerformance-subComponents/AssignmentWindow";
export { default as HistoryWindow } from "../components/GuardPerformance-subComponents/HistoryWindow";
export { default as PerformanceWindow } from "../components/GuardPerformance-subComponents/PerformanceWindow";
export { default as ProfileWindow } from "../components/GuardPerformance-subComponents/ProfileWindow";

// Reusable Components
export { default as InfoItem } from "../reusableComponents/InfoItem";
export { default as SectionCard } from "../reusableComponents/SectionCard";
