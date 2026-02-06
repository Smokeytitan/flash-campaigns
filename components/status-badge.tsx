import { cn } from "@/lib/utils"

type Status = "live" | "ending-soon" | "ended" | "winners-selected"

const statusConfig: Record<Status, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "bg-success text-success-foreground",
  },
  "ending-soon": {
    label: "Ending Soon",
    className: "bg-warning text-warning-foreground",
  },
  ended: {
    label: "Ended",
    className: "bg-muted text-muted-foreground",
  },
  "winners-selected": {
    label: "Winners Selected",
    className: "bg-primary text-primary-foreground",
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className
      )}
    >
      {status === "live" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {config.label}
    </span>
  )
}
