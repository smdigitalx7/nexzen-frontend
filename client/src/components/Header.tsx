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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const Header = () => {
  const { user, currentBranch, branches, switchBranch, logout, academicYear } =
    useAuthStore();
  const { isMobile } = useNavigationStore();
  const [notifications] = useState(3); // Mock notification count
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock global results
  const students = useMemo(
    () =>
      [
        { id: "STU2024156", name: "Priya Patel", class: "Class 8" },
        { id: "STU2024157", name: "Arjun Sharma", class: "Class 9" },
      ].filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.id.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );
  const employees = useMemo(
    () =>
      [
        { id: "EMP001", name: "Dr. Rajesh Kumar", role: "Principal" },
        { id: "EMP002", name: "Prof. Sarah Johnson", role: "HOD CS" },
      ].filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.id.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );
  const transactions = useMemo(
    () =>
      [
        { id: "REC2024001", type: "Fee Payment", amount: "₹5,000" },
        { id: "REC2024002", type: "Fee Payment", amount: "₹8,666" },
      ].filter(
        (t) =>
          t.id.toLowerCase().includes(query.toLowerCase()) ||
          t.type.toLowerCase().includes(query.toLowerCase())
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

  const handleBranchSwitch = (branch: any) => {
    switchBranch(branch);
    console.log("Branch switched to:", branch.branch_name);
  };

  const handleLogout = () => {
    logout();
    console.log("User logged out");
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
                className="hover-elevate min-w-[240px] justify-between bg-white/80 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm rounded-xl px-4 py-2.5"
                data-testid="dropdown-branch-switcher"
                aria-label="Select schema and branch"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      currentBranch?.branch_type === "school"
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                        : "bg-gradient-to-br from-purple-400 to-purple-600"
                    }`}
                  >
                    {currentBranch?.branch_type === "school" ? (
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
                      {currentBranch?.branch_name || "Select Branch"}
                    </span>
                    {/* <span className="text-xs text-slate-500 capitalize">
                      {currentBranch?.branch_type || "Institution"}
                    </span> */}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
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
                        {branch.branch_type === "school" ? (
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
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Global Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={inputRef}
                placeholder="Search students, employees, transactions..."
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
                <div className="max-h-64 overflow-auto divide-y">
                  {students.map((s) => (
                    <a
                      key={s.id}
                      href="/students"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between py-2 hover:bg-slate-50 rounded px-2"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.id} • {s.class}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">Open ↗</span>
                    </a>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="employees">
                <div className="max-h-64 overflow-auto divide-y">
                  {employees.map((e) => (
                    <a
                      key={e.id}
                      href="/employees"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between py-2 hover:bg-slate-50 rounded px-2"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">{e.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {e.id} • {e.role}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">Open ↗</span>
                    </a>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="transactions">
                <div className="max-h-64 overflow-auto divide-y">
                  {transactions.map((t) => (
                    <a
                      key={t.id}
                      href="/fees"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between py-2 hover:bg-slate-50 rounded px-2"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="font-medium">{t.type}</div>
                          <div className="text-xs text-muted-foreground">
                            {t.id} • {t.amount}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">Open ↗</span>
                    </a>
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
