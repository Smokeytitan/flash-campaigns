import { AppHeader } from "@/components/app-header"
import { CampaignFeed } from "@/components/campaign-feed"

export default function V0DemoPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <CampaignFeed />
      </main>
    </div>
  )
}
