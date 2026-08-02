import { LucideIcon } from "lucide-react";

import {
  BillingCycle,
  ChurchSubscriptionStatus,
  DiscountType,
  EventCalendarView,
  EventCategory,
  EventRecurrence,
  EventReminderType,
  EventType,
  Gender,
  MaritalStatus,
  MembershipStatus,
  MemberTitle,
  NotificationType,
  PaymentProvider,
  PlanType,
  SubscriptionStatus,
  UserRole,
  UserStatus,
} from "@/lib/enums";

export type ActivityRow = {
  _id: string;
  adminId: { firstName: string; lastName: string };
  action: string;
  module: string;
  details: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationTypes = {
  _id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  type: NotificationType;
  isRead: boolean;
  iconBg: string;
  iconColor: string;
  date: string;
};

export type ApiNotification = {
  _id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationApiResponse = {
  data: ApiNotification[];
  pagination: {
    page: number;
    limit: number;
    itemCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type ActivityLogApiResponse = {
  data: ActivityRow[];
  pagination: {
    page: number;
    limit: number;
    itemCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type DepartmentRow = {
  id: string;
  name: string;
  hod: { name: string; initials?: string } | null;
  members: number;
  status: "Active" | "Inactive";
};

export type TeamRow = {
  id: string;
  name: string;
  description?: string;
  leader: { name: string; initials?: string } | null;
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
  title: string;
  type: "REGULAR" | "SPECIAL";
  day: string;
  startTime: string;
  endTime?: string;
  location?: string;
  description?: string;
  frequency?: "weekly" | "monthly";
  attendanceRecords?: any[];
};

export type SpecialService = {
  id: string;
  title: string;
  type: "REGULAR" | "SPECIAL";
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
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

export type AttendanceStatus = "Present" | "Absent";

export type MemberAttendanceRecord = {
  id: string;
  service: string;
  date: string;
  status: AttendanceStatus;
  recordedBy: string;
  time: string;
};

export type MemberProfile = {
  id: string;
  title?: MemberTitle;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;
  birthday?: string;
  address?: string;
  maritalStatus: MaritalStatus;
  dateOfMarriage?: string;

  membershipStatus: MembershipStatus;
  dateJoined?: string;
  baptized: boolean;
  volunteersPreference: string;

  servicesAttended: number;
  servicesMissed: number;
  attendanceRate: number;

  attendanceRecords: MemberAttendanceRecord[];

  initials: string;
  avatar?: string;
};

export type AddMemberStep1Data = {
  title?: MemberTitle;
  fullName: string;
  gender: Gender;
  birthday?: string;
  maritalStatus: MaritalStatus;
  dateOfMarriage?: string;
};

export type AddMemberStep2Data = {
  email: string;
  phone: string;
  address: string;
  occupation: string;
  education: string;
};

export type AddMemberStep3Data = {
  membershipStatus?: MembershipStatus;
  dateJoined?: string;
  previousChurchMembership?: string;
  baptized: boolean;
  ministriesInvolved?: string;
  volunteersPreference: string;
  smallGroupMember?: "Yes" | "No";
  smallGroupName?: string;
};

export type NewMemberData = AddMemberStep1Data &
  AddMemberStep2Data &
  AddMemberStep3Data;

// export type ChurchEvent = {
//   id: string;
//   title: string;
//   type: EventType;
//   recurrence: EventRecurrence;
//   date: string;
//   startTime: string;
//   endTime?: string;
//   location?: string;
//   description?: string;
//   sendReminder: boolean;
//   reminderType: EventReminderType;
//   remindBeforeMinutes: number;
//   colorClass: string;
// };

// types/index.ts
export type ChurchEvent = {
  id: string;
  title: string;
  type: EventType;
  recurrence: EventRecurrence;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  description?: string;
  sendReminder: boolean;
  reminderType: EventReminderType;
  remindBeforeMinutes: number;
  colorClass: string;
  // Add specialDays support
  specialDays?: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  serviceType?: "REGULAR" | "SPECIAL";
};

export interface ChurchService {
  id: string;
  churchId: string;
  title: string;
  type: string; // "REGULAR" | "SPECIAL" etc.
  day: string; // "SUNDAY", "MONDAY", etc.
  startTime: string;
  endTime: string;
  location: string;
  specialDays: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChurchServicesResponse {
  data: ChurchService[];
  pagination: {
    page: number;
    limit: number;
    itemCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export enum ReminderTimeBefore {
  MINUTES_30 = "MINUTES_30",
  HOUR_1 = "HOUR_1",
}

export type EventFormData = Omit<
  ChurchEvent,
  "id" | "colorClass" | "remindBeforeMinutes"
> & { remindBeforeMinutes: ReminderTimeBefore };

export type EventTypeOption = {
  value: EventType;
  label: string;
  colorClass: string;
};

export type EventViewOption = {
  value: EventCalendarView;
  label: string;
};

export type SpecialServiceDaySchedule = {
  date: string;
  startTime: string;
  endTime: string;
};

export type SpecialServiceEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  recurrence?:
    | "NO_REPEAT"
    | "WEEKLY_MONDAY"
    | "MONTHLY_FIRST_MONDAY"
    | "ANNUALLY";
  eventType?:
    | "WORSHIP_SERVICE"
    | "BIRTHDAY"
    | "MEETING"
    | "WEDDING_ANNIVERSARY"
    | "OTHERS";
  daySchedules: SpecialServiceDaySchedule[];
  attendanceRecords?: AttendanceRecord[];
  type?: "SPECIAL";
};

export type UploadFile = {
  file: File;
  progress: number;
  status: "uploading" | "paused" | "success" | "error";
  error?: string;
  controller?: AbortController;
  errorDetails?: string;
};

export type FileInputProps = {
  accept?: string;
  multiple?: boolean;
  files: UploadFile[];
  onUpload: (file: File) => void;
  onRemove: (file: UploadFile) => void;
  onPauseResume: (file: UploadFile) => void;
};

export type CsvUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onClose: () => void;
};

export type Event = {
  title: string;
  date: string;
  category: EventCategory;
};

export type Plan = {
  type: PlanType;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
};

export type CurrentPlanResponse = Plan & {
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  gracePeriodEndDate?: string;
  isAutoRenew: boolean;
  memberLimit: number;
  userLimit: number;
  customRolesEnabled: boolean;
};

export type Coupon = {
  _id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discount: number;
  minPlanTier?: PlanType;
  excludedPlans?: PlanType[];
  isActive: boolean;
  status: string;
  expiryDate?: string;
  validFrom?: string;
  maxUsage?: number;
  usageCount?: number;
};

export type PlanChangePreview = {
  currentPlan: PlanType;
  targetPlan: PlanType;
  isPlanChange: boolean;
  isUpgrade: boolean | null;
  remainingDays: number;
  requiredBillingCycle: BillingCycle;
  newEndDate: string;
  amount: number;
};

export type SubscriptionOverviewResponse = {
  plans: Plan[];
  currentPlan: PlanType;
  subscriptionStatus: SubscriptionStatus;
  churchStatus: ChurchSubscriptionStatus;
  billingCycle: BillingCycle;
};

export type PaymentType = {
  plan: PlanType;
  billingCycle: BillingCycle;
  provider: PaymentProvider.PAYSTACK | PaymentProvider.FLUTTERWAVE;
  promoCode?: string;
  autoRenew?: boolean;
};

export type InitializePaymentResponse = {
  reference: string;
  authorization_url: string;
};

export interface MemberLimitStatus {
  currentMembers: number;
  limit: number;
  percentage: number;
  isOverLimit: boolean;
  isWithinGracePeriod: boolean;
  gracePeriodEnds: string | null;
  planName: string | null;
  needsAction: boolean;
  isNearLimit: boolean;
  daysRemaining: number | null;
}
