import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Users,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import BranchSwitcher from "./BranchSwitcher";
import AcademicYearSwitcher from "./AcademicYearSwitcher";

const Header = () => {
  const {
    user,
    currentBranch,
    branches,
    switchBranch,
    logoutAsync,
    academicYear,
    academicYears,
    switchAcademicYear,
    isBranchSwitching,
  } = useAuthStore();
  const queryClient = useQueryClient();
  const [notifications] = useState(0);
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenSearch(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === "Escape") setOpenSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "institute_admin":
        return "bg-red-500";
      case "academic":
        return "bg-green-500";
      case "accountant":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "institute_admin":
        return "Admin";
      case "academic":
        return "Academic";
      case "accountant":
        return "Accountant";
      default:
        return role;
    }
  };

  const handleLogout = async () => {
    try {
      // Use the centralized logout method from auth store
      await logoutAsync();

      // Clear React Query cache after logout
      queryClient.clear();

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full bg-gradient-to-r from-white to-slate-50 border-b border-slate-200/60 shadow-sm backdrop-blur-sm"
    >
      <div className="container flex h-20 items-center justify-between px-6">
        {/* Left: System Title */}
        <div className="flex items-center justify-start gap-6">
          <BranchSwitcher />
          <AcademicYearSwitcher />
        </div>

        {/* Center: Welcome Message */}
        {/* <div className="flex-1 flex justify-center">
          <div className="text-center hidden md:block">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-slate-700 mb-1">
                {getGreeting()},{" "}
                <span className="text-blue-600">
                  {user?.full_name ||
                    user?.email?.split("@")[0] ||
                    (user ? "User" : "Guest")}
                </span>
                !
              </h2>
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-slate-500">
                  {currentBranch?.branch_name || "Nexzen"} Management System
                </p>
                {currentBranch?.branch_type && (
                  <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
                    {currentBranch.branch_type}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div> */}

        {/* Right: Search, Year Badge, Notifications and User Menu */}
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="outline"
            className="gap-2 h-12 w-64"
            onClick={() => {
              setOpenSearch(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            title="Global Search (Ctrl/Cmd+K)"
          >
            <Search className="h-5 w-5" />
            <span className="hidden md:inline">Search (Ctrl/Cmd+K)</span>
          </Button>
          {/* {academicYear && (
            <Badge
              variant="secondary"
              className="text-xs"
              data-testid="badge-academic-year"
            >
              AY {academicYear}
            </Badge>
          )} */}
          {/* Notifications */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="hover-elevate relative hover:bg-slate-100/80 transition-all duration-200 rounded-xl"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-medium">
                  {notifications}
                </span>
              </div>
            )}
          </Button> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hover-elevate relative p-1 rounded-xl hover:bg-slate-100/60 transition-all duration-200"
                data-testid="dropdown-user-menu"
              >
                <div className="flex items-center gap-3">
                  {/* <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                      <AvatarImage src={user?.avatar} alt={user?.full_name} />
                      <AvatarFallback className="text-white font-semibold bg-gradient-to-br from-indigo-400 to-indigo-600">
                        {user?.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar> */}
                  <User className="h-5 w-5 text-slate-400" />
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-slate-700">
                      {user?.full_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {getRoleDisplay(user?.role || "")}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              <DropdownMenuContent
                className="w-56"
                align="end"
                forceMount
                asChild
              >
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.full_name} />
                      <AvatarFallback
                        className={`text-white ${getRoleColor(
                          user?.role || ""
                        )}`}
                      >
                        {user?.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {getRoleDisplay(user?.role || "")}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="hover-elevate"
                    data-testid="menuitem-profile"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover-elevate"
                    data-testid="menuitem-settings"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="hover-elevate text-red-600 focus:text-red-600"
                    data-testid="menuitem-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            </AnimatePresence>
          </DropdownMenu>
        </div>
      </div>
      <Dialog open={openSearch} onOpenChange={setOpenSearch}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Global Search</DialogTitle>
            <DialogDescription>
              Search functionality will be implemented soon
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={inputRef}
                placeholder="Search functionality coming soon..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                disabled
              />
            </div>
            <div className="text-center py-8">
              <Search className="h-12 w-24 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                Search functionality will be implemented soon
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Tip: Press Ctrl/Cmd + K to open search • Esc to close
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.header>
  );
};

export default Header;
