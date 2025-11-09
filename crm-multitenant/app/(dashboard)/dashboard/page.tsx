import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stageLabels: Record<string, string> = {
  QUALIFY: "Qualificação",
  PITCH: "Apresentação",
  NEGOTIATE: "Negociação",
  WON: "Ganho",
  LOST: "Perdido",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const tenantId = session.user.tenantId;

  const [contactsCount, leadsCount, dealsByStage, tasks, projects, insights] =
    await Promise.all([
      prisma.contact.count({
        where: { tenantId },
      }),
      prisma.contact.count({
        where: { tenantId, status: "LEAD" },
      }),
      prisma.deal.groupBy({
        by: ["stage"],
        where: { tenantId },
        _count: { stage: true },
        _sum: { value: true },
      }),
      prisma.task.findMany({
        where: {
          tenantId,
          status: { not: "DONE" },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          status: true,
          project: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          {
            dueDate: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        take: 6,
      }),
      prisma.project.findMany({
        where: {
          tenantId,
        },
        select: {
          id: true,
          name: true,
          status: true,
          dueDate: true,
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
      }),
      prisma.agentInsight.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const pipelineTotal = dealsByStage.reduce(
    (counter, stage) => counter + (stage._sum.value ?? 0),
    0,
  );

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Contatos</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{contactsCount}</p>
          <p className="mt-2 text-sm text-slate-500">
            {leadsCount} leads ativos aguardando avanço.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Valor em pipeline
          </p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">
            {pipelineTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Soma de oportunidades em todos os estágios.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Tarefas pendentes
          </p>
          <p className="mt-3 text-3xl font-semibold text-amber-600">
            {tasks.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Próximos passos priorizados pelo agente de IA.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Projetos ativos
          </p>
          <p className="mt-3 text-3xl font-semibold text-indigo-600">
            {projects.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Entregas conectadas ao pipeline de vendas.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Pipeline por estágio
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                Conversão de oportunidades
              </h2>
            </div>
          </header>

          <div className="mt-6 space-y-3">
            {dealsByStage.map((stage) => (
              <div
                key={stage.stage}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {stageLabels[stage.stage] ?? stage.stage}
                  </p>
                  <p className="text-xs text-slate-500">{stage._count.stage} deals</p>
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  {(stage._sum.value ?? 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Insights do agente de IA
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Recomendações recentes
            </h2>

            <div className="mt-4 space-y-4">
              {insights.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum insight ainda. Solicite uma análise no chat do agente de IA.
                </p>
              ) : (
                insights.map((insight) => (
                  <article
                    key={insight.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="text-xs text-slate-500">
                      {format(insight.createdAt, "dd MMM yyyy · HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900">
                      {insight.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{insight.summary}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Próximas tarefas
            </p>
            <div className="mt-4 space-y-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhuma tarefa pendente. Ótimo trabalho!
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500">
                        {task.project?.name ? `Projeto · ${task.project.name}` : "Task"}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-amber-600">
                      {task.dueDate
                        ? format(task.dueDate, "dd MMM", { locale: ptBR })
                        : "Sem prazo"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Projetos conectados
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <p className="text-sm text-slate-500">
              Ainda não existem projetos cadastrados.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">{project.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Tarefas: {project._count.tasks}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Status: <span className="font-medium">{project.status}</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {project.dueDate
                    ? `Entrega prevista em ${format(project.dueDate, "dd MMM yyyy", {
                        locale: ptBR,
                      })}`
                    : "Sem due date"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
