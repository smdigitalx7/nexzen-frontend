import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/common/components/ui/badge';
import { ConfirmDialog } from '@/common/components/shared';
import {
  TransportSearchForm,
  TransportCreateDialog,
  TransportViewDialog,
} from './transport';
import {
  useCollegeStudentTransportAssignments,
  useCollegeStudentTransportAssignmentById,
  useCreateCollegeStudentTransportAssignment,
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
  const deleteMutation = useDeleteCollegeStudentTransportAssignment();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [viewAssignmentId, setViewAssignmentId] = useState<number | null>(null);
  const [openInEditMode, setOpenInEditMode] = useState(false);

  const { data: viewAssignment, isLoading: isLoadingView } = useCollegeStudentTransportAssignmentById(viewAssignmentId);

  const [formData, setFormData] = useState<CollegeTransportAssignmentCreate>({
    enrollment_id: 0,
    bus_route_id: 0,
    pickup_point: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  const resetForm = useCallback(() => {
    setFormData({
      enrollment_id: 0,
      bus_route_id: 0,
      pickup_point: '',
      start_date: new Date().toISOString().split('T')[0],
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
    } catch (error) { }
  }, [formData, createMutation, resetForm]);

  const handleView = useCallback((student: any) => {
    setOpenInEditMode(false);
    setViewAssignmentId(student.transport_assignment_id);
    setIsViewDialogOpen(true);
  }, []);

  // Handle edit - open sheet directly in edit mode
  const handleEdit = useCallback((student: any) => {
    setOpenInEditMode(true);
    setViewAssignmentId(student.transport_assignment_id);
    setIsViewDialogOpen(true);
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

  // Handle view/edit success - refresh data
  const handleViewEditSuccess = useCallback(() => {
    // Data will be refreshed automatically by React Query
  }, []);

  // Stable callback for view dialog open/close to avoid unnecessary TransportViewDialog re-renders
  const handleViewDialogOpenChange = useCallback((open: boolean) => {
    setIsViewDialogOpen(open);
    if (!open) {
      setViewAssignmentId(null);
      setOpenInEditMode(false);
    }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedAssignmentId) return;
    try {
      await deleteMutation.mutateAsync(selectedAssignmentId);
      setIsDeleteDialogOpen(false);
      setSelectedAssignmentId(null);
    } catch (error) { }
  }, [selectedAssignmentId, deleteMutation]);


  const flatData = useMemo(() => {
    if (!result.data) return [];

    let routes: any[] = [];
    // Handle wrapped response { data: [...] }
    if ('data' in (result.data as any) && Array.isArray((result.data as any).data)) {
      routes = (result.data as any).data;
    }
    // Handle direct array response [...]
    else if (Array.isArray(result.data)) {
      routes = result.data;
    } else {
      return [];
    }

    const flattened: any[] = [];
    routes.forEach((route) => {
      if (route.groups && Array.isArray(route.groups)) {
        route.groups.forEach((group: any) => {
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

      <TransportViewDialog
        open={isViewDialogOpen}
        onOpenChange={handleViewDialogOpenChange}
        viewAssignment={viewAssignment || null}
        isLoading={isLoadingView}
        busRoutes={busRoutes}
        defaultEditMode={openInEditMode}
        onSuccess={handleViewEditSuccess}
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
