# Flash Campaigns - Development Guide

This file contains important context, patterns, and solutions for working on this project.

## Tech Stack

- **Framework**: Next.js 14.2.18 (App Router)
- **React**: 18.2.0
- **Authentication**: Clerk (@clerk/nextjs 6.37.3)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS 3.4.19 + Shadcn/UI
- **Design System**: v0.dev generated components
- **Deployment**: Vercel
- **Language**: TypeScript 5.7.2

## Important Decisions & Constraints

### Version Compatibility

**Critical**: This project uses specific version combinations that must be maintained:

- **Next.js 14.2.18** (NOT 15.x) - Required for Tailwind CSS compatibility
- **React 18.2.0** (NOT 19.x) - Required by Next.js 14
- **ESLint 8.57.0** (NOT 9.x) - Required by eslint-config-next@14.2.18
- **Tailwind CSS 3.4.19** - Works with Next.js 14's PostCSS setup

**Why these versions?**
- Next.js 15 has breaking changes with Tailwind CSS PostCSS plugin
- React 19 is not compatible with Next.js 14
- ESLint 9 has peer dependency conflicts with Next.js 14's ESLint config

### Authentication Architecture

**Protected Homepage**: Users MUST sign in before viewing any content.
- Homepage (`/`) redirects to `/sign-in` if not authenticated
- More exclusive feel, better user tracking
- Prevents anonymous browsing

**Clerk Integration**:
- Using test keys: `pk_test_...` and `sk_test_...`
- Test keys work on any domain (no need to configure allowed domains)
- Keys stored in `.env.production` and `.env.local`
- Clerk routes: `/sign-in`, `/sign-up`
- After sign-in redirect: `/` (homepage)

### Database

**Connection**: Supabase PostgreSQL with session pooler (shared)
- Uses session pooler at `aws-1-us-east-2.pooler.supabase.com:5432`
- Project ref: `xdtfcrkdnbzakmmbnnba`
- Direct connection (`db.*.supabase.co:5432`) does NOT resolve via DNS — always use pooler
- Connection string in `DATABASE_URL` environment variable
- Prisma reads from `.env` (not `.env.local`), so DATABASE_URL must be in `.env`

## Deployment

### Vercel Auto-Deploy Setup

**To enable automatic deployments from GitHub:**

1. Go to Vercel dashboard: https://vercel.com/ntruslow-1248s-projects/polygon-flash-campaigns
2. Click **Settings** → **Git**
3. Ensure these settings are enabled:
   - ✅ **Production Branch**: `main`
   - ✅ **Deploy Hooks**: Enabled
   - ✅ **Automatic deployments from Git**: Enabled
4. Under **Ignored Build Step**, make sure it's set to default (not ignoring builds)

**If auto-deploy still doesn't work:**
- Check that your GitHub repo has the Vercel integration installed
- Verify webhook is active: Settings → Webhooks in GitHub repo
- Manually trigger: Go to Vercel → Deployments → Redeploy

### Environment Variables

Required in Vercel (Settings → Environment Variables):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bmF0dXJhbC1jYWltYW4tNzMuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_bv53XFWPO9WcMXp6lb5gwHmTnOjXWZGGcUdGaBNj3Z

# Database
DATABASE_URL=postgresql://postgres.xdtfcrkdnbzakmmbnnba:Steelclarksm10%3F@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Other secrets
CRON_SECRET=...
ENCRYPTION_KEY=...
TELEGRAM_WEBHOOK_SECRET=...
X_CLIENT_ID=...
X_CLIENT_SECRET=...
```

**Important**: Environment variables are also in `.env.production` file (committed) for consistency.

## Common Issues & Solutions

### Build Fails with PostCSS/Tailwind Error

**Error**: `It looks like you're trying to use 'tailwindcss' directly as a PostCSS plugin`

**Solution**:
- Ensure Next.js is 14.2.18 (NOT 15.x)
- Check `postcss.config.mjs` has correct Tailwind plugin config
- Verify Tailwind CSS is 3.4.19

### Build Fails with ESLint Peer Dependency Error

**Error**: `peer eslint@"^7.23.0 || ^8.0.0" from eslint-config-next`

**Solution**:
- Downgrade ESLint to 8.57.0
- This is required by Next.js 14's ESLint config

### Clerk Authentication Not Working

**Check these:**
1. Environment variables are set in Vercel
2. `.env.production` has Clerk keys
3. Middleware is protecting the correct routes (`/profile`, `/admin`, etc.)
4. Homepage has auth check and redirect to `/sign-in`

## Project Structure

```
/app
  /page.tsx                 - Homepage (PROTECTED)
  /sign-in/                 - Clerk sign-in page
  /sign-up/                 - Clerk sign-up page
  /campaigns/[id]/          - Campaign detail pages
  /profile/                 - User profile (PROTECTED)
  /admin/                   - Admin panel (PROTECTED, admin only)
  /api/                     - API routes

/components
  /ui/                      - Shadcn/UI components
  /app-header-wrapper.tsx   - Header with Clerk auth
  /campaign-*.tsx           - Campaign display components
  /profile-*.tsx            - Profile components
  /admin-*.tsx              - Admin components

/lib
  /db/prisma.ts            - Prisma client singleton
  /clerk-auth.ts           - Clerk auth helpers

/prisma
  /schema.prisma           - Database schema
```

## Design System

**v0.dev Integration**:
- Design system generated by v0.dev
- Color scheme: Vibrant blue primary
- Custom tokens in `styles/globals.css`
- Uses Radix UI primitives + Tailwind
- Components follow Shadcn/UI patterns

**Key colors:**
- Primary: Blue (`hsl(234 89% 60%)`)
- Success: Green (`hsl(142 71% 45%)`)
- Warning: Orange (`hsl(38 92% 50%)`)

## Development Workflow

**IMPORTANT**: Always build (`npm run build`) before committing. Always push after committing. Never leave changes uncommitted.

1. **Make changes** locally
2. **Build** to verify: `npm run build` (must pass before committing)
3. **Commit** changes with descriptive message
4. **Push** to main branch: `git push origin main`
5. **Vercel auto-deploys** (if configured) or manually redeploy
6. **Check deployment** in Vercel dashboard
7. **Test** on production URL

## Admin Setup

To make a user an admin:
1. Sign in to Clerk dashboard
2. Go to Users → select user
3. Add to `publicMetadata`: `{"role": "ADMIN"}`
4. User will have access to `/admin` routes

## Future Improvements

- [ ] Upgrade to Next.js 15 when Tailwind compatibility is resolved
- [ ] Add webhook for Clerk user sync
- [ ] Set up staging environment
- [ ] Add end-to-end tests
- [ ] Implement proper error monitoring

---

Last updated: 2026-02-06
