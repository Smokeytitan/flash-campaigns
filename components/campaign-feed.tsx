"use client"

import { useState } from "react"
import { Inbox } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CampaignCard } from "@/components/campaign-card"
import { EmptyState } from "@/components/empty-state"
import { sampleCampaigns } from "@/lib/sample-data"

export function CampaignFeed() {
  const [tab, setTab] = useState("live")

  const liveCampaigns = sampleCampaigns.filter(
    (c) => c.status === "live" || c.status === "ending-soon"
  )
  const endedCampaigns = sampleCampaigns.filter((c) => c.status === "ended")
  const winnersCampaigns = sampleCampaigns.filter(
    (c) => c.status === "winners-selected"
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Campaigns
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse live campaigns, submit your posts, and track your wins.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="live">
            Live
            {liveCampaigns.length > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {liveCampaigns.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
          <TabsTrigger value="winners">Winners</TabsTrigger>
        </TabsList>

        <TabsContent value="live">
          {liveCampaigns.length > 0 ? (
            <div className="flex flex-col gap-4">
              {liveCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title="No live campaigns"
              description="Check back soon — new campaigns drop regularly."
            />
          )}
        </TabsContent>

        <TabsContent value="ended">
          {endedCampaigns.length > 0 ? (
            <div className="flex-col gap-4">
              {endedCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title="No ended campaigns"
              description="Campaigns that have closed will appear here."
            />
          )}
        </TabsContent>

        <TabsContent value="winners">
          {winnersCampaigns.length > 0 ? (
            <div className="flex flex-col gap-4">
              {winnersCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title="No winners yet"
              description="Once campaigns close and winners are picked, they will show up here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
