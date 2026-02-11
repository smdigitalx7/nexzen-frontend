import { useMemo, useState, useEffect, useCallback, memo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useDeleteSchoolReservation,
  useSchoolReservationsDashboard,
  useCreateSchoolReservation,
} from "@/features/school/hooks/use-school-reservations";
import { schoolKeys } from "@/features/school/hooks/query-keys";
import { useSchoolClass } from "@/features/school/hooks";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { useAuthStore } from "@/core/auth/authStore";
import {
  useTabNavigation,
  useTabEnabled,
} from "@/common/hooks/use-tab-navigation";
import ReservationForm from "./ReservationForm";
import SchoolReservationEdit from "./SchoolReservationEdit";
import AllReservationsTable from "./AllReservationsTable";
import StatusUpdateTable from "./StatusUpdateTable";
import {
  TransportService,
  SchoolReservationsService,
  SchoolDropdownsService,
} from "@/features/school/services";
import { DistanceSlabsService } from "@/features/general/services";
import { toast } from "@/common/hooks/use-toast";
import { Plus, List, BarChart3 } from "lucide-react";
import { TabSwitcher } from "@/common/components/shared";
import { SchoolReservationStatsCards } from "./SchoolReservationStatsCards";
import {
  ReservationPaymentProcessor,
  ReservationPaymentData,
} from "@/common/components/shared/payment";
import {
  ConcessionUpdateDialog,
  ReceiptPreviewModal,
  ReservationDeleteDialog,
  ReservationEditDialog,
  ReservationViewDialog,
  ReservationPaymentDialog,
} from "@/common/components/shared";
import { ProductionErrorBoundary } from "@/common/components/shared/ProductionErrorBoundary";
import type {
  SchoolIncomeRead,
  SchoolReservationRead,
  SchoolReservationCreate,
} from "@/features/school/types";
import {
  type ReservationFormState,
  initialFormState,
} from "./SchoolReservationTypes";
import { SchoolReservationHeader } from "./SchoolReservationHeader";
import { SchoolReservationViewContent } from "./SchoolReservationViewContent";

