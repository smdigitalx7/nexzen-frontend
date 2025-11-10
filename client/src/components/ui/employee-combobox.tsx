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
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedEmployee = employees.find((employee) => 
    employee.employee_id.toString() === value
  )

  // Handle empty or invalid values
  const hasValidValue = value && value !== "" && value !== "0"

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    // Focus input when popover opens
    if (newOpen) {
      setTimeout(() => {
        const input = inputRef.current || document.querySelector('[cmdk-input]') as HTMLInputElement
        if (input) {
          input.focus()
          input.click()
        }
      }, 100)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
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
        className="p-0 w-[var(--radix-popover-trigger-width)] pointer-events-auto"
        style={{ 
          pointerEvents: "auto !important" as any,
        }}
        align="start"
        sideOffset={4}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          // Check if clicking inside popover or command
          const isInsidePopover = target.closest('[data-radix-popover-content]') ||
                                   target.closest('[cmdk-root]') ||
                                   target.closest('[cmdk-list]') ||
                                   target.closest('[cmdk-item]') ||
                                   target.closest('[cmdk-input]') ||
                                   target.closest('[cmdk-input-wrapper]');
          
          // If inside popover, prevent closing but don't prevent the interaction itself
          if (isInsidePopover) {
            e.preventDefault();
            return;
          }
          
          // Only prevent closing when clicking on dialog overlay
          const isDialogOverlay = target.closest('[data-radix-dialog-overlay]');
          if (isDialogOverlay) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          // Don't prevent if clicking inside popover or command
          const isInsidePopover = target.closest('[data-radix-popover-content]') ||
                                   target.closest('[cmdk-root]') ||
                                   target.closest('[cmdk-list]') ||
                                   target.closest('[cmdk-item]') ||
                                   target.closest('[cmdk-input]') ||
                                   target.closest('[cmdk-input-wrapper]');
          
          if (isInsidePopover) {
            e.preventDefault(); // Prevent closing but allow interaction
            return;
          }
          
          // Only prevent if clicking on dialog overlay (outside popover)
          const isDialogOverlay = target.closest('[data-radix-dialog-overlay]');
          if (isDialogOverlay) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Allow escape to close popover even inside dialog
          setOpen(false);
        }}
      >
        <Command 
          shouldFilter={true}
          className="pointer-events-auto"
        >
          <CommandInput 
            ref={inputRef}
            placeholder="Search employees..."
            style={{ pointerEvents: "auto" }}
            onClick={(e) => {
              // Ensure input can be clicked and focused - stop propagation to prevent dialog from intercepting
              e.stopPropagation();
              const input = e.currentTarget;
              setTimeout(() => {
                if (document.activeElement !== input) {
                  input.focus();
                }
              }, 0);
            }}
            onMouseDown={(e) => {
              // Ensure input can receive mouse down events
              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              // Ensure input can receive pointer down events
              e.stopPropagation();
            }}
          />
            <CommandList 
              style={{ pointerEvents: "auto" }}
              onWheel={(e) => {
                // Allow scrolling
                e.stopPropagation()
              }}
              onTouchMove={(e) => {
                // Allow touch scrolling
                e.stopPropagation()
              }}
            >
              <CommandEmpty>
                {isLoading ? "Loading employees..." : "No employee found."}
              </CommandEmpty>
              <CommandGroup style={{ pointerEvents: "auto" }}>
                {hasValidValue && (
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onValueChange("")
                      setOpen(false)
                    }}
                    style={{ pointerEvents: "auto" }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
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
                  
                  const handleSelect = () => {
                    onValueChange(employeeId)
                    setOpen(false)
                  }
                  
                  return (
                    <CommandItem
                      key={employee.employee_id}
                      value={searchValue}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                      style={{ pointerEvents: "auto" }}
                      onMouseDown={(e) => {
                        // Primary handler - ensure selection works
                        e.stopPropagation()
                        if (e.button === 0) { // Left click only
                          handleSelect()
                        }
                      }}
                      onClick={(e) => {
                        // Backup click handler
                        e.stopPropagation()
                        handleSelect()
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          hasValidValue && value === employeeId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div 
                        className="flex flex-col flex-1"
                        style={{ pointerEvents: "auto" }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelect()
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

