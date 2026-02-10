// Logo Management Types

export type LogoType = "LEFT" | "RIGHT";

export interface LogoUploadRequest {
  branch_id: number;
  logo_type: LogoType;
  file: File;
}

export interface LogoFileRead {
  logo_file_id: number;
  branch_id: number;
  logo_type: LogoType;
  logo_data: string; // Base64 string
  created_at: string;
  updated_at?: string | null;
}

export interface LogoStatusResponse {
  branch_id: number;
  has_left_logo: boolean;
  has_right_logo: boolean;
}










