import { useMemo, useState, useEffect } from "react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useDeleteCollegeReservation,
  useCollegeReservationDashboard,
  useCreateCollegeReservation,
} from "@/lib/hooks/college";
import { collegeKeys } from "@/lib/hooks/college";
import { invalidateAndRefetch } from "@/lib/hooks/common/useGlobalRefetch";

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
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
import { TransportService } from "@/lib/services/general";
import { toast } from "@/hooks/use-toast";
import {
  CollegeReservationsService,
  CollegeDropdownsService,
} from "@/lib/services/college";
import type { 
  CollegeReservationView, 
  CollegeReservationRead, 
  CollegeReservationMinimalRead,
  CollegeReservationSibling,
  CollegeReservationCreate
} from "@/lib/types/college/reservations";
import { Plus, List, BarChart3, Save } from "lucide-react";

// Form state type matching the form structure
type CollegeReservationFormState = {
  studentName: string;
  studentAadhar: string;
  fatherName: string;
  fatherAadhar: string;
  motherName: string;
  motherAadhar: string;
  fatherOccupation: string;
  motherOccupation: string;
  gender: string;
  dob: string;
  previousSchool: string;
  village: string;
  lastClass: string;
  presentAddress: string;
  permanentAddress: string;
  fatherMobile: string;
  motherMobile: string;
  classAdmission: string;
  group: string;
  course: string;
  courseName: string;
  transport: string;
  busRoute: string;
  pickupPoint: string;
  applicationFee: string;
  reservationFee: string;
  preferredClassId: string;
  preferredGroupId: string;
  bookFee: string;
  tuitionConcession: string;
  transportConcession: string;
  bookFeeRequired: boolean;
  courseRequired: boolean;
  referredBy: string;
  reservationDate: string;
  siblingsJson: string;
  siblings: Array<{
    name: string;
    class_name: string;
    where: string;
    gender: string;
  }>;
  remarks: string;
};
import { TabSwitcher } from "@/components/shared";
import StatusUpdateTable from "./StatusUpdateComponent";
import AllReservationsComponent from "./AllReservationsComponent";
import { CollegeReservationStatsCards } from "./CollegeReservationStatsCards";
import {
  ConcessionUpdateDialog,
  ReceiptPreviewModal,
} from "@/components/shared";
import { ReservationPaymentData } from "@/components/shared/payment";
import CollegeReservationPaymentProcessor from "@/components/shared/payment/CollegeReservationPaymentProcessor";
import type { CollegeIncomeRead } from "@/lib/types/college/income";
import { Building2, University } from "lucide-react";

