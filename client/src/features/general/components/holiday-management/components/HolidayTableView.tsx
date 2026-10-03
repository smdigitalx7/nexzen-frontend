import React, { useState, useMemo } from "react";
import type { HolidayRead } from "@/features/general/types/holidays";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import {
  Calendar,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  RefreshCw,
  Plus,
} from "lucide-react";

interface HolidayTableViewProps {
  holidays: HolidayRead[];
  loading?: boolean;
  onEditHoliday: (holiday: HolidayRead) => void;
  onDeleteHoliday: (holiday: HolidayRead) => void;
  onDeclareClick: () => void;
}

export const HolidayTableView: React.FC<HolidayTableViewProps> = ({
  holidays,
  loading = false,
  onEditHoliday,
  onDeleteHoliday,
  onDeclareClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const matchSearch =
        !searchTerm.trim() ||
        h.holiday_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.description &&
          h.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        h.holiday_date.includes(searchTerm);

      const matchCategory =
        categoryFilter === "all" || h.holiday_groups === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [holidays, searchTerm, categoryFilter]);

  const getBadgeVariant = (group?: string | null) => {
    switch (group) {
      case "National Holiday":
        return "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300";
      case "Emergency / Weather Holiday":
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300";
      case "Festival":
        return "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300";
      case "Institutional Holiday":
        return "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300";
      default:
        return "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300";
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px] max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search holidays by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Categories</SelectItem>
              <SelectItem value="Public Holiday" className="text-xs">Public Holiday</SelectItem>
              <SelectItem value="National Holiday" className="text-xs">National Holiday</SelectItem>
              <SelectItem value="Festival" className="text-xs">Festival</SelectItem>
              <SelectItem value="Emergency / Weather Holiday" className="text-xs">Emergency / Weather</SelectItem>
              <SelectItem value="Institutional Holiday" className="text-xs">Institutional Holiday</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || categoryFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
              }}
              className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-800"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader className="bg-slate-50/90 dark:bg-slate-800/60">
            <TableRow>
              <TableHead className="w-[130px] font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Date
              </TableHead>
              <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Day
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Holiday Name
              </TableHead>
              <TableHead className="w-[170px] font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Category
              </TableHead>
              <TableHead className="w-[130px] font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Status
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Description / Remarks
              </TableHead>
              <TableHead className="w-[100px] text-right font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-600" />
                  Loading holiday records...
                </TableCell>
              </TableRow>
            ) : filteredHolidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-slate-400">
                  <Calendar className="h-9 w-9 mx-auto mb-2.5 opacity-30 text-slate-400" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    No holidays match your criteria
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Try adjusting your search filters or click declare holiday to add a new date to the calendar.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onDeclareClick}
                    className="mt-4 h-8 px-3 gap-1.5 text-xs font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Declare Holiday
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredHolidays.map((h) => {
                const dateObj = new Date(h.holiday_date + "T00:00:00");
                const formattedDate = dateObj.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const dayName =
                  h.day_of_week ||
                  dateObj.toLocaleDateString("en-IN", { weekday: "long" });

                return (
                  <TableRow
                    key={h.holiday_id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <TableCell className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {formattedDate}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {dayName}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {h.holiday_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium ${getBadgeVariant(
                          h.holiday_groups
                        )}`}
                      >
                        {h.holiday_groups || "Public Holiday"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 gap-1 text-[11px] font-medium"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Declared
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[260px] truncate">
                      {h.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                          title="Edit Holiday"
                          onClick={() => onEditHoliday(h)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                          title="Delete Holiday"
                          onClick={() => onDeleteHoliday(h)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
