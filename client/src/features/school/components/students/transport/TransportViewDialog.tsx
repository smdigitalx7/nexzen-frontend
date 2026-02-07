import { useState, useEffect, useCallback, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/common/components/ui/sheet";
import { Button } from "@/common/components/ui/button";
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { DatePicker } from '@/common/components/ui/date-picker';
import { BusRouteDropdown } from '@/common/components/shared/Dropdowns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Loader } from '@/common/components/ui/ProfessionalLoader';
import { Bus, Calendar, User, Edit, Save, X, Ban } from 'lucide-react';
import type { SchoolStudentTransportAssignmentRead, SchoolStudentTransportAssignmentUpdate } from '@/features/school/types';
import { useUpdateSchoolStudentTransport, useCancelSchoolStudentTransport } from '@/features/school/hooks';
import type { BusRouteRead } from '@/features/general/types/transport';
import type { DistanceSlabRead } from '@/features/general/types/distance-slabs';

interface TransportViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewAssignment: SchoolStudentTransportAssignmentRead | null;
  isLoading: boolean;
  busRoutes: BusRouteRead[];
  slabs: DistanceSlabRead[]; // Kept for potential future use
  /** When true, sheet opens directly in edit mode (e.g. when user clicked Edit in the table) */
  defaultEditMode?: boolean;
  onSuccess?: () => void;
}

