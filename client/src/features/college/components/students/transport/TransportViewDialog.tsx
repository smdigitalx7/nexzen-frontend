import { ViewDialog } from '@/common/components/shared';
import type { ViewDialogSection, ViewDialogField } from '@/common/components/shared/ViewDialog';
import { Bus, MapPin, Calendar, User } from 'lucide-react';
import type { CollegeTransportAssignmentRead } from '@/features/college/types';

interface TransportViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewAssignment: CollegeTransportAssignmentRead | null;
  isLoading: boolean;
}

export const TransportViewDialog = ({
  open,
  onOpenChange,
  viewAssignment,
  isLoading,
}: TransportViewDialogProps) => {
  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Transport Assignment Details"
      subtitle={viewAssignment ? `Assignment #${viewAssignment.transport_assignment_id}` : undefined}
      icon={<Bus className="h-5 w-5" />}
      iconColor="blue"
      maxWidth="2xl"
      showCloseButton={false}
      sections={viewAssignment ? [
        {
          title: "Student Information",
          icon: <User className="h-4 w-4" />,
          iconColor: "blue",
          fields: [
            { label: "Student Name", value: viewAssignment.student_name, type: "text" },
            { label: "Admission No", value: viewAssignment.admission_no, type: "text" },
            { label: "Roll Number", value: viewAssignment.roll_number, type: "text" },
            { label: "Class", value: viewAssignment.class_name, type: "text" },
            { label: "Group", value: viewAssignment.group_name, type: "text" },
          ] as ViewDialogField[],
        },
        {
          title: "Transport Information",
          icon: <Bus className="h-4 w-4" />,
          iconColor: "purple",
          fields: [
            { label: "Route Name", value: viewAssignment.route_name, type: "text" },
            { 
              label: "Pickup Point", 
              value: viewAssignment.pickup_point, 
              type: "text",
              icon: <MapPin className="h-3 w-3" />
            },
            { 
              label: "Status", 
              value: viewAssignment.is_active ? "Active" : "Inactive", 
              type: "badge",
              badgeVariant: viewAssignment.is_active ? "default" : "secondary"
            },
          ] as ViewDialogField[],
        },
        {
          title: "Assignment Dates",
          icon: <Calendar className="h-4 w-4" />,
          iconColor: "green",
          fields: [
            { label: "Start Date", value: viewAssignment.start_date, type: "date" },
            { label: "End Date", value: viewAssignment.end_date, type: "date" },
          ] as ViewDialogField[],
        },
        {
          title: "Timestamps",
          icon: <Calendar className="h-4 w-4" />,
          iconColor: "gray",
          fields: [
            { label: "Created", value: viewAssignment.created_at, type: "date" },
            { label: "Last Updated", value: viewAssignment.updated_at || null, type: "date" },
          ] as ViewDialogField[],
        },
      ] as ViewDialogSection[] : []}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-slate-600">Loading assignment details...</p>
          </div>
        </div>
      )}
      {!isLoading && !viewAssignment && (
        <div className="text-center py-8 text-red-600">
          <p>Failed to load assignment details.</p>
        </div>
      )}
    </ViewDialog>
  );
};

