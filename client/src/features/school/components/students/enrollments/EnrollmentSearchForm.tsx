import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { SchoolClassDropdown, SchoolSectionDropdown } from "@/common/components/shared/Dropdowns";
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
            <label htmlFor="enrollment-class-select" className="text-sm font-medium text-slate-700 mb-2 block">
              Class
            </label>
            <SchoolClassDropdown
              id="enrollment-class-select"
              value={classId}
              onChange={(value) => onClassChange(value !== null ? value.toString() : "")}
              placeholder="Select class"
              className="w-full"
              emptyValue
              emptyValueLabel="Select class"
            />
          </div>
          <div>
            <label htmlFor="enrollment-section-select" className="text-sm font-medium text-slate-700 mb-2 block">
              Section
            </label>
            <SchoolSectionDropdown
              id="enrollment-section-select"
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
            <label htmlFor="enrollment-admission-no" className="text-sm font-medium text-slate-700 mb-2 block">
              Admission No (optional)
            </label>
            <Input
              id="enrollment-admission-no"
              name="admission_no"
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
