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
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Badge } from "@/common/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/common/hooks/use-toast";
import { useAuthMe } from "@/features/general/hooks/useAuthMe";
import { useUpdateUser, useUser } from "@/features/general/hooks/useUsers";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { ResetPasswordDialog } from "@/features/general/components/ResetPasswordDialog";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { data: me, isLoading: meLoading, error: meError } = useAuthMe();
  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    mobile_no: "",
  });

  const userId = me?.user_id ?? null;
  const { data: userData } = useUser(userId ?? 0);
  const [currentMobileNo, setCurrentMobileNo] = useState<string>("");

  useEffect(() => {
    if (me && !isEditing) {
      setFormData({
        full_name: me.full_name || "",
        email: me.email || "",
        mobile_no: currentMobileNo || userData?.mobile_no || "",
      });
    }
  }, [me, isEditing, currentMobileNo, userData]);

  useEffect(() => {
    if (userData?.mobile_no) {
      setCurrentMobileNo(userData.mobile_no);
    }
  }, [userData]);

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

  const handleSave = async () => {
    if (!me?.user_id) {
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
      const uid = me.user_id;
      if (Number.isNaN(uid)) throw new Error("Invalid user ID");

      const updatedUser = await updateUserMutation.mutateAsync({
        id: uid,
        payload: {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          mobile_no: formData.mobile_no.trim() || null,
        },
      });

      if (updatedUser.mobile_no) setCurrentMobileNo(updatedUser.mobile_no);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: me?.full_name || "",
      email: me?.email || "",
      mobile_no: currentMobileNo || userData?.mobile_no || "",
    });
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
              <div className="max-w-xl space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder="Your full name"
                      className="h-11 bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className="h-11 bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile_no">Mobile</Label>
                    <Input
                      id="mobile_no"
                      type="tel"
                      value={formData.mobile_no}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile_no: e.target.value })
                      }
                      placeholder="10-digit number"
                      className="h-11 bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      Without country code
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={updateUserMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateUserMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateUserMutation.isPending ? "Saving…" : "Save changes"}
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
                    <dd className="text-sm font-medium text-foreground mt-1">{currentMobileNo || userData?.mobile_no || "—"}</dd>
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
