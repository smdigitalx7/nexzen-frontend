import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CreditCard, User, GraduationCap, Users, BookOpen, Truck, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { CollegeEnrollmentsService, CollegeTuitionBalancesService, CollegeTransportBalancesService } from "@/lib/services/college";
import { CollegeClassDropdown, CollegeGroupDropdown } from "@/components/shared/Dropdowns";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/lib/hooks/common/useDebounce";
import { useCollegeEnrollmentsList } from "@/lib/hooks/college/use-college-enrollments";
import type { CollegeEnrollmentWithStudentDetails, CollegeStudentTransportPaymentSummary, CollegeEnrollmentRead } from "@/lib/types/college";
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
  paymentMode: 'single' | 'multiple';
  onStartPayment: (studentDetails: StudentFeeDetails) => void;
  searchResults: StudentFeeDetails[];
  setSearchResults: React.Dispatch<React.SetStateAction<StudentFeeDetails[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const CollectFeeSearch = ({ onStartPayment, searchResults, setSearchResults, searchQuery, setSearchQuery }: CollectFeeSearchProps) => {
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ admission_no: string; student_name: string; enrollment_id: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle class change - reset group and clear results
  const handleClassChange = useCallback((value: number | null) => {
    setSelectedClassId(value);
    setSelectedGroupId(null);
    setSearchResults([]);
    setSearchQuery("");
  }, [setSearchResults, setSearchQuery]);

  // Handle group change - clear results
  const handleGroupChange = useCallback((value: number | null) => {
    setSelectedGroupId(value);
    setSearchResults([]);
    setSearchQuery("");
  }, [setSearchResults, setSearchQuery]);

  // Handle search
  const handleSearch = useCallback(async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a student admission number or name to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      const enrollment = await CollegeEnrollmentsService.getByAdmission(searchTerm.trim());
      
      const [tuitionBalance, transportSummary, transportExpectedPayments] = await Promise.all([
        CollegeTuitionBalancesService.getById(enrollment.enrollment_id).catch(() => null),
        CollegeTransportBalancesService.getStudentTransportPaymentSummaryByEnrollmentId(enrollment.enrollment_id).catch(() => null),
        CollegeTransportBalancesService.getExpectedTransportPaymentsByEnrollmentId(enrollment.enrollment_id).catch(() => undefined)
      ]);

      const studentDetails: StudentFeeDetails = {
        enrollment,
        tuitionBalance,
        transportExpectedPayments,
        transportSummary
      };

      setSearchResults([studentDetails]);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Student Not Found",
        description: "No student found with the provided admission number or name. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, setSearchResults, toast]);

  // Fetch enrollments for suggestions when class and group are selected
  const enrollmentsApiParams = useMemo(() => {
    if (!selectedClassId || !selectedGroupId) return undefined;
    return {
      class_id: selectedClassId,
      group_id: selectedGroupId,
    };
  }, [selectedClassId, selectedGroupId]);

  const { data: enrollmentsData } = useCollegeEnrollmentsList(enrollmentsApiParams);

  // Flatten enrollments for suggestions
  const enrollments = useMemo(() => {
    if (!enrollmentsData?.enrollments) return [];
    const allEnrollments: (CollegeEnrollmentRead & { class_name?: string; group_name?: string; course_name?: string })[] = [];
    enrollmentsData.enrollments.forEach((group: any) => {
      if (group.students && Array.isArray(group.students)) {
        group.students.forEach((student: CollegeEnrollmentRead) => {
          allEnrollments.push({
            ...student,
            class_name: group.class_name,
            group_name: group.group_name,
            course_name: group.course_name,
          });
        });
      }
    });
    return allEnrollments;
  }, [enrollmentsData]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      void handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }, [handleSearch]);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchQuery.trim() || debouncedSearchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const query = debouncedSearchQuery.trim();
        
        // If class_id and group_id are selected, filter from loaded enrollments
        if (selectedClassId && selectedGroupId && enrollments.length > 0) {
          const filtered = enrollments.filter((enrollment) => {
            const matchesAdmission = enrollment.admission_no?.toLowerCase().includes(query.toLowerCase());
            const matchesName = enrollment.student_name?.toLowerCase().includes(query.toLowerCase());
            return matchesAdmission || matchesName;
          });
          
          setSuggestions(
            filtered.slice(0, 10).map((e) => ({
              admission_no: e.admission_no,
              student_name: e.student_name,
              enrollment_id: e.enrollment_id,
            }))
          );
          setShowSuggestions(true);
          setIsLoadingSuggestions(false);
          return;
        }
        
        // Try exact match by admission number (works for any length >= 3)
        if (query.length >= 3) {
          try {
            const enrollment = await CollegeEnrollmentsService.getByAdmission(query);
            setSuggestions([{
              admission_no: enrollment.admission_no,
              student_name: enrollment.student_name,
              enrollment_id: enrollment.enrollment_id,
            }]);
            setShowSuggestions(true);
          } catch {
            setSuggestions([]);
          }
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        // Silently fail for suggestions
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    void fetchSuggestions();
  }, [debouncedSearchQuery, selectedClassId, selectedGroupId, enrollments]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: { admission_no: string; student_name: string; enrollment_id: number }) => {
    setSearchQuery(suggestion.admission_no);
    setShowSuggestions(false);
    // Trigger search automatically when suggestion is selected
    void handleSearch(suggestion.admission_no);
  }, [setSearchQuery, handleSearch]);

  const getTotalOutstanding = useCallback((studentDetails: StudentFeeDetails) => {
    let total = 0;
    
    // Tuition outstanding
    if (studentDetails.tuitionBalance) {
      const tuition = studentDetails.tuitionBalance;
      total += Math.max(0, (tuition.book_fee || 0) - (tuition.book_paid || 0)) + 
               Math.max(0, (tuition.term1_amount || 0) - (tuition.term1_paid || 0)) +
               Math.max(0, (tuition.term2_amount || 0) - (tuition.term2_paid || 0)) +
               Math.max(0, (tuition.term3_amount || 0) - (tuition.term3_paid || 0));
    }
    
    // Transport outstanding - calculate from multiple sources
    let transportOutstanding = 0;
    
    // First, try to get from transport summary
    if (studentDetails.transportSummary && studentDetails.transportSummary.total_amount_pending !== undefined && studentDetails.transportSummary.total_amount_pending !== null) {
      transportOutstanding = typeof studentDetails.transportSummary.total_amount_pending === 'string'
        ? parseFloat(studentDetails.transportSummary.total_amount_pending) || 0
        : (studentDetails.transportSummary.total_amount_pending || 0);
    }
    
    // If total_amount_pending is 0 or missing, check for unpaid expected payments
    // Also check months_pending_count as an indicator that there are pending payments
    const hasPendingMonths = studentDetails.transportSummary?.months_pending_count 
      ? studentDetails.transportSummary.months_pending_count > 0 
      : false;
    
    // Get expected payments from transportSummary (primary) or transportExpectedPayments (fallback)
    const expectedPayments = studentDetails.transportSummary?.expected_payments 
      ?? studentDetails.transportExpectedPayments?.expected_payments 
      ?? [];
    
    const hasExpectedPayments = expectedPayments.length > 0;
    
    if (transportOutstanding === 0 && (hasPendingMonths || hasExpectedPayments)) {
      const unpaidPayments = expectedPayments.filter(
        p => p.payment_status === 'UNPAID' || p.payment_status === 'PENDING'
      );
      
      if (unpaidPayments.length > 0) {
        const calculatedOutstanding = unpaidPayments.reduce((sum, payment) => {
          // payment_amount might be on the payment object (from transportSummary) or might not exist
          const paymentAmount = 'payment_amount' in payment ? payment.payment_amount : undefined;
          const amount = paymentAmount !== undefined
            ? (typeof paymentAmount === 'string'
                ? parseFloat(paymentAmount) || 0
                : (paymentAmount || 0))
            : 0;
          return sum + amount;
        }, 0);
        
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
  }, []);

  // Helper function to calculate tuition outstanding breakdown
  const getTuitionOutstanding = useCallback((studentDetails: StudentFeeDetails) => {
    const tuition = studentDetails.tuitionBalance;
    if (!tuition) return { total: 0, breakdown: [] };

    const bookOutstanding = Math.max(0, (tuition.book_fee || 0) - (tuition.book_paid || 0));
    const term1Outstanding = Math.max(0, (tuition.term1_amount || 0) - (tuition.term1_paid || 0));
    const term2Outstanding = Math.max(0, (tuition.term2_amount || 0) - (tuition.term2_paid || 0));
    const term3Outstanding = Math.max(0, (tuition.term3_amount || 0) - (tuition.term3_paid || 0));

    const breakdown = [
      { label: "Book Fee", amount: bookOutstanding },
      { label: "Term 1", amount: term1Outstanding },
      { label: "Term 2", amount: term2Outstanding },
      { label: "Term 3", amount: term3Outstanding },
    ].filter((item) => item.amount > 0);

    return {
      total: bookOutstanding + term1Outstanding + term2Outstanding + term3Outstanding,
      breakdown,
    };
  }, []);


  return (
    <div className="space-y-6">
      {/* Student Selection Section with Dropdowns */}
      <Card className="w-full border-2 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <User className="h-5 w-5 text-blue-600" />
            Select Student for Fee Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full px-6 pb-6">
          <div className="space-y-4">
            {/* Class and Group Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-select" className="text-sm font-medium">
                  Class <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <CollegeClassDropdown
                  value={selectedClassId}
                  onChange={handleClassChange}
                  placeholder="Select class (optional)"
                  className="w-full"
                  emptyValue
                  emptyValueLabel="All Classes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-select" className="text-sm font-medium">
                  Group <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <CollegeGroupDropdown
                  classId={selectedClassId || undefined}
                  value={selectedGroupId}
                  onChange={handleGroupChange}
                  disabled={!selectedClassId}
                  placeholder={selectedClassId ? "Select group (optional)" : "Select class first"}
                  className="w-full"
                  emptyValue
                  emptyValueLabel="All Groups"
                />
              </div>
            </div>

            {/* Student Search Input with Suggestions */}
            <div className="space-y-2">
              <Label htmlFor="student-search" className="text-sm font-medium">
                Search Student <span className="text-red-500">*</span>
              </Label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                  {isLoadingSuggestions && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin z-10" />
                  )}
                  <Input
                    ref={searchInputRef}
                    id="student-search"
                    placeholder="Enter admission number or student name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyPress={handleKeyPress}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    className="pl-9 pr-9 h-12"
                    disabled={isSearching}
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
                    >
                      {isLoadingSuggestions ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                          <span className="text-sm text-muted-foreground">Searching...</span>
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div className="py-1">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={`${suggestion.enrollment_id}-${index}`}
                              type="button"
                              onClick={() => handleSuggestionSelect(suggestion)}
                              className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-3 cursor-pointer"
                            >
                              <User className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium text-sm truncate">{suggestion.student_name}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {suggestion.admission_no}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => {
                    setShowSuggestions(false);
                    void handleSearch();
                  }}
                  disabled={isSearching || !searchQuery.trim()}
                  size="lg"
                  className="h-12 px-6"
                >
                  {isSearching ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
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
              const expectedPayments = studentDetails.transportSummary?.expected_payments 
                ?? studentDetails.transportExpectedPayments?.expected_payments 
                ?? [];
              
              const unpaidTransportPayments = expectedPayments.filter(
                p => p.payment_status === 'UNPAID' || p.payment_status === 'PENDING'
              );
              const hasPendingTransportMonths = studentDetails.transportSummary?.months_pending_count 
                ? studentDetails.transportSummary.months_pending_count > 0 
                : false;
              
              // Has outstanding if total > 0 OR if there are unpaid transport payments
              const hasOutstanding = totalOutstanding > 0 || unpaidTransportPayments.length > 0 || hasPendingTransportMonths;
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
                              <div className="flex gap-2 items-center">
                                <Badge variant="outline">
                                  {studentDetails.enrollment.group_name || "N/A"}
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
                                if (studentDetails.transportSummary && studentDetails.transportSummary.total_amount_pending !== undefined && studentDetails.transportSummary.total_amount_pending !== null) {
                                  transportOutstanding = typeof studentDetails.transportSummary.total_amount_pending === 'string'
                                    ? parseFloat(studentDetails.transportSummary.total_amount_pending) || 0
                                    : (studentDetails.transportSummary.total_amount_pending || 0);
                                }
                                
                                // Get expected payments from transportSummary (primary) or transportExpectedPayments (fallback)
                                const expectedPayments = studentDetails.transportSummary?.expected_payments 
                                  ?? studentDetails.transportExpectedPayments?.expected_payments 
                                  ?? [];
                                
                                // Get unpaid expected payments
                                const unpaidPayments = expectedPayments.filter(
                                  p => p.payment_status === 'UNPAID' || p.payment_status === 'PENDING'
                                );
                                
                                // Check if there are pending months from summary
                                const hasPendingMonths = studentDetails.transportSummary?.months_pending_count 
                                  ? studentDetails.transportSummary.months_pending_count > 0 
                                  : false;
                                
                                // If total_amount_pending is 0 but there are unpaid expected payments or pending months, calculate from expected_payments
                                if (transportOutstanding === 0 && (hasPendingMonths || unpaidPayments.length > 0)) {
                                  if (unpaidPayments.length > 0) {
                                    const calculatedOutstanding = unpaidPayments.reduce((sum, payment) => {
                                      // payment_amount might be on the payment object (from transportSummary) or might not exist
                                      const paymentAmount = 'payment_amount' in payment ? payment.payment_amount : undefined;
                                      const amount = paymentAmount !== undefined
                                        ? (typeof paymentAmount === 'string'
                                            ? parseFloat(paymentAmount) || 0
                                            : (paymentAmount || 0))
                                        : 0;
                                      return sum + amount;
                                    }, 0);
                                    
                                    if (calculatedOutstanding > 0) {
                                      transportOutstanding = calculatedOutstanding;
                                    }
                                  }
                                }
                                
                                // Show outstanding if amount > 0 OR if there are unpaid payments (even if amount is 0, there might be fees due)
                                const hasOutstanding = transportOutstanding > 0 || unpaidPayments.length > 0 || hasPendingMonths;
                                
                                return hasOutstanding ? (
                                  <>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">
                                        Total Outstanding
                                      </span>
                                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {transportOutstanding > 0 
                                          ? formatCurrency(transportOutstanding)
                                          : unpaidPayments.length > 0 || hasPendingMonths
                                            ? `₹0.00 (${unpaidPayments.length > 0 ? unpaidPayments.length : 'Pending'} unpaid month${(unpaidPayments.length > 0 ? unpaidPayments.length : 1) !== 1 ? 's' : ''})`
                                            : formatCurrency(0)}
                                      </span>
                                    </div>
                                    {transportOutstanding === 0 && (unpaidPayments.length > 0 || hasPendingMonths) && (
                                      <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                                        ⚠️ Payment amounts not calculated yet. Please contact admin to configure monthly fee amounts.
                                      </div>
                                    )}
                                    {(() => {
                                      return unpaidPayments.length > 0 || hasPendingMonths ? (
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
                                                const date = new Date(payment.expected_payment_month);
                                                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                              })
                                              .join(', ')}
                                            {unpaidPayments.length > 3 && '...'}
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

    </div>
  );
};
