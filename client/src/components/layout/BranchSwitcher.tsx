import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ButtonLoading } from "@/components/ui/loading";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { getEquivalentUrl } from "@/lib/utils/navigation";

const BranchSwitcher = () => {
  const { currentBranch, branches, switchBranch, isBranchSwitching } =
    useAuthStore();
  const [, setLocation] = useLocation();

  const handleBranchSwitch = useCallback(
    async (branch: any) => {
      try {
        // Get current URL
        const currentUrl = window.location.pathname;
        const currentBranchType = currentBranch?.branch_type || "COLLEGE";
        const targetBranchType = branch.branch_type;

        // Switch branch first
        await switchBranch(branch);

        // Calculate equivalent URL for the new branch type
        const equivalentUrl = getEquivalentUrl(
          currentUrl,
          currentBranchType,
          targetBranchType
        );

        // Navigate to the equivalent URL
        setLocation(equivalentUrl);

        // Instead of full reload, just clear cache and refresh data
        // This preserves authentication state
        if (window.location.pathname !== equivalentUrl) {
          // Only reload if URL actually changed
          window.location.href = equivalentUrl;
        } else {
          // URL didn't change, just trigger a soft refresh
          window.dispatchEvent(new Event('branch-switched'));
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to switch branch:", error);
        // Don't logout on error - just show error
        // The error handling in switchBranch should preserve auth state
      }
    },
    [switchBranch, currentBranch?.branch_type, setLocation]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isBranchSwitching}
          className="hover-elevate min-w-[270px] justify-between bg-white/80 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm rounded-xl px-4 py-2.5"
          data-testid="dropdown-branch-switcher"
          aria-label="Select schema and branch"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={
                  currentBranch?.branch_type === "SCHOOL"
                    ? "/assets/nexzen-logo.png"
                    : "/assets/Velocity-logo.png"
                }
                alt={
                  currentBranch?.branch_type === "SCHOOL"
                    ? "Nexzen Logo"
                    : "Velocity Logo"
                }
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col items-start">
              <span
                className="truncate max-w-[250px] font-semibold text-base text-slate-700"
                title={currentBranch?.branch_name}
              >
                {isBranchSwitching
                  ? "Switching..."
                  : currentBranch?.branch_name || "Select Branch"}
              </span>
            </div>
          </div>
          {isBranchSwitching ? (
            <div className="text-slate-400">
              <ButtonLoading size="sm" />
            </div>
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <AnimatePresence>
        <DropdownMenuContent align="center" className="w-[270px]" asChild>
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
                  <div className="w-4 h-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        branch.branch_type === "SCHOOL"
                          ? "/assets/nexzen-logo.png"
                          : "/assets/Velocity-logo.png"
                      }
                      alt={
                        branch.branch_type === "SCHOOL"
                          ? "Nexzen Logo"
                          : "Velocity Logo"
                      }
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="truncate" title={branch.branch_name}>
                    {branch.branch_name}
                  </span>
                  {branch.branch_type && (
                    <Badge variant="secondary" className="ml-auto text-xs">
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
  );
};

export default BranchSwitcher;
