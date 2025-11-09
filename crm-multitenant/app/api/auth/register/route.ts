import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  tenantName: z.string().min(2),
  tenantSlug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = registerSchema.parse({
      ...payload,
      tenantSlug: String(payload?.tenantSlug ?? "").trim().toLowerCase(),
      email: String(payload?.email ?? "").trim().toLowerCase(),
    });

    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: data.tenantSlug },
    });

    if (existingTenant) {
      return NextResponse.json(
        { message: "Workspace already exists. Try another slug." },
        { status: 409 },
      );
    }

    const passwordHash = await hash(data.password, 12);

    const tenant = await prisma.tenant.create({
      data: {
        name: data.tenantName,
        slug: data.tenantSlug,
        users: {
          create: {
            name: data.name,
            email: data.email,
            passwordHash,
            role: "ADMIN",
          },
        },
        chatChannels: {
          create: [
            {
              name: "General",
              type: "TEAM",
            },
            {
              name: "Agent Assist",
              type: "AI",
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    return NextResponse.json(
      {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        admin: {
          id: tenant.users[0]?.id,
          email: tenant.users[0]?.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid form data", issues: error.issues },
        { status: 422 },
      );
    }

    console.error("[REGISTER]", error);
    return NextResponse.json(
      { message: "Failed to create workspace" },
      { status: 500 },
    );
  }
}
