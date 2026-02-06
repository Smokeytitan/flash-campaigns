# Clerk Authentication Setup - Summary

## Migration Complete!

The flash-campaigns project has been successfully migrated from NextAuth v5 to Clerk authentication.

## What Was Changed

### 1. Packages
- **Removed:** `next-auth`, `@auth/prisma-adapter`
- **Added:** `@clerk/nextjs`, `svix` (for webhooks)

### 2. Core Files Created
- `/middleware.ts` - Protects routes (profile, admin, campaign submissions)
- `/app/sign-in/[[...sign-in]]/page.tsx` - Sign in page
- `/app/sign-up/[[...sign-up]]/page.tsx` - Sign up page
- `/lib/clerk-auth.ts` - Auth helper functions for API routes
- `/app/api/webhooks/clerk/route.ts` - Clerk webhook handler for user sync

### 3. Files Removed
- `/auth.ts` - NextAuth configuration
- `/app/api/auth/[...nextauth]/route.ts` - NextAuth API handler

### 4. Files Updated

**App Pages (8 files):**
- `/app/layout.tsx` - Added ClerkProvider
- `/app/page.tsx` - Uses currentUser()
- `/app/campaigns/[id]/page.tsx` - Uses currentUser()
- `/app/profile/page.tsx` - Uses currentUser()
- `/app/admin/page.tsx` - Uses currentUser() + role check
- `/app/admin/campaigns/new/page.tsx` - Uses currentUser()
- `/app/admin/campaigns/[id]/page.tsx` - Uses currentUser()

**Components (1 file):**
- `/components/app-header-wrapper.tsx` - Uses useUser() and useClerk() hooks

**API Routes (8 files):**
- `/app/api/campaigns/[id]/submit/route.ts`
- `/app/api/campaigns/[id]/winners/route.ts`
- `/app/api/campaigns/[id]/submissions/route.ts`
- `/app/api/profile/telegram/generate-code/route.ts`
- `/app/api/profile/telegram/preferences/route.ts`
- `/app/api/profile/telegram/status/route.ts`
- `/app/api/x-auth/authorize/route.ts`
- `/app/api/x-auth/disconnect/route.ts`

**Server Actions (3 files):**
- `/app/actions/campaigns.ts`
- `/app/actions/submissions.ts`
- `/app/actions/telegram.ts`

**Database:**
- `/prisma/schema.prisma` - Updated User model, removed NextAuth tables

## Next Steps to Complete Setup

### 1. Get Clerk Keys

1. Visit https://dashboard.clerk.com
2. Create a new application (or use existing)
3. Choose authentication methods (Email, Google, Twitter/X, etc.)
4. Copy your keys from the API Keys section

### 2. Update Environment Variables

Update `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Optional, for webhook
```

### 3. Configure Clerk Dashboard

**Settings to configure:**

1. **Allowed Redirect URLs:**
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

2. **User & Authentication:**
   - Enable desired social providers (Google, Twitter/X, etc.)
   - Configure email settings

3. **Public Metadata Schema (for roles):**
   - Go to "Customization" > "Metadata"
   - Add to public metadata schema:
     ```json
     {
       "role": {
         "type": "string",
         "enum": ["USER", "ADMIN"],
         "default": "USER"
       }
     }
     ```

4. **Webhooks (Optional but Recommended):**
   - Go to "Webhooks"
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret to `CLERK_WEBHOOK_SECRET`

### 4. Database Migration

**IMPORTANT: Backup your database first!**

```bash
# Generate Prisma client with new schema
npm run db:generate

# Create migration
npm run db:migrate

# Or push changes directly (for dev)
npm run db:push
```

**Note:** Existing user records will need to be migrated or recreated. The User ID is now controlled by Clerk.

### 5. User Migration Strategy

You have two options:

**Option A: Fresh Start (Recommended for new/small projects)**
- Delete existing users from database
- Have users sign up again through Clerk
- The webhook will automatically create database records

