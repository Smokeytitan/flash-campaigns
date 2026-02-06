import type { Campaign } from "@/components/campaign-card"

export const sampleCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Share your best productivity tip",
    summary:
      "Post a tweet sharing your top productivity hack and tag @FlashCampaigns. Authentic tips from real creators only.",
    status: "live",
    prizePool: "$500",
    winnersCount: 5,
    timeRemaining: "2d 14h left",
    deadline: "Feb 8, 2026",
    brief:
      "We're looking for genuine, actionable productivity tips from creators. Post a tweet sharing your single best productivity hack — something you actually use daily. Tag @FlashCampaigns and use #FlashTip. Keep it real, no fluff. Winners are chosen based on originality, engagement, and authenticity.",
  },
  {
    id: "2",
    title: "React hot takes for 2026",
    summary:
      "Share your spiciest React opinion. We want the takes that make devs debate in the replies.",
    status: "live",
    prizePool: "$300",
    winnersCount: 3,
    timeRemaining: "5d 8h left",
    deadline: "Feb 12, 2026",
    brief:
      "Got a React opinion that goes against the grain? We want to hear it. Post your hottest React take as a tweet. Tag @FlashCampaigns and use #ReactHotTake. The more thoughtful and debatable, the better. We're rewarding takes that spark real conversations — not ragebait.",
  },
  {
    id: "3",
    title: "Design a mini landing page",
    summary:
      "Show off your design chops by creating a micro landing page and sharing a screenshot.",
    status: "ending-soon",
    prizePool: "$1,000",
    winnersCount: 3,
    timeRemaining: "6h left",
    deadline: "Feb 6, 2026",
    brief:
      "Design a fictional one-screen landing page for any product you imagine. Share a screenshot of your design in a tweet, tagging @FlashCampaigns. Bonus points for clean typography, clear hierarchy, and a creative concept. This is about craft, not complexity.",
  },
  {
    id: "4",
    title: "Best dev meme of the month",
    summary:
      "Create an original developer meme. Must be SFW and actually funny.",
    status: "winners-selected",
    prizePool: "$200",
    winnersCount: 1,
    timeRemaining: "",
    deadline: "Jan 28, 2026",
    brief:
      "Create an original developer meme and post it on X. Tag @FlashCampaigns. Must be original — no reposts. SFW only. The community will help us pick the winner based on engagement and humor.",
  },
  {
    id: "5",
    title: "Thread on your tech stack",
    summary:
      "Write a Twitter thread breaking down your current tech stack and why you chose each tool.",
    status: "ended",
    prizePool: "$750",
    winnersCount: 5,
    timeRemaining: "",
    deadline: "Jan 20, 2026",
    brief:
      "Write a thread on X breaking down your current tech stack. Explain why you chose each tool. Be specific and honest — include the tradeoffs. Tag @FlashCampaigns in the first tweet. Minimum 4 tweets in the thread.",
  },
]

export interface Winner {
  handle: string
  avatar: string
  rank: number
}

export const sampleWinners: Winner[] = [
  {
    handle: "@sarahcodes",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=sarah",
    rank: 1,
  },
  {
    handle: "@devmark",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=mark",
    rank: 2,
  },
  {
    handle: "@jess_builds",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=jess",
    rank: 3,
  },
]

export interface Submission {
  id: string
  creatorHandle: string
  creatorAvatar: string
  postUrl: string
  submittedAt: string
  selected: boolean
}

export const sampleSubmissions: Submission[] = [
  {
    id: "s1",
    creatorHandle: "@sarahcodes",
    creatorAvatar: "https://api.dicebear.com/9.x/notionists/svg?seed=sarah",
    postUrl: "https://x.com/sarahcodes/status/123456789",
    submittedAt: "2h ago",
    selected: false,
  },
  {
    id: "s2",
    creatorHandle: "@devmark",
    creatorAvatar: "https://api.dicebear.com/9.x/notionists/svg?seed=mark",
    postUrl: "https://x.com/devmark/status/987654321",
    submittedAt: "4h ago",
    selected: false,
  },
  {
    id: "s3",
    creatorHandle: "@jess_builds",
    creatorAvatar: "https://api.dicebear.com/9.x/notionists/svg?seed=jess",
    postUrl: "https://x.com/jess_builds/status/111222333",
    submittedAt: "6h ago",
    selected: false,
  },
  {
    id: "s4",
    creatorHandle: "@code_ninja",
    creatorAvatar: "https://api.dicebear.com/9.x/notionists/svg?seed=ninja",
    postUrl: "https://x.com/code_ninja/status/444555666",
    submittedAt: "8h ago",
    selected: false,
  },
  {
    id: "s5",
    creatorHandle: "@pixel_perfect",
    creatorAvatar: "https://api.dicebear.com/9.x/notionists/svg?seed=pixel",
    postUrl: "https://x.com/pixel_perfect/status/777888999",
    submittedAt: "12h ago",
    selected: false,
  },
]
