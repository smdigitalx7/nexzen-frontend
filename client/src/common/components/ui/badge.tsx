import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/common/utils"

const badgeVariants = cva(
  // Whitespace-nowrap: Badges should never wrap.
  "whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" +
  " hover-elevate",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs",
        success:
          "border-transparent bg-success-500 text-success-50 shadow-xs",
        warning:
          "border-transparent bg-warning-500 text-warning-50 shadow-xs",
        info:
          "border-transparent bg-info-500 text-info-50 shadow-xs",
        outline: " border [border-color:var(--badge-outline)] shadow-xs",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

function Badge({ className, variant, size, icon, removable = false, onRemove, children, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(badgeVariants({ variant, size }), className)} 
      role={removable ? "button" : undefined}
      tabIndex={removable ? 0 : undefined}
      onClick={removable ? onRemove : undefined}
      onKeyDown={removable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onRemove?.()
        }
      } : undefined}
      aria-label={removable ? "Remove badge" : undefined}
      {...props}
    >
      {icon && <span className="mr-1" aria-hidden="true">{icon}</span>}
      {children}
      {removable && (
        <button
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 focus:outline-none focus:ring-1 focus:ring-current"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          aria-label="Remove"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

export { Badge, badgeVariants }
