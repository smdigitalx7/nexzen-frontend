import { Api } from "@/lib/api";

export const AuthService = {
  login: (identifier: string, password: string) => {
    return Api.post("/auth/login", { identifier, password });
  },
  me: () => {
    return Api.get("/auth/me");
  },
  refresh: () => {
    return Api.post("/auth/refresh");
  },
  logout: () => {
    return Api.post("/auth/logout");
  },
  switchBranch: (branchId: number) => {
    return Api.post(`/auth/switch-branch/${branchId}`);
  },
};
