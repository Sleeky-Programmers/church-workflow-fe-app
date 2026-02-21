import { UserStatus } from "@/types/user";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { USER_ACTION_ITEMS } from "./user-data";
import { CalendarDay, RegularService } from "@/types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";

const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;

const MILLISECONDS_IN_DAY =
  MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isInFuture(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return date >= now;
}

export function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();

  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / MILLISECONDS_IN_DAY,
  );

  if (diffDays < 0) {
    return null;
  }

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Tomorrow";
  }

  const ONE_WEEK_IN_DAYS = 7;

  if (diffDays <= ONE_WEEK_IN_DAYS) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
    });
  }

  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${monthDay} • ${weekday}`;
}

export function getNextBirthdayDate(dateStr: string) {
  const today = new Date();
  const birthday = new Date(dateStr);
  birthday.setFullYear(today.getFullYear());
  if (birthday < today) birthday.setFullYear(today.getFullYear() + 1);

  return birthday;
}

export function formatUpcomingBirthday(dateStr: string) {
  const date = getNextBirthdayDate(dateStr);
  const today = new Date();

  const diffDays = Math.ceil(
    (date.getTime() - today.getTime()) / MILLISECONDS_IN_DAY,
  );

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Tomorrow";
  }

  const ONE_WEEK_IN_DAYS = 7;

  if (diffDays <= ONE_WEEK_IN_DAYS) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
    });
  }

  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${monthDay} • ${weekday}`;
}
export function sortBirthdaysByNearest<T extends { date: string }>(
  birthdays: T[],
) {
  return birthdays
    .map((b) => ({ ...b, nextDate: getNextBirthdayDate(b.date) }))
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
}

export const formatDateTime12h = (value: string | number | Date) =>
  new Date(value).toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export function getAvailableActions(status: UserStatus) {
  return USER_ACTION_ITEMS.filter((action) => action.showFor.includes(status));
}

export function getStatusBadgeClasses(status: UserStatus): string {
  const baseClasses = "px-3 py-1 rounded-md text-xs font-medium border";
  switch (status) {
    case "active":
      return `${baseClasses} bg-success-50 text-success-700 border-success-200`;
    case "pending":
      return `${baseClasses} bg-secondary-50 text-secondary-700 border-secondary-200`;
    case "suspended":
      return `${baseClasses} bg-destructive-50 text-destructive-700 border-destructive-200`;
    default:
      return baseClasses;
  }
}

export function getActionItemClasses(
  variant?: "default" | "primary" | "warning" | "danger",
): string {
  switch (variant) {
    case "primary":
      return "text-blue-600 hover:text-blue-700";
    case "warning":
      return "text-orange-600 hover:text-orange-700";
    case "danger":
      return "text-red-600 hover:text-red-700";
    default:
      return "text-gray-900 hover:text-gray-700";
  }
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function convertTo12Hour(time: string) {
  if (!time) return "";

  const [hour, minute] = time.split(":");
  const hours = Number(hour);

  const ampm = hours >= 12 ? "PM" : "AM";
  const convertedHour = hours % 12 || 12;

  return `${convertedHour}:${minute} ${ampm}`;
}

export function generateCalendarDays(date: Date): CalendarDay[] {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));

  const days = eachDayOfInterval({ start, end });

  return days.map((day) => ({
    date: day,
    dateString: format(day, "yyyy-MM-dd"),
    isToday: isToday(day),
    isCurrentMonth: isSameMonth(day, date),
    services: [],
  }));
}

export function getServicesForDate(
  date: Date,
  services: RegularService[],
): RegularService[] {
  const dayName = format(date, "EEEE");

  return services.filter((service) => service.days.includes(dayName));
}

export function mapServicesToCalendar(
  calendarDays: CalendarDay[],
  services: RegularService[],
): CalendarDay[] {
  return calendarDays.map((day) => ({
    ...day,
    services: getServicesForDate(day.date, services),
  }));
}

export function getAttendanceCount(
  service: RegularService,
  date: string,
): number | null {
  const record = service.attendanceRecords?.find((r) => r.date === date);
  return record ? record.presentMembers.length : null;
}

export function hasAttendance(service: RegularService, date: string): boolean {
  return service.attendanceRecords?.some((r) => r.date === date) || false;
}

export function formatTimeRange(startTime: string, endTime?: string): string {
  if (endTime) {
    return `${startTime} - ${endTime}`;
  }
  return startTime;
}

export function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function calculateGenderSplit(memberIds: string[]): {
  males: number;
  females: number;
} {
  const total = memberIds.length;
  const males = Math.floor(total * 0.64);
  const females = total - males;

  return { males, females };
}
