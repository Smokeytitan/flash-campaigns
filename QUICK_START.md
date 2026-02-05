# Flash Campaigns — Quick Start Guide

**Goal**: Get Flash Campaigns running locally in under 10 minutes.

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm or yarn
- 📧 Supabase account (free tier works)
- 🐦 X (Twitter) Developer account
- 📱 Telegram account

---

## 1. Install Dependencies

```bash
cd flash-campaigns
npm install
```

---

## 2. Generate Secrets

Run the secret generator:

```bash
./scripts/generate-secrets.sh
```

This outputs all required secrets. Copy them to your `.env.local` file.

---

## 3. Set Up Supabase Database

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: **flash-campaigns**
3. Choose region (closest to you)
4. Save your database password!

### Get Connection String
1. Go to **Settings** → **Database**
2. Copy **Connection string** (URI format)
3. Add to `.env.local`:
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
   ```

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed instructions.

---

## 4. Set Up X (Twitter) OAuth

### Create X App
1. Go to [developer.twitter.com/en/portal/dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Create new project + app
3. Enable **OAuth 2.0**
4. Add callback URL:
   ```
   http://localhost:3000/api/x-auth/callback
   ```
5. Request scopes: `tweet.read users.read offline.access`

### Add Credentials
Add to `.env.local`:
```bash
X_CLIENT_ID="your-client-id"
X_CLIENT_SECRET="your-client-secret"
```

---

## 5. Set Up Telegram Bot

### Create Bot
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot`
3. Choose name: `Flash Campaigns Bot`
4. Choose username: `FlashCampaignsBot` (or similar)
5. Copy the bot token

### Add Token
Add to `.env.local`:
```bash
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="FlashCampaignsBot"
```

---

## 6. Create .env.local File

Copy the template:

```bash
cp .env.local.template .env.local
```

Fill in all values from steps 2-5.

**Your .env.local should have**:
- ✅ DATABASE_URL
- ✅ NEXTAUTH_URL + NEXTAUTH_SECRET
- ✅ X_CLIENT_ID + X_CLIENT_SECRET
- ✅ TELEGRAM_BOT_TOKEN
- ✅ ENCRYPTION_KEY
- ✅ CRON_SECRET
- ✅ TELEGRAM_WEBHOOK_SECRET

---

## 7. Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:migrate
```

This creates 5 tables:
- `User`
- `Campaign`
- `Submission`
- `Winner`
- `NotificationLog`

---

## 8. Test Database Connection

```bash
npx tsx scripts/test-db.ts
```

You should see:
```
✅ Database connected successfully!
📊 Database Stats:
   Users: 0
   Campaigns: 0
✅ Connection test passed!
```

---

## 9. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the Flash Campaigns homepage!

---

## 10. (Optional) Create Admin User

To access admin features, create an admin user:

### Option A: Via Prisma Studio
```bash
npm run db:studio
```

1. Open `User` table
2. Click **Add record**
3. Set:
   - `role`: ADMIN
   - `xHandle`: your_twitter_handle (optional)
   - `notifyOptIn`: true
4. Save

### Option B: Via SQL
In Supabase SQL Editor:
```sql
INSERT INTO "User" (id, role, "xHandle", "notifyOptIn", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'ADMIN', 'admin', true, NOW(), NOW());
```

---

## ✅ You're Ready!

Your Flash Campaigns app is now running locally. Next steps:

1. **Connect X Account**
   - Go to http://localhost:3000/profile
   - Click "Connect X"
   - Authorize the app

2. **Create Your First Campaign** (if admin)
   - Go to http://localhost:3000/admin/campaigns
   - Click "New Campaign"
   - Fill in details and publish

3. **Test Creator Flow**
   - Go to http://localhost:3000/campaigns
   - View campaign
   - Submit an X post URL

---

## Troubleshooting

### npm install fails
- Check Node.js version: `node --version` (need 18+)
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and try again

### Database connection fails
- Verify DATABASE_URL in `.env.local`
- Check Supabase project is running
- Run `npm run db:migrate` again

### X OAuth doesn't work
- Verify callback URL matches exactly: `http://localhost:3000/api/x-auth/callback`
- Check scopes are enabled: `tweet.read users.read offline.access`
- Regenerate secrets if needed

### Prisma errors
- Run `npm run db:generate` again
- Delete `node_modules/.prisma` folder
- Restart dev server

---

## Next Steps

- Read [DATABASE_SETUP.md](DATABASE_SETUP.md) for database details
- Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for implementation progress
- Review [flash-campaigns-architecture.md](../flash-campaigns-architecture.md) for system design

---

**Need Help?**
If you get stuck, check:
1. All environment variables are set correctly
2. Database migrations ran successfully
3. X OAuth app is configured properly
4. Telegram bot token is valid

Happy building! 🚀
