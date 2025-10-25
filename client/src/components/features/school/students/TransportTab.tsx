import { useState, useMemo, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSchoolStudentTransport } from '@/lib/hooks/school/use-school-student-transport';

// Memoized student row component
const StudentRow = memo(({ student }: { student: any }) => (
  <tr key={student.transport_assignment_id} className="border-t">
    <td className="py-2 pr-4">{student.admission_no}</td>
    <td className="py-2 pr-4">{student.student_name}</td>
    <td className="py-2 pr-4">{student.roll_number}</td>
    <td className="py-2 pr-4">{student.section_name}</td>
    <td className="py-2 pr-4">{student.slab_name || '-'}</td>
    <td className="py-2 pr-4">{student.pickup_point || '-'}</td>
    <td className="py-2 pr-4">
      <Badge variant={student.is_active ? 'default' : 'secondary'}>
        {student.is_active ? 'Active' : 'Inactive'}
      </Badge>
    </td>
  </tr>
));

StudentRow.displayName = "StudentRow";

// Memoized class group component
const ClassGroup = memo(({ classItem }: { classItem: any }) => (
  <div key={classItem.class_id} className="border rounded-md">
    <div className="px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700">
      {classItem.class_name}
    </div>
    <div className="overflow-x-auto p-2">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600">
            <th className="py-2 pr-4">Admission No</th>
            <th className="py-2 pr-4">Student</th>
            <th className="py-2 pr-4">Roll No</th>
            <th className="py-2 pr-4">Section</th>
            <th className="py-2 pr-4">Slab</th>
            <th className="py-2 pr-4">Pickup</th>
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {classItem.students && Array.isArray(classItem.students) && classItem.students.length > 0 ? (
            classItem.students.map((student: any) => (
              <StudentRow key={student.transport_assignment_id} student={student} />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="py-2 pr-4 text-center text-slate-500">
                No students assigned to this class
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
));

ClassGroup.displayName = "ClassGroup";

// Memoized route group component
const RouteGroup = memo(({ route }: { route: any }) => (
  <div key={route.bus_route_id} className="border rounded-md">
    <div className="px-4 py-2 font-medium bg-slate-50">{route.route_name}</div>
    <div className="space-y-4 p-2">
      {route.classes && Array.isArray(route.classes) && route.classes.length > 0 ? (
        route.classes.map((classItem: any) => (
          <ClassGroup key={classItem.class_id} classItem={classItem} />
        ))
      ) : (
        <div className="text-center text-slate-500 py-4">
          No classes assigned to this route
        </div>
      )}
    </div>
  </div>
));

RouteGroup.displayName = "RouteGroup";

// Memoized search form component
const SearchForm = memo(({ 
  query, 
  onQueryChange 
}: { 
  query: { class_id: number | ''; section_id?: number | ''; bus_route_id?: number | '' };
  onQueryChange: (field: string, value: any) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <div>
      <label className="text-sm font-medium text-slate-700">Class ID</label>
      <Input 
        type="number" 
        placeholder="Enter class ID" 
        value={query.class_id} 
        onChange={(e) => onQueryChange('class_id', e.target.value === '' ? '' : Number(e.target.value))} 
      />
    </div>
    <div>
      <label className="text-sm font-medium text-slate-700">Section ID (optional)</label>
      <Input 
        type="number" 
        placeholder="Enter section ID" 
        value={query.section_id ?? ''} 
        onChange={(e) => onQueryChange('section_id', e.target.value === '' ? '' : Number(e.target.value))} 
      />
    </div>
    <div>
      <label className="text-sm font-medium text-slate-700">Bus Route ID (optional)</label>
      <Input 
        type="number" 
        placeholder="Enter bus route ID" 
        value={query.bus_route_id ?? ''} 
        onChange={(e) => onQueryChange('bus_route_id', e.target.value === '' ? '' : Number(e.target.value))} 
      />
    </div>
  </div>
));

SearchForm.displayName = "SearchForm";

const TransportTabComponent = () => {
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; bus_route_id?: number | '' }>({ 
    class_id: '', 
    section_id: '', 
    bus_route_id: '' 
  });

  // Memoized API parameters
  const apiParams = useMemo(() => {
    return query.class_id
      ? { 
          class_id: Number(query.class_id), 
          section_id: query.section_id ? Number(query.section_id) : undefined, 
          bus_route_id: query.bus_route_id ? Number(query.bus_route_id) : undefined 
        }
      : { class_id: 0 };
  }, [query.class_id, query.section_id, query.bus_route_id]);

  // API hook with memoized parameters
  const result = useSchoolStudentTransport(apiParams);

  // Memoized handlers
  const handleQueryChange = useCallback((field: string, value: any) => {
    setQuery(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoized transport data
  const transportData = useMemo(() => {
    return result.data || [];
  }, [result.data]);

  return (
    <div className="space-y-4">
      <SearchForm
        query={query}
        onQueryChange={handleQueryChange}
      />

      {query.class_id === '' ? (
        <div className="text-sm text-slate-600">Enter a class ID to load transport assignments.</div>
      ) : result.isLoading ? (
        <div className="text-sm text-slate-600">Loading transport assignments...</div>
      ) : result.isError ? (
        <div className="text-sm text-red-600">Failed to load transport assignments</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transport Assignments (Grouped by Route)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(transportData) && transportData.length > 0 ? (
              transportData.map((route: any) => (
                <RouteGroup key={route.bus_route_id} route={route} />
              ))
            ) : (
              <div className="text-sm text-slate-600">No transport assignments found.</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const TransportTab = TransportTabComponent;
export default TransportTabComponent;

