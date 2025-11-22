import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Award, Users, School } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";

interface AcademicOverviewCardsProps {
  totalClasses: number;
  totalSubjects: number;
  activeExams: number;
  completedExams: number;
  totalGroups?: number;
  totalCourses?: number;
}

export const AcademicOverviewCards = ({
  totalClasses,
  totalSubjects,
  activeExams,
  completedExams,
  totalGroups = 0,
  totalCourses = 0,
}: AcademicOverviewCardsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
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
            Total Groups
          </CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {totalGroups}
          </div>
          <p className="text-xs text-muted-foreground">
            Academic groups
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Courses
          </CardTitle>
          <School className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-600">
            {totalCourses}
          </div>
          <p className="text-xs text-muted-foreground">
            Available courses
          </p>
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
