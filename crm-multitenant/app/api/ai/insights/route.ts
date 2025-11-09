import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { generateTenantInsight } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  focus: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
    }

    const payload = await request.json();
    const data = bodySchema.parse(payload);

    const insight = await generateTenantInsight(
      session.user.tenantId,
      data.focus ?? "Visão geral",
    );

    const stored = await prisma.agentInsight.create({
      data: {
        tenantId: session.user.tenantId,
        title: insight.title,
        summary: insight.summary,
      },
    });

    return NextResponse.json(
      {
        id: stored.id,
        title: stored.title,
        summary: stored.summary,
        createdAt: stored.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: error.issues },
        { status: 422 },
      );
    }

    console.error("[AI_INSIGHTS]", error);
    return NextResponse.json(
      { message: "Não foi possível gerar o insight no momento." },
      { status: 500 },
    );
  }
}
