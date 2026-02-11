import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader as AlertHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable } from "@/common/components/shared";
import { ServerCombobox } from "@/common/components/ui/server-combobox";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import {
  useSchoolTestMarksList,
  useSchoolTestMark,
  useCreateSchoolTestMark,
  useDeleteSchoolTestMark,
} from '@/features/school/hooks';
import { SchoolTestMarksService } from '@/features/school/services/test-marks.service';
import { useToast } from '@/common/hooks/use-toast';
import { useSchoolEnrollmentsList } from '@/features/school/hooks/use-school-enrollments';
import { useCreateSchoolTestMarksMultipleSubjects } from '@/features/school/hooks/use-school-test-marks';
import {
  useSchoolSections,
  useSchoolSubjects,
  useSchoolTests,
  useSchoolClasses,
} from '@/features/school/hooks/use-school-dropdowns';
import { useGrades } from "@/features/general/hooks/useGrades";
import type { TestMarkWithDetails, TestMarksQuery, TestGroupAndSubjectResponse } from '@/features/school/types/test-marks';
import type { 
  SchoolEnrollmentWithClassSectionDetails, 
  SchoolEnrollmentRead,
} from '@/features/school/types/enrollments';
import type { SchoolSubjectList } from '@/features/school/types/subjects';
import {
  createStudentColumn,
  createSubjectColumn,
  createMarksColumn,
  createGradeColumn,
  createTestDateColumn,
} from "@/common/utils/factory/columnFactories";
import AddTestMarksByClassDialog from "./AddTestMarksByClassDialog";
import { useQueryClient } from "@tanstack/react-query";
import { schoolKeys } from "@/features/school/hooks/query-keys";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";

// Grade colors mapping
const GRADE_COLORS = {
  "A+": "bg-green-600",
  A: "bg-green-500",
  "B+": "bg-blue-500",
  B: "bg-blue-400",
  "C+": "bg-yellow-500",
  C: "bg-yellow-400",
  D: "bg-orange-500",
  F: "bg-red-500",
} as const;

const testMarkFormSchema = z.object({
  enrollment_id: z.string().min(1, "Student is required"),
  test_id: z.string().min(1, "Test is required"),
  subject_id: z.string().min(1, "Subject is required"),
  marks_obtained: z.string().min(1, "Marks obtained is required"),
  remarks: z.string().optional(),
});

const multipleTestSubjectsFormSchema = z.object({
  enrollment_id: z.string().min(1, "Student is required"),
  test_id: z.string().min(1, "Test is required"),
  subjects: z.array(z.object({
    subject_id: z.string().min(1, "Subject is required"),
    marks_obtained: z.string().min(1, "Marks obtained is required"),
    remarks: z.string().optional(),
  })).min(1, "At least one subject is required"),
});

interface TestMarksManagementProps {
  onDataChange?: (data: TestMarkWithDetails[]) => void;
  selectedClass?: number | null;
  setSelectedClass?: (value: number | null) => void;
  selectedSection?: number | null;
  setSelectedSection?: (value: number | null) => void;
  selectedSubject?: number | null;
  setSelectedSubject?: (value: number | null) => void;
  selectedGrade?: string;
  setSelectedGrade?: (value: string) => void;
  selectedTest?: number | null;
  setSelectedTest?: (value: number | null) => void;
}

