import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      tenantId: string;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    tenantId: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId?: string;
    role?: UserRole;
  }
}
