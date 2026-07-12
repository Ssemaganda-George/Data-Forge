// =============================================================================
// AUTH CONFIGURATION
//
// ── TEMP MODE (active) ───────────────────────────────────────────────────────
// Uses a hardcoded CredentialsProvider + JWT sessions so the app works without
// a database. Switch to DB MODE below once the DB is connected.
//
// ── DB MODE (commented out) ──────────────────────────────────────────────────
// To restore:
//   1. Comment out / delete the TEMP MODE block below.
//   2. Uncomment the DB MODE block.
//   3. Ensure DATABASE_URL is set and `npm run db:push` has been run.
//   4. Switch session strategy back to "database".
// =============================================================================

// ── TEMP MODE ─────────────────────────────────────────────────────────────────
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

const DEV_USER = {
  id: "dev-user-1",
  email: "ssgeorge480@gmail.com",
  name: "S George",
};

const DEV_PASSWORD = "Mitsan@9090";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === DEV_USER.email &&
          credentials?.password === DEV_PASSWORD
        ) {
          return DEV_USER;
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
// ── END TEMP MODE ─────────────────────────────────────────────────────────────

// ── DB MODE (uncomment when DB is ready) ─────────────────────────────────────
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import GoogleProvider from "next-auth/providers/google";
// import EmailProvider from "next-auth/providers/email";
// import type { NextAuthOptions } from "next-auth";
// import { db } from "@/lib/db";
//
// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
//   providers: [
//     ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
//       ? [
//           GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//           }),
//         ]
//       : []),
//     EmailProvider({
//       server: process.env.EMAIL_SERVER ?? "smtp://localhost:1025",
//       from: process.env.EMAIL_FROM ?? "noreply@dataforge.dev",
//     }),
//   ],
//   session: { strategy: "database" },
//   pages: {
//     signIn: "/login",
//     newUser: "/",
//   },
//   callbacks: {
//     session({ session, user }) {
//       if (session.user) {
//         session.user.id = user.id;
//       }
//       return session;
//     },
//   },
// };
// ── END DB MODE ───────────────────────────────────────────────────────────────

