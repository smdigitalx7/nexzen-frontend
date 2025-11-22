import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import type { Announcement } from "@/features/general/hooks/useAnnouncements";

interface AnnouncementFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isEditing: boolean;
  announcement?: Announcement | null;
  isLoading: boolean;
}

const AnnouncementFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  announcement,
  isLoading,
}: AnnouncementFormDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    category: "",
    priority: "",
    target_audience: "",
    target_transport: "",
    selected_classes: [] as string[],
    selected_routes: [] as string[],
  });

  useEffect(() => {
    if (isEditing && announcement) {
      setFormData({
        title: announcement.title,
        message: announcement.content,
        category: announcement.announcement_type.toLowerCase(),
        priority: announcement.priority.toLowerCase(),
        target_audience: announcement.target_audience,
        target_transport: announcement.bus_route_id ? "specific_routes" : "",
        selected_classes: announcement.class_id ? [announcement.class_id.toString()] : [],
        selected_routes: announcement.bus_route_id ? ["R001"] : [],
      });
    } else {
      setFormData({
        title: "",
        message: "",
        category: "",
        priority: "",
        target_audience: "",
        target_transport: "",
        selected_classes: [],
        selected_routes: [],
      });
    }
  }, [isEditing, announcement]);

  const handleClassToggle = (className: string) => {
    setFormData((prev) => ({
      ...prev,
      selected_classes: prev.selected_classes.includes(className)
        ? prev.selected_classes.filter((c) => c !== className)
        : [...prev.selected_classes, className],
    }));
  };

  const handleRouteToggle = (route: string) => {
    setFormData((prev) => ({
      ...prev,
      selected_routes: prev.selected_routes.includes(route)
        ? prev.selected_routes.filter((r) => r !== route)
        : [...prev.selected_routes, route],
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Announcement" : "Create New Announcement"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the announcement details"
              : "Create and send announcements to students, parents, or specific groups"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              placeholder="Enter announcement title"
            />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  message: e.target.value,
                })
              }
              placeholder="Enter announcement message"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    priority: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Target Audience</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all_classes"
                  checked={formData.target_audience === "all_classes"}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      target_audience: checked ? "all_classes" : "",
                    })
                  }
                />
                <Label htmlFor="all_classes">All Classes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="specific_classes"
                  checked={formData.selected_classes.length > 0}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      setFormData({
                        ...formData,
                        selected_classes: [],
                      });
                    }
                  }}
                />
                <Label htmlFor="specific_classes">Specific Classes</Label>
              </div>
              {formData.selected_classes.length > 0 && (
                <div className="ml-6 grid grid-cols-3 gap-2">
                  {[].map((className) => (
                    <div
                      key={className}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`class_${className}`}
                        checked={formData.selected_classes.includes(className)}
                        onCheckedChange={() => handleClassToggle(className)}
                      />
                      <Label
                        htmlFor={`class_${className}`}
                        className="text-sm"
                      >
                        Class {className}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <Label>Transport Routes</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all_routes"
                  checked={formData.target_transport === "all_routes"}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      target_transport: checked ? "all_routes" : "",
                    })
                  }
                />
                <Label htmlFor="all_routes">All Routes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="specific_routes"
                  checked={formData.selected_routes.length > 0}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      setFormData({
                        ...formData,
                        selected_routes: [],
                      });
                    }
                  }}
                />
                <Label htmlFor="specific_routes">Specific Routes</Label>
              </div>
              {formData.selected_routes.length > 0 && (
                <div className="ml-6 grid grid-cols-2 gap-2">
                  {[].map((route) => (
                    <div
                      key={route}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`route_${route}`}
                        checked={formData.selected_routes.includes(route)}
                        onCheckedChange={() => handleRouteToggle(route)}
                      />
                      <Label htmlFor={`route_${route}`} className="text-sm">
                        {route}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader.Button size="sm" className="mr-2" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isEditing ? "Update Announcement" : "Send Announcement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementFormDialog;
