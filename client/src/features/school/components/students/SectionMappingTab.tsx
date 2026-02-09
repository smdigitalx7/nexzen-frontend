import { useState, useMemo, useCallback } from 'react';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { Info, Hash, LayoutGrid } from 'lucide-react';
import { SchoolClassDropdown, SchoolSectionDropdown } from '@/common/components/shared/Dropdowns';
import {
  useSchoolEnrollmentsForSectionAssignment,
  useAssignSectionsToEnrollments,
  useGenerateRollNumbers,
} from '@/features/school/hooks';
import { useSchoolSections } from '@/features/school/hooks/use-school-dropdowns';
import { Button } from '@/common/components/ui/button';
import { useToast } from '@/common/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/common/components/shared';
import type { ActionConfig } from '@/common/components/shared/DataTable/types';
import type { ColumnDef } from '@tanstack/react-table';
import type { SchoolEnrollmentForSectionAssignment, AssignSectionsRequest } from '@/features/school/types';
import { ChangeSectionDialog } from './enrollments/ChangeSectionDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/common/components/ui/alert-dialog';

const SectionMappingTab = () => {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<number>>(new Set());
  const [changeSectionRow, setChangeSectionRow] = useState<SchoolEnrollmentForSectionAssignment | null>(null);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading, isError, error, refetch } =
    useSchoolEnrollmentsForSectionAssignment(selectedClassId);
  const { data: sectionsData } = useSchoolSections(selectedClassId ?? 0);
  const sections = sectionsData?.items ?? [];
  const assignSectionsMutation = useAssignSectionsToEnrollments();
  const generateRollNumbersMutation = useGenerateRollNumbers();

  const onSelectionChange = useCallback((rows: SchoolEnrollmentForSectionAssignment[]) => {
    setSelectedEnrollments(new Set(rows.map((r) => r.enrollment_id)));
  }, []);

  const columns: ColumnDef<SchoolEnrollmentForSectionAssignment>[] = useMemo(
    () => [
      { accessorKey: 'alphabetical_order', header: 'Sl.No', cell: ({ row }) => row.original.alphabetical_order },
      { accessorKey: 'admission_no', header: 'Admission No' },
      { accessorKey: 'student_name', header: 'Student Name' },
      {
        accessorKey: 'current_section_name',
        header: 'Current Section',
        cell: ({ row }) => row.original.current_section_name ?? 'Not assigned',
      },
      {
        accessorKey: 'current_roll_number',
        header: 'Current Roll No',
        cell: ({ row }) => row.original.current_roll_number || '-',
      },
    ],
    []
  );

  const selectedEnrollmentsData = useMemo(() => {
    return enrollments
      .filter((e) => selectedEnrollments.has(e.enrollment_id))
      .sort((a, b) => a.alphabetical_order - b.alphabetical_order);
  }, [enrollments, selectedEnrollments]);

  const handleGenerateRollNumbers = useCallback(async () => {
    if (!selectedClassId) return;
    setShowGenerateConfirm(false);
    try {
      await generateRollNumbersMutation.mutateAsync(selectedClassId);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['school-dropdowns', 'sections', selectedClassId] });
    } catch {
      // Error toast handled by mutation / API
    }
  }, [selectedClassId, generateRollNumbersMutation, refetch, queryClient]);

  const handleAssignSections = async () => {
    if (!selectedClassId) {
      toast({ title: 'Error', description: 'Please select a class first.', variant: 'destructive' });
      return;
    }
    if (!selectedSectionId) {
      toast({
        title: 'Error',
        description: 'Please select a section to assign students to.',
        variant: 'destructive',
      });
      return;
    }
    if (selectedEnrollmentsData.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one student to assign.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const payload: AssignSectionsRequest = {
        class_id: selectedClassId,
        section_groups: [{ section_id: selectedSectionId, enrollment_ids: selectedEnrollmentsData.map((e) => e.enrollment_id) }],
      };
      await assignSectionsMutation.mutateAsync(payload);
      setSelectedEnrollments(new Set());
      setSelectedSectionId(null);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['school-dropdowns', 'sections', selectedClassId] });
    } catch {
      // Error toast handled by mutation
    }
  };

  const handleChangeSectionSuccess = useCallback(() => {
    setChangeSectionRow(null);
    refetch();
  }, [refetch]);

  const actions: ActionConfig<SchoolEnrollmentForSectionAssignment>[] = useMemo(
    () => [
      {
        id: 'change-section',
        label: 'Change section',
        icon: LayoutGrid,
        onClick: (row) => setChangeSectionRow(row),
        showLabel: false,
      },
    ],
    []
  );

  const errorMessage =
    error instanceof Error ? error.message : 'Failed to load students. Please try again.';

  const assignButtonLabel =
    selectedEnrollments.size === 1
      ? 'Assign 1 student to section'
      : `Assign ${selectedEnrollments.size} students to section`;

  if (!selectedClassId) {
    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Select a class to manage roll numbers and section assignment.
          </AlertDescription>
        </Alert>
        <div className="w-[280px]">
          <SchoolClassDropdown
            value={null}
            onChange={(value) => setSelectedClassId(value)}
            placeholder="Select class"
            required={false}
            emptyValue={true}
            emptyValueLabel="Select class"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Shared class selector */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-[280px]">
          <SchoolClassDropdown
            value={selectedClassId}
            onChange={(value) => {
              setSelectedClassId(value);
              setSelectedSectionId(null);
              setSelectedEnrollments(new Set());
              setChangeSectionRow(null);
            }}
            placeholder="Select class"
            required={true}
            emptyValue={true}
            emptyValueLabel="Select class"
          />
        </div>
      </div>

      {/* Block 1: Roll numbers */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Roll numbers
        </h3>
        <p className="text-sm text-muted-foreground">
          Re-sequence roll numbers 001, 002, … by student name (alphabetical) for this class.
        </p>
        <Button
          variant="default"
          onClick={() => setShowGenerateConfirm(true)}
          disabled={generateRollNumbersMutation.isPending || enrollments.length === 0}
        >
          {generateRollNumbersMutation.isPending ? 'Generating...' : 'Generate roll numbers'}
        </Button>
      </section>

      {/* Block 2: Section assignment */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          Section assignment
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-[200px]">
            <SchoolSectionDropdown
              classId={selectedClassId}
              value={selectedSectionId}
              onChange={setSelectedSectionId}
              disabled={!selectedClassId}
              placeholder="Select section"
              required={false}
              emptyValue={true}
              emptyValueLabel="Select section"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {enrollments.length} student{enrollments.length === 1 ? '' : 's'} found
            {selectedEnrollments.size > 0 && ` • ${selectedEnrollments.size} selected`}
          </span>
          {selectedEnrollments.size > 0 && selectedSectionId ? (
            <Button
              onClick={handleAssignSections}
              disabled={assignSectionsMutation.isPending}
              className="ml-auto"
            >
              {assignSectionsMutation.isPending ? 'Assigning...' : assignButtonLabel}
            </Button>
          ) : null}
        </div>

        {isLoading && (
          <div className="py-8 text-center text-muted-foreground">Loading students...</div>
        )}
        {!isLoading && isError && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !isError && enrollments.length === 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>No students found for this class.</AlertDescription>
          </Alert>
        )}
        {!isLoading && !isError && enrollments.length > 0 ? (
          <DataTable<SchoolEnrollmentForSectionAssignment>
            data={enrollments}
            columns={columns}
            title="Students for section assignment"
            selectable={true}
            onSelectionChange={onSelectionChange}
            searchKey="student_name"
            searchPlaceholder="Search students..."
            loading={isLoading}
            actions={actions}
            actionsHeader="Actions"
            emptyMessage="No students to show."
          />
        ) : null}
      </section>

      {/* Change section dialog (minimal props from row action) */}
      <ChangeSectionDialog
        open={changeSectionRow != null}
        onOpenChange={(open) => !open && setChangeSectionRow(null)}
        enrollment={null}
        enrollmentId={changeSectionRow?.enrollment_id ?? 0}
        classId={selectedClassId ?? 0}
        currentSectionId={changeSectionRow?.current_section_id ?? null}
        studentName={changeSectionRow?.student_name}
        sections={sections}
        onSuccess={handleChangeSectionSuccess}
      />

      {/* Confirm generate roll numbers */}
      <AlertDialog open={showGenerateConfirm} onOpenChange={setShowGenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate roll numbers?</AlertDialogTitle>
            <AlertDialogDescription>
              This will re-sequence roll numbers 001, 002, … by student name (alphabetical order) for
              this class. Existing roll numbers will be replaced. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleGenerateRollNumbers()}>
              Generate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SectionMappingTab;
