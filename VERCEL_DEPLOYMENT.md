# Flash Campaigns — Vercel Deployment Guide

Deploy Flash Campaigns to Vercel for production or staging.

---

## Prerequisites

- ✅ Vercel account (free tier works)
- ✅ Supabase database set up
- ✅ GitHub account (optional, for automatic deployments)

---

## Deployment Options

### Option 1: Deploy via Vercel Dashboard (Easiest)

#### Step 1: Push to GitHub (Optional but Recommended)

```bash
cd /Users/ntruslow/flash-campaigns

# Initialize git if not done
git init
git add .
git commit -m "Initial commit: Flash Campaigns"

# Create GitHub repo and push
# (Or skip if deploying from local)
```

#### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Add New Project"**
3. Choose:
   - **From GitHub**: Select your `flash-campaigns` repo
   - **Or import Git repository**
4. Click **"Import"**

#### Step 3: Configure Project

**Framework Preset**: Next.js (auto-detected)

**Build Command**:
```bash
npm run db:generate && npm run build
```

**Output Directory**: `.next` (default)

**Install Command**: `npm install` (default)

#### Step 4: Add Environment Variables

In Vercel project settings, add these environment variables:

**Required**:
```bash
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@xxx.supabase.com:6543/postgres
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=Di7sl5WtaIOpYnl4nsRqJj7F92wxzJgCxHrn7c6oQ1s=
ENCRYPTION_KEY=ce81981bf6f7601133510c5777cf0cd4360bf6f68ca913b8e74668c227593034
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_SECRET=lhe/G87rgC4OYI5DH1gsn5TL9AalbogOsqRJLFc+eC8=
CRON_SECRET=CRxTPgiqJz1PYVbSD/J9yXc3Re2f3FupVdrhGKFvfVU=
```

**Public** (NEXT_PUBLIC_*):
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=FlashCampaignsBot
```

#### Step 5: Deploy

Click **"Deploy"**

Vercel will:
1. Install dependencies
2. Generate Prisma client
3. Build Next.js app
4. Deploy to production

---

### Option 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy

```bash
cd /Users/ntruslow/flash-campaigns

# First deployment (creates project)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: flash-campaigns
# - Directory: ./
# - Override build settings? No
```

#### Step 4: Add Environment Variables

```bash
# Add all environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add ENCRYPTION_KEY production
vercel env add X_CLIENT_ID production
vercel env add X_CLIENT_SECRET production
vercel env add TELEGRAM_BOT_TOKEN production
vercel env add TELEGRAM_WEBHOOK_SECRET production
vercel env add CRON_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_TELEGRAM_BOT_USERNAME production
```

Or use the dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)

#### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## Post-Deployment Configuration

### 1. Update X OAuth Callback URL

After deployment, update your X Developer app:

1. Go to [developer.twitter.com/en/portal/dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Go to **User authentication settings**
4. Update **Callback URL**:
   ```
   https://your-app.vercel.app/api/x-auth/callback
   ```
5. Update **Website URL**:
   ```
   https://your-app.vercel.app
   ```
6. Save changes

### 2. Set Telegram Webhook

Set your bot webhook to receive messages:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/telegram/webhook",
    "secret_token": "YOUR_TELEGRAM_WEBHOOK_SECRET"
  }'
```

Replace:
- `<YOUR_BOT_TOKEN>` with your actual bot token
- `your-app.vercel.app` with your actual Vercel domain
- `YOUR_TELEGRAM_WEBHOOK_SECRET` with the secret from .env

### 3. Run Database Migrations

**Option A: From Local Machine**

```bash
# Use your Supabase DATABASE_URL
export DATABASE_URL="postgresql://..."
npm run db:migrate
```

**Option B: From Vercel**

Migrations should run automatically during build via:
```bash
npm run build  # runs: prisma generate && next build
```

Verify tables exist in Supabase dashboard.

### 4. Update NEXTAUTH_URL

Make sure `NEXTAUTH_URL` in Vercel matches your actual domain:

```bash
NEXTAUTH_URL=https://flash-campaigns-abc123.vercel.app
```

Update via:
- Vercel dashboard → Settings → Environment Variables
- Or CLI: `vercel env rm NEXTAUTH_URL production && vercel env add NEXTAUTH_URL production`

Then redeploy: `vercel --prod`

---

## Verify Deployment

### 1. Check Build Logs

In Vercel dashboard:
- Go to **Deployments**
- Click latest deployment
- Check **Build Logs** for errors

