"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { UserMenu } from "./user-menu";

type AppShellProps = {
  children: React.ReactNode;
};

const navigation = [
  { label: "Visão geral", href: "/dashboard", icon: "📊" },
  { label: "Contatos", href: "/crm/contacts", icon: "👥" },
  { label: "Oportunidades", href: "/crm/deals", icon: "💼" },
  { label: "Projetos", href: "/projects", icon: "🗂️" },
  { label: "Chat", href: "/chat", icon: "💬" },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Carregando workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen gap-0 md:grid-cols-[260px_1fr]">
        <aside className="hidden min-h-screen flex-col justify-between border-r border-slate-200 bg-white px-6 py-8 md:flex">
          <div className="space-y-10">
            <div>
              <p className="text-sm font-semibold text-indigo-600">NovaCRM</p>
              <p className="text-xs text-slate-500">
                Workspace · {session.user.tenantId.slice(0, 6)}
              </p>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-medium text-slate-900">Agente de IA ativo</p>
            <p>
              Habilite automações de follow-up, sumarização de reuniões e leitura de canais.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
            >
              Abrir assistente →
            </Link>
          </div>
        </aside>

        <div className="flex flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 md:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tenant ativo
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {session.user.email?.split("@")[1] ?? "Workspace"}
              </p>
            </div>
            <UserMenu user={session.user} />
          </header>

          <main className="flex-1 bg-slate-100 p-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
              <div className="hidden items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 md:flex">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tenant ativo
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {session.user.email?.split("@")[1] ?? "Workspace"}
                  </p>
                </div>
                <UserMenu user={session.user} />
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
