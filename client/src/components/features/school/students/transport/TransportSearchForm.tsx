import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";

interface TransportSearchFormProps {
  query: {
    class_id: number | "";
    section_id?: number | "";
    bus_route_id?: number | "";
  };
  classes: any[];
  sections: any[];
  busRoutes: any[];
  onClassChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onBusRouteChange: (value: string) => void;
  onClear: () => void;
}

export const TransportSearchForm = ({
  query,
  classes,
  sections,
  busRoutes,
  onClassChange,
  onSectionChange,
  onBusRouteChange,
  onClear,
}: TransportSearchFormProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Class
            </label>
            <Select
              value={query.class_id ? String(query.class_id) : ""}
              onValueChange={onClassChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls: any) => (
                  <SelectItem key={cls.class_id} value={String(cls.class_id)}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Section
            </label>
            <Select
              value={query.section_id ? String(query.section_id) : ""}
              onValueChange={onSectionChange}
              disabled={!query.class_id}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    query.class_id
                      ? "Select section (optional)"
                      : "Select class first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {sections.map((sec: any) => (
                  <SelectItem
                    key={sec.section_id}
                    value={String(sec.section_id)}
                  >
                    {sec.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Bus Route
            </label>
            <Select
              value={query.bus_route_id ? String(query.bus_route_id) : ""}
              onValueChange={onBusRouteChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select bus route (optional)" />
              </SelectTrigger>
              <SelectContent>
                {busRoutes.map((route: any) => (
                  <SelectItem
                    key={route.bus_route_id}
                    value={String(route.bus_route_id)}
                  >
                    {route.route_name}{" "}
                    {route.route_no ? `(${route.route_no})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* <div className="flex gap-2">
          <Button 
            onClick={onClear}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Clear
          </Button>
        </div> */}
      </div>
    </div>
  );
};
