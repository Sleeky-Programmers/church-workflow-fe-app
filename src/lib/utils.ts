import { clsx } from "clsx";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  isTomorrow,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  Banknote,
  Cake,
  CreditCard,
  FileText,
  LucideIcon,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

import { CalendarDay, RegularService } from "@/types";
import { UserStatus } from "@/types/user";

import { NotificationType } from "./enums";
import { USER_ACTION_ITEMS } from "./user-data";

import type { ClassValue } from "clsx";
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;

const MILLISECONDS_IN_DAY =
  MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY;

type Member = {
  id: string;
  name: string;
  gender?: "male" | "female" | "other";
};

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

export function formatDateSafely(dateString: string): string {
  if (!dateString) {
    return "";
  }
  const date = parseISO(dateString);
  if (!isValid(date)) {
    return dateString;
  }

  if (isToday(date)) {
    return "Today";
  }

  if (isTomorrow(date)) {
    return "Tomorrow";
  }

  return format(date, "EEEE, MMMM do, yyyy");
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Builds a birthday occurrence for a given year, folding 29 Feb back to
// 28 Feb in years that aren't leap years instead of letting it roll over
// Into March (JS Date's default behavior for Date(year, 1, 29)).
export function birthdayInYear(year: number, month: number, day: number) {
  const isFeb29 = month === 1 && day === 29;
  const resolvedDay = isFeb29 && !isLeapYear(year) ? 28 : day;
  const date = new Date(year, month, resolvedDay);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getNextBirthdayDate(dateStr: string) {
  const today = new Date();
  const parsed = new Date(dateStr);

  if (Number.isNaN(parsed.getTime())) {
    return new Date(today.getFullYear() + 100, 0, 1);
  }

  const month = parsed.getUTCMonth();
  const day = parsed.getUTCDate();

  const birthday = birthdayInYear(today.getFullYear(), month, day);

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  if (birthday < startOfToday) {
    return birthdayInYear(today.getFullYear() + 1, month, day);
  }

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
    .map((b) => {
      return { ...b, nextDate: getNextBirthdayDate(b.date) };
    })
    .sort((a, b) => {
      return a.nextDate.getTime() - b.nextDate.getTime();
    });
}

export const formatDateTime12h = (value: string | number | Date) => {
  return new Date(value).toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// All module values the backend can write to the activity log
// (ModuleSections enum in the API). Kept in the order they should
// Appear in the activity-log filter dropdown.
export const ACTIVITY_MODULES = [
  "MEMBERS",
  "GIVING",
  "GIVING_AND_EXPENSES",
  "REQUESTS",
  "EVENTS",
  "DEPARTMENTS",
  "ATTENDANCE",
  "CHURCH",
  "SUBSCRIPTION",
  "PAYMENTS",
  "PAYMENT",
  "ADMIN",
  "SMALL_TEAMS",
] as const;

// Human-friendly labels for activity-log module values.
const MODULE_LABELS: Record<string, string> = {
  MEMBERS: "Membership",
  GIVING: "Giving",
  GIVING_AND_EXPENSES: "Giving & Expenses",
  REQUESTS: "Requests",
  EVENTS: "Events",
  DEPARTMENTS: "Departments",
  ATTENDANCE: "Attendance",
  CHURCH: "Church",
  SUBSCRIPTION: "Subscription",
  PAYMENTS: "Payments",
  PAYMENT: "Payment",
  ADMIN: "Admin",
  SMALL_TEAMS: "Small Teams",
};

export function formatModuleLabel(module: string): string {
  return (
    MODULE_LABELS[module] ||
    module
      .toLowerCase()
      .split(/[_\s]+/)
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ")
  );
}

export function getAvailableActions(status: UserStatus) {
  return USER_ACTION_ITEMS.filter((action) => {
    return action.showFor.includes(status);
  });
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
      return "text-primary-600 hover:text-primary-700";
    case "warning":
      return "text-secondary-600 hover:text-secondary-700";
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
  if (!time) {
    return "";
  }

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

  return days.map((day) => {
    return {
      date: day,
      dateString: format(day, "yyyy-MM-dd"),
      isToday: isToday(day),
      isCurrentMonth: isSameMonth(day, date),
      services: [],
    };
  });
}

export function getServicesForDate(
  date: Date,
  services: RegularService[],
): RegularService[] {
  const dayName = format(date, "EEEE");

  return services.filter((service) => {
    return service.day ? service.day.includes(dayName) : "";
  });
}

export function mapServicesToCalendar(
  days: Date[],
  services: RegularService[],
) {
  return days.map((date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const dayName = format(date, "EEEE").toUpperCase();

    // Filter services for this specific date
    const servicesForDate = services.filter((service) => {
      if (!service.day) {
        return false;
      }

      // Handle both string and array
      if (typeof service.day === "string") {
        return service.day.toUpperCase() === dayName;
      }
      // If (Array.isArray(service.day)) {
      //   Return service.day.some(d => d.toUpperCase() === dayName);
      // }
      return false;
    });

    return {
      date,
      dateString,
      isCurrentMonth: date.getMonth() === days[15]?.getMonth(),
      isToday: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
      services: servicesForDate,
    };
  });
}
export function getAttendanceCount(
  service: RegularService,
  date: string,
): number | null {
  const record = service.attendanceRecords?.find((r) => {
    return r.date === date;
  });
  return record ? record.presentMembers.length : null;
}

export function hasAttendance(service: RegularService, date: string): boolean {
  return (
    service.attendanceRecords?.some((r) => {
      return r.date === date;
    }) || false
  );
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

export function calculateGenderSplit(members: Member[]): {
  males: number;
  females: number;
} {
  let males = 0;
  let females = 0;

  for (const member of members) {
    switch (member.gender?.toLowerCase()) {
      case "male":
        males += 1;
        break;
      case "female":
        females += 1;
        break;
    }
  }

  return { males, females };
}
type NotificationMeta = {
  icon: LucideIcon;
  color: string;
  background: string;
};

export const notificationConfig: Record<NotificationType, NotificationMeta> = {
  [NotificationType.REQUISITION]: {
    icon: FileText,
    color: "text-primary-500",
    background: "bg-primary-50",
  },
  [NotificationType.MESSAGE]: {
    icon: MessageCircle,
    color: "text-success-500",
    background: "bg-success-50",
  },
  [NotificationType.ROLE_UPDATE]: {
    icon: ShieldCheck,
    color: "text-purple-500",
    background: "bg-purple-50",
  },
  [NotificationType.BIRTHDAY]: {
    icon: Cake,
    color: "text-pink-500",
    background: "bg-pink-50",
  },
  [NotificationType.SUBSCRIPTION]: {
    icon: CreditCard,
    color: "text-secondary-500",
    background: "bg-secondary-50",
  },
  [NotificationType.MEMBER]: {
    icon: Users,
    color: "text-indigo-500",
    background: "bg-indigo-50",
  },
  [NotificationType.FINANCE]: {
    icon: Banknote,
    color: "text-emerald-500",
    background: "bg-emerald-50",
  },
};

export const toUpperCaseStatus = (status: any): string => {
  return status.toUpperCase();
};

export const toSentenceCase = (string: string): string => {
  if (!string) {
    return "current";
  }
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
