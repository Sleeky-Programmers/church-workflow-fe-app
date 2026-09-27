import * as z from "zod";
import { format } from "date-fns";
import {
  EventRecurrence,
  EventReminderType,
  EventType,
  Gender,
  MaritalStatus,
  MembershipStatus,
} from "@/lib/enums";
import { ReminderTimeBefore } from "@/types";
import { TITLE_MAX_LENGTH } from "@/lib/titles";

export const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms and Conditions",
  }),
});

export const adminSignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const verifyCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export const editChurchSchema = z.object({
  name: z.string().min(1, "Church name is required"),
  alias: z.string().optional(),
  address: z.string().min(1, "Church address is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

export type EditChurchFormValues = z.infer<typeof editChurchSchema>;

export const editPersonalInfoSchema = z.object({
  title: z.string().max(TITLE_MAX_LENGTH).optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, {
      message:
        "Phone number must be 7-20 digits and may start with + (spaces and dashes allowed)",
    })
    .optional()
    .or(z.literal("")),
});

export type EditPersonalInfoFormValues = z.infer<typeof editPersonalInfoSchema>;

export const promoCodeSchema = z.string().trim().min(1, "Enter a coupon code");

export const billingAgreementSchema = z.object({
  agreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms and Privacy Policy",
  }),
});

export type BillingAgreementFormValues = z.infer<typeof billingAgreementSchema>;

export const inviteUserSchema = z.object({
  title: z.string().max(TITLE_MAX_LENGTH).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  role: z.string().min(1, "Role is required"),
});

export type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

export const changeRoleSchema = z.object({
  roleId: z.string().min(1, "Please select a role"),
});

export type ChangeRoleFormValues = z.infer<typeof changeRoleSchema>;

export const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

const daySchedulesSchema = z.array(
  z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  }),
);

export const createSpecialServiceSchema = z
  .object({
    title: z.string().trim().min(1, "Service name is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    recurrence: z.enum(["none", "weekly", "monthly", "yearly"]),
    eventType: z.string(),
    daySchedules: daySchedulesSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.daySchedules[0]?.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start time is required",
        path: ["daySchedules", 0, "startTime"],
      });
      return;
    }

    const invalidIndex = data.daySchedules.findIndex(
      (schedule) =>
        schedule.startTime &&
        schedule.endTime &&
        schedule.endTime <= schedule.startTime,
    );
    if (invalidIndex !== -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `End time must be after start time for ${format(
          new Date(data.daySchedules[invalidIndex].date),
          "MMM d",
        )}`,
        path: ["daySchedules", invalidIndex, "endTime"],
      });
    }
  });

export type CreateSpecialServiceFormValues = z.infer<
  typeof createSpecialServiceSchema
>;

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    type: z.nativeEnum(EventType),
    recurrence: z.nativeEnum(EventRecurrence),
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    location: z.string().optional(),
    description: z.string().optional(),
    sendReminder: z.boolean(),
    reminderType: z.nativeEnum(EventReminderType),
    remindBeforeMinutes: z.nativeEnum(ReminderTimeBefore),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const memberProfileStepSchema = z.object({
  title: z.string().max(TITLE_MAX_LENGTH).optional(),
  fullName: z.string().min(1, "Full name is required"),
  gender: z.nativeEnum(Gender, {
    message: "Gender is required",
  }),
  birthday: z.string().optional(),
  maritalStatus: z.nativeEnum(MaritalStatus, {
    message: "Marital status is required",
  }),
  dateOfMarriage: z.string().optional(),
});

export type MemberProfileStepValues = z.infer<typeof memberProfileStepSchema>;

export const memberContactStepSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
});

export type MemberContactStepValues = z.infer<typeof memberContactStepSchema>;

export const memberChurchActivityStepSchema = z.object({
  membershipStatus: z.nativeEnum(MembershipStatus, {
    message: "Membership status is required",
  }),
  dateJoined: z.string().optional(),
  previousChurchMembership: z.string().optional(),
  baptized: z.boolean().optional(),
  ministriesInvolved: z.string().optional(),
  volunteersPreference: z.string().optional(),
});

export type MemberChurchActivityStepValues = z.infer<
  typeof memberChurchActivityStepSchema
>;

export const editMemberSchema = z.object({
  title: z.string().max(TITLE_MAX_LENGTH).optional(),
  fullName: z.string().min(1, "Full name is required"),
  gender: z.nativeEnum(Gender, {
    message: "Gender is required",
  }),
  birthday: z.string().optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  membershipStatus: z.nativeEnum(MembershipStatus).optional(),
  dateJoined: z.string().optional(),
  baptized: z.boolean().optional(),
  volunteersPreference: z.string().optional(),
});

export type EditMemberFormValues = z.infer<typeof editMemberSchema>;

export const editSmallTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Team name is required")
    .max(120, "Team name must be less than 120 characters"),
  leaderId: z.string().nullable(),
  pendingLeaderEmail: z.string().nullable().optional(),
  memberIds: z.array(z.string()).min(1, "At least one member is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional(),
});

export type EditSmallTeamFormValues = z.infer<typeof editSmallTeamSchema>;

export const csvMemberRowSchema = z
  .object({
    full_name: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().optional(),
    birthday: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const fullName = data.full_name?.trim();
    const phoneNumber = data.phone_number?.trim();

    if (!fullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing required field "Full Name". Value: "${data.full_name ?? ""}"`,
        path: ["full_name"],
      });
    }

    if (!phoneNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing required field "Phone Number". Value: "${data.phone_number ?? ""}"`,
        path: ["phone_number"],
      });
    }

    if (!fullName && !phoneNumber) {
      return;
    }

    const email = data.email?.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid email format: ${data.email}`,
        path: ["email"],
      });
    }

    const birthday = data.birthday?.trim();
    if (birthday && isNaN(new Date(birthday).getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid birthday format: ${data.birthday}. Please use format like YYYY-MM-DD or MM/DD/YYYY`,
        path: ["birthday"],
      });
    }
  });

export type CsvMemberRowValues = z.infer<typeof csvMemberRowSchema>;
