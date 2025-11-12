import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { SchoolClassDropdown, SchoolSectionDropdown } from '@/components/shared/Dropdowns';
import { useSchoolEnrollmentsForSectionAssignment, useAssignSectionsToEnrollments } from '@/lib/hooks/school';
import { useSchoolSections } from '@/lib/hooks/school/use-school-dropdowns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SchoolEnrollmentForSectionAssignment, AssignSectionsRequest } from '@/lib/types/school';

const SectionMappingTab = () => {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading, isError, error, refetch } = useSchoolEnrollmentsForSectionAssignment(selectedClassId);
  const { data: sectionsData, refetch: refetchSections } = useSchoolSections(selectedClassId || 0);
  const assignSectionsMutation = useAssignSectionsToEnrollments();

  const sections = sectionsData?.items || [];

  // Refetch sections when class changes to ensure fresh data
  useEffect(() => {
    if (selectedClassId && selectedClassId > 0) {
      // Invalidate and refetch sections dropdown when class changes
      queryClient.invalidateQueries({ 
        queryKey: ["school-dropdowns", "sections", selectedClassId] 
      });
      refetchSections();
    }
  }, [selectedClassId, queryClient, refetchSections]);

  // Toggle selection for a single enrollment
  const toggleEnrollment = (enrollmentId: number) => {
    setSelectedEnrollments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(enrollmentId)) {
        newSet.delete(enrollmentId);
      } else {
        newSet.add(enrollmentId);
      }
      return newSet;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedEnrollments.size === enrollments.length) {
      setSelectedEnrollments(new Set());
    } else {
      setSelectedEnrollments(new Set(enrollments.map((e) => e.enrollment_id)));
    }
  };

  // Check if all are selected
  const isAllSelected = enrollments.length > 0 && selectedEnrollments.size === enrollments.length;
  const isIndeterminate = selectedEnrollments.size > 0 && selectedEnrollments.size < enrollments.length;
  
  // Ref for select all checkbox to set indeterminate state
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      // Set indeterminate state on the underlying input element
      const input = selectAllCheckboxRef.current.querySelector('input');
      if (input) {
        input.indeterminate = isIndeterminate;
      }
    }
  }, [isIndeterminate]);

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
        await refetchSections();
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        ref={selectAllCheckboxRef}
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Alphabetical Order</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Current Section</TableHead>
                    <TableHead>Current Roll Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow
                      key={enrollment.enrollment_id}
                      className={selectedEnrollments.has(enrollment.enrollment_id) ? 'bg-muted/50' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedEnrollments.has(enrollment.enrollment_id)}
                          onCheckedChange={() => toggleEnrollment(enrollment.enrollment_id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {enrollment.alphabetical_order}
                      </TableCell>
                      <TableCell>{enrollment.admission_no}</TableCell>
                      <TableCell>{enrollment.student_name}</TableCell>
                      <TableCell>{enrollment.current_section_name || 'Not assigned'}</TableCell>
                      <TableCell>{enrollment.current_roll_number || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionMappingTab;
