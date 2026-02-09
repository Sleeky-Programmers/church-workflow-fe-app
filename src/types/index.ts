import { LucideIcon } from "lucide-react";

export type ActivityRow = {
  id: string;
  timestamp: string;
  user: { name: string; initials?: string };
  action: string;
  module: string;
  details: string;
};

export type NotificationTypes = {
  icon: LucideIcon;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  iconBg: string;
  iconColor: string;
};

export type DepartmentRow = {
  id: string;
  name: string;
  hod: { name: string; initials?: string } | null;
  members: number;
  status: "Active" | "Inactive";
};
