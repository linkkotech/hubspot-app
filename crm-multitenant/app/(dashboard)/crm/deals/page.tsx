import { DealStage } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const dealSchema = z.object({
  name: z.string().min(2),
  value: z.coerce.number().nonnegative(),
  stage: z.nativeEnum(DealStage),
  contactId: z.string().cuid().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

async function createDeal(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const parsed = dealSchema.safeParse({
    name: formData.get("name"),
    value: formData.get("value"),
    stage: formData.get("stage"),
    contactId: formData.get("contactId"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  await prisma.deal.create({
    data: {
      tenantId: session.user.tenantId,
      name: parsed.data.name,
      value: parsed.data.value,
      stage: parsed.data.stage,
      notes: parsed.data.notes || null,
      contactId: parsed.data.contactId || null,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/crm/deals");
  return { success: true };
}

const updateDealSchema = z.object({
  id: z.string().cuid(),
  stage: z.nativeEnum(DealStage),
});

async function updateDealStage(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const parsed = updateDealSchema.safeParse({
    id: formData.get("id"),
    stage: formData.get("stage"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  await prisma.deal.update({
    where: {
      id: parsed.data.id,
      tenantId: session.user.tenantId,
    },
    data: {
      stage: parsed.data.stage,
    },
  });

  revalidatePath("/crm/deals");
  return { success: true };
}

export default async function DealsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [deals, contacts] = await Promise.all([
    prisma.deal.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        owner: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { stage: "asc" },
        { updatedAt: "desc" },
      ],
    }),
    prisma.contact.findMany({
      where: { tenantId: session.user.tenantId },
      select: {
        id: true,
        name: true,
        company: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">CRM</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Oportunidades e pipeline
          </h1>
          <p className="text-sm text-slate-500">
            Planeje seus deals por estágio e conecte-os a projetos após o fechamento.
          </p>
        </div>
        <form action={createDeal} className="w-full max-w-xl space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Título da oportunidade"
              required
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <input
              name="value"
              type="number"
              placeholder="Valor estimado (R$)"
              min={0}
              step="0.01"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <select
              name="stage"
              defaultValue={DealStage.QUALIFY}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {Object.values(DealStage).map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            <select
              name="contactId"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Contato relacionado (opcional)</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                  {contact.company ? ` · ${contact.company}` : ""}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="notes"
            placeholder="Notas, próximos passos e expectativa de fechamento..."
            className="h-20 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Criar oportunidade
          </button>
        </form>
      </header>

      <div className="space-y-4">
        {deals.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Nenhuma oportunidade cadastrada no momento.
          </p>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.id}
              className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1.5fr_1fr]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {deal.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Responsável: {deal.owner?.name ?? "Não atribuído"}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-emerald-600">
                    {deal.value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
                  <p>
                    Contato: {deal.contact?.name ?? "—"}
                    {deal.contact?.company ? ` · ${deal.contact.company}` : ""}
                  </p>
                  {deal.notes ? <p className="mt-2">{deal.notes}</p> : null}
                </div>
              </div>

              <div className="space-y-4">
                <form
                  action={updateDealStage}
                  className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <input type="hidden" name="id" value={deal.id} />
                  <label
                    htmlFor={`stage-${deal.id}`}
                    className="text-xs font-semibold uppercase text-slate-500"
                  >
                    Estágio do pipeline
                  </label>
                  <select
                    id={`stage-${deal.id}`}
                    name="stage"
                    defaultValue={deal.stage}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    {Object.values(DealStage).map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    Atualizar estágio
                  </button>
                </form>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-800">
                  <p className="font-semibold uppercase tracking-wide">
                    Insight do agente
                  </p>
                  <p className="mt-1 text-sm">
                    Peça ao assistente de IA uma análise de probabilidade de fechamento
                    considerando interações recentes deste deal.
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
