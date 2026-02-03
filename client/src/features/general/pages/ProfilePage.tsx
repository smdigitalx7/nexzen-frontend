import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Building2,
  Shield,
  Save,
  X,
  Phone,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Separator } from "@/common/components/ui/separator";
import { useAuthStore } from "@/core/auth/authStore";
import { useToast } from "@/common/hooks/use-toast";
import { useUpdateUser, useUser } from "@/features/general/hooks/useUsers";

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const currentBranch = useAuthStore((state) => state.currentBranch);
  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    mobile_no: "",
  });

  // Fetch full user data to get mobile_no
  const userId = user?.user_id ? parseInt(user.user_id, 10) : null;
  const { data: userData } = useUser(userId ?? 0);

  // Store mobile_no in state to persist after updates
  const [currentMobileNo, setCurrentMobileNo] = useState<string>("");

  // Update form data when user data changes
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        mobile_no: currentMobileNo || userData?.mobile_no || "",
      });
    }
  }, [user, isEditing, currentMobileNo, userData]);

  // Update mobile_no when userData is fetched
  useEffect(() => {
    if (userData?.mobile_no) {
      setCurrentMobileNo(userData.mobile_no);
    }
  }, [userData]);

  const getRoleColor = (role: string) => {
    const upperRole = role?.toUpperCase() || "";
    switch (upperRole) {
      case "INSTITUTE_ADMIN":
      case "ADMIN":
        return "bg-red-500";
      case "ACADEMIC":
        return "bg-green-500";
      case "ACCOUNTANT":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

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

  const handleSave = async () => {
    if (!user?.user_id) {
      toast({
        title: "Error",
        description: "User information not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    // Validate form data
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

    // Basic email validation
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

      const updatedUser = await updateUserMutation.mutateAsync({
        id: userId,
        payload: {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          mobile_no: formData.mobile_no.trim() || null,
        },
      });

      // Update auth store with new user data
      useAuthStore.setState((state) => {
        if (state.user) {
          state.user.full_name = updatedUser.full_name;
          state.user.email = updatedUser.email;
        }
      });

      // Update mobile_no state from response
      if (updatedUser.mobile_no) {
        setCurrentMobileNo(updatedUser.mobile_no);
      }

      setIsEditing(false);
    } catch (error) {
      // Error is handled by the mutation hook's onError callback
      // The form will remain in edit mode so user can retry
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      email: user?.email || "",
      mobile_no: currentMobileNo || userData?.mobile_no || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your account information
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <User className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.full_name || "User"}</h2>
                  <p className="text-muted-foreground">{user?.email || "No email"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className={`${getRoleColor(user?.role || "")} text-white`}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleDisplay(user?.role || "")}
                    </Badge>
                  </div>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="mobile_no">Mobile Number</Label>
                  <Input
                    id="mobile_no"
                    type="tel"
                    value={formData.mobile_no}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile_no: e.target.value })
                    }
                    placeholder="Enter your mobile number"
                  />
                  <p className="text-xs text-muted-foreground">
                    Exclude country code (e.g., 9876543210)
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateUserMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateUserMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{user?.full_name || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user?.email || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mobile Number</p>
                      <p className="font-medium">
                        {currentMobileNo || userData?.mobile_no || "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium">
                        {getRoleDisplay(user?.role || "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <Building2 className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Branch
                      </p>
                      <p className="font-medium">{currentBranch?.branch_name}</p>
                      <Badge variant="outline" className="mt-1">
                        {currentBranch?.branch_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
