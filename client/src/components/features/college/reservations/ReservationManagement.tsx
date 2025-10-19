import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCollegeReservationsList, useDeleteCollegeReservation, useCollegeReservationDashboard } from "@/lib/hooks/college/use-college-reservations";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/store/authStore";
import { Printer } from "lucide-react";
import ReservationForm from "../reservations/ReservationForm";
import ReservationsTable from "../reservations/ReservationsTable";
import { TransportService } from "@/lib/services/general/transport.service";
import { CollegeReservationsService } from "@/lib/services/college/reservations.service";
import { Plus, List, BarChart3 } from "lucide-react";
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CollegeReservationStatsCards } from "./CollegeReservationStatsCards";

const classFeeMap: Record<string, number> = {
  I: 12000,
  II: 13000,
  III: 14000,
  IV: 15000,
  V: 16000,
  VI: 17000,
  VII: 18000,
  VIII: 19000,
  IX: 20000,
  X: 21000,
  "XI-MPC": 45000,
  "XI-BiPC": 45000,
  "XII-MPC": 48000,
  "XII-BiPC": 48000,
};

// Reservations are loaded from backend

export default function ReservationNew() {
  const { academicYear } = useAuthStore();
  const { data: routeNames = [] } = useQuery({ queryKey: ["public","bus-routes","names"], queryFn: () => TransportService.getRouteNames() });
  
  // Dashboard stats hook
  const { data: dashboardStats, isLoading: dashboardLoading } = useCollegeReservationDashboard();
  
  const [activeTab, setActiveTab] = useState("new");
  const [reservationNo, setReservationNo] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewReservation, setViewReservation] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<any>(null);
  const [statusChanges, setStatusChanges] = useState<Record<string, 'PENDING' | 'CONFIRMED' | 'CANCELLED'>>({});
  const [statusRemarks, setStatusRemarks] = useState<Record<string, string>>({});
  const [loadingReservation, setLoadingReservation] = useState<number | null>(null);
  
  // Use React Query hook for reservations
  const { 
    data: reservationsData, 
    isLoading: isLoadingReservations, 
    isError: reservationsError, 
    error: reservationsErrObj,
    refetch: refetchReservations 
  } = useCollegeReservationsList({ page: 1, page_size: 20 });


  // Delete reservation hook
  const deleteReservation = useDeleteCollegeReservation();
  
  // Process reservations data
  const allReservations = useMemo(() => {
    if (!reservationsData?.reservations) return [];
    
    if (!Array.isArray(reservationsData.reservations)) return [];
    
    return reservationsData.reservations.map((r: any) => ({
      id: String(r.reservation_id),
      studentName: r.student_name,
      classAdmission: r.group_name ? `${r.group_name}${r.course_name ? ` - ${r.course_name}` : ''}` : r.admit_into || '',
      status: r.status || 'PENDING',
      date: r.reservation_date || '',
      totalFee: Number(r.total_tuition_fee || 0) + Number(r.transport_fee || 0),
    }));
  }, [reservationsData]);

  const [form, setForm] = useState({
    // Personal Details
    studentName: "",
    studentAadhar: "",
    fatherName: "",
    fatherAadhar: "",
    motherName: "",
    motherAadhar: "",
    fatherOccupation: "",
    motherOccupation: "",
    gender: "",
    dob: "",

    // Previous School Details
    previousSchool: "",
    village: "",
    lastClass: "",

    // Contact Details
    presentAddress: "",
    permanentAddress: "",
    fatherMobile: "",
    motherMobile: "",

    // Academic Details
    classAdmission: "",
    group: "N/A",
    course: "N/A",

    // Fee Setup
    transport: "No",
    busRoute: "",

    // Payments
    applicationFee: "",
    reservationFee: "",

    // Advanced (new fields)
    preferredClassId: "0",
    preferredDistanceSlabId: "0",
    bookFee: "0",
    tuitionConcession: "0",
    transportConcession: "0",
    referredBy: "",
    reservationDate: "",
    siblingsJson: "",

    // Remarks
    remarks: "",
  });

  const classFee = useMemo(() => {
    return classFeeMap[form.classAdmission] || 0;
  }, [form.classAdmission]);

  const transportFee = useMemo(() => {
    if (form.transport === "Yes") {
      // For now, return a default fee since we don't have fee data in the route names
      // This would need to be enhanced to include fee information
      return 5000; // Default transport fee
    }
    return 0;
  }, [form.transport, form.busRoute]);

  const handleSave = async (withPayment: boolean) => {
    // Parse siblings JSON if provided
    let siblings = null;
    if ((form.siblingsJson || '').trim()) {
      try {
        siblings = JSON.parse(form.siblingsJson);
      } catch (e) {
        console.warn('Invalid siblings JSON:', e);
      }
    }

    const payload = {
      student_name: form.studentName,
      aadhar_no: form.studentAadhar || null,
      gender: (form.gender || "OTHER").toUpperCase() as "MALE" | "FEMALE" | "OTHER",
      dob: form.dob || null,
      father_name: form.fatherName || null,
      father_aadhar_no: form.fatherAadhar || null,
      father_mobile: form.fatherMobile || null,
      father_occupation: form.fatherOccupation || null,
      mother_name: form.motherName || null,
      mother_aadhar_no: form.motherAadhar || null,
      mother_mobile: form.motherMobile || null,
      mother_occupation: form.motherOccupation || null,
      siblings: siblings,
      previous_class: form.lastClass || null,
      previous_school_details: form.previousSchool || null,
      present_address: form.presentAddress || null,
      permanent_address: form.permanentAddress || null,
      reservation_fee: Number(form.reservationFee || 0) || null,
      preferred_group_id: Number(form.preferredClassId || 0),
      preferred_course_id: Number(form.course || 0), // This needs to be mapped properly
      group_fee: Number(classFee || 0) || null,
      course_fee: Number(classFee || 0) || null,
      book_fee: Number(form.bookFee || 0) || null,
      total_tuition_fee: Number(classFee || 0) || null,
      preferred_transport_id: form.transport === "Yes" && form.busRoute ? Number(form.busRoute) : null,
      preferred_distance_slab_id: form.preferredDistanceSlabId ? Number(form.preferredDistanceSlabId) : null,
      pickup_point: null,
      transport_fee: form.transport === "Yes" ? Number(transportFee || 0) : null,
      status: "PENDING" as "PENDING" | "CONFIRMED" | "CANCELLED",
      referred_by: form.referredBy ? Number(form.referredBy) : null,
      remarks: form.remarks || null,
    };

    try {
      const res: any = await CollegeReservationsService.create(payload);
      // Use backend reservation_id to display receipt number
      setReservationNo(String(res?.reservation_id || ""));
      if (withPayment) setShowReceipt(true);
      // Refresh list after creating
      if (activeTab === 'all') {
        refetchReservations();
      }
    } catch (e: any) {
      alert(e?.message || "Failed to create reservation");
    }
  };

  const buildPayloadFromForm = (f: any) => {
    // Parse siblings JSON if provided
    let siblings = null;
    if ((f.siblingsJson || '').trim()) {
      try {
        siblings = JSON.parse(f.siblingsJson);
      } catch (e) {
        console.warn('Invalid siblings JSON:', e);
      }
    }

    return {
      student_name: f.studentName,
      aadhar_no: f.studentAadhar || null,
      gender: (f.gender || "OTHER").toUpperCase() as "MALE" | "FEMALE" | "OTHER",
      dob: f.dob || null,
      father_name: f.fatherName || null,
      father_aadhar_no: f.fatherAadhar || null,
      father_mobile: f.fatherMobile || null,
      father_occupation: f.fatherOccupation || null,
      mother_name: f.motherName || null,
      mother_aadhar_no: f.motherAadhar || null,
      mother_mobile: f.motherMobile || null,
      mother_occupation: f.motherOccupation || null,
      siblings: siblings,
      previous_class: f.lastClass || null,
      previous_school_details: f.previousSchool || null,
      present_address: f.presentAddress || null,
      permanent_address: f.permanentAddress || null,
      reservation_fee: Number(f.reservationFee || 0) || null,
      preferred_group_id: Number(f.preferredClassId || 0),
      preferred_course_id: Number(f.course || 0),
      group_fee: Number(classFee || 0) || null,
      course_fee: Number(classFee || 0) || null,
      book_fee: Number(f.bookFee || 0) || null,
      total_tuition_fee: Number(classFee || 0) || null,
      preferred_transport_id: f.transport === "Yes" && f.busRoute ? Number(f.busRoute) : null,
      preferred_distance_slab_id: f.preferredDistanceSlabId ? Number(f.preferredDistanceSlabId) : null,
      pickup_point: null,
      transport_fee: f.transport === "Yes" ? Number(transportFee || 0) : null,
      status: "PENDING" as "PENDING" | "CONFIRMED" | "CANCELLED",
      referred_by: f.referredBy ? Number(f.referredBy) : null,
      remarks: f.remarks || null,
    };
  };

  const mapApiToForm = (r: any) => ({
    studentName: r.student_name || "",
    studentAadhar: r.aadhar_no || "",
    fatherName: r.father_name || "",
    fatherAadhar: r.father_aadhar_no || "",
    motherName: r.mother_name || "",
    motherAadhar: r.mother_aadhar_no || "",
    fatherOccupation: r.father_occupation || "",
    motherOccupation: r.mother_occupation || "",
    gender: (r.gender || "").toString(),
    dob: r.dob || "",
    previousSchool: r.previous_school_details || "",
    village: "",
    lastClass: r.previous_class || "",
    presentAddress: r.present_address || "",
    permanentAddress: r.permanent_address || "",
    fatherMobile: r.father_mobile || "",
    motherMobile: r.mother_mobile || "",
    classAdmission: r.group_name ? `${r.group_name}${r.course_name ? ` - ${r.course_name}` : ''}` : "",
    group: r.group_name || "",
    course: r.course_name || "N/A",
    transport: r.preferred_transport_id ? "Yes" : "No",
    busRoute: r.preferred_transport_id ? String(r.preferred_transport_id) : "",
    applicationFee: "",
    reservationFee: r.reservation_fee != null ? String(r.reservation_fee) : "",
    remarks: r.remarks || "",
    preferredClassId: r.preferred_group_id != null ? String(r.preferred_group_id) : "0",
    preferredDistanceSlabId: r.preferred_distance_slab_id != null ? String(r.preferred_distance_slab_id) : "0",
    bookFee: r.book_fee != null ? String(r.book_fee) : "0",
    tuitionConcession: r.tuition_concession != null ? String(r.tuition_concession) : "0",
    transportConcession: r.transport_concession != null ? String(r.transport_concession) : "0",
    referredBy: r.referred_by != null ? String(r.referred_by) : "",
    reservationDate: r.reservation_date || "",
    siblingsJson: JSON.stringify(r.siblings || []),
  });

  const handleView = async (r: any) => {
    if (!r?.id || isNaN(Number(r.id))) {
      alert('Invalid reservation ID');
      return;
    }
    
    if (loadingReservation === Number(r.id)) {
      return; // Already loading this reservation
    }
    
    setLoadingReservation(Number(r.id));
    try {
      const data = await CollegeReservationsService.getById(Number(r.id));
      setViewReservation(data);
      setShowViewDialog(true);
    } catch (e: any) {
      console.error('Error loading reservation:', e);
      if (e?.response?.status === 404) {
        alert('Reservation not found. It may have been deleted or you may not have permission to view it.');
      } else if (e?.response?.status === 500) {
        alert('Server error occurred while loading reservation. Please try again later.');
      } else {
        alert(e?.message || 'Failed to load reservation');
      }
    } finally {
      setLoadingReservation(null);
    }
  };

  const handleEdit = async (r: any) => {
    if (!r?.id || isNaN(Number(r.id))) {
      alert('Invalid reservation ID');
      return;
    }
    
    if (loadingReservation === Number(r.id)) {
      return; // Already loading this reservation
    }
    
    setLoadingReservation(Number(r.id));
    try {
      const data: any = await CollegeReservationsService.getById(Number(r.id));
      setEditForm(mapApiToForm(data));
      setSelectedReservation({ id: r.id });
      setShowEditDialog(true);
    } catch (e: any) {
      console.error('Error loading reservation for edit:', e);
      if (e?.response?.status === 404) {
        alert('Reservation not found. It may have been deleted or you may not have permission to edit it.');
      } else if (e?.response?.status === 500) {
        alert('Server error occurred while loading reservation. Please try again later.');
      } else {
        alert(e?.message || 'Failed to load reservation');
      }
    } finally {
      setLoadingReservation(null);
    }
  };

  const submitEdit = async () => {
    if (!selectedReservation?.id || !editForm) return;
    try {
      const payload = buildPayloadFromForm(editForm);
      await CollegeReservationsService.update(Number(selectedReservation.id), payload);
      setShowEditDialog(false);
      refetchReservations();
    } catch (e: any) {
      alert(e?.message || 'Failed to update reservation');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelReservation = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelRemarks.trim()) {
      alert("Please provide cancellation remarks");
      return;
    }
    try {
      if (selectedReservation?.id) {
        await CollegeReservationsService.updateStatus(Number(selectedReservation.id), { 
          status: 'CANCELLED' as "PENDING" | "CONFIRMED" | "CANCELLED",
          remarks: cancelRemarks || null
        });
        // refresh list
        refetchReservations();
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to cancel reservation');
    } finally {
      setShowCancelDialog(false);
      setCancelRemarks("");
      setSelectedReservation(null);
    }
  };

  const handleConvertToAdmission = (reservation: any) => {
    // Navigate to admissions page with reservation data
    window.location.href = `/admissions/new?reservation=${reservation.id}`;
  };

  // Handle reservations errors
  useEffect(() => {
    if (reservationsError) {
      // Error handling is done in the UI components
    }
  }, [reservationsError, reservationsErrObj]);

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reservations</h1>
            <p className="text-muted-foreground">Manage student reservations</p>
          </div>
          {reservationNo && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              Reservation No: {reservationNo}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* College Reservation Dashboard Stats */}
      {dashboardStats && (
        <CollegeReservationStatsCards
          stats={dashboardStats}
          loading={dashboardLoading}
        />
      )}

      <TabSwitcher
        tabs={[
          {
            value: "new",
            label: "New Reservations",
            icon: Plus,
            content: (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <ReservationForm
                  form={form as any}
                  setForm={(next) => setForm(next as any)}
                  classFee={classFee}
                  transportFee={transportFee}
                  routes={routeNames.map((route: { bus_route_id: number; route_no?: string; route_name: string }) => ({
                    id: route.bus_route_id?.toString() || '',
                    name: `${route.route_no || 'Route'} - ${route.route_name}`,
                    fee: 5000 // Default fee, would need to be enhanced
                  }))}
                  classFeeMapKeys={Object.keys(classFeeMap)}
                  onSave={handleSave}
                />
              </motion.div>
            ),
          },
          {
            value: "all",
            label: "All Reservations",
            icon: List,
            content: (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {isLoadingReservations ? (
                  <div className="p-6 text-sm text-muted-foreground text-center">Loading reservations…</div>
                ) : reservationsError ? (
                  <div className="p-6 text-center">
                    <div className="text-red-600 mb-2">
                      <h3 className="font-medium">Connection Error</h3>
                      <p className="text-sm text-muted-foreground">
                        {reservationsErrObj?.message?.includes('Bad Gateway') 
                          ? 'Backend server is not responding (502 Bad Gateway)'
                          : 'Failed to load reservations'
                        }
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetchReservations()}>
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <ReservationsTable
                    reservations={allReservations as any}
                    onView={handleView as any}
                    onEdit={handleEdit as any}
                    onDelete={(r: any) => {
                      setReservationToDelete(r);
                      setShowDeleteDialog(true);
                    }}
                  />
                )}
              </motion.div>
            ),
          },
          {
            value: "status",
            label: "Status",
            icon: BarChart3,
            content: (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle>Update Status</CardTitle>
                      <CardDescription>Modify reservation statuses quickly</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{allReservations.length} items</Badge>
                      {reservationsData && (
                        <Badge variant="secondary">
                          Total: {reservationsData.total_count || 0}
                        </Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => refetchReservations()} disabled={isLoadingReservations}>Refresh</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingReservations ? (
                      <div className="p-6 text-sm text-muted-foreground">Loading reservations…</div>
                    ) : reservationsError ? (
                      <div className="p-6 text-center">
                        <div className="text-red-600 mb-2">
                          <h3 className="font-medium">Connection Error</h3>
                          <p className="text-sm text-muted-foreground">
                            {reservationsErrObj?.message?.includes('Bad Gateway') 
                              ? 'Backend server is not responding (502 Bad Gateway)'
                              : 'Failed to load reservations'
                            }
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => refetchReservations()}>
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Reservation No</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Current Status</TableHead>
                            <TableHead>Change To</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allReservations.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                                <div className="space-y-2">
                                  <p>No reservations found</p>
                                  <p className="text-xs">Create your first reservation using the "New Reservations" tab</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : allReservations.map((r) => {
                        const current = (r.status || '').toUpperCase();
                        const selected = (statusChanges[r.id] || current) as 'PENDING' | 'CONFIRMED' | 'CANCELLED';
                        const same = selected === current;
                        return (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.id}</TableCell>
                            <TableCell>{r.studentName}</TableCell>
                            <TableCell>
                              <Badge
                                variant={current === 'PENDING' ? 'default' : current === 'CANCELLED' ? 'destructive' : current === 'CONFIRMED' ? 'secondary' : 'outline'}
                              >
                                {current}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="w-48">
                                <Select
                                  value={selected}
                                  onValueChange={(v) => setStatusChanges((prev) => ({ ...prev, [r.id]: v as any }))}
                                >
                                  <SelectTrigger aria-label="Select status">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-48">
                                <Textarea
                                  placeholder="Enter remarks..."
                                  value={statusRemarks[r.id] || ''}
                                  onChange={(e) => setStatusRemarks((prev) => ({ ...prev, [r.id]: e.target.value }))}
                                  rows={2}
                                  className="text-sm"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={same ? "outline" : "default"}
                                disabled={same}
                                onClick={async () => {
                                  const to = (statusChanges[r.id] || current) as 'PENDING' | 'CONFIRMED' | 'CANCELLED';
                                  const remarks = statusRemarks[r.id] || '';
                                  try {
                                    const payload = { 
                                      status: to as "PENDING" | "CONFIRMED" | "CANCELLED",
                                      remarks: remarks.trim() ? remarks : null
                                    };
                                    await CollegeReservationsService.updateStatus(Number(r.id), payload);
                                    refetchReservations();
                                    // Clear the remarks after successful update
                                    setStatusRemarks((prev) => ({ ...prev, [r.id]: '' }));
                                  } catch (e: any) {
                                    alert(e?.message || 'Failed to update status');
                                  }
                                }}
                              >
                                Update
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ),
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        gridCols="grid-cols-3"
      />


      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reservation Receipt</DialogTitle>
            <DialogDescription>
              Reservation has been created successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Reservation No:</strong> {reservationNo}
              </div>
              <div>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
              <div>
                <strong>Student Name:</strong> {form.studentName}
              </div>
              <div>
                <strong>Class:</strong> {form.classAdmission}
              </div>
              <div>
                <strong>Father Name:</strong> {form.fatherName}
              </div>
              <div>
                <strong>Mobile:</strong> {form.fatherMobile}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Class Fee:</span>
                <span>₹{classFee.toLocaleString()}</span>
              </div>
              {form.transport === "Yes" && (
                <div className="flex justify-between">
                  <span>Transport Fee:</span>
                  <span>₹{transportFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{(classFee + transportFee).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => setShowReceipt(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Reservation Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
            <DialogDescription>Reservation information</DialogDescription>
          </DialogHeader>
          {!viewReservation ? (
            <div className="p-4 text-sm">Loading...</div>
          ) : (
            <div className="space-y-6 text-sm flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Reservation No:</strong> {viewReservation.reservation_id}</div>
                <div><strong>Date:</strong> {viewReservation.reservation_date || "-"}</div>
                <div><strong>Status:</strong> {viewReservation.status || "-"}</div>
                <div><strong>Referred By:</strong> {viewReservation.referred_by ?? "-"}</div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Student Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Name:</strong> {viewReservation.student_name || "-"}</div>
                  <div><strong>Aadhar No:</strong> {viewReservation.aadhar_no || "-"}</div>
                  <div><strong>Gender:</strong> {viewReservation.gender || "-"}</div>
                  <div><strong>DOB:</strong> {viewReservation.dob || "-"}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Parent Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Father Name:</strong> {viewReservation.father_name || "-"}</div>
                  <div><strong>Father Aadhar:</strong> {viewReservation.father_aadhar_no || "-"}</div>
                  <div><strong>Father Mobile:</strong> {viewReservation.father_mobile || "-"}</div>
                  <div><strong>Father Occupation:</strong> {viewReservation.father_occupation || "-"}</div>
                  <div><strong>Mother Name:</strong> {viewReservation.mother_name || "-"}</div>
                  <div><strong>Mother Aadhar:</strong> {viewReservation.mother_aadhar_no || "-"}</div>
                  <div><strong>Mother Mobile:</strong> {viewReservation.mother_mobile || "-"}</div>
                  <div><strong>Mother Occupation:</strong> {viewReservation.mother_occupation || "-"}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Academic Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Group:</strong> {viewReservation.group_name || "-"}</div>
                  <div><strong>Course:</strong> {viewReservation.course_name || "-"}</div>
                  <div><strong>Previous Class:</strong> {viewReservation.previous_class || "-"}</div>
                  <div><strong>Previous School:</strong> {viewReservation.previous_school_details || "-"}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Contact Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Present Address:</strong> {viewReservation.present_address || "-"}</div>
                  <div><strong>Permanent Address:</strong> {viewReservation.permanent_address || "-"}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Fees</div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Reservation Fee:</span><span>₹{Number(viewReservation.reservation_fee || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Group Fee:</span><span>₹{Number(viewReservation.group_fee || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Course Fee:</span><span>₹{Number(viewReservation.course_fee || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Total Tuition Fee:</span><span>₹{Number(viewReservation.total_tuition_fee || 0).toLocaleString()}</span></div>
                  {viewReservation.book_fee != null && (
                    <div className="flex justify-between"><span>Book Fee:</span><span>₹{Number(viewReservation.book_fee || 0).toLocaleString()}</span></div>
                  )}
                  {viewReservation.tuition_concession != null && (
                    <div className="flex justify-between"><span>Tuition Concession:</span><span>₹{Number(viewReservation.tuition_concession || 0).toLocaleString()}</span></div>
                  )}
                  {viewReservation.transport_fee != null && (
                    <div className="flex justify-between"><span>Transport Fee:</span><span>₹{Number(viewReservation.transport_fee || 0).toLocaleString()}</span></div>
                  )}
                  {viewReservation.transport_concession != null && (
                    <div className="flex justify-between"><span>Transport Concession:</span><span>₹{Number(viewReservation.transport_concession || 0).toLocaleString()}</span></div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Preferences</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Preferred Group ID:</strong> {viewReservation.preferred_group_id ?? "-"}</div>
                  <div><strong>Preferred Course ID:</strong> {viewReservation.preferred_course_id ?? "-"}</div>
                  <div><strong>Preferred Transport ID:</strong> {viewReservation.preferred_transport_id ?? "-"}</div>
                  <div><strong>Preferred Distance Slab ID:</strong> {viewReservation.preferred_distance_slab_id ?? "-"}</div>
                </div>
              </div>

            </div>
          )}
          <DialogFooter className="mt-2 bg-background border-t py-3">
            <Button type="button" onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reservation Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
            <DialogDescription>Update reservation information</DialogDescription>
          </DialogHeader>
          {editForm ? (
            <div className="flex-1 overflow-y-auto pr-1">
              <ReservationForm
                form={editForm}
                setForm={setEditForm}
                classFee={classFee}
                transportFee={transportFee}
                routes={routeNames.map((route: { bus_route_id: number; route_no?: string; route_name: string }) => ({ id: route.bus_route_id.toString(), name: `${route.route_no || 'Route'} - ${route.route_name}`, fee: 5000 }))}
                classFeeMapKeys={Object.keys(classFeeMap)}
                onSave={async () => { await submitEdit(); }}
              />
            </div>
          ) : (
            <div className="p-4">Loading...</div>
          )}
          <DialogFooter className="mt-2 bg-background border-t py-3">
            <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Reservation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this reservation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancelRemarks">Cancellation Remarks</Label>
              <Textarea
                id="cancelRemarks"
                value={cancelRemarks}
                onChange={(e) => setCancelRemarks(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Reservation Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { if (!open) { setReservationToDelete(null); } setShowDeleteDialog(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete reservation {reservationToDelete?.id}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!reservationToDelete?.id) return;
                try {
                  await deleteReservation.mutateAsync(Number(reservationToDelete.id));
                  // Success - dialog will close automatically due to onSuccess in hook
                } catch (e: any) {
                  if (e?.response?.status === 409) {
                    alert('Cannot delete this reservation because it has associated income records. Please remove the income records first or change the reservation status to CANCELLED instead.');
                  } else {
                    alert(e?.response?.data?.detail || e?.message || 'Failed to delete reservation');
                  }
                } finally {
                  setShowDeleteDialog(false);
                  setReservationToDelete(null);
                }
              }}
              disabled={deleteReservation.isPending}
            >
              {deleteReservation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