const ReservationManagementComponent = () => {
  const queryClient = useQueryClient();
  const { currentBranch } = useAuthStore();

  const { activeTab, setActiveTab } = useTabNavigation("new");

  // Get enabled states for conditional data fetching (avoids hook order issues)
  // Reservations list needed for "all" and "status" tabs
  const reservationsEnabled = useTabEnabled(["all", "status"], "new");

  // State management
  const [reservationNo, setReservationNo] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<SchoolReservationRead | null>(null);

  // Initialize mutation hooks (after state is defined)
  const createReservationMutation = useCreateSchoolReservation();
  const deleteReservation = useDeleteSchoolReservation();
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewReservation, setViewReservation] =
    useState<SchoolReservationRead | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<ReservationFormState | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] =
    useState<SchoolReservationRead | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [editSelectedClassId, setEditSelectedClassId] = useState<number | null>(
    null
  );

  // Payment related state
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [paymentData, setPaymentData] = useState<ReservationPaymentData | null>(
    null
  );
  const [paymentIncomeRecord, setPaymentIncomeRecord] =
    useState<SchoolIncomeRead | null>(null);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [receiptNo, setReceiptNo] = useState<string | null>(null);

  // Concession related state
  const [showConcessionDialog, setShowConcessionDialog] = useState(false);
  const [
    selectedReservationForConcession,
    setSelectedReservationForConcession,
  ] = useState<SchoolReservationRead | null>(null);

  // ✅ FIX: Cleanup blob URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (receiptBlobUrl) {
        URL.revokeObjectURL(receiptBlobUrl);
      }
    };
  }, [receiptBlobUrl]);

  // Track dropdown opens for lazy loading
  const [dropdownsOpened, setDropdownsOpened] = useState({
    classes: false,
    distanceSlabs: false,
    routes: false,
  });

  // Classes dropdown from API - Load on-demand when dropdown is opened
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ["school-dropdowns", "classes"],
    queryFn: () => SchoolDropdownsService.getClasses(),
    enabled: dropdownsOpened.classes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  const classes = classesData?.items || [];

  // Distance slabs dropdown from API - Load on-demand when dropdown is opened
  const { data: distanceSlabs = [], isLoading: isLoadingDistanceSlabs } =
    useQuery({
      queryKey: ["distance-slabs"],
      queryFn: () => DistanceSlabsService.listDistanceSlabs(),
      enabled: dropdownsOpened.distanceSlabs,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });

  // Routes dropdown - Load on-demand when dropdown is opened
  const { data: routeNames = [], isLoading: routesLoading } = useQuery({
    queryKey: ["public", "bus-routes", "names"],
    queryFn: () => TransportService.getRouteNames(),
    enabled: dropdownsOpened.routes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch selected class details with fees
  const { classData: selectedClassData } = useSchoolClass(selectedClassId);
  const { classData: editSelectedClassData } =
    useSchoolClass(editSelectedClassId);

  // Dashboard stats hook
  const { data: dashboardStats, isLoading: dashboardLoading } =
    useSchoolReservationsDashboard();

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Server-side search: input value (immediate) and debounced value for API
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  useEffect(() => {
    const trimmed = searchInput.trim();
    const t = setTimeout(
      () => setSearchQuery(trimmed === "" ? undefined : trimmed),
      500
    );
    return () => clearTimeout(t);
  }, [searchInput]);

  // ✅ Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, selectedClassId, searchQuery]);

  // ✅ Server-side pagination state - CRITICAL: Prevents fetching ALL reservations at once
  // This fixes UI freeze by limiting data fetched per request
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // Fetch 25 reservations at a time (requested default)

  // ✅ OPTIMIZATION: Stabilize query params to prevent unnecessary refetches
  const reservationParams = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      class_id: selectedClassId || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchQuery ?? undefined,
    }),
    [currentPage, pageSize, selectedClassId, statusFilter, searchQuery]
  );

  // ✅ OPTIMIZATION: Stabilize query key
  const reservationQueryKey = useMemo(
    () => schoolKeys.reservations.list(reservationParams),
    [reservationParams]
  );

  // Use React Query hook for reservations - WITH PAGINATION
  // CRITICAL: Only fetch when tab is active to prevent unnecessary requests and UI freezes
  // API calls are made per tab, not based on sidebar navigation
  const {
    data: reservationsData,
    isLoading: isLoadingReservations,
    isError: reservationsError,
    error: reservationsErrObj,
    refetch: refetchReservations,
  } = useQuery({
    queryKey: reservationQueryKey,
    queryFn: () => SchoolReservationsService.list(reservationParams),
    enabled: reservationsEnabled, // Only fetch when "all" or "status" tab is active
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });

  // ✅ OPTIMIZED: Memoized reservations data processing with proper dependencies
  const allReservations = useMemo(() => {
    if (!reservationsData?.reservations) return [];
    if (!Array.isArray(reservationsData.reservations)) return [];

    // ✅ OPTIMIZATION: Use map with stable reference
    return reservationsData.reservations.map((r: any) => ({
      id: String(r.reservation_id),
      no: r.reservation_no || r.reservationNo || "",
      reservation_id: r.reservation_id,
      studentName: r.student_name,
      classAdmission: r.class_name || r.admit_into || "",
      status: r.status || "PENDING",
      date: r.reservation_date || "",
      totalFee: Number(r.tuition_fee || 0) + Number(r.transport_fee || 0),
      income_id: r.income_id || r.incomeId,
      concession_lock: r.concession_lock || false,
      tuition_fee: r.tuition_fee || 0,
      transport_fee: r.transport_fee || 0,
      book_fee: r.book_fee || 0,
      application_fee: r.application_fee || 0,
      tuition_concession: r.tuition_concession || 0,
      transport_concession: r.transport_concession || 0,
      remarks: r.remarks || "",
      application_income_id: r.application_income_id || null,
      admission_income_id: r.admission_income_id || null,
      is_enrolled: r.is_enrolled || false,
    }));
  }, [reservationsData?.reservations]);

  // Form state using initial state - set reservation_date to today when component mounts
  const [form, setForm] = useState(() => ({
    ...initialFormState,
    reservation_date: new Date().toISOString().split("T")[0],
  }));

  // Memoized handlers
  // Update form with fees when class data is available (handled via selectedClassData)
  const handleClassChange = useCallback(
    (classId: string) => {
      const selectedClass = classes.find(
        (c) => c.class_id.toString() === classId
      );
      if (selectedClass) {
        setSelectedClassId(selectedClass.class_id);
        setForm((prev) => ({
          ...prev,
          class_name: selectedClass.class_name,
          // Auto-set preferred_class_id based on selected class
          preferred_class_id: selectedClass.class_id.toString(),
        }));
        // Fees will be updated when selectedClassData is fetched (via useSchoolClass hook)
        // This happens automatically when selectedClassId changes
      }
    },
    [classes]
  );

  // Auto-set preferred_distance_slab_id when distance slab is selected
  const handleDistanceSlabChange = useCallback(
    (slabId: string) => {
      const selectedSlab = distanceSlabs?.find(
        (s) => s.slab_id.toString() === slabId
      );
      if (selectedSlab) {
        setForm((prev) => ({
          ...prev,
          preferred_distance_slab_id: selectedSlab.slab_id.toString(),
        }));
      }
    },
    [distanceSlabs]
  );

  // Edit mode handlers
  const handleEditClassChange = useCallback(
    (classId: string) => {
      const selectedClass = classes.find(
        (c) => c.class_id.toString() === classId
      );
      if (selectedClass) {
        setEditSelectedClassId(selectedClass.class_id);
        setEditForm((prev: any) => ({
          ...prev,
          class_name: selectedClass.class_name,
          preferred_class_id: selectedClass.class_id.toString(),
        }));
      }
    },
    [classes]
  );

  const handleEditDistanceSlabChange = useCallback(
    (slabId: string) => {
      const selectedSlab = distanceSlabs?.find(
        (s) => s.slab_id.toString() === slabId
      );
      if (selectedSlab) {
        setEditForm((prev: any) => ({
          ...prev,
          preferred_distance_slab_id: selectedSlab.slab_id.toString(),
        }));
      }
    },
    [distanceSlabs]
  );

  // Get preferred_class_id from form (for API submission)
  const getPreferredClassId = useCallback(
    (formState: ReservationFormState = form) => {
      const selectedClass = classes.find(
        (c) => c.class_name === formState.class_name
      );
      return selectedClass ? selectedClass.class_id : 0;
    },
    [classes, form]
  );

  // Get preferred_distance_slab_id from form (for API submission)
  const getPreferredDistanceSlabId = useCallback(
    (formState: ReservationFormState = form) => {
      const selectedSlab = distanceSlabs?.find(
        (s) => s.slab_id.toString() === formState.preferred_distance_slab_id
      );
      return selectedSlab ? selectedSlab.slab_id : 0;
    },
    [distanceSlabs, form]
  );

  // Memoized fee calculations
  const classFee = useMemo(() => {
    // Use the fetched class data or fallback to default
    return selectedClassData?.tuition_fee || 15000;
  }, [selectedClassData]);

  const editClassFee = useMemo(() => {
    // Use the fetched edit class data or fallback to default
    return editSelectedClassData?.tuition_fee || 15000;
  }, [editSelectedClassData]);

  // Update form with fees when class data is fetched
  // NOTE: This is NOT an API call - it's just updating form state when class data arrives
  // The API call happens in useSchoolClass hook, which is controlled by selectedClassId
  useEffect(() => {
    if (selectedClassData) {
      setForm((prev) => ({
        ...prev,
        tuition_fee: selectedClassData.tuition_fee.toString(),
        book_fee: selectedClassData.book_fee.toString(),
      }));
    }
  }, [selectedClassData]);

  // Update edit form with fees when edit class data is fetched
  // NOTE: This is NOT an API call - it's just updating form state when class data arrives
  useEffect(() => {
    if (editSelectedClassData && editForm) {
      setEditForm((prev: any) => ({
        ...prev,
        tuition_fee: editSelectedClassData.tuition_fee.toString(),
        book_fee: editSelectedClassData.book_fee.toString(),
      }));
    }
  }, [editSelectedClassData, editForm]);

  const transportFee = useMemo(() => {
    if (form.transport_required && form.preferred_distance_slab_id) {
      const selectedSlab = distanceSlabs?.find(
        (s) => s.slab_id.toString() === form.preferred_distance_slab_id
      );
      return selectedSlab ? selectedSlab.fee_amount : 0;
    }
    return 0;
  }, [form.transport_required, form.preferred_distance_slab_id, distanceSlabs]);

  const editTransportFee = useMemo(() => {
    if (editForm?.transport_required && editForm?.preferred_distance_slab_id) {
      const selectedSlab = distanceSlabs?.find(
        (s) => s.slab_id.toString() === editForm.preferred_distance_slab_id
      );
      return selectedSlab ? selectedSlab.fee_amount : 0;
    }
    return 0;
  }, [
    editForm?.transport_required,
    editForm?.preferred_distance_slab_id,
    distanceSlabs,
  ]);

  const handleUpdateConcession = useCallback(async (reservation: any) => {
    try {
      // Invalidate and refetch using debounced utility (prevents UI freeze)
      void queryClient.invalidateQueries({
        queryKey: schoolKeys.reservations.detail(reservation.reservation_id),
        exact: false,
      });

      // Fetch the full reservation details for the dialog (fresh from API)
      // This will always get the latest data from backend
      const fullReservationData = await SchoolReservationsService.getById(
        reservation.reservation_id
      );

      // Update state with fresh data
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
  }, []);

  // Use the hook for concession updates - create hook with a placeholder ID
  // We'll use the service directly but follow the same cache invalidation pattern
  const handleConcessionUpdate = useCallback(
    async (
      reservationId: number,
      tuitionConcession: number,
      transportConcession: number,
      remarks: string
    ) => {
      try {
        // Update concession via service
        await SchoolReservationsService.updateConcession(reservationId, {
          tuition_concession: tuitionConcession,
          transport_concession: transportConcession,
          remarks: remarks || null,
        });

        void queryClient.invalidateQueries({
          queryKey: schoolKeys.reservations.root(),
          exact: false,
        });

        // Step 4: Call refetchReservations
        void refetchReservations();

        // Fetch fresh reservation data immediately after update
        // This ensures if user reopens the dialog, it has the latest data with updated concession_lock status
        try {
          const updatedReservation =
            await SchoolReservationsService.getById(reservationId);
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
    },
    [refetchReservations, queryClient]
  );

  // ✅ OPTIMIZED: Memoized route mapping with stable reference
  const mappedRoutes = useMemo(() => {
    if (!Array.isArray(routeNames) || routeNames.length === 0) return [];
    return routeNames.map(
      (route: {
        bus_route_id: number;
        route_no?: string;
        route_name: string;
      }) => ({
        id: route.bus_route_id?.toString() || "",
        name: `${route.route_no || "Route"} - ${route.route_name}`,
        fee: 0,
      })
    );
  }, [routeNames]);

  // Memoized tabs configuration - moved after handlers are defined

  const handleSave = useCallback(
    async (withPayment: boolean) => {
      // Validate application fee
      const applicationFee = Number(form.application_fee || 0);
      if (!form.application_fee || applicationFee <= 0) {
        toast({
          title: "Validation Error",
          description: "Application fee is required and must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      // Map form fields to backend schema as JSON object
      const payload: SchoolReservationCreate = {
        student_name: form.student_name,
        aadhar_no: form.aadhar_no || "",
        gender: (form.gender || "OTHER").toUpperCase() as
          | "MALE"
          | "FEMALE"
          | "OTHER",
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
        application_fee_paid: form.application_fee_paid || false,
        preferred_class_id: getPreferredClassId(),
        class_name: form.class_name || "",
        tuition_fee: Number(form.tuition_fee || 0),
        book_fee: Number(form.book_fee || 0),
        transport_required: form.transport_required || false,
        preferred_transport_id:
          form.transport_required && form.preferred_transport_id
            ? Number(form.preferred_transport_id)
            : 0,
        preferred_distance_slab_id:
          form.transport_required && form.preferred_distance_slab_id
            ? getPreferredDistanceSlabId()
            : 0,
        pickup_point: form.transport_required ? form.pickup_point || "" : "",
        transport_fee: form.transport_required ? Number(transportFee || 0) : 0,
        status: "PENDING" as const,
        request_type: (form.request_type || "WALK_IN") as
          | "WALK_IN"
          | "REFERRAL",
        referred_by: form.referred_by ? Number(form.referred_by) : 0,
        other_referee_name: form.other_referee_name || "",
        remarks: form.remarks || "",
        reservation_date: form.reservation_date || "",
      };

      try {
        // Send payload as JSON (API expects JSON, not FormData)
        // Use mutation hook which handles cache invalidation automatically
        const res: SchoolReservationRead =
          await createReservationMutation.mutateAsync(payload);

        // Use backend reservation_id to display receipt number
        const reservationId = res?.reservation_id || res?.reservation_no || "";
        setReservationNo(String(reservationId));

        // CLEAR FORM IMMEDIATELY - CRITICAL for UI responsiveness
        // This must happen synchronously before any async operations
        setForm(initialFormState);
        setSelectedClassId(null);

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
          // Prepare payment data for the payment processor
          const paymentData: ReservationPaymentData = {
            reservationId: res.reservation_id,
            reservationNo: res.reservation_no || String(res.reservation_id), // Try reservation_no first, fallback to reservation_id
            studentName: form.student_name,
            className: form.class_name,
            reservationFee: Number(form.application_fee || 0), // Only reservation/application fee
            totalAmount: Number(form.application_fee || 0), // Only reservation/application fee
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
    },
    [
      form,
      getPreferredClassId,
      getPreferredDistanceSlabId,
      transportFee,
      createReservationMutation,
      refetchReservations,
    ]
  );

  const mapApiToForm = (r: any): ReservationFormState => ({
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
    application_fee:
      r.application_fee != null ? String(r.application_fee) : "0",
    application_fee_paid: r.application_fee_paid || false,
    class_name: r.class_name || "",
    preferred_class_id: r.preferred_class_id != null ? String(r.preferred_class_id) : "0",
    tuition_fee: r.tuition_fee != null ? String(r.tuition_fee) : "0",
    book_fee: r.book_fee != null ? String(r.book_fee) : "0",
    transport_required:
      r.transport_required !== undefined
        ? Boolean(r.transport_required)
        : r.preferred_transport_id
          ? true
          : false,
    preferred_transport_id: r.preferred_transport_id
      ? String(r.preferred_transport_id)
      : "0",
    preferred_distance_slab_id:
      r.preferred_distance_slab_id != null
        ? String(r.preferred_distance_slab_id)
        : "0",
    pickup_point: r.pickup_point || "",
    transport_fee: r.transport_fee != null ? String(r.transport_fee) : "0",
    status: r.status || "PENDING",
    request_type: (r).request_type || "WALK_IN",
    referred_by: r.referred_by != null ? String(r.referred_by) : "",
    other_referee_name: (r).other_referee_name || "",
    remarks: r.remarks || "",
    reservation_date: r.reservation_date || "",
  });

  const handleView = useCallback(async (r: any) => {
    try {
      // Enable distanceSlabs and routes queries for view dialog
      setDropdownsOpened((prev) => ({
        ...prev,
        distanceSlabs: true,
        routes: true,
      }));

      const data = await SchoolReservationsService.getById(r.reservation_id);
      setViewReservation(data);
      setShowViewDialog(true);
    } catch (e: any) {
      console.error("Failed to load reservation:", e);
      toast({
        title: "Failed to Load Reservation",
        description:
          e?.message || "Could not load reservation details. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  const handleEdit = useCallback(
    async (r: any) => {
      try {
        const data: SchoolReservationRead =
          await SchoolReservationsService.getById(r.reservation_id);
        const mappedForm = mapApiToForm(data);
        setEditForm(mappedForm);

        // Set the edit selected class ID to fetch class details
        if (mappedForm.class_name) {
          const selectedClass = classes.find(
            (c) => c.class_name === mappedForm.class_name
          );
          if (selectedClass) {
            setEditSelectedClassId(selectedClass.class_id);
          }
        }

        // Enable distanceSlabs and routes queries for edit form
        setDropdownsOpened((prev) => ({
          ...prev,
          distanceSlabs: true,
          routes: true,
        }));

        setSelectedReservation(data);
        setShowEditDialog(true);
      } catch (e: any) {
        console.error("Failed to load reservation for edit:", e);
        toast({
          title: "Failed to Load Reservation",
          description:
            e?.message ||
            "Could not load reservation for editing. Please try again.",
          variant: "destructive",
        });
      }
    },
    [classes]
  );

  // Memoized tabs configuration - now defined after all handlers
  const tabsConfig = useMemo(
    () => [
      {
        value: "new",
        label: "New Reservations",
        icon: Plus,
        content: (
          <div>
            <ReservationForm
              form={form as any}
              setForm={(next) => setForm(next as any)}
              classFee={classFee}
              transportFee={transportFee}
              routes={mappedRoutes}
              classes={classes}
              distanceSlabs={distanceSlabs || []}
              onClassChange={handleClassChange}
              onDistanceSlabChange={handleDistanceSlabChange}
              onSave={handleSave}
              isLoadingClasses={classesLoading}
              isLoadingDistanceSlabs={isLoadingDistanceSlabs}
              isLoadingRoutes={routesLoading}
              onDropdownOpen={(dropdown) => {
                setDropdownsOpened((prev) => ({ ...prev, [dropdown]: true }));
              }}
            />
          </div>
        ),
      },
      {
        value: "all",
        label: "All Reservations",
        icon: List,
        // Always render table so search bar and toolbar stay visible; loading shows skeleton in table body only
        content: (
          <AllReservationsTable
            reservations={allReservations}
            isLoading={isLoadingReservations}
            isError={reservationsError}
            error={reservationsErrObj}
            onRefetch={refetchReservations}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(reservation) => {
              // Convert Reservation to SchoolReservationRead for delete
              const reservationToDelete: SchoolReservationRead = {
                reservation_id: reservation.reservation_id,
                student_name: reservation.studentName,
                created_at: new Date().toISOString(),
                tuition_fee: reservation.tuition_fee || 0,
                book_fee: reservation.book_fee || 0,
                status: reservation.status,
              };
              setReservationToDelete(reservationToDelete);
              setShowDeleteDialog(true);
            }}
            onUpdateConcession={handleUpdateConcession}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            // ✅ Server-side pagination props
            enableServerSidePagination={true}
            currentPage={currentPage}
            totalPages={reservationsData?.total_pages || 1}
            totalCount={reservationsData?.total_count || 0}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              // Scroll to top when page changes
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setCurrentPage(1);
            }}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
          />
        ),
      },
      {
        value: "status",
        label: "Status",
        icon: BarChart3,
        content: (
          <StatusUpdateTable
            reservations={allReservations}
            isLoading={isLoadingReservations}
            isError={reservationsError}
            error={reservationsErrObj}
            onRefetch={() => {
              refetchReservations().catch(console.error);
            }}
            // ✅ Server-side pagination props
            currentPage={currentPage}
            totalCount={reservationsData?.total_count || 0}
            pageSize={pageSize}
            onPageChange={(page: number) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPageSizeChange={(newPageSize: number) => {
              setPageSize(newPageSize);
              setCurrentPage(1);
            }}
          />
        ),
      },
    ],
    [
      form,
      classFee,
      transportFee,
      mappedRoutes,
      classes,
      distanceSlabs,
      handleClassChange,
      handleDistanceSlabChange,
      handleSave,
      allReservations,
      isLoadingReservations,
      reservationsError,
      reservationsErrObj,
      refetchReservations,
      handleView,
      handleEdit,
      handleUpdateConcession,
      statusFilter,
      searchInput,
      reservationsData?.total_count,
    ]
  );

  const submitEdit = useCallback(async () => {
    if (!selectedReservation?.reservation_id || !editForm) return;
    try {
      // Convert editForm to JSON payload (backend expects JSON, not FormData)
      const payload = {
        student_name: editForm.student_name,
        aadhar_no: editForm.aadhar_no || "",
        gender: (editForm.gender || "OTHER").toUpperCase(),
        dob: editForm.dob || "",
        father_or_guardian_name: editForm.father_or_guardian_name || "",
        father_or_guardian_aadhar_no:
          editForm.father_or_guardian_aadhar_no || "",
        father_or_guardian_mobile: editForm.father_or_guardian_mobile || "",
        father_or_guardian_occupation:
          editForm.father_or_guardian_occupation || "",
        mother_or_guardian_name: editForm.mother_or_guardian_name || "",
        mother_or_guardian_aadhar_no:
          editForm.mother_or_guardian_aadhar_no || "",
        mother_or_guardian_mobile: editForm.mother_or_guardian_mobile || "",
        mother_or_guardian_occupation:
          editForm.mother_or_guardian_occupation || "",
        siblings:
          editForm.siblings && editForm.siblings.length > 0
            ? editForm.siblings
            : [],
        previous_class: editForm.previous_class || "",
        previous_school_details: editForm.previous_school_details || "",
        present_address: editForm.present_address || "",
        permanent_address: editForm.permanent_address || "",
        application_fee: Number(editForm.application_fee || 0),
        application_fee_paid: editForm.application_fee_paid,
        preferred_class_id: getPreferredClassId(editForm),
        transport_required: editForm.transport_required,
        preferred_transport_id:
          editForm.transport_required && editForm.preferred_transport_id
            ? Number(editForm.preferred_transport_id)
            : 0,
        preferred_distance_slab_id:
          editForm.transport_required && editForm.preferred_distance_slab_id
            ? getPreferredDistanceSlabId(editForm)
            : 0,
        pickup_point: editForm.transport_required
          ? editForm.pickup_point || ""
          : "",
        transport_fee: editForm.transport_required
          ? Number(editTransportFee || 0)
          : 0,
        status: editForm.status || "PENDING",
        request_type: (editForm.request_type || "WALK_IN") as
          | "WALK_IN"
          | "REFERRAL",
        referred_by: editForm.referred_by ? Number(editForm.referred_by) : 0,
        other_referee_name: editForm.other_referee_name || "",
        remarks: editForm.remarks || "",
        reservation_date: editForm.reservation_date || "",
      };

      // Use service directly with proper cache invalidation and refetch
      // Send JSON payload (backend expects JSON for PUT requests)
      await SchoolReservationsService.update(
        Number(selectedReservation.reservation_id),
        payload
      );

      // Invalidate queries to trigger refetch
      void queryClient.invalidateQueries({ queryKey: schoolKeys.reservations.root(), exact: false });

      // Step 3: Call refetch callback
      void refetchReservations();

      toast({
        title: "Reservation Updated",
        description: "Reservation details have been updated successfully.",
        variant: "success",
      });

      // Reset state before closing dialog
      setEditForm(null);
      setSelectedReservation(null);
      setEditSelectedClassId(null);
      setShowEditDialog(false);
    } catch (e: any) {
      console.error("Failed to update reservation:", e);
      toast({
        title: "Update Failed",
        description:
          e?.response?.data?.detail ||
          e?.message ||
          "Failed to update reservation.",
        variant: "destructive",
      });
    }
  }, [
    selectedReservation,
    editForm,
    getPreferredClassId,
    getPreferredDistanceSlabId,
    editTransportFee,
    refetchReservations,
  ]);

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
  // 3. Cache invalidation from mutations (handled by queryClient.invalidateQueries in mutation hooks)
  // Manual refetch on tab change was causing:
  // - Infinite loops (refetch → re-render → refetch)
  // - UI freezes (blocking refetch operations)
  // - Unnecessary network requests

  return (
    <div className="space-y-6 p-6">
      <SchoolReservationHeader currentBranch={currentBranch} />

      {/* Reservation Dashboard Stats */}
      {dashboardStats && (
        <SchoolReservationStatsCards
          stats={dashboardStats}
          loading={dashboardLoading}
        />
      )}

      <TabSwitcher
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Receipt Preview Modal - Shows PDF receipt after payment */}
      <ReceiptPreviewModal
        isOpen={showReceipt}
        onClose={() => {
          // ✅ CRITICAL FIX: Close modal state IMMEDIATELY - synchronous, no blocking
          setShowReceipt(false);

          // ✅ CRITICAL FIX: Clean up blob URL immediately (synchronous, lightweight)
          if (receiptBlobUrl) {
            try {
              URL.revokeObjectURL(receiptBlobUrl);
            } catch (e) {
              // Ignore errors during cleanup
            }
            setReceiptBlobUrl(null);
          }
          setPaymentIncomeRecord(null);
          setReceiptNo(null);

          // ✅ CRITICAL FIX: Defer query invalidation to prevent UI blocking
          // Use requestIdleCallback if available, otherwise use setTimeout with longer delay
          if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(
              () => {
                // Invalidate queries to trigger refetch
                void queryClient.invalidateQueries({ queryKey: schoolKeys.reservations.root(), exact: false });

                // Call refetch callback if provided (non-blocking)
                if (refetchReservations) {
                  void refetchReservations();
                }
              },
              { timeout: 1000 }
            );
          } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
              // Invalidate queries to trigger refetch
              void queryClient.invalidateQueries({ queryKey: schoolKeys.reservations.root(), exact: false });

              // Call refetch callback if provided (non-blocking)
              if (refetchReservations) {
                void refetchReservations();
              }
            }, 500); // Longer delay to ensure modal is fully closed
          }
        }}
        blobUrl={receiptBlobUrl}
        receiptNo={receiptNo}
      />

      {/* View Reservation Dialog */}
      <ReservationViewDialog
        isOpen={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        isLoading={!viewReservation}
      >
        {viewReservation && (
          <SchoolReservationViewContent
            viewReservation={viewReservation as any}
            routeNames={routeNames}
            distanceSlabs={distanceSlabs}
            classes={classes}
          />
        )}
      </ReservationViewDialog>

      {/* Edit Reservation Dialog */}
      <ReservationEditDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          // Reset state when dialog closes
          setEditForm(null);
          setSelectedReservation(null);
          setEditSelectedClassId(null);
        }}
        onSave={submitEdit}
        disabled={!editForm}
        isSaving={false}
      >
        {editForm ? (
          <SchoolReservationEdit
            form={editForm}
            setForm={setEditForm}
            classFee={editClassFee}
            transportFee={editTransportFee}
            routes={routeNames.map(
              (route: {
                bus_route_id: number;
                route_no?: string;
                route_name: string;
              }) => ({
                id: route.bus_route_id?.toString?.() || "",
                name: `${route.route_no || "Route"} - ${route.route_name}`,
                fee: 0,
              })
            )}
            classes={classes}
            distanceSlabs={distanceSlabs || []}
            onClassChange={handleEditClassChange}
            onDistanceSlabChange={handleEditDistanceSlabChange}
            onSave={async () => {
              await submitEdit();
            }}
          />
        ) : (
          <div className="p-4">Loading...</div>
        )}
      </ReservationEditDialog>

      {/* Delete Reservation Confirmation */}
      <ReservationDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setReservationToDelete(null);
        }}
        reservationId={reservationToDelete?.reservation_id}
        reservationNo={reservationToDelete?.reservation_no}
        onConfirm={async () => {
          if (
            !reservationToDelete?.reservation_id ||
            deleteReservation.isPending
          )
            return;

          await deleteReservation.mutateAsync(
            reservationToDelete.reservation_id
          );

          // Mutation hook already handles invalidation and refetch, but we ensure refetch callback is called
          void refetchReservations();

          // Toast handled by mutation hook
          setReservationToDelete(null);
        }}
        isDeleting={deleteReservation.isPending}
      />

      {/* Payment Processor Dialog */}
      {paymentData && (
        <ReservationPaymentDialog
          isOpen={showPaymentProcessor}
          onClose={() => setShowPaymentProcessor(false)}
          reservationNo={paymentData.reservationNo}
        >
          <ReservationPaymentProcessor
            reservationData={paymentData}
            onPaymentComplete={(
              _incomeRecord: SchoolIncomeRead,
              _blobUrl: string,
              _receiptNo?: string | null
            ) => {
              setShowPaymentProcessor(false);
              setTimeout(() => setPaymentData(null), 0);
              setTimeout(() => {
                void queryClient.invalidateQueries({ queryKey: schoolKeys.reservations.root(), exact: false });
                if (refetchReservations) void refetchReservations();
              }, 0);
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
        </ReservationPaymentDialog>
      )}
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
};

// Memoized component wrapper with error boundary
const ReservationManagementWithErrorBoundary = memo(() => {
  return (
    <ProductionErrorBoundary
      showDetails={import.meta.env.DEV}
      enableRetry={true}
      enableReport={true}
    >
      <ReservationManagementComponent />
    </ProductionErrorBoundary>
  );
});

ReservationManagementWithErrorBoundary.displayName = "ReservationManagement";

export const ReservationManagement = ReservationManagementWithErrorBoundary;
export default ReservationManagementWithErrorBoundary;
