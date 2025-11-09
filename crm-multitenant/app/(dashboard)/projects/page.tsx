import { TaskPriority, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

async function createProject(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  await prisma.project.create({
    data: {
      tenantId: session.user.tenantId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/projects");
  return { success: true };
}

const taskSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(2),
  dueDate: z.string().optional().or(z.literal("")),
  priority: z.nativeEnum(TaskPriority),
});

async function createTask(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const parsed = taskSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  await prisma.task.create({
    data: {
      tenantId: session.user.tenantId,
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      status: "TODO",
      assigneeId: session.user.id,
    },
  });

  revalidatePath("/projects");
  return { success: true };
}

const updateTaskSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(TaskStatus),
});

async function updateTaskStatus(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const parsed = updateTaskSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  await prisma.task.update({
    where: {
      id: parsed.data.id,
      tenantId: session.user.tenantId,
    },
    data: {
      status: parsed.data.status,
    },
  });

  revalidatePath("/projects");
  return { success: true };
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: {
      tenantId: session.user.tenantId,
    },
    include: {
      tasks: {
        orderBy: [
          { status: "asc" },
          { dueDate: "asc" },
        ],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Projetos
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Entregas conectadas ao CRM
          </h1>
          <p className="text-sm text-slate-500">
            Estruture projetos vinculados a clientes e deals com governança multi-tenant.
          </p>
        </div>
        <form action={createProject} className="w-full max-w-xl space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Nome do projeto"
              required
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <input
              name="dueDate"
              type="date"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <textarea
            name="description"
            placeholder="Escopo, objetivos e indicadores-chave de sucesso..."
            className="h-20 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Criar projeto
          </button>
        </form>
      </header>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Nenhum projeto cadastrado. Crie o primeiro acima.
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {project.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {project.description ?? "Projeto sem descrição detalhada."}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-600">
                    Tarefas: {project.tasks.length}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-600">
                    {project.dueDate
                      ? new Date(project.dueDate).toLocaleDateString("pt-BR")
                      : "Sem prazo"}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <div className="space-y-3">
                  {project.tasks.length === 0 ? (
                    <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      Nenhuma tarefa adicionada ainda.
                    </p>
                  ) : (
                    project.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            Prioridade: {task.priority} ·{" "}
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString("pt-BR")
                              : "Sem prazo"}
                          </p>
                        </div>
                        <form action={updateTaskStatus} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={task.id} />
                          <select
                            name="status"
                            defaultValue={task.status}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          >
                            {Object.values(TaskStatus).map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          >
                            Atualizar
                          </button>
                        </form>
                      </div>
                    ))
                  )}
                </div>

                <form
                  action={createTask}
                  className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <input type="hidden" name="projectId" value={project.id} />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Adicionar tarefa
                  </h3>
                  <input
                    name="title"
                    placeholder="Nome da tarefa"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <div className="flex gap-2">
                    <select
                      name="priority"
                      defaultValue={TaskPriority.MEDIUM}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      {Object.values(TaskPriority).map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                    <input
                      name="dueDate"
                      type="date"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    Criar tarefa
                  </button>
                  <p className="text-xs text-slate-500">
                    O agente de IA revisa tarefas abertas para sugerir prioridades via chat.
                  </p>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
