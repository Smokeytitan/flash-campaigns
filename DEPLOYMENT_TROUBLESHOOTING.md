# Deployment Troubleshooting Guide

## Current Issue

The deployment at `https://polygon-flash-campaigns.vercel.app` is returning:
```
404 Not Found
x-vercel-error: DEPLOYMENT_NOT_FOUND
```

This typically means the Vercel project is not properly connected to the GitHub repository.

## Solution Steps

### 1. Check Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Look for the `flash-campaigns` project
3. Check if it exists and if the GitHub connection is active

### 2. Reconnect GitHub Integration (if needed)

If the project doesn't exist or GitHub connection is broken:

1. Go to Vercel dashboard
2. Click "Add New" → "Project"
3. Import from GitHub: `Smokeytitan/flash-campaigns`
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run db:generate && npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add all environment variables (see list below)

### 3. Environment Variables Required

Copy these from the previous project or regenerate:

```
DATABASE_URL=postgresql://postgres.xdtfcrkdnbzakmmbnnba:Steelclarksm10%3F@aws-0-us-west-1.pooler.supabase.com:6543/postgres

NEXTAUTH_URL=https://polygon-flash-campaigns.vercel.app
NEXTAUTH_SECRET=<your-secret>

ENCRYPTION_KEY=<64-char-hex-string>
CRON_SECRET=<your-secret>
TELEGRAM_WEBHOOK_SECRET=<your-secret>

X_CLIENT_ID=OXRYYmhDejVHUHRCQUVYUWxpWkM6MTpjaQ
X_CLIENT_SECRET=eAOc7ad_oXB69jjqCPQWGvFW27OyL4ID1p7n-feKHEmbQaeTuA

NEXT_PUBLIC_APP_URL=https://polygon-flash-campaigns.vercel.app
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=FlashCampaignsBot

TELEGRAM_BOT_TOKEN=<add-when-bot-created>
```

### 4. Trigger Deployment

After setting up:

1. The latest commit should auto-deploy
2. Or manually trigger: Go to Deployments → Redeploy

### 5. Verify Build Settings

In Vercel project settings, ensure:

- **Build Command**: `npm run db:generate && npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

### 6. Check Build Logs

Once deployment starts:

1. Go to the deployment in Vercel dashboard
2. Click on "Building" or "Logs"
3. Look for any errors during build

Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies
- Database connection issues during build

## Alternative: Create New Project

If reconnecting doesn't work:

1. Delete the old `polygon-flash-campaigns` project in Vercel
2. Create a new project from GitHub
3. Choose a new subdomain or use custom domain
4. Add all environment variables
5. Deploy

## Quick Test After Deployment

Once deployed, test these URLs:

1. Homepage: `https://polygon-flash-campaigns.vercel.app/`
2. Admin: `https://polygon-flash-campaigns.vercel.app/admin`
3. API health: `https://polygon-flash-campaigns.vercel.app/api/health` (if we add one)

## Code is Ready

The code in the repository is complete and ready to deploy:
- ✅ All features implemented
- ✅ Database schema created
- ✅ Environment variables documented
- ✅ All commits pushed to GitHub

The only issue is the Vercel <→ GitHub connection.

## Need Help?

If the above doesn't work:

1. Check Vercel status page: https://www.vercel-status.com/
2. Verify GitHub permissions for Vercel app
3. Try creating the project with a different name/subdomain
4. Contact Vercel support with project ID: `prj_OKx2yGzuJt0ZSvDs7T7fPtBz2ikX`
