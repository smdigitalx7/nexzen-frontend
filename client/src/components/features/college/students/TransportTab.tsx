import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollegeStudentTransportAssignments } from '@/lib/hooks/college/use-student-transport-assignments';
import type { CollegeTransportAssignmentRead } from '@/lib/types/college/transport-assignments';

export const TransportTab = () => {
  const result = useCollegeStudentTransportAssignments();

  return (
    <div className="space-y-4">
      {result.isLoading ? (
        <div className="text-sm text-slate-600">Loading transport assignments...</div>
      ) : result.isError ? (
        <div className="text-sm text-red-600">Failed to load transport assignments</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transport Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(result.data) && result.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600">
                      <th className="py-2 pr-4">Assignment ID</th>
                      <th className="py-2 pr-4">Enrollment ID</th>
                      <th className="py-2 pr-4">Bus Route ID</th>
                      <th className="py-2 pr-4">Slab ID</th>
                      <th className="py-2 pr-4">Pickup Point</th>
                      <th className="py-2 pr-4">Start Date</th>
                      <th className="py-2 pr-4">End Date</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.data as CollegeTransportAssignmentRead[]).map((assignment) => (
                      <tr key={assignment.transport_assignment_id} className="border-t">
                        <td className="py-2 pr-4 font-mono">{assignment.transport_assignment_id}</td>
                        <td className="py-2 pr-4">{assignment.enrollment_id}</td>
                        <td className="py-2 pr-4">{assignment.bus_route_id}</td>
                        <td className="py-2 pr-4">{assignment.slab_id}</td>
                        <td className="py-2 pr-4">{assignment.pickup_point || '-'}</td>
                        <td className="py-2 pr-4">{assignment.start_date}</td>
                        <td className="py-2 pr-4">{assignment.end_date || '-'}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={assignment.is_active ? 'default' : 'secondary'}>{assignment.is_active ? 'Active' : 'Inactive'}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
