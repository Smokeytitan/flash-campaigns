export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Flash Campaigns</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Creator-first campaign platform
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/campaigns"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            View Campaigns
          </a>
          <a
            href="/admin"
            className="rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Admin
          </a>
        </div>
      </div>
    </div>
  );
}
