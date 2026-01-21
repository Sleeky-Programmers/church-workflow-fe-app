
export enum Routes {
  SignUp = '/auth/signup',
  SignIn = '/auth/login',
  ForgotPassword = '/auth/forgot-password',
  ResetPassword = '/auth/reset-password',

  Dashboard = '/dashboard',
  ActivityLog = '/dashboard/activity-log',
  Departments = '/dashboard/departments',
  Notifications = '/dashboard/notification',

  Onboarding = '/onboarding',

  Home = '/',
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
  },
  onboarding: Routes.Onboarding,
  home: Routes.Home,
} as const;

export const getRouteWithParams = (
  route: Routes,
  params?: Record<string, string | number>
): string => {
  let finalRoute: string = route;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      finalRoute = finalRoute.replace(`[${key}]`, String(value));
    });
  }

  return finalRoute;
};
