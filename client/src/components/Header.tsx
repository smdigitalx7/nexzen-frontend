import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Bell,
  GraduationCap,
  School,
  Users,
  Search,
  Calendar,
  Loader2,
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
import { useNavigationStore } from "@/store/navigationStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Api, AuthTokenTimers } from "@/lib/api";
import { AuthService } from "@/lib/services/auth.service";

const Header = () => {
  const { user, currentBranch, branches, switchBranch, logoutAsync, academicYear, academicYears, switchAcademicYear, isBranchSwitching } =
    useAuthStore();
  const { isMobile } = useNavigationStore();
  const queryClient = useQueryClient();
  const [notifications] = useState(3); // Mock notification count
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock global results with complete details
  const students = useMemo(
    () =>
      [
        {
          id: "NZN24250001",
          name: "Aarav Sharma",
          class: "Class V",
          fatherName: "Rajesh Sharma",
          mobile: "9876543210",
          admissionDate: "2024-01-15",
          totalFee: 24000,
          paidAmount: 15000,
          balance: 9000,
          transport: "Yes - City Center",
          status: "Active",
        },
        {
          id: "NZN24250002",
          name: "Divya Mehta",
          class: "Class IX",
          fatherName: "Suresh Mehta",
          mobile: "9876543212",
          admissionDate: "2024-01-16",
          totalFee: 20000,
          paidAmount: 20000,
          balance: 0,
          transport: "No",
          status: "Active",
        },
      ].filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.id.toLowerCase().includes(query.toLowerCase()) ||
          s.fatherName.toLowerCase().includes(query.toLowerCase()) ||
          s.mobile.includes(query)
      ),
    [query]
  );
  const employees = useMemo(
    () =>
      [
        {
          id: "EMP001",
          name: "Dr. Rajesh Kumar",
          role: "Principal",
          department: "Administration",
          joinDate: "2020-01-15",
          salary: 75000,
          mobile: "9876543210",
          email: "rajesh@school.com",
          status: "Active",
        },
        {
          id: "EMP002",
          name: "Ms. Sunita Singh",
          role: "Mathematics Teacher",
          department: "Academic",
          joinDate: "2021-06-01",
          salary: 45000,
          mobile: "9876543211",
          email: "sunita@school.com",
          status: "Active",
        },
      ].filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.id.toLowerCase().includes(query.toLowerCase()) ||
          e.role.toLowerCase().includes(query.toLowerCase()) ||
          e.mobile.includes(query)
      ),
    [query]
  );
  const transactions = useMemo(
    () =>
      [
        {
          id: "TXN001",
          type: "Fee Payment",
          amount: "₹15,000",
          student: "Aarav Sharma",
          date: "2024-01-15",
          mode: "Cash",
          status: "Completed",
        },
        {
          id: "TXN002",
          type: "Salary Payment",
          amount: "₹25,000",
          employee: "Dr. Rajesh Kumar",
          date: "2024-01-31",
          mode: "Bank Transfer",
          status: "Completed",
        },
      ].filter(
        (t) =>
          t.type.toLowerCase().includes(query.toLowerCase()) ||
          t.id.toLowerCase().includes(query.toLowerCase()) ||
          (t.student &&
            t.student.toLowerCase().includes(query.toLowerCase())) ||
          (t.employee && t.employee.toLowerCase().includes(query.toLowerCase()))
      ),
    [query]
  );

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

  // Fetch academic years on component mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const years = await Api.get<Array<{
          id: number;
          year_name: string;
          start_date: string;
          end_date: string;
          active: boolean;
          branch_type: "school" | "college";
        }>>("/academic-years/");
        
        const { setAcademicYears } = useAuthStore.getState();
        setAcademicYears(years);
        
        // Set default academic year if none is selected
        const { academicYear } = useAuthStore.getState();
        if (!academicYear && years.length > 0) {
          const activeYear = years.find(year => year.active) || years[0];
          const { setAcademicYear } = useAuthStore.getState();
          setAcademicYear(activeYear.year_name);
        }
      } catch (error) {
        console.error("Failed to fetch academic years:", error);
      }
    };

    if (user && academicYears.length === 0) {
      fetchAcademicYears();
    }
  }, [user, academicYears.length]);

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

  const handleBranchSwitch = async (branch: any) => {
    try {
      console.log("Starting branch switch to:", branch.branch_name);
      await switchBranch(branch);
      
      // Invalidate all queries to refetch data with new branch context
      queryClient.invalidateQueries();
      
      console.log("Branch switched successfully, data will be refreshed");
    } catch (error) {
      console.error("Failed to switch branch:", error);
    }
  };

  const handleAcademicYearSwitch = (year: any) => {
    switchAcademicYear(year);
    console.log("Academic year switched to:", year.year_name);
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
      <div className="container flex h-20 items-center px-6">
        {/* Left: System Title */}
        <div className="flex items-center justify-start gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isBranchSwitching}
                className="hover-elevate min-w-[240px] justify-between bg-white/80 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm rounded-xl px-4 py-2.5"
                data-testid="dropdown-branch-switcher"
                aria-label="Select schema and branch"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      currentBranch?.branch_type === "SCHOOL"
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                        : "bg-gradient-to-br from-purple-400 to-purple-600"
                    }`}
                  >
                    {currentBranch?.branch_type === "SCHOOL" ? (
                      <School className="h-4 w-4 text-white" />
                    ) : (
                      <GraduationCap className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span
                      className="truncate max-w-[140px] font-semibold text-base text-slate-700"
                      title={currentBranch?.branch_name}
                    >
                      {isBranchSwitching ? "Switching..." : (currentBranch?.branch_name || "Select Branch")}
                    </span>
                    {/* <span className="text-xs text-slate-500 capitalize">
                      {currentBranch?.branch_type || "Institution"}
                    </span> */}
                  </div>
                </div>
                {isBranchSwitching ? (
                  <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              <DropdownMenuContent align="center" className="w-[250px]" asChild>
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {branches.map((branch) => (
                    <DropdownMenuItem
                      key={branch.branch_id}
                      onClick={() => handleBranchSwitch(branch)}
                      className="hover-elevate"
                      data-testid={`menuitem-branch-${branch.branch_id}`}
                    >
                      <div className="flex items-center gap-2">
                        {branch.branch_type === "SCHOOL" ? (
                          <School className="h-4 w-4" />
                        ) : (
                          <GraduationCap className="h-4 w-4" />
                        )}
                        <span className="truncate" title={branch.branch_name}>
                          {branch.branch_name}
                        </span>
                        {branch.branch_type && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            {branch.branch_type}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </motion.div>
              </DropdownMenuContent>
            </AnimatePresence>
          </DropdownMenu>

          {/* Academic Year Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hover-elevate min-w-[200px] justify-between bg-white/80 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm rounded-xl px-4 py-2.5"
                data-testid="dropdown-academic-year-switcher"
                aria-label="Select academic year"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span
                      className="truncate max-w-[120px] font-semibold text-base text-slate-700"
                      title={academicYear || "Select Academic Year"}
                    >
                      {academicYear || "Select Academic Year"}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              <DropdownMenuContent align="center" className="w-[220px]" asChild>
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {academicYears
                    .filter(year => year.branch_type === currentBranch?.branch_type?.toLowerCase())
                    .map((year) => (
                    <DropdownMenuItem
                      key={year.id}
                      onClick={() => handleAcademicYearSwitch(year)}
                      className="hover-elevate"
                      data-testid={`menuitem-academic-year-${year.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="truncate" title={year.year_name}>
                          {year.year_name}
                        </span>
                        {year.active && (
                          <Badge
                            variant="default"
                            className="ml-auto text-xs"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </motion.div>
              </DropdownMenuContent>
            </AnimatePresence>
          </DropdownMenu>
        </div>

        {/* Center: Branch Switcher */}
        <div className="flex-1 flex justify-center"></div>

        {/* Right: Search, Year Badge, Notifications and User Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setOpenSearch(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            title="Global Search (Ctrl/Cmd+K)"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search</span>
          </Button>
          {academicYear && (
            <Badge
              variant="secondary"
              className="text-xs"
              data-testid="badge-academic-year"
            >
              AY {academicYear}
            </Badge>
          )}
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  className="hover-elevate relative p-1 rounded-xl hover:bg-slate-100/60 transition-all duration-200"
                  data-testid="dropdown-user-menu"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                      <AvatarImage src={user?.avatar} alt={user?.full_name} />
                      <AvatarFallback className="text-white font-semibold bg-gradient-to-br from-indigo-400 to-indigo-600">
                        {user?.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
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
              </motion.div>
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
        <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Global Search</DialogTitle>
            <DialogDescription>
              Search across students, employees, and transactions with complete
              details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={inputRef}
                placeholder="Search by name, ID, mobile, or any detail..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs defaultValue="students">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="students">
                  Students ({students.length})
                </TabsTrigger>
                <TabsTrigger value="employees">
                  Employees ({employees.length})
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  Transactions ({transactions.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="students">
                <div className="max-h-96 overflow-auto space-y-3">
                  {students.map((s) => (
                    <div
                      key={s.id}
                      className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-blue-600 mt-1" />
                          <div className="space-y-2">
                            <div>
                              <div className="font-semibold text-lg">
                                {s.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {s.id} • {s.class} • Father: {s.fatherName}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Mobile:</span>{" "}
                                {s.mobile}
                              </div>
                              <div>
                                <span className="font-medium">Admission:</span>{" "}
                                {s.admissionDate}
                              </div>
                              <div>
                                <span className="font-medium">Transport:</span>{" "}
                                {s.transport}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>
                                <Badge
                                  variant={
                                    s.status === "Active"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="ml-1"
                                >
                                  {s.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-4 pt-2">
                              <div className="text-sm">
                                <span className="font-medium text-green-600">
                                  Paid: ₹{s.paidAmount.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-red-600">
                                  Balance: ₹{s.balance.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">
                                  Total: ₹{s.totalFee.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href="/reservations/new?tab=collect"
                              target="_blank"
                            >
                              Collect Fee
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href="/admissions/new" target="_blank">
                              View Details
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="employees">
                <div className="max-h-96 overflow-auto space-y-3">
                  {employees.map((e) => (
                    <div
                      key={e.id}
                      className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-green-600 mt-1" />
                          <div className="space-y-2">
                            <div>
                              <div className="font-semibold text-lg">
                                {e.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {e.id} • {e.role} • {e.department}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Mobile:</span>{" "}
                                {e.mobile}
                              </div>
                              <div>
                                <span className="font-medium">Email:</span>{" "}
                                {e.email}
                              </div>
                              <div>
                                <span className="font-medium">Join Date:</span>{" "}
                                {e.joinDate}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>
                                <Badge
                                  variant={
                                    e.status === "Active"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="ml-1"
                                >
                                  {e.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="pt-2">
                              <span className="font-medium text-blue-600">
                                Salary: ₹{e.salary.toLocaleString()}/month
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href="/employees" target="_blank">
                              View Profile
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href="/payroll" target="_blank">
                              Payroll
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="transactions">
                <div className="max-h-96 overflow-auto space-y-3">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-purple-600 mt-1" />
                          <div className="space-y-2">
                            <div>
                              <div className="font-semibold text-lg">
                                {t.type}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {t.id} • {t.date}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Amount:</span>{" "}
                                {t.amount}
                              </div>
                              <div>
                                <span className="font-medium">Mode:</span>{" "}
                                {t.mode}
                              </div>
                              {t.student && (
                                <div>
                                  <span className="font-medium">Student:</span>{" "}
                                  {t.student}
                                </div>
                              )}
                              {t.employee && (
                                <div>
                                  <span className="font-medium">Employee:</span>{" "}
                                  {t.employee}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Status:</span>
                                <Badge
                                  variant={
                                    t.status === "Completed"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="ml-1"
                                >
                                  {t.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href="/fees" target="_blank">
                              View Details
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href="/financial-reports" target="_blank">
                              Reports
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
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
