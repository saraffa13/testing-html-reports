import { formatDateStartForBackend, formatDateEndForBackend } from "./dateFormatUtils";

export type ViewType = "day" | "week" | "month" | "custom";

export const formatDate = (date: Date) => {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  return {
    dayName: days[date.getDay()],
    day: date.getDate().toString().padStart(2, "0"),
    month: (date.getMonth() + 1).toString().padStart(2, "0"),
    year: date.getFullYear(),
    monthName: months[date.getMonth()],
  };
};

export const getWeekRange = (date: Date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startFormatted = formatDate(startOfWeek);
  const endFormatted = formatDate(endOfWeek);

  return `${startFormatted.dayName} ${startFormatted.day}/${startFormatted.month}/${startFormatted.year} - ${endFormatted.dayName} ${endFormatted.day}/${endFormatted.month}/${endFormatted.year}`;
};

export const getDateRangeForView = (
  view: ViewType,
  currentDate: Date,
  customStartDate?: Date,
  customEndDate?: Date
) => {
  const today = new Date(currentDate);

  switch (view) {
    case "day":
      const dayStart = new Date(today);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(today);
      dayEnd.setHours(23, 59, 59, 999);
      return {
        startDate: formatDateStartForBackend(dayStart),
        endDate: formatDateEndForBackend(dayEnd),
      };

    case "week":
      const weekStart = new Date(today);
      const dayOfWeek = weekStart.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekStart.setDate(weekStart.getDate() - daysToMonday);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      return {
        startDate: formatDateStartForBackend(weekStart),
        endDate: formatDateEndForBackend(weekEnd),
      };

    case "month":
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      return {
        startDate: formatDateStartForBackend(monthStart),
        endDate: formatDateEndForBackend(monthEnd),
      };

    case "custom":
      if (customStartDate && customEndDate) {
        const customStart = new Date(customStartDate);
        customStart.setHours(0, 0, 0, 0);
        const customEnd = new Date(customEndDate);
        customEnd.setHours(23, 59, 59, 999);

        return {
          startDate: formatDateStartForBackend(customStart),
          endDate: formatDateEndForBackend(customEnd),
        };
      } else {
        const customStart = new Date(today);
        customStart.setDate(customStart.getDate() - 6);
        customStart.setHours(0, 0, 0, 0);

        const customEnd = new Date(today);
        customEnd.setHours(23, 59, 59, 999);

        return {
          startDate: formatDateStartForBackend(customStart),
          endDate: formatDateEndForBackend(customEnd),
        };
      }

    default:
      const defaultStart = new Date(today);
      defaultStart.setHours(0, 0, 0, 0);
      const defaultEnd = new Date(today);
      defaultEnd.setHours(23, 59, 59, 999);

      return {
        startDate: formatDateStartForBackend(defaultStart),
        endDate: formatDateEndForBackend(defaultEnd),
      };
  }
};
