# Clerk Authentication Migration Guide

This document outlines the migration from NextAuth v5 to Clerk authentication.

## Overview

The flash-campaigns application has been migrated from NextAuth v5 to Clerk for authentication. This provides better user management, social login options, and a more robust authentication system.

## Changes Made

### 1. Packages

**Removed:**
- `next-auth@5.0.0-beta.25`
- `@auth/prisma-adapter@2.11.1`

**Added:**
- `@clerk/nextjs@6.37.3`

### 2. Environment Variables

**Removed from .env.local:**
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

**Added to .env.local:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 3. Files Removed

- `/auth.ts` - NextAuth configuration
- `/app/api/auth/[...nextauth]/route.ts` - NextAuth API handler

### 4. Files Created

- `/middleware.ts` - Clerk middleware for route protection
- `/app/sign-in/[[...sign-in]]/page.tsx` - Sign in page
- `/app/sign-up/[[...sign-up]]/page.tsx` - Sign up page
- `/lib/clerk-auth.ts` - Helper functions for auth in API routes

### 5. Files Modified

#### App Layout
- `/app/layout.tsx` - Wrapped with ClerkProvider

#### Pages
- `/app/page.tsx` - Uses `currentUser()` from Clerk
- `/app/campaigns/[id]/page.tsx` - Uses `currentUser()` from Clerk
- `/app/profile/page.tsx` - Uses `currentUser()` from Clerk
- `/app/admin/page.tsx` - Uses `currentUser()` and checks `publicMetadata.role`

#### Components
- `/components/app-header-wrapper.tsx` - Now uses `useUser()` and `useClerk()` hooks, removed props

#### API Routes (All updated to use Clerk auth helpers)
- `/app/api/campaigns/[id]/submit/route.ts`
- `/app/api/campaigns/[id]/winners/route.ts`
- `/app/api/campaigns/[id]/submissions/route.ts`
- `/app/api/profile/telegram/generate-code/route.ts`
- `/app/api/profile/telegram/preferences/route.ts`
- `/app/api/profile/telegram/status/route.ts`
- `/app/api/x-auth/authorize/route.ts`
- `/app/api/x-auth/disconnect/route.ts`

#### Database Schema
- `/prisma/schema.prisma` - Updated User model:
  - User ID now uses Clerk user ID (no longer auto-generated)
  - Removed Account, Session, and VerificationToken models (Clerk handles these)
  - Role information still stored in DB but also in Clerk publicMetadata

## Setup Instructions

### 1. Create a Clerk Application

1. Go to https://dashboard.clerk.com
2. Sign up or log in
3. Click "Create Application"
4. Choose your authentication options (Email, Google, GitHub, etc.)
5. Copy your keys from the dashboard

### 2. Update Environment Variables

Update `.env.local` with your Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

Also add these to your production environment (Vercel):

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
```

### 3. Configure Clerk Dashboard

In your Clerk dashboard:

1. **Set up allowed redirect URLs:**
   - Add your local URL: `http://localhost:3000`
   - Add your production URL: `https://your-domain.com`

2. **Configure social connections** (if needed):
   - Enable Google, Twitter/X, GitHub, etc.

3. **Set up user metadata:**
   - Go to "Users" > "Metadata"
   - Add a public metadata field for `role` with values `USER` or `ADMIN`

### 4. Database Migration

The Prisma schema has been updated. You need to migrate your existing users:

**Important:** Before running migrations, create a backup of your database!

```bash
# Generate new Prisma client
npm run db:generate

# Create and apply migration
npm run db:migrate
```

### 5. Migrate Existing Users

You'll need to:

1. Export existing users from your database
2. Create corresponding users in Clerk (via Clerk API or dashboard)
3. Update your database User records with the new Clerk user IDs
4. Set the `role` in Clerk's publicMetadata for admin users

Example script to migrate users:

```typescript
import { clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';

async function migrateUsers() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Create user in Clerk
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [user.email],
      firstName: user.name?.split(' ')[0],
      lastName: user.name?.split(' ').slice(1).join(' '),
      publicMetadata: {
        role: user.role,
      },
    });

    // Update database record with Clerk ID
    await prisma.user.update({
      where: { id: user.id },
      data: { id: clerkUser.id },
    });
  }
}
```

## Authentication Patterns

### Server Components

```typescript
import { currentUser } from '@clerk/nextjs/server';

export default async function MyPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check admin role
  const isAdmin = user.publicMetadata?.role === 'ADMIN';

  return <div>Welcome {user.firstName}</div>;
}
```

### Client Components

```typescript
'use client';
import { useUser, useClerk } from '@clerk/nextjs';

export function MyComponent() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const isAdmin = user?.publicMetadata?.role === 'ADMIN';

  return (
    <div>
      {isSignedIn && <button onClick={() => signOut()}>Sign Out</button>}
    </div>
  );
}
```

### API Routes

```typescript
import { requireAuth, requireAdmin } from '@/lib/clerk-auth';

export async function POST() {
  // For authenticated routes
  const userId = await requireAuth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // For admin-only routes
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your logic here
}
```

## Protected Routes

Routes are protected via middleware in `/middleware.ts`:

- `/profile/*` - Requires authentication
- `/admin/*` - Requires authentication (admin check in page)
- `/campaigns/*/submit` - Requires authentication

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test authentication flows:
   - Sign up with a new account
   - Sign in with existing account
   - Access protected routes
   - Test sign out

3. Test admin functionality:
   - Set a user's role to ADMIN in Clerk dashboard
   - Access `/admin` route
   - Test admin API endpoints

## Deployment Checklist

- [ ] Set Clerk environment variables in Vercel
- [ ] Run database migrations in production
- [ ] Migrate existing users to Clerk
- [ ] Test sign in/sign up flows in production
- [ ] Verify protected routes work correctly
- [ ] Test admin functionality
- [ ] Remove old NextAuth environment variables from Vercel

## Troubleshooting

### "Invalid publishable key" error
- Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly
- Ensure the key starts with `pk_test_` or `pk_live_`

### "Unauthorized" on protected routes
- Verify middleware.ts is configured correctly
- Check that Clerk is wrapped around the app in layout.tsx

### Admin routes not working
- Ensure user has `role: 'ADMIN'` in publicMetadata
- Check the role check logic in pages and API routes

### Existing users can't sign in
- Complete the user migration process
- Verify Clerk user IDs are updated in the database

## Support

For more information:
- Clerk Documentation: https://clerk.com/docs
- Clerk Dashboard: https://dashboard.clerk.com
- Clerk Support: https://clerk.com/support
