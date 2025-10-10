import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, GraduationCap, Building2 } from "lucide-react";

interface CollegeStatsCardsProps {
  totalGroups: number;
  activeGroups: number;
  totalCourses: number;
  activeCourses: number;
  totalCombinations: number;
  activeCombinations: number;
  totalSections: number;
  activeSections: number;
  currentBranch?: { branch_name: string } | null;
}

export const CollegeStatsCards = ({
  totalGroups,
  activeGroups,
  totalCourses,
  activeCourses,
  totalCombinations,
  activeCombinations,
  totalSections,
  activeSections,
  currentBranch
}: CollegeStatsCardsProps) => {
  const stats = [
    {
      title: "Subject Groups",
      value: totalGroups,
      active: activeGroups,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Courses",
      value: totalCourses,
      active: activeCourses,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Combinations",
      value: totalCombinations,
      active: activeCombinations,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Sections",
      value: totalSections,
      active: activeSections,
      icon: Building2,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`${stat.bgColor} ${stat.borderColor} border-2`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {stat.active} Active
                    </Badge>
                    {stat.value > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round((stat.active / stat.value) * 100)}% Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      {/* Branch Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Branch
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {currentBranch?.branch_name || "N/A"}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              College Management System
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
