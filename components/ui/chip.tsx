/**
 * Chip Component
 * Informational chips for prize amounts, winner counts, deadlines
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  label?: string
  value?: string
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, icon: Icon, label, value, children, ...props }, ref) => {
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
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        {label && <span className="text-muted-foreground">{label}:</span>}
        {value && <span>{value}</span>}
        {children}
      </div>
    )
  }
)
Chip.displayName = "Chip"

export { Chip }
