import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

export const metadata = {
  title: "Entrar | NovaCRM",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black px-6 py-10 text-slate-50">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg md:grid-cols-[1.2fr_1fr]">
        <section className="space-y-10 p-12">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-200">
              NovaCRM · Multi-tenant
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
              Centralize clientes, projetos e conversas em um único lugar.
            </h1>
            <p className="text-sm text-slate-200 md:text-base">
              Conecte sua operação ao agente de IA integrado e entregue experiências
              personalizadas para cada workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100">
            <h2 className="text-base font-semibold text-white">
              Ainda não tem uma conta?
            </h2>
            <p className="mt-2 text-sm text-slate-200">
              Crie um workspace gratuito e convide sua equipe em minutos.
            </p>
            <Link
              href="/register"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Criar workspace
            </Link>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white/10 p-12 text-slate-900 md:border-l md:border-t-0">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Bem-vindo de volta
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Acesse a plataforma com suas credenciais.
              </p>
            </div>
            <LoginForm />
            <p className="text-center text-xs text-slate-500">
              Ao entrar, você concorda com os termos de uso e política de privacidade.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
