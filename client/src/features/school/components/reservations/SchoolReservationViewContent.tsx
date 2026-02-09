import { memo } from "react";
import { Badge } from "@/common/components/ui/badge";

export interface SchoolReservationViewContentProps {
  viewReservation: Record<string, unknown>;
  routeNames?: Array<{ bus_route_id: number; route_name?: string }>;
  distanceSlabs?: Array<{ slab_id: number; slab_name?: string }>;
  classes?: Array<{ class_id: number; class_name?: string }>;
}

export const SchoolReservationViewContent = memo(
  ({
    viewReservation,
    routeNames = [],
    distanceSlabs = [],
    classes = [],
  }: SchoolReservationViewContentProps) => {
    const routeName = viewReservation.preferred_transport_id
      ? routeNames.find(
          (r) => r.bus_route_id === Number(viewReservation.preferred_transport_id)
        )?.route_name || `ID: ${viewReservation.preferred_transport_id}`
      : "-";

    const slabName = viewReservation.preferred_distance_slab_id
      ? distanceSlabs.find(
          (s) => s.slab_id === Number(viewReservation.preferred_distance_slab_id)
        )?.slab_name || `ID: ${viewReservation.preferred_distance_slab_id}`
      : "-";

    const className =
      (viewReservation.class_name as string) ||
      (viewReservation.preferred_class_id
        ? classes.find(
            (c) => c.class_id === Number(viewReservation.preferred_class_id)
          )?.class_name || `ID: ${viewReservation.preferred_class_id}`
        : "-");

    return (
      <div className="space-y-6 text-sm flex-1 overflow-y-auto scrollbar-hide pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Reservation No:</strong>{" "}
            {(viewReservation.reservation_no as string) || "-"}
          </div>
          <div>
            <strong>Reservation Date:</strong>{" "}
            {(viewReservation.reservation_date as string) || "-"}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <Badge
              variant={
                viewReservation.status === "CONFIRMED"
                  ? "secondary"
                  : viewReservation.status === "CANCELLED"
                    ? "destructive"
                    : "default"
              }
              className={
                viewReservation.status === "CONFIRMED"
                  ? "bg-green-500 text-white"
                  : ""
              }
            >
              {(viewReservation.status as string) || "-"}
            </Badge>
          </div>
          <div>
            <strong>Enrollment Status:</strong>{" "}
            {viewReservation.is_enrolled ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Enrolled
              </Badge>
            ) : (
              <Badge variant="outline">Not Enrolled</Badge>
            )}
          </div>
          <div>
            <strong>Referred By:</strong>{" "}
            {(viewReservation.referred_by_name as string) ||
              (viewReservation.referred_by as string) ||
              "-"}
          </div>
          <div>
            <strong>Concession Lock:</strong>{" "}
            {viewReservation.concession_lock ? (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Locked
              </Badge>
            ) : (
              <Badge variant="outline">Unlocked</Badge>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="font-medium mb-2">Student Details</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Name:</strong> {(viewReservation.student_name as string) || "-"}
            </div>
            <div>
              <strong>Aadhar No:</strong> {(viewReservation.aadhar_no as string) || "-"}
            </div>
            <div>
              <strong>Gender:</strong> {(viewReservation.gender as string) || "-"}
            </div>
            <div>
              <strong>Date of Birth:</strong> {(viewReservation.dob as string) || "-"}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="font-medium mb-2">Father/Guardian Details</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Name:</strong>{" "}
              {(viewReservation.father_or_guardian_name as string) || "-"}
            </div>
            <div>
              <strong>Aadhar No:</strong>{" "}
              {(viewReservation.father_or_guardian_aadhar_no as string) || "-"}
            </div>
            <div>
              <strong>Mobile:</strong>{" "}
              {(viewReservation.father_or_guardian_mobile as string) || "-"}
            </div>
            <div>
              <strong>Occupation:</strong>{" "}
              {(viewReservation.father_or_guardian_occupation as string) || "-"}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="font-medium mb-2">Mother/Guardian Details</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Name:</strong>{" "}
              {(viewReservation.mother_or_guardian_name as string) || "-"}
            </div>
            <div>
              <strong>Aadhar No:</strong>{" "}
              {(viewReservation.mother_or_guardian_aadhar_no as string) || "-"}
            </div>
            <div>
              <strong>Mobile:</strong>{" "}
              {(viewReservation.mother_or_guardian_mobile as string) || "-"}
            </div>
            <div>
              <strong>Occupation:</strong>{" "}
              {(viewReservation.mother_or_guardian_occupation as string) || "-"}
            </div>
          </div>
        </div>

        {viewReservation.siblings &&
          Array.isArray(viewReservation.siblings) &&
          (viewReservation.siblings as unknown[]).length > 0 && (
            <div className="border-t pt-4">
              <div className="font-medium mb-2">Siblings</div>
              <div className="space-y-2">
                {(viewReservation.siblings as Array<{ name?: string; class_name?: string; where?: string; gender?: string }>).map(
                  (sibling, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-4 p-2 bg-muted rounded"
                    >
                      <div>
                        <strong>Name:</strong> {sibling.name || "-"}
                      </div>
                      <div>
                        <strong>Class:</strong> {sibling.class_name || "-"}
                      </div>
                      <div>
                        <strong>Where:</strong> {sibling.where || "-"}
                      </div>
                      <div>
                        <strong>Gender:</strong> {sibling.gender || "-"}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        <div className="border-t pt-4">
          <div className="font-medium mb-2">Academic Details</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Preferred Class:</strong> {className}
            </div>
            <div>
              <strong>Previous Class:</strong>{" "}
              {(viewReservation.previous_class as string) || "-"}
            </div>
            <div>
              <strong>Previous School:</strong>{" "}
              {(viewReservation.previous_school_details as string) || "-"}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="font-medium mb-2">Address Details</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Present Address:</strong>{" "}
              {(viewReservation.present_address as string) || "-"}
            </div>
            <div>
              <strong>Permanent Address:</strong>{" "}
              {(viewReservation.permanent_address as string) || "-"}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="font-medium mb-2">Fee Details</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Application Fee:</span>
              <span>
                ₹
                {Number(viewReservation.application_fee || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Application Fee Paid:</span>
              <span>
                {viewReservation.application_fee_paid ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="outline">No</Badge>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tuition Fee:</span>
              <span>
                ₹{Number(viewReservation.tuition_fee || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tuition Concession:</span>
              <span>
                ₹
                {Number(viewReservation.tuition_concession || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Book Fee:</span>
              <span>
                ₹{Number(viewReservation.book_fee || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transport Fee:</span>
              <span>
                ₹{Number(viewReservation.transport_fee || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transport Concession:</span>
              <span>
                ₹
                {Number(viewReservation.transport_concession || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {viewReservation.transport_required && (
          <div className="border-t pt-4">
            <div className="font-medium mb-2">Transport Details</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Transport Required:</strong>{" "}
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Yes
                </Badge>
              </div>
              <div>
                <strong>Preferred Transport Route:</strong> {routeName}
              </div>
              <div>
                <strong>Preferred Distance Slab:</strong> {slabName}
              </div>
              <div>
                <strong>Pickup Point:</strong>{" "}
                {(viewReservation.pickup_point as string) || "-"}
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="font-medium mb-2">Additional Information</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Remarks:</strong> {(viewReservation.remarks as string) || "-"}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="font-medium mb-2">System Information</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Created At:</strong>{" "}
              {viewReservation.created_at
                ? new Date(viewReservation.created_at as string).toLocaleString()
                : "-"}
            </div>
            <div>
              <strong>Updated At:</strong>{" "}
              {viewReservation.updated_at
                ? new Date(viewReservation.updated_at as string).toLocaleString()
                : "-"}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SchoolReservationViewContent.displayName = "SchoolReservationViewContent";
