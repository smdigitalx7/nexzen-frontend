import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { Info } from 'lucide-react';
import { SchoolClassDropdown, SchoolSectionDropdown } from '@/common/components/shared/Dropdowns';
import { useSchoolEnrollmentsForSectionAssignment, useAssignSectionsToEnrollments } from '@/features/school/hooks';
import { useSchoolSections } from '@/features/school/hooks/use-school-dropdowns';
import { Checkbox } from '@/common/components/ui/checkbox';
import { Button } from '@/common/components/ui/button';
import { useToast } from '@/common/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/common/components/shared';
import type { ColumnDef } from "@tanstack/react-table";
import type { SchoolEnrollmentForSectionAssignment, AssignSectionsRequest } from '@/features/school/types';

const SectionMappingTab = () => {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading, isError, error, refetch } = useSchoolEnrollmentsForSectionAssignment(selectedClassId);
  const { data: sectionsData } = useSchoolSections(selectedClassId || 0);
  const assignSectionsMutation = useAssignSectionsToEnrollments();

  // Handle selection change from DataTable
  const onSelectionChange = useCallback((rows: SchoolEnrollmentForSectionAssignment[]) => {
    setSelectedEnrollments(new Set(rows.map(r => r.enrollment_id)));
  }, []);

  // Define columns
  const columns: ColumnDef<SchoolEnrollmentForSectionAssignment>[] = useMemo(() => [
    { accessorKey: "alphabetical_order", header: "Alphabetical Order" },
    { accessorKey: "admission_no", header: "Admission No" },
    { accessorKey: "student_name", header: "Student Name" },
    { 
      accessorKey: "current_section_name", 
      header: "Current Section", 
      cell: ({ row }) => row.original.current_section_name || 'Not assigned' 
    },
    { 
      accessorKey: "current_roll_number", 
      header: "Current Roll Number", 
      cell: ({ row }) => row.original.current_roll_number || '-' 
    },
  ], []);
  


  // Get selected enrollments with their data, sorted by alphabetical order
  const selectedEnrollmentsData = useMemo(() => {
    return enrollments
      .filter((e) => selectedEnrollments.has(e.enrollment_id))
      .sort((a, b) => a.alphabetical_order - b.alphabetical_order);
  }, [enrollments, selectedEnrollments]);

  // Handle section assignment
  const handleAssignSections = async () => {
    if (!selectedClassId) {
      toast({
        title: 'Error',
        description: 'Please select a class first.',
        variant: 'destructive',
      });
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
      const enrollmentIds = selectedEnrollmentsData.map((e) => e.enrollment_id);

      const payload: AssignSectionsRequest = {
        class_id: selectedClassId,
        section_groups: [
          {
            section_id: selectedSectionId,
            enrollment_ids: enrollmentIds,
          },
        ],
      };

      await assignSectionsMutation.mutateAsync(payload);
      
      // Clear selection and refresh data
      setSelectedEnrollments(new Set());
      // Reset section selection to allow selecting a different section
      setSelectedSectionId(null);
      
      // Wait a bit for cache invalidation to complete, then refetch
      await new Promise(resolve => setTimeout(resolve, 100));
      await refetch();
      
      // Also refetch sections dropdown to ensure it's up to date
      if (selectedClassId) {
        queryClient.invalidateQueries({
          queryKey: ["school-dropdowns", "sections", selectedClassId]
        });
      }
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Section Mapping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Class and Section Selection */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-[200px]">
              <SchoolClassDropdown
                value={selectedClassId}
                onChange={(value) => {
                  setSelectedClassId(value);
                  setSelectedSectionId(null); // Reset section when class changes
                  setSelectedEnrollments(new Set()); // Clear selection when class changes
                }}
                placeholder="Select class"
                required={true}
                emptyValue={true}
                emptyValueLabel="Select class"
              />
            </div>
            {selectedClassId && (
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
            )}
            {selectedClassId && (
              <div className="text-sm text-muted-foreground">
                {enrollments.length} student{enrollments.length !== 1 ? 's' : ''} found
                {selectedEnrollments.size > 0 && ` • ${selectedEnrollments.size} selected`}
              </div>
            )}
            {selectedEnrollments.size > 0 && selectedSectionId && (
              <Button
                onClick={handleAssignSections}
                disabled={assignSectionsMutation.isPending}
                className="ml-auto"
              >
                {assignSectionsMutation.isPending ? 'Assigning...' : `Assign ${selectedEnrollments.size} Student${selectedEnrollments.size !== 1 ? 's' : ''} to Section`}
              </Button>
            )}
          </div>

          {/* Students Table */}
          {!selectedClassId ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Please select a class to view students for section assignment.
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading students...</div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load students. Please try again.'}
              </AlertDescription>
            </Alert>
          ) : enrollments.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No students found for this class.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg">
              <DataTable
                data={enrollments}
                columns={columns}
                selectable={true}
                onSelectionChange={onSelectionChange}
                searchKey="student_name"
                searchPlaceholder="Search students..."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionMappingTab;
