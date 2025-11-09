import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        tenant: {
          label: "Workspace",
          type: "text",
          placeholder: "your-company",
        },
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.tenant) {
          return null;
        }

        const tenant = await prisma.tenant.findUnique({
          where: { slug: credentials.tenant.trim().toLowerCase() },
        });

        if (!tenant) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email.trim().toLowerCase(),
            tenantId: tenant.id,
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = (user as unknown as { tenantId: string }).tenantId;
        token.role = (user as unknown as { role: string }).role;
      } else if (!token.tenantId && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { tenantId: true, role: true },
        });

        if (dbUser) {
          token.tenantId = dbUser.tenantId;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.tenantId = token.tenantId as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
