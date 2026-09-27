export type UserStatus = "active" | "pending" | "suspended";

export type UserRole = "admin" | "finance" | "pastor" | string;

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId?: string;
  status: UserStatus;
  dateInvited: string;
  avatar?: string;
  /** True when this row belongs to the signed-in admin (self-action lockout). */
  isCurrentUser?: boolean;
};

export type PendingInvite = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "pending";
};

export type UserAction =
  | "view_details"
  | "change_role"
  | "resend_invite"
  | "delete_invitation"
  | "suspend"
  | "restore"
  | "remove"
  | "manage_branch_access";

/** Actions that are safe for admins to perform on their own account. */
const SELF_ALLOWED_ACTIONS: UserAction[] = ["view_details"];

export function canPerformAction(action: UserAction, isCurrentUser: boolean) {
  if (!isCurrentUser) return true;
  return SELF_ALLOWED_ACTIONS.includes(action);
}

export type ActionItem = {
  label: string;
  value: UserAction;
  variant?: "default" | "primary" | "warning" | "danger";
  showFor: UserStatus[];
};

export type PermissionLevel = "no_access" | "view" | "manage" | "full_access";

export type ModulePermission = {
  module: string;
  level: PermissionLevel;
  description: string;
};

export type RolePermissions = {
  role: string;
  description: string;
  permissions: ModulePermission[];
};

export type InviteFormData = {
  title?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
};
