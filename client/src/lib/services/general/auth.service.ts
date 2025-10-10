import { unifiedApi } from "./unified-api.service";

export const AuthService = {
  login: (identifier: string, password: string) => {
    return unifiedApi.post("/auth/login", { identifier, password }, {}, true);
  },
  me: () => {
    return unifiedApi.get("/auth/me");
  },
  refresh: () => {
    return unifiedApi.post("/auth/refresh");
  },
  logout: () => {
    return unifiedApi.post("/auth/logout");
  },
  switchBranch: (branchId: number) => {
    return unifiedApi.post(`/auth/switch-branch/${branchId}`);
  },
};
