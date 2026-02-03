import { unifiedApi } from "./unified-api.service";

export interface ForgotPasswordResponse {
  message: string;
  otp_sent: boolean;
  phone_number: string;
  expires_in_minutes: number;
  retry_after_minutes: number;
}

export interface VerifyOTPResponse {
  message: string;
  verified: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  otp_sent: boolean;
  phone_number: string;
}


export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expiretime: string;
}

export const AuthService = {
  login: (identifier: string, password: string) => {
    return unifiedApi.post("/auth/login", { identifier, password }, {}, true);
  },
  me: () => {
    return unifiedApi.get("/auth/me");
  },
  refresh: async (): Promise<RefreshTokenResponse> => {
    // Refresh token should be in httpOnly cookie, so we don't send it in body
    return unifiedApi.post<RefreshTokenResponse>("/auth/refresh", {}, {}, true);
  },
  logout: () => {
    return unifiedApi.post("/auth/logout");
  },
  switchBranch: (branchId: number) => {
    return unifiedApi.post(`/auth/switch-branch/${branchId}`);
  },
  switchAcademicYear: (academicYearId: number) => {
    return unifiedApi.post(`/auth/switch-academic-year/${academicYearId}`);
  },
  forgotPassword: (phone_number: string, purpose: "forget" = "forget") => {
    return unifiedApi.post<ForgotPasswordResponse>("/auth/forgot-password", { phone_number, purpose }, {}, true);
  },
  verifyOtp: (otp_code: string, new_password: string, confirm_password: string, purpose: "forget" | "resetpassword") => {
    return unifiedApi.post<VerifyOTPResponse>("/auth/verify-otp", { 
      otp_code, 
      new_password, 
      confirm_password, 
      purpose 
    }, {}, true);
  },
  resetPassword: (existing_password: string, purpose: "resetpassword" = "resetpassword") => {
    return unifiedApi.post<ResetPasswordResponse>("/auth/reset-password", { 
      existing_password, 
      purpose 
    }); // This requires auth token, so not using public flag
  },
};
