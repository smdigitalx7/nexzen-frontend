import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Badge } from "@/common/components/ui/badge";
import { useAuthStore } from "@/core/auth/authStore";
import { getEquivalentUrl } from "@/common/utils/navigation";
import { getLogoByBranchType, getLogoAltByBranchType } from "@/lib/config";
import type { Branch } from "@/core/auth/authStore";

const BranchSwitcher = () => {
  const { currentBranch, branches, switchBranch, isBranchSwitching } =
    useAuthStore();
  const [open, setOpen] = useState(false);

  const handleBranchSwitch = useCallback(
    async (branch: Branch) => {
      try {
        const currentUrl = window.location.pathname;
        const currentBranchType = currentBranch?.branch_type || "COLLEGE";
        const targetBranchType = branch.branch_type;
        const equivalentUrl = getEquivalentUrl(
          currentUrl,
          currentBranchType,
          targetBranchType
        );

        await switchBranch(branch);
        setOpen(false);

        // Total refresh so all API calls use new X-Branch-ID / X-Branch-Type cookies
        const fullUrl =
          equivalentUrl + (window.location.search || "");
        if (window.location.pathname !== equivalentUrl) {
          window.location.href = fullUrl;
        } else {
          window.location.reload();
        }
      } catch {
        // Error toast shown by switchBranch; keep dropdown open so user can retry
      }
    },
    [switchBranch, currentBranch?.branch_type]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
                src={getLogoByBranchType(currentBranch?.branch_type)}
                alt={getLogoAltByBranchType(currentBranch?.branch_type)}
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
              <Loader.Button size="sm" />
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
                disabled={isBranchSwitching}
                onClick={() => void handleBranchSwitch(branch)}
                className="hover-elevate"
                data-testid={`menuitem-branch-${branch.branch_id}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={getLogoByBranchType(branch.branch_type)}
                      alt={getLogoAltByBranchType(branch.branch_type)}
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
