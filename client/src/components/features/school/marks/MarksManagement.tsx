import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ClipboardList, FileText, Calculator, Target, Trophy } from 'lucide-react';
import { TabSwitcher } from '@/components/shared';
import { StatsCard } from '@/components/shared/dashboard/StatsCard';
import { DashboardGrid } from '@/components/shared/dashboard/DashboardGrid';
import { useMarksStatistics, type MarksData } from '@/lib/hooks/school/use-marks-statistics';
import ExamMarksManagement from './ExamMarksManagement';
import TestMarksManagement from './TestMarksManagement';

const MarksManagement = () => {
  const [activeTab, setActiveTab] = useState('exam-marks');
  const [examMarksData, setExamMarksData] = useState<MarksData[]>([]);
  const [testMarksData, setTestMarksData] = useState<MarksData[]>([]);

  // Calculate statistics for current active tab
  const currentMarksData = activeTab === 'exam-marks' ? examMarksData : testMarksData;
  const statistics = useMarksStatistics(currentMarksData);

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
              <h1 className="text-3xl font-bold text-slate-900">
                {activeTab === 'exam-marks' ? 'Marks Management' : 'Tests Management'}
              </h1>
              <p className="text-slate-600 mt-1">
                {activeTab === 'exam-marks' 
                  ? 'Track exam results and manage academic performance' 
                  : 'Track test results and manage academic performance'
                }
              </p>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DashboardGrid columns={4} gap="md">
              <StatsCard
                title={`Total ${activeTab === 'exam-marks' ? 'Marks' : 'Tests'}`}
                value={statistics.totalMarks}
                icon={FileText}
                color="blue"
                variant="elevated"
                size="md"
              />
              <StatsCard
                title="Avg Score"
                value={`${statistics.avgPercentage}%`}
                icon={Calculator}
                color="green"
                variant="elevated"
                size="md"
              />
              <StatsCard
                title="Pass Rate"
                value={`${statistics.passPercentage}%`}
                icon={Target}
                color="purple"
                variant="elevated"
                size="md"
              />
              <StatsCard
                title="Top Score"
                value={`${statistics.topScore}%`}
                icon={Trophy}
                color="orange"
                variant="elevated"
                size="md"
              />
            </DashboardGrid>
          </motion.div>

          {/* Main Content */}
          <TabSwitcher
            tabs={[
              {
                value: "exam-marks",
                label: "Marks",
                icon: GraduationCap,
                content: <ExamMarksManagement onDataChange={setExamMarksData} />,
              },
              {
                value: "test-marks",
                label: "Tests",
                icon: ClipboardList,
                content: <TestMarksManagement onDataChange={setTestMarksData} />,
              },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

export default MarksManagement;
