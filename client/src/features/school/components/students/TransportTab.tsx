
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Badge } from '@/common/components/ui/badge';
import { DataTable, ConfirmDialog } from '@/common/components/shared';
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { Eye, Edit, Trash2 } from "lucide-react";
import {
  TransportSearchForm,
  TransportCreateDialog,
  TransportViewDialog,
} from './transport';
import { 
  useSchoolStudentTransport, 
  useCreateSchoolStudentTransport,
  useDeleteSchoolStudentTransport,
  useSchoolStudentTransportById 
} from '@/features/school/hooks';
import { useSchoolClasses, useSchoolSections } from '@/features/school/hooks/use-school-dropdowns';
import { useBusRoutes } from '@/features/general/hooks';
import { useDistanceSlabs } from '@/features/general/hooks';
import { useSchoolEnrollmentsList } from '@/features/school/hooks';
import { useCanViewUIComponent } from '@/core/permissions';
import { useTabEnabled } from '@/common/hooks/use-tab-navigation';
import type { ColumnDef } from '@tanstack/react-table';
import type { SchoolStudentTransportAssignmentCreate, SchoolStudentTransportAssignmentUpdate } from '@/features/school/types';
import type { 
  SchoolEnrollmentWithClassSectionDetails,
  SchoolEnrollmentRead,
  SchoolEnrollmentsPaginatedResponse
} from '@/features/school/types/enrollments';
import type {
  SchoolStudentTransportAssignmentRead,
  SchoolStudentTransportAssignmentMinimal,
  SchoolStudentTransportRouteWiseResponse,
  SchoolStudentTransportClassWiseResponse
} from '@/features/school/types/student-transport-assignments';

const TransportTabComponent = () => {
  // ✅ OPTIMIZATION: Check if this tab is active before fetching
  const isTabActive = useTabEnabled("transport", "enrollments");
  
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; bus_route_id?: number | '' }>({ 
    class_id: '', 
    section_id: '', 
    bus_route_id: '' 
  });

  // ✅ OPTIMIZATION: Only fetch dropdowns when tab is active
  const { data: classesData } = useSchoolClasses();
  const { data: sectionsData } = useSchoolSections(Number(query.class_id) || 0);
  const { data: routesData } = useBusRoutes();
  const { distanceSlabs } = useDistanceSlabs();
  
  // ✅ OPTIMIZATION: Only fetch enrollments when tab is active AND class_id is provided
  const enrollmentsParams = useMemo(() => {
    if (!isTabActive || !query.class_id) return undefined;
    return {
      class_id: Number(query.class_id),
      section_id: query.section_id ? Number(query.section_id) : undefined,
      page: 1,
      page_size: 50, // ✅ CRITICAL FIX: Reduced from 100 to 50 for optimal performance
      enabled: isTabActive, // ✅ Gate by tab active state
    };
  }, [query.class_id, query.section_id, isTabActive]);
  
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
  const deleteMutation = useDeleteSchoolStudentTransport();

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [viewAssignmentId, setViewAssignmentId] = useState<number | null>(null);
  const [openInEditMode, setOpenInEditMode] = useState(false);
  
  // Fetch selected assignment for viewing
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

  // Handle view - open sheet in view mode
  const handleView = useCallback((assignment: SchoolStudentTransportAssignmentRead | SchoolStudentTransportAssignmentMinimal) => {
    setOpenInEditMode(false);
    setViewAssignmentId(assignment.transport_assignment_id);
    setIsViewDialogOpen(true);
  }, []);

  // Handle edit - open sheet directly in edit mode
  const handleEdit = useCallback((assignment: SchoolStudentTransportAssignmentRead | SchoolStudentTransportAssignmentMinimal) => {
    setOpenInEditMode(true);
    setViewAssignmentId(assignment.transport_assignment_id);
    setIsViewDialogOpen(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback((assignment: SchoolStudentTransportAssignmentRead | SchoolStudentTransportAssignmentMinimal) => {
    setSelectedAssignmentId(assignment.transport_assignment_id);
    setIsDeleteDialogOpen(true);
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
  // Action configurations for DataTable V2
  const actions: ActionConfig<FlatTransportData>[] = useMemo(() => {
    const acts: ActionConfig<FlatTransportData>[] = [
      {
        id: 'view',
        label: 'View',
        icon: Eye,
        onClick: (row) => handleView(row)
      }
    ];

    if (canEditTransport) {
      acts.push({
        id: 'edit',
        label: 'Edit',
        icon: Edit,
        onClick: (row) => handleEdit(row)
      });
    }

    if (canDeleteTransport) {
      acts.push({
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive',
        onClick: (row) => handleDelete(row)
      });
    }
    
    return acts;
  }, [handleView, handleEdit, handleDelete, canEditTransport, canDeleteTransport]);

  // Define columns
  const columns: ColumnDef<FlatTransportData>[] = useMemo(() => [
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
      <DataTable
        data={flatData}
        columns={columns}
        title="Transport Assignments"
        searchKey="student_name"
        searchPlaceholder="Search by student name..."
        loading={result.isLoading}
        export={{ enabled: true, filename: "transport_assignments" }}
        onAdd={query.class_id ? () => setIsCreateDialogOpen(true) : undefined}
        addButtonText="Add Transport Assignment"
        actions={actions}
        actionsHeader="Actions"
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

      {/* View/Edit Transport Assignment Dialog */}
      <TransportViewDialog
        open={isViewDialogOpen}
        onOpenChange={handleViewDialogOpenChange}
        viewAssignment={viewAssignment || null}
        isLoading={isLoadingView}
        busRoutes={busRoutes}
        slabs={slabs}
        defaultEditMode={openInEditMode}
        onSuccess={handleViewEditSuccess}
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

