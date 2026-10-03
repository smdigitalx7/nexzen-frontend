import React, { useMemo } from "react";
import type { HolidayRead } from "@/features/general/types/holidays";
import { Plus, Edit2, Trash2, Sun } from "lucide-react";
import { cn } from "@/common/utils";

interface HolidayCalendarViewProps {
  year: number;
  month: number; // 1-12
  holidays: HolidayRead[];
  onAddOnDate: (dateStr: string) => void;
  onEditHoliday: (holiday: HolidayRead) => void;
  onDeleteHoliday: (holiday: HolidayRead) => void;
}

const WEEKDAYS = [
  { key: "sun", label: "Sunday", short: "Sun", isWeekend: true },
  { key: "mon", label: "Monday", short: "Mon", isWeekend: false },
  { key: "tue", label: "Tuesday", short: "Tue", isWeekend: false },
  { key: "wed", label: "Wednesday", short: "Wed", isWeekend: false },
  { key: "thu", label: "Thursday", short: "Thu", isWeekend: false },
  { key: "fri", label: "Friday", short: "Fri", isWeekend: false },
  { key: "sat", label: "Saturday", short: "Sat", isWeekend: false },
];

export const HolidayCalendarView: React.FC<HolidayCalendarViewProps> = ({
  year,
  month,
  holidays,
  onAddOnDate,
  onEditHoliday,
  onDeleteHoliday,
}) => {
  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }, []);

  // Map holidays by 'YYYY-MM-DD'
  const holidaysMap = useMemo(() => {
    const map = new Map<string, HolidayRead[]>();
    holidays.forEach((h) => {
      const list = map.get(h.holiday_date) || [];
      list.push(h);
      map.set(h.holiday_date, list);
    });
    return map;
  }, [holidays]);

  // Calendar math
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  // Previous month trailing days
  const prevMonthDays = Array.from(
    { length: firstDayOfWeek },
    (_, i) => daysInPrevMonth - firstDayOfWeek + 1 + i
  );

  // Current month active days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Next month leading days to complete grid
  const totalCellsSoFar = prevMonthDays.length + currentMonthDays.length;
  const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => i + 1);

  const getCategoryStyles = (group?: string | null) => {
    switch (group) {
      case "National Holiday":
        return {
          card: "bg-rose-50/90 border-rose-200 text-rose-900 hover:bg-rose-100/90 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200",
          bar: "bg-rose-500",
          dot: "bg-rose-500",
        };
      case "Emergency / Weather Holiday":
        return {
          card: "bg-amber-50/90 border-amber-200 text-amber-900 hover:bg-amber-100/90 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200",
          bar: "bg-amber-500",
          dot: "bg-amber-500",
        };
      case "Festival":
        return {
          card: "bg-purple-50/90 border-purple-200 text-purple-900 hover:bg-purple-100/90 dark:bg-purple-950/40 dark:border-purple-900/60 dark:text-purple-200",
          bar: "bg-purple-500",
          dot: "bg-purple-500",
        };
      case "Institutional Holiday":
        return {
          card: "bg-sky-50/90 border-sky-200 text-sky-900 hover:bg-sky-100/90 dark:bg-sky-950/40 dark:border-sky-900/60 dark:text-sky-200",
          bar: "bg-sky-500",
          dot: "bg-sky-500",
        };
      default:
        return {
          card: "bg-indigo-50/90 border-indigo-200 text-indigo-900 hover:bg-indigo-100/90 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-200",
          bar: "bg-indigo-500",
          dot: "bg-indigo-500",
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Calendar Card Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd.key}
              className={cn(
                "py-3 px-2 text-center text-xs font-bold uppercase tracking-wider",
                wd.isWeekend
                  ? "text-rose-600 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/20"
                  : "text-slate-600 dark:text-slate-300"
              )}
            >
              <span className="hidden sm:inline">{wd.label}</span>
              <span className="sm:hidden">{wd.short}</span>
            </div>
          ))}
        </div>

        {/* Days 7-Column Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 dark:divide-slate-800">
          {/* Previous Month Cells */}
          {prevMonthDays.map((dayNum) => (
            <div
              key={`prev-${dayNum}`}
              className="min-h-[125px] p-2 bg-slate-50/40 dark:bg-slate-950/40 text-slate-300 dark:text-slate-700 select-none flex flex-col justify-between"
            >
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-600">
                {dayNum}
              </div>
            </div>
          ))}

          {/* Current Month Active Days */}
          {currentMonthDays.map((dayNum) => {
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
              dayNum
            ).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const dayHolidays = holidaysMap.get(dateStr) || [];
            const dayOfWeekIdx = (firstDayOfWeek + dayNum - 1) % 7;
            const isSunday = dayOfWeekIdx === 0;

            return (
              <div
                key={`day-${dayNum}`}
                className={cn(
                  "min-h-[125px] p-2 flex flex-col justify-between group relative transition-colors",
                  isSunday
                    ? "bg-rose-50/15 dark:bg-rose-950/10 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    : "bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                )}
              >
                {/* Day Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isToday ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {dayNum}
                      </div>
                    ) : (
                      <span
                        className={cn(
                          "text-xs font-semibold px-1 py-0.5",
                          isSunday
                            ? "text-rose-600 dark:text-rose-400 font-bold"
                            : "text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {dayNum}
                      </span>
                    )}
                    {isToday && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight hidden sm:inline">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Add Button on Day Hover */}
                  <button
                    type="button"
                    onClick={() => onAddOnDate(dateStr)}
                    title={`Declare holiday on ${dateStr}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Day Body: Holidays or Weekly Off */}
                <div className="space-y-1.5 mt-1.5 flex-1">
                  {dayHolidays.map((h) => {
                    const style = getCategoryStyles(h.holiday_groups);
                    return (
                      <div
                        key={h.holiday_id}
                        onClick={() => onEditHoliday(h)}
                        className={cn(
                          "group/item relative flex flex-col gap-0.5 p-1.5 rounded-md border text-left cursor-pointer transition-all shadow-2xs",
                          style.card
                        )}
                        title={`${h.holiday_name} (${h.holiday_groups || "Public Holiday"}) - Click to edit`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                style.dot
                              )}
                            />
                            <span className="font-semibold text-xs leading-tight truncate">
                              {h.holiday_name}
                            </span>
                          </div>

                          {/* Action icons on chip hover */}
                          <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-0.5 shrink-0 bg-white/95 dark:bg-slate-900/95 rounded px-1 py-0.5 shadow-xs transition">
                            <button
                              type="button"
                              title="Edit holiday"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditHoliday(h);
                              }}
                              className="p-0.5 hover:text-blue-600 rounded text-slate-500"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              title="Delete holiday"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteHoliday(h);
                              }}
                              className="p-0.5 hover:text-rose-600 rounded text-slate-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {h.holiday_groups && (
                          <span className="text-[10px] opacity-75 font-normal pl-3 truncate">
                            {h.holiday_groups}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Sunday Weekly Off Chip (if no other holiday declared) */}
                  {isSunday && dayHolidays.length === 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/30 text-[11px] font-medium text-rose-700 dark:text-rose-400 select-none">
                      <Sun className="h-3 w-3 shrink-0 text-rose-500" />
                      <span>Weekly Off</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Next Month Overflow Cells */}
          {nextMonthDays.map((dayNum) => (
            <div
              key={`next-${dayNum}`}
              className="min-h-[125px] p-2 bg-slate-50/40 dark:bg-slate-950/40 text-slate-300 dark:text-slate-700 select-none"
            >
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-600">
                {dayNum}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>National Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Festival</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Public Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Emergency / Weather</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Institutional</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
            <span>Weekly Off (Sunday)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Tip: Hover any date and click <strong className="text-slate-600 dark:text-slate-300">+</strong> to declare a holiday
        </div>
      </div>
    </div>
  );
};
