import { useState, useMemo } from "react";
import { User, Search, CheckCircle2, Phone, Briefcase, Hash } from "lucide-react";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { FormDialog } from "@/common/components/shared";
import { Input } from "@/common/components/ui/input";
import { Badge } from "@/common/components/ui/badge";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { useDrivers } from "@/features/general/hooks/useEmployees";
import { EmployeeRead } from "@/features/general/types/employees";
import { useToast } from "@/common/hooks/use-toast";
import { cn } from "@/common/utils";

interface AssignDriverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (driverEmployeeId: number) => void;
  isAssigning?: boolean;
}

const AssignDriverDialog = ({ isOpen, onClose, onAssign, isAssigning }: AssignDriverDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  
  const { data: drivers = [], isLoading } = useDrivers(isOpen);
  const { toast } = useToast();
  
  const safeDrivers = Array.isArray(drivers) ? drivers : [];
  
  // Filter drivers by search query
  const filteredDrivers = useMemo(() => {
    return safeDrivers.filter((driver: EmployeeRead) =>
      driver.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver.mobile_no && driver.mobile_no.includes(searchQuery))
    );
  }, [safeDrivers, searchQuery]);
  
  const handleAssign = () => {
    if (!selectedDriver) {
      toast({
        title: "Selection Required",
        description: "Please select a driver from the list",
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
      title="Assign Driver"
      description="Select an active driver for this route"
      size="MEDIUM"
      showFooter={true}
      onSave={handleAssign}
      onCancel={handleClose}
      saveText={isAssigning ? "Assigning..." : "Assign Driver"}
      cancelText="Cancel"
      disabled={!selectedDriver || isAssigning}
      isLoading={isAssigning}
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        
        {/* Driver List */}
        <div className="rounded-lg border bg-muted/20 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader.Data message="Loading drivers..." />
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">
                {searchQuery ? "No matching drivers found" : "No active drivers available"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[350px]">
              <div className="p-2 space-y-1">
                {filteredDrivers.map((driver: EmployeeRead) => (
                  <div
                    key={driver.employee_id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md border transition-colors cursor-pointer",
                      selectedDriver === driver.employee_id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-transparent bg-background hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedDriver(driver.employee_id)}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      selectedDriver === driver.employee_id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <User className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm truncate">{driver.employee_name}</span>
                        {selectedDriver === driver.employee_id && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          <span>{driver.employee_code}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{driver.mobile_no || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        
        {/* Selected Summary */}
        {selectedDriver && (
          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-md flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">
              Selected: {safeDrivers.find(d => d.employee_id === selectedDriver)?.employee_name}
            </span>
          </div>
        )}
      </div>
    </FormDialog>
  );
};

export default AssignDriverDialog;

