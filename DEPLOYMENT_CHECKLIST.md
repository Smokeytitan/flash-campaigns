# Flash Campaigns — Deployment Checklist

**Date**: 2026-02-04
**Status**: 🟡 Deployment in Progress

---

## ✅ Completed

### 1. Project Setup
- ✅ Next.js 15 + TypeScript + Tailwind configured
- ✅ Prisma schema with all models
- ✅ X OAuth integration (PKCE + token encryption)
- ✅ UI component library (Button, Badge, Chip, Card, Input)
- ✅ Design system tokens (light + dark mode)
- ✅ Environment variables template
- ✅ Database setup guide

### 2. GitHub
- ✅ Git repository initialized
- ✅ Code committed (38 files)
- ✅ Pushed to: https://github.com/Smokeytitan/flash-campaigns
- ✅ Repository is private

### 3. Vercel
- ✅ Vercel configuration (vercel.json)
- ✅ Cron jobs configured (check campaigns, send reminders)
- 🟡 Deploying to production...

---

## 🟡 In Progress

### Vercel Deployment
- Currently deploying from GitHub
- Building Next.js app
- Generating Prisma client
- Expected completion: 1-3 minutes

---

## ⏸️ Next Steps (After Deployment)

### 1. Get Deployment URL
Once deployment completes, you'll receive a URL like:
```
https://flash-campaigns-abc123.vercel.app
```

### 2. Add Environment Variables in Vercel

Go to: [vercel.com/dashboard](https://vercel.com/dashboard) → flash-campaigns → Settings → Environment Variables

**Required Variables** (from VERCEL_ENV_VARS.txt):
- `DATABASE_URL` - Your Supabase connection string (with password)
- `NEXTAUTH_URL` - Your Vercel URL
- `NEXTAUTH_SECRET` - Already generated
- `ENCRYPTION_KEY` - Already generated
- `CRON_SECRET` - Already generated
- `TELEGRAM_WEBHOOK_SECRET` - Already generated
- `NEXT_PUBLIC_APP_URL` - Your Vercel URL

**When You Get Them**:
- `X_CLIENT_ID` - From Twitter Developer Portal
- `X_CLIENT_SECRET` - From Twitter Developer Portal
- `TELEGRAM_BOT_TOKEN` - From @BotFather
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Your bot username

### 3. Redeploy After Adding Env Vars
Click "Redeploy" button in Vercel dashboard

### 4. Run Database Migrations

From your local machine:
```bash
cd /Users/ntruslow/flash-campaigns
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use default
npm run db:migrate
```

This creates all tables in Supabase.

### 5. Configure X OAuth
Once you have your Vercel URL:

1. Go to: [developer.twitter.com/en/portal/dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Create new app or select existing
3. Go to User authentication settings
4. Set Callback URL:
   ```
   https://your-vercel-url.vercel.app/api/x-auth/callback
   ```
5. Set Website URL:
   ```
   https://your-vercel-url.vercel.app
   ```
6. Enable scopes: `tweet.read users.read offline.access`
7. Copy Client ID and Client Secret
8. Add to Vercel environment variables

### 6. Create Telegram Bot
1. Open Telegram
2. Message [@BotFather](https://t.me/BotFather)
3. Send `/newbot`
4. Name: `Flash Campaigns Bot`
5. Username: `FlashCampaignsBot` (or available username)
6. Copy bot token
7. Add to Vercel environment variables

### 7. Set Telegram Webhook
After adding bot token to Vercel and redeploying:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-vercel-url.vercel.app/api/telegram/webhook",
    "secret_token": "lhe/G87rgC4OYI5DH1gsn5TL9AalbogOsqRJLFc+eC8="
  }'
```

### 8. Test the App
1. Visit your Vercel URL
2. Try X OAuth flow (once configured)
3. Try Telegram linking (once bot is set up)
4. Create test campaign (once admin user exists)

### 9. Create Admin User
Use Prisma Studio or Supabase dashboard:

```bash
npm run db:studio
```

Add a user with `role: ADMIN`

---

## 📊 What's Built

### Complete Foundation (100%)
- ✅ Next.js app structure
- ✅ X OAuth (PKCE, token encryption, refresh logic)
- ✅ Prisma schema (5 tables)
- ✅ UI components (design system compliant)
- ✅ Auth routes
- ✅ Encryption utilities
- ✅ Validation schemas

### Still to Build (0%)
- ⏸️ Campaign feed page
- ⏸️ Campaign detail + submit module
- ⏸️ Profile page (X + Telegram connect)
- ⏸️ Admin campaign management
- ⏸️ Winner selection UI
- ⏸️ Notification sender service
- ⏸️ Server actions (campaigns, submissions, winners)

---

## 🎯 Current Status

**Phase**: Deployment + Configuration
**Next Phase**: Feature Implementation (Creator Flows)

---

## 📝 Quick Links

- **GitHub**: https://github.com/Smokeytitan/flash-campaigns
- **Vercel**: [dashboard](https://vercel.com/dashboard)
- **Supabase**: [dashboard](https://supabase.com/dashboard/project/xdtfcrkdnbzakmmbnnba)
- **Twitter Dev**: [portal](https://developer.twitter.com/en/portal/dashboard)
- **Telegram BotFather**: [@BotFather](https://t.me/BotFather)

---

## 🆘 Troubleshooting

### Deployment Fails
- Check build logs in Vercel dashboard
- Verify vercel.json build command
- Ensure package.json has correct scripts

### Database Connection Fails
- Verify DATABASE_URL has correct password
- Check Supabase project is running
- Run migrations: `npm run db:migrate`

### OAuth Not Working
- Verify callback URL matches exactly
- Check environment variables are set
- Redeploy after adding env vars

---

**Last Updated**: 2026-02-04
**Next Milestone**: Complete deployment + add env vars
