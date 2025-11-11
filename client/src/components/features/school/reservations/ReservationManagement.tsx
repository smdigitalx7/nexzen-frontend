import { useMemo, useState, useEffect, memo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useSchoolReservationsList,
  useDeleteSchoolReservation,
  useSchoolReservationsDashboard,
  useCreateSchoolReservation,
} from "@/lib/hooks/school/use-school-reservations";
import { schoolKeys } from "@/lib/hooks/school/query-keys";
import { useSchoolClass } from "@/lib/hooks/school";
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
import {
  TransportService,
  SchoolReservationsService,
} from "@/lib/services/school";
import { CacheUtils } from "@/lib/api";
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
  SchoolReservationCreate,
  SchoolReservationStatusEnum,
} from "@/lib/types/school";

// Form state type
type ReservationFormState = {
  student_name: string;
  aadhar_no: string;
  gender: string;
  dob: string;
  father_or_guardian_name: string;
  father_or_guardian_aadhar_no: string;
  father_or_guardian_mobile: string;
  father_or_guardian_occupation: string;
  mother_or_guardian_name: string;
  mother_or_guardian_aadhar_no: string;
  mother_or_guardian_mobile: string;
  mother_or_guardian_occupation: string;
  siblings: Array<{
    name: string;
    class_name: string;
    where: string;
    gender: string;
  }>;
  previous_class: string;
  previous_school_details: string;
  present_address: string;
  permanent_address: string;
  application_fee: string;
  application_fee_paid: boolean;
  class_name: string;
  tuition_fee: string;
  book_fee: string;
  transport_required: boolean;
  preferred_transport_id: string;
  preferred_distance_slab_id: string;
  pickup_point: string;
  transport_fee: string;
  status: string;
  referred_by: string;
  remarks: string;
  reservation_date: string;
};

