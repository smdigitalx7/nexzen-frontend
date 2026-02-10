import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CreditCard, User, Search, ArrowRight } from "lucide-react";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Card, CardContent } from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { formatCurrency } from "@/common/utils";
import { EnrollmentsService } from "@/features/school/services/enrollments.service";
import { SchoolTuitionFeeBalancesService, SchoolTransportFeeBalancesService } from "@/features/school/services";
import { SchoolClassDropdown, SchoolSectionDropdown } from "@/common/components/shared/Dropdowns";
import { useToast } from "@/common/hooks/use-toast";
import { useDebounce } from "@/common/hooks/useDebounce";
import type { SchoolEnrollmentWithStudentDetails } from "@/features/school/types/enrollments";

interface StudentFeeDetails {
  enrollment: SchoolEnrollmentWithStudentDetails;
  tuitionBalance: any;
  transportBalance: any;
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
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ enrollment: SchoolEnrollmentWithStudentDetails }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle class change - reset section and clear results
  const handleClassChange = useCallback((value: number | null) => {
    setSelectedClassId(value);
    setSelectedSectionId(null);
    setSearchResults([]);
    setSearchQuery("");
  }, [setSearchResults, setSearchQuery]);

  // Handle section change - clear results
  const handleSectionChange = useCallback((value: number | null) => {
    setSelectedSectionId(value);
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

      if (!selectedClassId) {
        toast({
          title: "Class Required",
          description: "Please select a class before searching.",
          variant: "destructive",
        });
        return;
      }

      setIsSearching(true);
      setSearchResults([]);

      try {
        // Use enrollments search API so both admission number and student name are supported
        const response = await EnrollmentsService.list({
          class_id: selectedClassId,
          section_id: selectedSectionId || undefined,
          page: 1,
          page_size: 10,
          search: trimmed,
        });

        const list = Array.isArray(response?.enrollments)
          ? response.enrollments
          : [];

        if (list.length === 0) {
          toast({
            title: "Student Not Found",
            description:
              "No student found with the provided admission number or name. Please try again.",
            variant: "destructive",
          });
          setSearchResults([]);
          return;
        }

        // Fetch fee balances for each enrollment in parallel
        const details = await Promise.all(
          list.slice(0, 10).map(async (e: any) => {
            const [tuitionBalance, transportBalance] = await Promise.all([
              SchoolTuitionFeeBalancesService.getById(e.enrollment_id).catch(
                () => null,
              ),
              SchoolTransportFeeBalancesService.getById(
                e.enrollment_id,
              ).catch(() => null),
            ]);

            return {
              enrollment: e as SchoolEnrollmentWithStudentDetails,
              tuitionBalance,
              transportBalance,
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
      selectedSectionId,
      setSearchResults,
      toast,
    ],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      void handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }, [handleSearch]);

  const matchesAdmission = useCallback((query: string) => {
    const q = query.toLowerCase();
    // Simple heuristic: if it contains digits or starts with common prefix
    return /[0-9]/.test(q) || q.startsWith('nzn');
  }, []);

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
        
        // Try exact match by name or admission number using list endpoint if class is selected
        if (selectedClassId && query.length >= 2) {
          try {
            const response = await EnrollmentsService.list({
              class_id: selectedClassId,
              section_id: selectedSectionId || undefined,
              page: 1,
              page_size: 10,
              search: query,
            });
            
            if (response?.enrollments && response.enrollments.length > 0) {
              const list = response.enrollments;
              const allSuggestions = list
                .slice(0, 10)
                .map((e: SchoolEnrollmentWithStudentDetails) => ({
                  enrollment: e
                }));
              setSuggestions(allSuggestions);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
            }
          } catch {
            setSuggestions([]);
          }
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    void fetchSuggestions();
  }, [debouncedSearchQuery, selectedClassId, selectedSectionId]);

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
  const handleSuggestionSelect = useCallback(async (suggestion: { enrollment: SchoolEnrollmentWithStudentDetails }) => {
    const e = suggestion.enrollment;
    
    // Set query to what makes sense (if it was an admission search, set to admission, else name)
    const isAdmission = matchesAdmission(searchQuery);
    setSearchQuery(isAdmission ? e.admission_no : e.student_name);
    setShowSuggestions(false);
    
    // Proceed directly: Fetch fee balances for THIS enrollment without another search list API call
    setIsSearching(true);
    try {
      const [tuitionBalance, transportBalance] = await Promise.all([
        SchoolTuitionFeeBalancesService.getById(e.enrollment_id).catch(() => null),
        SchoolTransportFeeBalancesService.getById(e.enrollment_id).catch(() => null),
      ]);

      const details: StudentFeeDetails = {
        enrollment: e,
        tuitionBalance,
        transportBalance,
      };

      setSearchResults([details]);
    } catch (error) {
      console.error("Balance fetch error:", error);
      toast({
        title: "Error",
        description: "Could not fetch fee details.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, matchesAdmission, setSearchQuery, setSearchResults, toast]);

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
        total +=
          Math.max(
            0,
            (transport.term1_amount || 0) - (transport.term1_paid || 0)
          ) +
          Math.max(
            0,
            (transport.term2_amount || 0) - (transport.term2_paid || 0)
          );
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
                <SchoolClassDropdown
                  id="class-select"
                  value={selectedClassId}
                  onChange={handleClassChange}
                  placeholder="Select class"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-select">Section Filter (Optional)</Label>
                <SchoolSectionDropdown
                  classId={selectedClassId || 0}
                  value={selectedSectionId}
                  onChange={handleSectionChange}
                  disabled={!selectedClassId}
                  placeholder={selectedClassId ? "All sections" : "Select class first"}
                  className="w-full"
                  emptyValue
                  emptyValueLabel="All Sections"
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-3.5 pointer-events-none z-10 text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              {isLoadingSuggestions && (
                <div className="absolute right-4 top-3.5 z-10">
                  <Loader.Button size="xs" />
                </div>
              )}
              <Input
                ref={searchInputRef}
                id="student-search"
                placeholder="Enter admission number (e.g. 2024001) or name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="pl-12 pr-10 h-12 text-lg shadow-sm"
                autoComplete="off"
                disabled={isSearching}
              />
              {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden ring-1 ring-black/5"
                >
                  {isLoadingSuggestions && (
                    <div className="flex items-center justify-center py-4">
                      <Loader.Data message="Searching..." />
                    </div>
                  )}
                  {!isLoadingSuggestions && suggestions.length > 0 && suggestions.map((s, i) => {
                    const e = s.enrollment;
                    const isAdmission = matchesAdmission(searchQuery);
                    return (
                      <button
                        key={`${e.enrollment_id}-${i}`}
                        type="button"
                        onClick={() => void handleSuggestionSelect(s)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors border-b last:border-0 border-gray-50 dark:border-slate-700"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {isAdmission ? e.admission_no : e.student_name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {isAdmission ? e.student_name : e.admission_no}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button
                  size="lg"
                  onClick={() => {
                    setShowSuggestions(false);
                    void handleSearch();
                  }}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-8 font-semibold"
                >
                  {isSearching ? "Searching..." : "Search Student"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result Card - same layout as College */}
        {searchResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {searchResults.map((details, i) => {
              const total = getTotalOutstanding(details);
              const classLabel =
                (details.enrollment as any).class_name || "—";
              const sectionLabel = (details.enrollment as any).section_name
                ? ` / ${(details.enrollment as any).section_name}`
                : "";
                      const isAdmissionHighlight = matchesAdmission(searchQuery);
                      return (
                        <div
                          key={details.enrollment.admission_no || i}
                          className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl border-4 border-white dark:border-slate-800 shadow-sm">
                                {details.enrollment.student_name.charAt(0)}
                              </div>
                              <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                  {isAdmissionHighlight ? details.enrollment.admission_no : details.enrollment.student_name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {isAdmissionHighlight ? details.enrollment.student_name : details.enrollment.admission_no} • {classLabel}
                                  {sectionLabel}
                                </p>
                              </div>
                            </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center sm:text-right">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Total Outstanding
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(total)}
                        </p>
                      </div>
                      <Button
                        size="lg"
                        className="h-12 px-6 gap-2 shadow-sm"
                        onClick={() => onStartPayment(details)}
                      >
                        <CreditCard className="h-4 w-4" />
                        Collect Fees
                        <ArrowRight className="h-4 w-4 opacity-50" />
                      </Button>
                    </div>
                  </div>
                  {total === 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 px-6 py-2 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-medium">
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
