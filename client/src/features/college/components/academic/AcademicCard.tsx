import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";

interface AcademicCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  color: string;
  index?: number;
}

export const AcademicCard = ({
  title,
  value,
  description,
  icon: Icon,
  color,
  index = 0,
}: AcademicCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${color}`}>
            {value}
          </div>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
