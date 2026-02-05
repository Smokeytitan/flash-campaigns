# Flash Campaigns — Database Setup Guide

This guide walks you through setting up the Supabase PostgreSQL database for Flash Campaigns.

---

## Option 1: Supabase (Recommended)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click **"New Project"**
4. Configure:
   - **Name**: `flash-campaigns`
   - **Database Password**: Generate strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

### Step 2: Get Database Connection String

1. In your Supabase project dashboard:
   - Go to **Settings** → **Database**
   - Find **Connection string** section
   - Select **"URI"** tab
   - Copy the connection string

2. It will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

3. Add to your `.env.local` file:
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
   ```

### Step 3: Run Migrations

Once you have `DATABASE_URL` set:

```bash
# Generate Prisma client
npm run db:generate

# Create initial migration
npm run db:migrate

# This will:
# 1. Create all tables (users, campaigns, submissions, winners, notification_log)
# 2. Set up indexes
# 3. Configure enums
```

### Step 4: Verify Tables Created

In Supabase dashboard:
1. Go to **Table Editor**
2. You should see 5 tables:
   - `User`
   - `Campaign`
   - `Submission`
   - `Winner`
   - `NotificationLog`

---

## Option 2: Local PostgreSQL

If you prefer local development:

### Step 1: Install PostgreSQL

**macOS** (via Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Or use [Postgres.app](https://postgresapp.com/)**

### Step 2: Create Database

```bash
createdb flash_campaigns
```

### Step 3: Set Connection String

Add to `.env.local`:
```bash
DATABASE_URL="postgresql://localhost:5432/flash_campaigns"
```

### Step 4: Run Migrations

```bash
npm run db:generate
npm run db:migrate
```

---

## Seed Admin User (Optional)

To create an admin user for testing:

### Create seed script:

**prisma/seed.ts**:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      role: 'ADMIN',
      xHandle: 'admin',
      xName: 'Admin User',
      notifyOptIn: true,
    },
  })

  console.log('Created admin user:', admin)

  // Create sample campaign
  const campaign = await prisma.campaign.create({
    data: {
      title: 'Welcome Campaign',
      brief: 'This is a sample campaign to get you started.',
      requirements: ['Post about Flash Campaigns', 'Tag @FlashCampaigns'],
      status: 'DRAFT',
      prizePoolAmount: 1000,
      prizePoolCurrency: 'USD',
      winnersCount: 3,
      createdById: admin.id,
    },
  })

  console.log('Created sample campaign:', campaign)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Run seed:

```bash
npx tsx prisma/seed.ts
```

---

## Environment Variables Checklist

Before running migrations, ensure you have set up your `.env.local`:

```bash
# ============================================================================
# DATABASE (Required for migrations)
# ============================================================================
DATABASE_URL="postgresql://..."

# ============================================================================
# NEXTAUTH (Required)
# ============================================================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# ============================================================================
# X OAUTH (Required for X integration)
# ============================================================================
X_CLIENT_ID="your-client-id"
X_CLIENT_SECRET="your-client-secret"

# ============================================================================
# TELEGRAM (Required for notifications)
# ============================================================================
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_WEBHOOK_SECRET="random-secret"

# ============================================================================
# ENCRYPTION (Required for token storage)
# ============================================================================
ENCRYPTION_KEY="64-char-hex-key"

# ============================================================================
# CRON (Required for background jobs)
# ============================================================================
CRON_SECRET="random-secret"

# ============================================================================
# APP CONFIG
# ============================================================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="FlashCampaignsBot"
```

### Generate Secrets:

```bash
# ENCRYPTION_KEY (64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET
openssl rand -base64 32

# TELEGRAM_WEBHOOK_SECRET
openssl rand -base64 32
```

---

## Verify Database Connection

Create a simple test script:

**scripts/test-db.ts**:
```typescript
import prisma from '@/lib/db/prisma'

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully!')

    const userCount = await prisma.user.count()
    console.log(`Users in database: ${userCount}`)

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

testConnection()
```

Run:
```bash
npx tsx scripts/test-db.ts
```

---

## Troubleshooting

### Error: "Can't reach database server"
- Check DATABASE_URL is correct
- Ensure Supabase project is running
- Check firewall/network settings

### Error: "Schema not found"
- Run `npm run db:migrate` to create tables
- Verify migrations ran successfully in `prisma/migrations/` folder

### Error: "ENCRYPTION_KEY not set"
- Generate key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Add to `.env.local`

### Reset Database (Development Only)
```bash
# Warning: This deletes all data!
npx prisma migrate reset
```

---

## Next Steps

Once database is set up:

1. ✅ Verify tables exist in Supabase dashboard
2. ✅ Test connection with `scripts/test-db.ts`
3. ✅ (Optional) Seed admin user
4. 🚀 Start implementing creator flows!

---

**Need Help?**
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for current progress
