import { SchoolClassDropdown, SchoolSectionDropdown, BusRouteDropdown } from "@/components/shared/Dropdowns";

interface TransportSearchFormProps {
  query: {
    class_id: number | "";
    section_id?: number | "";
    bus_route_id?: number | "";
  };
  onClassChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onBusRouteChange: (value: string) => void;
  onClear: () => void;
}

export const TransportSearchForm = ({
  query,
  onClassChange,
  onSectionChange,
  onBusRouteChange,
  onClear,
}: TransportSearchFormProps) => {
  const classId = query.class_id !== "" ? query.class_id : null;
  const sectionId = query.section_id !== "" ? query.section_id : null;
  const busRouteId = query.bus_route_id !== "" ? query.bus_route_id : null;
  const hasClassId = typeof classId === "number";

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Class
            </label>
            <SchoolClassDropdown
              value={classId}
              onChange={(value) => onClassChange(value !== null ? value.toString() : "")}
              placeholder="Select class"
              className="w-full"
              emptyValue
              emptyValueLabel="Select class"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Section
            </label>
            <SchoolSectionDropdown
              classId={hasClassId ? classId : 0}
              value={sectionId}
              onChange={(value) => onSectionChange(value !== null ? value.toString() : "")}
              disabled={!hasClassId}
              placeholder={
                hasClassId
                  ? "Select section (optional)"
                  : "Select class first"
              }
              className="w-full"
              emptyValue
              emptyValueLabel="Select section"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Bus Route
            </label>
            <BusRouteDropdown
              value={busRouteId}
              onChange={(value) => onBusRouteChange(value !== null ? value.toString() : "")}
              placeholder="Select bus route (optional)"
              className="w-full"
              emptyValue
              emptyValueLabel="Select bus route"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
