import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  Bus,
  GraduationCap,
  Calendar,
  ClipboardList,
  Trophy,
  DollarSign,
  Megaphone,
  Menu,
  School,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useNavigationStore } from "@/store/navigationStore";

interface NavigationItem {
  title: string;
  href: string;
  icon: any;
  badge?: number;
  description?: string;
  roles?: string[];
  children?: NavigationItem[];
}

const Sidebar = () => {
  const [location] = useLocation();
  const { user, currentBranch } = useAuthStore();
  const { sidebarOpen, activeModule, setActiveModule, toggleSidebar } =
    useNavigationStore();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "public",
  ]);

  // Build General section per role
  const baseGeneral: NavigationItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      description: "Overview and analytics",
    },
  ];

  let publicModules: NavigationItem[] = [];

  if (user?.role === "institute_admin") {
    publicModules = [
      ...baseGeneral,
      // {
      //   title: "Institutes",
      //   href: "/institutes",
      //   icon: Building2,
      //   description: "Institute and branch management",
      //   roles: ["institute_admin"],
      // },
      {
        title: "Users",
        href: "/users",
        icon: Users,
        badge: 5,
        description: "User management",
      },
      {
        title: "Employees",
        href: "/employees",
        icon: UserCheck,
        description: "Staff management",
      },
      {
        title: "Payroll",
        href: "/payroll",
        icon: CreditCard,
        badge: 2,
        description: "Salary and payments",
        roles: ["institute_admin", "accountant"],
      },
      {
        title: "Transport",
        href: "/transport",
        icon: Bus,
        description: "Bus routes and stops",
      },
      {
        title: "Audit Log",
        href: "/audit-log",
        icon: FileText,
        description: "Immutable user action log",
        roles: ["institute_admin"],
      },
    ];
  } else if (user?.role === "accountant") {
    // Accountant: Dashboard, Reservations & Admissions, Transport, Finance Reports (General). Fee Management remains under schema.
    const branchPrefix =
      currentBranch?.branch_type === "SCHOOL" ? "/school" : "/college";
    publicModules = [
      ...baseGeneral,
      {
        title: "Reservations",
        href: `${branchPrefix}/reservations/new`,
        icon: GraduationCap,
        description: "Student reservations",
      },
      {
        title: "Transport",
        href: "/transport",
        icon: Bus,
        description: "Bus routes and stops",
      },
    ];
  } else if (user?.role === "academic") {
    // Academic: Dashboard and Academic in General
    publicModules = [...baseGeneral];
  } else {
    publicModules = [...baseGeneral];
  }

  const getSchemaModules = (): NavigationItem[] => {
    if (currentBranch?.branch_type === "SCHOOL") {
      return [
        {
          title: "Academic",
          href: "/school/academic",
          icon: FileText,
          description: "Academic structure & performance",
          roles: ["institute_admin", "academic"],
        },
        {
          title: "Reservations",
          href: "/school/reservations/new",
          icon: ClipboardList,
          description: "Student reservations",
          roles: ["institute_admin", "accountant"],
        },

        {
          title: "Students",
          href: "/school/students",
          icon: GraduationCap,
          badge: 15,
          description: "Student records",
          roles: ["institute_admin", "academic"],
        },
        {
          title: "Attendance",
          href: "/school/attendance",
          icon: Calendar,
          description: "Daily attendance",
          roles: ["institute_admin", "academic"],
        },
        {
          title: "Marks",
          href: "/school/marks",
          icon: Trophy,
          description: "Exam results",
          roles: ["institute_admin", "academic"],
        },
        {
          title: "Fees",
          href: "/school/fees",
          icon: DollarSign,
          badge: 8,
          description: "Fee management",
          roles: ["institute_admin", "accountant"],
        },
        {
          title: "Financial Reports",
          href: "/school/financial-reports",
          icon: BarChart3,
          description: "School financial analytics",
          roles: ["institute_admin", "accountant"],
        },
        {
          title: "Announcements",
          href: "/school/announcements",
          icon: Megaphone,
          description: "Institutional communications",
          roles: ["institute_admin", "academic"],
        },
      ];
    } else if (currentBranch?.branch_type === "COLLEGE") {
      return [
        {
          title: "Academic",
          href: "/college/academic",
          icon: FileText,
          description: "Academic structure & performance",
          roles: ["institute_admin", "academic"],
        },
        {
          title: "Reservations",
          href: "/college/reservations/new",
          icon: ClipboardList,
          description: "Student reservations",
          roles: ["institute_admin", "accountant"],
        },

        {
          title: "Students",
          href: "/college/students",
          icon: GraduationCap,
          badge: 25,
          description: "Student records",
          roles: ["institute_admin", "academic"],
        },
        {
          title: "Attendance",
          href: "/college/attendance",
          icon: Calendar,
          description: "Daily attendance",
          roles: ["institute_admin", "academic"],
        },
        {
          title: "Marks",
          href: "/college/marks",
          icon: Trophy,
          description: "Exam results",
          roles: ["institute_admin", "academic"],
        },
        {
          title: "Fees",
          href: "/college/fees",
          icon: DollarSign,
          badge: 8,
          description: "Fee management",
          roles: ["institute_admin", "accountant"],
        },
        {
          title: "Financial Reports",
          href: "/college/financial-reports",
          icon: BarChart3,
          description: "College financial analytics",
          roles: ["institute_admin", "accountant"],
        },
        {
          title: "Announcements",
          href: "/college/announcements",
          icon: Megaphone,
          description: "College communications",
          roles: ["institute_admin", "academic"],
        },
      ];
    }
    return [];
  };

  const hasPermission = (item: NavigationItem): boolean => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  };

  const handleItemClick = (href: string, title: string) => {
    setActiveModule(title.toLowerCase());
    console.log("Navigation clicked:", title);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const NavItem = ({
    item,
    isActive,
  }: {
    item: NavigationItem;
    isActive: boolean;
  }) => (
    <Link href={item.href}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "w-full justify-start gap-3 h-10 hover-elevate",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
        )}
        onClick={() => handleItemClick(item.href, item.title)}
        data-testid={`nav-${item.title.toLowerCase().replace(" ", "-")}`}
      >
        <item.icon className="h-4 w-4 shrink-0 text-gray-500" />
        {sidebarOpen && (
          <>
            <span className="truncate text-sm font-semibold" title={item.title}>
              {item.title}
            </span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Button>
    </Link>
  );

  return (
    <motion.aside
      initial={{ x: -250, opacity: 0 }}
      animate={{
        x: 0,
        opacity: 1,
        width: sidebarOpen ? 280 : 72,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border",
        "flex flex-col overflow-hidden overflow-y-auto",
        "scrollbar-none scrollbar-track-transparent scrollbar-thumb-transparent"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {sidebarOpen ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                  currentBranch?.branch_type === "SCHOOL"
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                    : "bg-gradient-to-br from-purple-400 to-purple-600"
                }`}
              >
                {currentBranch?.branch_type === "SCHOOL" ? (
                  <School className="h-6 w-6 text-white" />
                ) : (
                  <GraduationCap className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {currentBranch?.branch_name || "Nexzen"}
                </span>
                <span className="text-xs text-slate-500 font-medium capitalize">
                  {currentBranch?.branch_type || "Education"}
                </span>
              </div>
            </motion.div>
          ) : (
            <div></div>
          )}

          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover-elevate hover:bg-slate-100/80 transition-all duration-200 rounded-lg"
            data-testid="button-sidebar-toggle"
          >
            <Menu className="h-6 w-6 text-slate-600" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none scrollbar-track-transparent scrollbar-thumb-transparent">
        <div className="p-4 space-y-4">
          {/* Public Modules */}
          <div>
            {sidebarOpen && (
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  General
                </h3>
              </div>
            )}
            <div className="space-y-1">
              {publicModules.filter(hasPermission).map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={location === item.href}
                />
              ))}
            </div>
          </div>

          {/* Schema-specific Modules */}
          {currentBranch && (
            <div>
              {sidebarOpen && (
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {currentBranch.branch_type === "SCHOOL"
                      ? "School"
                      : "College"}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {getSchemaModules().length}
                  </Badge>
                </div>
              )}
              <div className="space-y-1">
                {getSchemaModules()
                  .filter(hasPermission)
                  .map((item) => (
                    <NavItem
                      key={item.href}
                      item={item}
                      isActive={location === item.href}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {/* {sidebarOpen && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground text-center">
            {user?.role === "institute_admin"
              ? "Full Access"
              : user?.role === "academic"
              ? "Academic Access"
              : "Financial Access"}
          </div>
          <div className="text-xs text-muted-foreground text-center mt-1">
            v1.0.0
          </div>
        </div>
      )} */}
    </motion.aside>
  );
};

export default Sidebar;
