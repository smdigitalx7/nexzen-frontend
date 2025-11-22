import { useState, useMemo, useCallback, useEffect } from 'react';
import { Badge } from '@/common/components/ui/badge';
import { ConfirmDialog, EnhancedDataTable } from '@/common/components/shared';
import {
  TransportSearchForm,
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
  useCollegeEnrollmentsList,
} from '@/features/college/hooks';
import { useBusRoutes, useDistanceSlabs } from '@/features/general/hooks';
import { useCanViewUIComponent } from '@/core/permissions';
import type { ColumnDef } from '@tanstack/react-table';
import type { 
  CollegeTransportAssignmentCreate, 
  CollegeTransportAssignmentUpdate, 
  CollegeTransportRoute, 
  CollegeTransportStudent,
  CollegeTransportAssignmentRead
} from '@/features/college/types';
import type { 
  CollegeEnrollmentWithClassGroupCourseDetails,
  CollegeEnrollmentRead,
  CollegeEnrollmentsPaginatedResponse
} from '@/features/college/types/enrollments';

const TransportTabComponent = () => {
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; group_id?: number | ''; bus_route_id?: number | '' }>({ 
    class_id: '', 
    group_id: '', 
    bus_route_id: '' 
  });

  // Fetch dropdown data
  const { data: routesData } = useBusRoutes();
  const { distanceSlabs } = useDistanceSlabs();
  
  // Get enrollments for create dialog - only fetch when class and group are selected
  const enrollmentsApiParams = useMemo(() => {
    if (!query.class_id || !query.group_id) return undefined;
    return {
      class_id: Number(query.class_id),
      group_id: Number(query.group_id),
    };
  }, [query.class_id, query.group_id]);
  
  const { data: enrollmentsData } = useCollegeEnrollmentsList(enrollmentsApiParams);
  
  const busRoutes = Array.isArray(routesData) ? routesData : [];
  const slabs = distanceSlabs || [];
  
  // Flatten enrollments for dropdown - add class_name and group_name
  const enrollments = useMemo(() => {
    if (!enrollmentsData?.enrollments) return [];
    const allEnrollments: (CollegeEnrollmentRead & { class_name: string; group_name: string })[] = [];
    enrollmentsData.enrollments.forEach((group: CollegeEnrollmentWithClassGroupCourseDetails) => {
      if (group.students && Array.isArray(group.students)) {
        group.students.forEach((student: CollegeEnrollmentRead) => {
          allEnrollments.push({
            ...student,
            class_name: group.class_name || '',
            group_name: group.group_name || '',
          });
        });
      }
    });
    return allEnrollments;
  }, [enrollmentsData]);

  // Memoized API parameters - both class_id and group_id are required
  const apiParams = useMemo(() => {
    // Both class_id and group_id are required
    if (!query.class_id || !query.group_id) {
      return undefined;
    }
    
    const params: { class_id: number; group_id: number; bus_route_id?: number } = {
      class_id: Number(query.class_id),
      group_id: Number(query.group_id),
    };
    
    if (query.bus_route_id) {
      params.bus_route_id = Number(query.bus_route_id);
    }
    
    return params;
  }, [query.class_id, query.group_id, query.bus_route_id]);

  // API hooks
  const result = useCollegeStudentTransportAssignments(apiParams);
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
    pickup_point: '',
    start_date: new Date().toISOString().split('T')[0],
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
      pickup_point: '',
      start_date: new Date().toISOString().split('T')[0],
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
    if (!formData.enrollment_id || !formData.bus_route_id || !formData.start_date || !formData.pickup_point?.trim()) {
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

  // Memoized handlers
  const handleGroupChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      group_id: value ? Number(value) : '' 
    }));
  }, []);

  const handleBusRouteChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      bus_route_id: value ? Number(value) : '' 
    }));
  }, []);

  const handleClear = useCallback(() => {
    setQuery({ class_id: '', group_id: '', bus_route_id: '' });
  }, []);

  // Handle class change - reset group when class changes
  const handleClassChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      class_id: value ? Number(value) : '', 
      group_id: '' // Reset group when class changes
    }));
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
    };
    
    // Explicitly include is_active if it's a boolean (true or false)
    if (typeof editFormData.is_active === 'boolean') {
      updatePayload.is_active = editFormData.is_active;
    }
    
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
    const flattened: (CollegeTransportStudent & { route_name: string; route_no: number; class_name: string; group_name: string })[] = [];
    (result.data as CollegeTransportRoute[]).forEach((route) => {
      if (route.groups && Array.isArray(route.groups)) {
        route.groups.forEach((group) => {
          if (group.students && Array.isArray(group.students)) {
            group.students.forEach((student: CollegeTransportStudent) => {
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

  // Define columns
  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'admission_no',
      header: 'Admission No',
    },
    {
      accessorKey: 'student_name',
      header: 'Student Name',
    },
    {
      accessorKey: 'roll_number',
      header: 'Roll No',
    },
    {
      accessorKey: 'class_name',
      header: 'Class',
    },
    {
      accessorKey: 'group_name',
      header: 'Group',
    },
    {
      accessorKey: 'route_name',
      header: 'Route',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  // Check permissions for transport edit/delete
  const canEditTransport = useCanViewUIComponent("students", "button", "transport-edit");
  const canDeleteTransport = useCanViewUIComponent("students", "button", "transport-delete");

  // Action button groups for EnhancedDataTable
  type FlatTransportData = CollegeTransportStudent & { route_name: string; route_no: number; class_name: string; group_name: string };
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: FlatTransportData) => handleView(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: FlatTransportData) => handleEdit(row),
      show: () => canEditTransport
    },
    {
      type: 'delete' as const,
      onClick: (row: FlatTransportData) => handleDelete(row),
      show: () => canDeleteTransport
    }
  ], [handleView, handleEdit, handleDelete, canEditTransport, canDeleteTransport]);

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <TransportSearchForm
        query={query}
        onClassChange={handleClassChange}
        onGroupChange={handleGroupChange}
        onBusRouteChange={handleBusRouteChange}
        onClear={handleClear}
      />

      {/* Enhanced Data Table */}
      {!query.class_id || !query.group_id ? (
        <div className="text-sm text-slate-600 p-4 text-center">
          {!query.class_id 
            ? 'Please select a class and group to view transport assignments.'
            : 'Please select a group to view transport assignments.'}
        </div>
      ) : (
        <EnhancedDataTable
          data={flatData}
          columns={columns}
          title="Transport Assignments"
          searchKey="student_name"
          searchPlaceholder="Search by student name..."
          loading={result.isLoading}
          onAdd={query.class_id && query.group_id ? () => setIsCreateDialogOpen(true) : undefined}
          addButtonText="Add Transport Assignment"
          addButtonVariant="default"
          showActions={true}
          actionButtonGroups={actionButtonGroups}
          actionColumnHeader="Actions"
          showActionLabels={true}
        />
      )}

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
