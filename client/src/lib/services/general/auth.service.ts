import { unifiedApi } from "./unified-api.service";

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
};
