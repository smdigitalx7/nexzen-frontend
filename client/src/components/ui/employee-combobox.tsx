import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEmployeesByBranch } from "@/lib/hooks/general/useEmployees"
import type { EmployeeRead } from "@/lib/types/general/employees"

interface EmployeeComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function EmployeeCombobox({
  value,
  onValueChange,
  placeholder = "Select employee...",
  className
}: EmployeeComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { data: employees = [], isLoading } = useEmployeesByBranch()

  const selectedEmployee = employees.find((employee) => 
    employee.employee_id.toString() === value
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedEmployee ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedEmployee.employee_name}</span>
              <span className="text-xs text-muted-foreground">
                {selectedEmployee.designation} • {selectedEmployee.employee_code}
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search employees..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading employees..." : "No employee found."}
            </CommandEmpty>
            <CommandGroup>
              {employees.map((employee) => (
                <CommandItem
                  key={employee.employee_id}
                  value={`${employee.employee_name} ${employee.employee_code} ${employee.designation}`}
                  onSelect={() => {
                    onValueChange(employee.employee_id.toString())
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === employee.employee_id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{employee.employee_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {employee.designation} • {employee.employee_code}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
