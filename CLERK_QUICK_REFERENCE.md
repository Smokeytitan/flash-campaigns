# Clerk Authentication - Quick Reference

## Getting User Data

### Server Components (async)
```typescript
import { currentUser } from '@clerk/nextjs/server';

const user = await currentUser();

// Check authentication
if (!user) {
  redirect('/sign-in');
}

// Get user data
const userId = user.id;
const email = user.emailAddresses[0]?.emailAddress;
const name = user.fullName || user.firstName;
const image = user.imageUrl;

// Check role
const isAdmin = user.publicMetadata?.role === 'ADMIN';
```

### Client Components
```typescript
'use client';
import { useUser, useClerk } from '@clerk/nextjs';

export function MyComponent() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut, openSignIn } = useClerk();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;

  const isAdmin = user.publicMetadata?.role === 'ADMIN';

  return (
    <div>
      <p>Hello {user.firstName}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### API Routes & Route Handlers
```typescript
import { requireAuth, requireAdmin } from '@/lib/clerk-auth';

// Require any authenticated user
export async function POST() {
  const userId = await requireAuth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your logic here
}

// Require admin user
export async function DELETE() {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Your admin logic here
}
```

### Server Actions
```typescript
'use server';
import { currentUser } from '@clerk/nextjs/server';

export async function myAction() {
  const user = await currentUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  if (user.publicMetadata?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  // Your action logic here
}
```

## Common Operations

### Sign Out (Client Component)
```typescript
const { signOut } = useClerk();

<button onClick={() => signOut()}>Sign Out</button>
```

### Open Sign In Modal (Client Component)
```typescript
const { openSignIn } = useClerk();

<button onClick={() => openSignIn()}>Sign In</button>
```

### Redirect to Sign In (Server Component)
```typescript
import { redirect } from 'next/navigation';

if (!user) {
  redirect('/sign-in');
}
```

### Check Role
```typescript
// Server
const isAdmin = user?.publicMetadata?.role === 'ADMIN';

// Client
const isAdmin = user?.publicMetadata?.role === 'ADMIN';
```

## User Properties

```typescript
user.id                              // Clerk user ID
user.emailAddresses[0]?.emailAddress // Primary email
user.firstName                       // First name
user.lastName                        // Last name
user.fullName                        // Full name
user.imageUrl                        // Profile image URL
user.username                        // Username (if enabled)
user.publicMetadata                  // Public metadata (e.g., role)
user.privateMetadata                 // Private metadata
user.unsafeMetadata                  // Unsafe metadata
```

## Protected Routes (via Middleware)

Configured in `/middleware.ts`:
- `/profile/*` - Requires authentication
- `/admin/*` - Requires authentication
- `/campaigns/*/submit` - Requires authentication

## Setting User Role to Admin

### Via Clerk Dashboard
1. Go to Users
2. Select user
3. Metadata tab
4. Public metadata:
```json
{
  "role": "ADMIN"
}
```

### Via API (programmatically)
```typescript
import { clerkClient } from '@clerk/nextjs/server';

await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    role: 'ADMIN'
  }
});
```

## Webhook Events

Handled in `/app/api/webhooks/clerk/route.ts`:
- `user.created` - Auto-creates user in database
- `user.updated` - Updates user in database
- `user.deleted` - Removes user from database

## Environment Variables

Required:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Optional:
```env
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Helper Functions

Located in `/lib/clerk-auth.ts`:

```typescript
// Get current user ID (returns null if not authenticated)
const userId = await getCurrentUser();

// Require authentication (returns null if not authenticated)
const userId = await requireAuth();

// Require admin role (returns null if not admin)
const adminId = await requireAdmin();
```

## TypeScript Types

```typescript
import type { User } from '@clerk/nextjs/server';

// Extend publicMetadata type if needed
declare module '@clerk/nextjs' {
  interface UserPublicMetadata {
    role?: 'USER' | 'ADMIN';
  }
}
```

## Common Patterns

### Loading States
```typescript
const { user, isLoaded } = useUser();

if (!isLoaded) {
  return <LoadingSpinner />;
}
```

### Conditional Rendering
```typescript
{isSignedIn && <UserProfile />}
{!isSignedIn && <SignInButton />}
{isAdmin && <AdminPanel />}
```

### Protected API Route
```typescript
export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  // Process data for authenticated user

  return NextResponse.json({ success: true });
}
```

## Links

- Clerk Docs: https://clerk.com/docs
- Next.js Integration: https://clerk.com/docs/quickstarts/nextjs
- API Reference: https://clerk.com/docs/references/nextjs/overview
- Dashboard: https://dashboard.clerk.com