// Initial form state - moved outside component for better performance
const initialFormState: ReservationFormState = {
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
  siblings: [],
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
const ReservationHeader = memo(({ currentBranch }: { currentBranch: any }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold">Reservations</h1>
        <p className="text-muted-foreground">Manage student reservations</p>
      </div>
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
));

ReservationHeader.displayName = "ReservationHeader";

// Memoized view dialog content component
const ViewDialogContent = memo(
  ({ viewReservation, routeNames = [], distanceSlabs = [], classes = [] }: { viewReservation: any; routeNames?: any[]; distanceSlabs?: any[]; classes?: any[] }) => {
    // Find route name by ID
    const routeName = viewReservation.preferred_transport_id
      ? routeNames.find((r: any) => r.bus_route_id === Number(viewReservation.preferred_transport_id))?.route_name || `ID: ${viewReservation.preferred_transport_id}`
      : "-";
    
    // Find slab name by ID
    const slabName = viewReservation.preferred_distance_slab_id
      ? distanceSlabs.find((s: any) => s.slab_id === Number(viewReservation.preferred_distance_slab_id))?.slab_name || `ID: ${viewReservation.preferred_distance_slab_id}`
      : "-";
    
    // Find class name by ID (use class_name from viewReservation if available, otherwise lookup)
    const className = viewReservation.class_name || (viewReservation.preferred_class_id
      ? classes.find((c: any) => c.class_id === Number(viewReservation.preferred_class_id))?.class_name || `ID: ${viewReservation.preferred_class_id}`
      : "-");
    
    return (
    <div className="space-y-6 text-sm flex-1 overflow-y-auto scrollbar-hide pr-1">
      {/* Reservation Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Reservation No:</strong>{" "}
          {viewReservation.reservation_no || "-"}
        </div>
        <div>
          <strong>Reservation Date:</strong>{" "}
          {viewReservation.reservation_date || "-"}
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
            {viewReservation.status || "-"}
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
          {viewReservation.referred_by_name ||
            viewReservation.referred_by ||
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

      {/* Student Details */}
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
            <strong>Date of Birth:</strong> {viewReservation.dob || "-"}
          </div>
        </div>
      </div>

      {/* Parent/Guardian Details */}
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

      {/* Siblings */}
      {viewReservation.siblings &&
        Array.isArray(viewReservation.siblings) &&
        viewReservation.siblings.length > 0 && (
          <div className="border-t pt-4">
            <div className="font-medium mb-2">Siblings</div>
            <div className="space-y-2">
              {viewReservation.siblings.map((sibling: any, index: number) => (
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
              ))}
            </div>
          </div>
        )}

      {/* Academic Details */}
      <div className="border-t pt-4">
        <div className="font-medium mb-2">Academic Details</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Preferred Class:</strong> {className}
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

      {/* Address Details */}
      <div className="border-t pt-4">
        <div className="font-medium mb-2">Address Details</div>
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

      {/* Fee Details */}
      <div className="border-t pt-4">
        <div className="font-medium mb-2">Fee Details</div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Application Fee:</span>
            <span>
              ₹{Number(viewReservation.application_fee || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Application Fee Paid:</span>
            <span>
              {viewReservation.application_fee_paid ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
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
              {Number(
                viewReservation.transport_concession || 0
              ).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Transport Details */}
      {viewReservation.transport_required && (
        <div className="border-t pt-4">
          <div className="font-medium mb-2">Transport Details</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Transport Required:</strong>{" "}
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Yes
              </Badge>
            </div>
            <div>
              <strong>Preferred Transport Route:</strong>{" "}
              {routeName}
            </div>
            <div>
              <strong>Preferred Distance Slab:</strong>{" "}
              {slabName}
            </div>
            <div>
              <strong>Pickup Point:</strong>{" "}
              {viewReservation.pickup_point || "-"}
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="border-t pt-4">
        <div className="font-medium mb-2">Additional Information</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Remarks:</strong> {viewReservation.remarks || "-"}
          </div>
          {/* <div>
            <strong>Admission Income ID:</strong>{" "}
            {viewReservation.admission_income_id || "-"}
          </div> */}
        </div>
      </div>

      {/* System Information */}
      <div className="border-t pt-4">
        <div className="font-medium mb-2">System Information</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Created At:</strong>{" "}
            {viewReservation.created_at
              ? new Date(viewReservation.created_at).toLocaleString()
              : "-"}
          </div>
          {/* <div>
            <strong>Created By:</strong> {viewReservation.created_by || "-"}
          </div> */}
          <div>
            <strong>Updated At:</strong>{" "}
            {viewReservation.updated_at
              ? new Date(viewReservation.updated_at).toLocaleString()
              : "-"}
          </div>
          {/* <div>
            <strong>Updated By:</strong> {viewReservation.updated_by || "-"}
          </div> */}
        </div>
      </div>
    </div>
    );
  }
);

ViewDialogContent.displayName = "ViewDialogContent";

const ReservationManagementComponent = () => {
  const queryClient = useQueryClient();
  const { currentBranch } = useAuthStore();

  const { activeTab, setActiveTab } = useTabNavigation("new");

  // State management
  const [reservationNo, setReservationNo] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<SchoolReservationRead | null>(null);

  // Initialize mutation hooks (after state is defined)
  const createReservationMutation = useCreateSchoolReservation();
  const deleteReservation = useDeleteSchoolReservation();
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewReservation, setViewReservation] = useState<SchoolReservationRead | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<ReservationFormState | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<SchoolReservationRead | null>(null);
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
  ] = useState<SchoolReservationRead | null>(null);

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

  // Use React Query hook for reservations - Fetch when All Reservations or Status tab is active
  const {
    data: reservationsData,
    isLoading: isLoadingReservations,
    isError: reservationsError,
    error: reservationsErrObj,
    refetch: refetchReservations,
  } = useSchoolReservationsList({
    // No page_size limit - fetch all reservations
  });
  // Query is enabled when either "all" or "status" tab is active
  // This ensures data is fetched when Status tab is active

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

  // Form state using initial state - set reservation_date to today when component mounts
  const [form, setForm] = useState(() => ({
    ...initialFormState,
    reservation_date: new Date().toISOString().split("T")[0],
  }));

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

  const handleUpdateConcession = useCallback(
    async (reservation: any) => {
      try {
        // Always clear cache first to ensure fresh data
        queryClient.removeQueries({
          queryKey: schoolKeys.reservations.detail(reservation.reservation_id),
        });

        // Also invalidate to ensure no stale cache
        await queryClient.invalidateQueries({
          queryKey: schoolKeys.reservations.detail(reservation.reservation_id),
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
        console.error(
          "Failed to load reservation for concession update:",
          error
        );
        toast({
          title: "Failed to Load Reservation",
          description: "Could not load reservation details. Please try again.",
          variant: "destructive",
        });
      }
    },
    [queryClient]
  );

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

        // Comprehensive refresh to ensure All Reservations table updates
        // Step 1: Clear API cache first to ensure fresh network request
        try {
          CacheUtils.clearByPattern(/GET:.*\/school\/reservations/i);
        } catch (error) {
          console.warn('Failed to clear API cache:', error);
        }

        // Step 2: Remove query data to force fresh fetch
        queryClient.removeQueries({ 
          queryKey: schoolKeys.reservations.root(),
          exact: false 
        });

        // Step 3: Invalidate all reservation-related queries
        await queryClient.invalidateQueries({ 
          queryKey: schoolKeys.reservations.root(),
          exact: false 
        });

        // Step 4: Force refetch active queries (bypasses cache)
        await queryClient.refetchQueries({
          queryKey: schoolKeys.reservations.root(),
          type: 'active',
          exact: false
        });

        // Step 5: Call refetchReservations to ensure immediate API call
        await refetchReservations();

        // Step 6: Wait for React Query to update the cache
        await new Promise(resolve => setTimeout(resolve, 200));

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
    [queryClient, refetchReservations]
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
        referred_by: form.referred_by ? Number(form.referred_by) : 0,
        remarks: form.remarks || "",
        reservation_date: form.reservation_date || "",
      };

      try {
        // Send payload as JSON (API expects JSON, not FormData)
        // Use mutation hook which handles cache invalidation automatically
        const res: SchoolReservationRead =
          await createReservationMutation.mutateAsync(payload);

        if (import.meta.env.DEV) {
          console.log("Reservation creation response:", res);
        }

        // Use backend reservation_id to display receipt number
        const reservationId = res?.reservation_id || res?.reservation_no || "";
        setReservationNo(String(reservationId));

        // Show success toast message
        toast({
          title: "Reservation Created Successfully",
          description: `Successfully created reservation with id ${reservationId}`,
          variant: "success",
        });

        // Clear form fields only after successful reservation creation
        setForm(initialFormState);
        setSelectedClassId(null);

        // Additional API cache clearing (mutation hook already invalidates, but we clear cache for consistency)
        try {
          CacheUtils.clearByPattern(/GET:.*\/school\/reservations/i);
        } catch (error) {
          console.warn('Failed to clear API cache:', error);
        }

        // Mutation hook already handles invalidation and refetch, but we ensure refetch callback is called
        await refetchReservations();
        
        // Wait for React Query to update the cache
        await new Promise(resolve => setTimeout(resolve, 200));

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
        // Don't clear form on error - keep all field data
      }
    },
    [
      form,
      getPreferredClassId,
      getPreferredDistanceSlabId,
      transportFee,
      createReservationMutation,
      queryClient,
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
    tuition_fee: r.tuition_fee != null ? String(r.tuition_fee) : "0",
    book_fee: r.book_fee != null ? String(r.book_fee) : "0",
    transport_required:
      r.transport_required !== undefined 
        ? Boolean(r.transport_required)
        : (r.preferred_transport_id ? true : false),
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
              // Convert Reservation to SchoolReservationRead for delete
              const reservationToDelete: SchoolReservationRead = {
                reservation_id: reservation.reservation_id,
                student_name: reservation.studentName,
                created_at: new Date().toISOString(),
                tuition_fee: reservation.tuition_fee || 0,
                book_fee: reservation.book_fee || 0,
                status: reservation.status as SchoolReservationStatusEnum,
              };
              setReservationToDelete(reservationToDelete);
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
            totalCount={reservationsData?.total_count}
            onRefetch={() => { refetchReservations().catch(console.error); }}
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
        siblings: (editForm.siblings && editForm.siblings.length > 0) ? editForm.siblings : [],
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

      // Use service directly with proper cache invalidation and refetch
      // Send JSON payload (backend expects JSON for PUT requests)
      await SchoolReservationsService.update(
        Number(selectedReservation.reservation_id),
        payload
      );

      // Comprehensive cache invalidation after update (matching payment pattern)
      // Step 1: Clear API cache first to ensure fresh network request
      try {
        CacheUtils.clearByPattern(/GET:.*\/school\/reservations/i);
      } catch (error) {
        console.warn('Failed to clear API cache:', error);
      }

      // Step 2: Remove queries from cache to force fresh fetch (bypasses staleTime)
      queryClient.removeQueries({ 
        queryKey: schoolKeys.reservations.root(),
        exact: false 
      });

      // Step 3: Invalidate all reservation-related queries
      await queryClient.invalidateQueries({
        queryKey: schoolKeys.reservations.root(),
        exact: false,
      });

      // Step 4: Force refetch active queries (bypasses cache)
      await queryClient.refetchQueries({
        queryKey: schoolKeys.reservations.root(),
        type: "active",
        exact: false,
      });

      // Step 5: Call refetch callback and wait for it to complete
      await refetchReservations();

      // Step 6: Wait for React Query to update the cache
      await new Promise(resolve => setTimeout(resolve, 300));

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
    queryClient,
    refetchReservations,
  ]);

  // Handle reservations errors
  useEffect(() => {
    if (reservationsError) {
      // Error handling is done in the UI components
    }
  }, [reservationsError, reservationsErrObj]);

  // Refetch reservations when Status or All Reservations tab becomes active to ensure fresh data
  useEffect(() => {
    if (activeTab === "status" || activeTab === "all") {
      const refreshData = async () => {
        // Step 1: Clear API cache
        try {
          CacheUtils.clearByPattern(/GET:.*\/school\/reservations/i);
        } catch (error) {
          console.warn('Failed to clear API cache:', error);
        }
        
        // Step 2: Remove queries from cache to force fresh fetch (bypasses staleTime)
        queryClient.removeQueries({ 
          queryKey: schoolKeys.reservations.root(),
          exact: false 
        });
        
        // Step 3: Invalidate queries
        await queryClient.invalidateQueries({
          queryKey: schoolKeys.reservations.root(),
          exact: false
        });
        
        // Step 4: Refetch active queries
        await queryClient.refetchQueries({
          queryKey: schoolKeys.reservations.root(),
          type: 'active',
          exact: false
        });
        
        // Step 5: Call refetchReservations
        await refetchReservations();
      };
      
      refreshData().catch(console.error);
    }
  }, [activeTab, refetchReservations, queryClient]);

  return (
    <div className="space-y-6 p-6">
      <ReservationHeader currentBranch={currentBranch} />

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
        onClose={async () => {
          setShowReceipt(false);
          if (receiptBlobUrl) {
            URL.revokeObjectURL(receiptBlobUrl);
            setReceiptBlobUrl(null);
          }

          // After closing receipt, ensure data is fresh (matching AllReservationsTable pattern)
          // Step 1: Clear API cache first to ensure fresh network request
          try {
            CacheUtils.clearByPattern(/GET:.*\/school\/reservations/i);
          } catch (error) {
            console.warn('Failed to clear API cache:', error);
          }

          // Step 2: Remove query data to force fresh fetch
          queryClient.removeQueries({ queryKey: schoolKeys.reservations.list(undefined) });

          // Step 3: Invalidate all reservation-related queries
          queryClient.invalidateQueries({ 
            queryKey: schoolKeys.reservations.root(),
            exact: false 
          });

          // Step 4: Force refetch active queries (bypasses cache)
          await queryClient.refetchQueries({
            queryKey: schoolKeys.reservations.root(),
            type: 'active',
            exact: false
          });

          // Step 5: Call refetch callback and wait for it to complete
          await refetchReservations();

          // Step 6: Wait for React Query to update the cache
          await new Promise(resolve => setTimeout(resolve, 200));
        }}
        blobUrl={receiptBlobUrl}
      />

      {/* View Reservation Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
            <DialogTitle>Reservation Details</DialogTitle>
            <DialogDescription>Reservation information</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
            {!viewReservation ? (
              <div className="p-4 text-sm">Loading...</div>
            ) : (
              <ViewDialogContent 
                viewReservation={viewReservation} 
                routeNames={routeNames}
                distanceSlabs={distanceSlabs}
                classes={classes}
              />
            )}
          </div>
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
            setEditSelectedClassId(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
            <DialogTitle>Edit Reservation</DialogTitle>
            <DialogDescription>
              Update reservation information
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
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
          </div>
          <DialogFooter className="px-6 py-4 flex-shrink-0 bg-background border-t border-gray-200">
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

                  // Additional API cache clearing (mutation hook already invalidates, but we clear cache for consistency)
                  try {
                    CacheUtils.clearByPattern(/GET:.*\/school\/reservations/i);
                  } catch (error) {
                    console.warn('Failed to clear API cache:', error);
                  }

                  // Mutation hook already handles invalidation and refetch, but we ensure refetch callback is called
                  await refetchReservations();
                  
                  // Wait for React Query to update the cache
                  await new Promise(resolve => setTimeout(resolve, 200));

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
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Process payment for reservation {paymentData.reservationNo}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
              <ReservationPaymentProcessor
                reservationData={paymentData}
                onPaymentComplete={async (
                  incomeRecord: SchoolIncomeRead,
                  blobUrl: string
                ) => {
                  setPaymentIncomeRecord(incomeRecord);
                  setReceiptBlobUrl(blobUrl);
                  setShowPaymentProcessor(false);

                  // Delay to ensure backend transaction is committed
                  await new Promise(resolve => setTimeout(resolve, 300));

                  // Cache invalidation after payment
                  // Step 1: Clear API cache
                  try {
                    CacheUtils.clearByPattern(/GET:.*\/school\/reservations/i);
                  } catch (error) {
                    console.warn('Failed to clear API cache:', error);
                  }
                  
                  // Step 2: Remove queries from cache to force fresh fetch (bypasses staleTime)
                  queryClient.removeQueries({ 
                    queryKey: schoolKeys.reservations.root(),
                    exact: false 
                  });
                  
                  // Step 3: Invalidate queries (AWAIT to ensure it completes)
                  await queryClient.invalidateQueries({ 
                    queryKey: schoolKeys.reservations.root(),
                    exact: false 
                  });
                  
                  // Step 4: Refetch active queries (AWAIT to ensure it completes)
                  await queryClient.refetchQueries({ 
                    queryKey: schoolKeys.reservations.root(), 
                    type: 'active',
                    exact: false 
                  });

                  // Step 5: Call refetchReservations to ensure immediate API call
                  if (refetchReservations) {
                    await refetchReservations();
                  }

                  // Step 6: Additional delay to ensure React processes state updates
                  await new Promise(resolve => setTimeout(resolve, 200));

                  // Show receipt modal after closing payment processor
                  setTimeout(() => {
                    setShowReceipt(true);
                  }, 100);
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
