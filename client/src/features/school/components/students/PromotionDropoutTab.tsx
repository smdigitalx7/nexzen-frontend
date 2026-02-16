import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  UserMinus, 
  ArrowUpCircle, 
  FileCheck2,
  AlertTriangle,
  Info,
  Search as SearchIcon,
  UserCheck
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
import { DataTable, TabSwitcher } from "@/common/components/shared";
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
import { schoolKeys } from "@/features/school/hooks/query-keys";
import { EnrollmentsService } from "@/features/school/services/enrollments.service";
import type { ColumnDef } from "@tanstack/react-table";
import type { SchoolPromotionEligibility } from "@/features/school/types";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  if (typeof dateString !== "string") return "-";
  if (dateString.includes("T")) return dateString.split("T")[0];
  return dateString;
};

function SchoolPromotedStudentsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim() || undefined), 500);
    return () => clearTimeout(t);
  }, [searchInput]);
  useEffect(() => setPage(1), [searchQuery]);
  const params = useMemo(() => ({ page, page_size: pageSize, search: searchQuery }), [page, pageSize, searchQuery]);
  const { data, isLoading } = useQuery({
    queryKey: schoolKeys.promotion.promotedStudents(params),
    queryFn: () => EnrollmentsService.getPromotedStudents(params),
  });
  const items = data?.items ?? [];
  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(() => [
    { accessorKey: "admission_no", header: "Admission No" },
    { accessorKey: "student_name", header: "Student Name" },
    { accessorKey: "promoted_from_class", header: "From Class", cell: ({ row }) => row.original.promoted_from_class ?? "-" },
    { accessorKey: "promoted_from_section", header: "From Section", cell: ({ row }) => row.original.promoted_from_section ?? "-" },
    { accessorKey: "roll_number", header: "Roll No", cell: ({ row }) => row.original.roll_number ?? "-" },
    { accessorKey: "enrollment_date", header: "Enrollment Date", cell: ({ row }) => formatDate(String(row.original.enrollment_date ?? "")) },
    { accessorKey: "promoted_at", header: "Promoted At", cell: ({ row }) => formatDate(String(row.original.promoted_at ?? "")) },
  ], []);
  return (
    <DataTable
      data={items}
      columns={columns}
      title="Promoted Students"
      loading={isLoading}
      showSearch={false}
      toolbarLeftContent={
        <div className="w-full sm:flex-1 min-w-0">
          <Input placeholder="Search by admission no or student name..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="h-9 w-full" leftIcon={<SearchIcon className="h-4 w-4 text-muted-foreground" />} />
        </div>
      }
      pagination="server"
      totalCount={data?.total_count ?? 0}
      currentPage={data?.current_page ?? page}
      pageSize={data?.page_size ?? pageSize}
      onPageChange={setPage}
      onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      pageSizeOptions={[10, 25, 50, 100]}
    />
  );
}

function SchoolDroppedOutStudentsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim() || undefined), 500);
    return () => clearTimeout(t);
  }, [searchInput]);
  useEffect(() => setPage(1), [searchQuery]);
  const params = useMemo(() => ({ page, page_size: pageSize, search: searchQuery }), [page, pageSize, searchQuery]);
  const { data, isLoading } = useQuery({
    queryKey: schoolKeys.promotion.droppedOutStudents(params),
    queryFn: () => EnrollmentsService.getDroppedOutStudents(params),
  });
  const items = data?.items ?? [];
  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(() => [
    { accessorKey: "admission_no", header: "Admission No" },
    { accessorKey: "student_name", header: "Student Name" },
    { accessorKey: "last_class_name", header: "Last Class", cell: ({ row }) => row.original.last_class_name ?? "-" },
    { accessorKey: "last_section_name", header: "Last Section", cell: ({ row }) => row.original.last_section_name ?? "-" },
    { accessorKey: "last_roll_number", header: "Roll No", cell: ({ row }) => row.original.last_roll_number ?? "-" },
    { accessorKey: "last_academic_year_name", header: "Academic Year", cell: ({ row }) => row.original.last_academic_year_name ?? "-" },
    { accessorKey: "student_status", header: "Status", cell: ({ row }) => <Badge variant="outline">{String(row.original.student_status ?? "Dropped")}</Badge> },
  ], []);
  return (
    <DataTable
      data={items}
      columns={columns}
      title="Dropped Out Students"
      loading={isLoading}
      showSearch={false}
      toolbarLeftContent={
        <div className="w-full sm:flex-1 min-w-0">
          <Input placeholder="Search by admission no or student name..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="h-9 w-full" leftIcon={<SearchIcon className="h-4 w-4 text-muted-foreground" />} />
        </div>
      }
      pagination="server"
      totalCount={data?.total_count ?? 0}
      currentPage={data?.current_page ?? page}
      pageSize={data?.page_size ?? pageSize}
      onPageChange={setPage}
      onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      pageSizeOptions={[10, 25, 50, 100]}
    />
  );
}

