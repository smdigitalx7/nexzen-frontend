import { Api } from "@/core/api";
import type { LogoFileRead, LogoStatusResponse, LogoType, LogoUploadRequest } from "@/features/general/types/logos";

export const LogosService = {
  /**
   * Upload a logo
   * @param payload Logo upload request with file
   */
  upload(payload: LogoUploadRequest): Promise<LogoFileRead> {
    const formData = new FormData();
    formData.append("branch_id", payload.branch_id.toString());
    formData.append("logo_type", payload.logo_type);
    formData.append("file", payload.file);

    return Api.postForm<LogoFileRead>("/logos/upload", formData);
  },

  /**
   * Get logo status for a branch
   * @param branchId Branch ID
   */
  getStatus(branchId: number): Promise<LogoStatusResponse> {
    return Api.get<LogoStatusResponse>(`/logos/branch/${branchId}/status`);
  },

  /**
   * List all logos for a branch
   * @param branchId Branch ID
   */
  list(branchId: number): Promise<LogoFileRead[]> {
    return Api.get<LogoFileRead[]>(`/logos/branch/${branchId}/list`);
  },

  /**
   * Delete a logo
   * @param branchId Branch ID
   * @param logoType Logo type (LEFT or RIGHT)
   */
  delete(branchId: number, logoType: LogoType): Promise<void> {
    return Api.delete<void>(`/logos/branch/${branchId}/${logoType}`);
  },
};

