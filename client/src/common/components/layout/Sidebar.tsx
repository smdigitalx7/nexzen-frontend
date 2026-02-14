import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import { cn } from "@/common/utils";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { useAuthStore } from "@/core/auth/authStore";
import { useNavigationStore } from "@/store/navigationStore";
import { ROLES } from "@/common/constants";
import { useQueryClient } from "@tanstack/react-query";
import {
  getLogoByBranchType,
  getLogoAltByBranchType,
  brand,
} from "@/lib/config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import IssueReportDialog from "@/features/general/components/Support/IssueReportDialog";
import { prefetchRouteComponent } from "@/routes/route-config";

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
  const [showIssueReportDialog, setShowIssueReportDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ PERF: Use atomic selectors to avoid sidebar re-renders on unrelated auth/nav store changes
  const user = useAuthStore((s) => s.user);
  const currentBranch = useAuthStore((s) => s.currentBranch);
  const logoutAsync = useAuthStore((s) => s.logoutAsync);

  const sidebarOpen = useNavigationStore((s) => s.sidebarOpen);
  const setActiveModule = useNavigationStore((s) => s.setActiveModule);
  const toggleSidebar = useNavigationStore((s) => s.toggleSidebar);
  const pendingRoutePath = useNavigationStore((s) => s.pendingRoutePath);
  const startRouteTransition = useNavigationStore(
    (s) => s.startRouteTransition
  );

  const queryClient = useQueryClient();

  // Sidebar renders based on user role and current branch

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
        title: "Fee Payments",
        href: `${branchPrefix}/fees`,
        icon: IndianRupeeIcon,
        description: "Fee management",
        allowedRoles: [ROLES.ADMIN, ROLES.INSTITUTE_ADMIN, ROLES.ACCOUNTANT],
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
        title: "Finance & Reports",
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

      return hasAccess;
    });

    return filteredModules;
  }, [user?.role, currentBranch]);

  const handleItemClick = (href: string, title: string) => {
    setActiveModule(title.toLowerCase());
  };

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login", { replace: true });
    }
  };

  // Theme configuration based on branch type
  const themeColors = useMemo(() => {
    const isSchool = currentBranch?.branch_type === "SCHOOL";

    // Get colors from centralized brand configuration
    const schoolIconColor = brand.getSchoolIconColor();
    const collegeIconColor = brand.getCollegeIconColor();

    const baseTheme = {
      active: "bg-blue-50 text-blue-700 font-medium",
      inactive: "text-slate-600 hover:bg-blue-50/50 hover:text-blue-800",
      iconColor: isSchool ? schoolIconColor : collegeIconColor,
    };

    return baseTheme;
  }, [currentBranch?.branch_type]);

  // ✅ PERF: Extracted NavItem to top-level and memoized it
  // This prevents NavItem from being redefined on every Sidebar render,
  // and React.memo ensures it only re-renders when its own props change.
  const NavItem = React.memo(
    ({
      item,
      isActive,
      sidebarOpen,
      themeColors,
      handleItemClick,
      navigate,
      startRouteTransition,
    }: {
      item: NavigationItem;
      isActive: boolean;
      sidebarOpen: boolean;
      themeColors: any;
      handleItemClick: (href: string, title: string) => void;
      navigate: (path: string, options?: { flushSync?: boolean }) => void;
      startRouteTransition: (path: string) => void;
    }) => {
      const NavItemContent = (
        <Link
          to={item.href}
          onMouseEnter={() => prefetchRouteComponent(item.href)}
          onFocus={() => prefetchRouteComponent(item.href)}
          onPointerDown={() => prefetchRouteComponent(item.href)}
          onClick={(e) => {
            e.preventDefault();
            // Mark navigation as from sidebar with the target path and timestamp
            const navData = {
              path: item.href,
              timestamp: Date.now(),
            };
            sessionStorage.setItem(
              "navigation_from_sidebar",
              JSON.stringify(navData)
            );
            handleItemClick(item.href, item.title);
            startRouteTransition(item.href);
            // Force urgent navigation update so fallback/loader can show immediately.
            navigate(item.href, { flushSync: true });
          }}
        >
          <div
            className={cn(
              "w-full flex items-center justify-start gap-3 px-3 py-2 relative transition-all duration-200 group rounded-md overflow-hidden cursor-pointer",
              isActive ? themeColors.active : themeColors.inactive,
              !sidebarOpen && "justify-center px-0 py-2"
            )}
            data-testid={`nav-${item.title.toLowerCase().replace(" ", "-")}`}
          >
            <div
              className={cn(
                "flex items-center gap-3 flex-1",
                !sidebarOpen && "justify-center flex-none"
              )}
            >
              <item.icon
                className="h-4 w-4 shrink-0 transition-opacity duration-200"
                style={{
                  color: themeColors.iconColor,
                  opacity: isActive ? 1 : 0.5,
                }}
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
            </div>
          </div>
        </Link>
      );

      return sidebarOpen ? (
        NavItemContent
      ) : (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{NavItemContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={10}
            className="bg-slate-900 border-slate-800 text-slate-50 font-medium shadow-xl px-3 py-1.5"
          >
            <div className="flex items-center gap-2">
              <span>{item.title}</span>
              {item.badge && (
                <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]">
                  {item.badge}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-[10px] text-slate-400 mt-0.5 max-w-[150px] leading-tight">
                {item.description}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/80",
          "flex flex-col overflow-hidden overflow-y-auto scrollbar-hide shadow-lg",
          sidebarOpen ? "w-[250px]" : "w-[72px]"
        )}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-200/80 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 ">
                  <img
                    src={getLogoByBranchType(currentBranch?.branch_type)}
                    alt={getLogoAltByBranchType(currentBranch?.branch_type)}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold max-w-[100px] text-lg  bg-clip-text text-gray-800/90 leading-tight">
                    {currentBranch?.branch_name || brand.getName()}
                  </span>
                  {/* <span className="text-xs text-slate-500 font-medium capitalize">
                  {currentBranch?.branch_type || "Education"}
                </span> */}
                </div>
              </div>
            ) : (
              <div />
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
            {(() => {
              const displayPath = pendingRoutePath || location.pathname;
              const isDashboardActive = displayPath === "/";

              return (
                <div>
                  <NavItem
                    item={{
                      title: "Dashboard",
                      href: "/",
                      icon: LayoutDashboard,
                      description: "Overview and analytics",
                    }}
                    isActive={isDashboardActive}
                    sidebarOpen={sidebarOpen}
                    themeColors={themeColors}
                    handleItemClick={handleItemClick}
                    navigate={navigate}
                    startRouteTransition={startRouteTransition}
                  />
                </div>
              );
            })()}

            {/* Schema-specific Modules */}
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
                <div className={cn("space-y-1", !sidebarOpen && "space-y-2")}>
                  {schemaModules.map((item: NavigationItem) => {
                    const displayPath = pendingRoutePath || location.pathname;
                    const isActive = displayPath.startsWith(item.href);

                    return (
                      <NavItem
                        key={item.href}
                        item={item}
                        isActive={isActive}
                        sidebarOpen={sidebarOpen}
                        themeColors={themeColors}
                        handleItemClick={handleItemClick}
                        navigate={navigate}
                        startRouteTransition={startRouteTransition}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* General/Public Modules */}
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
                <div className={cn("space-y-1", !sidebarOpen && "space-y-2")}>
                  {generalModules.map((item: NavigationItem) => {
                    const displayPath = pendingRoutePath || location.pathname;
                    const isActive = displayPath.startsWith(item.href);

                    return (
                      <NavItem
                        key={item.href}
                        item={item}
                        isActive={isActive}
                        sidebarOpen={sidebarOpen}
                        themeColors={themeColors}
                        handleItemClick={handleItemClick}
                        navigate={navigate}
                        startRouteTransition={startRouteTransition}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Section with Version, Admin Guide, and Logout */}
        <div className="mt-auto border-t border-slate-200/80 bg-white/50 backdrop-blur-sm">
          <div className="p-3">
            <div className="flex items-center justify-start gap-3">
              {/* Logout Button with Tooltip */}
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent
                    side="right"
                    sideOffset={10}
                    className="bg-slate-900 border-slate-800 text-slate-50 font-medium shadow-xl px-3 py-1.5"
                  >
                    Logout
                  </TooltipContent>
                )}
              </Tooltip>

              {/* Version, Report Issue, Admin Guide, and Documents - Stacked layout */}
              {sidebarOpen ? (
                <div className="flex flex-col gap-1 text-[10px] text-slate-400">
                  {/* First line: Version | Report Issue */}
                  <div className="flex items-center gap-2">
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <span className="cursor-help hover:text-slate-600 transition-colors">
                          {__BUILD_DATE__}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-slate-900 border-slate-800 text-slate-50 font-medium shadow-xl px-3 py-1.5 text-xs"
                      >
                        Application Version
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-slate-300">|</span>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setShowIssueReportDialog(true)}
                          className="hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Bug className="h-3 w-3" />
                          Report Issue
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-slate-900 border-slate-800 text-slate-50 font-medium shadow-xl px-3 py-1.5 text-xs"
                      >
                        Report a bug or issue
                      </TooltipContent>
                    </Tooltip>
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
                        import.meta.env.VITE_ADMIN_GUIDE_URL ||
                        "https://docs.google.com/document/d/1oNreLcS2plkfPVn7zQXsT98zdOhmPoBk/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true";
                      const documentsUrl =
                        import.meta.env.VITE_DOCUMENTATION_URL ||
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
                        import.meta.env.VITE_ACCOUNTANT_GUIDE_URL ||
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
                        import.meta.env.VITE_ACADEMIC_GUIDE_URL ||
                        "https://docs.google.com/document/d/1Lm2nX3UAVcJ42QVW2XONCoXUNuKHy5iv/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true";

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              window.open(academicGuideUrl, "_blank")
                            }
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
              ) : (
                // Collapsed sidebar: Show icon buttons with tooltips
                <div className="flex items-center gap-2">
                  {/* Report Issue Button */}
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowIssueReportDialog(true)}
                        className="h-8 w-8 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-lg"
                      >
                        <Bug className="h-4 w-4 text-slate-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={10}
                      className="bg-slate-900 border-slate-800 text-slate-50 font-medium shadow-xl px-3 py-1.5"
                    >
                      Report Issue
                    </TooltipContent>
                  </Tooltip>

                  {/* Role-based Guide Button */}
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

                    let guideUrl = "";
                    let guideLabel = "";

                    if (isAdminRole) {
                      guideUrl =
                        import.meta.env.VITE_ADMIN_GUIDE_URL ||
                        "https://docs.google.com/document/d/1oNreLcS2plkfPVn7zQXsT98zdOhmPoBk/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true";
                      guideLabel = "Admin Guide";
                    } else if (isAccountantRole) {
                      guideUrl =
                        import.meta.env.VITE_ACCOUNTANT_GUIDE_URL ||
                        "https://docs.google.com/document/d/19XfkbLisVi5zql9Fuuv5_R4KijLGOow1/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true";
                      guideLabel = "Accountant Guide";
                    } else if (isAcademicRole) {
                      guideUrl =
                        import.meta.env.VITE_ACADEMIC_GUIDE_URL ||
                        "https://docs.google.com/document/d/1Lm2nX3UAVcJ42QVW2XONCoXUNuKHy5iv/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true";
                      guideLabel = "Academic Guide";
                    }

                    if (!guideUrl) return null;

                    return (
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(guideUrl, "_blank")}
                            className="h-8 w-8 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-lg"
                          >
                            <BookOpen className="h-4 w-4 text-slate-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={10}
                          className="bg-slate-900 border-slate-800 text-slate-50 font-medium shadow-xl px-3 py-1.5"
                        >
                          {guideLabel}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })()}

                  {/* Documents Button (Admin only) */}
                  {(() => {
                    const userRoleUpper = String(user?.role || "")
                      .toUpperCase()
                      .trim();
                    const isAdminRole =
                      userRoleUpper === ROLES.ADMIN ||
                      userRoleUpper === "ADMIN" ||
                      userRoleUpper === ROLES.INSTITUTE_ADMIN ||
                      userRoleUpper === "INSTITUTE_ADMIN";

                    if (!isAdminRole) return null;

                    const documentsUrl =
                      import.meta.env.VITE_DOCUMENTATION_URL ||
                      "https://drive.google.com/drive/folders/10gsq1_6Nt4fTMbrEO0AobIaQmMHD1dWS?usp=drive_link";

                    return (
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(documentsUrl, "_blank")}
                            className="h-8 w-8 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-lg"
                          >
                            <FolderOpen className="h-4 w-4 text-slate-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={10}
                          className="bg-slate-900 border-slate-800 text-slate-50 font-medium shadow-xl px-3 py-1.5"
                        >
                          Documents
                        </TooltipContent>
                      </Tooltip>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Issue Report Dialog */}
        <IssueReportDialog
          isOpen={showIssueReportDialog}
          onClose={() => setShowIssueReportDialog(false)}
        />
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
