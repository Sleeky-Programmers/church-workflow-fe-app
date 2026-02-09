import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
