/**
 * Utility functions for converting dates to/from backend format
 * Backend expects: 2025-09-15T02:30:00.000Z+05:30
 */

/**
 * Converts a Date object to backend format string
 * @param date - Date object to convert
 * @returns String in format: 2025-09-15T02:30:00.000Z+05:30
 */
export const formatDateForBackend = (date: Date): string => {
  // Get IST offset (+05:30)
  const istOffset = '+05:30';

  // Convert to ISO string format with IST timezone
  const isoString = date.toISOString();

  // Replace Z with +05:30 to indicate IST timezone
  return isoString.replace('Z', istOffset);
};

/**
 * Converts a Date object to backend format string with time set to start of day (00:00:00)
 * @param date - Date object to convert
 * @returns String in format: 2025-09-15T00:00:00.000Z+05:30
 */
export const formatDateStartForBackend = (date: Date): string => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return formatDateForBackend(startOfDay);
};

/**
 * Converts a Date object to backend format string with time set to end of day (23:59:59)
 * @param date - Date object to convert
 * @returns String in format: 2025-09-15T23:59:59.999Z+05:30
 */
export const formatDateEndForBackend = (date: Date): string => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return formatDateForBackend(endOfDay);
};

/**
 * Converts backend date string to Date object
 * @param backendDateString - Date string from backend in format: 2025-09-15T02:30:00.000Z+05:30
 * @returns Date object
 */
export const parseBackendDate = (backendDateString: string): Date => {
  // Remove the +05:30 timezone suffix and add Z for proper parsing
  const normalizedString = backendDateString.replace(/\+05:30$/, 'Z');
  return new Date(normalizedString);
};

/**
 * Checks if a date string is in the new backend format
 * @param dateString - Date string to check
 * @returns boolean indicating if it matches the backend format
 */
export const isBackendFormat = (dateString: string): boolean => {
  const backendFormatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\+\d{2}:\d{2}$/;
  return backendFormatRegex.test(dateString);
};