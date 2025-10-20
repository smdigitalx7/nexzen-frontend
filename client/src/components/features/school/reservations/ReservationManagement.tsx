import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSchoolReservationsList, useDeleteSchoolReservation, useSchoolReservationsDashboard } from "@/lib/hooks/school/use-school-reservations";
import { useSchoolClasses } from "@/lib/hooks/school/use-school-dropdowns";
import { useSchoolClass } from "@/lib/hooks/school/use-school-class";
import { useDistanceSlabs } from "@/lib/hooks/general/useDistanceSlabs";
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
import SchoolReservationEdit from "../reservations/SchoolReservationEdit";
import ReservationsTable from "../reservations/ReservationsTable";
import { TransportService } from "@/lib/services/school/transport.service";
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
import { Plus, List, BarChart3 } from "lucide-react";
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolReservationStatsCards } from "./SchoolReservationStatsCards";
import { ReservationPaymentProcessor, ReservationPaymentData } from "@/components/shared/payment";
import type { SchoolIncomeRead } from "@/lib/types/school";

export default function ReservationNew() {
  const { academicYear } = useAuthStore();
  const { data: routeNames = [] } = useQuery({ queryKey: ["public","bus-routes","names"], queryFn: () => TransportService.getRouteNames() });
  
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
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [editSelectedClassId, setEditSelectedClassId] = useState<number | null>(null);
  
  // Payment related state
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [paymentData, setPaymentData] = useState<ReservationPaymentData | null>(null);
  const [paymentIncomeRecord, setPaymentIncomeRecord] = useState<SchoolIncomeRead | null>(null);

  // Classes dropdown from API
  const { data: classesData, isLoading: classesLoading } = useSchoolClasses();
  const classes = classesData?.items || [];
  
  // Distance slabs dropdown from API
  const { distanceSlabs, isLoadingDistanceSlabs } = useDistanceSlabs();
  
  // Fetch selected class details with fees
  const { classData: selectedClassData, isLoading: isLoadingClassData } = useSchoolClass(selectedClassId);
  const { classData: editSelectedClassData, isLoading: isLoadingEditClassData } = useSchoolClass(editSelectedClassId);
  
  // Dashboard stats hook
  const { data: dashboardStats, isLoading: dashboardLoading } = useSchoolReservationsDashboard();
  
  // Use React Query hook for reservations
  const { 
    data: reservationsData, 
    isLoading: isLoadingReservations, 
    isError: reservationsError, 
    error: reservationsErrObj,
    refetch: refetchReservations 
  } = useSchoolReservationsList({ page: 1, page_size: 20 });

  // Delete reservation hook
  const deleteReservation = useDeleteSchoolReservation();
  
  // Process reservations data
  const allReservations = useMemo(() => {
    if (!reservationsData?.reservations) return [];
    
    if (!Array.isArray(reservationsData.reservations)) return [];
    
    return reservationsData.reservations.map((r: any) => ({
      id: String(r.reservation_id),
      reservation_id: r.reservation_id, // Keep the original reservation_id as number
      studentName: r.student_name,
      classAdmission: r.admit_into || '',
      status: r.status || 'PENDING',
      date: r.reservation_date || '',
      totalFee: Number((r.tuition_fee || 0)) + Number((r.transport_fee || 0)),
    }));
  }, [reservationsData]);

  const [form, setForm] = useState({
    // Personal Details
    student_name: "",
    aadhar_no: "",
    gender: "",
    dob: "",
    father_or_guardian_name: "",
    father_or_guardian_aadhar_no: "",
    father_or_guardian_mobile: "",
    father_or_guardian_occupation: "",
    mother_or_guardian_name: "",
    mother_or_guardian_aadhar_no: "",
    mother_or_guardian_mobile: "",
    mother_or_guardian_occupation: "",
    siblings: [] as Array<{
      name: string;
      class_name: string;
      where: string;
      gender: string;
    }>,
    previous_class: "",
    previous_school_details: "",
    present_address: "",
    permanent_address: "",
    application_fee: "0",
    application_fee_paid: false,
    class_name: "",
    tuition_fee: "0",
    book_fee: "0",
    transport_required: false,
    preferred_transport_id: "0",
    preferred_distance_slab_id: "0",
    pickup_point: "",
    transport_fee: "0",
    status: "PENDING",
    referred_by: "",
    remarks: "",
    reservation_date: "",
  });

  // Auto-set preferred_class_id when class_name changes
  const handleClassChange = (classId: string) => {
    const selectedClass = classes.find(c => c.class_id.toString() === classId);
    if (selectedClass) {
      setSelectedClassId(selectedClass.class_id);
      setForm(prev => ({
        ...prev,
        class_name: selectedClass.class_name,
        // Auto-set preferred_class_id based on selected class
        preferred_class_id: selectedClass.class_id.toString()
      }));
    }
  };

  // Auto-set preferred_distance_slab_id when distance slab is selected
  const handleDistanceSlabChange = (slabId: string) => {
    const selectedSlab = distanceSlabs?.find(s => s.slab_id.toString() === slabId);
    if (selectedSlab) {
      setForm(prev => ({
        ...prev,
        preferred_distance_slab_id: selectedSlab.slab_id.toString()
      }));
    }
  };

  // Edit mode handlers
  const handleEditClassChange = (classId: string) => {
    const selectedClass = classes.find(c => c.class_id.toString() === classId);
    if (selectedClass) {
      setEditSelectedClassId(selectedClass.class_id);
      setEditForm((prev: any) => ({
        ...prev,
        class_name: selectedClass.class_name,
        preferred_class_id: selectedClass.class_id.toString()
      }));
    }
  };

  const handleEditDistanceSlabChange = (slabId: string) => {
    const selectedSlab = distanceSlabs?.find(s => s.slab_id.toString() === slabId);
    if (selectedSlab) {
      setEditForm((prev: any) => ({
        ...prev,
        preferred_distance_slab_id: selectedSlab.slab_id.toString()
      }));
    }
  };

  // Get preferred_class_id from form (for API submission)
  const getPreferredClassId = (formState = form) => {
    const selectedClass = classes.find(c => c.class_name === formState.class_name);
    return selectedClass ? selectedClass.class_id : 0;
  };

  // Get preferred_distance_slab_id from form (for API submission)
  const getPreferredDistanceSlabId = (formState = form) => {
    const selectedSlab = distanceSlabs?.find(s => s.slab_id.toString() === formState.preferred_distance_slab_id);
    return selectedSlab ? selectedSlab.slab_id : 0;
  };

  // Update form with fees when class data is fetched
  useEffect(() => {
    if (selectedClassData) {
      setForm(prev => ({
        ...prev,
        tuition_fee: selectedClassData.tuition_fee.toString(),
        book_fee: selectedClassData.book_fee.toString()
      }));
    }
  }, [selectedClassData]);

  // Update edit form with fees when edit class data is fetched
  useEffect(() => {
    if (editSelectedClassData && editForm) {
      setEditForm((prev: any) => ({
        ...prev,
        tuition_fee: editSelectedClassData.tuition_fee.toString(),
        book_fee: editSelectedClassData.book_fee.toString()
      }));
    }
  }, [editSelectedClassData, editForm]);

  const classFee = useMemo(() => {
    // Use the fetched class data or fallback to default
    return selectedClassData?.tuition_fee || 15000;
  }, [selectedClassData]);

  const editClassFee = useMemo(() => {
    // Use the fetched edit class data or fallback to default
    return editSelectedClassData?.tuition_fee || 15000;
  }, [editSelectedClassData]);

  const transportFee = useMemo(() => {
    if (form.transport_required && form.preferred_distance_slab_id) {
      const selectedSlab = distanceSlabs?.find(s => s.slab_id.toString() === form.preferred_distance_slab_id);
      return selectedSlab ? selectedSlab.fee_amount : 0;
    }
    return 0;
  }, [form.transport_required, form.preferred_distance_slab_id, distanceSlabs]);

  const editTransportFee = useMemo(() => {
    if (editForm?.transport_required && editForm?.preferred_distance_slab_id) {
      const selectedSlab = distanceSlabs?.find(s => s.slab_id.toString() === editForm.preferred_distance_slab_id);
      return selectedSlab ? selectedSlab.fee_amount : 0;
    }
    return 0;
  }, [editForm?.transport_required, editForm?.preferred_distance_slab_id, distanceSlabs]);

  const handleSave = async (withPayment: boolean) => {
    // Map form fields to backend schema as JSON object
    const payload = {
      student_name: form.student_name,
      aadhar_no: form.aadhar_no || "",
      gender: (form.gender || "OTHER").toUpperCase(),
      dob: form.dob || "",
      father_or_guardian_name: form.father_or_guardian_name || "",
      father_or_guardian_aadhar_no: form.father_or_guardian_aadhar_no || "",
      father_or_guardian_mobile: form.father_or_guardian_mobile || "",
      father_or_guardian_occupation: form.father_or_guardian_occupation || "",
      mother_or_guardian_name: form.mother_or_guardian_name || "",
      mother_or_guardian_aadhar_no: form.mother_or_guardian_aadhar_no || "",
      mother_or_guardian_mobile: form.mother_or_guardian_mobile || "",
      mother_or_guardian_occupation: form.mother_or_guardian_occupation || "",
      siblings: form.siblings.length > 0 ? form.siblings : [],
      previous_class: form.previous_class || "",
      previous_school_details: form.previous_school_details || "",
      present_address: form.present_address || "",
      permanent_address: form.permanent_address || "",
      application_fee: Number(form.application_fee || 0),
      application_fee_paid: form.application_fee_paid,
      preferred_class_id: getPreferredClassId(),
      class_name: form.class_name || "",
      tuition_fee: Number(form.tuition_fee || 0),
      book_fee: Number(form.book_fee || 0),
      transport_required: form.transport_required,
      preferred_transport_id: form.transport_required && form.preferred_transport_id ? Number(form.preferred_transport_id) : 0,
      preferred_distance_slab_id: form.transport_required && form.preferred_distance_slab_id ? getPreferredDistanceSlabId() : 0,
      pickup_point: form.transport_required ? (form.pickup_point || "") : "",
      transport_fee: form.transport_required ? Number(transportFee || 0) : 0,
      status: "PENDING",
      referred_by: form.referred_by ? Number(form.referred_by) : 0,
      remarks: form.remarks || "",
      reservation_date: form.reservation_date || ""
    };

    try {
      const res: any = await SchoolReservationsService.create(payload);
      console.log('Reservation creation response:', res);
      // Use backend reservation_id to display receipt number
      setReservationNo(String(res?.reservation_id || ""));
      
      if (withPayment) {
        // Prepare payment data for the payment processor
        const paymentData: ReservationPaymentData = {
          reservationId: res.reservation_id,
          reservationNo: res.reservation_no || String(res.reservation_id), // Try reservation_no first, fallback to reservation_id
          studentName: form.student_name,
          className: form.class_name,
          reservationFee: Number(form.application_fee || 0), // Only reservation/application fee
          totalAmount: Number(form.application_fee || 0), // Only reservation/application fee
          paymentMethod: 'CASH', // Default payment method
          purpose: 'Reservation Fee Payment',
          note: `Payment for reservation ${res.reservation_id}`
        };
        
        setPaymentData(paymentData);
        setShowPaymentProcessor(true);
      } else {
        setShowReceipt(true);
      }
      
      // Refresh list after creating
      if (activeTab === 'all') {
        refetchReservations();
      }
    } catch (e: any) {
      alert(e?.message || "Failed to create reservation");
    }
  };


  const mapApiToForm = (r: any) => ({
    student_name: r.student_name || "",
    aadhar_no: r.aadhar_no || "",
    gender: (r.gender || "").toString(),
    dob: r.dob || "",
    father_or_guardian_name: r.father_or_guardian_name || "",
    father_or_guardian_aadhar_no: r.father_or_guardian_aadhar_no || "",
    father_or_guardian_mobile: r.father_or_guardian_mobile || "",
    father_or_guardian_occupation: r.father_or_guardian_occupation || "",
    mother_or_guardian_name: r.mother_or_guardian_name || "",
    mother_or_guardian_aadhar_no: r.mother_or_guardian_aadhar_no || "",
    mother_or_guardian_mobile: r.mother_or_guardian_mobile || "",
    mother_or_guardian_occupation: r.mother_or_guardian_occupation || "",
    siblings: r.siblings || [],
    previous_class: r.previous_class || "",
    previous_school_details: r.previous_school_details || "",
    present_address: r.present_address || "",
    permanent_address: r.permanent_address || "",
    application_fee: r.application_fee != null ? String(r.application_fee) : "0",
    application_fee_paid: r.application_fee_paid || false,
    class_name: r.class_name || "",
    tuition_fee: r.tuition_fee != null ? String(r.tuition_fee) : "0",
    book_fee: r.book_fee != null ? String(r.book_fee) : "0",
    transport_required: r.preferred_transport_id ? true : false,
    preferred_transport_id: r.preferred_transport_id ? String(r.preferred_transport_id) : "0",
    preferred_distance_slab_id: r.preferred_distance_slab_id != null ? String(r.preferred_distance_slab_id) : "0",
    pickup_point: r.pickup_point || "",
    transport_fee: r.transport_fee != null ? String(r.transport_fee) : "0",
    status: r.status || "PENDING",
    referred_by: r.referred_by != null ? String(r.referred_by) : "",
    remarks: r.remarks || "",
    reservation_date: r.reservation_date || "",
  });

  const handleView = async (r: any) => {
    try {
      const data = await SchoolReservationsService.getById(r.reservation_id);
      setViewReservation(data);
      setShowViewDialog(true);
    } catch (e: any) {
      alert(e?.message || 'Failed to load reservation');
    }
  };

  const handleEdit = async (r: any) => {
    try {
      const data: any = await SchoolReservationsService.getById(r.reservation_id);
      const mappedForm = mapApiToForm(data);
      setEditForm(mappedForm);
      
      // Set the edit selected class ID to fetch class details
      if (mappedForm.class_name) {
        const selectedClass = classes.find(c => c.class_name === mappedForm.class_name);
        if (selectedClass) {
          setEditSelectedClassId(selectedClass.class_id);
        }
      }
      
      setSelectedReservation({ id: r.reservation_id });
      setShowEditDialog(true);
    } catch (e: any) {
      alert(e?.message || 'Failed to load reservation');
    }
  };

  const submitEdit = async () => {
    if (!selectedReservation?.id || !editForm) return;
    try {
      // Convert editForm to JSON payload
      const payload = {
        student_name: editForm.student_name,
        aadhar_no: editForm.aadhar_no || "",
        gender: (editForm.gender || "OTHER").toUpperCase(),
        dob: editForm.dob || "",
        father_or_guardian_name: editForm.father_or_guardian_name || "",
        father_or_guardian_aadhar_no: editForm.father_or_guardian_aadhar_no || "",
        father_or_guardian_mobile: editForm.father_or_guardian_mobile || "",
        father_or_guardian_occupation: editForm.father_or_guardian_occupation || "",
        mother_or_guardian_name: editForm.mother_or_guardian_name || "",
        mother_or_guardian_aadhar_no: editForm.mother_or_guardian_aadhar_no || "",
        mother_or_guardian_mobile: editForm.mother_or_guardian_mobile || "",
        mother_or_guardian_occupation: editForm.mother_or_guardian_occupation || "",
        siblings: editForm.siblings.length > 0 ? editForm.siblings : [],
        previous_class: editForm.previous_class || "",
        previous_school_details: editForm.previous_school_details || "",
        present_address: editForm.present_address || "",
        permanent_address: editForm.permanent_address || "",
        application_fee: Number(editForm.application_fee || 0),
        application_fee_paid: editForm.application_fee_paid,
        preferred_class_id: getPreferredClassId(editForm),
        transport_required: editForm.transport_required,
        preferred_transport_id: editForm.transport_required && editForm.preferred_transport_id ? Number(editForm.preferred_transport_id) : 0,
        preferred_distance_slab_id: editForm.transport_required && editForm.preferred_distance_slab_id ? getPreferredDistanceSlabId(editForm) : 0,
        pickup_point: editForm.transport_required ? (editForm.pickup_point || "") : "",
        transport_fee: editForm.transport_required ? Number(editTransportFee || 0) : 0,
        status: editForm.status || "PENDING",
        referred_by: editForm.referred_by ? Number(editForm.referred_by) : 0,
        remarks: editForm.remarks || "",
        reservation_date: editForm.reservation_date || ""
      };
      
      await SchoolReservationsService.update(Number(selectedReservation.id), payload);
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
        await SchoolReservationsService.updateStatus(Number(selectedReservation.id), 'CANCELLED');
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

      {/* Reservation Dashboard Stats */}
      {dashboardStats && (
        <SchoolReservationStatsCards
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
                    fee: 0
                  }))}
                  classes={classes}
                  distanceSlabs={distanceSlabs || []}
                  onClassChange={handleClassChange}
                  onDistanceSlabChange={handleDistanceSlabChange}
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
                                    await SchoolReservationsService.updateStatus(r.reservation_id, to, remarks || undefined);
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
                <strong>Student Name:</strong> {form.student_name}
              </div>
              <div>
                <strong>Class:</strong> {form.class_name}
              </div>
              <div>
                <strong>Father Name:</strong> {form.father_or_guardian_name}
              </div>
              <div>
                <strong>Mobile:</strong> {form.father_or_guardian_mobile}
              </div>
            </div>
            
            {/* Payment Information */}
            {paymentIncomeRecord && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-green-600 mb-2">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Payment ID:</strong> {paymentIncomeRecord.income_id}
                  </div>
                  <div>
                    <strong>Payment Date:</strong> {new Date(paymentIncomeRecord.income_date).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Payment Method:</strong> {paymentIncomeRecord.payment_method}
                  </div>
                  <div>
                    <strong>Status:</strong> <span className="text-green-600 font-semibold">PAID</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Reservation Fee:</span>
                <span>₹{Number(form.application_fee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span className={paymentIncomeRecord ? "text-green-600" : ""}>
                  ₹{Number(form.application_fee || 0).toLocaleString()}
                </span>
              </div>
              {paymentIncomeRecord && (
                <div className="text-center text-green-600 font-semibold mt-2">
                  ✓ Payment Completed Successfully
                </div>
              )}
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
                <div><strong>Referred By (ID):</strong> {viewReservation.referred_by ?? "-"}</div>
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
                  <div><strong>Father/Guardian Name:</strong> {viewReservation.father_or_guardian_name || "-"}</div>
                  <div><strong>Father/Guardian Aadhar:</strong> {viewReservation.father_or_guardian_aadhar_no || "-"}</div>
                  <div><strong>Father/Guardian Mobile:</strong> {viewReservation.father_or_guardian_mobile || "-"}</div>
                  <div><strong>Father/Guardian Occupation:</strong> {viewReservation.father_or_guardian_occupation || "-"}</div>
                  <div><strong>Mother/Guardian Name:</strong> {viewReservation.mother_or_guardian_name || "-"}</div>
                  <div><strong>Mother/Guardian Aadhar:</strong> {viewReservation.mother_or_guardian_aadhar_no || "-"}</div>
                  <div><strong>Mother/Guardian Mobile:</strong> {viewReservation.mother_or_guardian_mobile || "-"}</div>
                  <div><strong>Mother/Guardian Occupation:</strong> {viewReservation.mother_or_guardian_occupation || "-"}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Academic Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Preferred Class:</strong> {viewReservation.class_name || viewReservation.preferred_class_id || "-"}</div>
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
                  <div className="flex justify-between"><span>Application Fee:</span><span>₹{Number(viewReservation.application_fee || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Application Fee Paid:</span><span>{viewReservation.application_fee_paid ? "Yes" : "No"}</span></div>
                  <div className="flex justify-between"><span>Tuition Fee:</span><span>₹{Number(viewReservation.tuition_fee || 0).toLocaleString()}</span></div>
                  {viewReservation.book_fee != null && (
                    <div className="flex justify-between"><span>Book Fee:</span><span>₹{Number(viewReservation.book_fee || 0).toLocaleString()}</span></div>
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
                  <div><strong>Pickup Point:</strong> {viewReservation.pickup_point || "-"}</div>
                  <div><strong>Remarks:</strong> {viewReservation.remarks || "-"}</div>
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
              <SchoolReservationEdit
                form={editForm}
                setForm={setEditForm}
                classFee={editClassFee}
                transportFee={editTransportFee}
                routes={routeNames.map((route: { bus_route_id: number; route_no?: string; route_name: string }) => ({ id: route.bus_route_id?.toString?.() || '', name: `${route.route_no || 'Route'} - ${route.route_name}`, fee: 0 }))}
                classes={classes}
                distanceSlabs={distanceSlabs || []}
                onClassChange={handleEditClassChange}
                onDistanceSlabChange={handleEditDistanceSlabChange}
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
              Are you sure you want to delete reservation {reservationToDelete?.reservation_id}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!reservationToDelete?.reservation_id || deleteReservation.isPending) return;
                
                try {
                  await deleteReservation.mutateAsync(reservationToDelete.reservation_id);
                  // Success - dialog will close automatically due to onSuccess in hook
                  setShowDeleteDialog(false);
                  setReservationToDelete(null);
                } catch (e: any) {
                  if (e?.response?.status === 409) {
                    alert('Cannot delete this reservation because it has associated income records. Please remove the income records first or change the reservation status to CANCELLED instead.');
                  } else if (e?.response?.status === 404) {
                    alert('Reservation not found. It may have already been deleted.');
                    setShowDeleteDialog(false);
                    setReservationToDelete(null);
                  } else {
                    alert(e?.response?.data?.detail || e?.message || 'Failed to delete reservation');
                  }
                }
              }}
              disabled={deleteReservation.isPending}
            >
              {deleteReservation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Processor Dialog */}
      {paymentData && (
        <Dialog open={showPaymentProcessor} onOpenChange={setShowPaymentProcessor}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Process payment for reservation {paymentData.reservationNo}
              </DialogDescription>
            </DialogHeader>
            <ReservationPaymentProcessor
              reservationData={paymentData}
              onPaymentComplete={(incomeRecord: SchoolIncomeRead) => {
                setPaymentIncomeRecord(incomeRecord);
                setShowPaymentProcessor(false);
                setShowReceipt(true);
                // Refresh reservations list to show updated status
                refetchReservations();
              }}
              onPaymentFailed={(error: string) => {
                alert(`Payment failed: ${error}`);
                setShowPaymentProcessor(false);
              }}
              onPaymentCancel={() => {
                setShowPaymentProcessor(false);
                setPaymentData(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
