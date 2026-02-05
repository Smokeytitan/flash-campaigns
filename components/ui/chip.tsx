/**
 * Chip Component
 * Informational chips for prize amounts, winner counts, deadlines
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px]",
          "bg-secondary border border-border",
          "text-sm font-medium text-foreground",
          "font-mono", // For numeric values
          className
        )}
        {...props}
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {children}
      </div>
    )
  }
)
Chip.displayName = "Chip"

export { Chip }
