import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Building2,
  Shield,
  Save,
  X,
  Phone,
  Calendar,
  Briefcase,
  KeyRound,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Badge } from "@/common/components/ui/badge";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/common/components/ui/input-otp";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/common/hooks/use-toast";
import { useAuthMe } from "@/features/general/hooks/useAuthMe";
import { useUser } from "@/features/general/hooks/useUsers";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { ResetPasswordDialog } from "@/features/general/components/ResetPasswordDialog";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";
import { AuthService } from "@/features/general/services/auth.service";

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { data: me, isLoading: meLoading, error: meError } = useAuthMe();
  const { toast } = useToast();
  // removed useUpdateUser as we are using specific auth service endpoints now
  
  const [isEditing, setIsEditing] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  // OTP States
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  
  // Loading States
  const [loadingName, setLoadingName] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingMobile, setLoadingMobile] = useState(false);

  // Current values to check for changes
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentMobile, setCurrentMobile] = useState("");

  const userId = me?.user_id ?? null;
  const { data: userData } = useUser(userId ?? 0);

  useEffect(() => {
    if (me) {
      setFullName(me.full_name || "");
      setEmail(me.email || "");
      const mob = userData?.mobile_no || "";
      setMobile(mob);
      
      setCurrentEmail(me.email || "");
      setCurrentMobile(mob);
    }
  }, [me, userData]);

  const getRoleDisplay = (role: string) => {
    const upperRole = role?.toUpperCase() || "";
    switch (upperRole) {
      case "INSTITUTE_ADMIN":
        return "Institute Admin";
      case "ADMIN":
        return "Admin";
      case "ACADEMIC":
        return "Academic Staff";
      case "ACCOUNTANT":
        return "Accountant";
      default:
        return role || "Unknown";
    }
  };

  /** Unique role names from /auth/me for display */
  const displayRoles = me?.roles
    ? [...new Set(me.roles.map((r) => getRoleDisplay(r.role)))].join(", ")
    : "";

  const handleUpdateName = async () => {
    if (!fullName.trim()) return;
    setLoadingName(true);
    try {
      await AuthService.updateFullName(fullName);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast({ title: "Success", description: "Full name updated successfully", variant: "success" });
    } catch (error: any) {
        toast({ 
            title: "Error", 
            description: error.response?.data?.detail || "Failed to update name", 
            variant: "destructive" 
        });
    } finally {
      setLoadingName(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email || email === currentEmail) return;
    setLoadingEmail(true);
    try {
      await AuthService.changeEmailSendOtp(email);
      setEmailOtpSent(true);
      toast({ title: "OTP Sent", description: `OTP sent to ${email}`, variant: "success" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.detail || "Failed to send OTP", 
        variant: "destructive" 
      });
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length !== 6) return;
    setLoadingEmail(true);
    try {
      await AuthService.changeEmailVerify(emailOtp, email);
      setEmailOtpSent(false);
      setEmailOtp("");
      setCurrentEmail(email);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast({ title: "Success", description: "Email updated successfully", variant: "success" });
    } catch (error: any) {
      toast({ 
        title: "Verification Failed", 
        description: error.response?.data?.detail || "Invalid OTP", 
        variant: "destructive" 
      });
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleSendMobileOtp = async () => {
    if (!mobile) return;
    setLoadingMobile(true);
    try {
      await AuthService.changeMobileSendOtp(mobile);
      setMobileOtpSent(true);
      toast({ title: "OTP Sent", description: `OTP sent to ${mobile}`, variant: "default" });
    } catch (error: any) {
        toast({ 
            title: "Error", 
            description: error.response?.data?.detail || "Failed to send OTP", 
            variant: "destructive" 
        });
    } finally {
      setLoadingMobile(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (!mobileOtp || mobileOtp.length !== 6) return;
    setLoadingMobile(true);
    try {
      await AuthService.changeMobileVerify(mobileOtp, mobile);
      setMobileOtpSent(false);
      setMobileOtp("");
      setCurrentMobile(mobile);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["users"] }); // refetch user details for mobile
      toast({ title: "Success", description: "Mobile number updated successfully", variant: "success" });
    } catch (error: any) {
        toast({ 
            title: "Verification Failed", 
            description: error.response?.data?.detail || "Invalid OTP", 
            variant: "destructive" 
        });
    } finally {
      setLoadingMobile(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFullName(me?.full_name || "");
    setEmail(me?.email || "");
    setMobile(currentMobile);
    
    // Reset OTP states
    setEmailOtpSent(false);
    setMobileOtpSent(false);
    setEmailOtp("");
    setMobileOtp("");
    
    setIsEditing(false);
  };

  if (meLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader.Data message="Loading profile…" />
      </div>
    );
  }

  if (meError || !me) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Could not load profile</p>
          <p className="text-sm mt-1">
            {meError instanceof Error ? meError.message : "Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-5xl mx-auto px-6 py-8 lg:py-10 space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account details and security
          </p>
        </div>

        {/* Hero card: avatar + name + badges */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border-b border-border">
            <div className="px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 rounded-2xl border-4 border-background shadow-md ring-1 ring-border/50">
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-2xl font-semibold">
                    {me.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-foreground truncate">
                    {me.full_name || "User"}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {me.email || "—"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {displayRoles && (
                      <Badge variant="secondary" className="text-xs font-medium">
                        {displayRoles}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs font-medium">
                      {me.branch_name}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-medium">
                      {me.current_branch}
                    </Badge>
                    {me.is_institute_admin && (
                      <Badge className="text-xs font-medium bg-primary/90">
                        Institute Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="shrink-0 gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit profile
                </Button>
              )}
            </div>
          </div>

          {/* Details: grid or edit form */}
          <div className="p-8">
            {isEditing ? (
              <div className="max-w-xl space-y-6">
                
                {/* Full Name Edit */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <div className="flex gap-3">
                    <Input
                      id="full_name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="h-10 bg-background"
                    />
                    <Button 
                        size="sm"
                        onClick={handleUpdateName} 
                        disabled={loadingName || !fullName || fullName === me.full_name}
                        className="shrink-0"
                    >
                        {loadingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update
                    </Button>
                  </div>
                </div>

                {/* Email Edit */}
                <div className="space-y-2">
                   <div className="flex items-center justify-between">
                        <Label htmlFor="email">Email</Label>
                   </div>
                   <div className="flex gap-3 items-start">
                        <div className="grid gap-2 flex-1">
                            <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="h-10 bg-background"
                            disabled={emailOtpSent}
                            />
                            {emailOtpSent && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="email-otp" className="text-xs text-muted-foreground mb-1 block">
                                        Enter OTP sent to {email}
                                    </Label>
                                    <InputOTP
                                        maxLength={6}
                                        value={emailOtp}
                                        onChange={(val) => setEmailOtp(val)}
                                    >
                                      <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                      </InputOTPGroup>
                                    </InputOTP>
                                    <p className="text-xs text-muted-foreground mt-2 cursor-pointer hover:text-primary underline" onClick={() => setEmailOtpSent(false)}>
                                        Change email address?
                                    </p>
                                </div>
                            )}
                        </div>

                         {!emailOtpSent ? (
                            <Button 
                                size="sm"
                                onClick={handleSendEmailOtp}
                                disabled={loadingEmail || !email || email === currentEmail}
                                variant="outline"
                                className="shrink-0"
                            >
                                {loadingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        ) : (
                            <Button 
                                size="sm"
                                onClick={handleVerifyEmailOtp}
                                disabled={loadingEmail || emailOtp.length !== 6}
                                className="shrink-0"
                            >
                                {loadingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify
                            </Button>
                        )}
                   </div>
                </div>

                {/* Mobile Edit */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="mobile_no">Mobile</Label>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                        <div className="grid gap-2 flex-1">
                            <Input
                                id="mobile_no"
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="10-digit number"
                                className="h-10 bg-background"
                                disabled={mobileOtpSent}
                            />
                            {mobileOtpSent && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="mobile-otp" className="text-xs text-muted-foreground mb-1 block">
                                        Enter OTP sent to {mobile}
                                    </Label>
                                    <InputOTP
                                        maxLength={6}
                                        value={mobileOtp}
                                        onChange={(val) => setMobileOtp(val)}
                                    >
                                      <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                      </InputOTPGroup>
                                    </InputOTP>
                                     <p className="text-xs text-muted-foreground mt-2 cursor-pointer hover:text-primary underline" onClick={() => setMobileOtpSent(false)}>
                                        Change mobile number?
                                    </p>
                                </div>
                            )}
                            {!mobileOtpSent && (
                                <p className="text-xs text-muted-foreground">Without country code</p>
                            )}
                        </div>
                        
                        {!mobileOtpSent ? (
                            <Button 
                                size="sm"
                                onClick={handleSendMobileOtp}
                                disabled={loadingMobile || !mobile}
                                variant="outline"
                                className="shrink-0"
                            >
                                {loadingMobile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        ) : (
                            <Button 
                                size="sm"
                                onClick={handleVerifyMobileOtp}
                                disabled={loadingMobile || mobileOtp.length !== 6}
                                className="shrink-0"
                            >
                                {loadingMobile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full name</dt>
                    <dd className="text-sm font-medium text-foreground mt-1">{me.full_name || "—"}</dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</dt>
                    <dd className="text-sm font-medium text-foreground mt-1 truncate">{me.email || "—"}</dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mobile</dt>
                    <dd className="text-sm font-medium text-foreground mt-1">{currentMobile || "—"}</dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Roles</dt>
                    <dd className="text-sm font-medium text-foreground mt-1">{displayRoles || "—"}</dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Branch</dt>
                    <dd className="text-sm font-medium text-foreground mt-1">
                      {me.branch_name}
                      <Badge variant="outline" className="ml-2 text-xs font-normal">{me.current_branch}</Badge>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Institute</dt>
                    <dd className="text-sm font-medium text-foreground mt-1">ID {me.institute_id}</dd>
                  </div>
                </div>
                {me.academic_year_id != null && (
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Academic year</dt>
                      <dd className="text-sm font-medium text-foreground mt-1">{me.academic_year_id}</dd>
                    </div>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>

        {/* Security card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Security</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowResetPassword(true)}
              className="shrink-0 gap-2"
            >
              <KeyRound className="h-4 w-4" />
              Change password
            </Button>
          </div>
        </div>
      </div>

      <ResetPasswordDialog open={showResetPassword} onOpenChange={setShowResetPassword} />
    </div>
  );
};

export default ProfilePage;
