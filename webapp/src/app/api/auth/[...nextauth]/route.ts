// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, Session, User as NextAuthUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { compare } from 'bcryptjs';
import { UserRole } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email.toLowerCase().trim() 
          }
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error('Account is inactive. Please contact support.');
        }

        // Verify password
        const isPasswordValid = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        // Return user object for JWT
        return {
          id: user.id,
          email: user.email,
          name: user.khcAdvocateName,
          role: user.role,
          khcAdvocateId: user.khcAdvocateId,
          khcAdvocateName: user.khcAdvocateName,
          isVerified: user.isVerified,
          image: null
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }: {
      token: JWT;
      user?: NextAuthUser;
      trigger?: 'signIn' | 'signUp' | 'update';
      session?: any;
    }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.khcAdvocateId = user.khcAdvocateId;
        token.khcAdvocateName = user.khcAdvocateName;
        token.isVerified = user.isVerified;
      }

      // Handle session updates (e.g., profile changes)
      if (trigger === 'update' && session) {
        token.name = session.name || token.name;
        token.khcAdvocateName = session.khcAdvocateName || token.khcAdvocateName;
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.khcAdvocateId = token.khcAdvocateId as string;
        session.user.khcAdvocateName = token.khcAdvocateName as string;
        session.user.isVerified = token.isVerified as boolean;
      }

      return session;
    }
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/auth/welcome'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };