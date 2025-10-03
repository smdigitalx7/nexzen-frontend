import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeesManagement } from "@/lib/hooks/useFeesManagement";
import { useClasses } from "@/lib/hooks/useSchool";
import { useTuitionFeeBalances, useTransportFeeBalances } from "@/lib/hooks/useFeeBalances";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TuitionFeeBalancesPanel } from "../components/TuitionFeeBalancesPanel";
import { TuitionFeeStructuresPanel } from "../components/TuitionFeeStructuresPanel";
import { TransportFeeBalancesPanel } from "../components/TransportFeeBalancesPanel";
import { FeeStatsCards } from "../components/FeeStatsCards";
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
    exportBalancesCSV,
  } = useFeesManagement();

  // Class selection for balances
  const { data: classes = [] } = useClasses();
  const [balanceClass, setBalanceClass] = useState<string>(classes[0]?.class_id?.toString() || "");
  useEffect(() => {
    if (!balanceClass && classes.length > 0) {
      setBalanceClass(classes[0].class_id.toString());
    }
  }, [classes, balanceClass]);
  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const { data: tuitionResp } = useTuitionFeeBalances({ class_id: classIdNum, page: 1, page_size: 50 });
  const { data: transportResp } = useTransportFeeBalances({ class_id: classIdNum, page: 1, page_size: 50 });

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
          <TabsTrigger value="tuition-structures">Tuition Fee Structures</TabsTrigger>
          <TabsTrigger value="tuition-balances">Tuition Fee Balances</TabsTrigger>
          <TabsTrigger value="transport-balances">Transport Fee Balances</TabsTrigger>          
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


        <TabsContent value="tuition-balances" className="space-y-4">
          <TuitionFeeBalancesPanel onViewStudent={handleViewStudent} onExportCSV={exportBalancesCSV} />
        </TabsContent>

        <TabsContent value="transport-balances" className="space-y-4">
          <TransportFeeBalancesPanel onViewStudent={handleViewStudent} onExportCSV={exportBalancesCSV} />
        </TabsContent>

        <TabsContent value="tuition-structures" className="space-y-4">
          <TuitionFeeStructuresPanel />
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
