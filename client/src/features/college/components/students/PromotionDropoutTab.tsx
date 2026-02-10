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
  const [pageSize, setPageSize] = useState(25);
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
      pageSizeOptions={[25, 50, 100]}
    />
  );
}

function CollegeDroppedOutStudentsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
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
      pageSizeOptions={[25, 50, 100]}
    />
  );
}

export const PromotionDropoutTab = () => {
  const [subTab, setSubTab] = useState<"eligibility" | "promoted" | "dropped-out">("eligibility");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    const trimmed = searchInput.trim();
    const t = setTimeout(() => setSearchQuery(trimmed === "" ? undefined : trimmed), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: eligibilityData, isLoading, refetch } = useCollegePromotionEligibility(
    { search: searchQuery ?? undefined },
    true
  );
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

  const students = useMemo(() => {
    if (!eligibilityData) return [];
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

  const handleSelectionChange = useCallback((rows: CollegePromotionEligibility[]) => {
    setSelectedEnrollments(rows.map(r => r.enrollment_id));
  }, []);

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
        selectable={true}
        getRowId={(row) => row.enrollment_id}
        onSelectionChange={handleSelectionChange}
        className="border shadow-sm rounded-xl overflow-hidden"
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
            disabled={selectedEnrollments.length === 0}
            onClick={() => setPromotionConfirmOpen(true)}
            size="sm"
            className="gap-2 shadow-sm font-semibold transition-all hover:scale-105"
          >
            <ArrowUpCircle className="h-4 w-4" />
            Promote ({selectedEnrollments.length})
          </Button>
        }
      />

      {/* Promotion Confirmation Dialog */}
      <Dialog open={promotionConfirmOpen} onOpenChange={setPromotionConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900 tracking-tight">
              <FileCheck2 className="h-6 w-6 text-blue-600" />
              Confirm Batch Promotion
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-base">
              You are about to promote <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{selectedEnrollments.length}</span> college students to the next level.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
             <div className="space-y-2">
               <Label htmlFor="next-year-college" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                 Target Academic Year
                 <span className="text-destructive">*</span>
               </Label>
               <Select 
                 value={String(nextAcademicYearId)} 
                 onValueChange={(val) => setNextAcademicYearId(Number(val))}
               >
                 <SelectTrigger id="next-year-college" className="h-12 text-base transition-all focus:ring-2 focus:ring-blue-100 rounded-xl">
                   <SelectValue placeholder="Select target academic year..." />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl shadow-xl border-slate-100">
                   {yearsData?.map((year) => (
                     <SelectItem key={year.academic_year_id} value={String(year.academic_year_id)} className="py-2.5">
                       {year.year_name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-slate-100/50">
               <Checkbox 
                 id="require_fees" 
                 checked={requireFeesPaid} 
                 onCheckedChange={(checked) => setRequireFeesPaid(!!checked)} 
                 className="h-5 w-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-md"
               />
               <Label htmlFor="require_fees" className="text-sm font-medium cursor-pointer text-slate-600 select-none">
                 Require all pending fees to be paid for promotion
               </Label>
             </div>

             <Alert variant="destructive" className="bg-amber-50 border-amber-200 border-l-4 rounded-xl">
               <AlertTriangle className="h-4 w-4 text-amber-600" />
               <AlertDescription className="text-amber-800 font-semibold">
                 Important: This action is irreversible once processed. Ensure all student selections are correct.
               </AlertDescription>
             </Alert>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setPromotionConfirmOpen(false)} className="flex-1 sm:flex-none h-12 rounded-xl text-base font-semibold">
              Cancel
            </Button>
            <Button 
              onClick={handlePromote} 
              loading={promoteMutation.isPending}
              disabled={!nextAcademicYearId}
              className="flex-1 sm:flex-none h-12 rounded-xl text-base font-bold shadow-lg shadow-blue-200 transition-all hover:shadow-xl active:scale-95"
            >
              Confirm Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dropout Modal */}
      <Dialog open={dropoutModalOpen} onOpenChange={setDropoutModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 text-2xl font-bold tracking-tight">
              <UserMinus className="h-6 w-6" />
              Student Dropout
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-base">
              Marking <span className="font-bold text-slate-900 bg-red-50 text-red-700 px-1.5 py-0.5 rounded">{selectedStudentForDropout?.student_name}</span> as dropped out from the institution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Dropout Date</Label>
              <DatePicker 
                value={dropoutDate} 
                onChange={setDropoutDate} 
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Reason for Dropout</Label>
              <Textarea 
                placeholder="Enter detailed reason for dropout..." 
                value={dropoutReason}
                onChange={(e) => setDropoutReason(e.target.value)}
                className="min-h-[120px] rounded-xl text-base p-4 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setDropoutModalOpen(false)} className="flex-1 sm:flex-none h-12 rounded-xl text-base font-semibold transition-all">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDropout}
              loading={dropoutMutation.isPending}
              disabled={!dropoutReason.trim()}
              className="flex-1 sm:flex-none h-12 rounded-xl text-base font-bold shadow-lg shadow-red-200 transition-all hover:shadow-xl active:scale-95"
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
