import { useMemo, useState, useEffect } from "react";
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
import ReservationForm from "../features/reservations/ReservationForm";
import ReservationsTable from "../features/reservations/ReservationsTable";
import { useBusRouteNames } from "@/lib/hooks/school/useTransport";
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const { data: routeNames = [] } = useBusRouteNames();
  const [activeTab, setActiveTab] = useState("new");
  const [reservationNo, setReservationNo] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewReservation, setViewReservation] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<any>(null);
  const [statusChanges, setStatusChanges] = useState<Record<string, 'PENDING' | 'ADMITTED' | 'CANCELLED'>>({});
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

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
    const fd = new FormData();
    // Map form fields to backend schema
    fd.append("student_name", form.studentName);
    fd.append("aadhar_no", form.studentAadhar || "");
    fd.append("gender", (form.gender || "OTHER").toUpperCase());
    if (form.dob) fd.append("dob", form.dob);
    fd.append("father_name", form.fatherName || "");
    fd.append("father_aadhar_no", form.fatherAadhar || "");
    fd.append("father_mobile", form.fatherMobile || "");
    fd.append("father_occupation", form.fatherOccupation || "");
    fd.append("mother_name", form.motherName || "");
    fd.append("mother_aadhar_no", form.motherAadhar || "");
    fd.append("mother_mobile", form.motherMobile || "");
    fd.append("mother_occupation", form.motherOccupation || "");
    // siblings optional as JSON string if needed (skipped for now)
    if (form.lastClass) fd.append("previous_class", form.lastClass);
    if (form.previousSchool) fd.append("previous_school_details", form.previousSchool);
    fd.append("present_address", form.presentAddress || "");
    fd.append("permanent_address", form.permanentAddress || "");
    fd.append("admit_into", form.classAdmission || "");
    fd.append("admission_group", form.group || "");
    // Reservation financials
    fd.append("reservation_fee", String(Number(form.reservationFee || 0)));
    // preferred_class_id
    fd.append("preferred_class_id", String(Number(form.preferredClassId || 0)));
    fd.append("tuition_fee", String(Number(classFee || 0)));
    fd.append("book_fee", String(Number(form.bookFee || 0)));
    fd.append("tuition_concession", String(Number(form.tuitionConcession || 0)));
    // Transport preference
    if (form.transport === "Yes") {
      if (form.busRoute) fd.append("preferred_transport_id", String(Number(form.busRoute)));
      fd.append("transport_fee", String(Number(transportFee || 0)));
      fd.append("transport_concession", String(Number(form.transportConcession || 0)));
    }
    // Optional distance slab
    if (form.preferredDistanceSlabId) {
      fd.append("preferred_distance_slab_id", String(Number(form.preferredDistanceSlabId)));
    }
    fd.append("status", "PENDING");
    // reservation_date optional
    if (form.reservationDate) fd.append("reservation_date", form.reservationDate);
    if (form.referredBy) fd.append("referred_by", String(Number(form.referredBy)));
    // siblings as JSON if provided
    if ((form.siblingsJson || '').trim()) {
      // backend expects list[Siblings]; when using Form(...), sending JSON string field may be parsed per server config; include it for compatibility
      fd.append("siblings", form.siblingsJson);
    }

    try {
      const res: any = await SchoolReservationsService.create(fd);
      // Use backend reservation_id to display receipt number
      setReservationNo(String(res?.reservation_id || ""));
      if (withPayment) setShowReceipt(true);
      // Refresh list after creating
      if (activeTab === 'all') {
        await loadReservations();
      }
    } catch (e: any) {
      alert(e?.message || "Failed to create reservation");
    }
  };

  const buildFormDataFromForm = (f: any) => {
    const fd = new FormData();
    fd.append("student_name", f.studentName);
    fd.append("aadhar_no", f.studentAadhar || "");
    fd.append("gender", (f.gender || "OTHER").toUpperCase());
    if (f.dob) fd.append("dob", f.dob);
    fd.append("father_name", f.fatherName || "");
    fd.append("father_aadhar_no", f.fatherAadhar || "");
    fd.append("father_mobile", f.fatherMobile || "");
    fd.append("father_occupation", f.fatherOccupation || "");
    fd.append("mother_name", f.motherName || "");
    fd.append("mother_aadhar_no", f.motherAadhar || "");
    fd.append("mother_mobile", f.motherMobile || "");
    fd.append("mother_occupation", f.motherOccupation || "");
    if (f.lastClass) fd.append("previous_class", f.lastClass);
    if (f.previousSchool) fd.append("previous_school_details", f.previousSchool);
    fd.append("present_address", f.presentAddress || "");
    fd.append("permanent_address", f.permanentAddress || "");
    fd.append("admit_into", f.classAdmission || "");
    fd.append("admission_group", f.group || "");
    fd.append("reservation_fee", String(Number(f.reservationFee || 0)));
    fd.append("preferred_class_id", String(Number(f.preferredClassId || 0)));
    fd.append("tuition_fee", String(Number(classFee || 0)));
    fd.append("book_fee", String(Number(f.bookFee || 0)));
    fd.append("tuition_concession", String(Number(f.tuitionConcession || 0)));
    if (f.transport === "Yes") {
      if (f.busRoute) fd.append("preferred_transport_id", String(Number(f.busRoute)));
      fd.append("transport_fee", String(Number(transportFee || 0)));
      fd.append("transport_concession", String(Number(f.transportConcession || 0)));
    }
    if (f.preferredDistanceSlabId) {
      fd.append("preferred_distance_slab_id", String(Number(f.preferredDistanceSlabId)));
    }
    if (f.reservationDate) fd.append("reservation_date", f.reservationDate);
    if (f.referredBy) fd.append("referred_by", String(Number(f.referredBy)));
    if ((f.siblingsJson || '').trim()) {
      fd.append("siblings", f.siblingsJson);
    }
    return fd;
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
    classAdmission: r.admit_into || "",
    group: r.admission_group || "",
    course: "N/A",
    transport: r.preferred_transport_id ? "Yes" : "No",
    busRoute: r.preferred_transport_id ? String(r.preferred_transport_id) : "",
    applicationFee: "",
    reservationFee: r.reservation_fee != null ? String(r.reservation_fee) : "",
    remarks: "",
    preferredClassId: r.preferred_class_id != null ? String(r.preferred_class_id) : "0",
    preferredDistanceSlabId: r.preferred_distance_slab_id != null ? String(r.preferred_distance_slab_id) : "0",
    bookFee: r.book_fee != null ? String(r.book_fee) : "0",
    tuitionConcession: r.tuition_concession != null ? String(r.tuition_concession) : "0",
    transportConcession: r.transport_concession != null ? String(r.transport_concession) : "0",
    referredBy: r.referred_by != null ? String(r.referred_by) : "",
    reservationDate: r.reservation_date || "",
    siblingsJson: JSON.stringify(r.siblings || []),
  });

  const handleView = async (r: any) => {
    try {
      const data = await SchoolReservationsService.getById(Number(r.id));
      setViewReservation(data);
      setShowViewDialog(true);
    } catch (e: any) {
      alert(e?.message || 'Failed to load reservation');
    }
  };

  const handleEdit = async (r: any) => {
    try {
      const data: any = await SchoolReservationsService.getById(Number(r.id));
      setEditForm(mapApiToForm(data));
      setSelectedReservation({ id: r.id });
      setShowEditDialog(true);
    } catch (e: any) {
      alert(e?.message || 'Failed to load reservation');
    }
  };

  const submitEdit = async () => {
    if (!selectedReservation?.id || !editForm) return;
    try {
      const fd = buildFormDataFromForm(editForm);
      await SchoolReservationsService.update(Number(selectedReservation.id), fd);
      setShowEditDialog(false);
      await loadReservations();
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
        await SchoolReservationsService.updateStatus(Number(selectedReservation.id), 'CANCELLED');
        // refresh list
        await loadReservations();
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

  const loadReservations = async () => {
    try {
      setIsLoadingReservations(true);
      const res: any = await SchoolReservationsService.list({ page: 1, page_size: 20 });
      const items = Array.isArray(res?.reservations) ? res.reservations : [];
      const mapped = items.map((r: any) => ({
        id: String(r.reservation_id),
        studentName: r.student_name,
        classAdmission: r.admit_into || '',
        status: r.status || 'PENDING',
        date: r.reservation_date || '',
        totalFee: Number((r.tuition_fee || 0)) + Number((r.transport_fee || 0)),
      }));
      setAllReservations(mapped);
    } catch (e) {
      setAllReservations([]);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  // Auto-load when switching to "All" or "Status" tab
  useEffect(() => {
    if (activeTab === 'all' || activeTab === 'status') {
      loadReservations();
    }
  }, [activeTab]);

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="new" className="flex-1">New Reservations</TabsTrigger>
            <TabsTrigger value="all" className="flex-1">All Reservations</TabsTrigger>
            <TabsTrigger value="status" className="flex-1">Status</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="new">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ReservationForm
              form={form as any}
              setForm={(next) => setForm(next as any)}
              classFee={classFee}
              transportFee={transportFee}
              routes={routeNames.map(route => ({
                id: route.bus_route_id.toString(),
                name: `${route.route_no || 'Route'} - ${route.route_name}`,
                fee: 5000 // Default fee, would need to be enhanced
              }))}
              classFeeMapKeys={Object.keys(classFeeMap)}
              onSave={handleSave}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="all">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ReservationsTable
              reservations={allReservations as any}
              onView={handleView as any}
              onEdit={handleEdit as any}
              onDelete={(r: any) => {
                setReservationToDelete(r);
                setShowDeleteDialog(true);
              }}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="status">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Update Status</CardTitle>
                  <CardDescription>Modify reservation statuses quickly</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{allReservations.length} items</Badge>
                  <Button variant="outline" size="sm" onClick={loadReservations} disabled={isLoadingReservations}>Refresh</Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingReservations ? (
                  <div className="p-6 text-sm text-muted-foreground">Loading reservations…</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reservation No</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Current Status</TableHead>
                        <TableHead>Change To</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allReservations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                            No reservations found
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
                            variant={current === 'PENDING' ? 'default' : current === 'CANCELLED' ? 'destructive' : 'secondary'}
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
                                <SelectItem value="ADMITTED">Admitted</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={same ? "outline" : "default"}
                            disabled={same}
                            onClick={async () => {
                              const to = (statusChanges[r.id] || current) as 'PENDING' | 'ADMITTED' | 'CANCELLED';
                              try {
                                await SchoolReservationsService.updateStatus(Number(r.id), to);
                                await loadReservations();
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
        </TabsContent>
      </Tabs>

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
                  <div><strong>Admit Into:</strong> {viewReservation.admit_into || "-"}</div>
                  <div><strong>Group:</strong> {viewReservation.admission_group || "-"}</div>
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
                  <div className="flex justify-between"><span>Tuition Fee:</span><span>₹{Number(viewReservation.tuition_fee || 0).toLocaleString()}</span></div>
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
                  <div><strong>Preferred Class ID:</strong> {viewReservation.preferred_class_id ?? "-"}</div>
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
                routes={routeNames.map(route => ({ id: route.bus_route_id.toString(), name: `${route.route_no || 'Route'} - ${route.route_name}`, fee: 5000 }))}
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
                  await SchoolReservationsService.delete(Number(reservationToDelete.id));
                  await loadReservations();
                } catch (e: any) {
                  alert(e?.message || 'Failed to delete');
                } finally {
                  setShowDeleteDialog(false);
                  setReservationToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
