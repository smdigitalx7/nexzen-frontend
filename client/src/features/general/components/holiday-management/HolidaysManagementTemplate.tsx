import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Plus,
  RefreshCw,
  Sparkles,
  Calendar,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/core/auth/authStore";
import { HolidaysService } from "@/features/general/services/holidays.service";
import type {
  HolidayRead,
  HolidayCreate,
} from "@/features/general/types/holidays";
import { HolidayCalendarView } from "./components/HolidayCalendarView";
import { HolidayTableView } from "./components/HolidayTableView";
import { HolidayStatsCards } from "./components/HolidayStatsCards";
import { HolidayFormDialog } from "./components/HolidayFormDialog";
import { ConfirmDialog } from "@/common/components/shared/ConfirmDialog";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { toast } from "@/common/hooks/use-toast";
import { cn } from "@/common/utils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const HolidaysManagementTemplate: React.FC = () => {
  const currentBranch = useAuthStore((s) => s.currentBranch);

  // Accurate India Standard Time (IST) initialization
  const istDateParts = useMemo(() => {
    const istDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()); // "YYYY-MM-DD"
    const [y, m] = istDateStr.split("-").map((v) => parseInt(v, 10));
    return { istDateStr, year: y, month: m };
  }, []);

  const [selectedYear, setSelectedYear] = useState<number>(istDateParts.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(istDateParts.month);
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");

  const [holidays, setHolidays] = useState<HolidayRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayRead | null>(null);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<string | undefined>(
    undefined
  );

  // Confirmation dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<HolidayRead | null>(null);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  // Fetch holidays for the selected year
  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await HolidaysService.getHolidays(selectedYear);
      const list = Array.isArray(res) ? res : res?.data || [];
      setHolidays(list);
    } catch (err: any) {
      toast({
        title: "Failed to load holidays",
        description: err?.response?.data?.detail || "Could not retrieve holiday list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Derived month holidays
  const holidaysForCurrentMonth = useMemo(() => {
    const monthPad = String(selectedMonth).padStart(2, "0");
    const prefix = `${selectedYear}-${monthPad}`;
    return holidays.filter((h) => h.holiday_date.startsWith(prefix));
  }, [holidays, selectedYear, selectedMonth]);

  // Derived Sundays in selected month
  const sundaysCount = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(selectedYear, selectedMonth - 1, d).getDay() === 0) {
        count++;
      }
    }
    return count;
  }, [selectedYear, selectedMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleToday = () => {
    setSelectedYear(istDateParts.year);
    setSelectedMonth(istDateParts.month);
  };

  // Actions
  const handleAddOnDate = (dateStr: string) => {
    setEditingHoliday(null);
    setSelectedDateForAdd(dateStr);
    setDialogOpen(true);
  };

  const handleEditHoliday = (holiday: HolidayRead) => {
    setEditingHoliday(holiday);
    setSelectedDateForAdd(holiday.holiday_date);
    setDialogOpen(true);
  };

  const handleDeletePrompt = (holiday: HolidayRead) => {
    setHolidayToDelete(holiday);
    setDeleteDialogOpen(true);
  };

  const handleCreateOrUpdate = async (payload: HolidayCreate) => {
    try {
      setActionLoading(true);
      if (editingHoliday) {
        await HolidaysService.update(editingHoliday.holiday_id, payload);
        toast({
          title: "Holiday Updated",
          description: `"${payload.holiday_name}" on ${payload.holiday_date} has been updated.`,
          variant: "success",
        });
      } else {
        await HolidaysService.create(payload);
        toast({
          title: "Holiday Declared",
          description: `"${payload.holiday_name}" declared successfully!`,
          variant: "success",
        });
      }
      setDialogOpen(false);
      setEditingHoliday(null);
      setSelectedDateForAdd(undefined);
      fetchHolidays();
    } catch (err: any) {
      toast({
        title: "Operation Failed",
        description: err?.response?.data?.detail || "Could not save holiday.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return;
    try {
      setActionLoading(true);
      await HolidaysService.delete(holidayToDelete.holiday_id);
      toast({
        title: "Holiday Removed",
        description: `"${holidayToDelete.holiday_name}" deleted.`,
        variant: "success",
      });
      setDeleteDialogOpen(false);
      setHolidayToDelete(null);
      fetchHolidays();
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err?.response?.data?.detail || "Could not delete holiday.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmSeed = async () => {
    try {
      setSeedLoading(true);
      const res = await HolidaysService.seedDefaults(selectedYear);
      toast({
        title: "Holidays Seeded",
        description:
          res.message ||
          `Standard public holidays for ${selectedYear} have been populated.`,
      });
      setSeedDialogOpen(false);
      fetchHolidays();
    } catch (err: any) {
      toast({
        title: "Seeding Failed",
        description:
          err?.response?.data?.detail || "Could not seed default holidays.",
        variant: "destructive",
      });
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Holiday Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage institute public holidays, festivals, and scheduled closures
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className="gap-1.5 py-1.5 px-3 text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            {currentBranch?.branch_name || "All Branches"}
          </Badge>

          <Button
            onClick={() => {
              setEditingHoliday(null);
              setSelectedDateForAdd(undefined);
              setDialogOpen(true);
            }}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium h-9 px-3.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Declare Holiday
          </Button>
        </div>
      </motion.div>

      {/* 2. Minimalist & Clean Stats Bar */}
      <HolidayStatsCards
        holidays={holidays}
        totalInYear={holidays.length}
        monthHolidaysCount={holidaysForCurrentMonth.length}
        sundaysCount={sundaysCount}
        selectedYear={selectedYear}
        selectedMonthName={MONTH_NAMES[selectedMonth - 1]}
        loading={loading}
      />

      {/* 3. Controls & Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
        {/* Left: Month / Year Navigator */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-8 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
              title="Jump to current month"
            >
              Today
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month Dropdown */}
          <Select
            value={selectedMonth.toString()}
            onValueChange={(val) => setSelectedMonth(parseInt(val, 10))}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((name, idx) => (
                <SelectItem key={name} value={(idx + 1).toString()} className="text-xs">
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Dropdown */}
          <Select
            value={selectedYear.toString()}
            onValueChange={(val) => setSelectedYear(parseInt(val, 10))}
          >
            <SelectTrigger className="w-[95px] h-9 text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <SelectItem key={y} value={y.toString()} className="text-xs">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right: View Toggle + Seed + Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented View Mode Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                viewMode === "calendar"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Calendar View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <List className="h-3.5 w-3.5" />
              List Table
            </button>
          </div>

          {/* Seed Defaults Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSeedDialogOpen(true)}
            className="h-9 px-3 gap-1.5 text-xs font-medium text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800"
            title={`Seed standard national & state public holidays for ${selectedYear}`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Seed {selectedYear} Holidays
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHolidays}
            disabled={loading}
            className="h-9 px-2.5 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* 4. Main View (Calendar View or Table View) */}
      {viewMode === "calendar" ? (
        <HolidayCalendarView
          year={selectedYear}
          month={selectedMonth}
          holidays={holidays}
          onAddOnDate={handleAddOnDate}
          onEditHoliday={handleEditHoliday}
          onDeleteHoliday={handleDeletePrompt}
        />
      ) : (
        <HolidayTableView
          holidays={holidays}
          loading={loading}
          onEditHoliday={handleEditHoliday}
          onDeleteHoliday={handleDeletePrompt}
          onDeclareClick={() => {
            setEditingHoliday(null);
            setSelectedDateForAdd(undefined);
            setDialogOpen(true);
          }}
        />
      )}

      {/* 5. Declare / Edit Holiday Dialog */}
      <HolidayFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        holiday={editingHoliday}
        defaultDate={selectedDateForAdd}
        onSubmit={handleCreateOrUpdate}
        loading={actionLoading}
      />

      {/* 6. Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Holiday"
        description={
          holidayToDelete ? (
            <div className="space-y-2 text-sm">
              <p>
                Are you sure you want to delete{" "}
                <strong>"{holidayToDelete.holiday_name}"</strong> on{" "}
                <strong>{holidayToDelete.holiday_date}</strong>?
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                Warning: Daily attendance records for employees on this date will be restored.
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmText="Confirm Delete"
        variant="destructive"
        isLoading={actionLoading}
        onConfirm={handleConfirmDelete}
      />

      {/* 7. Confirm Seed Dialog */}
      <ConfirmDialog
        open={seedDialogOpen}
        onOpenChange={setSeedDialogOpen}
        title={`Seed Standard Public Holidays for ${selectedYear}`}
        description={
          <div className="space-y-2 text-sm">
            <p>
              This will automatically populate 25 standard national and state
              public holidays for the year <strong>{selectedYear}</strong> into
              the institute calendar.
            </p>
            <p className="text-xs text-slate-500">
              Existing holidays on those dates will not be duplicated.
            </p>
          </div>
        }
        confirmText={`Seed ${selectedYear} Holidays`}
        isLoading={seedLoading}
        onConfirm={handleConfirmSeed}
      />
    </div>
  );
};
export default HolidaysManagementTemplate;
