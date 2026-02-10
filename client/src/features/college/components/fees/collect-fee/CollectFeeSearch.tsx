import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CreditCard, User, Search, ArrowRight } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Card, CardContent } from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { formatCurrency } from "@/common/utils";
import { CollegeEnrollmentsService, CollegeTuitionBalancesService, CollegeTransportBalancesService } from "@/features/college/services";
import { CollegeClassDropdown, CollegeGroupDropdown } from "@/common/components/shared/Dropdowns";
import { useToast } from "@/common/hooks/use-toast";
import { useDebounce } from "@/common/hooks/useDebounce";
import type { StudentFeeDetails } from "./CollectFee";

interface CollectFeeSearchProps {
  onStudentSelected: (studentDetails: StudentFeeDetails) => void;
  paymentMode: "single" | "multiple";
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
  const handleSearch = useCallback(
    async (query?: string) => {
      const searchTerm = query || searchQuery;
      const trimmed = searchTerm.trim();

      if (!trimmed) {
        toast({
          title: "Search Required",
          description:
            "Please enter a student admission number or name to search.",
          variant: "destructive",
        });
        return;
      }

      if (!selectedClassId || !selectedGroupId) {
        toast({
          title: "Class & Group Required",
          description: "Please select both class and group before searching.",
          variant: "destructive",
        });
        return;
      }

      setIsSearching(true);
      setSearchResults([]);

      try {
        // Use enrollments list with search so both admission no and student name are supported
        const response = await CollegeEnrollmentsService.list({
          class_id: selectedClassId,
          group_id: selectedGroupId,
          page: 1,
          pageSize: 10,
          search: trimmed,
        });

        const list = Array.isArray(response?.enrollments)
          ? response.enrollments
          : [];

        if (list.length === 0) {
          toast({
            title: "Student Not Found",
            description:
              "No student found with the provided admission number or name.",
            variant: "default",
          });
          setSearchResults([]);
          return;
        }

        const details = await Promise.all(
          list.slice(0, 10).map(async (e: any) => {
            const [
              tuitionBalance,
              transportSummary,
              transportExpectedPayments,
            ] = await Promise.all([
              CollegeTuitionBalancesService.getById(
                e.enrollment_id,
              ).catch(() => null),
              CollegeTransportBalancesService.getStudentTransportPaymentSummaryByEnrollmentId(
                e.enrollment_id,
              ).catch(() => null),
              CollegeTransportBalancesService.getExpectedTransportPaymentsByEnrollmentId(
                e.enrollment_id,
              ).catch(() => undefined),
            ]);

            return {
              enrollment: e,
              tuitionBalance,
              transportSummary,
              transportExpectedPayments,
              transportBalance: transportSummary ?? null,
            } as StudentFeeDetails;
          }),
        );

        setSearchResults(details);
      } catch (error) {
        console.error("Search error:", error);
        toast({
          title: "Search Failed",
          description:
            "Unable to search enrollments. Please try again or contact support.",
          variant: "destructive",
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [
      searchQuery,
      selectedClassId,
      selectedGroupId,
      setSearchResults,
      toast,
    ],
  );


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

        // If class_id is selected, use list endpoint with search filter
        if (selectedClassId && selectedGroupId && query.length >= 2) {
            const response = await CollegeEnrollmentsService.list({
              class_id: selectedClassId,
              group_id: selectedGroupId,
              page: 1,
              pageSize: 10,
              search: query,
            });

            if (response?.enrollments && response.enrollments.length > 0) {
              const list = response.enrollments;
              const allSuggestions = (Array.isArray(list) ? list : [])
                .filter((e: any) => {
                  const matchesAdmission = e.admission_no?.toLowerCase().includes(query.toLowerCase());
                  const matchesName = e.student_name?.toLowerCase().includes(query.toLowerCase());
                  return matchesAdmission || matchesName;
                })
                .slice(0, 5)
                .map((e: any) => ({
                  admission_no: e.admission_no,
                  student_name: e.student_name,
                  enrollment_id: e.enrollment_id,
                }));
              setSuggestions(allSuggestions);
              setShowSuggestions(true);
              return;
            }
        }

        // Try exact match by admission number (works for any length >= 3)
        if (query.length >= 3) {
            const enrollment = await CollegeEnrollmentsService.getByAdmission(query);
            setSuggestions([{
              admission_no: enrollment.admission_no,
              student_name: enrollment.student_name,
              enrollment_id: enrollment.enrollment_id,
            }]);
            setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    void fetchSuggestions();
  }, [debouncedSearchQuery, selectedClassId, selectedGroupId]);

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
    void handleSearch(suggestion.admission_no);
  }, [setSearchQuery, handleSearch]);

  const getTotalOutstanding = useCallback(
    (studentDetails: StudentFeeDetails) => {
      let total = 0;

      if (studentDetails.tuitionBalance) {
        const tuition = studentDetails.tuitionBalance;
        total +=
          Math.max(0, (tuition.book_fee || 0) - (tuition.book_paid || 0)) +
          Math.max(0, (tuition.term1_amount || 0) - (tuition.term1_paid || 0)) +
          Math.max(0, (tuition.term2_amount || 0) - (tuition.term2_paid || 0)) +
          Math.max(0, (tuition.term3_amount || 0) - (tuition.term3_paid || 0));
      }

      if (studentDetails.transportBalance) {
        const transport = studentDetails.transportBalance;
        const pending = typeof transport.total_amount_pending === "string" ? Number(transport.total_amount_pending) : (transport.total_amount_pending ?? 0);
        total += Number.isFinite(pending) ? Math.max(0, pending) : 0;
      }

      return total;
    },
    []
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-4xl mx-auto w-full px-4">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Collect Fees</h1>
            <p className="text-lg text-muted-foreground">Search for a student to view details and collect payments.</p>
        </div>

        <Card className="border-0 shadow-lg ring-1 ring-gray-200 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="class-select">Class *</Label>
                  <CollegeClassDropdown
                    id="class-select"
                    value={selectedClassId}
                    onChange={handleClassChange}
                    placeholder="Select class"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-select">Group *</Label>
                  <CollegeGroupDropdown
                    id="group-select"
                    classId={selectedClassId || 0}
                    value={selectedGroupId}
                    onChange={handleGroupChange}
                    disabled={!selectedClassId}
                    placeholder={selectedClassId ? "Select group" : "Select class first"}
                    className="w-full"
                  />
                </div>
             </div>

             <div className="relative">
                <div className="absolute left-4 top-3.5 pointer-events-none z-10 text-muted-foreground">
                    <Search className="h-5 w-5" />
                </div>
                <Input
                     ref={searchInputRef}
                     id="student-search"
                     placeholder="Enter admission number (e.g. 2024001) or name..."
                     value={searchQuery}
                     onChange={(e) => {
                       setSearchQuery(e.target.value);
                       setShowSuggestions(true);
                     }}
                     onKeyPress={handleKeyPress}
                     className="pl-12 h-12 text-lg shadow-sm"
                     autoComplete="off"
                     disabled={isSearching}
                />
                 {showSuggestions && suggestions.length > 0 && (
                     <div ref={suggestionsRef} className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden ring-1 ring-black/5">
                        {suggestions.map((s, i) => (
                           <button
                              key={i}
                              onClick={() => handleSuggestionSelect(s)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-b last:border-0 border-gray-50"
                           >
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                  <User className="h-4 w-4" />
                              </div>
                              <div>
                                  <div className="font-medium text-gray-900">{s.student_name}</div>
                                  <div className="text-xs text-muted-foreground font-mono">{s.admission_no}</div>
                              </div>
                           </button>
                        ))}
                     </div>
                 )}
                 <div className="mt-4 flex justify-end">
                      <Button size="lg" onClick={() => handleSearch()} disabled={isSearching || !searchQuery.trim()} className="px-8 font-semibold">
                          {isSearching ? "Searching..." : "Search Student"}
                      </Button>
                 </div>
             </div>
          </CardContent>
        </Card>

        {/* Result Card */}
        {searchResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             {searchResults.map((details, i) => {
                 const total = getTotalOutstanding(details);
                 return (
                     <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                              <div className="flex items-center gap-4">
                                  <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl border-4 border-white shadow-sm">
                                      {details.enrollment.student_name.charAt(0)}
                                  </div>
                                  <div className="text-center sm:text-left">
                                      <h3 className="text-xl font-bold text-gray-900">{details.enrollment.student_name}</h3>
                                      <p className="text-sm text-gray-500">{details.enrollment.admission_no} • {details.enrollment.class_name}</p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-6">
                                  <div className="text-center sm:text-right">
                                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Outstanding</p>
                                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
                                  </div>
                                  <Button size="lg" className="h-12 px-6 gap-2 shadow-sm" onClick={() => onStartPayment(details)}>
                                      <CreditCard className="h-4 w-4" />
                                      Collect Fees
                                      <ArrowRight className="h-4 w-4 opacity-50" />
                                  </Button>
                              </div>
                          </div>
                          {total === 0 && (
                              <div className="bg-green-50 px-6 py-2 flex items-center gap-2 text-green-700 text-sm font-medium">
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                                  All fees paid! You can still review details or collect extra fees.
                              </div>
                          )}
                     </div>
                 );
             })}
          </motion.div>
        )}
      </div>
    </div>
  );
};
