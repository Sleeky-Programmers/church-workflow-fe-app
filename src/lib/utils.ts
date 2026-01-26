import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  const diff = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff < 0) return null;

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${monthDate} • ${day}`;
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
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7)
    return date.toLocaleDateString("en-US", { weekday: "long" });

  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${monthDay} • ${day}`;
}

export function sortBirthdaysByNearest<T extends { date: string }>(
  birthdays: T[],
) {
  return birthdays
    .map((b) => ({ ...b, nextDate: getNextBirthdayDate(b.date) }))
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
}
