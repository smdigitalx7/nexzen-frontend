import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  CreditCard,
  User,
  GraduationCap,
  Users,
  BookOpen,
  Bus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Api } from "@/lib/api";
import { SchoolStudentsService } from "@/lib/services/school";

interface StudentFeeDetails {
  student: any;
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
      let student = null;

      // First try to search by admission number
      try {
        // Always make a fresh API call - bypass cache
        student = await Api.get<typeof student>(
          `/school/students/admission-no/${trimmedQuery}`,
          { _t: Date.now() }, // Cache-busting timestamp
          undefined,
          { cache: false, dedupe: false } // Disable cache and deduplication
        );
      } catch (error) {
        // If admission search fails, try searching by name
        if (import.meta.env.DEV) {
          console.log("Admission search failed, trying name search...");
        }
        const studentsList = await SchoolStudentsService.list({
          page: 1,
          page_size: 100,
        });
        const matchingStudents = studentsList.data?.filter((s: any) =>
          s.student_name?.toLowerCase().includes(trimmedQuery.toLowerCase())
        );

        if (matchingStudents && matchingStudents.length > 0) {
          if (matchingStudents.length === 1) {
            student = matchingStudents[0]; // Take the first match if only one
          } else {
            // If multiple matches, show all and let user select
            const studentDetailsList = await Promise.all(
              matchingStudents.map(async (s: any) => {
                // Always fetch fresh fee balance data - bypass cache
                const [tuitionBalance, transportBalance] = await Promise.all([
                  Api.get(
                    `/school/tuition-fee-balances/by-admission/${s.admission_no}`,
                    { _t: Date.now() },
                    undefined,
                    { cache: false, dedupe: false }
                  ).catch(() => null),
                  Api.get(
                    `/school/transport-fee-balances/by-admission/${s.admission_no}`,
                    { _t: Date.now() },
                    undefined,
                    { cache: false, dedupe: false }
                  ).catch(() => null),
                ]);
                return {
                  student: s,
                  tuitionBalance,
                  transportBalance,
                };
              })
            );
            setSearchResults(studentDetailsList);
            return;
          }
        }
      }

      if (student) {
        // Always fetch fresh fee balances for this student - bypass cache
        const [tuitionBalance, transportBalance] = await Promise.all([
          Api.get(
            `/school/tuition-fee-balances/by-admission/${student.admission_no}`,
            { _t: Date.now() },
            undefined,
            { cache: false, dedupe: false }
          ).catch(() => null),
          Api.get(
            `/school/transport-fee-balances/by-admission/${student.admission_no}`,
            { _t: Date.now() },
            undefined,
            { cache: false, dedupe: false }
          ).catch(() => null),
        ]);

        const studentDetails: StudentFeeDetails = {
          student,
          tuitionBalance,
          transportBalance,
        };

        setSearchResults([studentDetails]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Search error:", error);
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      await handleSearch();
    }
  };

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

  // Helper function to calculate transport outstanding breakdown
  const getTransportOutstanding = useCallback(
    (studentDetails: StudentFeeDetails) => {
      const transport = studentDetails.transportBalance;
      if (!transport) return { total: 0, breakdown: [] };

      const term1Outstanding = Math.max(
        0,
        (transport.term1_amount || 0) - (transport.term1_paid || 0)
      );
      const term2Outstanding = Math.max(
        0,
        (transport.term2_amount || 0) - (transport.term2_paid || 0)
      );

      const breakdown = [
        { label: "Term 1", amount: term1Outstanding },
        { label: "Term 2", amount: term2Outstanding },
      ].filter((item) => item.amount > 0);

      return {
        total: term1Outstanding + term2Outstanding,
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
                  onKeyDown={(e) => {
                    void handleKeyDown(e);
                  }}
                  className="w-full h-12  "
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
              const hasOutstanding = totalOutstanding > 0;
              const tuitionOutstanding = getTuitionOutstanding(studentDetails);
              const transportOutstanding =
                getTransportOutstanding(studentDetails);

              return (
                <motion.div
                  key={studentDetails.student.admission_no || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Student Information Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Admission No
                              </p>
                              <p className="font-semibold">
                                {studentDetails.student.admission_no}
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
                                {studentDetails.student.student_name}
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
                              <div className="flex gap-2 items-center">
                                <Badge variant="outline">
                                  {studentDetails.tuitionBalance?.class_name ||
                                    "N/A"}
                                </Badge>
                                {studentDetails.tuitionBalance
                                  ?.section_name && (
                                  <Badge variant="outline">
                                    {studentDetails.tuitionBalance.section_name}
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
                                Gender
                              </p>
                              <p className="font-semibold">
                                {studentDetails.student.gender || "N/A"}
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

                          {/* Transport Fee Card */}
                          <Card className="border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                <Bus className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <CardTitle className="text-lg">
                                  Transport Fee
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                  Total Outstanding
                                </span>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(transportOutstanding.total)}
                                </span>
                              </div>
                              {transportOutstanding.breakdown.length > 0 && (
                                <div className="space-y-2 pt-2 border-t">
                                  {transportOutstanding.breakdown.map(
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
                              {transportOutstanding.total === 0 && (
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                  All fees paid
                                </p>
                              )}
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
