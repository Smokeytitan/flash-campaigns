/**
 * NextAuth v5 Configuration
 * Handles session management for Flash Campaigns
 */

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db/prisma';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      xHandle?: string | null;
      xAvatarUrl?: string | null;
      telegramUsername?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'USER' | 'ADMIN';
    xHandle?: string | null;
    xAvatarUrl?: string | null;
    telegramUsername?: string | null;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.xHandle = user.xHandle;
        token.xAvatarUrl = user.xAvatarUrl;
        token.telegramUsername = user.telegramUsername;
      }

      // Handle session updates (e.g., after connecting X or Telegram)
      if (trigger === 'update' && session) {
        if (session.xHandle !== undefined) {
          token.xHandle = session.xHandle;
        }
        if (session.xAvatarUrl !== undefined) {
          token.xAvatarUrl = session.xAvatarUrl;
        }
        if (session.telegramUsername !== undefined) {
          token.telegramUsername = session.telegramUsername;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN';
        session.user.xHandle = token.xHandle as string | null;
        session.user.xAvatarUrl = token.xAvatarUrl as string | null;
        session.user.telegramUsername = token.telegramUsername as string | null;
      }
      return session;
    },
  },
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize() {
        // This is a placeholder - actual auth happens via X OAuth
        return null;
      },
    },
  ],
});
