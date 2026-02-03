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
  useCollegePromotionEligibility, 
  usePromoteCollegeStudents, 
  useDropoutCollegeStudent,
  useCollegeClasses
} from "@/features/college/hooks";
import { useAcademicYears } from "@/features/general/hooks/useAcademicYear";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Checkbox } from "@/common/components/ui/checkbox";
import { EnhancedDataTable } from "@/common/components/shared";
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
import type { CollegePromotionEligibility } from "@/features/college/types";

export const PromotionDropoutTab = () => {
  const { data: eligibilityData, isLoading, refetch } = useCollegePromotionEligibility();
  const { data: yearsData } = useAcademicYears();
  
  const promoteMutation = usePromoteCollegeStudents();
  const dropoutMutation = useDropoutCollegeStudent();

  const [selectedEnrollments, setSelectedEnrollments] = useState<number[]>([]);
  const [dropoutModalOpen, setDropoutModalOpen] = useState(false);
  const [selectedStudentForDropout, setSelectedStudentForDropout] = useState<CollegePromotionEligibility | null>(null);
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

  const columns: ColumnDef<CollegePromotionEligibility>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
          aria-label="Select all students"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          disabled={!row.original.is_promotable}
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
          aria-label={`Select student ${row.original.student_name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      header: "Current Level",
    },
    {
      accessorKey: "next_class_name",
      header: "Next Level",
    },
    {
      accessorKey: "group_name",
      header: "Group",
    },
    {
      accessorKey: "course_name",
      header: "Course",
      cell: ({ row }) => row.original.course_name || "N/A"
    },
    {
      accessorKey: "is_promotable",
      header: "Eligibility",
      cell: ({ row }) => {
        const isPromotable = row.original.is_promotable;
        const pendingFees = row.original.pending_fee_types;
        
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={isPromotable ? "success" : "destructive"}>
              {isPromotable ? "Eligible" : "Not Eligible"}
            </Badge>
            {!isPromotable && pendingFees && (
              <span className="text-[10px] text-destructive font-medium">
                Pending: {pendingFees}
              </span>
            )}
          </div>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            setSelectedStudentForDropout(row.original);
            setDropoutModalOpen(true);
          }}
        >
          <UserMinus className="h-4 w-4 mr-1" />
          Dropout
        </Button>
      )
    }
  ], []);

  const onSelectionChange = useCallback((selectedRows: CollegePromotionEligibility[]) => {
    setSelectedEnrollments(selectedRows.map(r => r.enrollment_id));
  }, []);

  return (
    <div className="space-y-6">
      <Alert variant={"default" as any} className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle>Promotion Policy</AlertTitle>
        <AlertDescription>
          Regular promotion moves students to the next academic level. 
          Students with pending fees are marked as ineligible for batch promotion.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">Promotion Eligibility</h2>
          <p className="text-sm text-muted-foreground">
            {students.length} students found in current session
          </p>
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

      <EnhancedDataTable
        data={students}
        columns={columns}
        loading={isLoading}
        onRowSelectionChange={onSelectionChange}
        searchKey="student_name"
        searchPlaceholder="Filter students..."
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
              You are about to promote {selectedEnrollments.length} college students.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label htmlFor="next-year-college">Target Academic Year</Label>
               <Select 
                 value={String(nextAcademicYearId)} 
                 onValueChange={(val) => setNextAcademicYearId(Number(val))}
               >
                 <SelectTrigger id="next-year-college">
                   <SelectValue placeholder="Select target academic year..." />
                 </SelectTrigger>
                 <SelectContent>
                   {yearsData?.map((year) => (
                     <SelectItem key={year.academic_year_id} value={String(year.academic_year_id)}>
                       {year.year_name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
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
                 This action will update enrollment records for the next session.
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
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dropout Date</Label>
              <DatePicker 
                value={dropoutDate} 
                onChange={setDropoutDate} 
              />
            </div>
            <div className="space-y-2">
              <Label>Reason for Dropout</Label>
              <Textarea 
                placeholder="Enter reason..." 
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
