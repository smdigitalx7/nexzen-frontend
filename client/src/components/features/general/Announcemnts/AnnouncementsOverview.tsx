import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnnouncementsOverviewProps {
  totalAnnouncements: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
}

const AnnouncementsOverview = ({
  totalAnnouncements,
  highPriorityCount,
  mediumPriorityCount,
  lowPriorityCount,
}: AnnouncementsOverviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Announcement Statistics</CardTitle>
          <CardDescription>Overview of announcement activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalAnnouncements}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Announcements
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {highPriorityCount}
              </div>
              <div className="text-sm text-muted-foreground">
                High Priority
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mediumPriorityCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Medium Priority
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {lowPriorityCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Low Priority
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnnouncementsOverview;
