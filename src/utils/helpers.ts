export function formatDate(isoDate?: string): string {
  if (!isoDate) {
    return "-";
  }
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatDateToMonth(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", // Jan, Feb
    year: "numeric",
  });
}

export const formatLabel = (value: string) => {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => {
      return c.toUpperCase();
    });
};

/**
 * Convert 24-hour time (HH:mm) to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "09:00", "14:30")
 * @returns Time in 12-hour format with AM/PM (e.g., "9:00 AM", "2:30 PM")
 */
export function convertTo12HourFormat(time24: string): string {
  if (!time24) {
    return "";
  }

  const [hours, minutes] = time24.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Convert 12-hour time with AM/PM to 24-hour format (HH:mm)
 * @param time12 - Time in 12-hour format with AM/PM (e.g., "9:00 AM", "2:30 PM")
 * @returns Time in 24-hour format (e.g., "09:00", "14:30")
 */
export function convertTo24HourFormat(time12: string): string {
  if (!time12) {
    return "";
  }

  const match = time12.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) {
    return time12;
  }

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hours !== 12) {
    hours += 12;
  } else if (ampm === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
