import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Badge } from "@/common/components/ui/badge";
import { useAuthStore, type AcademicYear } from "@/core/auth/authStore";
import { useAcademicYears } from "@/features/general/hooks/useAcademicYear";

const AcademicYearSwitcher = () => {
  const { academicYear, academicYears, switchAcademicYear, isAuthenticated, isLoggingOut } = useAuthStore();
  // ✅ OPTIMIZATION: Enable query for switcher - it needs academic years to function
  // CRITICAL: Disable query if logging out
  const { data: academicYearsData } = useAcademicYears({ enabled: isAuthenticated && !isLoggingOut });

  const handleAcademicYearSwitch = async (year: any) => {
    try {
      // Switch academic year (this will call backend API, rotate token and reload page)
      await switchAcademicYear(year);
      
      // Trigger custom event for components that need to react to academic year change
      window.dispatchEvent(new Event('academic-year-switched'));
      
      console.log(`Academic year switch initiated for ${year.year_name}`);
    } catch (error) {
       
      console.error("Failed to switch academic year:", error);
    }
  };

  useEffect(() => {
    if (!academicYearsData || academicYearsData.length === 0) return;
    if (academicYears.length > 0) return;

    const { setAcademicYears, setAcademicYear } = useAuthStore.getState();

    // Transform AcademicYearRead to AcademicYear format
    const transformedData: AcademicYear[] = academicYearsData.map(
      (year: any) => ({
        ...year,
        updated_at: year.updated_at ?? null,
        created_by: year.created_by ?? null,
        updated_by: year.updated_by ?? null,
      })
    );

    setAcademicYears(transformedData);
    const activeYear =
      academicYearsData.find((y: any) => y.is_active) || academicYearsData[0];
    if (!academicYear && activeYear) {
      setAcademicYear(activeYear.year_name);
    }
  }, [academicYearsData, academicYears.length, academicYear]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="hover-elevate min-w-[200px] justify-between bg-white/80 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm rounded-xl px-4 py-2.5"
          data-testid="dropdown-academic-year-switcher"
          aria-label="Select academic year"
        >
          <div className="flex items-center gap-3">
            <div>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex flex-col items-start">
              <span
                className="truncate max-w-[100px] font-semibold text-base text-slate-700"
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
              .map((year) => (
                <DropdownMenuItem
                  key={year.academic_year_id}
                  onClick={() => handleAcademicYearSwitch(year)}
                  className="hover-elevate"
                  data-testid={`menuitem-academic-year-${year.academic_year_id}`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="truncate" title={year.year_name}>
                      {year.year_name}
                    </span>
                    {year.is_active && (
                      <Badge variant="default" className="ml-auto text-xs">
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
  );
};

export default AcademicYearSwitcher;
