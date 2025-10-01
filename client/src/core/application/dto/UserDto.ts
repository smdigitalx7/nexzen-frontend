import { UserRole } from '../../domain/entities/User';

export interface CreateUserRequest {
  fullName: string;
  email: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserResponse {
  user_id: number;
  full_name: string;
  email: string;
  mobile_no?: string | null;
  is_institute_admin: boolean;
  is_active: boolean;
  institute_id: number;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface UserListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface UserStatisticsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<UserRole, number>;
}
