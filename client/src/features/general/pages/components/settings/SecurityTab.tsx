import { useState } from "react";
import { Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";
import { useToast } from "@/common/hooks/use-toast";
import { useAuthStore } from "@/core/auth/authStore";
import { Api } from "@/core/api";

const SecurityTab = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword) {
      toast({
        title: "Validation Error",
        description: "Current password is required.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Password change API endpoint - will be implemented when backend supports it
      const userId = user?.user_id ? Number.parseInt(user.user_id, 10) : null;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Attempt to call password change endpoint (if it exists)
      // This will fail gracefully if the endpoint doesn't exist yet
      try {
        await Api.put(`/users/${userId}/password`, {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword,
        });

        toast({
          title: "Password Changed",
          description: "Your password has been changed successfully.",
          variant: "success",
        });

        // Clear form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (apiError: unknown) {
        // If endpoint doesn't exist (404) or not implemented (501), show helpful message
        const error = apiError as { response?: { status?: number } };
        if (
          error?.response?.status === 404 ||
          error?.response?.status === 501
        ) {
          toast({
            title: "Feature Coming Soon",
            description:
              "Password change functionality will be available soon. Please contact your administrator to reset your password.",
            variant: "info",
          });
        } else {
          throw apiError;
        }
      }
    } catch (error: unknown) {
      console.error("Failed to change password:", error);
      const err = error as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      toast({
        title: "Error",
        description:
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter your current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter your new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm your new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={() => {
                void handlePasswordChange();
              }}
              disabled={isSubmitting}
              className="mt-4 gap-2"
            >
              <KeyRound className="h-4 w-4" />
              {isSubmitting ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
