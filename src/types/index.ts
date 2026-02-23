import { UserRole, UserStatus } from "@/lib/enums";
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

export type Permission =
  | "users.view"
  | "users.invite"
  | "users.edit"
  | "users.suspend"
  | "users.remove"
  | "roles.manage"
  | "members.view"
  | "members.edit"
  | "finance.view"
  | "finance.manage"
  | "departments.manage";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  dateInvited: string | null;
}

export type RoleType = "system" | "custom";

export type RoleStatus = "active" | "disabled";

export type PermissionLevel = "no_access" | "view" | "manage" | "full_access";

export type ModulePermission = {
  module: string;
  level: PermissionLevel;
  options: {
    label: string;
    value: PermissionLevel;
    description: string;
  }[];
};

export type Role = {
  id: string;
  name: string;
  type: RoleType;
  users: number;
  status: RoleStatus;
  description?: string;
  permissions: ModulePermission[];
};

export type CreateRoleFormData = {
  name: string;
  description?: string;
  permissions: Record<string, PermissionLevel>;
};

export type RoleAction = "view_permissions" | "edit" | "disable" | "enable";

export type PrivacySettings = {
  birthdayCalendar: boolean;
  birthdayReminders: boolean;
  emailAlerts: boolean;
};

export type AccountDeletionStatus = "none" | "scheduled" | "pending";

export type AccountSettings = {
  privacy: PrivacySettings;
  deletionStatus: AccountDeletionStatus;
  deletionDate?: string;
  waitingPeriodDays?: number;
};

export type NotificationSettings = {
  requisitionApprovals: boolean;
  events: boolean;
  birthdays: boolean;
};

export type ServiceType = "regular" | "special";

export type ServiceFrequency = "weekly" | "monthly" | "one-time";

export type Member = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
};

export type AttendanceRecord = {
  serviceId: string;
  date: string;
  presentMembers: string[];
  absentMembers: string[];
  recordedBy: string;
  location?: string;
  startTime: string;
  endTime?: string;
};

export type RegularService = {
  id: string;
  serviceName: string;
  days: string[];
  startTime: string;
  endTime?: string;
  location?: string;
  frequency: "weekly";
  attendanceRecords?: AttendanceRecord[];
};

export type SpecialService = {
  id: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  type: string;
  attendanceRecord?: AttendanceRecord;
};

export type Service = RegularService | SpecialService;

export type CalendarDay = {
  date: Date;
  dateString: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  services: RegularService[];
};
