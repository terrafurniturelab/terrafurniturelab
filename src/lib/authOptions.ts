import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            accounts: true
          }
        });

        if (!user || !user.password) {
          throw new Error('No user found');
        }

        // Check if user has any OAuth accounts
        if (user.accounts.length > 0) {
          throw new Error('Please sign in with Google');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists with this specific Google account
          const existingAccount = await prisma.account.findFirst({
            where: {
              provider: "google",
              providerAccountId: account.providerAccountId
            },
            include: {
              user: true
            }
          });

          if (existingAccount) {
            // If this specific Google account is already linked, allow sign in
            return true;
          }

          // Check if user exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
              accounts: true
            }
          });

          if (existingUser) {
            // If user exists but doesn't have this specific Google account
            if (existingUser.accounts.length > 0) {
              // User has other Google accounts, don't allow this one
              return false;
            }
            if (existingUser.password) {
              // User has password auth, don't allow Google
              return false;
            }
          }

          // Allow new user registration with this Google account
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = { ...session.user, id: token.sub! };
      }
      session.accessToken = token.accessToken;
      return session;
    }
  },
  events: {
    async signOut({ token }) {
      if (token) {
        token.accessToken = undefined;
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}; 