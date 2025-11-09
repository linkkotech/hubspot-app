import OpenAI from "openai";

import { prisma } from "./prisma";

const openaiApiKey = process.env.OPENAI_API_KEY;

const client = openaiApiKey
  ? new OpenAI({
      apiKey: openaiApiKey,
    })
  : null;

async function buildTenantContext(tenantId: string) {
  const [contacts, deals, tasks] = await Promise.all([
    prisma.contact.findMany({
      where: { tenantId },
      select: {
        name: true,
        company: true,
        status: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    }),
    prisma.deal.findMany({
      where: { tenantId },
      select: {
        name: true,
        stage: true,
        value: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    }),
    prisma.task.findMany({
      where: { tenantId, status: { not: "DONE" } },
      select: {
        title: true,
        status: true,
        dueDate: true,
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
    }),
  ]);

  return JSON.stringify(
    {
      contacts,
      deals,
      tasks,
    },
    null,
    2,
  );
}

export async function generateTenantInsight(tenantId: string, focus: string) {
  const context = await buildTenantContext(tenantId);

  if (!client) {
    return {
      title: "Insight estático (configurar OPENAI_API_KEY)",
      summary:
        "Configure a variável OPENAI_API_KEY para receber insights gerados pelo agente de IA. Enquanto isso, utilize os dados do dashboard para identificar prioridades.",
    };
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Você é um agente de IA especializado em CRM multi-tenant. Gere um insight curto e acionável com título e resumo baseado no contexto fornecido.",
      },
      {
        role: "user",
        content: `Contexto do tenant:\n${context}\n\nFoco da análise: ${focus}\n\nResponda no formato JSON com campos { "title": string, "summary": string }.`,
      },
    ],
  });

  const text = response.output_text;

  try {
    const parsed = JSON.parse(text ?? "{}") as { title?: string; summary?: string };
    return {
      title: parsed.title ?? "Insight gerado",
      summary:
        parsed.summary ??
        "O agente gerou um insight, mas não foi possível interpretar o conteúdo.",
    };
  } catch {
    return {
      title: "Insight gerado",
      summary: text ?? "Não foi possível interpretar o resultado da IA.",
    };
  }
}

export async function generateAgentReply(
  tenantId: string,
  channelName: string,
  prompt: string,
) {
  const context = await buildTenantContext(tenantId);

  if (!client) {
    return (
      "Configure a variável OPENAI_API_KEY para ativar respostas inteligentes. " +
      "Enquanto isso, priorize leads qualificados e deals em negociação."
    );
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Você é um agente de IA dentro de um CRM multi-tenant. Seja colaborativo, objetivo e gere próximos passos acionáveis.",
      },
      {
        role: "user",
        content: `Canal: ${channelName}\nContexto do tenant:\n${context}\n\nSolicitação:\n${prompt}`,
      },
    ],
  });

  return response.output_text ?? "Não consegui gerar uma resposta no momento.";
}
