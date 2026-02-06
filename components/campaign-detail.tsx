"use client"

import Link from "next/link"
import { ArrowLeft, Clock, Trophy, DollarSign, Calendar } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { InfoChip } from "@/components/info-chip"
import { SubmissionPanel } from "@/components/submission-panel"
import { Button } from "@/components/ui/button"
import type { Campaign } from "@/components/campaign-card"

interface CampaignDetailProps {
  campaign: Campaign
  isAuthenticated?: boolean
  hasSubmitted?: boolean
  submissionUrl?: string
  isWinner?: boolean
}

export function CampaignDetail({
  campaign,
  isAuthenticated = false,
  hasSubmitted = false,
  submissionUrl,
  isWinner = false,
}: CampaignDetailProps) {
  const isActive = campaign.status === "live" || campaign.status === "ending-soon"

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to campaigns
        </Link>
      </Button>

      {/* Hero */}
      <div className="mb-8 space-y-4">
        <StatusBadge status={campaign.status} />
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-balance">
          {campaign.title}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
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
          <InfoChip
            icon={<Calendar className="h-3 w-3" />}
            label={`Deadline: ${campaign.deadline}`}
          />
          {isActive && campaign.timeRemaining && (
            <InfoChip
              icon={<Clock className="h-3 w-3" />}
              label={campaign.timeRemaining}
            />
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="mb-8 h-px bg-border" />

      {/* Brief */}
      <div className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Campaign Brief
        </h2>
        <div className="prose-sm max-w-none leading-relaxed text-foreground">
          <p>{campaign.brief}</p>
        </div>
      </div>

      {/* Submission */}
      {isActive ? (
        isAuthenticated ? (
          hasSubmitted ? (
            <div className="rounded-xl border bg-card p-6">
              <p className="text-sm font-semibold text-foreground mb-2">
                Submission received
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Your entry has been submitted. Winners will be announced after the campaign ends.
              </p>
              {submissionUrl && (
                <a
                  href={submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  View your submission
                </a>
              )}
              {isWinner && (
                <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-4">
                  <p className="text-sm font-semibold text-success">
                    Congratulations! You won this campaign!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <SubmissionPanel campaignId={campaign.id} />
          )
        ) : (
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="text-sm font-semibold text-foreground mb-2">
              Sign in to submit
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              You need to be signed in to submit your entry.
            </p>
            <Button asChild variant="default" size="sm">
              <Link href="/api/auth/signin">Sign in</Link>
            </Button>
          </div>
        )
      ) : campaign.status === "winners-selected" ? (
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm font-semibold text-foreground">
            This campaign has ended
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Winners have been selected.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 bg-transparent">
            <Link href={`/campaigns/${campaign.id}/winners`}>View winners</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm font-semibold text-foreground">
            This campaign has ended
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Winners will be announced soon.
          </p>
        </div>
      )}
    </div>
  )
}