export const TransportViewDialog = ({
  open,
  onOpenChange,
  viewAssignment,
  isLoading,
  busRoutes: _busRoutes,
  slabs: _slabs,
  defaultEditMode = false,
  onSuccess,
}: TransportViewDialogProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelEndDate, setCancelEndDate] = useState<string>('');
  
  // Update mutation
  const updateMutation = useUpdateSchoolStudentTransport();
  const cancelMutation = useCancelSchoolStudentTransport();
  
  // Form state - only fields that can be updated
  const [formData, setFormData] = useState({
    bus_route_id: 0,
    pickup_point: '',
  });
  
  // Only reset cancelEndDate when sheet opens (not on every viewAssignment refetch) to avoid clearing date picker
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (viewAssignment && open) {
      setFormData({
        bus_route_id: viewAssignment.bus_route_id,
        pickup_point: viewAssignment.pickup_point || '',
      });
      setIsEditMode(defaultEditMode);
      if (!prevOpenRef.current) setCancelEndDate('');
    }
    prevOpenRef.current = open;
  }, [viewAssignment, open, defaultEditMode]);
  
  const handleSave = async () => {
    if (!viewAssignment?.transport_assignment_id) return;
    
    try {
      // API only accepts bus_route_id and pickup_point
      const updatePayload: SchoolStudentTransportAssignmentUpdate = {
        bus_route_id: formData.bus_route_id || undefined,
        pickup_point: formData.pickup_point || undefined,
      };
      
      // Remove undefined values
      if (updatePayload.bus_route_id === undefined) delete updatePayload.bus_route_id;
      if (updatePayload.pickup_point === undefined) delete updatePayload.pickup_point;
      
      await updateMutation.mutateAsync({ 
        id: viewAssignment.transport_assignment_id, 
        payload: updatePayload 
      });
      setIsEditMode(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Failed to update transport assignment:', error);
    }
  };
  
  const handleEditCancel = () => {
    if (viewAssignment) {
      setFormData({
        bus_route_id: viewAssignment.bus_route_id,
        pickup_point: viewAssignment.pickup_point || '',
      });
    }
    setIsEditMode(false);
  };

  const handleCancelTransport = useCallback(async () => {
    if (!viewAssignment?.transport_assignment_id || !cancelEndDate) return;
    
    try {
      await cancelMutation.mutateAsync({
        transport_assignment_id: viewAssignment.transport_assignment_id,
        end_date: cancelEndDate,
      });
      setIsCancelDialogOpen(false);
      setCancelEndDate('');
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Failed to cancel transport assignment:', error);
    }
  }, [viewAssignment?.transport_assignment_id, cancelEndDate, cancelMutation, onSuccess]);

  const isSaving = updateMutation.isPending || cancelMutation.isPending;
  const isUpdateDisabled = !formData.bus_route_id || !formData.pickup_point?.trim();
  const isCancelDisabled = !cancelEndDate;
  const isActive = viewAssignment?.is_active && !viewAssignment?.end_date;

  // Prevent Sheet from closing when Cancel Transport dialog or date picker is open
  const handleSheetOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen && isCancelDialogOpen) return;
      onOpenChange(newOpen);
    },
    [onOpenChange, isCancelDialogOpen]
  );

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent side="right" className="!w-[900px] sm:!w-[600px] !max-w-[800px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-blue-600" />
                  {isEditMode ? 'Edit Transport Assignment' : 'Transport Assignment Details'}
                </SheetTitle>
                <SheetDescription>
                  {viewAssignment ? `Assignment #${viewAssignment.transport_assignment_id}` : 'View transport assignment details'}
                </SheetDescription>
              </div>
              {!isEditMode && viewAssignment && (
                <div className="flex gap-2">
                  {isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCancelDialogOpen(true)}
                      className="gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <Ban className="h-4 w-4" />
                      Cancel Transport
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditMode(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              )}
              {isEditMode && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditCancel}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void handleSave()}
                    disabled={isUpdateDisabled || isSaving}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </SheetHeader>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-slate-600">Loading assignment details...</p>
              </div>
            </div>
          )}

          {!isLoading && !viewAssignment && (
            <div className="text-center py-12 text-red-500">
              <p>Failed to load assignment details.</p>
            </div>
          )}

          {!isLoading && viewAssignment && !isEditMode && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <User className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-sm">Student Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Student Name</p>
                    <p className="text-sm font-medium break-words">{viewAssignment.student_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Admission No</p>
                    <p className="text-sm font-medium break-words">{viewAssignment.admission_no || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Roll Number</p>
                    <p className="text-sm font-medium break-words">{viewAssignment.roll_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Class</p>
                    <p className="text-sm font-medium break-words">{viewAssignment.class_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Section</p>
                    <p className="text-sm font-medium break-words">{viewAssignment.section_name || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Transport Information */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <Bus className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-sm">Transport Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Route Name</p>
                    <p className="text-sm font-medium break-words">{viewAssignment.route_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Distance Slab</p>
                    <p className="text-sm font-medium break-words">{viewAssignment.slab_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Pickup Point</p>
                    <p className="text-sm font-medium break-words">{viewAssignment.pickup_point || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Status</p>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      viewAssignment.is_active && !viewAssignment.end_date ? 'border-transparent bg-primary text-primary-foreground' : 'border-transparent bg-secondary text-secondary-foreground'
                    }`}>
                      {viewAssignment.is_active && !viewAssignment.end_date ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignment Dates */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-sm">Assignment Dates</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Start Date</p>
                    <p className="text-sm font-medium break-words">
                      {viewAssignment.start_date ? new Date(viewAssignment.start_date).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">End Date</p>
                    <p className="text-sm font-medium break-words">
                      {viewAssignment.end_date ? new Date(viewAssignment.end_date).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <h4 className="font-semibold text-sm">Timestamps</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Created</p>
                    <p className="text-sm font-medium break-words">
                      {viewAssignment.created_at ? new Date(viewAssignment.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  {viewAssignment.updated_at && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Last Updated</p>
                      <p className="text-sm font-medium break-words">
                        {new Date(viewAssignment.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isLoading && viewAssignment && isEditMode && (
            <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Transport Information Edit */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <Bus className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-sm">Transport Information</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit_bus_route_id">Bus Route *</Label>
                    <BusRouteDropdown
                      value={formData.bus_route_id || null}
                      onChange={(value) => setFormData({ ...formData, bus_route_id: value || 0 })}
                      placeholder="Select bus route"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_pickup_point">Pickup Point *</Label>
                    <Input
                      id="edit_pickup_point"
                      value={formData.pickup_point || ''}
                      onChange={(e) => setFormData({ ...formData, pickup_point: e.target.value })}
                      placeholder="Enter pickup point"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Note: Only bus route and pickup point can be updated. Other fields are managed by the system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Cancel Transport Confirmation - Dialog supports outside-event handlers so date picker popover stays open */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent
          showCloseButton={false}
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest?.('[data-datepicker-popover]')) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest?.('[data-datepicker-popover]')) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Cancel Transport Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this transport assignment? This will set an end date and adjust fee balances. Term1 must be fully paid before cancellation.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="cancel_end_date">End Date *</Label>
              <DatePicker
                id="cancel_end_date"
                value={cancelEndDate}
                onChange={(value) => setCancelEndDate(value)}
                placeholder="Select cancellation date"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The transport assignment will be cancelled on this date.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={cancelMutation.isPending}
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancelEndDate('');
              }}
            >
              Keep Active
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isCancelDisabled || cancelMutation.isPending}
              onClick={() => void handleCancelTransport()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending && <span className="mr-2"><Loader.Button size="sm" /></span>}
              Cancel Transport
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
