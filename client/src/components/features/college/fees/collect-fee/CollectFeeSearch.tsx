import { useState } from "react";
import { motion } from "framer-motion";
import { Search, User, GraduationCap, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CollegeStudentsService } from "@/lib/services/college/students.service";
import { CollegeTuitionBalancesService } from "@/lib/services/college/tuition-fee-balances.service";
import { CollegeTransportBalancesService } from "@/lib/services/college/transport-fee-balances.service";

interface StudentFeeDetails {
  student: any;
  tuitionBalance: any;
  transportBalance: any;
}

interface CollectFeeSearchProps {
  onStudentSelected: (studentDetails: StudentFeeDetails) => void;
}

export const CollectFeeSearch = ({ onStudentSelected }: CollectFeeSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<StudentFeeDetails[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeDetails | null>(null);

  // Direct service calls for search functionality

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let student = null;
      
      // First try to search by admission number
      try {
        student = await CollegeStudentsService.getByAdmission(searchQuery);
      } catch (error) {
        // If admission search fails, try searching by name
        console.log("Admission search failed, trying name search...");
        const studentsList = await CollegeStudentsService.list({ page: 1, pageSize: 100 });
        const matchingStudents = studentsList.data?.filter((s: any) => 
          s.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (matchingStudents && matchingStudents.length > 0) {
          if (matchingStudents.length === 1) {
            student = matchingStudents[0]; // Take the first match if only one
          } else {
            // If multiple matches, show all and let user select
            const studentDetailsList = await Promise.all(
              matchingStudents.map(async (s: any) => {
                const [tuitionBalance, transportBalance] = await Promise.all([
                  CollegeTuitionBalancesService.getByAdmissionNo(s.admission_no).catch(() => null),
                  Promise.resolve(null)
                ]);
                return {
                  student: s,
                  tuitionBalance,
                  transportBalance
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
        // Get fee balances for this student
        const [tuitionBalance, transportBalance] = await Promise.all([
          CollegeTuitionBalancesService.getByAdmissionNo(student.admission_no).catch(() => null),
          // Note: College transport service doesn't have getByAdmissionNo method
          // We'll need to implement this or use a different approach
          Promise.resolve(null)
        ]);

        const studentDetails: StudentFeeDetails = {
          student,
          tuitionBalance,
          transportBalance
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getTotalOutstanding = (studentDetails: StudentFeeDetails) => {
    let total = 0;
    
    if (studentDetails.tuitionBalance) {
      const tuition = studentDetails.tuitionBalance;
      total += Math.max(0, (tuition.book_fee || 0) - (tuition.book_paid || 0)) + 
               Math.max(0, (tuition.term1_amount || 0) - (tuition.term1_paid || 0)) +
               Math.max(0, (tuition.term2_amount || 0) - (tuition.term2_paid || 0)) +
               Math.max(0, (tuition.term3_amount || 0) - (tuition.term3_paid || 0));
    }
    
    if (studentDetails.transportBalance) {
      const transport = studentDetails.transportBalance;
      total += Math.max(0, (transport.term1_amount || 0) - (transport.term1_paid || 0)) +
               Math.max(0, (transport.term2_amount || 0) - (transport.term2_paid || 0));
    }
    
    return total;
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Student for Fee Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter admission number or student name to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {searchResults.map((studentDetails, index) => (
            <Card key={index} className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold">{studentDetails.student.student_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Admission No: {studentDetails.student.admission_no}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Outstanding: {formatCurrency(getTotalOutstanding(studentDetails))}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Student Information</h4>
                    <div className="space-y-1">
                      <p><span className="font-medium">Name:</span> {studentDetails.student.student_name}</p>
                      <p><span className="font-medium">Admission No:</span> {studentDetails.student.admission_no}</p>
                      <p><span className="font-medium">Class:</span> {studentDetails.student.class_name || "N/A"}</p>
                      <p><span className="font-medium">Gender:</span> {studentDetails.student.gender || "N/A"}</p>
                    </div>
                  </div>

                  {/* Fee Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Fee Details</h4>
                    <div className="space-y-1">
                      {studentDetails.tuitionBalance && (
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Tuition Fees:</p>
                          <div className="pl-2 space-y-1 text-sm">
                            <p>Book Fee: {formatCurrency(Math.max(0, (studentDetails.tuitionBalance.book_fee || 0) - (studentDetails.tuitionBalance.book_paid || 0)))}</p>
                            <p>Term 1: {formatCurrency(Math.max(0, (studentDetails.tuitionBalance.term1_amount || 0) - (studentDetails.tuitionBalance.term1_paid || 0)))}</p>
                            <p>Term 2: {formatCurrency(Math.max(0, (studentDetails.tuitionBalance.term2_amount || 0) - (studentDetails.tuitionBalance.term2_paid || 0)))}</p>
                            <p>Term 3: {formatCurrency(Math.max(0, (studentDetails.tuitionBalance.term3_amount || 0) - (studentDetails.tuitionBalance.term3_paid || 0)))}</p>
                          </div>
                        </div>
                      )}
                      {studentDetails.transportBalance ? (
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Transport Fees:</p>
                          <div className="pl-2 space-y-1 text-sm">
                            <p>Term 1: {formatCurrency(Math.max(0, (studentDetails.transportBalance.term1_amount || 0) - (studentDetails.transportBalance.term1_paid || 0)))}</p>
                            <p>Term 2: {formatCurrency(Math.max(0, (studentDetails.transportBalance.term2_amount || 0) - (studentDetails.transportBalance.term2_paid || 0)))}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-medium text-sm text-muted-foreground">Transport Fees:</p>
                          <p className="text-sm text-muted-foreground">No transport fees assigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={() => onStudentSelected(studentDetails)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Collect Fee - {formatCurrency(getTotalOutstanding(studentDetails))}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
