import React from "react";
import { BookOpen, ExternalLink, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const Footer = () => {
  const { user } = useAuthStore();

  // Get role-based usage guide URL
  const getUsageGuideUrl = () => {
    if (!user?.role) return null;

    const userRoleUpper = String(user.role).toUpperCase().trim();

    if (userRoleUpper === ROLES.ACADEMIC || userRoleUpper === "ACADEMIC") {
      return {
        url: "https://docs.google.com/document/d/1Lm2nX3UAVcJ42QVW2XONCoXUNuKHy5iv/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true",
        title: "Academic Guide",
      };
    } else if (
      userRoleUpper === ROLES.ACCOUNTANT ||
      userRoleUpper === "ACCOUNTANT"
    ) {
      return {
        url: "https://docs.google.com/document/d/19XfkbLisVi5zql9Fuuv5_R4KijLGOow1/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true",
        title: "Accountant Guide",
      };
    } else if (
      userRoleUpper === ROLES.ADMIN ||
      userRoleUpper === "ADMIN" ||
      userRoleUpper === ROLES.INSTITUTE_ADMIN ||
      userRoleUpper === "INSTITUTE_ADMIN"
    ) {
      return {
        url: "https://docs.google.com/document/d/1oNreLcS2plkfPVn7zQXsT98zdOhmPoBk/edit?usp=drive_link&ouid=107178451042095511759&rtpof=true&sd=true",
        title: "Admin Guide",
      };
    }

    return null;
  };

  const usageGuide = getUsageGuideUrl();
  const userRoleUpper = user?.role
    ? String(user.role).toUpperCase().trim()
    : "";
  const isAdminRole =
    userRoleUpper === ROLES.ADMIN ||
    userRoleUpper === "ADMIN" ||
    userRoleUpper === ROLES.INSTITUTE_ADMIN ||
    userRoleUpper === "INSTITUTE_ADMIN";

  return (
    <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Version */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">Version 1.0.0</span>
          </div>

          {/* Right: Help & Resources */}
          <div className="flex items-center gap-3">
            {usageGuide && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(usageGuide.url, "_blank")}
                className="h-6 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
              >
                {usageGuide.title}
                <ArrowUpRight />
              </Button>
            )}

            {isAdminRole && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://drive.google.com/drive/folders/10gsq1_6Nt4fTMbrEO0AobIaQmMHD1dWS?usp=drive_link",
                    "_blank"
                  )
                }
                className="h-6 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
              >
                Documents
                <ArrowUpRight className="h-3 w-3" />{" "}
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
