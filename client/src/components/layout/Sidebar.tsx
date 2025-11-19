import { useEffect, useMemo } from "react";
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
  Megaphone,
  Menu,
  FileText,
  BarChart3,
  LogOut,
  ChevronDown,
  ChevronsDown,
  BookOpen,
  ExternalLink,
  FolderOpen,
  Bug,
} from "lucide-react";
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useNavigationStore } from "@/store/navigationStore";
import { ROLES } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";

interface NavigationItem {
  title: string;
  href: string;
  icon: any;
  badge?: number;
  description?: string;
  allowedRoles?: string[]; // Explicitly define which roles can access this item
  children?: NavigationItem[];
}

const Sidebar = () => {
  const [location, setLocation] = useLocation();
  const { user, currentBranch, logoutAsync } = useAuthStore();
  const { sidebarOpen, setActiveModule, toggleSidebar } = useNavigationStore();
  const queryClient = useQueryClient();

  // Debug logging (only in development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("📋 Sidebar Debug:", {
        user: user ? { role: user.role, id: user.user_id } : null,
        currentBranch: currentBranch
          ? {
              id: currentBranch.branch_id,
              type: currentBranch.branch_type,
              name: currentBranch.branch_name,
            }
          : null,
        userRole: user?.role,
        roleConstants: {
          ADMIN: ROLES.ADMIN,
          INSTITUTE_ADMIN: ROLES.INSTITUTE_ADMIN,
          ACCOUNTANT: ROLES.ACCOUNTANT,
          ACADEMIC: ROLES.ACADEMIC,
        },
        roleMatch: {
          isAdmin: user?.role === ROLES.ADMIN,
          isInstituteAdmin: user?.role === ROLES.INSTITUTE_ADMIN,
          isExactMatch: user?.role === "INSTITUTE_ADMIN",
          roleType: typeof user?.role,
          roleValue: user?.role,
        },
      });
    }
  }, [user, currentBranch]);

  // Get General/Public modules based on role (memoized for performance)
  const generalModules = useMemo((): NavigationItem[] => {
    if (!user?.role) return [];

    // Normalize role for comparison (handle case/whitespace issues)
    const userRoleUpper = String(user.role).toUpperCase().trim();
    const isAdminRole =
      userRoleUpper === ROLES.ADMIN || userRoleUpper === "ADMIN";
    const isInstituteAdminRole =
      userRoleUpper === ROLES.INSTITUTE_ADMIN ||
      userRoleUpper === "INSTITUTE_ADMIN" ||
      userRoleUpper === "INSTITUTEADMIN";

    if (import.meta.env.DEV) {
      console.log("🔍 General Modules Check:", {
        userRole: user.role,
        userRoleUpper,
        ROLES_ADMIN: ROLES.ADMIN,
        ROLES_INSTITUTE_ADMIN: ROLES.INSTITUTE_ADMIN,
        isAdminRole,
        isInstituteAdminRole,
        willShowGeneral: isAdminRole || isInstituteAdminRole,
        comparison: {
          exactMatch: user.role === ROLES.INSTITUTE_ADMIN,
          upperMatch: userRoleUpper === ROLES.INSTITUTE_ADMIN,
          includesMatch:
            String(user.role).includes("INSTITUTE_ADMIN") ||
            String(user.role).includes("ADMIN"),
        },
      });
    }

    // Build General modules based on role
    const modules: NavigationItem[] = [];

    // Users - Only ADMIN and INSTITUTE_ADMIN
    if (isAdminRole || isInstituteAdminRole) {
      modules.push({
        title: "Users",
        href: "/users",
        icon: Users,
        description: "User management",
      });
    }

    // Employees - ADMIN, INSTITUTE_ADMIN, ACCOUNTANT, ACADEMIC
    if (
      isAdminRole ||
      isInstituteAdminRole ||
      userRoleUpper === ROLES.ACCOUNTANT ||
      userRoleUpper === "ACCOUNTANT" ||
      userRoleUpper === ROLES.ACADEMIC ||
      userRoleUpper === "ACADEMIC"
    ) {
      modules.push({
        title: "Employees",
        href: "/employees",
        icon: UserCheck,
        description: "Staff management",
      });
    }

    // Payroll - Only ADMIN and INSTITUTE_ADMIN
    if (isAdminRole || isInstituteAdminRole) {
      modules.push({
        title: "Payroll",
        href: "/payroll",
        icon: CreditCard,
        description: "Salary and payments",
      });
    }

    // Transport - ADMIN, INSTITUTE_ADMIN, ACCOUNTANT
    if (
      isAdminRole ||
      isInstituteAdminRole ||
      userRoleUpper === ROLES.ACCOUNTANT ||
      userRoleUpper === "ACCOUNTANT"
    ) {
      modules.push({
        title: "Transport",
        href: "/transport",
        icon: Bus,
        description: "Bus routes and stops",
      });
    }

    // Audit Log - Only ADMIN and INSTITUTE_ADMIN
    if (isAdminRole || isInstituteAdminRole) {
      modules.push({
        title: "Audit Log",
        href: "/audit-log",
        icon: FileText,
        description: "Immutable user action log",
      });
    }

    return modules;
  }, [user?.role]);

  // Get Schema-specific modules (School/College) based on role (memoized for performance)
  const schemaModules = useMemo((): NavigationItem[] => {
    if (!currentBranch) return [];

    const branchPrefix =
      currentBranch.branch_type === "SCHOOL" ? "/school" : "/college";
    const branchType =
      currentBranch.branch_type === "SCHOOL" ? "School" : "College";

    const allModules: NavigationItem[] = [
      {
        title: "Reservations",
        href: `${branchPrefix}/reservations/new`,
        icon: ClipboardList,
        description: "Student reservations",
        allowedRoles: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      },
      {
        title: "Admissions",
        href: `${branchPrefix}/admissions`,
        icon: UserCheck,
        description: "Student admissions",
        allowedRoles: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      },
      {
        title: "Students",
        href: `${branchPrefix}/students`,
        icon: GraduationCap,
        description: "Student records",
        allowedRoles: [
          ROLES.ADMIN,
          ROLES.INSTITUTE_ADMIN,
          ROLES.ACADEMIC,
          ROLES.ACCOUNTANT,
        ],
      },
      {
        title: "Academic",
        href: `${branchPrefix}/academic`,
        icon: FileText,
        description: "Academic structure & performance",
        allowedRoles: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      },
      {
        title: "Attendance",
        href: `${branchPrefix}/attendance`,
        icon: Calendar,
        description: "Daily attendance",
        allowedRoles: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      },
      {
        title: "Marks",
        href: `${branchPrefix}/marks`,
        icon: Trophy,
        description: "Exam results",
        allowedRoles: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACADEMIC],
      },
      {
        title: "Fees",
        href: `${branchPrefix}/fees`,
        icon: IndianRupeeIcon,
        description: "Fee management",
        allowedRoles: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      },
      {
        title: "Financial Reports",
        href: `${branchPrefix}/financial-reports`,
        icon: BarChart3,
        description: `${branchType} financial analytics`,
        allowedRoles: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
      },
      {
        title: "Announcements",
        href: `${branchPrefix}/announcements`,
        icon: Megaphone,
        description: "Institutional communications",
        allowedRoles: [
          ROLES.ADMIN,
          ROLES.INSTITUTE_ADMIN,
          ROLES.ACADEMIC,
          ROLES.ACCOUNTANT,
        ],
      },
    ];

    // Filter modules based on user role
    if (!user?.role) {
      console.warn("⚠️ No user role found, returning empty schema modules");
      return [];
    }

    console.log("🔍 Schema Modules Filter - Before:", {
      userRole: user.role,
      userRoleType: typeof user.role,
      userRoleValue: JSON.stringify(user.role),
      totalModules: allModules.length,
      allModuleRoles: allModules.map((m) => ({
        title: m.title,
        allowedRoles: m.allowedRoles,
        includesUserRole: m.allowedRoles?.includes(user.role),
      })),
    });

    // Normalize user role for comparison
    const userRoleUpper = String(user.role).toUpperCase().trim();

    const filteredModules = allModules.filter((module) => {
      // Check both exact match and normalized match
      const exactMatch = module.allowedRoles?.includes(user.role) ?? false;
      const normalizedMatch =
        module.allowedRoles?.some(
          (allowedRole) =>
            String(allowedRole).toUpperCase().trim() === userRoleUpper
        ) ?? false;
      const hasAccess = exactMatch || normalizedMatch;

      if (!hasAccess) {
        console.log(`❌ ${module.title}:`, {
          userRole: user.role,
          userRoleUpper,
          allowedRoles: module.allowedRoles,
          exactMatch,
          normalizedMatch,
        });
      }
      return hasAccess;
    });

    console.log("🔍 Schema Modules Filter - After:", {
      userRole: user.role,
      totalModules: allModules.length,
      filteredModules: filteredModules.length,
      moduleTitles: filteredModules.map((m) => m.title),
      filteredModuleDetails: filteredModules.map((m) => ({
        title: m.title,
        allowedRoles: m.allowedRoles,
      })),
    });

    return filteredModules;
  }, [user?.role, currentBranch]);

  const handleItemClick = (href: string, title: string) => {
    setActiveModule(title.toLowerCase());
  };

  const handleLogout = async () => {
    try {
      // logoutAsync() already handles query cache invalidation
      await logoutAsync();
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still navigate to root even if logout fails
      setLocation("/");
    }
  };

  const NavItem = ({
    item,
    isActive,
  }: {
    item: NavigationItem;
    isActive: boolean;
  }) => (
    <Link
      href={item.href}
      onClick={() => {
        // Mark navigation as from sidebar with the target path and timestamp
        // Store path and timestamp to handle timing issues between navigation and route check
        const navData = {
          path: item.href,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(
          "navigation_from_sidebar",
          JSON.stringify(navData)
        );
        handleItemClick(item.href, item.title);
      }}
    >
      <Button
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "w-full justify-start gap-3 h-10 hover-elevate relative transition-all duration-200 group rounded-lg overflow-hidden",
          isActive
            ? "bg-blue-100/80 text-blue-700 font-medium hover:bg-blue-100/90 "
            : "hover:bg-slate-50/70 text-slate-600 hover:text-slate-800"
        )}
        data-testid={`nav-${item.title.toLowerCase().replace(" ", "-")}`}
      >
        <motion.div
          className="flex items-center gap-3 flex-1"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <item.icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors duration-200",
              isActive
                ? "text-blue-600"
                : "text-slate-400 group-hover:text-slate-600"
            )}
          />
          {sidebarOpen && (
            <>
              <span className="truncate text-sm" title={item.title}>
                {item.title}
              </span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="ml-auto h-5 px-1.5 text-xs bg-slate-200 text-slate-700 border-slate-300/50"
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </motion.div>
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
        "fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/80",
        "flex flex-col overflow-hidden overflow-y-auto scrollbar-hide shadow-lg"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-200/80 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {sidebarOpen ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 ">
                <img
                  src={
                    currentBranch?.branch_type === "SCHOOL"
                      ? "/assets/nexzen-logo.png"
                      : "/assets/Velocity-logo.png"
                  }
                  alt={
                    currentBranch?.branch_type === "SCHOOL"
                      ? "Velonex Logo"
                      : "Velocity Logo"
                  }
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold max-w-[100px] text-lg  bg-clip-text text-gray-800/90 leading-tight">
                  {currentBranch?.branch_name || "Velonex"}
                </span>
                {/* <span className="text-xs text-slate-500 font-medium capitalize">
                  {currentBranch?.branch_type || "Education"}
                </span> */}
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
            className="hover-elevate hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-lg"
            data-testid="button-sidebar-toggle"
          >
            <Menu className="h-6 w-6 text-slate-600 hover:text-slate-900 transition-colors" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-4">
          {/* Dashboard - Outside of sections */}
          <div>
            <NavItem
              item={{
                title: "Dashboard",
                href: "/",
                icon: LayoutDashboard,
                description: "Overview and analytics",
              }}
              isActive={location === "/"}
            />
          </div>

          {/* Schema-specific Modules */}
          {(() => {
            // console.log("🎨 Rendering Schema Modules:", {
            //   hasCurrentBranch: !!currentBranch,
            //   schemaModulesLength: schemaModules.length,
            //   schemaModules: schemaModules.map((m) => m.title),
            //   willRender: currentBranch && schemaModules.length > 0,
            // });
            return null;
          })()}
          {currentBranch && schemaModules.length > 0 && (
            <div>
              {sidebarOpen && (
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {currentBranch.branch_type === "SCHOOL"
                      ? "School"
                      : "College"}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-xs bg-slate-100 text-slate-600 border-slate-200"
                  >
                    {schemaModules.length}
                  </Badge>
                </div>
              )}
              <div className="space-y-1">
                {schemaModules.map((item: NavigationItem) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    isActive={location === item.href}
                  />
                ))}
              </div>
            </div>
          )}

          {/* General/Public Modules - Only for ADMIN and INSTITUTE_ADMIN */}
          {(() => {
            // console.log("🎨 Rendering General Modules:", {
            //   generalModulesLength: generalModules.length,
            //   generalModules: generalModules.map((m) => m.title),
            //   willRender: generalModules.length > 0,
            // });
            return null;
          })()}
          {generalModules.length > 0 && (
            <div>
              {sidebarOpen && (
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    General
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-xs bg-slate-100 text-slate-600 border-slate-200"
                  >
                    {generalModules.length}
                  </Badge>
                </div>
              )}
              <div className="space-y-1">
                {generalModules.map((item: NavigationItem) => (
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

      {/* Footer Section with Version, Admin Guide, and Logout */}
      <div className="mt-auto border-t border-slate-200/80 bg-white/50 backdrop-blur-sm">
        <div className="p-3">
          <div className="flex items-center justify-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-10 w-10 hover:bg-red-100  bg-red-50 hover:text-red-900 text-red-600 hover:border-red-200 border border-red-100 transition-all duration-200 rounded-lg shrink-0"
              title="Logout"
              data-testid="sidebar-logout-button"
            >
              <LogOut className="h-4 w-4 text-red-600 hover:text-red-900 transition-colors" />
            </Button>
            {/* Version, Report Issue, Admin Guide, and Documents - Stacked layout */}
            <div className="flex flex-col gap-1 text-[10px] text-slate-400">
              {/* First line: Version | Report Issue */}
              <div className="flex items-center gap-2">
                <span>v1.0.0</span>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() =>
                    window.open(
                      "https://www.jotform.com/form/253145100074039",
                      "_blank"
                    )
                  }
                  className="hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-1"
                  title="Report an Issue"
                >
                  <Bug className="h-3 w-3" />
                  Report Issue
                </button>
              </div>

              {/* Second line: Role-based Guide | Documents (for admin) */}
              {(() => {
                const userRoleUpper = String(user?.role || "")
                  .toUpperCase()
                  .trim();
                const isAdminRole =
                  userRoleUpper === ROLES.ADMIN ||
                  userRoleUpper === "ADMIN" ||
                  userRoleUpper === ROLES.INSTITUTE_ADMIN ||
                  userRoleUpper === "INSTITUTE_ADMIN";
                const isAccountantRole =
                  userRoleUpper === ROLES.ACCOUNTANT ||
                  userRoleUpper === "ACCOUNTANT";
                const isAcademicRole =
                  userRoleUpper === ROLES.ACADEMIC ||
                  userRoleUpper === "ACADEMIC";

                // Admin users: Admin Guide | Documents
                if (isAdminRole) {
                  const adminGuideUrl =
                    "https://docs.google.com/document/d/1oNreLcS2plkfPVn7zQXsT98zdOhmPoBk/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true";
                  const documentsUrl =
                    "https://drive.google.com/drive/folders/10gsq1_6Nt4fTMbrEO0AobIaQmMHD1dWS?usp=drive_link";

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(adminGuideUrl, "_blank")}
                        className="hover:text-slate-600 transition-colors cursor-pointer"
                        title="Admin Guide"
                      >
                        Admin Guide
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => window.open(documentsUrl, "_blank")}
                        className="hover:text-slate-600 transition-colors cursor-pointer"
                        title="Documents"
                      >
                        Documents
                      </button>
                    </div>
                  );
                }

                // Accountant users: Accountant Guide
                if (isAccountantRole) {
                  const accountantGuideUrl =
                    "https://docs.google.com/document/d/19XfkbLisVi5zql9Fuuv5_R4KijLGOow1/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true";

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          window.open(accountantGuideUrl, "_blank")
                        }
                        className="hover:text-slate-600 transition-colors cursor-pointer"
                        title="Accountant Guide"
                      >
                        Accountant Guide
                      </button>
                    </div>
                  );
                }

                // Academic users: Academic Guide
                if (isAcademicRole) {
                  const academicGuideUrl =
                    "https://docs.google.com/document/d/1Lm2nX3UAVcJ42QVW2XONCoXUNuKHy5iv/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true";

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(academicGuideUrl, "_blank")}
                        className="hover:text-slate-600 transition-colors cursor-pointer"
                        title="Academic Guide"
                      >
                        Academic Guide
                      </button>
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
