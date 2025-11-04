import { useState, useMemo, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog, EnhancedDataTable } from '@/components/shared';
import {
  TransportCreateDialog,
  TransportEditDialog,
  TransportViewDialog,
} from './transport';
import { 
  useCollegeStudentTransportAssignments,
  useCollegeStudentTransportAssignmentById,
  useCreateCollegeStudentTransportAssignment,
  useUpdateCollegeStudentTransportAssignment,
  useDeleteCollegeStudentTransportAssignment,
} from '@/lib/hooks/college/use-student-transport-assignments';
import { useBusRoutes } from '@/lib/hooks/general/useTransport';
import { useDistanceSlabs } from '@/lib/hooks/general/useDistanceSlabs';
import { useCollegeEnrollmentsList } from '@/lib/hooks/college/use-college-enrollments';
import type { ColumnDef } from '@tanstack/react-table';
import type { CollegeTransportAssignmentCreate, CollegeTransportAssignmentUpdate, CollegeTransportRoute, CollegeTransportStudent } from '@/lib/types/college';

const TransportTabComponent = () => {
  // Fetch dropdown data
  const { data: routesData } = useBusRoutes();
  const { distanceSlabs } = useDistanceSlabs();
  const { data: enrollmentsData } = useCollegeEnrollmentsList();
  
  const busRoutes = Array.isArray(routesData) ? routesData : [];
  const slabs = distanceSlabs || [];
  
  // Flatten enrollments for dropdown
  const enrollments = useMemo(() => {
    if (!enrollmentsData?.enrollments) return [];
    const flattened: any[] = [];
    enrollmentsData.enrollments.forEach((classGroup: any) => {
      if (classGroup.students && Array.isArray(classGroup.students)) {
        classGroup.students.forEach((student: any) => {
          flattened.push({
            enrollment_id: student.enrollment_id,
            admission_no: student.admission_no,
            student_name: student.student_name,
          });
        });
      }
    });
    return flattened;
  }, [enrollmentsData]);

  // API hooks
  const result = useCollegeStudentTransportAssignments();
  const createMutation = useCreateCollegeStudentTransportAssignment();
  const updateMutation = useUpdateCollegeStudentTransportAssignment();
  const deleteMutation = useDeleteCollegeStudentTransportAssignment();

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [viewAssignmentId, setViewAssignmentId] = useState<number | null>(null);

  // Fetch selected assignment for editing/viewing
  const { data: selectedAssignment } = useCollegeStudentTransportAssignmentById(selectedAssignmentId);
  const { data: viewAssignment, isLoading: isLoadingView } = useCollegeStudentTransportAssignmentById(viewAssignmentId);

  const [formData, setFormData] = useState<CollegeTransportAssignmentCreate>({
    enrollment_id: 0,
    bus_route_id: 0,
    slab_id: 0,
    pickup_point: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    is_active: true,
  });

  const [editFormData, setEditFormData] = useState({
    bus_route_id: 0,
    slab_id: 0,
    pickup_point: '',
    start_date: '',
    end_date: null as string | null,
    is_active: true,
  });

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      enrollment_id: 0,
      bus_route_id: 0,
      slab_id: 0,
      pickup_point: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      is_active: true,
    });
  }, []);

  const resetEditForm = useCallback(() => {
    setEditFormData({
      bus_route_id: 0,
      slab_id: 0,
      pickup_point: '',
      start_date: '',
      end_date: null,
      is_active: true,
    });
  }, []);

  // Handle create
  const handleCreate = useCallback(async () => {
    if (!formData.enrollment_id || !formData.bus_route_id || !formData.slab_id || !formData.start_date) {
      return;
    }
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation hook
    }
  }, [formData, createMutation, resetForm]);

  // Handle view
  const handleView = useCallback((student: CollegeTransportStudent) => {
    setViewAssignmentId(student.transport_assignment_id);
    setIsViewDialogOpen(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((student: CollegeTransportStudent) => {
    setSelectedAssignmentId(student.transport_assignment_id);
    setIsEditDialogOpen(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback((student: CollegeTransportStudent) => {
    setSelectedAssignmentId(student.transport_assignment_id);
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle update
  const handleUpdate = useCallback(async () => {
    if (!selectedAssignmentId || !selectedAssignment) return;
    
    const updatePayload: CollegeTransportAssignmentUpdate = {
      bus_route_id: editFormData.bus_route_id || undefined,
      slab_id: editFormData.slab_id || undefined,
      pickup_point: editFormData.pickup_point || undefined,
      start_date: editFormData.start_date || undefined,
      end_date: editFormData.end_date || undefined,
      is_active: editFormData.is_active,
    };
    
    try {
      await updateMutation.mutateAsync({ id: selectedAssignmentId, payload: updatePayload });
      setIsEditDialogOpen(false);
      setSelectedAssignmentId(null);
      resetEditForm();
    } catch (error) {
      // Error handled by mutation hook
    }
  }, [selectedAssignmentId, selectedAssignment, editFormData, updateMutation, resetEditForm]);

  // Handle delete confirm
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedAssignmentId) return;
    try {
      await deleteMutation.mutateAsync(selectedAssignmentId);
      setIsDeleteDialogOpen(false);
      setSelectedAssignmentId(null);
    } catch (error) {
      // Error handled by mutation hook
    }
  }, [selectedAssignmentId, deleteMutation]);

  // Populate edit form when assignment is loaded
  useEffect(() => {
    if (isEditDialogOpen && selectedAssignment) {
      setEditFormData({
        bus_route_id: selectedAssignment.bus_route_id,
        slab_id: selectedAssignment.slab_id,
        pickup_point: selectedAssignment.pickup_point || '',
        start_date: selectedAssignment.start_date,
        end_date: selectedAssignment.end_date || null,
        is_active: selectedAssignment.is_active,
      });
    }
  }, [isEditDialogOpen, selectedAssignment]);

  // Flatten transport data for table
  const flatData = useMemo(() => {
    if (!result.data || !Array.isArray(result.data)) return [];
    const flattened: any[] = [];
    (result.data as CollegeTransportRoute[]).forEach((route) => {
      if (route.groups && Array.isArray(route.groups)) {
        route.groups.forEach((group) => {
          if (group.students && Array.isArray(group.students)) {
            group.students.forEach((student) => {
              flattened.push({
                ...student,
                route_name: route.route_name,
                route_no: route.bus_route_id, // Use bus_route_id for display
                class_name: group.class_name,
                group_name: group.group_name,
              });
            });
          }
        });
      }
    });
    return flattened;
  }, [result.data]);

  // Table columns
  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      id: 'admission_no',
      accessorKey: 'admission_no',
      header: 'Admission No',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.admission_no}</div>
      ),
    },
    {
      id: 'student_name',
      accessorKey: 'student_name',
      header: 'Student Name',
    },
    {
      id: 'roll_number',
      accessorKey: 'roll_number',
      header: 'Roll Number',
    },
    {
      id: 'route_name',
      accessorKey: 'route_name',
      header: 'Route',
    },
    {
      id: 'class_name',
      accessorKey: 'class_name',
      header: 'Class',
    },
    {
      id: 'group_name',
      accessorKey: 'group_name',
      header: 'Group',
    },
    {
      id: 'pickup_point',
      accessorKey: 'pickup_point',
      header: 'Pickup Point',
      cell: ({ row }) => (
        <div>{row.original.pickup_point || '-'}</div>
      ),
    },
    {
      id: 'start_date',
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => (
        <div>{row.original.start_date ? new Date(row.original.start_date).toLocaleDateString() : '-'}</div>
      ),
    },
    {
      id: 'end_date',
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ row }) => (
        <div>{row.original.end_date ? new Date(row.original.end_date).toLocaleDateString() : '-'}</div>
      ),
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: any) => handleView(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: any) => handleEdit(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: any) => handleDelete(row)
    }
  ], [handleView, handleEdit, handleDelete]);

  return (
    <div className="space-y-4">
      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={flatData}
        columns={columns}
        title="Transport Assignments"
        searchKey="student_name"
        searchPlaceholder="Search by student name..."
        loading={result.isLoading}
        onAdd={() => setIsCreateDialogOpen(true)}
        addButtonText="Add Transport Assignment"
        addButtonVariant="default"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={false}
      />

      {/* Create Transport Assignment Dialog */}
      <TransportCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}
        isLoading={createMutation.isPending}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleCreate}
        onCancel={() => {
          setIsCreateDialogOpen(false);
          resetForm();
        }}
        enrollments={enrollments}
        busRoutes={busRoutes}
        slabs={slabs}
      />

      {/* Edit Transport Assignment Dialog */}
      <TransportEditDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedAssignmentId(null);
            resetEditForm();
          }
        }}
        isLoading={updateMutation.isPending}
        formData={editFormData}
        onFormDataChange={setEditFormData}
        onSave={handleUpdate}
        onCancel={() => {
          setIsEditDialogOpen(false);
          setSelectedAssignmentId(null);
          resetEditForm();
        }}
        busRoutes={busRoutes}
        slabs={slabs}
      />

      {/* View Transport Assignment Dialog */}
      <TransportViewDialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setViewAssignmentId(null);
          }
        }}
        viewAssignment={viewAssignment || null}
        isLoading={isLoadingView}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Transport Assignment"
        description="Are you sure you want to delete this transport assignment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        loadingText="Deleting..."
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export const TransportTab = TransportTabComponent;
export default TransportTabComponent;
