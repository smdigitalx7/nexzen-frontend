// Logo Management Types

export type LogoType = "LEFT" | "RIGHT";

export interface LogoUploadRequest {
  branch_id: number;
  logo_type: LogoType;
  file: File;
}

export interface LogoFileRead {
  logo_id: number;
  branch_id: number;
  logo_type: LogoType;
  file_name: string;
  file_size: number;
  content_type: string;
  created_at: string;
  updated_at?: string | null;
}

export interface LogoStatusResponse {
  branch_id: number;
  has_left_logo: boolean;
  has_right_logo: boolean;
}

