export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: number;
}

export interface VerifyOtpResponse {
  message: string;
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: any;
}

export interface GoogleAuthPayload {
  idToken: string;
}

export interface GoogleAuthResponse {
  message: string;
  accessToken: string;
  user?: any;
}

export interface ResetPasswordPayload {
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface CreateChurchPayload {
  name: string;
  alias?: string;
  address: string;
  country: string;
  state: string;
  defaultCurrency: string;
  timeZone: string;
}

export interface CreateWeeklyServicePayload {
  serviceName: string;
  type: "REGULAR" | "SPECIAL";
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}
