// =============================================================================
// AUTH CONFIGURATION
// =============================================================================

import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { db } from "@/lib/db";

async function sendVerificationRequest(params: {
  identifier: string;
  url: string;
  expires: Date;
  provider: { server: unknown; from: string };
}) {
  const { createTransport } = await import("nodemailer");
  const transport = createTransport(params.provider.server as string);

  try {
    await transport.sendMail({
      to: params.identifier,
      from: params.provider.from,
      subject: "Sign in to DataForge",
      text: `Click this link to sign in: ${params.url}`,
      html: `<p>Click this link to sign in:</p><p><a href="${params.url}">Sign in to DataForge</a></p>`,
    });
    console.log("[AUTH] Verification email sent to:", params.identifier);
  } catch (error) {
    console.error("[AUTH] Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "ssgeorge480@gmail.com" &&
          credentials?.password === "Mitsan@9090"
        ) {
          return {
            id: "dev-user-1",
            email: "ssgeorge480@gmail.com",
            name: "S George",
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

