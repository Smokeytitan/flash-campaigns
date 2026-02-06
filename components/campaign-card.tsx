import Link from "next/link"
import { Clock, Trophy, DollarSign, ArrowRight } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { InfoChip } from "@/components/info-chip"
import { Button } from "@/components/ui/button"

export interface Campaign {
  id: string
  title: string
  summary: string
  status: "live" | "ending-soon" | "ended" | "winners-selected"
  prizePool: string
  winnersCount: number
  timeRemaining: string
  deadline: string
  brief: string
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const isActive = campaign.status === "live" || campaign.status === "ending-soon"

  return (
    <div className="group rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={campaign.status} />
          </div>
          <h3 className="text-lg font-semibold leading-snug text-card-foreground">
            {campaign.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {campaign.summary}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <InfoChip
              icon={<DollarSign className="h-3 w-3" />}
              label={campaign.prizePool}
            />
            <InfoChip
              icon={<Trophy className="h-3 w-3" />}
              label={`${campaign.winnersCount} winner${campaign.winnersCount !== 1 ? "s" : ""}`}
            />
            {isActive && (
              <InfoChip
                icon={<Clock className="h-3 w-3" />}
                label={campaign.timeRemaining}
              />
            )}
          </div>
        </div>
        <div className="hidden shrink-0 pt-6 sm:block">
          <Button asChild size="sm" variant={isActive ? "default" : "outline"}>
            <Link href={`/campaigns/${campaign.id}`}>
              {isActive ? "View brief" : "View results"}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-4 sm:hidden">
        <Button asChild className="w-full" size="sm" variant={isActive ? "default" : "outline"}>
          <Link href={`/campaigns/${campaign.id}`}>
            {isActive ? "View brief" : "View results"}
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
