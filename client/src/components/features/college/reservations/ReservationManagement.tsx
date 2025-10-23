import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useCollegeReservationsList,
  useDeleteCollegeReservation,
  useCollegeReservationDashboard,
} from "@/lib/hooks/college/use-college-reservations";
import { useCollegeClasses } from "@/lib/hooks/college/use-college-classes";
import { useCollegeGroups, useCollegeCourses } from "@/lib/hooks/college/use-college-dropdowns";
import { useDistanceSlabs } from "@/lib/hooks/general/useDistanceSlabs";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "@/hooks/use-toast";
import { CollegeReservationsService } from "@/lib/services/college/reservations.service";
import type { CollegeReservationView } from "@/lib/types/college/reservations";
import { Plus, List, BarChart3, Save } from "lucide-react";
import { TabSwitcher } from "@/components/shared";
import StatusUpdateComponent from "./StatusUpdateComponent";
import AllReservationsComponent from "./AllReservationsComponent";
import { CollegeReservationStatsCards } from "./CollegeReservationStatsCards";
import { ConcessionUpdateDialog } from "@/components/shared";
import { Building2, University } from "lucide-react";


export default function ReservationNew() {
  const { academicYear, currentBranch } = useAuthStore();
  const { data: routeNames = [] } = useQuery({
    queryKey: ["public", "bus-routes", "names"],
    queryFn: () => TransportService.getRouteNames(),
  });

  // Dashboard stats hook
  const { data: dashboardStats, isLoading: dashboardLoading } =
    useCollegeReservationDashboard();

  // Dropdown data hooks - Load classes, groups, courses, and distance slabs from API
  // Classes are loaded independently, groups are loaded independently, courses are loaded based on selected group
  const { data: classesData, isLoading: classesLoading, error: classesError } = useCollegeClasses();
  const { data: groupsData, isLoading: groupsLoading, error: groupsError } = useCollegeGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useCollegeCourses(selectedGroupId || 0);
  const { distanceSlabs, isLoadingDistanceSlabs, distanceSlabsError } = useDistanceSlabs();

  const [activeTab, setActiveTab] = useState("new");
  const [reservationNo, setReservationNo] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewReservation, setViewReservation] = useState<CollegeReservationView | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<any>(null);
  const [loadingReservation, setLoadingReservation] = useState<number | null>(
    null
  );

  // Concession related state
  const [showConcessionDialog, setShowConcessionDialog] = useState(false);
  const [
    selectedReservationForConcession,
    setSelectedReservationForConcession,
  ] = useState<any>(null);

  // Use React Query hook for reservations
  const {
    data: reservationsData,
    isLoading: isLoadingReservations,
    isError: reservationsError,
    error: reservationsErrObj,
    refetch: refetchReservations,
  } = useCollegeReservationsList({ page: 1, page_size: 20 });

  // Delete reservation hook
  const deleteReservation = useDeleteCollegeReservation();

  // Process reservations data
  const allReservations = useMemo(() => {
    if (!reservationsData?.reservations) return [];

    if (!Array.isArray(reservationsData.reservations)) return [];

    return reservationsData.reservations.map((r: any) => ({
      reservation_id: r.reservation_id,
      reservation_date: r.reservation_date,
      student_name: r.student_name,
      aadhar_no: r.aadhar_no,
      gender: r.gender,
      dob: r.dob,
      father_name: r.father_or_guardian_name,
      father_mobile: r.father_or_guardian_mobile,
      group_id: r.group_id || r.preferred_group_id,
      course_id: r.course_id || r.preferred_course_id,
      group_name: r.group_name,
      course_name: r.course_name,
      reservation_no: r.reservation_no,
      status: r.status || "PENDING",
      created_at: r.created_at,
      remarks: r.remarks,
      // Additional fields for UI functionality
      income_id: r.income_id || r.incomeId,
      tuition_fee: r.total_tuition_fee || 0,
      transport_fee: r.transport_fee || 0,
      book_fee: r.book_fee || 0,
      application_fee: r.reservation_fee || 0,
      tuition_concession: r.tuition_concession || 0,
      transport_concession: r.transport_concession || 0,
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
    courseName: "N/A",

    // Fee Setup
    transport: "No",
    busRoute: "",
    pickupPoint: "",

    // Payments
    applicationFee: "",
    reservationFee: "",

    // Advanced (new fields)
    preferredClassId: "0",
    preferredGroupId: "0",
    preferredDistanceSlabId: "0",
    bookFee: "0",
    tuitionConcession: "0",
    transportConcession: "0",
    referredBy: "",
    reservationDate: "",
    siblingsJson: "",
    siblings: [] as Array<{
      name: string;
      class_name: string;
      where: string;
      gender: string;
    }>,

    // Remarks
    remarks: "",
  });

  // Fee calculations based on selected group, course, and transport options
  const groupFee = useMemo(() => {
    if (!selectedGroupId || !groupsData?.items) return 0;
    const selectedGroup = groupsData.items.find(g => g.group_id === selectedGroupId);
    return selectedGroup?.group_fee || 0;
  }, [selectedGroupId, groupsData]);

  const courseFee = useMemo(() => {
    if (!coursesData?.items || coursesData.items.length === 0) return 0;
    
    // Get the selected course ID from the form
    const selectedCourseId = Number(form.course || 0);
    if (selectedCourseId && selectedCourseId > 0) {
      const selectedCourse = coursesData.items.find(c => c.course_id === selectedCourseId);
      return selectedCourse?.course_fee || 0;
    }
    
    // Fallback to first course if no specific course is selected
    return coursesData.items[0]?.course_fee || 0;
  }, [coursesData, form.course]);

  const bookFee = useMemo(() => {
    if (!selectedGroupId || !groupsData?.items) return 0;
    const selectedGroup = groupsData.items.find(g => g.group_id === selectedGroupId);
    return selectedGroup?.book_fee || 0;
  }, [selectedGroupId, groupsData]);

  const transportFee = useMemo(() => {
    if (form.transport !== "Yes") return 0;
    
    const selectedSlabId = Number(form.preferredDistanceSlabId || 0);
    if (selectedSlabId && distanceSlabs) {
      const selectedSlab = distanceSlabs.find(slab => slab.slab_id === selectedSlabId);
      return selectedSlab?.fee_amount || 0;
    }
    
    return 0;
  }, [form.transport, form.preferredDistanceSlabId, distanceSlabs]);

  // Class, group and course change handlers
  const handleClassChange = (classId: number) => {
    setForm(prev => ({
      ...prev,
      preferredClassId: classId.toString(),
    }));
  };

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId);
    // Reset course selection when group changes
    setForm(prev => ({
      ...prev,
      preferredGroupId: groupId.toString(),
      group: groupsData?.items?.find(g => g.group_id === groupId)?.group_name || "",
      course: "N/A", // Reset course when group changes
    }));
  };

  const handleCourseChange = (courseId: number) => {
    const selectedCourse = coursesData?.items?.find(c => c.course_id === courseId);
    if (selectedCourse) {
      setForm(prev => ({
        ...prev,
        course: courseId.toString(), // Store course ID for fee calculation
        courseName: selectedCourse.course_name, // Store course name for display
      }));
    }
  };

  const handleDistanceSlabChange = (slabId: number) => {
    const selectedSlab = distanceSlabs?.find(slab => slab.slab_id === slabId);
    if (selectedSlab) {
      setForm(prev => ({
        ...prev,
        preferredDistanceSlabId: slabId.toString(),
      }));
    }
  };

  const handleUpdateConcession = async (reservation: any) => {
    try {
      // Fetch the full reservation details for the dialog
      const fullReservationData = await CollegeReservationsService.getById(
        reservation.reservation_id
      );
      setSelectedReservationForConcession(fullReservationData);
      setShowConcessionDialog(true);
    } catch (error) {
      console.error("Failed to load reservation for concession update:", error);
      toast({
        title: "Failed to Load Reservation",
        description: "Could not load reservation details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConcessionUpdate = async (
    reservationId: number,
    tuitionConcession: number,
    transportConcession: number,
    remarks: string
  ) => {
    try {
      await CollegeReservationsService.updateConcessions(reservationId, {
        tuition_concession: tuitionConcession,
        transport_concession: transportConcession,
        remarks: remarks || null,
      });

      toast({
        title: "Concession Updated",
        description: "Concession amounts have been updated successfully.",
      });

      // Refresh the reservations list
      refetchReservations();
    } catch (error: any) {
      console.error("Failed to update concession:", error);
      toast({
        title: "Update Failed",
        description:
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to update concession.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the dialog handle it
    }
  };

  const handleSave = async (withPayment: boolean) => {
    // Validate required fields
    if (!form.studentName?.trim()) {
      toast({
        title: "Validation Error",
        description: "Student name is required",
        variant: "destructive",
      });
      return;
    }

    if (!form.preferredClassId || form.preferredClassId === "0") {
      toast({
        title: "Validation Error",
        description: "Please select a class",
        variant: "destructive",
      });
      return;
    }

    if (!form.preferredGroupId || form.preferredGroupId === "0") {
      toast({
        title: "Validation Error",
        description: "Please select a group",
        variant: "destructive",
      });
      return;
    }

    if (!form.course || form.course === "0") {
      toast({
        title: "Validation Error",
        description: "Please select a course",
        variant: "destructive",
      });
      return;
    }

    // Parse siblings JSON if provided
    let siblings = null;
    if ((form.siblingsJson || "").trim()) {
      try {
        siblings = JSON.parse(form.siblingsJson);
      } catch (e) {
        console.warn("Invalid siblings JSON:", e);
      }
    }

    const payload = {
      student_name: form.studentName,
      aadhar_no: form.studentAadhar || null,
      gender: (form.gender || "OTHER").toUpperCase() as
        | "MALE"
        | "FEMALE"
        | "OTHER",
      dob: form.dob ? new Date(form.dob).toISOString() : null, // Convert string to ISO datetime
      father_or_guardian_name: form.fatherName || null,
      father_or_guardian_aadhar_no: form.fatherAadhar || null,
      father_or_guardian_mobile: form.fatherMobile || null,
      father_or_guardian_occupation: form.fatherOccupation || null,
      mother_or_guardian_name: form.motherName || null,
      mother_or_guardian_aadhar_no: form.motherAadhar || null,
      mother_or_guardian_mobile: form.motherMobile || null,
      mother_or_guardian_occupation: form.motherOccupation || null,
      siblings: siblings,
      previous_class: form.lastClass || null,
      previous_school_details: form.previousSchool || null,
      present_address: form.presentAddress || null,
      permanent_address: form.permanentAddress || null,
      application_fee: Number(form.reservationFee || 0),
      preferred_class_id: Number(form.preferredClassId || 0),
      preferred_group_id: Number(form.preferredGroupId || 0),
      group_name: form.group || "N/A", // Required field - provide default
      preferred_course_id: Number(form.course || 0),
      course_name: form.courseName || "N/A", // Required field - provide default
      group_fee: Number(groupFee || 0),
      course_fee: Number(courseFee || 0),
      book_fee: Number(bookFee || 0),
      total_tuition_fee: Number(groupFee + courseFee || 0),
      transport_required: form.transport === "Yes",
      preferred_transport_id:
        form.transport === "Yes" && form.busRoute
          ? Number(form.busRoute)
          : null, // Use null instead of 0 for optional fields
      preferred_distance_slab_id: form.preferredDistanceSlabId
        ? Number(form.preferredDistanceSlabId)
        : null, // Use null instead of 0 for optional fields
      pickup_point: form.pickupPoint || null,
      transport_fee:
        form.transport === "Yes" ? Number(transportFee || 0) : null, // Use null instead of 0
      book_fee_required: false,
      course_required: false,
      status: "PENDING" as "PENDING" | "CONFIRMED" | "CANCELLED",
      referred_by: form.referredBy ? Number(form.referredBy) : null, // Use null instead of 0
      remarks: form.remarks || null,
    };

    try {
      const res: any = await CollegeReservationsService.create(payload);
      // Use backend reservation_id to display receipt number
      setReservationNo(String(res?.reservation_id || ""));
      if (withPayment) setShowReceipt(true);
      // Refresh list after creating
      if (activeTab === "all") {
        refetchReservations();
      }
    } catch (e: any) {
      console.error("Failed to create reservation:", e);
      toast({
        title: "Reservation Creation Failed",
        description:
          e?.message ||
          "Unable to create reservation. Please check your inputs and try again.",
        variant: "destructive",
      });
    }
  };

  const buildPayloadFromForm = (f: any) => {
    // Parse siblings JSON if provided
    let siblings = null;
    if ((f.siblingsJson || "").trim()) {
      try {
        siblings = JSON.parse(f.siblingsJson);
      } catch (e) {
        console.warn("Invalid siblings JSON:", e);
      }
    }

    return {
      student_name: f.studentName,
      aadhar_no: f.studentAadhar || null,
      gender: (f.gender || "OTHER").toUpperCase() as
        | "MALE"
        | "FEMALE"
        | "OTHER",
      dob: f.dob ? new Date(f.dob).toISOString() : null, // Convert string to ISO datetime
      father_or_guardian_name: f.fatherName || null,
      father_or_guardian_aadhar_no: f.fatherAadhar || null,
      father_or_guardian_mobile: f.fatherMobile || null,
      father_or_guardian_occupation: f.fatherOccupation || null,
      mother_or_guardian_name: f.motherName || null,
      mother_or_guardian_aadhar_no: f.motherAadhar || null,
      mother_or_guardian_mobile: f.motherMobile || null,
      mother_or_guardian_occupation: f.motherOccupation || null,
      siblings: siblings,
      previous_class: f.lastClass || null,
      previous_school_details: f.previousSchool || null,
      present_address: f.presentAddress || null,
      permanent_address: f.permanentAddress || null,
      application_fee: Number(f.reservationFee || 0),
      preferred_class_id: Number(f.preferredClassId || 0),
      preferred_group_id: Number(f.preferredGroupId || 0),
      group_name: f.group || "N/A", // Required field - provide default
      preferred_course_id: Number(f.course || 0),
      course_name: f.courseName || "N/A", // Required field - provide default
      group_fee: Number(groupFee || 0),
      course_fee: Number(courseFee || 0),
      book_fee: Number(bookFee || 0),
      total_tuition_fee: Number(groupFee + courseFee || 0),
      transport_required: f.transport === "Yes",
      preferred_transport_id:
        f.transport === "Yes" && f.busRoute ? Number(f.busRoute) : null, // Use null instead of 0
      preferred_distance_slab_id: f.preferredDistanceSlabId
        ? Number(f.preferredDistanceSlabId)
        : null, // Use null instead of 0
      pickup_point: f.pickupPoint || null,
      transport_fee: f.transport === "Yes" ? Number(transportFee || 0) : null, // Use null instead of 0
      book_fee_required: false,
      course_required: false,
      status: "PENDING" as "PENDING" | "CONFIRMED" | "CANCELLED",
      referred_by: f.referredBy ? Number(f.referredBy) : null, // Use null instead of 0
      remarks: f.remarks || null,
    };
  };

  const mapApiToForm = (r: any) => ({
    studentName: r.student_name || "",
    studentAadhar: r.aadhar_no || "",
    fatherName: r.father_or_guardian_name || "",
    fatherAadhar: r.father_or_guardian_aadhar_no || "",
    motherName: r.mother_or_guardian_name || "",
    motherAadhar: r.mother_or_guardian_aadhar_no || "",
    fatherOccupation: r.father_or_guardian_occupation || "",
    motherOccupation: r.mother_or_guardian_occupation || "",
    gender: (r.gender || "").toString(),
    dob: r.dob || "",
    previousSchool: r.previous_school_details || "",
    village: "",
    lastClass: r.previous_class || "",
    presentAddress: r.present_address || "",
    permanentAddress: r.permanent_address || "",
    fatherMobile: r.father_or_guardian_mobile || "",
    motherMobile: r.mother_or_guardian_mobile || "",
    classAdmission: r.group_name
      ? `${r.group_name}${r.course_name ? ` - ${r.course_name}` : ""}`
      : "",
    group: r.group_name || "",
    course: r.preferred_course_id ? String(r.preferred_course_id) : "N/A",
    courseName: r.course_name || "N/A",
    transport: r.preferred_transport_id ? "Yes" : "No",
    busRoute: r.preferred_transport_id ? String(r.preferred_transport_id) : "",
    pickupPoint: r.pickup_point || "",
    applicationFee: "",
    reservationFee: r.application_fee != null ? String(r.application_fee) : "",
    remarks: r.remarks || "",
    preferredClassId:
      r.preferred_class_id != null ? String(r.preferred_class_id) : "0",
    preferredGroupId:
      r.preferred_group_id != null ? String(r.preferred_group_id) : "0",
    preferredDistanceSlabId:
      r.preferred_distance_slab_id != null
        ? String(r.preferred_distance_slab_id)
        : "0",
    bookFee: r.book_fee != null ? String(r.book_fee) : "0",
    tuitionConcession:
      r.tuition_concession != null ? String(r.tuition_concession) : "0",
    transportConcession:
      r.transport_concession != null ? String(r.transport_concession) : "0",
    referredBy: r.referred_by != null ? String(r.referred_by) : "",
    reservationDate: r.reservation_date || "",
    siblingsJson: JSON.stringify(r.siblings || []),
  });

  const handleView = async (r: any) => {
    if (!r?.reservation_id || isNaN(Number(r.reservation_id))) {
      toast({
        title: "Invalid Reservation",
        description: "The reservation ID is invalid. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (loadingReservation === Number(r.reservation_id)) {
      return; // Already loading this reservation
    }

    setLoadingReservation(Number(r.reservation_id));
    try {
      const data = await CollegeReservationsService.getViewById(Number(r.reservation_id));
      setViewReservation(data);
      setShowViewDialog(true);
    } catch (e: any) {
      console.error("Error loading reservation:", e);
      if (e?.response?.status === 404) {
        toast({
          title: "Reservation Not Found",
          description:
            "The reservation may have been deleted or you may not have permission to view it.",
          variant: "destructive",
        });
      } else if (e?.response?.status === 500) {
        toast({
          title: "Server Error",
          description:
            "A server error occurred while loading reservation. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Load Reservation",
          description:
            e?.message ||
            "Could not load reservation details. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingReservation(null);
    }
  };

  const handleEdit = async (r: any) => {
    if (!r?.reservation_id || isNaN(Number(r.reservation_id))) {
      toast({
        title: "Invalid Reservation",
        description: "The reservation ID is invalid. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (loadingReservation === Number(r.reservation_id)) {
      return; // Already loading this reservation
    }

    setLoadingReservation(Number(r.reservation_id));
    try {
      const data: any = await CollegeReservationsService.getById(Number(r.reservation_id));
      setEditForm(mapApiToForm(data));
      setSelectedReservation({ reservation_id: r.reservation_id });
      setShowEditDialog(true);
    } catch (e: any) {
      console.error("Error loading reservation for edit:", e);
      if (e?.response?.status === 404) {
        toast({
          title: "Reservation Not Found",
          description:
            "The reservation may have been deleted or you may not have permission to edit it.",
          variant: "destructive",
        });
      } else if (e?.response?.status === 500) {
        toast({
          title: "Server Error",
          description:
            "A server error occurred while loading reservation. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Load Reservation",
          description:
            e?.message ||
            "Could not load reservation for editing. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingReservation(null);
    }
  };

  const submitEdit = async () => {
    if (!selectedReservation?.reservation_id || !editForm) return;
    try {
      const payload = buildPayloadFromForm(editForm);
      await CollegeReservationsService.update(
        Number(selectedReservation.reservation_id),
        payload
      );
      setShowEditDialog(false);
      refetchReservations();
    } catch (e: any) {
      console.error("Failed to update reservation:", e);
      toast({
        title: "Update Failed",
        description:
          e?.message || "Could not update reservation. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Cancellation Remarks Required",
        description:
          "Please provide a reason for cancellation before proceeding.",
        variant: "destructive",
      });
      return;
    }
    try {
      if (selectedReservation?.reservation_id) {
        await CollegeReservationsService.updateStatus(
          Number(selectedReservation.reservation_id),
          {
            status: "CANCELLED" as "PENDING" | "CONFIRMED" | "CANCELLED",
            remarks: cancelRemarks || null,
          }
        );
        // refresh list
        refetchReservations();
      }
    } catch (e: any) {
      console.error("Failed to cancel reservation:", e);
      toast({
        title: "Cancellation Failed",
        description:
          e?.message || "Could not cancel reservation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowCancelDialog(false);
      setCancelRemarks("");
      setSelectedReservation(null);
    }
  };

  const handleConvertToAdmission = (reservation: any) => {
    // Navigate to admissions page with reservation data
    window.location.href = `/admissions/new?reservation=${reservation.reservation_id}`;
  };

  // Handle API errors
  useEffect(() => {
    if (groupsError) {
      toast({
        title: "Failed to Load Groups",
        description: "Could not load groups data. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [groupsError]);

  useEffect(() => {
    if (coursesError) {
      toast({
        title: "Failed to Load Courses",
        description: "Could not load courses data. Please try again.",
        variant: "destructive",
      });
    }
  }, [coursesError]);

  useEffect(() => {
    if (distanceSlabsError) {
      toast({
        title: "Failed to Load Distance Slabs",
        description: "Could not load distance slabs data. Please try again.",
        variant: "destructive",
      });
    }
  }, [distanceSlabsError]);

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
          <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {currentBranch?.branch_type === "COLLEGE" ? (
              <University className="h-3 w-3" />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            {currentBranch?.branch_name}
          </Badge>
        </div>
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
              <div>
                {(classesLoading || groupsLoading || coursesLoading || isLoadingDistanceSlabs) && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                      <span className="text-sm">Loading classes, groups, courses, and distance slabs...</span>
                    </div>
                  </div>
                )}
                <ReservationForm
                  form={{
                    student_name: form.studentName,
                    aadhar_no: form.studentAadhar,
                    gender: form.gender,
                    dob: form.dob,
                    father_or_guardian_name: form.fatherName,
                    father_or_guardian_aadhar_no: form.fatherAadhar,
                    father_or_guardian_mobile: form.fatherMobile,
                    father_or_guardian_occupation: form.fatherOccupation,
                    mother_or_guardian_name: form.motherName,
                    mother_or_guardian_aadhar_no: form.motherAadhar,
                    mother_or_guardian_mobile: form.motherMobile,
                    mother_or_guardian_occupation: form.motherOccupation,
                    siblings: form.siblings || [],
                    previous_class: form.lastClass,
                    previous_school_details: form.previousSchool,
                    present_address: form.presentAddress,
                    permanent_address: form.permanentAddress,
                    application_fee: Number(form.reservationFee || 0),
                    preferred_class_id: Number(form.preferredClassId || 0),
                    preferred_group_id: Number(form.preferredGroupId || 0),
                    group_name: form.group,
                    preferred_course_id: Number(form.course || 0),
                    course_name: form.courseName,
                    group_fee: groupFee,
                    course_fee: courseFee,
                    book_fee: bookFee,
                    total_tuition_fee: groupFee + courseFee,
                    transport_required: form.transport === "Yes",
                    preferred_transport_id: form.transport === "Yes" ? Number(form.busRoute || 0) : 0,
                    preferred_distance_slab_id: Number(form.preferredDistanceSlabId || 0),
                    pickup_point: form.pickupPoint,
                    transport_fee: transportFee,
                    book_fee_required: true,
                    course_required: true,
                    status: "PENDING",
                    referred_by: Number(form.referredBy || 0),
                    remarks: form.remarks,
                    reservation_date: form.reservationDate || new Date().toISOString().split("T")[0],
                  }}
                  setForm={(next) => {
                    setForm({
                      ...form,
                      studentName: next.student_name,
                      studentAadhar: next.aadhar_no,
                      gender: next.gender,
                      dob: next.dob,
                      fatherName: next.father_or_guardian_name,
                      fatherAadhar: next.father_or_guardian_aadhar_no,
                      fatherMobile: next.father_or_guardian_mobile,
                      fatherOccupation: next.father_or_guardian_occupation,
                      motherName: next.mother_or_guardian_name,
                      motherAadhar: next.mother_or_guardian_aadhar_no,
                      motherMobile: next.mother_or_guardian_mobile,
                      motherOccupation: next.mother_or_guardian_occupation,
                      siblings: next.siblings,
                      lastClass: next.previous_class,
                      previousSchool: next.previous_school_details,
                      presentAddress: next.present_address,
                      permanentAddress: next.permanent_address,
                      reservationFee: next.application_fee.toString(),
                      preferredClassId: next.preferred_class_id.toString(),
                      preferredGroupId: next.preferred_group_id.toString(),
                      group: next.group_name,
                      course: next.preferred_course_id.toString(),
                      courseName: next.course_name,
                      bookFee: next.book_fee.toString(),
                      transport: next.transport_required ? "Yes" : "No",
                      busRoute: next.preferred_transport_id.toString(),
                      pickupPoint: next.pickup_point,
                      preferredDistanceSlabId: next.preferred_distance_slab_id.toString(),
                      referredBy: next.referred_by.toString(),
                      remarks: next.remarks,
                      reservationDate: next.reservation_date,
                    });
                  }}
                  groupFee={groupFee}
                  courseFee={courseFee}
                  transportFee={transportFee}
                  routes={routeNames.map(
                    (route: {
                      bus_route_id: number;
                      route_no?: string;
                      route_name: string;
                    }) => ({
                      id: route.bus_route_id,
                      name: `${route.route_no || "Route"} - ${route.route_name}`,
                      fee: 0, // Route fee will be calculated based on distance slab
                    })
                  )}
                  groups={groupsData?.items?.map(g => ({
                    group_id: g.group_id,
                    group_name: g.group_name,
                    fee: g.group_fee,
                  })) || []}
                  courses={coursesData?.items?.map(c => ({
                    course_id: c.course_id,
                    course_name: c.course_name,
                    fee: c.course_fee,
                  })) || []}
                  classes={classesData?.map(c => ({
                    class_id: c.class_id,
                    class_name: c.class_name,
                  })) || []}
                  distanceSlabs={distanceSlabs?.map(slab => ({
                    slab_id: slab.slab_id,
                    slab_name: slab.slab_name,
                    min_distance: slab.min_distance,
                    max_distance: slab.max_distance,
                    fee_amount: slab.fee_amount,
                  })) || []}
                  onClassChange={handleClassChange}
                  onGroupChange={handleGroupChange}
                  onCourseChange={handleCourseChange}
                  onDistanceSlabChange={handleDistanceSlabChange}
                  onSave={handleSave}
                />
              </div>
            ),
          },
          {
            value: "all",
            label: "All Reservations",
            icon: List,
            content: (
              <div>
                {reservationsError ? (
                  <div className="p-6 text-center">
                    <div className="text-red-600 mb-2">
                      <h3 className="font-medium">Connection Error</h3>
                      <p className="text-sm text-muted-foreground">
                        {reservationsErrObj?.message?.includes("Bad Gateway")
                          ? "Backend server is not responding (502 Bad Gateway)"
                          : "Failed to load reservations"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchReservations()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <AllReservationsComponent
                    reservations={allReservations}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={(r: any) => {
                      setReservationToDelete(r);
                      setShowDeleteDialog(true);
                    }}
                    onUpdateConcession={handleUpdateConcession}
                    isLoading={isLoadingReservations}
                  />
                )}
              </div>
            ),
          },
          {
            value: "status",
            label: "Status",
            icon: BarChart3,
            content: (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Update Status</h3>
                      <p className="text-sm text-muted-foreground">
                        Modify reservation statuses quickly
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {allReservations.length} items
                      </Badge>
                      {reservationsData && (
                        <Badge variant="secondary">
                          Total: {reservationsData.total_count || 0}
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchReservations()}
                        disabled={isLoadingReservations}
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                </div>
                {isLoadingReservations ? (
                  <div className="p-6 text-sm text-muted-foreground">
                    Loading reservations…
                  </div>
                ) : reservationsError ? (
                  <div className="p-6 text-center">
                    <div className="text-red-600 mb-2">
                      <h3 className="font-medium">Connection Error</h3>
                      <p className="text-sm text-muted-foreground">
                        {reservationsErrObj?.message?.includes("Bad Gateway")
                          ? "Backend server is not responding (502 Bad Gateway)"
                          : "Failed to load reservations"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchReservations()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <StatusUpdateComponent
                    reservations={allReservations}
                    onStatusUpdate={refetchReservations}
                    isLoading={isLoadingReservations}
                  />
                )}
              </div>
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
                <span>Group Fee:</span>
                <span>₹{groupFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Course Fee:</span>
                <span>₹{courseFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Book Fee:</span>
                <span>₹{bookFee.toLocaleString()}</span>
              </div>
              {form.transport === "Yes" && (
                <div className="flex justify-between">
                  <span>Transport Fee:</span>
                  <span>₹{transportFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{(groupFee + courseFee + bookFee + transportFee).toLocaleString()}</span>
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
                <div>
                  <strong>Reservation ID:</strong>{" "}
                  {viewReservation.reservation_id}
                </div>
                <div>
                  <strong>Reservation No:</strong>{" "}
                  {viewReservation.reservation_no || "-"}
                </div>
                <div>
                  <strong>Branch:</strong>{" "}
                  {viewReservation.branch_name || "-"}
                </div>
                <div>
                  <strong>Academic Year:</strong>{" "}
                  {viewReservation.academic_year || "-"}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {viewReservation.reservation_date || "-"}
                </div>
                <div>
                  <strong>Status:</strong> {viewReservation.status || "-"}
                </div>
                <div>
                  <strong>Referred By:</strong>{" "}
                  {viewReservation.referred_by_name || "-"}
                </div>
                <div>
                  <strong>Created At:</strong>{" "}
                  {viewReservation.created_at ? new Date(viewReservation.created_at).toLocaleString() : "-"}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Student Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Name:</strong> {viewReservation.student_name || "-"}
                  </div>
                  <div>
                    <strong>Gender:</strong> {viewReservation.gender || "-"}
                  </div>
                  <div>
                    <strong>DOB:</strong> {viewReservation.dob ? new Date(viewReservation.dob).toLocaleDateString() : "-"}
                  </div>
                  <div>
                    <strong>Group:</strong> {viewReservation.group_name || "-"}
                  </div>
                  <div>
                    <strong>Course:</strong> {viewReservation.course_name || "-"}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Father/Guardian Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Name:</strong>{" "}
                    {viewReservation.father_or_guardian_name || "-"}
                  </div>
                  <div>
                    <strong>Aadhar No:</strong>{" "}
                    {viewReservation.father_or_guardian_aadhar_no || "-"}
                  </div>
                  <div>
                    <strong>Mobile:</strong>{" "}
                    {viewReservation.father_or_guardian_mobile || "-"}
                  </div>
                  <div>
                    <strong>Occupation:</strong>{" "}
                    {viewReservation.father_or_guardian_occupation || "-"}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Mother/Guardian Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Name:</strong>{" "}
                    {viewReservation.mother_or_guardian_name || "-"}
                  </div>
                  <div>
                    <strong>Aadhar No:</strong>{" "}
                    {viewReservation.mother_or_guardian_aadhar_no || "-"}
                  </div>
                  <div>
                    <strong>Mobile:</strong>{" "}
                    {viewReservation.mother_or_guardian_mobile || "-"}
                  </div>
                  <div>
                    <strong>Occupation:</strong>{" "}
                    {viewReservation.mother_or_guardian_occupation || "-"}
                  </div>
                </div>
              </div>


              <div className="border-t pt-4">
                <div className="font-medium mb-2">Contact Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Present Address:</strong>{" "}
                    {viewReservation.present_address || "-"}
                  </div>
                  <div>
                    <strong>Permanent Address:</strong>{" "}
                    {viewReservation.permanent_address || "-"}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Fees</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Application Fee:</span>
                    <span>
                      ₹{viewReservation.application_fee || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Application Fee Paid:</span>
                    <span>{viewReservation.application_fee_paid || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Book Fee:</span>
                    <span>
                      ₹{viewReservation.book_fee || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Group Fee:</span>
                    <span>
                      ₹{viewReservation.group_fee || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Course Fee:</span>
                    <span>
                      ₹{viewReservation.course_fee || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Tuition Fee:</span>
                    <span>
                      ₹{viewReservation.total_tuition_fee || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tuition Concession:</span>
                    <span>
                      ₹{viewReservation.tuition_concession || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Payable Tuition Fee:</span>
                    <span className="text-green-600">
                      ₹{viewReservation.payable_tuition_fee || "0"}
                    </span>
                  </div>
                  {viewReservation.transport_required === "Yes" && (
                    <>
                      <div className="flex justify-between">
                        <span>Transport Fee:</span>
                        <span>
                          ₹{viewReservation.transport_fee || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transport Concession:</span>
                        <span>
                          ₹{viewReservation.transport_concession || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Payable Transport Fee:</span>
                        <span className="text-green-600">
                          ₹{viewReservation.payable_transport_fee || "0"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {viewReservation.transport_required === "Yes" && (
                <div className="border-t pt-4">
                  <div className="font-medium mb-2">Transport Information</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Transport Required:</strong>{" "}
                      {viewReservation.transport_required}
                    </div>
                    <div>
                      <strong>Route:</strong>{" "}
                      {viewReservation.route_ || "-"}
                    </div>
                    <div>
                      <strong>Slab:</strong>{" "}
                      {viewReservation.slab || "-"}
                    </div>
                  </div>
                </div>
              )}

              {viewReservation.siblings && viewReservation.siblings.length > 0 && (
                <div className="border-t pt-4">
                  <div className="font-medium mb-2">Siblings Information</div>
                  <div className="space-y-3">
                    {viewReservation.siblings.map((sibling, index) => (
                      <div key={index} className="border rounded p-3 bg-gray-50">
                        <div className="grid grid-cols-2 gap-2 text-sm">
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-2 bg-background border-t py-3">
            <Button type="button" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reservation Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
            <DialogDescription>
              Update reservation information
            </DialogDescription>
          </DialogHeader>
          {editForm ? (
            <div className="flex-1 overflow-y-auto pr-1">
              {(groupsLoading || coursesLoading || isLoadingDistanceSlabs) && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    <span className="text-sm">Loading groups, courses, and distance slabs...</span>
                  </div>
                </div>
              )}
              <ReservationForm
                form={{
                  student_name: editForm.studentName,
                  aadhar_no: editForm.studentAadhar,
                  gender: editForm.gender,
                  dob: editForm.dob,
                  father_or_guardian_name: editForm.fatherName,
                  father_or_guardian_aadhar_no: editForm.fatherAadhar,
                  father_or_guardian_mobile: editForm.fatherMobile,
                  father_or_guardian_occupation: editForm.fatherOccupation,
                  mother_or_guardian_name: editForm.motherName,
                  mother_or_guardian_aadhar_no: editForm.motherAadhar,
                  mother_or_guardian_mobile: editForm.motherMobile,
                  mother_or_guardian_occupation: editForm.motherOccupation,
                  siblings: editForm.siblings || [],
                  previous_class: editForm.lastClass,
                  previous_school_details: editForm.previousSchool,
                  present_address: editForm.presentAddress,
                  permanent_address: editForm.permanentAddress,
                  application_fee: Number(editForm.reservationFee || 0),
                  preferred_class_id: Number(editForm.preferredClassId || 0),
                  preferred_group_id: Number(editForm.preferredGroupId || 0),
                  group_name: editForm.group,
                  preferred_course_id: Number(editForm.course || 0),
                  course_name: editForm.courseName,
                  group_fee: groupFee,
                  course_fee: courseFee,
                  book_fee: bookFee,
                  total_tuition_fee: groupFee + courseFee,
                  transport_required: editForm.transport === "Yes",
                  preferred_transport_id: editForm.transport === "Yes" ? Number(editForm.busRoute || 0) : 0,
                  preferred_distance_slab_id: Number(editForm.preferredDistanceSlabId || 0),
                  pickup_point: editForm.pickupPoint,
                  transport_fee: transportFee,
                  book_fee_required: true,
                  course_required: true,
                  status: "PENDING",
                  referred_by: Number(editForm.referredBy || 0),
                  remarks: editForm.remarks,
                  reservation_date: editForm.reservationDate || new Date().toISOString().split("T")[0],
                }}
                setForm={(next) => {
                  setEditForm({
                    ...editForm,
                    studentName: next.student_name,
                    studentAadhar: next.aadhar_no,
                    gender: next.gender,
                    dob: next.dob,
                    fatherName: next.father_or_guardian_name,
                    fatherAadhar: next.father_or_guardian_aadhar_no,
                    fatherMobile: next.father_or_guardian_mobile,
                    fatherOccupation: next.father_or_guardian_occupation,
                    motherName: next.mother_or_guardian_name,
                    motherAadhar: next.mother_or_guardian_aadhar_no,
                    motherMobile: next.mother_or_guardian_mobile,
                    motherOccupation: next.mother_or_guardian_occupation,
                    siblings: next.siblings,
                    lastClass: next.previous_class,
                    previousSchool: next.previous_school_details,
                    presentAddress: next.present_address,
                    permanentAddress: next.permanent_address,
                    reservationFee: next.application_fee.toString(),
                    preferredClassId: next.preferred_class_id.toString(),
                    preferredGroupId: next.preferred_group_id.toString(),
                    group: next.group_name,
                    course: next.preferred_course_id.toString(),
                    courseName: next.course_name,
                    bookFee: next.book_fee.toString(),
                    transport: next.transport_required ? "Yes" : "No",
                    busRoute: next.preferred_transport_id.toString(),
                    pickupPoint: next.pickup_point,
                    preferredDistanceSlabId: next.preferred_distance_slab_id.toString(),
                    referredBy: next.referred_by.toString(),
                    remarks: next.remarks,
                    reservationDate: next.reservation_date,
                  });
                }}
                groupFee={groupFee}
                courseFee={courseFee}
                transportFee={transportFee}
                routes={routeNames.map(
                  (route: {
                    bus_route_id: number;
                    route_no?: string;
                    route_name: string;
                  }) => ({
                    id: route.bus_route_id,
                    name: `${route.route_no || "Route"} - ${route.route_name}`,
                    fee: 0, // Route fee will be calculated based on distance slab
                  })
                )}
                groups={groupsData?.items?.map(g => ({
                  group_id: g.group_id,
                  group_name: g.group_name,
                  fee: g.group_fee,
                })) || []}
                courses={coursesData?.items?.map(c => ({
                  course_id: c.course_id,
                  course_name: c.course_name,
                  fee: c.course_fee,
                })) || []}
                classes={classesData?.map(c => ({
                  class_id: c.class_id,
                  class_name: c.class_name,
                })) || []}
                distanceSlabs={distanceSlabs?.map(slab => ({
                  slab_id: slab.slab_id,
                  slab_name: slab.slab_name,
                  min_distance: slab.min_distance,
                  max_distance: slab.max_distance,
                  fee_amount: slab.fee_amount,
                })) || []}
                onClassChange={handleClassChange}
                onGroupChange={handleGroupChange}
                onCourseChange={handleCourseChange}
                onDistanceSlabChange={handleDistanceSlabChange}
                onSave={async () => {
                  await submitEdit();
                }}
                isEdit={true}
              />
            </div>
          ) : (
            <div className="p-4">Loading...</div>
          )}
           <DialogFooter className="mt-2 bg-background border-t py-3">
             <Button
               type="button"
               variant="outline"
               onClick={() => setShowEditDialog(false)}
             >
               Close
             </Button>
             <Button
               type="button"
               onClick={submitEdit}
               disabled={!editForm}
             >
               Update Reservation
             </Button>
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
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setReservationToDelete(null);
          }
          setShowDeleteDialog(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete reservation{" "}
              {reservationToDelete?.reservation_id}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!reservationToDelete?.reservation_id) return;
                try {
                  await deleteReservation.mutateAsync(
                    Number(reservationToDelete.reservation_id)
                  );
                  toast({
                    title: "Reservation Deleted Successfully",
                    description: `Reservation ${reservationToDelete.reservation_id} has been deleted successfully.`,
                  });
                  // Success - dialog will close automatically due to onSuccess in hook
                } catch (e: any) {
                  console.error("Failed to delete reservation:", e);
                  if (e?.response?.status === 409) {
                    toast({
                      title: "Cannot Delete Reservation",
                      description:
                        "This reservation has associated income records. Please remove the income records first or change the status to CANCELLED instead.",
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Deletion Failed",
                      description:
                        e?.response?.data?.detail ||
                        e?.message ||
                        "Failed to delete reservation",
                      variant: "destructive",
                    });
                  }
                } finally {
                  setShowDeleteDialog(false);
                  setReservationToDelete(null);
                }
              }}
              disabled={deleteReservation.isPending}
            >
              {deleteReservation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Concession Update Dialog */}
      <ConcessionUpdateDialog
        isOpen={showConcessionDialog}
        onClose={() => {
          setShowConcessionDialog(false);
          setSelectedReservationForConcession(null);
        }}
        reservation={selectedReservationForConcession}
        onUpdateConcession={handleConcessionUpdate}
      />
    </div>
  );
}
