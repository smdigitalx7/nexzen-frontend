import { useMemo, useState, useEffect, memo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useSchoolReservationsList,
  useDeleteSchoolReservation,
  useSchoolReservationsDashboard,
  useCreateSchoolReservation,
  useUpdateSchoolReservation,
  useSchoolClass,
} from "@/lib/hooks/school";
// Note: useSchoolClasses from dropdowns (naming conflict)
import { useSchoolClasses } from "@/lib/hooks/school/use-school-dropdowns";
import { useDistanceSlabs } from "@/lib/hooks/general";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
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
import ReservationForm from "../reservations/ReservationForm";
import SchoolReservationEdit from "../reservations/SchoolReservationEdit";
import AllReservationsTable from "../reservations/AllReservationsTable";
import StatusUpdateTable from "../reservations/StatusUpdateTable";
import { TransportService, SchoolReservationsService } from "@/lib/services/school";
import { toast } from "@/hooks/use-toast";
import { Plus, List, BarChart3, School, Building2 } from "lucide-react";
import { TabSwitcher } from "@/components/shared";
import { SchoolReservationStatsCards } from "./SchoolReservationStatsCards";
import {
  ReservationPaymentProcessor,
  ReservationPaymentData,
} from "@/components/shared/payment";
import {
  ConcessionUpdateDialog,
  ReceiptPreviewModal,
} from "@/components/shared";
import type {
  SchoolIncomeRead,
  SchoolReservationRead,
} from "@/lib/types/school";

// Initial form state - moved outside component for better performance
const initialFormState = {
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
};

