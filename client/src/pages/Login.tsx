import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock login data - TODO: remove mock functionality
const mockUsers = [
  {
    email: "admin@nexzen.edu",
    password: "admin123",
    user: {
      user_id: "1",
      full_name: "Sarah Johnson",
      email: "admin@nexzen.edu",
      role: "institute_admin" as const,
      institute_id: "inst_1",
      current_branch_id: "branch_1",
    },
    branches: [
      {
        branch_id: "branch_1",
        branch_name: "Nexzen School",
        branch_type: "school" as const,
        is_default: true,
      },
      {
        branch_id: "branch_2",
        branch_name: "Velocity College",
        branch_type: "college" as const,
        is_default: false,
      },
    ],
  },
  {
    email: "academic@nexzen.edu",
    password: "academic123",
    user: {
      user_id: "2",
      full_name: "Michael Chen",
      email: "academic@nexzen.edu",
      role: "academic" as const,
      institute_id: "inst_1",
      current_branch_id: "branch_1",
    },
    branches: [
      {
        branch_id: "branch_1",
        branch_name: "Nexzen School",
        branch_type: "school" as const,
        is_default: true,
      },
    ],
  },
  {
    email: "accountant@nexzen.edu",
    password: "accountant123",
    user: {
      user_id: "3",
      full_name: "Emily Rodriguez",
      email: "accountant@nexzen.edu",
      role: "accountant" as const,
      institute_id: "inst_1",
      current_branch_id: "branch_1",
    },
    branches: [
      {
        branch_id: "branch_1",
        branch_name: "Nexzen School",
        branch_type: "school" as const,
        is_default: true,
      },
      {
        branch_id: "branch_2",
        branch_name: "Velocity College",
        branch_type: "college" as const,
        is_default: false,
      },
    ],
  },
];

const Login = () => {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "institute_admin" | "academic" | "accountant" | ""
  >("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const { login, setAcademicYear } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validations for role and academic year per PRD
    if (!selectedRole) {
      setError("Please select your role");
      setIsLoading(false);
      return;
    }
    if (!selectedYear) {
      setError("Please select an academic year");
      setIsLoading(false);
      return;
    }

    // TODO: remove mock functionality - replace with real API call
    const mockUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (mockUser) {
      // Role validation to prevent spoofing
      if (mockUser.user.role !== selectedRole) {
        setTimeout(() => {
          setError("Selected role does not match user role");
          setIsLoading(false);
        }, 600);
        return;
      }
      setTimeout(() => {
        setAcademicYear(selectedYear);
        login(mockUser.user, mockUser.branches);
        // Redirect based on role per PRD
        const role = mockUser.user.role;
        const redirectPath =
          role === "institute_admin"
            ? "/"
            : role === "accountant"
            ? "/fees"
            : "/academic";
        setLocation(redirectPath);
        setIsLoading(false);
        console.log("Login successful:", mockUser.user.full_name);
      }, 1000);
    } else {
      setTimeout(() => {
        setError("Invalid email or password");
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleDemoLogin = (userType: "admin" | "academic" | "accountant") => {
    const demoUser = mockUsers.find(
      (u) => u.user.role === `institute_${userType}` || u.user.role === userType
    );
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword(demoUser.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-900/90">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex justify-center mb-4"
            >
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold">
              Welcome to Nexzen
            </CardTitle>
            <CardDescription>
              Educational Institute Management System
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selector */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as any)}
                >
                  <SelectTrigger id="role" data-testid="select-role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institute_admin">Admin</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Academic Year Selector */}
              <div className="space-y-2">
                <Label htmlFor="academicYear" className="text-sm font-medium">
                  Academic Year
                </Label>
                <Select
                  value={selectedYear}
                  onValueChange={(v) => setSelectedYear(v)}
                >
                  <SelectTrigger id="academicYear" data-testid="select-year">
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2026-2027">2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    data-testid="input-email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/4 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    data-testid="input-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Login Options */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Try Demo Accounts
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("admin")}
                  className="text-xs hover-elevate"
                  data-testid="button-demo-admin"
                >
                  Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("academic")}
                  className="text-xs hover-elevate"
                  data-testid="button-demo-academic"
                >
                  Academic
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("accountant")}
                  className="text-xs hover-elevate"
                  data-testid="button-demo-accountant"
                >
                  Accountant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          <p>© 2025 Nexzen Educational Solutions</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
