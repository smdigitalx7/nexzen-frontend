import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { DatePicker } from "@/common/components/ui/date-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import type {
  HolidayRead,
  HolidayCreate,
} from "@/features/general/types/holidays";

interface HolidayFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday?: HolidayRead | null;
  defaultDate?: string;
  onSubmit: (payload: HolidayCreate) => Promise<void>;
  loading?: boolean;
}

export const HolidayFormDialog: React.FC<HolidayFormDialogProps> = ({
  open,
  onOpenChange,
  holiday,
  defaultDate,
  onSubmit,
  loading = false,
}) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [group, setGroup] = useState("Public Holiday");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (holiday) {
      setName(holiday.holiday_name);
      setDate(holiday.holiday_date);
      setGroup(holiday.holiday_groups || "Public Holiday");
      setDescription(holiday.description || "");
    } else {
      setName("");
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      setGroup("Public Holiday");
      setDescription("");
    }
  }, [holiday, defaultDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    await onSubmit({
      holiday_name: name.trim(),
      holiday_date: date,
      holiday_groups: group,
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            {holiday ? "Edit Holiday" : "Declare Institute Holiday"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {holiday
              ? "Modify the holiday details and date schedule."
              : "Declare a scheduled holiday, festival, or emergency weather closure."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">

          <div className="space-y-1.5">
            <Label htmlFor="holiday-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Holiday Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="holiday-name"
              placeholder="e.g. Republic Day, Ugadi, Heavy Rain Alert"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="holiday-date" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Holiday Date <span className="text-rose-500">*</span>
              </Label>
              <DatePicker
                id="holiday-date"
                value={date}
                onChange={setDate}
                placeholder="Pick holiday date"
                fromYear={2020}
                toYear={new Date().getFullYear() + 5}
                className="h-10 text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="holiday-group" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </Label>
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger id="holiday-group" className="h-10 text-sm font-medium">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public Holiday">Public Holiday</SelectItem>
                  <SelectItem value="National Holiday">National Holiday</SelectItem>
                  <SelectItem value="Festival">Festival</SelectItem>
                  <SelectItem value="Emergency / Weather Holiday">Emergency / Weather</SelectItem>
                  <SelectItem value="Institutional Holiday">Institutional Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="holiday-desc" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description / Remarks (Optional)
            </Label>
            <Textarea
              id="holiday-desc"
              rows={2}
              placeholder="Additional reason or notes regarding this closure..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm"
            />
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-10 text-xs font-medium px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 px-5 shadow-xs"
              disabled={loading || !name.trim() || !date}
            >
              {loading ? (
                "Saving..."
              ) : holiday ? (
                "Update Holiday"
              ) : (
                "Declare Holiday"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
