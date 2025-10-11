import { useState } from "react";
import { motion } from "framer-motion";
import { CollectFeeSearch } from "./CollectFeeSearch";
import { CollectFeeForm } from "./CollectFeeForm";

interface StudentFeeDetails {
  student: any;
  tuitionBalance: any;
  transportBalance: any;
}

export const CollectFee = () => {
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeDetails | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleStudentSelected = (studentDetails: StudentFeeDetails) => {
    setSelectedStudent(studentDetails);
    setIsFormOpen(true);
  };

  const handlePaymentComplete = () => {
    // Refresh data or show success message
    setSelectedStudent(null);
    setIsFormOpen(false);
  };

  const handleFormClose = () => {
    setSelectedStudent(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collect Fee</h1>
          <p className="text-muted-foreground">
            Search for students and collect fee payments with receipt generation
          </p>
        </div>
      </motion.div>

      <CollectFeeSearch onStudentSelected={handleStudentSelected} />

      <CollectFeeForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        selectedStudent={selectedStudent}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};
