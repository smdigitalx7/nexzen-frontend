import { useState } from "react";
import { User, Search } from "lucide-react";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { FormDialog } from "@/common/components/shared";
import { Input } from "@/common/components/ui/input";
import { Badge } from "@/common/components/ui/badge";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { useEmployeesByBranch } from "@/features/general/hooks/useEmployees";
import { EmployeeRead } from "@/features/general/types/employees";
import { useToast } from "@/common/hooks/use-toast";

interface AssignDriverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (driverEmployeeId: number) => void;
  isAssigning?: boolean;
}

const AssignDriverDialog = ({ isOpen, onClose, onAssign, isAssigning }: AssignDriverDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  
  const { data: employees = [], isLoading } = useEmployeesByBranch();
  const { toast } = useToast();
  
  // ✅ FIX: Ensure employees is always an array to prevent "filter is not a function" errors
  const safeEmployees = Array.isArray(employees) ? employees : [];
  
  // Filter drivers from all employees
  const drivers = safeEmployees.filter((employee: EmployeeRead) => 
    employee.employee_type === "DRIVER" && employee.status === "ACTIVE"
  );
  
  // Filter drivers by search query
  const filteredDrivers = drivers.filter((driver: EmployeeRead) =>
    driver.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (driver.mobile_no && driver.mobile_no.includes(searchQuery))
  );
  
  const handleAssign = () => {
    if (!selectedDriver) {
      toast({
        title: "Selection Required",
        description: "Please select a driver",
        variant: "destructive",
      });
      return;
    }
    onAssign(selectedDriver);
    setSelectedDriver(null);
    setSearchQuery("");
  };
  
  const handleClose = () => {
    setSelectedDriver(null);
    setSearchQuery("");
    onClose();
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={handleClose}
      title="Assign Driver to Route"
      description="Select a driver from the list below"
      size="MEDIUM"
      showFooter={true}
      onSave={handleAssign}
      onCancel={handleClose}
      saveText="Assign Driver"
      cancelText="Cancel"
      saveVariant="default"
      disabled={!selectedDriver || isAssigning}
      isLoading={isAssigning}
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers by name, code, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Driver List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader.Data message="Loading drivers..." />
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No drivers found matching your search" : "No active drivers available"}
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredDrivers.map((driver: EmployeeRead) => (
                <div
                  key={driver.employee_id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDriver === driver.employee_id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedDriver(driver.employee_id)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{driver.employee_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {driver.employee_code} • {driver.mobile_no || "No mobile"}
                    </div>
                    {driver.designation && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {driver.designation}
                      </div>
                    )}
                  </div>
                  <Badge variant="default">{driver.status}</Badge>
                  {selectedDriver === driver.employee_id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </FormDialog>
  );
};

export default AssignDriverDialog;

