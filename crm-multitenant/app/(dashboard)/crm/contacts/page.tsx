import { ContactStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(ContactStatus),
  notes: z.string().optional().or(z.literal("")),
});

async function createContact(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  await prisma.contact.create({
    data: {
      tenantId: session.user.tenantId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/crm/contacts");
  return { success: true };
}

const updateStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(ContactStatus),
});

async function updateContactStatus(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const parsed = updateStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  await prisma.contact.update({
    where: {
      id: parsed.data.id,
      tenantId: session.user.tenantId,
    },
    data: {
      status: parsed.data.status,
    },
  });

  revalidatePath("/crm/contacts");
  return { success: true };
}

export default async function ContactsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const contacts = await prisma.contact.findMany({
    where: {
      tenantId: session.user.tenantId,
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      deals: {
        select: {
          id: true,
          name: true,
          stage: true,
        },
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
          <p className="text-xs font-semibold uppercase text-slate-500">CRM</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Contatos e relacionamento
          </h1>
          <p className="text-sm text-slate-500">
            Cadastre novos contatos e acompanhe status de relacionamento por tenant.
          </p>
        </div>
        <form action={createContact} className="w-full max-w-md space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Nome do contato"
              required
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <input
              name="email"
              type="email"
              placeholder="Email profissional"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <input
              name="company"
              placeholder="Empresa"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <input
              name="phone"
              placeholder="Telefone"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-3">
            <select
              name="status"
              defaultValue={ContactStatus.LEAD}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {Object.values(ContactStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              Adicionar
            </button>
          </div>
          <textarea
            name="notes"
            placeholder="Notas internas, histórico ou próximos passos..."
            className="h-20 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </form>
      </header>

      <div className="space-y-4">
        {contacts.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Nenhum contato cadastrado ainda.
          </p>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1.6fr_1fr]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {contact.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {contact.company ?? "Empresa não informada"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <p>Email: {contact.email ?? "—"}</p>
                  <p>Telefone: {contact.phone ?? "—"}</p>
                  <p>
                    Responsável: {contact.owner?.name ?? "Não atribuído"} (
                    {contact.owner?.email ?? "—"})
                  </p>
                  <p>
                    Deals vinculados:{" "}
                    {contact.deals.length > 0
                      ? contact.deals.map((deal) => deal.name).join(", ")
                      : "Nenhum"}
                  </p>
                </div>
                {contact.notes ? (
                  <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
                    {contact.notes}
                  </p>
                ) : null}
              </div>

              <div className="space-y-4">
                <form
                  action={updateContactStatus}
                  className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <input type="hidden" name="id" value={contact.id} />
                  <label
                    htmlFor={`status-${contact.id}`}
                    className="text-xs font-semibold uppercase text-slate-500"
                  >
                    Status
                  </label>
                  <select
                    id={`status-${contact.id}`}
                    name="status"
                    defaultValue={contact.status}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    {Object.values(ContactStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    Atualizar status
                  </button>
                </form>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-xs text-indigo-800">
                  <p className="font-semibold uppercase tracking-wide">
                    Sugerido pelo agente
                  </p>
                  <p className="mt-1 text-sm">
                    Consulte o canal &quot;Agent Assist&quot; no chat para follow-ups
                    automáticos baseados neste contato.
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