export const PromotionDropoutTab = () => {
  const [subTab, setSubTab] = useState<"eligibility" | "promoted" | "dropped-out">("eligibility");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    const trimmed = searchInput.trim();
    const t = setTimeout(() => {
      setSearchQuery(trimmed === "" ? undefined : trimmed);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: eligibilityData, isLoading, refetch } = useSchoolPromotionEligibility(
    { 
      search: searchQuery ?? undefined,
      page,
      page_size: pageSize
    },
    true
  );
  const { data: classesData } = useSchoolClasses();
  const { data: yearsData } = useAcademicYears();
  
  const promoteMutation = usePromoteSchoolStudents();
  const dropoutMutation = useDropoutSchoolStudent();

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
      data.items,
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
    const eligibleStudents = students.filter(s => s.is_promotable);
    if (eligibleStudents.length === 0) return;

    const payload = {
      next_academic_year_id: Number(nextAcademicYearId),
      require_fees_paid: requireFeesPaid,
      transfer_requests: eligibleStudents.map(s => ({
        enrollment_id: s.enrollment_id,
        transfer_type: "PROMOTION" as const
      }))
    };

  try {
      await promoteMutation.mutateAsync(payload);
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


  const eligibilityContent = (
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
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">Promotion Eligibility</h2>
          <p className="text-sm text-muted-foreground">
            {students.length} students found in current session
          </p>
        </div>

        <Button
          onClick={() => setPromotionConfirmOpen(true)}
          className="gap-2"
        >
          <ArrowUpCircle className="h-4 w-4" />
          Promote Students
        </Button>
      </div>

      <DataTable
        data={students}
        columns={columns}
        loading={isLoading}
        selectable={false}
        getRowId={(row) => row.enrollment_id}
        searchKey="student_name"
        searchPlaceholder="Search by admission no or student name..."
        showSearch={false}
        toolbarLeftContent={
          <div className="w-full sm:flex-1 min-w-0">
            <Input
              placeholder="Search by admission no or student name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 w-full"
              leftIcon={<SearchIcon className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        }
        actions={actions}
        actionsHeader="Actions"
        pagination="server"
        totalCount={eligibilityData?.total_count ?? 0}
        currentPage={eligibilityData?.current_page ?? page}
        pageSize={eligibilityData?.page_size ?? pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Promotion Confirmation Dialog */}
      <Dialog open={promotionConfirmOpen} onOpenChange={setPromotionConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" />
              Promote All Eligible Students?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to promote all eligible students to their next classes? 
              This will update their records for the new academic year.
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

             {/* <div className="flex items-center space-x-2">
               <Checkbox 
                 id="require_fees" 
                 checked={requireFeesPaid} 
                 onCheckedChange={(checked) => setRequireFeesPaid(!!checked)} 
               />
               <Label htmlFor="require_fees" className="text-sm cursor-pointer">
                 Require all pending fees to be paid for promotion
               </Label>
             </div> */}

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
              Are you sure you want to dropout this student?
            </DialogTitle>
            <DialogDescription>
              Marking <strong>{selectedStudentForDropout?.student_name}</strong> as dropped out. 
              This will end their current enrollment.
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

  return (
    <TabSwitcher
      tabs={[
        { value: "eligibility", label: "Promotion Eligibility", icon: FileCheck2, content: eligibilityContent },
        { value: "promoted", label: "Promoted Students", icon: UserCheck, content: <SchoolPromotedStudentsList /> },
        { value: "dropped-out", label: "Dropped Out Students", icon: UserMinus, content: <SchoolDroppedOutStudentsList /> },
      ]}
      activeTab={subTab}
      onTabChange={(v) => setSubTab(v as "eligibility" | "promoted" | "dropped-out")}
      variant="subtab"
      showBadges={false}
    />
  );
};