const TestMarksManagementComponent = ({
  onDataChange,
  selectedClass: propSelectedClass,
  setSelectedClass: propSetSelectedClass,
  selectedSection: propSelectedSection,
  setSelectedSection: propSetSelectedSection,
  selectedSubject: propSelectedSubject,
  setSelectedSubject: propSetSelectedSubject,
  selectedGrade: propSelectedGrade,
  setSelectedGrade: propSetSelectedGrade,
  selectedTest: propSelectedTest,
  setSelectedTest: propSetSelectedTest,
}: TestMarksManagementProps) => {
  // Use props if provided, otherwise use local state (for backward compatibility)
  const [localSelectedClass, setLocalSelectedClass] = useState<number | null>(null);
  const [localSelectedSection, setLocalSelectedSection] = useState<number | null>(null);
  const [localSelectedSubject, setLocalSelectedSubject] = useState<number | null>(null);
  const [localSelectedGrade, setLocalSelectedGrade] = useState("all");
  const [localSelectedTest, setLocalSelectedTest] = useState<number | null>(null);

  const selectedClass = propSelectedClass ?? localSelectedClass;
  const setSelectedClass = propSetSelectedClass ?? setLocalSelectedClass;
  const selectedSection = propSelectedSection ?? localSelectedSection;
  const setSelectedSection = propSetSelectedSection ?? setLocalSelectedSection;
  const selectedSubject = propSelectedSubject ?? localSelectedSubject;
  const setSelectedSubject = propSetSelectedSubject ?? setLocalSelectedSubject;
  const selectedGrade = propSelectedGrade ?? localSelectedGrade;
  const setSelectedGrade = propSetSelectedGrade ?? setLocalSelectedGrade;
  const selectedTest = propSelectedTest ?? localSelectedTest;
  const setSelectedTest = propSetSelectedTest ?? setLocalSelectedTest;

  // Dialog states
  const [showTestMarkDialog, setShowTestMarkDialog] = useState(false);
  const [editingTestMark, setEditingTestMark] =
    useState<TestMarkWithDetails | null>(null);
  const [showViewTestMarkDialog, setShowViewTestMarkDialog] = useState(false);
  const [viewingTestMarkId, setViewingTestMarkId] = useState<number | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [activeTab, setActiveTab] = useState('single');
  const [showAddTestMarksDialog, setShowAddTestMarksDialog] = useState(false);

  // Memoized class ID for API calls
  const classId = useMemo(
    () => selectedClass || 0,
    [selectedClass]
  );

  // Get dropdown data
  const { data: classesData, isLoading: classesLoading } = useSchoolClasses();
  const { data: sectionsData, isLoading: sectionsLoading } = useSchoolSections(classId);
  const { data: subjectsData, isLoading: subjectsLoading } = useSchoolSubjects(classId);
  const { data: testsData, isLoading: testsLoading } = useSchoolTests();
  const { grades } = useGrades();
  
  // Get enrollments filtered by class and section
  const enrollmentsParams = useMemo(() => {
    if (!selectedClass) return undefined;
    return {
      class_id: selectedClass,
      section_id: selectedSection || undefined,
      page: 1,
      page_size: 50,
    };
  }, [selectedClass, selectedSection]);

  const { data: enrollmentsData } = useSchoolEnrollmentsList(enrollmentsParams);
  
  // Flat enrollments list from API
  const enrollments = useMemo(() => {
    const list = enrollmentsData?.enrollments ?? [];
    if (!Array.isArray(list) || list.length === 0) return [];
    return list.map((e) => ({
      ...e,
      class_name: e.class_name ?? '',
    }));
  }, [enrollmentsData]);

  // Reset dependent filters when class changes
  useEffect(() => {
    setSelectedSection(null);
    setSelectedSubject(null);
    setSelectedTest(null);
    setPage(1);
  }, [selectedClass, setSelectedSection, setSelectedSubject, setSelectedTest]);

  // Single test mark view data
  const viewQuery = useSchoolTestMark(viewingTestMarkId || 0);
  const viewedTestMark = viewingTestMarkId ? viewQuery.data : null;
  const viewTestLoading = viewingTestMarkId ? viewQuery.isLoading : false;
  const viewTestError = viewingTestMarkId ? viewQuery.error : null;

  const testMarksQuery = useMemo(() => {
    if (!selectedClass || !selectedSubject || !selectedTest) {
      return undefined;
    }

    const query: TestMarksQuery = {
      class_id: selectedClass as number,
      subject_id: selectedSubject as number,
      test_id: selectedTest as number,
      page,
      page_size: pageSize,
    };

    return query;
  }, [selectedClass, selectedSubject, selectedTest, page, pageSize]);

  const hasRequiredFilters = Boolean(
    selectedClass && selectedClass > 0 &&
    selectedSubject && selectedSubject > 0 &&
    selectedTest && selectedTest > 0
  );

  const {
    data: testMarksData,
    isLoading: testMarksLoading,
  } = useSchoolTestMarksList(testMarksQuery);

  const createTestMarkMutation = useCreateSchoolTestMark();
  const deleteTestMarkMutation = useDeleteSchoolTestMark();
  const createMultipleSubjectsMutation = useCreateSchoolTestMarksMultipleSubjects();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Single subject form
  const testMarkForm = useForm({
    resolver: zodResolver(testMarkFormSchema),
    defaultValues: {
      enrollment_id: "",
      test_id: "",
      subject_id: "",
      marks_obtained: "",
      remarks: "",
    },
  });

  // Multiple subjects form
  const multipleTestSubjectsForm = useForm({
    resolver: zodResolver(multipleTestSubjectsFormSchema),
    defaultValues: {
      enrollment_id: "",
      test_id: "",
      subjects: [{ subject_id: "", marks_obtained: "", remarks: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: multipleTestSubjectsForm.control,
    name: 'subjects',
  });

  // Handlers
  const handleClassChange = useCallback((value: string) => {
    setSelectedClass(value ? Number(value) : null);
  }, [setSelectedClass]);

  const handleSectionChange = useCallback((value: string) => {
    setSelectedSection(value ? Number(value) : null);
  }, [setSelectedSection]);

  const handleSubjectChange = useCallback((value: string) => {
    setSelectedSubject(value ? Number(value) : null);
  }, [setSelectedSubject]);

  const handleTestChange = useCallback((value: string) => {
    setSelectedTest(value ? Number(value) : null);
  }, [setSelectedTest]);

  // Single subject form submission handler
  const handleTestMarkSubmit = useCallback(
    async (values: z.infer<typeof testMarkFormSchema>) => {
      const markData = {
        enrollment_id: parseInt(values.enrollment_id),
        test_id: parseInt(values.test_id),
        subject_id: parseInt(values.subject_id),
        marks_obtained: parseFloat(values.marks_obtained),
        remarks: values.remarks || "",
      };

      if (editingTestMark?.test_mark_id) {
        // For update we follow backend spec: only send marks_obtained and remarks
        try {
          await SchoolTestMarksService.update(editingTestMark.test_mark_id, {
            marks_obtained: markData.marks_obtained,
            remarks: markData.remarks,
          });
          toast({
            title: "Success",
            description: "Test mark updated successfully",
            variant: "success",
          });
          testMarkForm.reset();
          setEditingTestMark(null);
          setShowTestMarkDialog(false);
          void queryClient.invalidateQueries({
            queryKey: schoolKeys.testMarks.root(),
          });
          void queryClient.refetchQueries({
            queryKey: schoolKeys.testMarks.root(),
            type: "active",
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.detail || error?.message || "Failed to update test mark";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        createTestMarkMutation.mutate(markData, {
          onSuccess: () => {
            testMarkForm.reset();
            setEditingTestMark(null);
            setShowTestMarkDialog(false);
          }
        });
      }
    },
    [
      editingTestMark,
      createTestMarkMutation,
      testMarkForm,
      queryClient,
      toast,
    ]
  );

  // Multiple subjects form submission handler
  const handleMultipleTestSubjectsSubmit = useCallback(async (values: z.infer<typeof multipleTestSubjectsFormSchema>) => {
    const selectedEnrollment = enrollments.find((e) => e.enrollment_id?.toString() === values.enrollment_id);
    const subjects = subjectsData?.items || [];
    
    const payload = {
      enrollment_id: parseInt(values.enrollment_id),
      test_id: parseInt(values.test_id),
      subjects: values.subjects.map((subj) => ({
        subject_id: parseInt(subj.subject_id),
        marks_obtained: parseFloat(subj.marks_obtained),
        remarks: subj.remarks || null,
        subject_name: subjects.find((s: SchoolSubjectList) => s.subject_id === parseInt(subj.subject_id))?.subject_name || null,
      })),
      student_name: selectedEnrollment?.student_name || null,
      test_name: null, // Can be fetched if needed
    };

    try {
      await createMultipleSubjectsMutation.mutateAsync(payload);
      multipleTestSubjectsForm.reset();
      setShowTestMarkDialog(false);
    } catch (error) {
      // Error is handled by mutation hook
    }
  }, [enrollments, subjectsData, createMultipleSubjectsMutation, multipleTestSubjectsForm]);

  const handleEditTestMark = useCallback(
    (mark: TestMarkWithDetails) => {
      setActiveTab('single');
      setEditingTestMark(mark);
      testMarkForm.reset({
        enrollment_id: mark.enrollment_id.toString(),
        test_id: mark.test_id?.toString() || "",
        subject_id: mark.subject_id?.toString() || "",
        marks_obtained: mark.marks_obtained?.toString() || "0",
        remarks: mark.remarks || "",
      });
      setShowTestMarkDialog(true);
    },
    [testMarkForm]
  );

  const handleDeleteTestMark = useCallback((markId: number) => {
    setConfirmDeleteId(markId);
  }, []);

  const handleViewTestMark = useCallback((markId: number) => {
    setViewingTestMarkId(markId);
    setShowViewTestMarkDialog(true);
  }, []);

  const closeTestMarkDialog = useCallback(() => {
    setActiveTab('single');
    testMarkForm.reset();
    multipleTestSubjectsForm.reset({
      enrollment_id: "",
      test_id: "",
      subjects: [{ subject_id: "", marks_obtained: "", remarks: "" }],
    });
    setEditingTestMark(null);
    setShowTestMarkDialog(false);
  }, [testMarkForm, multipleTestSubjectsForm]);

  const addSubjectRow = useCallback(() => {
    append({ subject_id: "", marks_obtained: "", remarks: "" });
  }, [append]);

  const confirmDelete = useCallback(() => {
    if (confirmDeleteId) {
      deleteTestMarkMutation.mutate(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, deleteTestMarkMutation]);

  // Process and filter data
  const flattenedMarks = useMemo(() => {
    const raw = testMarksData as { data?: TestGroupAndSubjectResponse[]; total_count?: number } | TestGroupAndSubjectResponse[] | undefined;
    
    // Ensure we have an array - handle different response structures
    let dataArray: any[] = [];
    if (Array.isArray(raw)) {
      dataArray = raw;
    } else if (raw && typeof raw === 'object') {
      if (Array.isArray(raw.data)) {
        dataArray = raw.data;
      }
    }
    
    const items: TestMarkWithDetails[] = [];
    dataArray.forEach((group) => {
      if (group && group.students) {
        if (Array.isArray(group.students)) {
          group.students.forEach((student: any) => {
            items.push({
              ...student,
              test_name: group.test_name,
              subject_name: group.subject_name,
              test_date: group.conducted_at,
              test_id: group.test_id,
              subject_id: group.subject_id,
            });
          });
        }
      }
    });
    return items;
  }, [testMarksData]);

  const totalCount = useMemo(() => {
    const raw = testMarksData as { data?: unknown[]; total_count?: number } | TestGroupAndSubjectResponse[] | undefined;
    if (Array.isArray(raw)) return raw.length;
    return raw?.total_count ?? 0;
  }, [testMarksData]);

  // Client-side filtering
  const filteredMarks = useMemo(() => {
    let filtered = flattenedMarks;
    if (selectedGrade !== "all") {
      filtered = filtered.filter((mark) => mark.grade === selectedGrade);
    }
    return filtered;
  }, [flattenedMarks, selectedGrade]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(flattenedMarks);
    }
  }, [flattenedMarks, onDataChange]);

  // Columns & Actions
  const columns: ColumnDef<TestMarkWithDetails>[] = useMemo(
    () => [
      createStudentColumn<TestMarkWithDetails>(
        "student_name",
        "roll_number",
        "section_name",
        { header: "Student" }
      ),
      createSubjectColumn<TestMarkWithDetails>("subject_name", "test_name", {
        header: "Subject",
      }),
      createMarksColumn<TestMarkWithDetails>(
        "marks_obtained",
        "max_marks",
        "percentage",
        { header: "Marks" }
      ),
      createGradeColumn<TestMarkWithDetails>("grade", GRADE_COLORS, {
        header: "Grade",
      }),
      createTestDateColumn<TestMarkWithDetails>("conducted_at", {
        header: "Test Date",
      }),
    ],
    []
  );

  const actions: ActionConfig<TestMarkWithDetails>[] = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: (row) => handleViewTestMark(row.test_mark_id),
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: (row) => handleEditTestMark(row),
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onClick: (row) => handleDeleteTestMark(row.test_mark_id),
    }
  ], [handleViewTestMark, handleEditTestMark, handleDeleteTestMark]);

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 space-y-4">
        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border shadow-sm space-y-4"
        >
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-4 items-end flex-1">
              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-1.5 block">
                  Class <span className="text-red-500">*</span>
                </label>
                <ServerCombobox
                  items={classesData?.items || []}
                  value={selectedClass?.toString() || ""}
                  onSelect={handleClassChange}
                  valueKey="class_id"
                  labelKey="class_name"
                  placeholder="Select Class"
                  searchPlaceholder="Search classes..."
                  isLoading={classesLoading}
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-1.5 block">
                  Section
                </label>
                <ServerCombobox
                  items={sectionsData?.items || []}
                  value={selectedSection?.toString() || ""}
                  onSelect={handleSectionChange}
                  valueKey="section_id"
                  labelKey="section_name"
                  placeholder="Select Section"
                  searchPlaceholder="Search sections..."
                  isLoading={sectionsLoading}
                  disabled={!selectedClass}
                  emptyText={!selectedClass ? "Select a class first" : "No sections found"}
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-1.5 block">
                  Test <span className="text-red-500">*</span>
                </label>
                <ServerCombobox
                  items={testsData?.items || []}
                  value={selectedTest?.toString() || ""}
                  onSelect={handleTestChange}
                  valueKey="test_id"
                  labelKey="test_name"
                  placeholder="Select Test"
                  searchPlaceholder="Search tests..."
                  isLoading={testsLoading}
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-1.5 block">
                  Subject <span className="text-red-500">*</span>
                </label>
                <ServerCombobox
                  items={subjectsData?.items || []}
                  value={selectedSubject?.toString() || ""}
                  onSelect={handleSubjectChange}
                  valueKey="subject_id"
                  labelKey="subject_name"
                  placeholder="Select Subject"
                  searchPlaceholder="Search subjects..."
                  isLoading={subjectsLoading}
                  disabled={!selectedClass}
                  emptyText={!selectedClass ? "Select a class first" : "No subjects found"}
                />
              </div>
              
              <div className="w-full sm:w-32">
                 <label className="text-sm font-medium mb-1.5 block">
                   Grade
                 </label>
                 <Select
                   value={selectedGrade}
                   onValueChange={setSelectedGrade}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="All" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Grades</SelectItem>
                     {grades.map((g) => (
                       <SelectItem key={g.grade} value={g.grade}>{g.grade}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
            </div>

            <div className="flex items-end gap-2">
               <Button
                 onClick={() => setShowTestMarkDialog(true)}
                 className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
               >
                 <Plus className="h-4 w-4" />
                 Add Single
               </Button>
               <Button
                 onClick={() => setShowAddTestMarksDialog(true)}
                 variant="outline"
                 className="gap-2 w-full sm:w-auto"
               >
                 <Plus className="h-4 w-4" />
                 Bulk Add
               </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters Alert */}
        {!hasRequiredFilters && (
          <Alert>
            <AlertDescription>
              Please select <strong>Class</strong>, <strong>Test</strong>, and <strong>Subject</strong> to view marks.
            </AlertDescription>
          </Alert>
        )}

        {/* Data Table */}
        {hasRequiredFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <DataTable
              data={filteredMarks}
              columns={columns}
              title="Test Marks"
              loading={testMarksLoading}
              actions={actions}
              actionsHeader="Actions"
              showSearch={true}
              searchPlaceholder="Search by student name..."
              searchKey="student_name"
              pagination="server"
              totalCount={totalCount}
              currentPage={page}
              pageSize={pageSize}
              pageSizeOptions={[10, 25, 50, 100]}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          </motion.div>
          </motion.div>
        )}

        {/* Dialogs */}
        <Dialog open={showTestMarkDialog} onOpenChange={(open) => !open && closeTestMarkDialog()}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>
                {editingTestMark ? "Edit Test Mark" : "Add New Test Mark"}
              </DialogTitle>
            </DialogHeader>
            {!editingTestMark ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Subject</TabsTrigger>
                  <TabsTrigger value="multiple">Multiple Subjects</TabsTrigger>
                </TabsList>
                
                <TabsContent value="single" className="mt-4">
                  <Form {...testMarkForm}>
                    <form onSubmit={testMarkForm.handleSubmit(handleTestMarkSubmit)} className="space-y-4">
                      <FormField
                        control={testMarkForm.control}
                        name="enrollment_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent>
                                  {enrollments
                                    .filter((enrollment) => enrollment.enrollment_id != null)
                                    .map((enrollment) => (
                                      <SelectItem
                                        key={enrollment.enrollment_id}
                                        value={enrollment.enrollment_id!.toString()}
                                      >
                                        {enrollment.student_name} {enrollment.roll_number ? `(${enrollment.roll_number})` : ''} - {enrollment.class_name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={testMarkForm.control}
                          name="test_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test</FormLabel>
                              <FormControl>
                                <ServerCombobox
                                   items={testsData?.items || []}
                                   value={field.value}
                                   onSelect={field.onChange}
                                   valueKey="test_id"
                                   labelKey="test_name"
                                   placeholder="Select Test"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={testMarkForm.control}
                          name="subject_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <ServerCombobox
                                   items={subjectsData?.items || []}
                                   value={field.value}
                                   onSelect={field.onChange}
                                   valueKey="subject_id"
                                   labelKey="subject_name"
                                   placeholder="Select Subject"
                                   disabled={classId <= 0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={testMarkForm.control}
                        name="marks_obtained"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marks Obtained</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={testMarkForm.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Additional comments..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={closeTestMarkDialog}
                          disabled={createTestMarkMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createTestMarkMutation.isPending}
                        >
                          {createTestMarkMutation.isPending ? "Saving..." : "Save Mark"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="multiple" className="mt-4">
                  <Form {...multipleTestSubjectsForm}>
                    <form onSubmit={multipleTestSubjectsForm.handleSubmit(handleMultipleTestSubjectsSubmit)} className="space-y-4">
                      <FormField
                        control={multipleTestSubjectsForm.control}
                        name="enrollment_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent>
                                  {enrollments
                                    .filter((enrollment) => enrollment.enrollment_id != null)
                                    .map((enrollment) => (
                                      <SelectItem
                                        key={enrollment.enrollment_id}
                                        value={enrollment.enrollment_id!.toString()}
                                      >
                                        {enrollment.student_name} {enrollment.roll_number ? `(${enrollment.roll_number})` : ''} - {enrollment.class_name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={multipleTestSubjectsForm.control}
                        name="test_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test</FormLabel>
                            <FormControl>
                              <ServerCombobox
                                 items={testsData?.items || []}
                                 value={field.value}
                                 onSelect={field.onChange}
                                 valueKey="test_id"
                                 labelKey="test_name"
                                 placeholder="Select Test"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4 border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">Subject Marks</h4>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addSubjectRow}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Subject
                          </Button>
                        </div>
                        
                        {fields.map((item, index) => (
                          <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-11 grid grid-cols-3 gap-3">
                              <FormField
                                control={multipleTestSubjectsForm.control}
                                name={`subjects.${index}.subject_id`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className={index > 0 ? "sr-only" : ""}>Subject</FormLabel>
                                    <FormControl>
                                      <ServerCombobox
                                         items={subjectsData?.items || []}
                                         value={field.value}
                                         onSelect={field.onChange}
                                         valueKey="subject_id"
                                         labelKey="subject_name"
                                         placeholder="Subject"
                                         disabled={classId <= 0}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multipleTestSubjectsForm.control}
                                name={`subjects.${index}.marks_obtained`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className={index > 0 ? "sr-only" : ""}>Marks</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="Marks" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multipleTestSubjectsForm.control}
                                name={`subjects.${index}.remarks`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className={index > 0 ? "sr-only" : ""}>Remarks</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Remarks" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="col-span-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={closeTestMarkDialog}
                          disabled={createMultipleSubjectsMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMultipleSubjectsMutation.isPending}
                        >
                          {createMultipleSubjectsMutation.isPending ? "Saving..." : "Save All Marks"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            ) : (
              <Form {...testMarkForm}>
                <form onSubmit={testMarkForm.handleSubmit(handleTestMarkSubmit)} className="space-y-4">
                  <div className="bg-muted p-3 rounded-md mb-4 text-sm space-y-1">
                    <p><strong>Student:</strong> {editingTestMark.student_name} ({editingTestMark.roll_number})</p>
                    <p><strong>Test:</strong> {editingTestMark.test_name}</p>
                    <p><strong>Subject:</strong> {editingTestMark.subject_name}</p>
                  </div>
                  
                  <FormField
                    control={testMarkForm.control}
                    name="marks_obtained"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marks Obtained</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={testMarkForm.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Additional comments..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={closeTestMarkDialog}
                      disabled={false}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={false}
                    >
                      Update Mark
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={showViewTestMarkDialog} onOpenChange={setShowViewTestMarkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Mark Details</DialogTitle>
            </DialogHeader>
            {viewTestLoading ? (
              <div className="py-8 flex justify-center">
                <Loader.Container message="Loading test mark..." />
              </div>
            ) : viewTestError ? (
               <Alert variant="destructive">
                  <AlertDescription>Error loading test mark details</AlertDescription>
               </Alert>
            ) : viewedTestMark && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border rounded-lg p-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-semibold">Student</label>
                    <p className="font-medium">{viewedTestMark.student_name}</p>
                    <p className="text-sm text-muted-foreground">Roll: {viewedTestMark.roll_number}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-semibold">Class / Section</label>
                    <p className="font-medium">{(viewedTestMark as any).class_name}</p>
                    <p className="text-sm text-muted-foreground">{viewedTestMark.section_name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-semibold">Test</label>
                    <p className="font-medium">{viewedTestMark.test_name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-semibold">Subject</label>
                    <p className="font-medium">{viewedTestMark.subject_name}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold">Marks</label>
                      <p className="text-xl font-bold">{viewedTestMark.marks_obtained}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold">Percentage</label>
                      <p className="text-xl font-bold">{viewedTestMark.percentage}%</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-semibold">Grade</label>
                      <p className="text-xl font-bold">{viewedTestMark.grade}</p>
                    </div>
                  </div>
                  {viewedTestMark.remarks && (
                    <div className="col-span-2 pt-2 border-t">
                      <label className="text-xs text-muted-foreground uppercase font-semibold">Remarks</label>
                      <p className="text-sm">{viewedTestMark.remarks}</p>
                    </div>
                  )}
                  <div className="col-span-2 pt-2 border-t">
                    <label className="text-xs text-muted-foreground uppercase font-semibold">Conducted At</label>
                    <p className="text-sm font-medium">{viewedTestMark.conducted_at ? new Date(viewedTestMark.conducted_at).toLocaleDateString() : "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!confirmDeleteId}
          onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertHeader>
              <AlertDialogTitle>Delete Test Mark?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this test mark record? This action cannot be undone.
              </AlertDialogDescription>
            </AlertHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Marks By Class Dialog */}
        <AddTestMarksByClassDialog
           isOpen={showAddTestMarksDialog}
           onClose={() => setShowAddTestMarksDialog(false)}
        />
      </div>
    </div>
  );
};

export default TestMarksManagementComponent;
