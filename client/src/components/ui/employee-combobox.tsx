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

  // Handle empty or invalid values
  const hasValidValue = value && value !== "" && value !== "0"

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {hasValidValue && selectedEmployee ? (
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
      <PopoverContent 
        className="p-0 w-[var(--radix-popover-trigger-width)]" 
        align="start"
        sideOffset={4}
        onInteractOutside={(e) => {
          // Allow closing when clicking outside
        }}
      >
        <Command>
          <CommandInput placeholder="Search employees..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading employees..." : "No employee found."}
            </CommandEmpty>
            <CommandGroup>
              {hasValidValue && (
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    onValueChange("")
                    setOpen(false)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                  }}
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  <span className="text-muted-foreground">Clear selection</span>
                </CommandItem>
              )}
              {employees.map((employee) => {
                const employeeId = employee.employee_id.toString()
                // Create searchable value - Command will filter based on this
                const searchValue = `${employee.employee_name} ${employee.employee_code || ""} ${employee.designation || ""}`.trim()
                
                return (
                  <CommandItem
                    key={employee.employee_id}
                    value={searchValue}
                    onSelect={() => {
                      // Use the employee from closure to ensure correct selection
                      onValueChange(employeeId)
                      setOpen(false)
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        hasValidValue && value === employeeId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div 
                      className="flex flex-col flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        onValueChange(employeeId)
                        setOpen(false)
                      }}
                    >
                      <span className="font-medium">{employee.employee_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {employee.designation || "N/A"} • {employee.employee_code || "N/A"}
                      </span>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
