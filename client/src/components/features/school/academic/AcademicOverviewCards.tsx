import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Award, FileText, CheckCircle, Layers } from "lucide-react";
import { StatsCard, DashboardGrid } from "@/components/shared";

interface AcademicOverviewCardsProps {
  totalClasses: number;
  totalSubjects: number;
  totalSections: number;
  activeExams: number;
  totalTests: number;
  loading?: boolean;
  className?: string;
}

export const AcademicOverviewCards = ({
  totalClasses,
  totalSubjects,
  totalSections,
  activeExams,
  totalTests,
  loading = false,
  className,
}: AcademicOverviewCardsProps) => {
  const academicStats = [
    {
      title: "Total Classes",
      value: totalClasses,
      icon: BookOpen,
      color: "blue" as const,
      description: "Active classes",
      variant: "elevated" as const,
      size: "lg" as const,
    },
    {
      title: "Total Subjects",
      value: totalSubjects,
      icon: GraduationCap,
      color: "green" as const,
      description: "Available subjects",
      variant: "bordered" as const,
      size: "lg" as const,
    },
    {
      title: "Total Sections",
      value: totalSections,
      icon: Layers,
      color: "purple" as const,
      description: "Available sections",
      variant: "bordered" as const,
      size: "lg" as const,
    },
    {
      title: "Active Exams",
      value: activeExams,
      icon: Award,
      color: "orange" as const,
      description: "Scheduled/Ongoing",
      variant: "elevated" as const,
      size: "lg" as const,
    },
    {
      title: "Total Tests",
      value: totalTests,
      icon: FileText,
      color: "yellow" as const,
      description: "Total tests",
      variant: "default" as const,
      size: "lg" as const,
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
        {academicStats.map((stat, index) => (
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
