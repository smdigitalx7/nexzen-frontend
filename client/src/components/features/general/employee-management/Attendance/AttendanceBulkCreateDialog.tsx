import React, { useState, useEffect } from "react";
import { FormDialog } from "@/components/shared";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

interface AttendanceBulkData {
  total_working_days: number;
  month: number;
  year: number;
}

interface AttendanceBulkCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AttendanceBulkData) => Promise<void>;
  isPending: boolean;
}

const AttendanceBulkCreateDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AttendanceBulkCreateDialogProps) => {
  const currentDate = new Date();
  const [formData, setFormData] = useState<AttendanceBulkData>({
    total_working_days: 0,
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        total_working_days: 0,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.total_working_days <= 0) {
      return;
    }

    if (formData.month < 1 || formData.month > 12) {
      return;
    }

    if (formData.year < 1900 || formData.year > 2100) {
      return;
    }

    await onSubmit(formData);
  };

  const handleSave = () => {
    const form = document.getElementById("bulk-attendance-form") as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  const isFormValid = () => {
    return (
      formData.total_working_days > 0 &&
      formData.month >= 1 &&
      formData.month <= 12 &&
      formData.year >= 1900 &&
      formData.year <= 2100
    );
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Bulk Create Attendance"
      description="Create attendance records for all active employees in the current branch"
      size="LARGE"
      isLoading={isPending}
      onSave={handleSave}
      saveText="Create Attendance"
      cancelText="Cancel"
    >
      <form id="bulk-attendance-form" onSubmit={handleSubmit} className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This will create attendance records for all active employees in your branch. 
            Paid and unpaid leaves will be automatically calculated from approved leave records.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="month">Month *</Label>
            <Select
              value={formData.month.toString()}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  month: parseInt(value),
                })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((monthName, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              min="1900"
              max="2100"
              value={formData.year}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  year: parseInt(e.target.value) || currentDate.getFullYear(),
                })
              }
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="total_working_days">Total Working Days *</Label>
          <Input
            id="total_working_days"
            type="number"
            min="1"
            value={formData.total_working_days}
            onChange={(e) =>
              setFormData({
                ...formData,
                total_working_days: parseInt(e.target.value) || 0,
              })
            }
            required
          />
        </div>
      </form>
    </FormDialog>
  );
};

export default React.memo(AttendanceBulkCreateDialog);

