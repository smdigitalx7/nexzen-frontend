import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, Send, CheckCircle2 } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";
import { useToast } from "@/common/hooks/use-toast";
import { useResetPassword, useVerifyOtp } from "@/features/general/hooks/useAuthActions";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/common/components/ui/input-otp";
import { motion, AnimatePresence } from "framer-motion";
import { HelpTooltip } from "@/common/components/shared/HelpTooltip";

const SecurityTab = () => {
  const { toast } = useToast();
  const resetPasswordMutation = useResetPassword();
  const verifyMutation = useVerifyOtp();

  const [step, setStep] = useState<1 | 2>(1);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otpCode: "",
  });

  const handleRequestOtp = async () => {
    if (!passwordData.currentPassword.trim()) {
      toast({ title: "Validation", description: "Enter your current password.", variant: "destructive" });
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(passwordData.currentPassword);
      setStep(2);
    } catch (err) {}
  };

  const handleFinalReset = async () => {
    if (passwordData.newPassword.length < 8) {
      toast({ title: "Validation Error", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Validation Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }

    try {
      await verifyMutation.mutateAsync({
        otp_code: passwordData.otpCode,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
        purpose: "resetpassword",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "", otpCode: "" });
      setStep(1);
    } catch (err) {}
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Security</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Password, authentication, and security settings
          </p>
        </div>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Password Change Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              Change Password
            </h3>
            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-6 space-y-4"
                >
                  <p className="text-sm text-muted-foreground">
                    Enter your current password to receive an OTP on your registered mobile number.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="reset-current-password" className="inline-flex items-center">
                      Current password
                      <HelpTooltip content="Enter your existing account password to request a one-time verification code (OTP)." />
                    </Label>
                    <div className="relative">
                      <Input
                        id="reset-current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter your current password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        leftIcon={<Lock className="h-4 w-4" />}
                        className="h-11 pr-10"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleRequestOtp}
                    disabled={resetPasswordMutation.isPending || !passwordData.currentPassword.trim()}
                    className="gap-2"
                  >
                    {resetPasswordMutation.isPending ? <Loader.Button /> : <Send className="h-4 w-4" />}
                    Verify & Send OTP
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 space-y-5"
                >
                  <div className="bg-primary/5 p-3 rounded-lg flex items-start gap-3 border border-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-primary">OTP Verification Sent</p>
                      <p className="text-[11px] text-muted-foreground">Please check your mobile for the 6-digit verification code.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 md:col-span-2 flex flex-col items-center">
                      <Label htmlFor="otpCode" className="w-full inline-flex items-center">
                        Verification Code (OTP)
                        <HelpTooltip content="Enter the 6-digit code sent to your registered mobile number." />
                      </Label>
                      <InputOTP
                        maxLength={6}
                        value={passwordData.otpCode}
                        onChange={(value) => setPasswordData({ ...passwordData, otpCode: value })}
                        containerClassName="justify-center"
                      >
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={0} className="rounded-md border h-12 w-12 text-lg" />
                          <InputOTPSlot index={1} className="rounded-md border h-12 w-12 text-lg" />
                          <InputOTPSlot index={2} className="rounded-md border h-12 w-12 text-lg" />
                          <InputOTPSlot index={3} className="rounded-md border h-12 w-12 text-lg" />
                          <InputOTPSlot index={4} className="rounded-md border h-12 w-12 text-lg" />
                          <InputOTPSlot index={5} className="rounded-md border h-12 w-12 text-lg" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="inline-flex items-center">
                        New Password
                        <HelpTooltip content="Set a new password with at least 8 characters, including letters and numbers for better security." />
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Min 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      onClick={handleFinalReset} 
                      disabled={verifyMutation.isPending || passwordData.otpCode.length < 6}
                      className="flex-1 gap-2"
                    >
                      {verifyMutation.isPending ? <Loader.Button /> : <CheckCircle2 className="h-4 w-4" />}
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => setStep(1)} disabled={verifyMutation.isPending}>
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
