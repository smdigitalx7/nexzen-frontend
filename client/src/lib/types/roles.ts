export interface RoleRead {
  role_id: number;
  role_name: string;
  description?: string | null;
}

export interface RoleUpdate {
  role_name?: string;
  description?: string | null;
}


