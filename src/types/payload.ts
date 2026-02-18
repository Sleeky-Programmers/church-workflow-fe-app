export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
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
