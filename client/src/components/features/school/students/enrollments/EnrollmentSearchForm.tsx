import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SchoolClassDropdown, SchoolSectionDropdown } from "@/components/shared/Dropdowns";
import { Eye } from "lucide-react";

interface EnrollmentSearchFormProps {
  query: {
    class_id: number | "";
    section_id?: number | "";
    admission_no?: string;
  };
  classes: any[];
  sections: any[];
  onClassChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onAdmissionNoChange: (value: string) => void;
  onClear: () => void;
}

export const EnrollmentSearchForm = ({
  query,
  classes,
  sections,
  onClassChange,
  onSectionChange,
  onAdmissionNoChange,
  onClear,
}: EnrollmentSearchFormProps) => {
  const classId = query.class_id !== "" ? query.class_id : null;
  const sectionId = query.section_id !== "" ? query.section_id : null;
  const hasClassId = typeof classId === "number";

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Class
            </label>
            <SchoolClassDropdown
              value={classId}
              onChange={(value) => onClassChange(value !== null ? value.toString() : "")}
              placeholder="Select class"
              className="w-full"
              emptyValue
              emptyValueLabel="Select class"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Section
            </label>
            <SchoolSectionDropdown
              classId={hasClassId ? classId : 0}
              value={sectionId}
              onChange={(value) => onSectionChange(value !== null ? value.toString() : "")}
              disabled={!hasClassId}
              placeholder={
                hasClassId
                  ? "Select section (optional)"
                  : "Select class first"
              }
              className="w-full"
              emptyValue
              emptyValueLabel="Select section"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Admission No (optional)
            </label>
            <Input
              placeholder="Enter admission number"
              value={query.admission_no ?? ""}
              onChange={(e) => onAdmissionNoChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
