import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { ChatClient } from "@/components/dashboard/chat-client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const channels = await prisma.chatChannel.findMany({
    where: {
      tenantId: session.user.tenantId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Comunicação
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Hub colaborativo com agente de IA
        </h1>
        <p className="text-sm text-slate-500">
          Centralize conversas por tenant e peça recomendações instantâneas ao agente
          Nova para priorizar relacionamentos e entregas.
        </p>
      </header>

      <ChatClient channels={channels} />
    </section>
  );
}
