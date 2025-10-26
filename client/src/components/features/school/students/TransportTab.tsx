import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EnhancedDataTable } from '@/components/shared';
import { useSchoolStudentTransport } from '@/lib/hooks/school/use-school-student-transport';
import type { ColumnDef } from '@tanstack/react-table';

const TransportTabComponent = () => {
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; bus_route_id?: number | '' }>({ 
    class_id: '', 
    section_id: '', 
    bus_route_id: '' 
  });

  // Memoized API parameters
  const apiParams = useMemo(() => {
    const params: any = {};
    if (query.class_id) {
      params.class_id = Number(query.class_id);
    }
    if (query.section_id) {
      params.section_id = Number(query.section_id);
    }
    if (query.bus_route_id) {
      params.bus_route_id = Number(query.bus_route_id);
    }
    return params;
  }, [query.class_id, query.section_id, query.bus_route_id]);

  // API hook with memoized parameters
  const result = useSchoolStudentTransport(apiParams);

  // Memoized handlers
  const handleQueryChange = useCallback((field: string, value: any) => {
    setQuery(prev => ({ ...prev, [field]: value }));
  }, []);

  // Flatten transport data for table
  const flatData = useMemo(() => {
    if (!result.data || !Array.isArray(result.data)) return [];
    const flattened: any[] = [];
    result.data.forEach((route: any) => {
      if (route.classes && Array.isArray(route.classes)) {
        route.classes.forEach((classItem: any) => {
          if (classItem.students && Array.isArray(classItem.students)) {
            classItem.students.forEach((student: any) => {
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
    {
      accessorKey: 'slab_name',
      header: 'Slab',
      cell: ({ row }) => row.original.slab_name || '-',
    },
    {
      accessorKey: 'pickup_point',
      header: 'Pickup Point',
      cell: ({ row }) => row.original.pickup_point || '-',
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

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Class ID (optional)</label>
            <Input 
              type="number" 
              placeholder="Enter class ID" 
              value={query.class_id} 
              onChange={(e) => handleQueryChange('class_id', e.target.value === '' ? '' : Number(e.target.value))} 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Section ID (optional)</label>
            <Input 
              type="number" 
              placeholder="Enter section ID" 
              value={query.section_id ?? ''} 
              onChange={(e) => handleQueryChange('section_id', e.target.value === '' ? '' : Number(e.target.value))} 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Bus Route ID (optional)</label>
            <Input 
              type="number" 
              placeholder="Enter bus route ID" 
              value={query.bus_route_id ?? ''} 
              onChange={(e) => handleQueryChange('bus_route_id', e.target.value === '' ? '' : Number(e.target.value))} 
            />
          </div>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={flatData}
        columns={columns}
        title="Transport Assignments"
        searchKey="student_name"
        searchPlaceholder="Search by student name..."
        loading={result.isLoading}
      />
    </div>
  );
};

export const TransportTab = TransportTabComponent;
export default TransportTabComponent;

