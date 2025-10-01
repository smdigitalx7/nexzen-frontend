import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, School, ChevronDown, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";

const BranchSwitcher = () => {
  const { currentBranch, branches, switchBranch, isBranchSwitching } = useAuthStore();
  const queryClient = useQueryClient();

  const handleBranchSwitch = useCallback(async (branch: any) => {
    try {
      await switchBranch(branch);
      // Ensure all data refetches immediately with new branch context
      await queryClient.cancelQueries();
      await queryClient.invalidateQueries({ predicate: () => true });
      await queryClient.refetchQueries({ predicate: () => true, type: 'all' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to switch branch:", error);
    }
  }, [switchBranch, queryClient]);

  return (
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
  );
};

export default BranchSwitcher;


