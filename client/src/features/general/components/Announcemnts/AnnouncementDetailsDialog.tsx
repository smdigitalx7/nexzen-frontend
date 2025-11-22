import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { Label } from "@/common/components/ui/label";
import { Badge } from "@/common/components/ui/badge";
import type { Announcement } from "@/features/general/hooks/useAnnouncements";

interface AnnouncementDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
  getPriorityColor: (priority: string) => string;
  getCategoryColor: (category: string) => string;
}

const AnnouncementDetailsDialog = ({
  isOpen,
  onClose,
  announcement,
  getPriorityColor,
  getCategoryColor,
}: AnnouncementDetailsDialogProps) => {
  if (!announcement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Announcement Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Title</Label>
            <p className="text-lg font-semibold">{announcement.title}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Content</Label>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <Badge className={getCategoryColor(announcement.announcement_type)}>
                {announcement.announcement_type}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Badge className={getPriorityColor(announcement.priority)}>
                {announcement.priority}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Target Audience</Label>
            <p className="text-sm">{announcement.target_audience}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Created</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(announcement.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementDetailsDialog;