// Memoized header component
const ReservationHeader = memo(
  ({
    currentBranch,
    reservationNo,
  }: {
    currentBranch: any;
    reservationNo: string;
  }) => (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-start justify-between">
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
            {currentBranch?.branch_type === "SCHOOL" ? (
              <School className="h-3 w-3" />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
);

ReservationHeader.displayName = "ReservationHeader";

// Memoized view dialog content component
const ViewDialogContent = memo(
  ({ viewReservation }: { viewReservation: any }) => (
    <div className="space-y-6 text-sm flex-1 overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Reservation No:</strong>{" "}
          {viewReservation.reservation_no || "-"}
        </div>
        <div>
          <strong>Date:</strong> {viewReservation.reservation_date || "-"}
        </div>
        <div>
          <strong>Status:</strong> {viewReservation.status || "-"}
        </div>
        <div>
          <strong>Referred By (ID):</strong>{" "}
          {viewReservation.referred_by ?? "-"}
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
      </div>

      <div className="border-t pt-4">
        <div className="font-medium mb-2">Student Details</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Name:</strong> {viewReservation.student_name || "-"}
          </div>
          <div>
            <strong>Aadhar No:</strong> {viewReservation.aadhar_no || "-"}
          </div>
          <div>
            <strong>Gender:</strong> {viewReservation.gender || "-"}
          </div>
          <div>
            <strong>DOB:</strong> {viewReservation.dob || "-"}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="font-medium mb-2">Parent Details</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Father/Guardian Name:</strong>{" "}
            {viewReservation.father_or_guardian_name || "-"}
          </div>
          <div>
            <strong>Father/Guardian Aadhar:</strong>{" "}
            {viewReservation.father_or_guardian_aadhar_no || "-"}
          </div>
          <div>
            <strong>Father/Guardian Mobile:</strong>{" "}
            {viewReservation.father_or_guardian_mobile || "-"}
          </div>
          <div>
            <strong>Father/Guardian Occupation:</strong>{" "}
            {viewReservation.father_or_guardian_occupation || "-"}
          </div>
          <div>
            <strong>Mother/Guardian Name:</strong>{" "}
            {viewReservation.mother_or_guardian_name || "-"}
          </div>
          <div>
            <strong>Mother/Guardian Aadhar:</strong>{" "}
            {viewReservation.mother_or_guardian_aadhar_no || "-"}
          </div>
          <div>
            <strong>Mother/Guardian Mobile:</strong>{" "}
            {viewReservation.mother_or_guardian_mobile || "-"}
          </div>
          <div>
            <strong>Mother/Guardian Occupation:</strong>{" "}
            {viewReservation.mother_or_guardian_occupation || "-"}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="font-medium mb-2">Academic Details</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Preferred Class:</strong>{" "}
            {viewReservation.class_name ||
              viewReservation.preferred_class_id ||
              "-"}
          </div>
          <div>
            <strong>Previous Class:</strong>{" "}
            {viewReservation.previous_class || "-"}
          </div>
          <div>
            <strong>Previous School:</strong>{" "}
            {viewReservation.previous_school_details || "-"}
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
              ₹{Number(viewReservation.application_fee || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Application Fee Paid:</span>
            <span>{viewReservation.application_fee_paid ? "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between">
            <span>Tuition Fee:</span>
            <span>
              ₹{Number(viewReservation.tuition_fee || 0).toLocaleString()}
            </span>
          </div>
          {viewReservation.book_fee != null && (
            <div className="flex justify-between">
              <span>Book Fee:</span>
              <span>
                ₹{Number(viewReservation.book_fee || 0).toLocaleString()}
              </span>
            </div>
          )}
          {viewReservation.transport_fee != null && (
            <div className="flex justify-between">
              <span>Transport Fee:</span>
              <span>
                ₹{Number(viewReservation.transport_fee || 0).toLocaleString()}
              </span>
            </div>
          )}
          {viewReservation.transport_concession != null && (
            <div className="flex justify-between">
              <span>Transport Concession:</span>
              <span>
                ₹
                {Number(
                  viewReservation.transport_concession || 0
                ).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Income Records Section */}
      {(viewReservation.application_income_id ||
        viewReservation.admission_income_id) && (
        <div className="border-t pt-4">
          <div className="font-medium mb-2">Income Records</div>
          <div className="space-y-2">
            {viewReservation.application_income_id && (
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">
                  Application Fee Income ID:
                </span>
                <Badge variant="outline" className="font-mono">
                  {viewReservation.application_income_id}
                </Badge>
              </div>
            )}
            {viewReservation.admission_income_id && (
              <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">
                  Admission Fee Income ID:
                </span>
                <Badge variant="outline" className="font-mono">
                  {viewReservation.admission_income_id}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="font-medium mb-2">Preferences</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Preferred Class ID:</strong>{" "}
            {viewReservation.preferred_class_id ?? "-"}
          </div>
          <div>
            <strong>Preferred Transport ID:</strong>{" "}
            {viewReservation.preferred_transport_id ?? "-"}
          </div>
          <div>
            <strong>Preferred Distance Slab ID:</strong>{" "}
            {viewReservation.preferred_distance_slab_id ?? "-"}
          </div>
          <div>
            <strong>Pickup Point:</strong> {viewReservation.pickup_point || "-"}
          </div>
          <div>
            <strong>Remarks:</strong> {viewReservation.remarks || "-"}
          </div>
        </div>
      </div>
    </div>
  )
);

ViewDialogContent.displayName = "ViewDialogContent";

const ReservationManagementComponent = () => {
  const queryClient = useQueryClient();
  const { currentBranch } = useAuthStore();

  const { activeTab, setActiveTab } = useTabNavigation("new");

  // State management
  const [reservationNo, setReservationNo] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  // Initialize mutation hooks (after state is defined)
  const createReservationMutation = useCreateSchoolReservation();
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewReservation, setViewReservation] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<any>(null);
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

  // Concession related state
  const [showConcessionDialog, setShowConcessionDialog] = useState(false);
  const [
    selectedReservationForConcession,
    setSelectedReservationForConcession,
  ] = useState<any>(null);

  // Track dropdown opens for lazy loading
  const [dropdownsOpened, setDropdownsOpened] = useState({
    classes: false,
    distanceSlabs: false,
    routes: false,
  });

  // Classes dropdown from API - Load on-demand when dropdown is opened
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ["school-dropdowns", "classes"],
    queryFn: () =>
      import("@/lib/services/school/dropdowns.service").then((m) =>
        m.SchoolDropdownsService.getClasses()
      ),
    enabled: dropdownsOpened.classes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  const classes = classesData?.items || [];

  // Distance slabs dropdown from API - Load on-demand when dropdown is opened
  const { data: distanceSlabs = [], isLoading: isLoadingDistanceSlabs } =
    useQuery({
      queryKey: ["distance-slabs"],
      queryFn: () =>
        import("@/lib/services/general/distance-slabs.service").then((m) =>
          m.DistanceSlabsService.listDistanceSlabs()
        ),
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

  // Use React Query hook for reservations - Only fetch when All Reservations tab is active
  const {
    data: reservationsData,
    isLoading: isLoadingReservations,
    isError: reservationsError,
    error: reservationsErrObj,
    refetch: refetchReservations,
  } = useQuery({
    queryKey: ["school", "reservations", { page: 1, page_size: 20 }],
    queryFn: () =>
      import("@/lib/services/school/reservations.service").then((m) =>
        m.SchoolReservationsService.list({ page: 1, page_size: 20 })
      ),
    enabled: activeTab === "all",
  });

  // Delete reservation hook
  const deleteReservation = useDeleteSchoolReservation();

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("all");

  // Memoized reservations data processing
  const allReservations = useMemo(() => {
    if (!reservationsData?.reservations) return [];

    if (!Array.isArray(reservationsData.reservations)) return [];

    return reservationsData.reservations.map((r: any) => ({
      id: String(r.reservation_id),
      no: r.reservation_no || r.reservationNo || "", // Add reservation number
      reservation_id: r.reservation_id, // Keep the original reservation_id as number
      studentName: r.student_name,
      classAdmission: r.class_name || r.admit_into || "",
      status: r.status || "PENDING",
      date: r.reservation_date || "",
      totalFee: Number(r.tuition_fee || 0) + Number(r.transport_fee || 0),
      income_id: r.income_id || r.incomeId, // Support both field names
      concession_lock: r.concession_lock || false, // Add concession_lock
      tuition_fee: r.tuition_fee || 0, // Add tuition_fee
      transport_fee: r.transport_fee || 0, // Add transport_fee
      book_fee: r.book_fee || 0, // Add book_fee
      application_fee: r.application_fee || 0, // Add application_fee
      tuition_concession: r.tuition_concession || 0, // Add tuition_concession
      transport_concession: r.transport_concession || 0, // Add transport_concession
      remarks: r.remarks || "", // Add remarks
      // Additional fields for enrollment and income tracking
      application_income_id: r.application_income_id || null,
      admission_income_id: r.admission_income_id || null,
      is_enrolled: r.is_enrolled || false,
    }));
  }, [reservationsData]);

  // Form state using initial state
  const [form, setForm] = useState(initialFormState);

  // Memoized handlers
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
    (formState = form) => {
      const selectedClass = classes.find(
        (c) => c.class_name === formState.class_name
      );
      return selectedClass ? selectedClass.class_id : 0;
    },
    [classes, form]
  );

  // Get preferred_distance_slab_id from form (for API submission)
  const getPreferredDistanceSlabId = useCallback(
    (formState = form) => {
      const selectedSlab = distanceSlabs?.find(
        (s) => s.slab_id.toString() === formState.preferred_distance_slab_id
      );
      return selectedSlab ? selectedSlab.slab_id : 0;
    },
    [distanceSlabs, form]
  );

  // Update form with fees when class data is fetched
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
  useEffect(() => {
    if (editSelectedClassData && editForm) {
      setEditForm((prev: any) => ({
        ...prev,
        tuition_fee: editSelectedClassData.tuition_fee.toString(),
        book_fee: editSelectedClassData.book_fee.toString(),
      }));
    }
  }, [editSelectedClassData, editForm]);

  // Memoized fee calculations
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
      // Fetch the full reservation details for the dialog
      const fullReservationData = await SchoolReservationsService.getById(
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
  }, []);

  const handleConcessionUpdate = useCallback(
    async (
      reservationId: number,
      tuitionConcession: number,
      transportConcession: number,
      remarks: string
    ) => {
      try {
        await SchoolReservationsService.updateConcession(reservationId, {
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
    },
    [refetchReservations]
  );

  // Memoized route mapping
  const mappedRoutes = useMemo(() => {
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
        status: "PENDING",
        referred_by: form.referred_by ? Number(form.referred_by) : 0,
        remarks: form.remarks || "",
        reservation_date: form.reservation_date || "",
      };

      try {
        // Convert payload to FormData as required by the service
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
          const value = payload[key as keyof typeof payload];
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });

        // Use mutation hook which handles cache invalidation automatically
        const res: SchoolReservationRead =
          await createReservationMutation.mutateAsync(formData);

        console.log("Reservation creation response:", res);
        // Use backend reservation_id to display receipt number
        setReservationNo(String(res?.reservation_id || ""));

        // Invalidate cache to refresh the list
        queryClient.invalidateQueries({ queryKey: ["school", "reservations"] });

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

          setPaymentData(paymentData);
          setShowPaymentProcessor(true);
        } else {
          setShowReceipt(true);
        }
      } catch (e: any) {
        console.error("Failed to create reservation:", e);
        // Error toast is handled by mutation hook
      }
    },
    [
      form,
      getPreferredClassId,
      getPreferredDistanceSlabId,
      transportFee,
      createReservationMutation,
      queryClient,
    ]
  );

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
    application_fee:
      r.application_fee != null ? String(r.application_fee) : "0",
    application_fee_paid: r.application_fee_paid || false,
    class_name: r.class_name || "",
    tuition_fee: r.tuition_fee != null ? String(r.tuition_fee) : "0",
    book_fee: r.book_fee != null ? String(r.book_fee) : "0",
    transport_required: r.preferred_transport_id ? true : false,
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
    referred_by: r.referred_by != null ? String(r.referred_by) : "",
    remarks: r.remarks || "",
    reservation_date: r.reservation_date || "",
  });

  const handleView = useCallback(async (r: any) => {
    try {
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

        setSelectedReservation({ id: r.reservation_id });
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
        content: isLoadingReservations ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">
                Loading reservations...
              </p>
            </div>
          </div>
        ) : (
          <AllReservationsTable
            reservations={allReservations}
            isLoading={isLoadingReservations}
            isError={reservationsError}
            error={reservationsErrObj}
            onRefetch={refetchReservations}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(reservation) => {
              setReservationToDelete(reservation);
              setShowDeleteDialog(true);
            }}
            onUpdateConcession={handleUpdateConcession}
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
            reservations={allReservations}
            isLoading={isLoadingReservations}
            isError={reservationsError}
            error={reservationsErrObj}
            onRefetch={refetchReservations}
            totalCount={reservationsData?.total_count}
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
      reservationsData?.total_count,
    ]
  );

  const submitEdit = useCallback(async () => {
    if (!selectedReservation?.id || !editForm) return;
    try {
      // Convert editForm to JSON payload
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
        siblings: editForm.siblings.length > 0 ? editForm.siblings : [],
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
        referred_by: editForm.referred_by ? Number(editForm.referred_by) : 0,
        remarks: editForm.remarks || "",
        reservation_date: editForm.reservation_date || "",
      };

      // Convert payload to FormData
      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        const value = payload[key as keyof typeof payload];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Use service directly and invalidate cache
      await SchoolReservationsService.update(
        Number(selectedReservation.id),
        formData
      );

      // Invalidate cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["school", "reservations"] });

      toast({
        title: "Reservation Updated",
        description: "Reservation details have been updated successfully.",
      });
      setShowEditDialog(false);
    } catch (e: any) {
      console.error("Failed to update reservation:", e);
      // Error toast is handled by mutation hook
    }
  }, [
    selectedReservation,
    editForm,
    getPreferredClassId,
    getPreferredDistanceSlabId,
    editTransportFee,
    queryClient,
  ]);

  // Handle reservations errors
  useEffect(() => {
    if (reservationsError) {
      // Error handling is done in the UI components
    }
  }, [reservationsError, reservationsErrObj]);

  return (
    <div className="space-y-6 p-6">
      <ReservationHeader
        currentBranch={currentBranch}
        reservationNo={reservationNo}
      />

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
          setShowReceipt(false);
          if (receiptBlobUrl) {
            URL.revokeObjectURL(receiptBlobUrl);
            setReceiptBlobUrl(null);
          }
        }}
        blobUrl={receiptBlobUrl}
      />

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
            <ViewDialogContent viewReservation={viewReservation} />
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
                if (
                  !reservationToDelete?.reservation_id ||
                  deleteReservation.isPending
                )
                  return;

                try {
                  await deleteReservation.mutateAsync(
                    reservationToDelete.reservation_id
                  );
                  // Toast handled by mutation hook
                  setShowDeleteDialog(false);
                  setReservationToDelete(null);
                } catch (e: any) {
                  console.error("Failed to delete reservation:", e);
                  // Error toasts handled by mutation hook
                }
              }}
              disabled={deleteReservation.isPending}
            >
              {deleteReservation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Processor Dialog */}
      {paymentData && (
        <Dialog
          open={showPaymentProcessor}
          onOpenChange={setShowPaymentProcessor}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Process payment for reservation {paymentData.reservationNo}
              </DialogDescription>
            </DialogHeader>
            <ReservationPaymentProcessor
              reservationData={paymentData}
              onPaymentComplete={(
                incomeRecord: SchoolIncomeRead,
                blobUrl: string
              ) => {
                setPaymentIncomeRecord(incomeRecord);
                setReceiptBlobUrl(blobUrl);
                setShowPaymentProcessor(false);
                // Show receipt modal after closing payment processor
                setTimeout(() => {
                  setShowReceipt(true);
                }, 100);
                // Refresh reservations list to show updated status
                refetchReservations();
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
          </DialogContent>
        </Dialog>
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

export const ReservationManagement = ReservationManagementComponent;
export default ReservationManagementComponent;
