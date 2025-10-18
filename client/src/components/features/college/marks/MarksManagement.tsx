import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ClipboardList } from 'lucide-react';
import { TabSwitcher } from '@/components/shared';
import type { TabItem } from '@/components/shared/TabSwitcher';
import ExamMarksManagement from './ExamMarksManagement';
import TestMarksManagement from './TestMarksManagement';

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
          <TabSwitcher
            tabs={[
              {
                value: "exam-marks",
                label: "Exam Marks",
                icon: GraduationCap,
                content: <ExamMarksManagement />,
              },
              {
                value: "test-marks",
                label: "Test Marks",
                icon: ClipboardList,
                content: <TestMarksManagement />,
              },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            gridCols="grid-cols-2"
          />
        </div>
      </div>
    </div>
  );
};

export default MarksManagement;
