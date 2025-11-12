import { useState, useMemo, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared';
import { EnhancedDataTable } from '@/components/shared';
import {
  TransportSearchForm,
  TransportCreateDialog,
  TransportEditDialog,
  TransportViewDialog,
} from './transport';
import { 
  useSchoolStudentTransport, 
  useCreateSchoolStudentTransport,
  useUpdateSchoolStudentTransport,
  useDeleteSchoolStudentTransport,
  useSchoolStudentTransportById 
} from '@/lib/hooks/school';
import { useSchoolClasses, useSchoolSections } from '@/lib/hooks/school/use-school-dropdowns';
import { useBusRoutes } from '@/lib/hooks/general';
import { useDistanceSlabs } from '@/lib/hooks/general';
import { useSchoolEnrollmentsList } from '@/lib/hooks/school';
import { useCanViewUIComponent } from '@/lib/permissions';
import type { ColumnDef } from '@tanstack/react-table';
import type { SchoolStudentTransportAssignmentCreate, SchoolStudentTransportAssignmentUpdate } from '@/lib/types/school';
import type { 
  SchoolEnrollmentWithClassSectionDetails,
  SchoolEnrollmentRead,
  SchoolEnrollmentsPaginatedResponse
} from '@/lib/types/school/enrollments';
import type {
  SchoolStudentTransportAssignmentRead,
  SchoolStudentTransportAssignmentMinimal,
  SchoolStudentTransportRouteWiseResponse,
  SchoolStudentTransportClassWiseResponse
} from '@/lib/types/school/student-transport-assignments';

const TransportTabComponent = () => {
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; bus_route_id?: number | '' }>({ 
    class_id: '', 
    section_id: '', 
    bus_route_id: '' 
  });

  // Fetch dropdown data
  const { data: classesData } = useSchoolClasses();
  const { data: sectionsData } = useSchoolSections(Number(query.class_id) || 0);
  const { data: routesData } = useBusRoutes();
  const { distanceSlabs } = useDistanceSlabs();
  
  // Get enrollments filtered by class and section
  const enrollmentsParams = useMemo(() => {
    if (!query.class_id) return undefined;
    return {
      class_id: Number(query.class_id),
      section_id: query.section_id ? Number(query.section_id) : undefined,
      page: 1,
      page_size: 1000,
    };
  }, [query.class_id, query.section_id]);
  
  const { data: enrollmentsData } = useSchoolEnrollmentsList(enrollmentsParams);
  
  const classes = classesData?.items || [];
  const sections = sectionsData?.items || [];
  const busRoutes = Array.isArray(routesData) ? routesData : [];
  const slabs = distanceSlabs || [];
  
  // Extract enrollments - flatten the grouped response and add class_name
  const enrollments = useMemo(() => {
    if (!enrollmentsData?.enrollments) return [];
    const allEnrollments: (SchoolEnrollmentRead & { class_name: string })[] = [];
    enrollmentsData.enrollments.forEach((group: SchoolEnrollmentWithClassSectionDetails) => {
      if (group.students && Array.isArray(group.students)) {
        group.students.forEach((student: SchoolEnrollmentRead) => {
          allEnrollments.push({
            ...student,
            class_name: group.class_name || student.class_name || '',
          });
        });
      }
    });
    return allEnrollments;
  }, [enrollmentsData]);

  // Memoized API parameters
  const apiParams = useMemo(() => {
    const params: { class_id?: number; section_id?: number; bus_route_id?: number } = {};
    if (query.class_id) {
      params.class_id = Number(query.class_id);
    }
    if (query.section_id) {
      params.section_id = Number(query.section_id);
    }
    if (query.bus_route_id) {
      params.bus_route_id = Number(query.bus_route_id);
    }
    return Object.keys(params).length > 0 ? params : undefined;
  }, [query.class_id, query.section_id, query.bus_route_id]);

  // API hook with memoized parameters - class_id is required
  const result = useSchoolStudentTransport(
    apiParams && typeof apiParams.class_id === 'number' && apiParams.class_id > 0
      ? { class_id: apiParams.class_id, section_id: apiParams.section_id, bus_route_id: apiParams.bus_route_id }
      : { class_id: 1 } // Provide valid default, hook's enabled check will prevent actual API call
  );
  const createMutation = useCreateSchoolStudentTransport();
  const updateMutation = useUpdateSchoolStudentTransport();
  const deleteMutation = useDeleteSchoolStudentTransport();

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [viewAssignmentId, setViewAssignmentId] = useState<number | null>(null);
  
  // Fetch selected assignment for editing/viewing
  const { data: selectedAssignment } = useSchoolStudentTransportById(selectedAssignmentId);
  const { data: viewAssignment, isLoading: isLoadingView } = useSchoolStudentTransportById(viewAssignmentId);
  
  const [formData, setFormData] = useState<SchoolStudentTransportAssignmentCreate>({
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
  const handleView = useCallback((assignment: SchoolStudentTransportAssignmentRead | SchoolStudentTransportAssignmentMinimal) => {
    setViewAssignmentId(assignment.transport_assignment_id);
    setIsViewDialogOpen(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((assignment: SchoolStudentTransportAssignmentRead | SchoolStudentTransportAssignmentMinimal) => {
    setSelectedAssignmentId(assignment.transport_assignment_id);
    setIsEditDialogOpen(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback((assignment: SchoolStudentTransportAssignmentRead | SchoolStudentTransportAssignmentMinimal) => {
    setSelectedAssignmentId(assignment.transport_assignment_id);
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle update
  const handleUpdate = useCallback(async () => {
    if (!selectedAssignmentId || !selectedAssignment) return;
    
    const updatePayload: SchoolStudentTransportAssignmentUpdate = {
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

  // Populate form when assignment is loaded for editing
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

  // Memoized handlers
  const handleSectionChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      section_id: value ? Number(value) : '' 
    }));
  }, []);

  const handleBusRouteChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      bus_route_id: value ? Number(value) : '' 
    }));
  }, []);

  const handleClear = useCallback(() => {
    setQuery({ class_id: '', section_id: '', bus_route_id: '' });
  }, []);

  // Handle class change - reset section when class changes
  const handleClassChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      class_id: value ? Number(value) : '', 
      section_id: '' // Reset section when class changes
    }));
  }, []);

  // Flatten transport data for table
  const flatData = useMemo(() => {
    if (!result.data || !Array.isArray(result.data)) return [];
    const flattened: (SchoolStudentTransportAssignmentMinimal & { route_name: string; class_name: string })[] = [];
    (result.data as SchoolStudentTransportRouteWiseResponse[]).forEach((route) => {
      if (route.classes && Array.isArray(route.classes)) {
        route.classes.forEach((classItem: SchoolStudentTransportClassWiseResponse) => {
          if (classItem.students && Array.isArray(classItem.students)) {
            classItem.students.forEach((student: SchoolStudentTransportAssignmentMinimal) => {
              flattened.push({
                ...student,
                route_name: route.route_name,
                class_name: classItem.class_name,
              });
            });
          }
        });
      }
    });
    return flattened;
  }, [result.data]);

  // Check permissions for transport edit/delete
  const canEditTransport = useCanViewUIComponent("students", "button", "transport-edit");
  const canDeleteTransport = useCanViewUIComponent("students", "button", "transport-delete");

  // Action button groups for EnhancedDataTable
  type FlatTransportData = SchoolStudentTransportAssignmentMinimal & { route_name: string; class_name: string };
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
      accessorKey: 'section_name',
      header: 'Section',
    },
    {
      accessorKey: 'class_name',
      header: 'Class',
    },
    {
      accessorKey: 'route_name',
      header: 'Route',
    },
    // {
    //   accessorKey: 'slab_name',
    //   header: 'Slab',
    //   cell: ({ row }) => row.original.slab_name || '-',
    // },
    // {
    //   accessorKey: 'pickup_point',
    //   header: 'Pickup Point',
    //   cell: ({ row }) => row.original.pickup_point || '-',
    // },
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

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <TransportSearchForm
        query={query}
        onClassChange={handleClassChange}
        onSectionChange={handleSectionChange}
        onBusRouteChange={handleBusRouteChange}
        onClear={handleClear}
      />

      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={flatData}
        columns={columns}
        title="Transport Assignments"
        searchKey="student_name"
        searchPlaceholder="Search by student name..."
        loading={result.isLoading}
        onAdd={query.class_id ? () => setIsCreateDialogOpen(true) : undefined}
        addButtonText="Add Transport Assignment"
        addButtonVariant="default"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
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

