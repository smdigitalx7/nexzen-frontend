import { motion } from "framer-motion";
import { Bus, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RouteCardProps {
  route: {
    id: number;
    route_number: string;
    route_name: string;
    vehicle_number: string;
    vehicle_capacity: number;
    driver_id: string;
    distance_km: number;
    estimated_duration: number;
    active: boolean;
    students_count: number;
  };
  routesData: any[];
  index: number;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const RouteCard = ({ route, routesData, index, onView, onEdit, onDelete }: RouteCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover-elevate">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Bus className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {route.route_number !== "-" ? route.route_number : "Route #" + route.id}
                </CardTitle>
                <CardDescription>
                  {route.route_name !== "-" ? route.route_name : "Unnamed Route"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={route.active ? "default" : "secondary"}>
                {route.active ? "Active" : "Inactive"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(route.id)}
                title="View route details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(route.id)}
                title="Edit route"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(route.id)}
                className="text-red-600 hover:text-red-700"
                title="Delete route"
                aria-label="Delete route"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Driver ID:</span>
              <span className="font-medium">
                {route.driver_id !== "-" ? `#${route.driver_id}` : "Not Assigned"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Distance:</span>
              <span className="font-medium">
                {route.distance_km > 0 ? `${route.distance_km} km` : "Not Set"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Duration:</span>
              <span className="font-medium">
                {route.estimated_duration > 0 ? `${route.estimated_duration} min` : "Not Set"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Registration:</span>
              <span className="font-medium">
                {routesData.find(r => r.bus_route_id === route.id)?.registration_number || "Not Set"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Start Location:</span>
              <span className="font-medium">
                {routesData.find(r => r.bus_route_id === route.id)?.start_location || "Not Set"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RouteCard;
