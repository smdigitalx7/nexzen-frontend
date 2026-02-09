import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Layers, Award } from "lucide-react";
import { StatsCard } from "@/common/components/shared/dashboard/StatsCard";
import { DashboardGrid } from "@/common/components/shared/dashboard/DashboardGrid";

export interface CollegeAcademicOverviewCardsProps {
  totalClasses: number;
  totalSubjects: number;
  totalGroups: number;
  totalCourses: number;
  activeExams: number;
  totalTests: number;
  loading?: boolean;
  className?: string;
}

export const AcademicOverviewCards = ({
  totalClasses,
  totalSubjects,
  totalGroups,
  totalCourses,
  activeExams,
  totalTests,
  loading = false,
  className,
}: CollegeAcademicOverviewCardsProps) => {
  const stats = [
    {
      title: "Total Classes",
      value: totalClasses,
      icon: BookOpen,
      color: "blue" as const,
      description: "Active classes",
      variant: "elevated" as const,
      size: "sm" as const,
    },
    {
      title: "Total Subjects",
      value: totalSubjects,
      icon: GraduationCap,
      color: "green" as const,
      description: "Available subjects",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    {
      title: "Academic Groups",
      value: totalGroups,
      icon: Layers,
      color: "purple" as const,
      description: "Defined groups",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    {
      title: "Available Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "indigo" as const,
      description: "Primary courses",
      variant: "bordered" as const,
      size: "sm" as const,
    },
    {
      title: "Active Exams",
      value: activeExams,
      icon: Award,
      color: "orange" as const,
      description: "Scheduled/Ongoing",
      variant: "elevated" as const,
      size: "sm" as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={className}
    >
      <DashboardGrid columns={5} gap="md">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            {...stat}
            loading={loading}
          />
        ))}
      </DashboardGrid>
    </motion.div>
  );
};
