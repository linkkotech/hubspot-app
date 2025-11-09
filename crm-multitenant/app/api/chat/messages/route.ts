import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { generateAgentReply } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

const createMessageSchema = z.object({
  channelId: z.string().cuid(),
  content: z.string().min(1),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId");

  if (!channelId) {
    return NextResponse.json({ message: "Canal não informado." }, { status: 400 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: {
      tenantId: session.user.tenantId,
      channelId,
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(
    messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      isAgent: message.isAgent,
      authorName: message.author?.name ?? "Agente Nova",
    })),
  );
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
    }

    const payload = await request.json();
    const data = createMessageSchema.parse(payload);

    const channel = await prisma.chatChannel.findUnique({
      where: {
        id: data.channelId,
        tenantId: session.user.tenantId,
      },
    });

    if (!channel) {
      return NextResponse.json({ message: "Canal não encontrado." }, { status: 404 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        tenantId: session.user.tenantId,
        channelId: data.channelId,
        authorId: session.user.id,
        content: data.content,
      },
    });

    let agentReply: string | null = null;

    if (channel.type === "AI") {
      agentReply = await generateAgentReply(
        session.user.tenantId,
        channel.name,
        data.content,
      );

      await prisma.chatMessage.create({
        data: {
          tenantId: session.user.tenantId,
          channelId: data.channelId,
          content: agentReply,
          isAgent: true,
        },
      });
    }

    return NextResponse.json(
      {
        message: {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          isAgent: message.isAgent,
          authorName: session.user.name ?? "Você",
        },
        agentReply,
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

    console.error("[CHAT_MESSAGE]", error);
    return NextResponse.json(
      { message: "Não foi possível enviar a mensagem." },
      { status: 500 },
    );
  }
}
