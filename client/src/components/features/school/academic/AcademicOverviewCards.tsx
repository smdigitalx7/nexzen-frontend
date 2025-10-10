import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AcademicOverviewCardsProps {
  totalClasses: number;
  totalSubjects: number;
  activeExams: number;
  completedExams: number;
}

export const AcademicOverviewCards = ({
  totalClasses,
  totalSubjects,
  activeExams,
  completedExams,
}: AcademicOverviewCardsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Classes
          </CardTitle>
          <BookOpen className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {totalClasses}
          </div>
          <p className="text-xs text-muted-foreground">
            Active classes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Subjects
          </CardTitle>
          <GraduationCap className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {totalSubjects}
          </div>
          <p className="text-xs text-muted-foreground">Available subjects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Exams
          </CardTitle>
          <Award className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {activeExams}
          </div>
          <p className="text-xs text-muted-foreground">
            Scheduled/Ongoing
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
