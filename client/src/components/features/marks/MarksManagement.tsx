import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ClipboardList } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExamMarksManagement from '../marks/ExamMarksManagement';
import TestMarksManagement from '../marks/TestMarksManagement';

const MarksManagement = () => {
  const [activeTab, setActiveTab] = useState('exam-marks');

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Marks & Grades Management</h1>
              <p className="text-slate-600 mt-1">Track exam and test results, manage academic performance</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="exam-marks" >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Exam Marks
                </TabsTrigger>
                <TabsTrigger value="test-marks" >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Test Marks
                </TabsTrigger>
              </TabsList>

              {/* Exam Marks Tab */}
              <TabsContent value="exam-marks" className="space-y-6">
                <ExamMarksManagement />
              </TabsContent>

              {/* Test Marks Tab */}
              <TabsContent value="test-marks" className="space-y-6">
                <TestMarksManagement />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MarksManagement;
