import { useState } from "react";
import { CumulativeReportList } from "./CumulativeReportList";
import { CumulativeReportPage } from "./CumulativeReportPage";

export const CumulativeReportManager = () => {
  const [selectedStudent, setSelectedStudent] = useState<{ id: number; name: string } | null>(null);

  const handleSelectStudent = (enrollmentId: number, studentName: string) => {
    setSelectedStudent({ id: enrollmentId, name: studentName });
  };

  const handleBack = () => {
    setSelectedStudent(null);
  };

  if (selectedStudent) {
    return (
      <CumulativeReportPage
        enrollmentId={selectedStudent.id}
        studentName={selectedStudent.name}
        onBack={handleBack}
      />
    );
  }

  return <CumulativeReportList onSelectStudent={handleSelectStudent} />;
};
