import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";
import { useAuthStore } from "@/core/auth/authStore";
import { useUser, useUpdateUser } from "@/features/general/hooks/useUsers";
import { useToast } from "@/common/hooks/use-toast";

const ProfileSettingsTab = () => {
  const { user, currentBranch } = useAuthStore();
  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();
  
  const userId = user?.user_id ? parseInt(user.user_id, 10) : null;
  const { data: userData } = useUser(userId ?? 0);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: "",
    designation: user?.role || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone_number: userData?.mobile_no || "",
        designation: user.role || "",
      });
    }
  }, [user, userData]);

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
        return role || "Not specified";
    }
  };

  const handleSave = async () => {
    if (!user?.user_id) {
      toast({
        title: "Error",
        description: "User information not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.full_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userId = parseInt(user.user_id, 10);
      if (isNaN(userId)) {
        throw new Error("Invalid user ID");
      }

      await updateUserMutation.mutateAsync({
        id: userId,
        payload: {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          mobile_no: formData.phone_number.trim() || null,
        },
      });

      useAuthStore.setState((state) => {
        if (state.user) {
          state.user.full_name = formData.full_name.trim();
          state.user.email = formData.email.trim();
        }
      });

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Profile Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-medium">
            Full Name
          </Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            placeholder="Enter your full name"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Enter your email"
          />
        </div>

        {/* Designation */}
        <div className="space-y-2">
          <Label htmlFor="designation" className="text-sm font-medium">
            Designation
          </Label>
          <Input
            id="designation"
            value={getRoleDisplay(formData.designation)}
            disabled
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            This field is managed by your administrator
          </p>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone_number" className="text-sm font-medium">
            Phone Number
          </Label>
          <Input
            id="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={(e) =>
              setFormData({ ...formData, phone_number: e.target.value })
            }
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={handleSave}
          disabled={updateUserMutation.isPending}
        >
          {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettingsTab;

