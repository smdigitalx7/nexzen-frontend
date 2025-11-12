import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Bus, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { SchoolReservationRead } from "@/lib/types/school";
import type { CollegeReservationRead } from "@/lib/types/college/reservations";

interface ConcessionUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: SchoolReservationRead | CollegeReservationRead | null;
  onUpdateConcession: (
    reservationId: number,
    tuitionConcession: number,
    transportConcession: number,
    remarks: string
  ) => Promise<void>;
}

export function ConcessionUpdateDialog({
  isOpen,
  onClose,
  reservation,
  onUpdateConcession,
}: ConcessionUpdateDialogProps) {
  // Always call hooks (React rules) - use safe defaults
  const [tuitionConcession, setTuitionConcession] = useState<number>(0);
  const [transportConcession, setTransportConcession] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset form when dialog opens/closes or reservation changes
  useEffect(() => {
    if (isOpen && reservation) {
      setTuitionConcession(reservation.tuition_concession ?? 0);
      setTransportConcession(reservation.transport_concession ?? 0);
      setRemarks(reservation.remarks ?? "");
    } else {
      setTuitionConcession(0);
      setTransportConcession(0);
      setRemarks("");
    }
  }, [isOpen, reservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reservation) return;

    // Validate concession amounts
    if (tuitionConcession < 0 || transportConcession < 0) {
      toast({
        title: "Invalid Concession Amount",
        description: "Concession amounts cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    // Calculate tuition fee based on reservation type
    const reservationTuitionFee = 'total_tuition_fee' in reservation || 'group_fee' in reservation
      ? ((reservation as CollegeReservationRead).total_tuition_fee || 
         ((reservation as CollegeReservationRead).group_fee || 0) + 
         ((reservation as CollegeReservationRead).course_fee || 0))
      : ((reservation as SchoolReservationRead).tuition_fee || 0);
    
    if (tuitionConcession > reservationTuitionFee) {
      toast({
        title: "Invalid Tuition Concession",
        description: "Tuition concession cannot exceed the tuition fee amount.",
        variant: "destructive",
      });
      return;
    }

    if (transportConcession > (reservation.transport_fee || 0)) {
      toast({
        title: "Invalid Transport Concession",
        description:
          "Transport concession cannot exceed the transport fee amount.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateConcession(
        reservation.reservation_id,
        tuitionConcession,
        transportConcession,
        remarks
      );
      onClose();
    } catch (error) {
      // Error handling is done by the parent component
    } finally {
      setIsUpdating(false);
    }
  };

  // Don't render content if reservation is not provided, but keep dialog structure for React reconciliation
  if (!reservation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="hidden">
          {/* Empty content to maintain React structure */}
        </DialogContent>
      </Dialog>
    );
  }

  // Type guard to check if it's a college reservation
  const isCollegeReservation = 'total_tuition_fee' in reservation || 'group_fee' in reservation;
  
  const isLocked = reservation.concession_lock;
  
  // For college reservations, use total_tuition_fee; for school, use tuition_fee
  const tuitionFee = isCollegeReservation
    ? ((reservation as CollegeReservationRead).total_tuition_fee || 
       ((reservation as CollegeReservationRead).group_fee || 0) + 
       ((reservation as CollegeReservationRead).course_fee || 0))
    : ((reservation as SchoolReservationRead).tuition_fee || 0);
  
  const transportFee = reservation.transport_fee || 0;
  const bookFee = reservation.book_fee || 0;
  const applicationFee = reservation.application_fee || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2">
            {isLocked && <Lock className="h-5 w-5 text-amber-600" />}
            Update Concession
            {isLocked && (
              <Badge variant="secondary" className="ml-2">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Update concession amounts for reservation #
            {reservation.reservation_id} - {reservation.student_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
          {/* Fee Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-lg font-bold">₹</span>
                Current Fee Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Tuition Fee</span>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    ₹{tuitionFee.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Transport Fee</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    ₹{transportFee.toLocaleString()}
                  </div>
                </div>
              </div>

              {(bookFee > 0 || applicationFee > 0) && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  {bookFee > 0 && (
                    <div className="space-y-2">
                      <span className="font-medium">Book Fee</span>
                      <div className="text-lg font-semibold text-purple-600">
                        ₹{bookFee.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {applicationFee > 0 && (
                    <div className="space-y-2">
                      <span className="font-medium">Application Fee</span>
                      <div className="text-lg font-semibold text-orange-600">
                        ₹{applicationFee.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Concession Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="tuition-concession"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Tuition Concession
                </Label>
                <Input
                  id="tuition-concession"
                  type="number"
                  min="0"
                  max={tuitionFee}
                  value={tuitionConcession}
                  onChange={(e) => setTuitionConcession(Number(e.target.value))}
                  disabled={isLocked || isUpdating}
                  placeholder="Enter tuition concession amount"
                />
                <div className="text-xs text-muted-foreground">
                  Max: ₹{tuitionFee.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="transport-concession"
                  className="flex items-center gap-2"
                >
                  <Bus className="h-4 w-4" />
                  Transport Concession
                </Label>
                <Input
                  id="transport-concession"
                  type="number"
                  min="0"
                  max={transportFee}
                  value={transportConcession}
                  onChange={(e) =>
                    setTransportConcession(Number(e.target.value))
                  }
                  disabled={isLocked || isUpdating}
                  placeholder="Enter transport concession amount"
                />
                <div className="text-xs text-muted-foreground">
                  Max: ₹{transportFee.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                disabled={isUpdating}
                placeholder="Enter remarks for concession update..."
                rows={3}
              />
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Fees:</span>
                  <span className="font-semibold">
                    ₹
                    {(
                      tuitionFee +
                      transportFee +
                      bookFee +
                      applicationFee
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Concessions:</span>
                  <span className="font-semibold text-red-600">
                    -₹
                    {(tuitionConcession + transportConcession).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Net Amount:</span>
                  <span className="text-green-600">
                    ₹
                    {(
                      tuitionFee +
                      transportFee +
                      bookFee +
                      applicationFee -
                      (tuitionConcession + transportConcession)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLocked || isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? "Updating..." : "Update Concession"}
            </Button>
          </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
