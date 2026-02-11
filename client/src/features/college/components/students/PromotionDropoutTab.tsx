import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowUpCircle, 
  FileCheck2,
  AlertTriangle,
  Info,
  UserMinus,
  Search as SearchIcon,
  UserCheck
} from "lucide-react";
import { 
  useCollegePromotionEligibility, 
  usePromoteCollegeStudents, 
  useDropoutCollegeStudent,
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
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { DatePicker } from "@/common/components/ui/date-picker";
import { Alert, AlertDescription, AlertTitle } from "@/common/components/ui/alert";
import { Input } from "@/common/components/ui/input";
import { TabSwitcher } from "@/common/components/shared";
import { collegeKeys } from "@/features/college/hooks/query-keys";
import { CollegeEnrollmentsService } from "@/features/college/services/enrollments.service";
import type { ColumnDef } from "@tanstack/react-table";
import type { CollegePromotionEligibility } from "@/features/college/types";
import { ActionConfig } from '@/common/components/shared/DataTable/types';
import { DataTable } from '@/common/components/shared/DataTable';

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  if (typeof dateString !== "string") return "-";
  if (dateString.includes("T")) return dateString.split("T")[0];
  return dateString;
};

function CollegePromotedStudentsList() {
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
    queryKey: collegeKeys.promotion.promotedStudents(params),
    queryFn: () => CollegeEnrollmentsService.getPromotedStudents(params),
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

function CollegeDroppedOutStudentsList() {
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
    queryKey: collegeKeys.promotion.droppedOutStudents(params),
    queryFn: () => CollegeEnrollmentsService.getDroppedOutStudents(params),
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

  const { data: eligibilityData, isLoading, refetch } = useCollegePromotionEligibility(
    { 
      search: searchQuery ?? undefined,
      page,
      pageSize: pageSize
    },
    true
  );
  const { data: yearsData } = useAcademicYears();
  
  const promoteMutation = usePromoteCollegeStudents();
  const dropoutMutation = useDropoutCollegeStudent();

  const [dropoutModalOpen, setDropoutModalOpen] = useState(false);
  const [selectedStudentForDropout, setSelectedStudentForDropout] = useState<CollegePromotionEligibility | null>(null);
  const [dropoutReason, setDropoutReason] = useState("");
  const [dropoutDate, setDropoutDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [promotionConfirmOpen, setPromotionConfirmOpen] = useState(false);
  const [nextAcademicYearId, setNextAcademicYearId] = useState<number | "">("");
  const [requireFeesPaid, setRequireFeesPaid] = useState(true);

  const students = useMemo(() => {
    if (!eligibilityData) return [];
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

  const columns: ColumnDef<CollegePromotionEligibility>[] = useMemo(() => [
    {
      accessorKey: "admission_no",
      header: "Admission No",
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
      cell: ({ row }) => <span className="font-semibold text-slate-900">{row.original.student_name}</span>
    },
    {
      accessorKey: "current_class_name",
      header: "Current Level",
      cell: ({ row }) => <Badge variant="outline" className="font-medium">{row.original.current_class_name}</Badge>
    },
    {
      accessorKey: "next_class_name",
      header: "Next Level",
      cell: ({ row }) => <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-medium">{row.original.next_class_name}</Badge>
    },
    {
      accessorKey: "group_name",
      header: "Group",
      cell: ({ row }) => <span className="text-slate-600 text-sm">{row.original.group_name}</span>
    },
    {
      accessorKey: "course_name",
      header: "Course",
      cell: ({ row }) => <span className="text-slate-500 text-sm italic">{row.original.course_name || "N/A"}</span>
    },
    {
      accessorKey: "is_promotable",
      header: "Eligibility",
      cell: ({ row }) => {
        const isPromotable = row.original.is_promotable;
        const pendingFees = row.original.pending_fee_types;
        
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={isPromotable ? "success" : "destructive"} className="w-fit shadow-none">
              {isPromotable ? "Eligible" : "Not Eligible"}
            </Badge>
            {!isPromotable && pendingFees && (
              <span className="text-[10px] text-destructive font-medium bg-red-50/50 px-2 py-0.5 rounded border border-red-100/50 italic">
                Pending: {pendingFees}
              </span>
            )}
          </div>
        );
      }
    },
  ], []);

  const actions: ActionConfig<CollegePromotionEligibility>[] = useMemo(() => [
    {
      id: "dropout",
      label: "Dropout",
      icon: UserMinus,
      onClick: (row) => {
        setSelectedStudentForDropout(row);
        setDropoutModalOpen(true);
      },
      variant: 'destructive',
    }
  ], []);


  const eligibilityContent = (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200 shadow-sm border-l-4">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 font-bold">Promotion Policy</AlertTitle>
        <AlertDescription className="text-blue-700">
          Regular promotion moves students to the next academic level. 
          Students with pending fees are marked as ineligible for batch promotion.
        </AlertDescription>
      </Alert>

      <DataTable
        data={students}
        columns={columns}
        actions={actions}
        loading={isLoading}
        title="Level Promotion Eligibility"
        searchKey="student_name"
        searchPlaceholder="Search by admission no or student name..."
        showSearch={false}
        selectable={false}
        getRowId={(row) => row.enrollment_id}
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
        toolbarRightContent={
          <Button
            onClick={() => setPromotionConfirmOpen(true)}
            size="sm"
            className="gap-2"
          >
            <ArrowUpCircle className="h-4 w-4" />
            Promote Students
          </Button>
        }
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
              Are you sure you want to promote all eligible college students to the next level?
              This will update their records for the new academic year.
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
 
             <Alert variant="destructive" className="bg-amber-50 border-amber-200">
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
              <Label htmlFor="dropout-date-college">Dropout Date</Label>
              <DatePicker 
                id="dropout-date-college"
                value={dropoutDate} 
                onChange={setDropoutDate} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropout-reason-college">Reason for Dropout</Label>
              <Textarea 
                id="dropout-reason-college"
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
        { value: "promoted", label: "Promoted Students", icon: UserCheck, content: <CollegePromotedStudentsList /> },
        { value: "dropped-out", label: "Dropped Out Students", icon: UserMinus, content: <CollegeDroppedOutStudentsList /> },
      ]}
      activeTab={subTab}
      onTabChange={(v) => setSubTab(v as "eligibility" | "promoted" | "dropped-out")}
      variant="subtab"
      showBadges={false}
    />
  );
};
