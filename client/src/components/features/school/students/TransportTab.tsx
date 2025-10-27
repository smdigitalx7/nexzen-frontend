import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { EnhancedDataTable } from '@/components/shared';
import { useSchoolStudentTransport } from '@/lib/hooks/school/use-school-student-transport';
import { useSchoolClasses } from '@/lib/hooks/school/use-school-dropdowns';
import { useSchoolSections } from '@/lib/hooks/school/use-school-dropdowns';
import { useBusRoutes } from '@/lib/hooks/general/useTransport';
import type { ColumnDef } from '@tanstack/react-table';

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
  
  const classes = classesData?.items || [];
  const sections = sectionsData?.items || [];
  const busRoutes = Array.isArray(routesData) ? routesData : [];

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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Class</label>
              <Select
                value={query.class_id ? String(query.class_id) : ''}
                onValueChange={handleClassChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.class_id} value={String(cls.class_id)}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Section</label>
              <Select
                value={query.section_id ? String(query.section_id) : ''}
                onValueChange={(value) => handleQueryChange('section_id', value ? Number(value) : '')}
                disabled={!query.class_id}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={query.class_id ? "Select section (optional)" : "Select class first"} />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((sec: any) => (
                    <SelectItem key={sec.section_id} value={String(sec.section_id)}>
                      {sec.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Bus Route</label>
              <Select
                value={query.bus_route_id ? String(query.bus_route_id) : ''}
                onValueChange={(value) => handleQueryChange('bus_route_id', value ? Number(value) : '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select bus route (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {busRoutes.map((route: any) => (
                    <SelectItem key={route.bus_route_id} value={String(route.bus_route_id)}>
                      {route.route_name} {route.route_no ? `(${route.route_no})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleClear}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Clear
            </Button>
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

