import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  useCollegeStudentTransportAssignments,
  useCreateCollegeStudentTransportAssignment,
  useDeleteCollegeStudentTransportAssignment
} from '@/lib/hooks/college/use-student-transport-assignments';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CollegeStudentTransportAssignmentsService } from '@/lib/services/college/student-transport-assignments.service';
import { collegeKeys } from '@/lib/hooks/college/query-keys';
import type { 
  CollegeTransportRoute, 
  CollegeTransportGroup, 
  CollegeTransportStudent,
  CollegeTransportAssignmentCreate,
  CollegeTransportAssignmentUpdate
} from '@/lib/types/college/transport-assignments';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export const TransportTab = () => {
  const { toast } = useToast();
  const result = useCollegeStudentTransportAssignments();
  const createMutation = useCreateCollegeStudentTransportAssignment();
  const qc = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: ({ assignmentId, payload }: { assignmentId: number; payload: CollegeTransportAssignmentUpdate }) => 
      CollegeStudentTransportAssignmentsService.update(assignmentId, payload),
    onSuccess: (_, { assignmentId }) => {
      qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.detail(assignmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.studentTransport.root() });
    },
  });
  const deleteMutation = useDeleteCollegeStudentTransportAssignment();

  // State for modals and forms
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<CollegeTransportStudent | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<CollegeTransportAssignmentCreate>({
    enrollment_id: 0,
    bus_route_id: 0,
    slab_id: 0,
    pickup_point: '',
    start_date: '',
    end_date: null,
    is_active: true,
  });

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      setShowCreateDialog(false);
      resetForm();
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleUpdate = async () => {
    if (!editingAssignmentId) return;
    try {
      const updateData: CollegeTransportAssignmentUpdate = {
        bus_route_id: formData.bus_route_id,
        slab_id: formData.slab_id,
        pickup_point: formData.pickup_point,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
      };
      await updateMutation.mutateAsync({ assignmentId: editingAssignmentId, payload: updateData });
      setShowEditDialog(false);
      resetForm();
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    try {
      await deleteMutation.mutateAsync(selectedStudent.transport_assignment_id);
      setShowDeleteDialog(false);
      setSelectedStudent(null);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const resetForm = () => {
    setFormData({
      enrollment_id: 0,
      bus_route_id: 0,
      slab_id: 0,
      pickup_point: '',
      start_date: '',
      end_date: null,
      is_active: true,
    });
  };

  const openEditDialog = (student: CollegeTransportStudent) => {
    setSelectedStudent(student);
    setEditingAssignmentId(student.transport_assignment_id);
    setFormData({
      enrollment_id: student.enrollment_id,
      bus_route_id: 0, // This would need to be fetched from the route
      slab_id: student.slab_id,
      pickup_point: student.pickup_point,
      start_date: student.start_date,
      end_date: student.end_date,
      is_active: student.is_active,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (student: CollegeTransportStudent) => {
    setSelectedStudent(student);
    setShowDeleteDialog(true);
  };

  const openViewDialog = (student: CollegeTransportStudent) => {
    setSelectedStudent(student);
    setShowViewDialog(true);
  };

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transport Assignments</h2>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Assignment
        </Button>
      </div>

      {/* Content */}
      {result.isLoading ? (
        <div className="text-sm text-slate-600">Loading transport assignments...</div>
      ) : result.isError ? (
        <div className="text-sm text-red-600">Failed to load transport assignments</div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(result.data) && result.data.length > 0 ? (
            (result.data as CollegeTransportRoute[]).map((route) => (
              <Card key={route.bus_route_id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Route: {route.route_name} (ID: {route.bus_route_id})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {route.groups.map((group) => (
                    <div key={`${route.bus_route_id}-${group.class_id}-${group.group_id}`} className="border rounded-lg p-4">
                      <h4 className="font-medium text-base mb-3">
                        {group.class_name} • {group.group_name}
                      </h4>
                      {group.students.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left text-slate-600 border-b">
                                <th className="py-2 pr-4">Assignment ID</th>
                                <th className="py-2 pr-4">Enrollment ID</th>
                                <th className="py-2 pr-4">Admission No</th>
                                <th className="py-2 pr-4">Student Name</th>
                                <th className="py-2 pr-4">Roll Number</th>
                                <th className="py-2 pr-4">Slab</th>
                                <th className="py-2 pr-4">Pickup Point</th>
                                <th className="py-2 pr-4">Start Date</th>
                                <th className="py-2 pr-4">End Date</th>
                                <th className="py-2 pr-4">Status</th>
                                <th className="py-2 pr-4">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.students.map((student, index) => (
                                <tr key={student.transport_assignment_id || `student-${index}`} className="border-t">
                                  <td className="py-2 pr-4 font-mono">{student.transport_assignment_id}</td>
                                  <td className="py-2 pr-4">{student.enrollment_id}</td>
                                  <td className="py-2 pr-4">{student.admission_no}</td>
                                  <td className="py-2 pr-4">{student.student_name}</td>
                                  <td className="py-2 pr-4">{student.roll_number}</td>
                                  <td className="py-2 pr-4">{student.slab_name}</td>
                                  <td className="py-2 pr-4">{student.pickup_point || '-'}</td>
                                  <td className="py-2 pr-4">{student.start_date}</td>
                                  <td className="py-2 pr-4">{student.end_date || '-'}</td>
                                  <td className="py-2 pr-4">
                                    <Badge variant={student.is_active ? 'default' : 'secondary'}>
                                      {student.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </td>
                                  <td className="py-2 pr-4">
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openViewDialog(student)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditDialog(student)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openDeleteDialog(student)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">No students assigned to this group.</div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-slate-600 text-center">No transport assignments found.</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Transport Assignment</DialogTitle>
            <DialogDescription>
              Add a new transport assignment for a student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="enrollment_id">Enrollment ID</Label>
              <Input
                id="enrollment_id"
                type="number"
                value={formData.enrollment_id}
                onChange={(e) => setFormData({ ...formData, enrollment_id: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="bus_route_id">Bus Route ID</Label>
              <Input
                id="bus_route_id"
                type="number"
                value={formData.bus_route_id}
                onChange={(e) => setFormData({ ...formData, bus_route_id: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="slab_id">Slab ID</Label>
              <Input
                id="slab_id"
                type="number"
                value={formData.slab_id}
                onChange={(e) => setFormData({ ...formData, slab_id: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="pickup_point">Pickup Point</Label>
              <Input
                id="pickup_point"
                value={formData.pickup_point || ''}
                onChange={(e) => setFormData({ ...formData, pickup_point: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transport Assignment</DialogTitle>
            <DialogDescription>
              Update the transport assignment details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_slab_id">Slab ID</Label>
              <Input
                id="edit_slab_id"
                type="number"
                value={formData.slab_id}
                onChange={(e) => setFormData({ ...formData, slab_id: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="edit_pickup_point">Pickup Point</Label>
              <Input
                id="edit_pickup_point"
                value={formData.pickup_point || ''}
                onChange={(e) => setFormData({ ...formData, pickup_point: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_start_date">Start Date</Label>
              <Input
                id="edit_start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_end_date">End Date (Optional)</Label>
              <Input
                id="edit_end_date"
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="edit_is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transport Assignment Details</DialogTitle>
            <DialogDescription>
              View transport assignment information.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <Label>Assignment ID</Label>
                <div className="text-sm font-mono">{selectedStudent.transport_assignment_id}</div>
              </div>
              <div>
                <Label>Enrollment ID</Label>
                <div className="text-sm">{selectedStudent.enrollment_id}</div>
              </div>
              <div>
                <Label>Student Name</Label>
                <div className="text-sm">{selectedStudent.student_name}</div>
              </div>
              <div>
                <Label>Admission Number</Label>
                <div className="text-sm">{selectedStudent.admission_no}</div>
              </div>
              <div>
                <Label>Roll Number</Label>
                <div className="text-sm">{selectedStudent.roll_number}</div>
              </div>
              <div>
                <Label>Slab</Label>
                <div className="text-sm">{selectedStudent.slab_name}</div>
              </div>
              <div>
                <Label>Pickup Point</Label>
                <div className="text-sm">{selectedStudent.pickup_point || 'Not specified'}</div>
              </div>
              <div>
                <Label>Start Date</Label>
                <div className="text-sm">{selectedStudent.start_date}</div>
              </div>
              <div>
                <Label>End Date</Label>
                <div className="text-sm">{selectedStudent.end_date || 'Not specified'}</div>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={selectedStudent.is_active ? 'default' : 'secondary'}>
                  {selectedStudent.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transport Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transport assignment? This action cannot be undone.
              {selectedStudent && (
                <span className="block mt-2 p-2 bg-red-50 rounded">
                  <strong>Student:</strong> {selectedStudent.student_name} ({selectedStudent.admission_no})
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransportTab;
