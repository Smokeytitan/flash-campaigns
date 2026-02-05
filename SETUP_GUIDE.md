# Flash Campaigns - Setup Guide

## ✅ Completed

The following components have been fully implemented:

- **Database Schema**: All tables created in Supabase (User, Campaign, Submission, Winner, NotificationLog)
- **Creator Flows**: Campaign feed, campaign details, submission module
- **Admin Flows**: Dashboard, campaign creation, submissions management, winner selection
- **X OAuth Integration**: Complete PKCE flow with token encryption and auto-refresh
- **Telegram Integration**: Webhook endpoint, account linking, notifications service
- **Campaign Notifications**: Automated notifications when campaigns go live
- **Cron Jobs**: Auto-check campaigns and end expired ones

## 🔧 Remaining Setup Steps

### 1. Create Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Copy the bot token provided
5. Set commands for the bot:
   ```
   /setcommands
   start - Get started and link your account
   ```

### 2. Configure Telegram Bot in Vercel

Add the Telegram bot token to your Vercel environment variables:

```bash
vercel env add TELEGRAM_BOT_TOKEN
# Paste your bot token from BotFather
```

Update the bot username in Vercel (if different from FlashCampaignsBot):

```bash
vercel env add NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
# Enter your bot's username (without @)
```

### 3. Set Up Telegram Webhook

Once the application is deployed, set up the webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://polygon-flash-campaigns.vercel.app/api/telegram/webhook",
    "secret_token": "YOUR_TELEGRAM_WEBHOOK_SECRET"
  }'
```

Replace:
- `<YOUR_BOT_TOKEN>` with your actual bot token
- `YOUR_TELEGRAM_WEBHOOK_SECRET` with the value from your `TELEGRAM_WEBHOOK_SECRET` env var

### 4. Create First Admin User

After deployment, you'll need to manually set a user's role to ADMIN in the database:

1. Open Supabase dashboard: https://supabase.com/dashboard/project/xdtfcrkdnbzakmmbnnba
2. Go to Table Editor → User table
3. Find your user (or create one by signing in with X)
4. Edit the row and change `role` from `USER` to `ADMIN`

### 5. Configure X OAuth Callback URL

In your X Developer Portal, ensure the callback URL is set to:
```
https://polygon-flash-campaigns.vercel.app/api/x-auth/callback
```

### 6. Test the Application

1. **Test X OAuth**:
   - Visit the homepage
   - Click "Sign In"
   - Connect your X account
   - Verify you're redirected back successfully

2. **Test Telegram Linking**:
   - Go to Profile
   - Click "Link Telegram"
   - Copy the 6-character code
   - Open your Telegram bot
   - Send `/start <CODE>` or just the code
   - Verify you receive a success message

3. **Test Campaign Creation** (as admin):
   - Go to Admin Dashboard
   - Click "New Campaign"
   - Fill in all fields
   - Create campaign
   - Change status to "LIVE"

4. **Test Submission** (as creator):
   - Go to homepage
   - Click on a live campaign
   - Paste an X post URL
   - Submit entry
   - Verify submission appears in admin view

5. **Test Winner Selection** (as admin):
   - Go to campaign management page
   - Select submissions using checkboxes
   - Click "Select Winners"
   - Verify winners are marked correctly

## 📊 Environment Variables Checklist

Make sure all these are set in Vercel:

- ✅ `DATABASE_URL` - Supabase PostgreSQL connection
- ✅ `NEXTAUTH_URL` - https://polygon-flash-campaigns.vercel.app
- ✅ `NEXTAUTH_SECRET` - Generated secret
- ✅ `ENCRYPTION_KEY` - 64-character hex string
- ✅ `CRON_SECRET` - Generated secret
- ✅ `TELEGRAM_WEBHOOK_SECRET` - Generated secret
- ✅ `X_CLIENT_ID` - Your X OAuth client ID
- ✅ `X_CLIENT_SECRET` - Your X OAuth client secret
- ✅ `NEXT_PUBLIC_APP_URL` - https://polygon-flash-campaigns.vercel.app
- ✅ `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Your bot's username
- 🔲 `TELEGRAM_BOT_TOKEN` - **NEEDS TO BE ADDED**

## 🎨 Design System

The app uses a custom design system with:
- Clean, minimal aesthetic
- Creator-friendly UI
- Consistent spacing (4px grid)
- Accessible color contrasts
- Responsive design
- Smooth animations and transitions

## 🔒 Security Features

- X OAuth tokens encrypted with AES-256-GCM
- Webhook secret verification
- Cron job authorization
- NextAuth session management
- Row-level security ready (can be enabled in Supabase)

## 📱 Key Features

### For Creators
- Browse live and ended campaigns
- View campaign details and requirements
- Submit X posts to campaigns
- Connect X and Telegram accounts
- Receive notifications for new campaigns
- Track submission status

### For Admins
- Create and manage campaigns
- View all submissions
- Select winners with prize distribution
- Control campaign status (Draft → Live → Ended)
- View notification logs

## 🚀 Deployment

The app automatically deploys to Vercel when you push to the `main` branch on GitHub.

Current deployment: https://polygon-flash-campaigns.vercel.app

## 📝 Notes

- The database schema supports multiple winners per campaign with ranked prizes
- Submissions are limited to one per user per campaign
- Telegram notifications are sent automatically when campaigns go live
- Campaigns auto-end when their `endAt` date is reached (checked every 15 minutes)
- All notification delivery is logged for tracking

## 🐛 Troubleshooting

### Build Failures
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify environment variables are set

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase pooler settings
- Ensure database is accessible from Vercel

### Telegram Bot Not Responding
- Verify TELEGRAM_BOT_TOKEN is set
- Check webhook is configured correctly
- View webhook info: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`

### X OAuth Failing
- Verify callback URL in X Developer Portal
- Check X_CLIENT_ID and X_CLIENT_SECRET
- Ensure tokens haven't expired
