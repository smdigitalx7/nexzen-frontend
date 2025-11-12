import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  CreditCard,
  User,
  GraduationCap,
  Users,
  BookOpen,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  CollegeEnrollmentsService,
  CollegeTuitionBalancesService,
  CollegeTransportBalancesService,
} from "@/lib/services/college";
import type {
  CollegeEnrollmentWithStudentDetails,
  CollegeStudentTransportPaymentSummary,
} from "@/lib/types/college";
import type { ExpectedTransportPaymentsResponse } from "@/lib/types/college/transport-fee-balances";
import type { CollegeTuitionFeeBalanceRead } from "@/lib/types/college/tuition-fee-balances";

interface StudentFeeDetails {
  enrollment: CollegeEnrollmentWithStudentDetails;
  tuitionBalance: CollegeTuitionFeeBalanceRead | null;
  transportExpectedPayments?: ExpectedTransportPaymentsResponse;
  transportSummary?: CollegeStudentTransportPaymentSummary | null; // Transport payment summary for outstanding calculation
}

interface CollectFeeSearchProps {
  onStudentSelected: (studentDetails: StudentFeeDetails) => void;
  paymentMode: "single" | "multiple";
  onStartPayment: (studentDetails: StudentFeeDetails) => void;
  searchResults: StudentFeeDetails[];
  setSearchResults: React.Dispatch<React.SetStateAction<StudentFeeDetails[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const CollectFeeSearch = ({
  onStartPayment,
  searchResults,
  setSearchResults,
  searchQuery,
  setSearchQuery,
}: CollectFeeSearchProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Direct service calls for search functionality

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Clear previous results immediately for fresh search
    setSearchResults([]);
    setIsSearching(true);
    setHasSearched(true); // Mark that a search has been performed

    try {
      const trimmedQuery = searchQuery.trim();
      let enrollment: CollegeEnrollmentWithStudentDetails | null = null;

      // Search by admission number using enrollment endpoint
      // Note: Name-based search fallback removed as it requires class_id and group_id (mandatory parameters)
      enrollment = await CollegeEnrollmentsService.getByAdmission(trimmedQuery);

      if (enrollment) {
        // Fetch tuition balance, transport summary, and expected transport payments using enrollment_id
        const [tuitionBalance, transportSummary, transportExpectedPayments] =
          await Promise.all([
            CollegeTuitionBalancesService.getById(
              enrollment.enrollment_id
            ).catch(() => null),
            CollegeTransportBalancesService.getStudentTransportPaymentSummaryByEnrollmentId(
              enrollment.enrollment_id
            ).catch(() => null),
            CollegeTransportBalancesService.getExpectedTransportPaymentsByEnrollmentId(
              enrollment.enrollment_id
            ).catch(() => undefined),
          ]);

        const studentDetails: StudentFeeDetails = {
          enrollment,
          tuitionBalance,
          transportExpectedPayments,
          transportSummary, // Add transport summary for outstanding calculation
        };

        setSearchResults([studentDetails]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      void handleSearch();
    }
  };

  const getTotalOutstanding = useCallback(
    (studentDetails: StudentFeeDetails) => {
      let total = 0;

      // Tuition outstanding
      if (studentDetails.tuitionBalance) {
        const tuition = studentDetails.tuitionBalance;
        total +=
          Math.max(0, (tuition.book_fee || 0) - (tuition.book_paid || 0)) +
          Math.max(0, (tuition.term1_amount || 0) - (tuition.term1_paid || 0)) +
          Math.max(0, (tuition.term2_amount || 0) - (tuition.term2_paid || 0)) +
          Math.max(0, (tuition.term3_amount || 0) - (tuition.term3_paid || 0));
      }

      // Transport outstanding - calculate from multiple sources
      let transportOutstanding = 0;

      // First, try to get from transport summary
      if (
        studentDetails.transportSummary &&
        studentDetails.transportSummary.total_amount_pending !== undefined &&
        studentDetails.transportSummary.total_amount_pending !== null
      ) {
        transportOutstanding =
          typeof studentDetails.transportSummary.total_amount_pending ===
          "string"
            ? parseFloat(
                studentDetails.transportSummary.total_amount_pending
              ) || 0
            : studentDetails.transportSummary.total_amount_pending || 0;
      }

      // If total_amount_pending is 0 or missing, check for unpaid expected payments
      // Also check months_pending_count as an indicator that there are pending payments
      const hasPendingMonths = studentDetails.transportSummary
        ?.months_pending_count
        ? studentDetails.transportSummary.months_pending_count > 0
        : false;

      // Get expected payments from transportSummary (primary) or transportExpectedPayments (fallback)
      const expectedPayments =
        studentDetails.transportSummary?.expected_payments ??
        studentDetails.transportExpectedPayments?.expected_payments ??
        [];

      const hasExpectedPayments = expectedPayments.length > 0;

      if (
        transportOutstanding === 0 &&
        (hasPendingMonths || hasExpectedPayments)
      ) {
        const unpaidPayments = expectedPayments.filter(
          (p) => p.payment_status === "UNPAID" || p.payment_status === "PENDING"
        );

        if (unpaidPayments.length > 0) {
          const calculatedOutstanding = unpaidPayments.reduce(
            (sum, payment) => {
              // payment_amount might be on the payment object (from transportSummary) or might not exist
              const paymentAmount =
                "payment_amount" in payment
                  ? payment.payment_amount
                  : undefined;
              const amount =
                paymentAmount !== undefined
                  ? typeof paymentAmount === "string"
                    ? parseFloat(paymentAmount) || 0
                    : paymentAmount || 0
                  : 0;
              return sum + amount;
            },
            0
          );

          // If calculated amount is 0 but there are unpaid payments, set a flag to show there's outstanding
          // (This handles the case where payment_amount is 0 in the response but payments are still due)
          if (calculatedOutstanding > 0) {
            transportOutstanding = calculatedOutstanding;
          } else if (unpaidPayments.length > 0) {
            // If there are unpaid payments but amount is 0, we still consider it as having outstanding
            // (The actual amount might need to be fetched from monthly_fee_config)
            transportOutstanding = 0; // Keep as 0 but we'll show unpaid months count
          }
        }
      }

      total += transportOutstanding;

      return total;
    },
    []
  );

  // Helper function to calculate tuition outstanding breakdown
  const getTuitionOutstanding = useCallback(
    (studentDetails: StudentFeeDetails) => {
      const tuition = studentDetails.tuitionBalance;
      if (!tuition) return { total: 0, breakdown: [] };

      const bookOutstanding = Math.max(
        0,
        (tuition.book_fee || 0) - (tuition.book_paid || 0)
      );
      const term1Outstanding = Math.max(
        0,
        (tuition.term1_amount || 0) - (tuition.term1_paid || 0)
      );
      const term2Outstanding = Math.max(
        0,
        (tuition.term2_amount || 0) - (tuition.term2_paid || 0)
      );
      const term3Outstanding = Math.max(
        0,
        (tuition.term3_amount || 0) - (tuition.term3_paid || 0)
      );

      const breakdown = [
        { label: "Book Fee", amount: bookOutstanding },
        { label: "Term 1", amount: term1Outstanding },
        { label: "Term 2", amount: term2Outstanding },
        { label: "Term 3", amount: term3Outstanding },
      ].filter((item) => item.amount > 0);

      return {
        total:
          bookOutstanding +
          term1Outstanding +
          term2Outstanding +
          term3Outstanding,
        breakdown,
      };
    },
    []
  );

  return (
    <div className="space-y-6 ">
      {/* Search Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Search className="h-5 w-5" />
            Search Student for Fee Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full px-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Enter admission number or student name to search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // Reset hasSearched when user starts typing a new query
                    if (hasSearched) {
                      setHasSearched(false);
                      setSearchResults([]); // Clear previous results
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full h-12"
                />
              </div>
              <Button
                onClick={() => {
                  // Force fresh search even if same query
                  void handleSearch();
                }}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap h-12 px-4"
              >
                <Search className="h-4 w-4 mr-1" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center ">
              Press Enter to search or click the Search button
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search Results - Professional Cards */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Search Results ({searchResults.length})
          </h2>
          <div className="grid gap-4">
            {searchResults.map((studentDetails, index) => {
              const totalOutstanding = getTotalOutstanding(studentDetails);

              // Check for unpaid transport payments even if amount is 0
              // Get expected payments from transportSummary (primary) or transportExpectedPayments (fallback)
              const expectedPayments =
                studentDetails.transportSummary?.expected_payments ??
                studentDetails.transportExpectedPayments?.expected_payments ??
                [];

              const unpaidTransportPayments = expectedPayments.filter(
                (p) =>
                  p.payment_status === "UNPAID" ||
                  p.payment_status === "PENDING"
              );
              const hasPendingTransportMonths = studentDetails.transportSummary
                ?.months_pending_count
                ? studentDetails.transportSummary.months_pending_count > 0
                : false;

              // Has outstanding if total > 0 OR if there are unpaid transport payments
              const hasOutstanding =
                totalOutstanding > 0 ||
                unpaidTransportPayments.length > 0 ||
                hasPendingTransportMonths;
              const tuitionOutstanding = getTuitionOutstanding(studentDetails);

              return (
                <motion.div
                  key={studentDetails.enrollment.admission_no || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Student Information Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pb-4 border-b">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Admission No
                              </p>
                              <p className="font-semibold">
                                {studentDetails.enrollment.admission_no}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Student Name
                              </p>
                              <p className="font-semibold">
                                {studentDetails.enrollment.student_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Class
                              </p>
                              <Badge variant="outline">
                                {studentDetails.enrollment.class_name || "N/A"}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Group / Course
                              </p>
                              <div className="flex flex-wrap gap-2 ">
                                <Badge variant="outline">
                                  {studentDetails.enrollment.group_name ||
                                    "N/A"}
                                </Badge>

                                {studentDetails.enrollment.course_name && (
                                  <Badge variant="outline">
                                    {studentDetails.enrollment.course_name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Roll Number
                              </p>
                              <p className="font-semibold">
                                {studentDetails.enrollment.roll_number || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Fee Breakdown Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Tuition Fee Card */}
                          <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <CardTitle className="text-lg">
                                  Tuition Fee
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                  Total Outstanding
                                </span>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {formatCurrency(tuitionOutstanding.total)}
                                </span>
                              </div>
                              {tuitionOutstanding.breakdown.length > 0 && (
                                <div className="space-y-2 pt-2 border-t">
                                  {tuitionOutstanding.breakdown.map(
                                    (item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between text-sm"
                                      >
                                        <span className="text-muted-foreground">
                                          {item.label}:
                                        </span>
                                        <span className="font-medium">
                                          {formatCurrency(item.amount)}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                              {tuitionOutstanding.total === 0 && (
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                  All fees paid
                                </p>
                              )}
                            </CardContent>
                          </Card>

                          {/* Transport Fee Card - Outstanding Amount */}
                          <Card className="border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <CardTitle className="text-lg">
                                  Transport Fee
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {(() => {
                                // Calculate transport outstanding from multiple sources
                                let transportOutstanding = 0;

                                // First, try to get from transport summary
                                if (
                                  studentDetails.transportSummary &&
                                  studentDetails.transportSummary
                                    .total_amount_pending !== undefined &&
                                  studentDetails.transportSummary
                                    .total_amount_pending !== null
                                ) {
                                  transportOutstanding =
                                    typeof studentDetails.transportSummary
                                      .total_amount_pending === "string"
                                      ? parseFloat(
                                          studentDetails.transportSummary
                                            .total_amount_pending
                                        ) || 0
                                      : studentDetails.transportSummary
                                          .total_amount_pending || 0;
                                }

                                // Get expected payments from transportSummary (primary) or transportExpectedPayments (fallback)
                                const expectedPayments =
                                  studentDetails.transportSummary
                                    ?.expected_payments ??
                                  studentDetails.transportExpectedPayments
                                    ?.expected_payments ??
                                  [];

                                // Get unpaid expected payments
                                const unpaidPayments = expectedPayments.filter(
                                  (p) =>
                                    p.payment_status === "UNPAID" ||
                                    p.payment_status === "PENDING"
                                );

                                // Check if there are pending months from summary
                                const hasPendingMonths = studentDetails
                                  .transportSummary?.months_pending_count
                                  ? studentDetails.transportSummary
                                      .months_pending_count > 0
                                  : false;

                                // If total_amount_pending is 0 but there are unpaid expected payments or pending months, calculate from expected_payments
                                if (
                                  transportOutstanding === 0 &&
                                  (hasPendingMonths ||
                                    unpaidPayments.length > 0)
                                ) {
                                  if (unpaidPayments.length > 0) {
                                    const calculatedOutstanding =
                                      unpaidPayments.reduce((sum, payment) => {
                                        // payment_amount might be on the payment object (from transportSummary) or might not exist
                                        const paymentAmount =
                                          "payment_amount" in payment
                                            ? payment.payment_amount
                                            : undefined;
                                        const amount =
                                          paymentAmount !== undefined
                                            ? typeof paymentAmount === "string"
                                              ? parseFloat(paymentAmount) || 0
                                              : paymentAmount || 0
                                            : 0;
                                        return sum + amount;
                                      }, 0);

                                    if (calculatedOutstanding > 0) {
                                      transportOutstanding =
                                        calculatedOutstanding;
                                    }
                                  }
                                }

                                // Show outstanding if amount > 0 OR if there are unpaid payments (even if amount is 0, there might be fees due)
                                const hasOutstanding =
                                  transportOutstanding > 0 ||
                                  unpaidPayments.length > 0 ||
                                  hasPendingMonths;

                                return hasOutstanding ? (
                                  <>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">
                                        Total Outstanding
                                      </span>
                                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {transportOutstanding > 0
                                          ? formatCurrency(transportOutstanding)
                                          : unpaidPayments.length > 0 ||
                                              hasPendingMonths
                                            ? `₹0.00 (${unpaidPayments.length > 0 ? unpaidPayments.length : "Pending"} unpaid month${(unpaidPayments.length > 0 ? unpaidPayments.length : 1) !== 1 ? "s" : ""})`
                                            : formatCurrency(0)}
                                      </span>
                                    </div>
                                    {transportOutstanding === 0 &&
                                      (unpaidPayments.length > 0 ||
                                        hasPendingMonths) && (
                                        <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                                          ⚠️ Payment amounts not calculated yet.
                                          Please contact admin to configure
                                          monthly fee amounts.
                                        </div>
                                      )}
                                    {(() => {
                                      return unpaidPayments.length > 0 ||
                                        hasPendingMonths ? (
                                        <div className="space-y-2 pt-2 border-t">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                              Unpaid Months:
                                            </span>
                                            <span className="font-medium">
                                              {unpaidPayments.length}
                                            </span>
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-2">
                                            {unpaidPayments
                                              .slice(0, 3)
                                              .map((payment) => {
                                                const date = new Date(
                                                  payment.expected_payment_month
                                                );
                                                return date.toLocaleDateString(
                                                  "en-US",
                                                  {
                                                    month: "short",
                                                    year: "numeric",
                                                  }
                                                );
                                              })
                                              .join(", ")}
                                            {unpaidPayments.length > 3 && "..."}
                                          </div>
                                        </div>
                                      ) : null;
                                    })()}
                                  </>
                                ) : (
                                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    All transport fees paid
                                  </p>
                                );
                              })()}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Total Outstanding and Action */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Total Outstanding
                            </p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(totalOutstanding)}
                            </p>
                          </div>
                          <Button
                            onClick={() => onStartPayment(studentDetails)}
                            disabled={!hasOutstanding}
                            size="lg"
                            className={
                              hasOutstanding
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                            }
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            {hasOutstanding ? "Collect Fee" : "No Outstanding"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results - Only show after a search has been performed */}
      {hasSearched &&
        searchResults.length === 0 &&
        searchQuery &&
        !isSearching && (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No student found</h3>
              <p className="text-muted-foreground">
                No student found with admission number or name &quot;
                {searchQuery}&quot;
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
};
