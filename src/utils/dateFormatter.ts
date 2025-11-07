// Date formatting utilities for the application

/**
 * Formats a date string or ISO date to display only the date part without timestamp
 * @param dateString - Date string in any format (ISO, etc.)
 * @returns Formatted date string (YYYY-MM-DD) or empty string if invalid
 */
export const formatDateOnly = (dateString: string | null | undefined): string => {
  if (!dateString) return "";

  try {
    // Handle ISO date strings with timestamps
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }

    // Handle other date formats by parsing and formatting
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if can't parse
    }

    // Format as YYYY-MM-DD
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.warn("Date formatting error:", error);
    return dateString; // Return original string if formatting fails
  }
};

/**
 * Formats a date string to a more readable format (DD/MM/YYYY)
 * @param dateString - Date string in any format
 * @returns Formatted date string (DD/MM/YYYY) or empty string if invalid
 */
export const formatDateReadable = (dateString: string | null | undefined): string => {
  if (!dateString) return "";

  try {
    const cleanDate = formatDateOnly(dateString);
    if (!cleanDate) return "";

    const [year, month, day] = cleanDate.split("-");
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.warn("Date readable formatting error:", error);
    return dateString;
  }
};
