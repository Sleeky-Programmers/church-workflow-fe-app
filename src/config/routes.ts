export enum Routes {
  SignUp = "/auth/signup",
  SignIn = "/auth/login",
  ForgotPassword = "/auth/forgot-password",
  ResetPassword = "/auth/reset-password",

  Dashboard = "/dashboard",
  ActivityLog = "/dashboard/activity-log",
  Departments = "/dashboard/departments",
  Teams = "/dashboard/teams",
  Notifications = "/dashboard/notification",
  Onboarding = "/onboarding",
  Profile = "/dashboard/settings",
  Search = "/dashboard/search",
  Home = "/",
  Attendance = "/dashboard/attendance",
  Membership = "/dashboard/membership",
  DepartmentDetails = "/dashboard/departments/[id]",
  DepartmentEdit = "/dashboard/departments/[id]/edit",

  Admin = "/dashboard/settings/users",
  UserManagement = "/dashboard/settings/users",
  RolesPermissions = "/dashboard/settings/roles",
  CreateRole = "/dashboard/settings/roles/create-role",
  Preferences = "/dashboard/settings/preferences",
  AccountSettings = "/dashboard/settings/account",
  UserDetails = `/dashboard/settings/users/[id]`,

  Checkout = "/checkout",
  PaymentVerify = "/payment/verify",
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
    teams: Routes.Teams,
    notifications: Routes.Notifications,
    attendance: Routes.Attendance,
    membership: Routes.Membership,
    departmentDetails: (id: string) =>
      getRouteWithParams(Routes.DepartmentDetails, { id }),
    departmentEdit: (departmentId: string) =>
      getRouteWithParams(Routes.DepartmentEdit, { id: departmentId }),
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
  checkout: Routes.Checkout,
  paymentVerify: Routes.PaymentVerify,
} as const;

export const getRouteWithParams = (
  route: Routes,
  params?: Record<string, string | number>,
): string => {
  let finalRoute: string = route;

  if (!params) {
    return finalRoute;
  }

  Object.entries(params).forEach(([key, value]) => {
    const token = `[${key}]`;

    if (!finalRoute.includes(token)) {
      return;
    }

    finalRoute = finalRoute.replaceAll(token, String(value));
  });

  if (finalRoute.match(/\[.*?\]/)) {
    throw new Error(`Missing params for route: ${route}`);
  }

  return finalRoute;
};
