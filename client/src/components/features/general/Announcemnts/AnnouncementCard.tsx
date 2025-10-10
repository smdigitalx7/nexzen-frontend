import { motion } from "framer-motion";
import { Megaphone, Calendar, Users, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Announcement } from "@/lib/hooks/general/useAnnouncements";

interface AnnouncementCardProps {
  announcement: Announcement;
  index: number;
  onView: (announcement: Announcement) => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  getPriorityIcon: (priority: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
  getCategoryColor: (category: string) => string;
}

const AnnouncementCard = ({
  announcement,
  index,
  onView,
  onEdit,
  onDelete,
  getPriorityIcon,
  getPriorityColor,
  getCategoryColor,
}: AnnouncementCardProps) => {
  return (
    <motion.div
      key={announcement.announcement_id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover-elevate">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {announcement.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  {announcement.content}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(announcement.priority)}>
                {getPriorityIcon(announcement.priority)}
                <span className="ml-1 capitalize">
                  {announcement.priority}
                </span>
              </Badge>
              <Badge
                variant="outline"
                className={getCategoryColor(announcement.announcement_type)}
              >
                {announcement.announcement_type}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(announcement.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {announcement.created_by || "System"}
              </div>
              {announcement.target_audience && (
                <div className="flex items-center gap-1">
                  <span>
                    Target:{" "}
                    {announcement.target_audience === "all_classes"
                      ? "All Classes"
                      : announcement.target_audience}
                  </span>
                </div>
              )}
              {announcement.bus_route_id && (
                <div className="flex items-center gap-1">
                  <span>
                    Route ID: {announcement.bus_route_id}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onView(announcement)}
                title="View announcement"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(announcement)}
                title="Edit announcement"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => onDelete(announcement)}
                title="Delete announcement"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnnouncementCard;
