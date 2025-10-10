import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSchoolStudentTransport } from '@/lib/hooks/school/use-school-student-transport';

export const TransportTab = () => {
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; bus_route_id?: number | '' }>({ class_id: '', section_id: '', bus_route_id: '' });
  const result = useSchoolStudentTransport(
    query.class_id
      ? { class_id: Number(query.class_id), section_id: query.section_id ? Number(query.section_id) : undefined, bus_route_id: query.bus_route_id ? Number(query.bus_route_id) : undefined }
      : { class_id: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Class ID</label>
          <Input type="number" placeholder="Enter class ID" value={query.class_id} onChange={(e) => setQuery((q) => ({ ...q, class_id: e.target.value === '' ? '' : Number(e.target.value) }))} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Section ID (optional)</label>
          <Input type="number" placeholder="Enter section ID" value={query.section_id ?? ''} onChange={(e) => setQuery((q) => ({ ...q, section_id: e.target.value === '' ? '' : Number(e.target.value) }))} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Bus Route ID (optional)</label>
          <Input type="number" placeholder="Enter bus route ID" value={query.bus_route_id ?? ''} onChange={(e) => setQuery((q) => ({ ...q, bus_route_id: e.target.value === '' ? '' : Number(e.target.value) }))} />
        </div>
      </div>

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
            {Array.isArray(result.data) && result.data.length > 0 ? (
              result.data.map((route: any) => (
                <div key={route.bus_route_id} className="border rounded-md">
                  <div className="px-4 py-2 font-medium bg-slate-50">{route.route_name}</div>
                  <div className="space-y-4 p-2">
                    {route.classes && Array.isArray(route.classes) && route.classes.length > 0 ? (
                      route.classes.map((classItem: any) => (
                        <div key={classItem.class_id} className="border rounded-md">
                          <div className="px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700">{classItem.class_name}</div>
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
                                  classItem.students.map((s: any) => (
                                    <tr key={s.transport_assignment_id} className="border-t">
                                      <td className="py-2 pr-4">{s.admission_no}</td>
                                      <td className="py-2 pr-4">{s.student_name}</td>
                                      <td className="py-2 pr-4">{s.roll_number}</td>
                                      <td className="py-2 pr-4">{s.section_name}</td>
                                      <td className="py-2 pr-4">{s.slab_name || '-'}</td>
                                      <td className="py-2 pr-4">{s.pickup_point || '-'}</td>
                                      <td className="py-2 pr-4">
                                        <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={7} className="py-2 pr-4 text-center text-slate-500">No students assigned to this class</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-4">No classes assigned to this route</div>
                    )}
                  </div>
                </div>
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

export default TransportTab;


