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

/** POST /auth/reset-password - verify current password, send OTP to registered mobile */
export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}


export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expiretime: string;
}

/** GET /api/v1/auth/me - Current user info (credentials + Bearer required) */
export interface AuthMeResponse {
  user_id: number;
  institute_id: number;
  current_branch_id: number;
  branch_name: string;
  current_branch: string;
  is_institute_admin: boolean;
  roles: Array<{ role: string; branch_id: number }>;
  academic_year_id: number | null;
  full_name: string;
  email: string;
}

/** POST /auth/switch-branch/{branch_id} - Context only; no new access token. Backend sets X-Branch-ID, X-Academic-Year-ID, X-Branch-Type cookies. */
export interface SwitchBranchResponse {
  branch_id: number;
  branch_type: string;
  academic_year_id: number;
}

/** POST /auth/switch-academic-year/{academic_year_id} - Context only; no new access token. Backend updates X-Academic-Year-ID cookie. */
export interface SwitchAcademicYearResponse {
  branch_id: number;
  branch_type: string;
  academic_year_id: number;
}

/** All auth endpoints (login, refresh, logout, switch-branch, switch-academic-year, me) require credentials (Api uses credentials: "include"; apiClient uses withCredentials: true). */
export const AuthService = {
  login: (identifier: string, password: string) => {
    return unifiedApi.post("/auth/login", { identifier, password }, {}, true);
  },
  me: () => {
    return unifiedApi.get<AuthMeResponse>("/auth/me");
  },
  refresh: async (): Promise<RefreshTokenResponse> => {
    // Refresh token should be in httpOnly cookie, so we don't send it in body
    return unifiedApi.post<RefreshTokenResponse>("/auth/refresh", {}, {}, true);
  },
  logout: () => {
    return unifiedApi.post("/auth/logout");
  },
  switchBranch: (branchId: number) => {
    return unifiedApi.post<SwitchBranchResponse>(`/auth/switch-branch/${branchId}`);
  },
  switchAcademicYear: (academicYearId: number) => {
    return unifiedApi.post<SwitchAcademicYearResponse>(`/auth/switch-academic-year/${academicYearId}`);
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
