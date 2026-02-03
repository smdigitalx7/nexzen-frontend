import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/features/general/services/auth.service";
import { useToast } from "@/common/hooks/use-toast";

const keys = {
  forgot: ["auth", "forgot-password"] as const,
  verify: ["auth", "verify-otp"] as const,
  reset: ["auth", "reset-password"] as const,
};

/**
 * Hook to initiate forgot password process
 */
export function useForgotPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationKey: keys.forgot,
    mutationFn: (phone_number: string) => AuthService.forgotPassword(phone_number),
    onSuccess: (data) => {
      toast({
        title: "OTP Sent",
        description: data.message,
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error?.response?.data?.detail || error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to verify OTP and set new password
 */
export function useVerifyOtp() {
  const { toast } = useToast();

  return useMutation({
    mutationKey: keys.verify,
    mutationFn: (data: { otp_code: string; new_password: string; confirm_password: string; purpose: "forget" | "resetpassword" }) => 
      AuthService.verifyOtp(data.otp_code, data.new_password, data.confirm_password, data.purpose),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error?.response?.data?.detail || error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to reset password for authenticated users
 */
export function useResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationKey: keys.reset,
    mutationFn: (existing_password: string) => AuthService.resetPassword(existing_password),
    onSuccess: (data) => {
      toast({
        title: "OTP Sent",
        description: data.message,
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error?.response?.data?.detail || error.message || "Failed to initiate password reset",
        variant: "destructive",
      });
    },
  });
}
