import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/common/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { useResetPassword, useVerifyOtp } from "@/features/general/hooks/useAuthActions";
import { HelpTooltip } from "@/common/components/shared/HelpTooltip";

type Step = "current_password" | "otp" | "reset" | "success";

interface ResetPasswordDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ open, onOpenChange }: ResetPasswordDialogProps) {
  const [step, setStep] = useState<Step>("current_password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetPasswordMutation = useResetPassword();
  const verifyMutation = useVerifyOtp();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) return;
    try {
      await resetPasswordMutation.mutateAsync(currentPassword);
      setStep("otp");
    } catch {
      // Toast handled in hook
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) setStep("reset");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword || otp.length < 6 || newPassword.length < 8) return;
    try {
      await verifyMutation.mutateAsync({
        otp_code: otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
        purpose: "resetpassword",
      });
      setStep("success");
      setTimeout(() => {
        onOpenChange(false);
        setStep("current_password");
        setCurrentPassword("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1500);
    } catch {
      // Toast handled in hook
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep("current_password");
      setCurrentPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Enter your current password to receive an OTP on your registered mobile, then set a new password.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "current_password" && (
            <motion.form
              key="current_password"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              onSubmit={handleRequestOtp}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="reset-current-password" className="inline-flex items-center">
                  Current password
                  <HelpTooltip content="Enter your existing account password to request a one-time verification code (OTP)." />
                </Label>
                <Input
                  id="reset-current-password"
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  className="h-11"
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={!currentPassword.trim() || resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <Loader.Button />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Verify & Send OTP
              </Button>
            </motion.form>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to your registered mobile number.
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="rounded-md border h-12 w-12 text-lg"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setStep("current_password")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </motion.div>
          )}

          {step === "reset" && (
            <motion.form
              key="reset"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleResetSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="reset-new-password" className="inline-flex items-center">
                  New password
                  <HelpTooltip content="Set a new password with at least 8 characters, including letters and numbers for better security." />
                </Label>
                <Input
                  id="reset-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  className="h-11"
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-confirm-password">Confirm password</Label>
                <Input
                  id="reset-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  className="h-11"
                  required
                  placeholder="Repeat new password"
                />
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={
                  newPassword !== confirmPassword ||
                  newPassword.length < 8 ||
                  verifyMutation.isPending
                }
              >
                {verifyMutation.isPending ? (
                  <Loader.Button />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Reset password
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setStep("otp")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </motion.form>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 space-y-3"
            >
              <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">Password updated</h3>
              <p className="text-sm text-muted-foreground text-center">
                Your password has been reset successfully.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
