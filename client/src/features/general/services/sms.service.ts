import { Api } from "@/core/api";

/**
 * SMSService - Handles all SMS-related API operations
 */

export type SMSCategory = "AUTO" | "MANUAL";
export type SMSRoute = "q" | "dlt" | "dlt_manual" | "otp";
export type SMSAudienceCategory = "CLASS" | "TRANSPORT";

export interface SMSTemplate {
  template_id: number;
  institute_id: number;
  template_key: string;
  template_name: string;
  dlt_template_id: string;
  message?: number;
  content: string;
  variable_names: string[];
  category: SMSCategory;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SMSTemplateCreate {
  template_key: string;
  template_name: string;
  dlt_template_id: string;
  message?: number;
  content: string;
  variable_names?: string[];
  category?: SMSCategory;
  is_active?: boolean;
}

export interface SMSTemplateUpdate {
  template_name?: string;
  dlt_template_id?: string;
  message?: number;
  content?: string;
  variable_names?: string[];
  category?: SMSCategory;
  is_active?: boolean;
}

export interface SMSConfig {
  sms_config_id: number;
  institute_id: number;
  sms_api_key: string | null;
  sms_route: SMSRoute;
  sms_flash: boolean;
  dlt_entity_id?: string;
  sender_id: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SMSConfigCreate {
  sms_api_key?: string;
  sms_route: SMSRoute;
  sms_flash?: boolean;
  dlt_entity_id?: string;
  sender_id?: string;
  is_active?: boolean;
}

export interface SMSConfigUpdate {
  sms_api_key?: string;
  sms_route?: SMSRoute;
  sms_flash?: boolean;
  dlt_entity_id?: string;
  sender_id?: string;
  is_active?: boolean;
}

export interface BulkSMSRequest {
  audience_category: SMSAudienceCategory;
  audience_ids?: number[];
  template_key: string;
  template_variables?: Record<string, string>;
  title: string;
  content: string;
}

export interface BulkSMSResponse {
  success: boolean;
  message: string;
  recipient_count: number;
}

export interface SMSDeliveryStatus {
  sender_id: string;
  number: string;
  status: string;
  updated_at: string;
  mobile: string;
  status_description: string;
  sent_time: string;
  sent_timestamp: string;
}

export interface SMSDeliveryReport {
  request_id: string;
  route: string;
  delivery_status: SMSDeliveryStatus[];
}

export interface SMSAnalyticsItem {
  sender_id: string;
  mobile: string;
  status: string;
  status_description: string;
  dlr_attempt: string;
  sms_language: string;
  character_count: string;
  sms_count: string;
  amount_debited: string;
  sent_timestamp: string;
  sent_time: string;
}

export interface SMSAnalyticsReport {
  request_id: string;
  route: string;
  delivery_status: SMSAnalyticsItem[];
}

export interface SMSSummaryReport {
  sent: number;
  delivered: number;
  pending: number;
  failed: number;
  blocked: number;
  error: number;
}

export interface SMSWalletBalance {
  return: boolean;
  wallet: string;
  sms_count: number;
}

export const SMSService = {
  // SMS Templates API
  listTemplates(): Promise<SMSTemplate[]> {
    return Api.get<SMSTemplate[]>("/sms-templates");
  },

  getTemplateById(id: number): Promise<SMSTemplate> {
    return Api.get<SMSTemplate>(`/sms-templates/${id}`);
  },

  createTemplate(data: SMSTemplateCreate): Promise<SMSTemplate> {
    return Api.post<SMSTemplate>("/sms-templates", data);
  },

  updateTemplate(id: number, data: SMSTemplateUpdate): Promise<SMSTemplate> {
    return Api.put<SMSTemplate>(`/sms-templates/${id}`, data);
  },

  deleteTemplate(id: number): Promise<{ message: string }> {
    return Api.delete<{ message: string }>(`/sms-templates/${id}`);
  },

  // SMS Configuration API
  getConfig(): Promise<SMSConfig> {
    return Api.get<SMSConfig>("/sms-config");
  },

  createConfig(data: SMSConfigCreate): Promise<SMSConfig> {
    return Api.post<SMSConfig>("/sms-config", data);
  },

  updateConfig(data: SMSConfigUpdate): Promise<SMSConfig> {
    return Api.put<SMSConfig>("/sms-config", data);
  },

  // Announcements API
  sendBulkSMS(data: BulkSMSRequest): Promise<BulkSMSResponse> {
    return Api.post<BulkSMSResponse>("/announcements/send-bulk", data);
  },

  // SMS Reports API
  getDeliveryReport(requestId: string): Promise<{ success: boolean; message: string; data: SMSDeliveryReport[] }> {
    return Api.get<{ success: boolean; message: string; data: SMSDeliveryReport[] }>(`/sms-reports/delivery/${requestId}`);
  },

  getAnalytics(params: { from_date: string; to_date: string; sender_id?: string }): Promise<{ success: boolean; message: string; data: SMSAnalyticsReport[] }> {
    return Api.get<{ success: boolean; message: string; data: SMSAnalyticsReport[] }>("/sms-reports/analytics", params as any);
  },

  getSummary(params: { from_date: string; to_date: string }): Promise<{ success: boolean; message: string; data: SMSSummaryReport }> {
    return Api.get<{ success: boolean; message: string; data: SMSSummaryReport }>("/sms-reports/summary", params as any);
  },

  getWallet(): Promise<SMSWalletBalance> {
    return Api.get<SMSWalletBalance>("/sms-reports/wallet");
  },
};
