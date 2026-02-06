import { useState, useMemo, useCallback } from "react";
import { 
  Users, 
  UserMinus, 
  ArrowUpCircle, 
  AlertCircle,
  FileCheck2,
  AlertTriangle,
  Info
} from "lucide-react";
import { 
  useSchoolPromotionEligibility, 
  usePromoteSchoolStudents, 
  useDropoutSchoolStudent,
  useSchoolClasses
} from "@/features/school/hooks";
import { useAcademicYears } from "@/features/general/hooks/useAcademicYear";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { Checkbox } from "@/common/components/ui/checkbox";
import { DataTable } from "@/common/components/shared";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { DatePicker } from "@/common/components/ui/date-picker";
import { Alert, AlertDescription, AlertTitle } from "@/common/components/ui/alert";
import { cn } from "@/common/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { SchoolPromotionEligibility } from "@/features/school/types";

export const PromotionDropoutTab = () => {
  const { data: eligibilityData, isLoading, refetch } = useSchoolPromotionEligibility();
  const { data: classesData } = useSchoolClasses();
  const { data: yearsData } = useAcademicYears();
  
  const promoteMutation = usePromoteSchoolStudents();
  const dropoutMutation = useDropoutSchoolStudent();

  const [selectedEnrollments, setSelectedEnrollments] = useState<number[]>([]);
  const [dropoutModalOpen, setDropoutModalOpen] = useState(false);
  const [selectedStudentForDropout, setSelectedStudentForDropout] = useState<SchoolPromotionEligibility | null>(null);
  const [dropoutReason, setDropoutReason] = useState("");
  const [dropoutDate, setDropoutDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [promotionConfirmOpen, setPromotionConfirmOpen] = useState(false);
  const [nextAcademicYearId, setNextAcademicYearId] = useState<number | "">("");
  const [requireFeesPaid, setRequireFeesPaid] = useState(true);

  // Defensive data access to handle potential variations in API response
  const students = useMemo(() => {
    if (!eligibilityData) return [];
    
    // Check various common nesting patterns
    const data = eligibilityData as any;
    
    const possibleArrays = [
      data.eligibility,
      data.students,
      data.data?.eligibility,
      data.data?.students,
      Array.isArray(data) ? data : null
    ];
    
    for (const arr of possibleArrays) {
      if (arr && Array.isArray(arr)) {
        return arr;
      }
    }
    
    return [];
  }, [eligibilityData]);

  const handlePromote = async () => {
    if (selectedEnrollments.length === 0) return;

    const payload = {
      next_academic_year_id: Number(nextAcademicYearId),
      require_fees_paid: requireFeesPaid,
      transfer_requests: selectedEnrollments.map(id => ({
        enrollment_id: id,
        transfer_type: "PROMOTION" as const
      }))
    };

    try {
      await promoteMutation.mutateAsync(payload);
      setSelectedEnrollments([]);
      setPromotionConfirmOpen(false);
      refetch();
    } catch (error) {
      console.error("Promotion failed", error);
    }
  };

  const handleDropout = async () => {
    if (!selectedStudentForDropout) return;

    try {
      await dropoutMutation.mutateAsync({
        enrollment_id: selectedStudentForDropout.enrollment_id,
      } as any);
      setDropoutModalOpen(false);
      setSelectedStudentForDropout(null);
      setDropoutReason("");
      refetch();
    } catch (error) {
      console.error("Dropout failed", error);
    }
  };



  // Define columns
  const columns: ColumnDef<SchoolPromotionEligibility>[] = useMemo(() => [
    {
      accessorKey: "admission_no",
      header: "Admission No",
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
    },
    {
      accessorKey: "current_class_name",
      header: "Current Class",
    },
    {
      id: "fees_status",
      header: "Fees Status",
      cell: ({ row }) => {
        const pending = row.original.total_pending_amount;
        return (
             <Badge variant={pending > 0 ? "destructive" : "outline"}>
                {pending > 0 ? `Pending (${pending})` : "Paid"}
             </Badge>
        );
      }
    },
    {
      id: "eligibility",
      header: "Eligibility",
      cell: ({ row }) => (
        <Badge variant={row.original.is_promotable ? "default" : "secondary"}>
          {row.original.is_promotable ? "Eligible" : "Not Eligible"}
        </Badge>
      )
    }
  ], []);

  // Action configurations for DataTable V2
  const actions: ActionConfig<SchoolPromotionEligibility>[] = useMemo(() => [
    {
      id: "dropout",
      label: "Dropout",
      icon: UserMinus,
      variant: "destructive", // Use destructive variant for dropout
      onClick: (row) => {
        setSelectedStudentForDropout(row);
        setDropoutModalOpen(true);
      }
    }
  ], []);

  // Update selected enrollments when table selection changes
  const onSelectionChange = useCallback((selectedRows: SchoolPromotionEligibility[]) => {
    setSelectedEnrollments(selectedRows.map(r => r.enrollment_id));
  }, []);

  return (
    <div className="space-y-6">
      <Alert variant={"default" as any} className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle>Promotion Policy</AlertTitle>
        <AlertDescription>
          Regular promotion moves students to the next academic class based on the defined sequence. 
          Students with pending fees are marked as ineligible for batch promotion until dues are cleared.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Promotion Eligibility</h2>
            <p className="text-sm text-muted-foreground">
              {students.length} students found in current session
            </p>
          </div>
        </div>

        <Button
          disabled={selectedEnrollments.length === 0}
          onClick={() => setPromotionConfirmOpen(true)}
          className="gap-2"
        >
          <ArrowUpCircle className="h-4 w-4" />
          Promote Selected ({selectedEnrollments.length})
        </Button>
      </div>

      <DataTable
        data={students}
        columns={columns}
        loading={isLoading}
        selectable={true}
        onSelectionChange={onSelectionChange}
        searchKey="student_name"
        searchPlaceholder="Filter students..."
        actions={actions}
        actionsHeader="Actions"
      />

      {/* Promotion Confirmation Dialog */}
      <Dialog open={promotionConfirmOpen} onOpenChange={setPromotionConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" />
              Confirm Batch Promotion
            </DialogTitle>
            <DialogDescription>
              You are about to promote {selectedEnrollments.length} students to their next respective classes. 
              This action will update their enrollment status for the upcoming academic session.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label htmlFor="next-year">Target Academic Year</Label>
               <ServerCombobox
                 items={yearsData || []}
                 value={String(nextAcademicYearId)}
                 onSelect={(val: string) => setNextAcademicYearId(Number(val))}
                 labelKey="year_name"
                 valueKey="academic_year_id"
                 placeholder="Select target academic year..."
                 searchPlaceholder="Search academic year..."
               />
             </div>

             <div className="flex items-center space-x-2">
               <Checkbox 
                 id="require_fees" 
                 checked={requireFeesPaid} 
                 onCheckedChange={(checked) => setRequireFeesPaid(!!checked)} 
               />
               <Label htmlFor="require_fees" className="text-sm cursor-pointer">
                 Require all pending fees to be paid for promotion
               </Label>
             </div>

             <Alert variant={"destructive" as any} className="bg-amber-50 border-amber-200">
               <AlertTriangle className="h-4 w-4 text-amber-600" />
               <AlertDescription className="text-amber-800">
                 This action cannot be easily undone. Please verify the selection before proceeding.
               </AlertDescription>
             </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPromotionConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePromote} 
              loading={promoteMutation.isPending}
              disabled={!nextAcademicYearId}
            >
              Proceed with Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dropout Modal */}
      <Dialog open={dropoutModalOpen} onOpenChange={setDropoutModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <UserMinus className="h-5 w-5" />
              Student Dropout
            </DialogTitle>
            <DialogDescription>
              Marking <strong>{selectedStudentForDropout?.student_name}</strong> as dropped out. 
              This will deactivate their current enrollment.
            </DialogDescription>
          </DialogHeader>

           <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dropout-date">Dropout Date</Label>
              <DatePicker 
                id="dropout-date"
                value={dropoutDate} 
                onChange={setDropoutDate} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropout-reason">Reason for Dropout</Label>
              <Textarea 
                id="dropout-reason"
                placeholder="Enter detailed reason for dropout..." 
                value={dropoutReason}
                onChange={(e) => setDropoutReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDropoutModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDropout}
              loading={dropoutMutation.isPending}
              disabled={!dropoutReason.trim()}
            >
              Confirm Dropout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
