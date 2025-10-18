import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, IdCard, MapPin, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TabSwitcher } from '@/components/shared';
import { Button } from '@/components/ui/button';
import type { TabItem } from '@/components/shared/TabSwitcher';
import { useAuthStore } from '@/store/authStore';
import { StudentsTab } from './StudentsTab';
import { EnrollmentsTab } from './EnrollmentsTab';
import { TransportTab } from './TransportTab';

const StudentManagement = () => {
  const { currentBranch } = useAuthStore();
  const [activePageTab, setActivePageTab] = useState<string>('students');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground mt-1">Manage student records, attendance, and academic progress</p>
          {currentBranch && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {currentBranch.branch_name} • {currentBranch.branch_type.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>
        {activePageTab === 'students' && (
          <Button className="hover-elevate">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        )}
      </div>

      <TabSwitcher
        tabs={[
          {
            value: "students",
            label: "Students",
            icon: Users,
            content: <StudentsTab />,
          },
          {
            value: "enrollments",
            label: "Enrollments",
            icon: IdCard,
            content: <EnrollmentsTab />,
          },
          {
            value: "transport",
            label: "Transport",
            icon: MapPin,
            content: <TransportTab />,
          },
        ]}
        activeTab={activePageTab}
        onTabChange={setActivePageTab}
        gridCols="grid-cols-3"
      />
    </motion.div>
  );
};

export default StudentManagement;