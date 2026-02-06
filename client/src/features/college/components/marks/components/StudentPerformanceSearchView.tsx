import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Search, AlertCircle } from "lucide-react";
import { useCollegeEnrollmentByAdmission } from "@/features/college/hooks";
import { StudentPerformanceView } from "./StudentPerformanceView";

export const StudentPerformanceSearchView = () => {
  const [searchValue, setSearchValue] = useState("");
  const [admissionNo, setAdmissionNo] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: enrollmentData, isLoading, error } = useCollegeEnrollmentByAdmission(
    searchValue.trim() || null
  );

  const handleSearch = () => {
    if (enrollmentData?.admission_no) {
      setAdmissionNo(enrollmentData.admission_no);
      setIsDialogOpen(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section - same style as School */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Search className="h-5 w-5" />
            Search Student for Performance View
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full px-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Enter admission number to search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-12"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!searchValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap h-12 px-4"
              >
                <Search className="h-4 w-4 mr-1" />
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Press Enter to search or click the Search button
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to find enrollment. Please check the admission number.
          </AlertDescription>
        </Alert>
      )}

      {enrollmentData && !isDialogOpen && (
        <Alert>
          <AlertDescription>
            Found: {enrollmentData.student_name} (Roll: {enrollmentData.roll_number})
            <Button
              variant="ghost"
              className="ml-2 h-auto p-0 text-blue-600 hover:text-blue-700 hover:bg-transparent underline"
              onClick={handleSearch}
            >
              View Performance →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <StudentPerformanceView
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setAdmissionNo(null);
          }
        }}
        admissionNo={admissionNo}
      />
    </div>
  );
};
