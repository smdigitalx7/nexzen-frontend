import { motion } from "framer-motion";
import { Megaphone, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnnouncementCard from "./AnnouncementCard";
import type { Announcement } from "@/lib/hooks/general/useAnnouncements";

interface AnnouncementsListProps {
  announcements: Announcement[];
  isLoading: boolean;
  error: any;
  onView: (announcement: Announcement) => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  getPriorityIcon: (priority: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
  getCategoryColor: (category: string) => string;
}

const AnnouncementsList = ({
  announcements,
  isLoading,
  error,
  onView,
  onEdit,
  onDelete,
  getPriorityIcon,
  getPriorityColor,
  getCategoryColor,
}: AnnouncementsListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading announcements...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Server Error</h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          <p className="text-sm text-red-500 mb-4">
            The backend is experiencing issues. Please try again later.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8">
        <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No announcements found</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {announcements.map((announcement, index) => (
        <AnnouncementCard
          key={announcement.announcement_id}
          announcement={announcement}
          index={index}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          getPriorityIcon={getPriorityIcon}
          getPriorityColor={getPriorityColor}
          getCategoryColor={getCategoryColor}
        />
      ))}
    </motion.div>
  );
};

export default AnnouncementsList;
