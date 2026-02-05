/**
 * Badge Component
 * Status badges for campaigns
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        live: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        "ending-soon": "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        ended: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        "winners-selected": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      },
    },
    defaultVariants: {
      variant: "draft",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showPulse?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, showPulse, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      >
        {showPulse && variant === "live" && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
          </span>
        )}
        {children}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
