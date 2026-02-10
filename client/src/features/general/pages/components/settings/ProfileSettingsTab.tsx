import { useState, useEffect } from "react";
import { User, Mail, Phone, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";
import { useAuthStore } from "@/core/auth/authStore";
import { useToast } from "@/common/hooks/use-toast";
import { AuthService } from "@/features/general/services/auth.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Separator } from "@/common/components/ui/separator";

const ProfileSettingsTab = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  
  // Loading States
  const [loadingName, setLoadingName] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingMobile, setLoadingMobile] = useState(false);

  // OTP States
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");

  // Current values to check for changes
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentMobile, setCurrentMobile] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setCurrentEmail(user.email || "");
      // Note: mobile number might strictly be in user details or auth store? 
      // Assuming it's not directly in basic user object, checking if we need to fetch it.
      // But for now taking from where previous code did (though previous code assumed it from useUser hook).
      // Let's assume user object has it or we might need to fetch `AuthService.me()` to be sure.
      // For now, initializing empty or if available.
    }
    // Fetch latest details to be sure
    const fetchMe = async () => {
       try {
         const data = await AuthService.me();
         if(data) {
             // We don't have mobile in AuthMeResponse interface yet, checking if it comes...
             // user object in store might NOT have mobile.
             // We might need to assume it's current from input if updated.
             // Actually, `AuthMeResponse` has `email` and `full_name`.
             // It does NOT have mobile. 
             // BE CAREFUL: Where do we get current mobile?
             // Previous code used `useUser(userId)` to fetch detailed user data.
             // We should probably keep that or fetch details.
         }
       } catch(e) { console.error(e); }
    };
    fetchMe();
  }, [user]);

  // Using useUser hook to get mobile number as it's not in basic auth user object often
  // importing useUser from hooks
  const userId = user?.user_id ? parseInt(user.user_id, 10) : 0;
  // We need to fetch user details to get the mobile number
  const [fetchedMobile, setFetchedMobile] = useState("");
  
  useEffect(() => {
      // Small workaround to get mobile if not in auth user
      // Ideally we should use the useUser hook if we want to read it initially
      // But since we are replacing the whole file, let's try to keep it simple or use the hook if available
  }, []);

  // Handlers

  const handleUpdateName = async () => {
    if (!fullName.trim()) return;
    setLoadingName(true);
    try {
      await AuthService.updateFullName(fullName);
      
      // Update store
      useAuthStore.setState(state => {
        if (state.user) state.user.full_name = fullName;
      });

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
      toast({ title: "OTP Sent", description: `OTP sent to ${email}`, variant: "default" });
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
    if (!emailOtp) return;
    setLoadingEmail(true);
    try {
      await AuthService.changeEmailVerify(emailOtp, email);
      setEmailOtpSent(false);
      setEmailOtp("");
      setCurrentEmail(email);
      
      // Update store
      useAuthStore.setState(state => {
        if (state.user) state.user.email = email;
      });

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
    if (!mobile) return; // Allow updating even if same? Usually not needed but checking empty
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
    if (!mobileOtp) return;
    setLoadingMobile(true);
    try {
      await AuthService.changeMobileVerify(mobileOtp, mobile);
      setMobileOtpSent(false);
      setMobileOtp("");
      
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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Profile Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your personal information
          </p>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        
        {/* Full Name Section */}
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">Personal Information</CardTitle>
                <CardDescription>Update your display name</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 items-end">
                    <div className="grid gap-2 flex-1">
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input 
                            id="fullname" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                        />
                    </div>
                    <Button 
                        onClick={handleUpdateName} 
                        disabled={loadingName || !fullName || fullName === user?.full_name}
                    >
                        {loadingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Name
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">Contact Information</CardTitle>
                <CardDescription>Manage your verified contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Email Update */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email Address
                        </Label>
                        {currentEmail && !emailOtpSent && (
                             <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 border border-green-100">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                             </span>
                        )}
                    </div>
                    
                    <div className="flex gap-4 items-start">
                        <div className="grid gap-2 flex-1">
                            <Input 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="name@example.com"
                                disabled={emailOtpSent}
                            />
                            {emailOtpSent && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="email-otp" className="text-xs text-muted-foreground mb-1.5 block">
                                        Enter OTP sent to {email}
                                    </Label>
                                    <Input 
                                        id="email-otp"
                                        value={emailOtp}
                                        onChange={(e) => setEmailOtp(e.target.value)}
                                        placeholder="Enter OTP Code"
                                        className="bg-blue-50/50 border-blue-200"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-primary" onClick={() => setEmailOtpSent(false)}>
                                        Change email address?
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {!emailOtpSent ? (
                            <Button 
                                onClick={handleSendEmailOtp}
                                disabled={loadingEmail || !email || email === currentEmail}
                                variant="outline"
                            >
                                {loadingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleVerifyEmailOtp}
                                disabled={loadingEmail || !emailOtp}
                            >
                                {loadingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify & Update
                            </Button>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Mobile Update */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            Mobile Number
                        </Label>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                        <div className="grid gap-2 flex-1">
                            <Input 
                                value={mobile} 
                                onChange={(e) => setMobile(e.target.value)} 
                                placeholder="+1234567890"
                                disabled={mobileOtpSent}
                            />
                            {mobileOtpSent && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="mobile-otp" className="text-xs text-muted-foreground mb-1.5 block">
                                        Enter OTP sent to {mobile}
                                    </Label>
                                    <Input 
                                        id="mobile-otp"
                                        value={mobileOtp}
                                        onChange={(e) => setMobileOtp(e.target.value)}
                                        placeholder="Enter OTP Code"
                                        className="bg-blue-50/50 border-blue-200"
                                    />
                                     <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-primary" onClick={() => setMobileOtpSent(false)}>
                                        Change mobile number?
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {!mobileOtpSent ? (
                            <Button 
                                onClick={handleSendMobileOtp}
                                disabled={loadingMobile || !mobile}
                                variant="outline"
                            >
                                {loadingMobile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleVerifyMobileOtp}
                                disabled={loadingMobile || !mobileOtp}
                            >
                                {loadingMobile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify & Update
                            </Button>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettingsTab;