export default function ReservationNew() {
  const { academicYear, currentBranch } = useAuthStore();

  // Initialize mutation hooks
  const createReservationMutation = useCreateCollegeReservation();

  // Track dropdown opens for lazy loading
  const [dropdownsOpened, setDropdownsOpened] = useState({
    classes: false,
    groups: false,
    courses: false,
    distanceSlabs: false,
    routes: false,
  });

  // Dashboard stats hook
  const {
    data: dashboardStats,
    isLoading: dashboardLoading,
    isError: dashboardError,
    error: dashboardErrObj,
  } = useCollegeReservationDashboard();

  // Dropdown data hooks - Load on-demand when dropdown is opened
  const {
    data: classesData,
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ["college-dropdowns", "classes"],
    queryFn: () => CollegeDropdownsService.getClasses(),
    enabled: dropdownsOpened.classes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    data: groupsData,
    isLoading: groupsLoading,
    error: groupsError,
  } = useQuery({
    queryKey: ["college-dropdowns", "groups"],
    queryFn: () => CollegeDropdownsService.getGroups(),
    enabled: dropdownsOpened.groups,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey:
      selectedGroupId && selectedGroupId > 0
        ? ["college-dropdowns", "courses", selectedGroupId]
        : ["college-dropdowns", "courses", "disabled"],
    queryFn: () => CollegeDropdownsService.getCourses(selectedGroupId!),
    enabled:
      selectedGroupId !== null &&
      selectedGroupId > 0 &&
      dropdownsOpened.courses,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    data: distanceSlabs = [],
    isLoading: isLoadingDistanceSlabs,
    error: distanceSlabsError,
  } = useQuery({
    queryKey: ["distance-slabs"],
    queryFn: () =>
      import("@/lib/services/general/distance-slabs.service").then((m) =>
        m.DistanceSlabsService.listDistanceSlabs()
      ),
    enabled: dropdownsOpened.distanceSlabs,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: routeNames = [], isLoading: routesLoading } = useQuery({
    queryKey: ["public", "bus-routes", "names"],
    queryFn: () => TransportService.getRouteNames(),
    enabled: dropdownsOpened.routes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { activeTab, setActiveTab } = useTabNavigation("new");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Enable groups dropdown when form tab is active
  React.useEffect(() => {
    if (activeTab === "new") {
      setDropdownsOpened((prev) => ({
        ...prev,
        groups: true,
        classes: true,
      }));
    }
  }, [activeTab]);

  const [reservationNo, setReservationNo] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<CollegeReservationRead | CollegeReservationMinimalRead | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewReservation, setViewReservation] =
    useState<CollegeReservationView | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<CollegeReservationFormState | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<CollegeReservationRead | CollegeReservationMinimalRead | null>(null);
  const [loadingReservation, setLoadingReservation] = useState<number | null>(
    null
  );

  // Concession related state
  const [showConcessionDialog, setShowConcessionDialog] = useState(false);
  const [
    selectedReservationForConcession,
    setSelectedReservationForConcession,
  ] = useState<CollegeReservationRead | null>(null);

  // Payment related state
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [paymentData, setPaymentData] = useState<ReservationPaymentData | null>(
    null
  );
  const [paymentIncomeRecord, setPaymentIncomeRecord] =
    useState<CollegeIncomeRead | null>(null);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);

  // Pagination state - CRITICAL: Prevents fetching ALL reservations at once
  // This fixes UI freeze by limiting data fetched per request
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50; // Fetch 50 reservations at a time (prevents loading 1000+ at once)

  // Use React Query hook for reservations - WITH PAGINATION
  // CRITICAL: Only fetch when tab is active to prevent unnecessary requests and UI freezes
  const {
    data: reservationsData,
    isLoading: isLoadingReservations,
    isError: reservationsError,
    error: reservationsErrObj,
    refetch: refetchReservations,
  } = useQuery({
    queryKey: collegeKeys.reservations.list({ page: currentPage, page_size: pageSize }),
    queryFn: () => CollegeReservationsService.list({ page: currentPage, page_size: pageSize }),
    enabled: activeTab === "all" || activeTab === "status", // Only fetch when tab is active
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete reservation hook
  const deleteReservation = useDeleteCollegeReservation();

  // Process reservations data
  const allReservations = useMemo(() => {
    if (!reservationsData?.reservations) return [];

    if (!Array.isArray(reservationsData.reservations)) return [];

    return reservationsData.reservations.map((r: CollegeReservationMinimalRead) => ({
      reservation_id: r.reservation_id,
      reservation_no: r.reservation_no,
      reservation_date: r.reservation_date,
      student_name: r.student_name,
      gender: r.gender,
      father_name: r.father_or_guardian_name,
      father_mobile: r.father_or_guardian_mobile,
      group_id: 0, // Not available in MinimalRead, will be fetched when needed
      course_id: 0, // Not available in MinimalRead, will be fetched when needed
      group_name: r.group_name,
      course_name: r.course_name,
      status: r.status || "PENDING",
      remarks: r.remarks,
      created_at: new Date().toISOString(), // Not available in MinimalRead, using current date as fallback
      application_income_id: r.application_income_id,
    }));
  }, [reservationsData]);

  // Map reservations for StatusUpdateTable
  const statusTableReservations = useMemo(() => {
    return allReservations.map((r) => ({
      id: String(r.reservation_id),
      no: r.reservation_no || String(r.reservation_id),
      reservation_id: r.reservation_id,
      studentName: r.student_name,
      status: r.status || "PENDING",
      remarks: r.remarks || "", // Add remarks
    }));
  }, [allReservations]);

  // Initial form state - moved outside component for better performance
  const initialFormState = {
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
    bookFee: "0",
    tuitionConcession: "0",
    transportConcession: "0",
    bookFeeRequired: false,
    courseRequired: true,
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
  };

  // Form state using initial state - set reservation_date to today when component mounts (matching school behavior)
  const [form, setForm] = useState(() => ({
    ...initialFormState,
    reservationDate: new Date().toISOString().split("T")[0],
  }));

  // Enable groups when a class is selected
  React.useEffect(() => {
    if (form.preferredClassId && Number(form.preferredClassId) > 0) {
      setDropdownsOpened((prev) => ({
        ...prev,
        groups: true,
      }));
    }
  }, [form.preferredClassId]);

  // Fee calculations based on selected group, course, and transport options
  const groupFee = useMemo(() => {
    if (!selectedGroupId || !groupsData?.items) return 0;
    const selectedGroup = groupsData.items.find(
      (g) => g.group_id === selectedGroupId
    );
    return selectedGroup?.group_fee || 0;
  }, [selectedGroupId, groupsData]);

  const courseFee = useMemo(() => {
    if (!coursesData?.items || coursesData.items.length === 0) return 0;

    // Get the selected course ID from the form
    const selectedCourseId = Number(form.course || 0);
    if (selectedCourseId && selectedCourseId > 0) {
      const selectedCourse = coursesData.items.find(
        (c) => c.course_id === selectedCourseId
      );
      return selectedCourse?.course_fee || 0;
    }

    // Fallback to first course if no specific course is selected
    return coursesData.items[0]?.course_fee || 0;
  }, [coursesData, form.course]);

  const bookFee = useMemo(() => {
    if (!selectedGroupId || !groupsData?.items) return 0;
    const selectedGroup = groupsData.items.find(
      (g) => g.group_id === selectedGroupId
    );
    return selectedGroup?.book_fee || 0;
  }, [selectedGroupId, groupsData]);

  // Transport fee is not used for college reservations
  const transportFee = 0;

  // Class, group and course change handlers
  const handleClassChange = (classId: number) => {
    setForm((prev) => ({
      ...prev,
      preferredClassId: classId.toString(),
    }));
  };

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId);
    // Reset course selection when group changes
    setForm((prev) => ({
      ...prev,
      preferredGroupId: groupId.toString(),
      group:
        groupsData?.items?.find((g) => g.group_id === groupId)?.group_name ||
        "",
      course: "N/A", // Reset course when group changes
    }));
  };

  const handleCourseChange = (courseId: number) => {
    const selectedCourse = coursesData?.items?.find(
      (c) => c.course_id === courseId
    );
    if (selectedCourse) {
      setForm((prev) => ({
        ...prev,
        course: courseId.toString(), // Store course ID for fee calculation
        courseName: selectedCourse.course_name, // Store course name for display
      }));
    }
  };

  const handleUpdateConcession = async (reservation: CollegeReservationRead | CollegeReservationMinimalRead) => {
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
      // Note: Backend only accepts tuition_concession and remarks
      // transport_concession is not supported by the backend API endpoint
      await CollegeReservationsService.updateConcessions(reservationId, {
        tuition_concession: tuitionConcession,
        remarks: remarks || null,
      });

      // Invalidate and refetch using debounced utility (prevents UI freeze)
      // Note: invalidateAndRefetch handles API cache clearing internally
      invalidateAndRefetch(collegeKeys.reservations.root());

      // Step 4: Call refetchReservations to ensure immediate API call
      void refetchReservations();

      // Fetch fresh reservation data immediately after update
      // This ensures if user reopens the dialog, it has the latest data with updated concession_lock status
      try {
        const updatedReservation =
          await CollegeReservationsService.getById(reservationId);
        // Update the state with fresh data so if dialog reopens, it shows updated values
        setSelectedReservationForConcession(updatedReservation);
      } catch (fetchError) {
        console.error("Failed to fetch updated reservation:", fetchError);
        // If fetch fails, just clear the state - next open will fetch fresh
        setSelectedReservationForConcession(null);
      }

      toast({
        title: "Concession Updated",
        description: "Concession amounts have been updated successfully.",
        variant: "success",
      });
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

    // Validate application fee is required and greater than 0
    if (!form.reservationFee || Number(form.reservationFee || 0) <= 0) {
      toast({
        title: "Validation Error",
        description: "Application fee is required and must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      student_name: form.studentName,
      aadhar_no: form.studentAadhar || null,
      gender: (form.gender || "OTHER").toUpperCase() as
        | "MALE"
        | "FEMALE"
        | "OTHER",
      dob: form.dob || null, // Date string in YYYY-MM-DD format
      father_or_guardian_name: form.fatherName || null,
      father_or_guardian_aadhar_no: form.fatherAadhar || null,
      father_or_guardian_mobile: form.fatherMobile || null,
      father_or_guardian_occupation: form.fatherOccupation || null,
      mother_or_guardian_name: form.motherName || null,
      mother_or_guardian_aadhar_no: form.motherAadhar || null,
      mother_or_guardian_mobile: form.motherMobile || null,
      mother_or_guardian_occupation: form.motherOccupation || null,
      siblings: (form.siblings || []).map((s): CollegeReservationSibling => ({
        name: s.name || null,
        class_name: s.class_name || null,
        where: s.where || null,
        gender: (s.gender || "OTHER").toUpperCase() as "MALE" | "FEMALE" | "OTHER" || null,
      })),
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
      book_fee: form.bookFeeRequired ? Number(form.bookFee || 0) : 0,
      total_tuition_fee: Number(groupFee + courseFee || 0),
      transport_required: form.transport === "Yes",
      preferred_transport_id:
        form.transport === "Yes" && form.busRoute
          ? Number(form.busRoute)
          : null,
      pickup_point: form.transport === "Yes" ? form.pickupPoint || null : null,
      book_fee_required: form.bookFeeRequired || false,
      course_required: form.courseRequired || false,
      status: "PENDING" as "PENDING" | "CONFIRMED" | "CANCELLED",
      referred_by: form.referredBy ? Number(form.referredBy) : null, // Use null instead of 0
      remarks: form.remarks || null,
    };

    try {
      // Use mutation hook which handles cache invalidation automatically
      const res: any = await createReservationMutation.mutateAsync(payload);

      if (import.meta.env.DEV) {
        console.log("Reservation creation response:", res);
      }

      // Use backend reservation_id to display receipt number
      const reservationId = res?.reservation_id || res?.reservation_no || "";
      setReservationNo(String(reservationId));

      // Capture form data for payment before clearing form
      const formDataForPayment = {
        studentName: form.studentName,
        group: form.group,
        courseName: form.courseName,
        reservationFee: form.reservationFee,
      };

      // CLEAR FORM IMMEDIATELY - CRITICAL for UI responsiveness
      // This must happen synchronously before any async operations
      // Set reservation_date to today when clearing (matching school behavior)
      setForm({
        ...initialFormState,
        reservationDate: new Date().toISOString().split("T")[0],
      });
      setSelectedGroupId(null);

      // Show success toast message
      toast({
        title: "Reservation Created Successfully",
        description: `Successfully created reservation with id ${reservationId}`,
        variant: "success",
      });

      // Run data refresh in background - don't block UI
      // Use setTimeout to ensure form clears first, then refresh data
      setTimeout(() => {
        const refreshData = async () => {
          try {
            // Mutation hook already handles invalidation, but we ensure refetch callback is called
            await refetchReservations();
          } catch (error) {
            console.error(
              "Error refreshing data after reservation creation:",
              error
            );
          }
        };

        refreshData().catch(console.error);
      }, 100);

      if (withPayment) {
        // Prepare payment data for the payment processor using captured form data
        const paymentData: ReservationPaymentData = {
          reservationId: res.reservation_id,
          reservationNo: res.reservation_no || String(res.reservation_id),
          studentName: formDataForPayment.studentName,
          className: `${formDataForPayment.group}${formDataForPayment.courseName ? ` - ${formDataForPayment.courseName}` : ""}`,
          reservationFee: Number(formDataForPayment.reservationFee || 0),
          totalAmount: Number(formDataForPayment.reservationFee || 0),
          paymentMethod: "CASH", // Default payment method
          purpose: "Reservation Fee Payment",
          note: `Payment for reservation ${res.reservation_id}`,
        };

        // Open payment dialog after a brief delay to ensure form dialog is fully closed
        requestAnimationFrame(() => {
          setTimeout(() => {
            setPaymentData(paymentData);
            setShowPaymentProcessor(true);
          }, 150);
        });
      }
    } catch (e: any) {
      console.error("Failed to create reservation:", e);
      // Error toast is handled by mutation hook
      // Don't clear form on error - keep all field data
    }
  };

  const buildPayloadFromForm = (f: CollegeReservationFormState): CollegeReservationCreate => {
    return {
      student_name: f.studentName,
      aadhar_no: f.studentAadhar || null,
      gender: (f.gender || "OTHER").toUpperCase() as
        | "MALE"
        | "FEMALE"
        | "OTHER",
      dob: f.dob || null, // Date string in YYYY-MM-DD format
      father_or_guardian_name: f.fatherName || null,
      father_or_guardian_aadhar_no: f.fatherAadhar || null,
      father_or_guardian_mobile: f.fatherMobile || null,
      father_or_guardian_occupation: f.fatherOccupation || null,
      mother_or_guardian_name: f.motherName || null,
      mother_or_guardian_aadhar_no: f.motherAadhar || null,
      mother_or_guardian_mobile: f.motherMobile || null,
      mother_or_guardian_occupation: f.motherOccupation || null,
      siblings: (f.siblings || []).map((s): CollegeReservationSibling => ({
        name: s.name || null,
        class_name: s.class_name || null,
        where: s.where || null,
        gender: (s.gender || "OTHER").toUpperCase() as "MALE" | "FEMALE" | "OTHER" || null,
      })),
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
      book_fee: f.bookFeeRequired ? Number(f.bookFee || 0) : 0,
      total_tuition_fee: Number(groupFee + courseFee || 0),
      transport_required: f.transport === "Yes",
      preferred_transport_id:
        f.transport === "Yes" && f.busRoute ? Number(f.busRoute) : null,
      pickup_point: f.transport === "Yes" ? f.pickupPoint || null : null,
      book_fee_required: f.bookFeeRequired || false,
      course_required: f.courseRequired || false,
      status: "PENDING" as "PENDING" | "CONFIRMED" | "CANCELLED",
      referred_by: f.referredBy ? Number(f.referredBy) : null, // Use null instead of 0
      remarks: f.remarks || null,
    };
  };

  const mapApiToForm = (r: CollegeReservationRead | CollegeReservationView): CollegeReservationFormState => {
    // Handle different property names between Read and View types
    const isView = 'father_or_guardian_name' in r && typeof (r as CollegeReservationView).father_or_guardian_name === 'string';
    const siblings = isView ? (r as CollegeReservationView).siblings : (r as CollegeReservationRead).siblings || [];
    
    return {
      studentName: r.student_name || "",
      studentAadhar: isView ? "" : (r as CollegeReservationRead).aadhar_no || "",
      fatherName: isView ? (r as CollegeReservationView).father_or_guardian_name || "" : (r as CollegeReservationRead).father_or_guardian_name || "",
      fatherAadhar: isView ? (r as CollegeReservationView).father_or_guardian_aadhar_no || "" : (r as CollegeReservationRead).father_or_guardian_aadhar_no || "",
      motherName: isView ? (r as CollegeReservationView).mother_or_guardian_name || "" : (r as CollegeReservationRead).mother_or_guardian_name || "",
      motherAadhar: isView ? (r as CollegeReservationView).mother_or_guardian_aadhar_no || "" : (r as CollegeReservationRead).mother_or_guardian_aadhar_no || "",
      fatherOccupation: isView ? (r as CollegeReservationView).father_or_guardian_occupation || "" : (r as CollegeReservationRead).father_or_guardian_occupation || "",
      motherOccupation: isView ? (r as CollegeReservationView).mother_or_guardian_occupation || "" : (r as CollegeReservationRead).mother_or_guardian_occupation || "",
      gender: (r.gender || "").toString(),
      dob: isView 
        ? ((r as CollegeReservationView).dob || "") 
        : (() => {
            const dobValue = (r as CollegeReservationRead).dob;
            if (!dobValue) return "";
            if (typeof dobValue === 'string') return dobValue;
            return new Date(dobValue as string | number | Date).toISOString().split('T')[0];
          })(),
      previousSchool: isView ? "" : (r as CollegeReservationRead).previous_school_details || "",
      village: "",
      lastClass: isView ? "" : (r as CollegeReservationRead).previous_class || "",
      presentAddress: isView ? (r as CollegeReservationView).present_address || "" : (r as CollegeReservationRead).present_address || "",
      permanentAddress: isView ? (r as CollegeReservationView).permanent_address || "" : (r as CollegeReservationRead).permanent_address || "",
      fatherMobile: isView ? (r as CollegeReservationView).father_or_guardian_mobile || "" : (r as CollegeReservationRead).father_or_guardian_mobile || "",
      motherMobile: isView ? (r as CollegeReservationView).mother_or_guardian_mobile || "" : (r as CollegeReservationRead).mother_or_guardian_mobile || "",
      classAdmission: r.group_name
        ? `${r.group_name}${r.course_name ? ` - ${r.course_name}` : ""}`
        : "",
      group: r.group_name || "",
      course: isView ? "N/A" : (r as CollegeReservationRead).preferred_course_id ? String((r as CollegeReservationRead).preferred_course_id) : "N/A",
      courseName: r.course_name || "N/A",
      transport: isView ? "" : (r as CollegeReservationRead).preferred_transport_id ? "Yes" : "No",
      busRoute: isView ? "" : (r as CollegeReservationRead).preferred_transport_id ? String((r as CollegeReservationRead).preferred_transport_id) : "",
      pickupPoint: isView ? "" : (r as CollegeReservationRead).pickup_point || "",
      applicationFee: "",
      reservationFee: isView ? (r as CollegeReservationView).application_fee || "" : (r as CollegeReservationRead).application_fee != null ? String((r as CollegeReservationRead).application_fee) : "",
      remarks: isView ? "" : (r as CollegeReservationRead).remarks || "",
      preferredClassId: isView ? "0" : (r as CollegeReservationRead).preferred_class_id != null ? String((r as CollegeReservationRead).preferred_class_id) : "0",
      preferredGroupId: isView ? "0" : (r as CollegeReservationRead).preferred_group_id != null ? String((r as CollegeReservationRead).preferred_group_id) : "0",
      bookFee: isView ? (r as CollegeReservationView).book_fee || "0" : (r as CollegeReservationRead).book_fee != null ? String((r as CollegeReservationRead).book_fee) : "0",
      tuitionConcession: isView ? (r as CollegeReservationView).tuition_concession || "0" : (r as CollegeReservationRead).tuition_concession != null ? String((r as CollegeReservationRead).tuition_concession) : "0",
      transportConcession: isView ? (r as CollegeReservationView).transport_concession || "0" : (r as CollegeReservationRead).transport_concession != null ? String((r as CollegeReservationRead).transport_concession) : "0",
      bookFeeRequired: isView ? false : (r as CollegeReservationRead).book_fee_required || false,
      courseRequired: isView ? false : (r as CollegeReservationRead).course_required || false,
      referredBy: isView ? "" : (r as CollegeReservationRead).referred_by != null ? String((r as CollegeReservationRead).referred_by) : "",
      reservationDate: isView 
        ? ((r as CollegeReservationView).reservation_date || "") 
        : (() => {
            const dateValue = (r as CollegeReservationRead).reservation_date;
            if (!dateValue) return "";
            if (typeof dateValue === 'string') return dateValue;
            return new Date(dateValue as string | number | Date).toISOString().split('T')[0];
          })(),
      siblingsJson: JSON.stringify(siblings),
      siblings: siblings.map(s => ({
        name: s.name || "",
        class_name: s.class_name || "",
        where: s.where || "",
        gender: (s.gender || "OTHER").toString(),
      })),
    };
  };

  const handleView = async (r: CollegeReservationRead | CollegeReservationMinimalRead) => {
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
      const data = await CollegeReservationsService.getViewById(
        Number(r.reservation_id)
      );
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

  const handleEdit = async (r: CollegeReservationRead | CollegeReservationMinimalRead) => {
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
      const data: CollegeReservationRead = await CollegeReservationsService.getById(
        Number(r.reservation_id)
      );
      setEditForm(mapApiToForm(data));
      setSelectedReservation(data);
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

      // Use service directly with proper cache invalidation and refetch
      await CollegeReservationsService.update(
        Number(selectedReservation.reservation_id),
        payload
      );

      // Invalidate and refetch using debounced utility (prevents UI freeze)
      // Note: invalidateAndRefetch handles API cache clearing internally
      invalidateAndRefetch(collegeKeys.reservations.root());

      // Step 5: Call refetch callback
      void refetchReservations();

      toast({
        title: "Reservation Updated",
        description: "Reservation details have been updated successfully.",
        variant: "success",
      });
      
      // Reset state before closing dialog
      setEditForm(null);
      setSelectedReservation(null);
      setShowEditDialog(false);
    } catch (e: any) {
      console.error("Failed to update reservation:", e);
      toast({
        title: "Update Failed",
        description:
          e?.response?.data?.detail ||
          e?.message ||
          "Failed to update reservation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelReservation = (reservation: CollegeReservationRead | CollegeReservationMinimalRead) => {
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

  const handleConvertToAdmission = (reservation: CollegeReservationRead | CollegeReservationMinimalRead) => {
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

  // REMOVED: useEffect that was causing infinite loops and UI freezes
  // React Query automatically handles:
  // 1. Refetching when tab becomes active (via enabled: activeTab === "all" || activeTab === "status")
  // 2. Refetching when query key changes (page/pageSize)
  // 3. Cache invalidation from mutations (handled by invalidateAndRefetch in mutation hooks)
  // Manual refetch on tab change was causing:
  // - Infinite loops (refetch → re-render → refetch)
  // - UI freezes (blocking refetch operations)
  // - Unnecessary network requests

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
      <CollegeReservationStatsCards
        stats={
          dashboardStats || {
            total_reservations: 0,
            pending_reservations: 0,
            confirmed_reservations: 0,
            cancelled_reservations: 0,
            total_reservation_fees: 0,
            total_tuition_fees: 0,
            total_transport_fees: 0,
            total_tuition_concessions: 0,
            total_transport_concessions: 0,
            reservations_this_month: 0,
            reservations_this_year: 0,
            male_students: 0,
            female_students: 0,
          }
        }
        loading={dashboardLoading}
      />

      <TabSwitcher
        tabs={[
          {
            value: "new",
            label: "New Reservations",
            icon: Plus,
            content: (
              <div>
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
                    book_fee: form.bookFeeRequired
                      ? Number(form.bookFee || 0)
                      : 0,
                    total_tuition_fee: groupFee + courseFee,
                    transport_required: form.transport === "Yes",
                    preferred_transport_id:
                      form.transport === "Yes" ? Number(form.busRoute || 0) : 0,
                    pickup_point: form.pickupPoint,
                    book_fee_required: form.bookFeeRequired || false,
                    course_required: form.courseRequired || false,
                    status: "PENDING",
                    referred_by: Number(form.referredBy || 0),
                    remarks: form.remarks,
                    reservation_date:
                      form.reservationDate ||
                      new Date().toISOString().split("T")[0],
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
                      referredBy: next.referred_by.toString(),
                      remarks: next.remarks,
                      reservationDate: next.reservation_date,
                      bookFeeRequired: next.book_fee_required,
                      courseRequired: next.course_required,
                    });
                  }}
                  groupFee={groupFee}
                  courseFee={courseFee}
                  routes={routeNames.map(
                    (route: {
                      bus_route_id: number;
                      route_no?: string;
                      route_name: string;
                    }) => ({
                      id: route.bus_route_id,
                      name: `${route.route_no || "Route"} - ${
                        route.route_name
                      }`,
                      fee: 0, // Route fee will be calculated based on distance slab
                    })
                  )}
                  groups={
                    groupsData?.items?.map((g) => ({
                      group_id: g.group_id,
                      group_name: g.group_name,
                      fee: g.group_fee,
                      book_fee: g.book_fee,
                    })) || []
                  }
                  courses={
                    coursesData?.items?.map((c) => ({
                      course_id: c.course_id,
                      course_name: c.course_name,
                      fee: c.course_fee,
                    })) || []
                  }
                  classes={
                    classesData?.items?.map((c) => ({
                      class_id: c.class_id,
                      class_name: c.class_name,
                    })) || []
                  }
                  onClassChange={handleClassChange}
                  onGroupChange={handleGroupChange}
                  onCourseChange={handleCourseChange}
                  onSave={handleSave}
                  isLoadingClasses={classesLoading}
                  isLoadingGroups={groupsLoading}
                  isLoadingCourses={coursesLoading}
                  isLoadingRoutes={routesLoading}
                  onDropdownOpen={(dropdown) => {
                    setDropdownsOpened((prev) => ({
                      ...prev,
                      [dropdown]: true,
                    }));
                  }}
                />
              </div>
            ),
          },
          {
            value: "all",
            label: "All Reservations",
            icon: List,
            content: (
              <AllReservationsComponent
                reservations={allReservations}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={(r: CollegeReservationRead | CollegeReservationMinimalRead) => {
                  setReservationToDelete(r);
                  setShowDeleteDialog(true);
                }}
                onUpdateConcession={handleUpdateConcession}
                isLoading={isLoadingReservations}
                isError={reservationsError}
                error={reservationsErrObj}
                onRefetch={refetchReservations}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            ),
          },
          {
            value: "status",
            label: "Status",
            icon: BarChart3,
            content: (
              <StatusUpdateTable
                reservations={statusTableReservations}
                isLoading={isLoadingReservations}
                isError={reservationsError}
                error={reservationsErrObj}
                onRefetch={refetchReservations}
                totalCount={reservationsData?.total_count}
              />
            ),
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Receipt Dialog - Only shown when payment is not made (just reservation confirmation) */}
      {!receiptBlobUrl && (
        <Dialog
          open={showReceipt && !receiptBlobUrl}
          onOpenChange={setShowReceipt}
        >
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
                  <span>
                    ₹
                    {(
                      groupFee +
                      courseFee +
                      bookFee +
                      transportFee
                    ).toLocaleString()}
                  </span>
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
      )}

      {/* Receipt Preview Modal - Shows PDF receipt after payment */}

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
            <div className="space-y-6 text-sm flex-1 overflow-y-auto scrollbar-hide pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Reservation No:</strong>{" "}
                  {viewReservation.reservation_no || "-"}
                </div>
                <div>
                  <strong>Branch:</strong> {viewReservation.branch_name || "-"}
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
                  {viewReservation.created_at
                    ? new Date(viewReservation.created_at).toLocaleString()
                    : "-"}
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
                    <strong>DOB:</strong>{" "}
                    {viewReservation.dob
                      ? new Date(viewReservation.dob).toLocaleDateString()
                      : "-"}
                  </div>
                  <div>
                    <strong>Group:</strong> {viewReservation.group_name || "-"}
                  </div>
                  <div>
                    <strong>Course:</strong>{" "}
                    {viewReservation.course_name || "-"}
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
                    <span>₹{viewReservation.application_fee || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Application Fee Paid:</span>
                    <span>{viewReservation.application_fee_paid || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Book Fee:</span>
                    <span>₹{viewReservation.book_fee || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Group Fee:</span>
                    <span>₹{viewReservation.group_fee || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Course Fee:</span>
                    <span>₹{viewReservation.course_fee || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Tuition Fee:</span>
                    <span>₹{viewReservation.total_tuition_fee || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tuition Concession:</span>
                    <span>₹{viewReservation.tuition_concession || "0"}</span>
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
                        <span>₹{viewReservation.transport_fee || "0"}</span>
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
                      <strong>Route:</strong> {viewReservation.route_ || "-"}
                    </div>
                    <div>
                      <strong>Slab:</strong> {viewReservation.slab || "-"}
                    </div>
                  </div>
                </div>
              )}

              {viewReservation.siblings &&
                viewReservation.siblings.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="font-medium mb-2">Siblings Information</div>
                    <div className="space-y-3">
                      {viewReservation.siblings.map((sibling, index) => (
                        <div
                          key={index}
                          className="border rounded p-3 bg-gray-50"
                        >
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <strong>Name:</strong> {sibling.name || "-"}
                            </div>
                            <div>
                              <strong>Class:</strong>{" "}
                              {sibling.class_name || "-"}
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
        </DialogContent>
      </Dialog>

      {/* Edit Reservation Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            // Reset state when dialog closes
            setEditForm(null);
            setSelectedReservation(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          {editForm ? (
            <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
              {(groupsLoading || coursesLoading || isLoadingDistanceSlabs) && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    <span className="text-sm">
                      Loading groups, courses, and distance slabs...
                    </span>
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
                  book_fee: editForm.bookFeeRequired
                    ? Number(editForm.bookFee || 0)
                    : 0,
                  total_tuition_fee: groupFee + courseFee,
                  transport_required: editForm.transport === "Yes",
                  preferred_transport_id:
                    editForm.transport === "Yes" && editForm.busRoute
                      ? Number(editForm.busRoute)
                      : 0,
                  pickup_point: editForm.pickupPoint || "",
                  book_fee_required: editForm.bookFeeRequired || false,
                  course_required: editForm.courseRequired || false,
                  status: "PENDING",
                  referred_by: Number(editForm.referredBy || 0),
                  remarks: editForm.remarks,
                  reservation_date:
                    editForm.reservationDate ||
                    new Date().toISOString().split("T")[0],
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
                    referredBy: next.referred_by.toString(),
                    remarks: next.remarks,
                    reservationDate: next.reservation_date,
                    bookFeeRequired: next.book_fee_required,
                    courseRequired: next.course_required,
                  });
                }}
                groupFee={groupFee}
                courseFee={courseFee}
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
                groups={
                  groupsData?.items?.map((g) => ({
                    group_id: g.group_id,
                    group_name: g.group_name,
                    fee: g.group_fee,
                    book_fee: g.book_fee,
                  })) || []
                }
                courses={
                  coursesData?.items?.map((c) => ({
                    course_id: c.course_id,
                    course_name: c.course_name,
                    fee: c.course_fee,
                  })) || []
                }
                classes={
                  classesData?.items?.map((c) => ({
                    class_id: c.class_id,
                    class_name: c.class_name,
                  })) || []
                }
                onClassChange={handleClassChange}
                onGroupChange={handleGroupChange}
                onCourseChange={handleCourseChange}
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
            <Button type="button" onClick={submitEdit} disabled={!editForm}>
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
              {reservationToDelete?.reservation_id}? This action cannot be
              undone.
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
                  // Toast handled by mutation hook
                } catch (e: any) {
                  console.error("Failed to delete reservation:", e);
                  // Error toasts handled by mutation hook
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

      {/* Receipt Preview Modal - Shows PDF receipt after payment */}
      <ReceiptPreviewModal
        isOpen={showReceipt && !!receiptBlobUrl}
        onClose={() => {
          // Close modal immediately - don't block UI
          setShowReceipt(false);
          
          // Clean up blob URL immediately
          if (receiptBlobUrl) {
            URL.revokeObjectURL(receiptBlobUrl);
            setReceiptBlobUrl(null);
          }
          setPaymentIncomeRecord(null);
          
          // Run data refresh in background - don't block modal close
          // Invalidate and refetch using debounced utility (prevents UI freeze)
          invalidateAndRefetch(collegeKeys.reservations.root());
              
          // Call refetch callback if provided
              if (refetchReservations) {
            void refetchReservations();
            }
        }}
        blobUrl={receiptBlobUrl}
      />

      {/* Payment Processor Dialog */}
      {paymentData && (
        <Dialog
          open={showPaymentProcessor}
          onOpenChange={setShowPaymentProcessor}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Process payment for reservation {paymentData.reservationNo}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
              <CollegeReservationPaymentProcessor
                reservationData={paymentData}
                onPaymentComplete={(
                  incomeRecord: CollegeIncomeRead,
                  blobUrl: string
                ) => {
                  // CLOSE PAYMENT DIALOG IMMEDIATELY - CRITICAL for UI responsiveness
                  setShowPaymentProcessor(false);
                  
                  // Clear payment data immediately to prevent dialog from re-rendering
                  setPaymentData(null);
                  
                  // Set receipt data immediately
                  setPaymentIncomeRecord(incomeRecord);
                  setReceiptBlobUrl(blobUrl);

                  // Show receipt modal after ensuring payment dialog is fully closed
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      setShowReceipt(true);
                    }, 150);
                  });

                  // Invalidate and refetch using debounced utility (prevents UI freeze)
                  invalidateAndRefetch(collegeKeys.reservations.root());
                      
                  // Call refetch callback if provided
                      if (refetchReservations) {
                    void refetchReservations();
                    }
                }}
                onPaymentFailed={(error: string) => {
                  toast({
                    title: "Payment Failed",
                    description:
                      error || "Could not process payment. Please try again.",
                    variant: "destructive",
                  });
                  setShowPaymentProcessor(false);
                }}
                onPaymentCancel={() => {
                  setShowPaymentProcessor(false);
                  setPaymentData(null);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
