import React, { useMemo } from "react";
import { Calendar, CalendarDays, Sparkles, Clock } from "lucide-react";
import type { HolidayRead } from "@/features/general/types/holidays";
import { cn } from "@/common/utils";

interface HolidayStatsCardsProps {
  holidays: HolidayRead[];
  totalInYear: number;
  monthHolidaysCount: number;
  sundaysCount: number;
  selectedYear: number;
  selectedMonthName: string;
  loading?: boolean;
}

export const HolidayStatsCards: React.FC<HolidayStatsCardsProps> = ({
  holidays,
  totalInYear,
  monthHolidaysCount,
  sundaysCount,
  selectedYear,
  selectedMonthName,
  loading = false,
}) => {
  // Compute accurate India Standard Time (IST) details
  const { istDateStr, dayOfWeek, formattedDate } = useMemo(() => {
    const now = new Date();
    const istDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now); // "YYYY-MM-DD" e.g. "2026-10-02"

    const dayOfWeek = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
    }).format(now);

    const formattedDate = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
    }).format(now);

    return { istDateStr, dayOfWeek, formattedDate };
  }, []);

  // Today's holiday status (if today is declared as a holiday)
  const todayHoliday = useMemo(() => {
    return holidays.find((h) => h.holiday_date === istDateStr) || null;
  }, [holidays, istDateStr]);

  const isTodaySunday = dayOfWeek === "Sunday";

  // Strictly FUTURE holidays (strictly > istDateStr, NEVER including today)
  const { nextHoliday, daysUntil, formattedNextDate } = useMemo(() => {
    const upcoming = holidays
      .filter((h) => h.holiday_date > istDateStr)
      .sort((a, b) => a.holiday_date.localeCompare(b.holiday_date));

    const next = upcoming[0] || null;
    let daysUntil = 0;
    let formattedNextDate = "";
    if (next) {
      const todayTime = new Date(istDateStr + "T00:00:00").getTime();
      const nextTime = new Date(next.holiday_date + "T00:00:00").getTime();
      daysUntil = Math.max(1, Math.round((nextTime - todayTime) / (1000 * 60 * 60 * 24)));
      formattedNextDate = new Date(next.holiday_date + "T00:00:00").toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
        }
      );
    }
    return { nextHoliday: next, daysUntil, formattedNextDate };
  }, [holidays, istDateStr]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Today's Status: BIG & HIGHLIGHTED if today is a holiday */}
      <div
        className={cn(
          "rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-2 transition-all shadow-2xs relative overflow-hidden",
          todayHoliday
            ? "bg-gradient-to-br from-emerald-500/15 via-emerald-500/8 to-teal-500/15 border-2 border-emerald-500/50 dark:from-emerald-950/60 dark:via-emerald-950/30 dark:to-slate-900 dark:border-emerald-600/70 ring-2 ring-emerald-500/20"
            : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
        )}
      >
        <div className="flex items-center justify-between">
          {todayHoliday ? (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                Today's Holiday
              </span>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                {formattedDate} (IST)
              </span>
            </div>
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today • {formattedDate} (IST)
            </span>
          )}
          <Calendar
            className={cn(
              "h-4 w-4",
              todayHoliday
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400"
            )}
          />
        </div>

        <div className="my-1">
          {todayHoliday ? (
            <div className="space-y-1">
              <div
                className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight leading-tight"
                title={todayHoliday.holiday_name}
              >
                {todayHoliday.holiday_name}
              </div>
            </div>
          ) : isTodaySunday ? (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <span className="text-base font-bold text-rose-600 dark:text-rose-400 leading-snug">
                Sunday (Weekly Off)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-snug">
                Working Day
              </span>
            </div>
          )}
        </div>

        <div className="text-xs truncate">
          {todayHoliday ? (
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{todayHoliday.holiday_groups || "Declared Public Holiday"}</span>
            </div>
          ) : isTodaySunday ? (
            <span className="text-slate-500 dark:text-slate-400">
              Institutional weekend off
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              Regular academic & staff schedule
            </span>
          )}
        </div>
      </div>

      {/* 2. Next Upcoming Holiday: HIGHLIGHTED BACKGROUND */}
      <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-2 transition-all shadow-2xs relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-amber-500/8 to-orange-500/12 border-2 border-amber-500/50 dark:from-amber-950/60 dark:via-amber-950/30 dark:to-slate-900 dark:border-amber-600/70 ring-2 ring-amber-500/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
              Next Upcoming
            </span>
          </div>
          <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="my-1">
          {nextHoliday ? (
            <span
              className="text-base sm:text-lg font-black text-amber-950 dark:text-amber-100 truncate block leading-tight"
              title={nextHoliday.holiday_name}
            >
              {nextHoliday.holiday_name}
            </span>
          ) : (
            <span className="text-base font-medium text-amber-800/60 dark:text-amber-400/60 leading-snug">
              No Upcoming
            </span>
          )}
        </div>

        <div className="text-xs truncate font-semibold text-amber-800 dark:text-amber-300">
          {nextHoliday
            ? `${daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`} • ${formattedNextDate} (${nextHoliday.holiday_groups || "Public"})`
            : `No scheduled closures remaining in ${selectedYear}`}
        </div>
      </div>

      {/* 3. Selected Month Summary: Clean Minimal Card */}
      <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-2 transition-all shadow-2xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {selectedMonthName} {selectedYear}
          </span>
          <CalendarDays className="h-4 w-4 text-slate-400" />
        </div>

        <div className="my-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {monthHolidaysCount}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {monthHolidaysCount === 1 ? "Holiday" : "Holidays"}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {sundaysCount} Sundays (Weekly Offs)
        </p>
      </div>

      {/* 4. Annual Total: Clean Minimal Card */}
      <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-2 transition-all shadow-2xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total in {selectedYear}
          </span>
          <Clock className="h-4 w-4 text-slate-400" />
        </div>

        <div className="my-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {totalInYear}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Days Scheduled
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          Public & institutional closures
        </p>
      </div>
    </div>
  );
};
