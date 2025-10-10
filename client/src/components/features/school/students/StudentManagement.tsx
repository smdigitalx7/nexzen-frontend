import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, IdCard, MapPin, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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

      <Tabs value={activePageTab} onValueChange={setActivePageTab} className="space-y-4 w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">
            <Users className="w-4 h-4 mr-2" /> Students
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            <IdCard className="w-4 h-4 mr-2" /> Enrollments
          </TabsTrigger>
          <TabsTrigger value="transport">
            <MapPin className="w-4 h-4 mr-2" /> Transport
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <StudentsTab />
        </TabsContent>

        <TabsContent value="enrollments">
          <EnrollmentsTab />
        </TabsContent>

        <TabsContent value="transport">
          <TransportTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default StudentManagement;