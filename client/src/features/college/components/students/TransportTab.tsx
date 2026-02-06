import { useState, useMemo, useCallback, useEffect } from 'react';
import { Badge } from '@/common/components/ui/badge';
import { ConfirmDialog } from '@/common/components/shared';
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
  CollegeTransportStudent,
} from '@/features/college/types';
import { ActionConfig } from '@/common/components/shared/DataTable/types';
import { DataTable } from '@/common/components/shared/DataTable';
import { Eye, Edit as EditIcon, Trash2 } from 'lucide-react';

export const TransportTabComponent = () => {
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; group_id?: number | ''; bus_route_id?: number | '' }>({ 
    class_id: '', 
    group_id: '', 
    bus_route_id: '' 
  });

  // Fetch dropdown data
  const { data: routesData } = useBusRoutes(); // useBusRoutes is usually enabled by default or doesn't have the same flag
  const { distanceSlabs } = useDistanceSlabs();
  
  const enrollmentsApiParams = useMemo(() => {
    if (!query.class_id || !query.group_id) return undefined;
    return {
      class_id: Number(query.class_id),
      group_id: Number(query.group_id),
    };
  }, [query.class_id, query.group_id]);
  
  const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useCollegeEnrollmentsList(enrollmentsApiParams);
  
  const busRoutes = Array.isArray(routesData) ? routesData : [];
  const slabs = distanceSlabs || [];
  
  const enrollments = useMemo(() => {
    if (!enrollmentsData?.enrollments) return [];
    const allEnrollments: any[] = [];
    enrollmentsData.enrollments.forEach((group: any) => {
      if (group.students && Array.isArray(group.students)) {
        group.students.forEach((student: any) => {
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

  const apiParams = useMemo(() => {
    if (!query.class_id || !query.group_id) return undefined;
    const params: { class_id: number; group_id: number; bus_route_id?: number } = {
      class_id: Number(query.class_id),
      group_id: Number(query.group_id),
    };
    if (query.bus_route_id) params.bus_route_id = Number(query.bus_route_id);
    return params;
  }, [query.class_id, query.group_id, query.bus_route_id]);

  const result = useCollegeStudentTransportAssignments(apiParams);
  const createMutation = useCreateCollegeStudentTransportAssignment();
  const updateMutation = useUpdateCollegeStudentTransportAssignment();
  const deleteMutation = useDeleteCollegeStudentTransportAssignment();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [viewAssignmentId, setViewAssignmentId] = useState<number | null>(null);

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

  const handleCreate = useCallback(async () => {
    if (!formData.enrollment_id || !formData.bus_route_id || !formData.start_date || !formData.pickup_point?.trim()) {
      return;
    }
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {}
  }, [formData, createMutation, resetForm]);

  const handleView = useCallback((student: any) => {
    setViewAssignmentId(student.transport_assignment_id);
    setIsViewDialogOpen(true);
  }, []);

  const handleEdit = useCallback((student: any) => {
    setSelectedAssignmentId(student.transport_assignment_id);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((student: any) => {
    setSelectedAssignmentId(student.transport_assignment_id);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleGroupChange = useCallback((value: string) => {
    setQuery(prev => ({ ...prev, group_id: value ? Number(value) : '' }));
  }, []);

  const handleBusRouteChange = useCallback((value: string) => {
    setQuery(prev => ({ ...prev, bus_route_id: value ? Number(value) : '' }));
  }, []);

  const handleClear = useCallback(() => {
    setQuery({ class_id: '', group_id: '', bus_route_id: '' });
  }, []);

  const handleClassChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      class_id: value ? Number(value) : '', 
      group_id: '' 
    }));
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!selectedAssignmentId || !selectedAssignment) return;
    const updatePayload: CollegeTransportAssignmentUpdate = {
      bus_route_id: editFormData.bus_route_id || undefined,
      slab_id: editFormData.slab_id || undefined,
      pickup_point: editFormData.pickup_point || undefined,
      start_date: editFormData.start_date || undefined,
      end_date: editFormData.end_date || undefined,
    };
    if (typeof editFormData.is_active === 'boolean') {
      updatePayload.is_active = editFormData.is_active;
    }
    try {
      await updateMutation.mutateAsync({ id: selectedAssignmentId, payload: updatePayload });
      setIsEditDialogOpen(false);
      setSelectedAssignmentId(null);
      resetEditForm();
    } catch (error) {}
  }, [selectedAssignmentId, selectedAssignment, editFormData, updateMutation, resetEditForm]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedAssignmentId) return;
    try {
      await deleteMutation.mutateAsync(selectedAssignmentId);
      setIsDeleteDialogOpen(false);
      setSelectedAssignmentId(null);
    } catch (error) {}
  }, [selectedAssignmentId, deleteMutation]);

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

  const flatData = useMemo(() => {
    if (!result.data || !Array.isArray(result.data)) return [];
    const flattened: any[] = [];
    (result.data).forEach((route) => {
      if (route.groups && Array.isArray(route.groups)) {
        route.groups.forEach((group) => {
          if (group.students && Array.isArray(group.students)) {
            group.students.forEach((student: any) => {
              flattened.push({
                ...student,
                route_name: route.route_name,
                route_no: route.bus_route_id,
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

  const canEditTransport = useCanViewUIComponent("students", "button", "transport-edit");
  const canDeleteTransport = useCanViewUIComponent("students", "button", "transport-delete");

  const actions: ActionConfig<any>[] = useMemo(() => [
    {
      id: 'view',
      label: 'View',
      icon: Eye,
      onClick: (row) => handleView(row)
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: EditIcon,
      onClick: (row) => handleEdit(row),
      show: () => canEditTransport
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => handleDelete(row),
      show: () => canDeleteTransport
    }
  ], [handleView, handleEdit, handleDelete, canEditTransport, canDeleteTransport]);

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'admission_no',
      header: 'Admission No',
      cell: ({ row }) => <span className="font-semibold text-blue-600">{row.getValue('admission_no')}</span>
    },
    {
      accessorKey: 'student_name',
      header: 'Student Name',
      cell: ({ row }) => <span className="font-medium">{row.getValue('student_name')}</span>
    },
    {
      accessorKey: 'roll_number',
      header: 'Roll No',
      cell: ({ row }) => row.getValue('roll_number') || '-'
    },
    {
      accessorKey: 'class_name',
      header: 'Class',
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-slate-50">{row.getValue('class_name')}</Badge>
      )
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
        <Badge variant={row.original.is_active ? 'secondary' : 'outline'} className={row.original.is_active ? 'bg-green-100 text-green-700' : ''}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <TransportSearchForm
        query={query}
        onClassChange={handleClassChange}
        onGroupChange={handleGroupChange}
        onBusRouteChange={handleBusRouteChange}
        onClear={handleClear}
      />

      <DataTable
        data={flatData}
        columns={columns}
        actions={actions}
        title="Transport Assignments"
        searchKey="student_name"
        searchPlaceholder="Search by student name..."
        loading={result.isLoading}
        onAdd={query.class_id && query.group_id ? () => setIsCreateDialogOpen(true) : undefined}
        addButtonText="Add Assignment"
        export={{ enabled: true, filename: 'transport_assignments' }}
      />

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
