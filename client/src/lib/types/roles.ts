export interface RoleRead {
  role_id: number;
  role_name: string;
  display_name: string;
  is_active: boolean;
  institute_id: number;
  created_at: string;
  updated_at?: string | null;
}

export interface RoleUpdate {
  display_name: string;
}


