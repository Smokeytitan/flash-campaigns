# Deployment Guide

## Quick Deployment

The application is deployed to Vercel at: **https://polygon-flash-campaigns.vercel.app**

## Environment Variables Setup

All environment variables can be added via the Vercel CLI:

```bash
bash add-vercel-env-vars.sh
```

This script adds all required environment variables to production, preview, and development environments.

## Required Environment Variables

| Variable | Description | Environments |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | All |
| `NEXTAUTH_URL` | Application URL | Production/Preview |
| `NEXTAUTH_SECRET` | NextAuth secret key | All |
| `ENCRYPTION_KEY` | 64-char hex for token encryption | All |
| `CRON_SECRET` | Secret for cron endpoint auth | All |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram webhook verification | All |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (from BotFather) | All |
| `X_CLIENT_ID` | X OAuth client ID | All |
| `X_CLIENT_SECRET` | X OAuth client secret | All |
| `NEXT_PUBLIC_APP_URL` | Public app URL | All |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Telegram bot username | All |

## Deployment Process

### 1. Build & Deploy

```bash
# Deploy to production
vercel --prod

# Or trigger from GitHub
git push origin main
```

### 2. Check Deployment Status

```bash
# List recent deployments
vercel ls

# Get logs for specific deployment
vercel logs <deployment-url>
```

### 3. Verify Environment Variables

```bash
# List all environment variables
vercel env ls

# Pull env vars locally
vercel env pull .env.local
```

## Common Issues

### Build Fails with Type Errors

Type checking is currently disabled in `next.config.ts`:
```typescript
typescript: {
  ignoreBuildErrors: true,
}
```

### Next.js Security Vulnerability

Ensure Next.js version is >= 15.2.6 to fix CVE-2025-55182 (React2Shell vulnerability).

### 500 Error After Deployment

Check that all environment variables are configured:
1. Run `vercel env ls` to verify variables exist
2. Check logs with `vercel logs <deployment-url>`
3. Verify DATABASE_URL is correct and database is accessible

### Git Author Access Error

Ensure git user email matches Vercel account:
```bash
git config user.email "your-vercel-email@example.com"
```

## Database Setup

The application uses PostgreSQL with Prisma ORM.

### Run Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### Create Admin User

Admin users must be created directly in the database with `role = 'ADMIN'`.

## Post-Deployment Tasks

1. ✅ Deployment successful
2. ⏳ Configure Telegram bot via BotFather
3. ⏳ Set `TELEGRAM_BOT_TOKEN` environment variable
4. ⏳ Configure Telegram webhook: `https://polygon-flash-campaigns.vercel.app/api/telegram/webhook`
5. ⏳ Create first admin user in database
6. ⏳ Test X OAuth flow
7. ⏳ Test campaign creation and submission

## Helpful Commands

```bash
# Check deployment status
vercel inspect <deployment-url>

# Redeploy without cache
vercel --prod --force

# View real-time logs
vercel logs --follow

# Switch Vercel team/scope
vercel switch

# Remove environment variable
vercel env rm <name> production
```

## Architecture Notes

- **Framework**: Next.js 15.2.6 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth v5
- **Styling**: Tailwind CSS v3
- **Deployment**: Vercel
- **Build Command**: `npm run db:generate && npm run build`
- **Node Version**: 24.x

## Support

For issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Ensure database is accessible
4. Check GitHub repository: https://github.com/Smokeytitan/flash-campaigns
