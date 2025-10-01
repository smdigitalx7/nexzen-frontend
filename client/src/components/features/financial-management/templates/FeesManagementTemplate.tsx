import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeesManagement } from "@/lib/hooks/useFeesManagement";
import { FeeStatsCards } from "../components/FeeStatsCards";
import { FeeStructureTable } from "../components/FeeStructureTable";
import { StudentFeeBalancesTable } from "../components/StudentFeeBalancesTable";
import { PaymentCollectionForm } from "../components/PaymentCollectionForm";

export const FeesManagementTemplate = () => {
  const {
    // Data
    feeStructures,
    studentFeeBalances,
    filteredStudentBalances,
    totalOutstanding,
    totalCollected,
    collectionRate,
    currentBranch,
    
    // UI State
    activeTab,
    setActiveTab,
    isCollectOpen,
    setIsCollectOpen,
    showStudentPopup,
    setShowStudentPopup,
    
    // Form State
    selectedStudent,
    setSelectedStudent,
    collectTarget,
    setCollectTarget,
    
    // Business logic
    applyCollect,
    handleAddFeeStructure,
    exportBalancesCSV,
  } = useFeesManagement();

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setCollectTarget(student);
    setShowStudentPopup(true);
  };

  const handleCollectPayment = (amount: number, paymentMode: string) => {
    console.log(`Collecting ${amount} via ${paymentMode} from ${selectedStudent?.student_name}`);
    // Implement actual payment collection logic here
    applyCollect();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground">
            Comprehensive fee structure management and payment tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <DollarSign className="h-3 w-3" />
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* Fee Overview Cards */}
      <FeeStatsCards
        totalOutstanding={totalOutstanding}
        totalCollected={totalCollected}
        collectionRate={collectionRate}
        currentBranch={currentBranch ? { branch_name: currentBranch.branch_name } : undefined}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collect">Collect Fees</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="balances">Student Balances</TabsTrigger>
          <TabsTrigger value="transport">Transport Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="collect" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Fee Collection</h2>
                <p className="text-muted-foreground">
                  Collect payments from students
                </p>
              </div>
            </div>
            
            <StudentFeeBalancesTable
              studentBalances={filteredStudentBalances}
              onViewStudent={handleViewStudent}
              onExportCSV={exportBalancesCSV}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="structures" className="space-y-4">
          <FeeStructureTable
            feeStructures={feeStructures}
            onAddFeeStructure={handleAddFeeStructure}
            onEditFeeStructure={(id) => console.log('Edit fee structure:', id)}
            onDeleteFeeStructure={(id) => console.log('Delete fee structure:', id)}
            onViewFeeStructure={(id) => console.log('View fee structure:', id)}
          />
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <StudentFeeBalancesTable
            studentBalances={filteredStudentBalances}
            onViewStudent={handleViewStudent}
            onExportCSV={exportBalancesCSV}
          />
        </TabsContent>

        <TabsContent value="transport" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Transport Fee Management</h2>
                <p className="text-muted-foreground">
                  Manage transport fee structures and routes
                </p>
              </div>
            </div>
            
            <div className="text-center py-12 text-muted-foreground">
              <p>Transport fee management coming soon...</p>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Payment Collection Dialog */}
      <PaymentCollectionForm
        isOpen={isCollectOpen}
        onClose={() => setIsCollectOpen(false)}
        selectedStudent={selectedStudent}
        onCollectPayment={handleCollectPayment}
      />
    </div>
  );
};
