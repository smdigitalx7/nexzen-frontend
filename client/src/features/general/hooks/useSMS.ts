import { useQuery } from "@tanstack/react-query";
import { SMSService, type SMSTemplateCreate, type SMSTemplateUpdate, type SMSConfigCreate, type SMSConfigUpdate, type BulkSMSRequest } from "@/features/general/services/sms.service";
import { QUERY_STALE_TIME } from "@/common/constants";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { useGlobalRefetch } from "@/common/hooks/useGlobalRefetch";

// Query Keys
const SMS_KEYS = {
  all: ["sms"] as const,
  templates: () => [...SMS_KEYS.all, "templates"] as const,
  template: (id: number) => [...SMS_KEYS.templates(), id] as const,
  config: () => [...SMS_KEYS.all, "config"] as const,
  reports: () => [...SMS_KEYS.all, "reports"] as const,
  delivery: (requestId: string) => [...SMS_KEYS.reports(), "delivery", requestId] as const,
  analytics: (params: any) => [...SMS_KEYS.reports(), "analytics", params] as const,
  summary: (params: any) => [...SMS_KEYS.reports(), "summary", params] as const,
  wallet: () => [...SMS_KEYS.reports(), "wallet"] as const,
};

// Types
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

/**
 * Hook to fetch all manual SMS templates
 */
export const useSMSTemplates = () => {
  return useQuery({
    queryKey: SMS_KEYS.templates(),
    queryFn: async () => {
      return await SMSService.listTemplates();
    },
    staleTime: QUERY_STALE_TIME,
  });
};

/**
 * Hook to fetch a single SMS template by ID
 */
export const useSMSTemplate = (id: number) => {
  return useQuery({
    queryKey: SMS_KEYS.template(id),
    queryFn: async () => {
      return await SMSService.getTemplateById(id);
    },
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  });
};

/**
 * Hook to create a new SMS template
 */
export const useCreateSMSTemplate = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: async (data: SMSTemplateCreate) => {
      return await SMSService.createTemplate(data);
    },
    onSuccess: () => {
      invalidateEntity("sms");
    },
  }, "SMS template created successfully");
};

/**
 * Hook to update an SMS template
 */
export const useUpdateSMSTemplate = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: async ({ id, data }: { id: number; data: SMSTemplateUpdate }) => {
      return await SMSService.updateTemplate(id, data);
    },
    onSuccess: () => {
      invalidateEntity("sms");
    },
  }, "SMS template updated successfully");
};

/**
 * Hook to delete an SMS template
 */
export const useDeleteSMSTemplate = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: async (id: number) => {
      return await SMSService.deleteTemplate(id);
    },
    onSuccess: () => {
      invalidateEntity("sms");
    },
  }, "SMS template deleted successfully");
};

/**
 * Hook to fetch SMS configuration
 */
export const useSMSConfig = () => {
  return useQuery({
    queryKey: SMS_KEYS.config(),
    queryFn: async () => {
      return await SMSService.getConfig();
    },
    staleTime: QUERY_STALE_TIME,
  });
};

/**
 * Hook to create SMS configuration
 */
export const useCreateSMSConfig = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: async (data: SMSConfigCreate) => {
      return await SMSService.createConfig(data);
    },
    onSuccess: () => {
      invalidateEntity("sms");
    },
  }, "SMS configuration created successfully");
};

/**
 * Hook to update SMS configuration
 */
export const useUpdateSMSConfig = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: async (data: SMSConfigUpdate) => {
      return await SMSService.updateConfig(data);
    },
    onSuccess: () => {
      invalidateEntity("sms");
    },
  }, "SMS configuration updated successfully");
};

/**
 * Hook to send bulk SMS
 */
export const useSendBulkSMS = () => {
  return useMutationWithSuccessToast({
    mutationFn: async (data: BulkSMSRequest) => {
      return await SMSService.sendBulkSMS(data);
    },
  }, "Bulk SMS queued successfully");
};

/**
 * Hook to fetch SMS delivery report
 */
export const useSMSDeliveryReport = (requestId: string) => {
  return useQuery({
    queryKey: SMS_KEYS.delivery(requestId),
    queryFn: async () => {
      return await SMSService.getDeliveryReport(requestId);
    },
    enabled: !!requestId,
    staleTime: 0, // Delivery reports should be fresh
  });
};

/**
 * Hook to fetch SMS analytics
 */
export const useSMSAnalytics = (params: { from_date: string; to_date: string; sender_id?: string }) => {
  return useQuery({
    queryKey: SMS_KEYS.analytics(params),
    queryFn: async () => {
      return await SMSService.getAnalytics(params);
    },
    enabled: !!params.from_date && !!params.to_date,
    staleTime: 60 * 1000, // 1 minute stale time for analytics
  });
};

/**
 * Hook to fetch SMS summary
 */
export const useSMSSummary = (params: { from_date: string; to_date: string }) => {
  return useQuery({
    queryKey: SMS_KEYS.summary(params),
    queryFn: async () => {
      return await SMSService.getSummary(params);
    },
    enabled: !!params.from_date && !!params.to_date,
    staleTime: 60 * 1000,
  });
};

/**
 * Hook to fetch SMS wallet balance
 */
export const useSMSWallet = () => {
  return useQuery({
    queryKey: SMS_KEYS.wallet(),
    queryFn: async () => {
      return await SMSService.getWallet();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale time for wallet
  });
};
