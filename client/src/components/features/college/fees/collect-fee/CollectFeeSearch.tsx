import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, User, GraduationCap, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CollegeStudentsService } from "@/lib/services/college/students.service";
import { CollegeTuitionBalancesService } from "@/lib/services/college/tuition-fee-balances.service";
import { Api } from "@/lib/api";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import type { ColumnDef } from "@tanstack/react-table";

interface StudentFeeDetails {
  student: any;
  tuitionBalance: any;
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

export const CollectFeeSearch = ({ onStudentSelected, paymentMode, onStartPayment, searchResults, setSearchResults, searchQuery, setSearchQuery }: CollectFeeSearchProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeDetails | null>(null);

  // Direct service calls for search functionality

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Clear previous results immediately for fresh search
    setSearchResults([]);
    setSelectedStudent(null);
    setIsSearching(true);
    
    try {
      const trimmedQuery = searchQuery.trim();
      let student = null;
      
      // First try to search by admission number
      try {
        // Always make a fresh API call - bypass cache
        student = await Api.get<typeof student>(
          `/college/students/by-admission/${trimmedQuery}`,
          { _t: Date.now() }, // Cache-busting timestamp
          undefined,
          { cache: false, dedupe: false } // Disable cache and deduplication
        );
      } catch (error) {
        // If admission search fails, try searching by name
        console.log("Admission search failed, trying name search...");
        const studentsList = await CollegeStudentsService.list({ page: 1, pageSize: 100 });
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
                const tuitionBalance = await Api.get(
                  `/college/tuition-fee-balances/by-admission-no/${s.admission_no}`,
                  { _t: Date.now() },
                  undefined,
                  { cache: false, dedupe: false }
                ).catch(() => null);
                return {
                  student: s,
                  tuitionBalance
                };
              })
            );
            setSearchResults(studentDetailsList);
            setSelectedStudent(null);
            return;
          }
        }
      }
      
      if (student) {
        // Always fetch fresh fee balances for this student - bypass cache
        const tuitionBalance = await Api.get(
          `/college/tuition-fee-balances/by-admission-no/${student.admission_no}`,
          { _t: Date.now() },
          undefined,
          { cache: false, dedupe: false }
        ).catch(() => null);

        const studentDetails: StudentFeeDetails = {
          student,
          tuitionBalance
        };

        setSearchResults([studentDetails]);
        setSelectedStudent(studentDetails);
      } else {
        setSearchResults([]);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSelectedStudent(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      handleSearch();
    }
  };

  const getTotalOutstanding = useCallback((studentDetails: StudentFeeDetails) => {
    let total = 0;
    
    if (studentDetails.tuitionBalance) {
      const tuition = studentDetails.tuitionBalance;
      total += Math.max(0, (tuition.book_fee || 0) - (tuition.book_paid || 0)) + 
               Math.max(0, (tuition.term1_amount || 0) - (tuition.term1_paid || 0)) +
               Math.max(0, (tuition.term2_amount || 0) - (tuition.term2_paid || 0)) +
               Math.max(0, (tuition.term3_amount || 0) - (tuition.term3_paid || 0));
    }
    
    return total;
  }, []);

  // Define table columns
  const columns = useMemo<ColumnDef<StudentFeeDetails>[]>(() => [
    {
      accessorKey: "student.admission_no",
      header: "Admission No",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.student.admission_no}</div>
      ),
    },
    {
      accessorKey: "student.student_name",
      header: "Student Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.student.student_name}</span>
      ),
    },
    {
      accessorKey: "student.class_name",
      header: "Class",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.student.class_name || "N/A"}
        </Badge>
      ),
    },
    {
      accessorKey: "student.group_name",
      header: "Group",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.student.group_name || "N/A"}
        </Badge>
      ),
    },
    {
      accessorKey: "student.gender",
      header: "Gender",
      cell: ({ row }) => row.original.student.gender || "N/A",
    },
    {
      id: "tuition_outstanding",
      header: "Tuition Outstanding",
      cell: ({ row }) => {
        const tuition = row.original.tuitionBalance;
        if (!tuition) return formatCurrency(0);
        
        const bookOutstanding = Math.max(0, (tuition.book_fee || 0) - (tuition.book_paid || 0));
        const term1Outstanding = Math.max(0, (tuition.term1_amount || 0) - (tuition.term1_paid || 0));
        const term2Outstanding = Math.max(0, (tuition.term2_amount || 0) - (tuition.term2_paid || 0));
        const term3Outstanding = Math.max(0, (tuition.term3_amount || 0) - (tuition.term3_paid || 0));
        const total = bookOutstanding + term1Outstanding + term2Outstanding + term3Outstanding;
        
        return (
          <div className="text-right">
            <div className="font-medium">{formatCurrency(total)}</div>
            <div className="text-xs text-muted-foreground space-x-1">
              {bookOutstanding > 0 && <span>Book: {formatCurrency(bookOutstanding)}</span>}
              {term1Outstanding > 0 && <span>T1: {formatCurrency(term1Outstanding)}</span>}
              {term2Outstanding > 0 && <span>T2: {formatCurrency(term2Outstanding)}</span>}
              {term3Outstanding > 0 && <span>T3: {formatCurrency(term3Outstanding)}</span>}
            </div>
          </div>
        );
      },
    },
    {
      id: "total_outstanding",
      header: "Total Outstanding",
      cell: ({ row }) => {
        const total = getTotalOutstanding(row.original);
        return (
          <div className="text-right font-semibold text-green-600">
            {formatCurrency(total)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const totalOutstanding = getTotalOutstanding(row.original);
        const hasOutstanding = totalOutstanding > 0;
        
        return (
          <Button 
            onClick={() => onStartPayment(row.original)}
            size="sm"
            disabled={!hasOutstanding}
            className={hasOutstanding 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
            }
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Collect Fee
          </Button>
        );
      },
    },
  ], [onStartPayment, getTotalOutstanding]);

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={() => {
                  // Force fresh search even if same query
                  handleSearch();
                }} 
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Press Enter to search or click the Search button
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search Results - Enhanced Data Table */}
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <EnhancedDataTable
            data={searchResults}
            columns={columns}
            title="Student Fee Collection"
            searchKey="student"
            searchPlaceholder="Search by student name or admission number..."
            exportable={true}
            showSearch={true}
            className="border rounded-lg"
            loading={isSearching}
          />
        </motion.div>
      )}

      {/* No Results */}
      {searchResults.length === 0 && searchQuery && !isSearching && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No student found</h3>
            <p className="text-muted-foreground">
              No student found with admission number or name "{searchQuery}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