**Option B: Migrate Existing Users**
- Create a migration script to:
  1. Create users in Clerk via API
  2. Update database User IDs with Clerk IDs
  3. Set roles in Clerk's publicMetadata
- See `/CLERK_MIGRATION.md` for example script

### 6. Set Admin Users

For users who need admin access:

1. Go to Clerk Dashboard > Users
2. Select a user
3. Go to "Metadata" tab
4. Add to Public metadata:
   ```json
   {
     "role": "ADMIN"
   }
   ```

### 7. Test the Application

```bash
# Install dependencies (if webhook package not installed)
npm install

# Start development server
npm run dev
```

**Test these flows:**
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Access protected routes (/profile)
- [ ] Test sign out
- [ ] Admin access (if you set a user as admin)
- [ ] Create a campaign (admin only)
- [ ] Submit to a campaign (authenticated users)

### 8. Deploy to Production

1. **Set environment variables in Vercel:**
   ```bash
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   vercel env add CLERK_SECRET_KEY
   vercel env add CLERK_WEBHOOK_SECRET  # If using webhooks
   ```

2. **Remove old NextAuth variables:**
   ```bash
   vercel env rm NEXTAUTH_SECRET
   vercel env rm NEXTAUTH_URL
   ```

3. **Update Clerk Dashboard with production URL**

4. **Deploy:**
   ```bash
   git push  # If auto-deploy is enabled
   # or
   vercel --prod
   ```

5. **Run database migrations in production**

## Authentication Patterns

### Server Components
```typescript
import { currentUser } from '@clerk/nextjs/server';

const user = await currentUser();
const isAdmin = user?.publicMetadata?.role === 'ADMIN';
```

### Client Components
```typescript
import { useUser, useClerk } from '@clerk/nextjs';

const { user, isSignedIn } = useUser();
const { signOut } = useClerk();
const isAdmin = user?.publicMetadata?.role === 'ADMIN';
```

### API Routes
```typescript
import { requireAuth, requireAdmin } from '@/lib/clerk-auth';

const userId = await requireAuth();
// or for admin-only
const adminId = await requireAdmin();
```

## Protected Routes

Via middleware in `/middleware.ts`:
- `/profile/*` - Authentication required
- `/admin/*` - Authentication required (role checked in page)
- `/campaigns/*/submit` - Authentication required

## Key Features

1. **User Management:** Clerk handles all user data, passwords, sessions
2. **Social Login:** Easy to enable Google, Twitter/X, GitHub, etc.
3. **Security:** Built-in CSRF protection, secure session management
4. **Admin Roles:** Stored in Clerk's publicMetadata
5. **Webhooks:** Automatic database sync when users are created/updated
6. **Modern UI:** Pre-built, customizable sign-in/up components

## Troubleshooting

### Build Errors
If you see TypeScript errors about `publicMetadata.role`:
```typescript
// Use optional chaining
user?.publicMetadata?.role === 'ADMIN'
```

### "Invalid publishable key"
- Ensure key starts with `pk_test_` or `pk_live_`
- Check that it's set in environment variables
- Restart dev server after adding keys

### Users not syncing to database
- Check webhook is configured correctly
- Verify `CLERK_WEBHOOK_SECRET` is set
- Check webhook logs in Clerk Dashboard

### Admin routes not working
- Verify user has `role: 'ADMIN'` in publicMetadata
- Check console for any auth errors
- Ensure middleware is protecting routes correctly

## Documentation

- Full migration guide: `/CLERK_MIGRATION.md`
- Clerk Documentation: https://clerk.com/docs
- Clerk Dashboard: https://dashboard.clerk.com

## Support

For issues with:
- **This migration:** Review the code changes or create an issue
- **Clerk itself:** https://clerk.com/support
- **Next.js + Clerk:** https://clerk.com/docs/quickstarts/nextjs

---

**Migration completed successfully! Follow the steps above to complete your setup.**
