import { create } from "domain";
import { User } from "lucide-react";

export enum Routes {
  SignUp = "/auth/signup",
  SignIn = "/auth/login",
  ForgotPassword = "/auth/forgot-password",
  ResetPassword = "/auth/reset-password",

  Dashboard = "/dashboard",
  ActivityLog = "/dashboard/activity-log",
  Departments = "/dashboard/departments",
  Notifications = "/dashboard/notification",
  Onboarding = "/onboarding",
  Profile = "/dashboard/settings",
  Search = "/dashboard/search",
  Home = "/",

  Admin = "/dashboard/settings/users",
  UserManagement = "/dashboard/settings/users",
  RolesPermissions = "/dashboard/settings/roles",
  CreateRole = "/dashboard/settings/roles/create-role",
  Preferences = "/dashboard/settings/preferences",
  AccountSettings = "/dashboard/settings/account",
  UserDetails = `/dashboard/settings/users/[id]`,
}

export const RouteConfig = {
  auth: {
    signUp: Routes.SignUp,
    signIn: Routes.SignIn,
    forgotPassword: Routes.ForgotPassword,
    resetPassword: Routes.ResetPassword,
  },
  dashboard: {
    home: Routes.Dashboard,
    activityLog: Routes.ActivityLog,
    departments: Routes.Departments,
    notifications: Routes.Notifications,
    search: Routes.Search,
    admin: {
      root: Routes.Admin,
      users: Routes.UserManagement,
      roles: Routes.RolesPermissions,
      preferences: Routes.Preferences,
      account: Routes.AccountSettings,
      userDetails: (userId: string) =>
        Routes.UserDetails.replace("[id]", userId),
      createRole: Routes.CreateRole,
    },
  },
  onboarding: Routes.Onboarding,
  home: Routes.Home,
} as const;

export const getRouteWithParams = (
  route: Routes,
  params?: Record<string, string | number>,
): string => {
  let finalRoute: string = route;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      finalRoute = finalRoute.replace(`[${key}]`, String(value));
    });
  }

  return finalRoute;
};
