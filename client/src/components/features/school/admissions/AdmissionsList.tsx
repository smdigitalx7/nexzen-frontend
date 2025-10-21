import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  FileSpreadsheet,
  FileText,
  Eye,
  Download,
  GraduationCap,
} from "lucide-react";
import {
  useSchoolAdmissions,
  useSchoolAdmissionById,
} from "@/lib/hooks/school/use-school-admissions";
import { toast } from "@/hooks/use-toast";
import {
  exportAdmissionsToExcel,
  exportSingleAdmissionToExcel,
  exportAdmissionFormToPDF,
} from "@/lib/utils/admissionsExport";
import type { SchoolAdmissionDetails } from "@/lib/types/school/admissions";

const AdmissionsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: admissions = [], isLoading } = useSchoolAdmissions();
  const { data: selectedAdmission } = useSchoolAdmissionById(selectedStudentId);

  // Filter admissions based on search term
  const filteredAdmissions = useMemo(() => {
    if (!searchTerm.trim()) return admissions;

    return admissions.filter(
      (admission) =>
        admission.student_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        admission.admission_no
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        admission.student_id?.toString().includes(searchTerm)
    );
  }, [admissions, searchTerm]);

  const handleViewDetails = async (studentId: number) => {
    setSelectedStudentId(studentId);
    setShowDetailsDialog(true);
  };

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      await exportAdmissionsToExcel(admissions, "School_Admissions");
      toast({
        title: "Export Successful",
        description: `Exported ${admissions.length} admissions to Excel`,
      });
    } catch (error: any) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: error?.message || "Failed to export admissions to Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSingle = async (admission: SchoolAdmissionDetails) => {
    try {
      await exportSingleAdmissionToExcel(admission);
      toast({
        title: "Export Successful",
        description: `Exported admission ${admission.admission_no} to Excel`,
      });
    } catch (error: any) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: error?.message || "Failed to export admission to Excel",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async (admission: SchoolAdmissionDetails) => {
    try {
      await exportAdmissionFormToPDF(admission);
      toast({
        title: "PDF Generated",
        description: `Admission form for ${admission.admission_no} downloaded`,
      });
    } catch (error: any) {
      console.error("PDF export failed:", error);
      toast({
        title: "PDF Export Failed",
        description: error?.message || "Failed to generate admission form PDF",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === "PAID") return "secondary";
    if (status === "PENDING") return "default";
    return "destructive";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, admission number, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={handleExportAll}
          disabled={isExporting || admissions.length === 0}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export All to Excel"}
        </Button>
      </div>

      {/* Admissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Admissions ({filteredAdmissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Student ID</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Admission Fee</TableHead>
                  <TableHead>Tuition Fee</TableHead>
                  <TableHead>Transport Fee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? "No admissions found matching your search"
                            : "No admissions found"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmissions.map((admission, index) => (
                    <TableRow
                      key={`${admission.student_id}-${admission.admission_no}-${index}`}
                    >
                      <TableCell className="font-mono text-sm">
                        {admission.student_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {admission.admission_no}
                      </TableCell>
                      <TableCell>{admission.student_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{admission.class_name}</Badge>
                      </TableCell>
                      <TableCell>{admission.admission_date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(
                            admission.admission_fee_paid
                          )}
                        >
                          {admission.admission_fee_paid}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {admission.payable_tuition_fee}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {admission.payable_transport_fee}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleViewDetails(admission.student_id)
                          }
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Admission Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Admission Details</span>
              {selectedAdmission && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportSingle(selectedAdmission)}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Excel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleExportPDF(selectedAdmission)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Complete admission information for student
            </DialogDescription>
          </DialogHeader>

          {selectedAdmission && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Admission No
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedAdmission.admission_no}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Admission Date
                    </p>
                    <p className="font-semibold">
                      {selectedAdmission.admission_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Academic Year
                    </p>
                    <p className="font-semibold">
                      {selectedAdmission.academic_year}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="secondary" className="text-sm">
                      {selectedAdmission.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Student Name
                    </p>
                    <p className="font-medium">
                      {selectedAdmission.student_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{selectedAdmission.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="font-medium">{selectedAdmission.dob}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class</p>
                    <Badge variant="outline" className="text-sm">
                      {selectedAdmission.class_name}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Branch</p>
                    <p className="font-medium">
                      {selectedAdmission.branch_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Referred By</p>
                    <p className="font-medium">
                      {selectedAdmission.referred_by_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Parent/Guardian Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-600">
                      Father/Guardian
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {selectedAdmission.father_or_guardian_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Aadhar Number
                        </p>
                        <p className="font-mono text-sm">
                          {selectedAdmission.father_or_guardian_aadhar_no}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mobile</p>
                        <p className="font-medium">
                          {selectedAdmission.father_or_guardian_mobile}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Occupation
                        </p>
                        <p className="font-medium">
                          {selectedAdmission.father_or_guardian_occupation}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-pink-600">
                      Mother/Guardian
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {selectedAdmission.mother_or_guardian_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Aadhar Number
                        </p>
                        <p className="font-mono text-sm">
                          {selectedAdmission.mother_or_guardian_aadhar_no}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mobile</p>
                        <p className="font-medium">
                          {selectedAdmission.mother_or_guardian_mobile}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Occupation
                        </p>
                        <p className="font-medium">
                          {selectedAdmission.mother_or_guardian_occupation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Address Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Present Address
                    </p>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {selectedAdmission.present_address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Permanent Address
                    </p>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {selectedAdmission.permanent_address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fee Structure */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Fee Structure</h3>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-sm">
                          Fee Type
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">
                          Amount
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">
                          Concession
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">
                          Payable
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">Admission Fee</td>
                        <td className="text-right py-3 px-4">
                          ₹{selectedAdmission.admission_fee}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          -
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₹{selectedAdmission.admission_fee}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            variant={getStatusBadgeVariant(
                              selectedAdmission.admission_fee_paid
                            )}
                          >
                            {selectedAdmission.admission_fee_paid}
                          </Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">Tuition Fee</td>
                        <td className="text-right py-3 px-4">
                          ₹{selectedAdmission.tuition_fee}
                        </td>
                        <td className="text-right py-3 px-4">
                          {selectedAdmission.tuition_concession ? (
                            <span className="text-orange-600 font-semibold">
                              -₹{selectedAdmission.tuition_concession}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-blue-600">
                          ₹{selectedAdmission.payable_tuition_fee}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline">Pending</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium">Book Fee</td>
                        <td className="text-right py-3 px-4">
                          ₹{selectedAdmission.book_fee}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          -
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-purple-600">
                          ₹{selectedAdmission.book_fee}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="outline">Pending</Badge>
                        </td>
                      </tr>
                      {selectedAdmission.transport_required === "YES" && (
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-medium">
                            Transport Fee
                          </td>
                          <td className="text-right py-3 px-4">
                            ₹{selectedAdmission.transport_fee}
                          </td>
                          <td className="text-right py-3 px-4">
                            {selectedAdmission.transport_concession &&
                            selectedAdmission.transport_concession !==
                              "0.00" ? (
                              <span className="text-orange-600 font-semibold">
                                -₹{selectedAdmission.transport_concession}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-orange-600">
                            ₹{selectedAdmission.payable_transport_fee}
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="outline">Pending</Badge>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transport Information */}
              {selectedAdmission.transport_required === "YES" && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Transport Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Route</p>
                      <p className="font-medium">
                        {selectedAdmission.route_ || "Not Assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Distance Slab
                      </p>
                      <p className="font-medium">
                        {selectedAdmission.slab || "Not Assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Transport Required
                      </p>
                      <Badge variant="secondary">YES</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Siblings Information */}
              {selectedAdmission.siblings &&
                selectedAdmission.siblings.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Siblings Information
                    </h3>
                    <div className="space-y-3">
                      {selectedAdmission.siblings.map((sibling, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{sibling.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {sibling.class_name} • {sibling.where}
                            </p>
                          </div>
                          <Badge variant="outline">{sibling.gender}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedAdmission && handleExportSingle(selectedAdmission)
                  }
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Excel
                </Button>
                <Button
                  onClick={() =>
                    selectedAdmission && handleExportPDF(selectedAdmission)
                  }
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download Admission Form (PDF)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdmissionsList;
