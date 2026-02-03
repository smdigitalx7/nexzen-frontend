import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Phone, KeyRound, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Checkbox } from "@/common/components/ui/checkbox";
import { useAuthStore } from "@/core/auth/authStore";
import { useToast } from "@/common/hooks/use-toast";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { useForgotPassword, useVerifyOtp } from "@/features/general/hooks/useAuthActions";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/common/components/ui/input-otp";
import { assets, brand, brandConfig } from "@/lib/config";

const Login = () => {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<"login" | "forgot" | "otp" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Recovery States
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { login } = useAuthStore();
  const { toast } = useToast();
  const forgotMutation = useForgotPassword();
  const verifyMutation = useVerifyOtp();

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email and password
    if (!email || !email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!password || !password.trim()) {
      setError("Password is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call login from auth store
      await login(email, password);

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Show success toast (green color)
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "success",
      });

      // Small delay to ensure state is set before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirect to dashboard
      setLocation("/");
    } catch (err: unknown) {
      // Extract error message
      let errorMessage = "Login failed";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === "object") {
        const errorObj = err as Record<string, unknown>;
        if (errorObj.message && typeof errorObj.message === "string") {
          errorMessage = errorObj.message;
        }
      }

      setError(errorMessage);
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordMode = () => {
    setView("forgot");
    setError("");
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    
    try {
      await forgotMutation.mutateAsync(phone);
      setView("otp");
    } catch (err) {}
  };

  const handleVerifyOtp = async (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      setView("reset");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword || otp.length < 6) return;

    try {
      await verifyMutation.mutateAsync({
        otp_code: otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
        purpose: "forget",
      });
      // Return to login after success
      setTimeout(() => setView("login"), 2000);
    } catch (err) {}
  };

  const handlePhoneClick = () => {
    window.open(`tel:${brand.getContactPhone()}`, "_self");
  };

  const handleEmailClick = () => {
    window.open(`mailto:${brand.getContactEmail()}`, "_self");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url('${assets.background("login")}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Black opacity overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-gray-900/80 overflow-hidden">
          <CardHeader className="space-y-2 text-center pb-6">
            {/* Logos inside card */}
            {brand.shouldShowTwoLogos() ? (
              // Two logos layout (Velonex default)
              <div className="flex justify-center items-center gap-4 ">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <img
                    src={assets.logo('school')}
                    alt="School Logo"
                    className="h-28 w-auto object-contain opacity-100"
                  />
                </motion.div>

                <div className="h-8 w-px bg-gray-400/80"></div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <img
                    src={assets.logo('college')}
                    alt="College Logo"
                    className="h-28 w-auto object-contain opacity-100"
                  />
                </motion.div>
              </div>
            ) : (
              // Single logo layout (Akshara)
              <div className="flex justify-center items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <img
                    src={assets.logo('school')}
                    alt={`${brand.getName()} Logo`}
                    className="h-32 w-auto object-contain opacity-100"
                  />
                </motion.div>
              </div>
            )}

            <div className="space-y-1 mt-2">
              <div className="flex justify-center ">
                <img
                  src={assets.logo('brand')}
                  alt="Velonex"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Educational Institute ERP System
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8 relative overflow-hidden min-h-[300px]">
            <AnimatePresence mode="wait">
              {view === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={(e) => void handleSubmit(e)}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <Input
                      id="email"
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail className="h-4 w-4" />}
                      required
                      className="h-12 text-base bg-blue-500/5 border border-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-gray-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <Input
                      id="password"
                      type="password"
                      label="Password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="h-4 w-4" />}
                      showPasswordToggle={true}
                      required
                      className="h-12 text-base bg-blue-500/5 border border-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-gray-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-2 border-gray-300"
                      />
                      <Label htmlFor="remember-me" className="text-sm font-medium cursor-pointer">Remember me</Label>
                    </div>
                    <button type="button" onClick={handleForgotPasswordMode} className="text-sm text-primary hover:underline font-medium">
                      Forgot password?
                    </button>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      {error}
                    </motion.div>
                  )}

                  <Button type="submit" className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg" disabled={isLoading || !email.trim() || !password.trim()}>
                    {isLoading ? <Loader.Button size="sm" /> : "Sign In"}
                  </Button>
                </motion.form>
              ) : view === "forgot" ? (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRequestOtp}
                  className="space-y-6"
                >
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-semibold">Forgot Password</h3>
                    <p className="text-sm text-muted-foreground">Enter your mobile to receive an OTP</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      leftIcon={<Phone className="h-4 w-4" />}
                      className="h-12 bg-blue-50/50"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 gap-2" disabled={phone.length < 10 || forgotMutation.isPending}>
                    {forgotMutation.isPending ? <Loader.Button /> : <Send className="h-4 w-4" />}
                    Send OTP
                  </Button>
                  <button type="button" onClick={() => setView("login")} className="flex items-center justify-center gap-2 text-sm text-primary hover:underline w-full pt-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </button>
                </motion.form>
              ) : view === "otp" ? (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Verify OTP</h3>
                    <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your phone</p>
                  </div>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={handleVerifyOtp}>
                      <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} className="rounded-md border h-12 w-12 text-lg" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <button type="button" onClick={() => setView("forgot")} className="text-sm text-primary hover:underline">
                    Resend OTP
                  </button>
                  <button type="button" onClick={() => setView("login")} className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:underline w-full">
                    <ArrowLeft className="h-4 w-4" /> Cancel
                  </button>
                </motion.div>
              ) : view === "reset" ? (
                <motion.form
                  key="reset"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  {verifyMutation.isSuccess ? (
                    <div className="flex flex-col items-center py-8 space-y-4">
                      <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Success!</h3>
                      <p className="text-sm text-muted-foreground">Password reset successfully.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} leftIcon={<Lock className="h-4 w-4" />} className="h-11" required minLength={8} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} leftIcon={<Lock className="h-4 w-4" />} className="h-11" required />
                      </div>
                      <Button type="submit" className="w-full h-12 gap-2 mt-4" disabled={newPassword !== confirmPassword || verifyMutation.isPending}>
                        {verifyMutation.isPending ? <Loader.Button /> : <CheckCircle2 className="h-4 w-4" />}
                        Reset Password
                      </Button>
                    </>
                  )}
                </motion.form>
              ) : null}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-white/90 relative z-10"
        >
          <p className="text-xs text-white/70">
            {(() => {
              const footerTemplate = brandConfig.footerText;
              const parts = footerTemplate.split('{website}');
              const currentYear = new Date().getFullYear();
              const processedParts = parts.map((part: string, index: number) => {
                const processed = part
                  .replace(/{year}/g, currentYear.toString())
                  .replace(/{brand}/g, brand.getName());
                
                if (index < parts.length - 1) {
                  return (
                    <span key={index}>
                      {processed}
                      <a
                        href={brand.getWebsite()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white/90 transition-colors duration-200 underline"
                      >
                        {brand.getWebsiteName()}
                      </a>
                    </span>
                  );
                }
                return <span key={index}>{processed}</span>;
              });
              return processedParts;
            })()}
          </p>
        </motion.div>
      </motion.div>

      {/* Contact Info - Outside Card, Bottom Right */}
      <div className="absolute bottom-4 right-4 flex flex-col  z-20 bg-white/10 hover:bg-white/10 backdrop-blur-sm p-2 rounded-lg">
        <p className="text-xs text-gray-400 text-right mb-1 font-medium">
          Need assistance? Contact our support team
        </p>
        <div className="flex flex-row gap-1 justify-end items-center">
          <button
            onClick={handlePhoneClick}
            className="flex items-center gap-1 rounded text-xs justify-end"
          >
            <Phone className="h-3 w-3 text-gray-400" />
            <span className="font-medium text-gray-400">{brand.getContactPhoneDisplay()}</span>
          </button>
          <button
            onClick={handleEmailClick}
            className="flex items-center gap-1 rounded text-xs justify-end"
          >
            <Mail className="h-3 w-3 text-gray-400" />
            <span className="font-medium text-gray-400">
              {brand.getContactEmail()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
