import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Search,
  Loader2,
  X,
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
import { useLocation } from "wouter";
import { useGlobalSearch } from "@/lib/hooks/common/useGlobalSearch";
import { SchoolSearchResultCard } from "@/components/shared/SchoolSearchResultCard";
import { CollegeSearchResultCard } from "@/components/shared/CollegeSearchResultCard";
import type { SchoolFullStudentRead } from "@/lib/types/school";
import type { CollegeFullStudentRead } from "@/lib/types/college";

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
  const [, setLocation] = useLocation();
  const [notifications] = useState(0);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { query, setQuery, searchResult, isSearching, error, clearSearch } =
    useGlobalSearch();

  // Close dialog immediately if query length is not 11 characters
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length !== 11) {
      setShowResultsDialog(false);
    }
  }, [query]);

  // Show results dialog only when query is exactly 11 characters AND there's a result or error
  useEffect(() => {
    const trimmedQuery = query.trim();
    // Only show dialog when:
    // 1. Query is exactly 11 characters (complete admission number)
    // 2. AND (there's a search result OR an error occurred)
    if (
      trimmedQuery.length === 11 &&
      (searchResult?.result || (error && trimmedQuery.length === 11))
    ) {
      setShowResultsDialog(true);
    }
  }, [searchResult, error, query]);

  // Focus input on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K or Cmd+K (Mac)
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        // Prevent browser default (like opening browser search)
        e.preventDefault();
        e.stopPropagation();

        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          } else {
            // Fallback: find input by data attribute
            const found = document.querySelector(
              'input[data-testid="global-search-input"]'
            ) as HTMLInputElement;
            if (found) {
              found.focus();
              found.select();
            }
          }
        });
      }

      // Handle Escape key
      if (e.key === "Escape" && showResultsDialog) {
        e.preventDefault();
        setShowResultsDialog(false);
        clearSearch();
      }
    };

    // Use document with capture phase to catch events early
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [showResultsDialog, clearSearch]);

  // Clear search when dialog closes
  useEffect(() => {
    if (!showResultsDialog) {
      clearSearch();
    }
  }, [showResultsDialog, clearSearch]);

  const handleViewStudent = (admissionNo: string) => {
    // Removed - search results are display-only, no navigation needed
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-sm font-medium text-slate-700 mt-2">
            Searching...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Please wait while we find the student
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-red-50 p-4 mb-4">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-red-700 mb-1">
            Search Failed
          </p>
          <p className="text-xs text-red-600 text-center max-w-sm">{error}</p>
          <p className="text-xs text-slate-400 mt-3">
            Please check the admission number and try again
          </p>
        </div>
      );
    }

    if (!query || query.trim() === "") {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6 mb-4">
            <Search className="h-12 w-12 text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-2">
            No Results Yet
          </h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            Enter an admission number in the search bar to find student details,
            enrollment information, and fee balances
          </p>
        </div>
      );
    }

    if (searchResult?.result) {
      if (searchResult.branchType === "SCHOOL") {
        return (
          <SchoolSearchResultCard
            result={searchResult.result as SchoolFullStudentRead}
            onCollectFee={handleCollectFee}
          />
        );
      } else {
        return (
          <CollegeSearchResultCard
            result={searchResult.result as CollegeFullStudentRead}
            onCollectFee={handleCollectFee}
          />
        );
      }
    }

    return null;
  };

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

  const handleProfileClick = () => {
    setLocation("/profile");
  };

  const handleSettingsClick = () => {
    setLocation("/settings");
  };

  const handleCollectFee = () => {
    if (!searchResult?.result) return;

    const admissionNo =
      searchResult.branchType === "SCHOOL"
        ? (searchResult.result as SchoolFullStudentRead).admission_no
        : (searchResult.result as CollegeFullStudentRead).admission_no;

    if (!admissionNo) return;

    // Navigate to the appropriate collect fee page based on branch type
    const basePath =
      searchResult.branchType === "SCHOOL" ? "/school/fees" : "/college/fees";
    const url = `${basePath}?admission_no=${admissionNo}`;

    // Close the dialog first
    setShowResultsDialog(false);
    clearSearch();

    // Navigate to collect fee page
    setLocation(url);
  };

  return (
    <>
      {/* Backdrop overlay when search is focused */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/10 dark:bg-black/20 z-40"
            onClick={() => {
              inputRef.current?.blur();
              setIsSearchFocused(false);
            }}
          />
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 w-full bg-gradient-to-r from-white to-slate-50 border-b border-slate-200/60 shadow-sm backdrop-blur-sm"
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
            {/* Inline Search Input */}
            <div
              className={`relative w-96 transition-all duration-200 ${isSearchFocused ? "z-[100]" : ""}`}
            >
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10 transition-colors duration-200 ${isSearchFocused ? "text-blue-500" : "text-slate-400"}`}
              />
              <div className="relative">
                <Input
                  ref={inputRef}
                  placeholder="Search by admission number (Ctrl+K)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-9 pr-9 h-10 w-full border-slate-300 bg-white dark:bg-slate-900 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/30 focus:shadow-2xl focus:shadow-blue-500/25 focus:scale-[1.01] focus:bg-white dark:focus:bg-slate-900 focus:-translate-y-0.5"
                  data-testid="global-search-input"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      clearSearch();
                      inputRef.current?.blur();
                    }
                  }}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            </div>
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
                      onClick={handleProfileClick}
                      className="hover-elevate"
                      data-testid="menuitem-profile"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleSettingsClick}
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
        {/* Results Dialog - Full Screen Modal */}
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-[95vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <DialogTitle className="text-2xl font-bold">
                Search Results
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Complete student information and financial details
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden flex flex-col px-6 pt-6 pb-4">
              <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
                {renderSearchResults()}
              </div>
            </div>
            <div className="border-t px-6 py-3 bg-slate-50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">
                    Ctrl
                  </kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">
                    K
                  </kbd>
                  <span>to focus search</span>
                  <span className="mx-2">•</span>
                  <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">
                    Esc
                  </kbd>
                  <span>to close</span>
                </div>
                {currentBranch && (
                  <Badge variant="outline" className="text-xs font-medium">
                    {currentBranch.branch_type}
                  </Badge>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.header>
    </>
  );
};

export default Header;