### 2. Test Endpoints

```bash
# Homepage
curl https://your-app.vercel.app

# Health check (if you add one)
curl https://your-app.vercel.app/api/health

# X OAuth (should redirect)
curl -I https://your-app.vercel.app/api/x-auth/authorize
```

### 3. Test in Browser

1. Visit `https://your-app.vercel.app`
2. Try X OAuth flow
3. Try Telegram linking
4. Create campaign (if admin)

---

## Custom Domain (Optional)

### Add Custom Domain

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain: `flashcampaigns.com`
3. Follow DNS configuration instructions
4. Update environment variables:
   ```bash
   NEXTAUTH_URL=https://flashcampaigns.com
   NEXT_PUBLIC_APP_URL=https://flashcampaigns.com
   ```
5. Update X OAuth callback URL
6. Update Telegram webhook URL

---

## Environment Variables Reference

### Production Environment

| Variable | Source | Notes |
|----------|--------|-------|
| `DATABASE_URL` | Supabase | PostgreSQL connection string |
| `NEXTAUTH_URL` | Your Vercel URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Generated | From generate-secrets.sh |
| `ENCRYPTION_KEY` | Generated | 64 hex chars |
| `X_CLIENT_ID` | Twitter Dev Portal | OAuth 2.0 Client ID |
| `X_CLIENT_SECRET` | Twitter Dev Portal | OAuth 2.0 Client Secret |
| `TELEGRAM_BOT_TOKEN` | @BotFather | Bot token |
| `TELEGRAM_WEBHOOK_SECRET` | Generated | For webhook security |
| `CRON_SECRET` | Generated | For cron job security |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL | Public var |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Your bot username | Public var |

---

## Troubleshooting

### Build Fails: "Prisma Client not generated"
**Solution**: Ensure `vercel.json` has correct build command:
```json
{
  "buildCommand": "npm run db:generate && npm run build"
}
```

### Database Connection Error
- Verify `DATABASE_URL` is correct in Vercel env vars
- Check Supabase allows connections from any IP (or add Vercel IPs)
- Run migrations: `npm run db:migrate` locally

### X OAuth Redirect Mismatch
- Callback URL must **exactly** match Vercel URL
- Include `/api/x-auth/callback` path
- Use `https://` not `http://`

### Telegram Webhook Not Working
- Verify webhook is set:
  ```bash
  curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
  ```
- Check webhook secret matches env var
- Ensure `/api/telegram/webhook` route is deployed

### Environment Variables Not Loading
- Variables must be added in Vercel dashboard
- Must redeploy after changing env vars: `vercel --prod`
- Check variable names match exactly (case-sensitive)

---

## Automatic Deployments (GitHub)

If you connected GitHub:

**Production**:
- Push to `main` branch → auto-deploys to production

**Preview**:
- Push to any branch → creates preview deployment
- Pull requests get unique preview URLs

Configure in Vercel → **Settings** → **Git**

---

## Monitoring & Logs

### View Logs

**Real-time**:
```bash
vercel logs
```

**Dashboard**:
- Vercel → Your Project → **Logs**
- Filter by: Function, Status, Time

### Analytics

Vercel provides free analytics:
- Page views
- Web Vitals (performance)
- Visitors

Enable in: **Settings** → **Analytics**

---

## Scaling Considerations

**Free Tier Limits**:
- 100 GB bandwidth/month
- Unlimited requests
- Serverless function timeout: 10s
- Execution time: 100 hours/month

**If You Exceed**:
- Upgrade to Pro ($20/month)
- Or optimize:
  - Add Redis caching
  - Use edge functions for static data
  - Implement rate limiting

---

## Security Checklist

Before going live:

- [ ] All secrets in environment variables (not hardcoded)
- [ ] `.env.local` in `.gitignore`
- [ ] X OAuth callback URL uses HTTPS
- [ ] Telegram webhook secret is set
- [ ] Cron secret is strong and unique
- [ ] Database has Row Level Security (RLS) enabled
- [ ] NEXTAUTH_SECRET is strong (32+ characters)
- [ ] Environment variables are production-only (not exposed in preview deployments)

---

## Next Steps After Deployment

1. ✅ Verify deployment successful
2. ✅ Test X OAuth flow
3. ✅ Test Telegram bot linking
4. ✅ Create admin user in database
5. ✅ Create first campaign
6. 🚀 Share with creators!

---

**Deployment URL**: https://your-app.vercel.app

**Need Help?**
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- Check logs: `vercel logs`
