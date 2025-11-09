import Link from "next/link";

import { RegisterForm } from "@/components/forms/register-form";

export const metadata = {
  title: "Criar workspace | NovaCRM",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black px-6 py-10 text-slate-50">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg md:grid-cols-[1.15fr_1fr]">
        <section className="space-y-10 p-12">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-violet-200">
              NovaCRM · Agente de IA
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
              Monte seu hub inteligente de relacionamento em minutos.
            </h1>
            <p className="text-sm text-slate-200 md:text-base">
              Cadastre sua empresa, convide a equipe e deixe o agente de IA antecipar
              oportunidades, riscos e próximos passos prioritários.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-slate-100">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400" />
              CRM completo com pipeline, contatos e insights inteligentes por tenant.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sky-400" />
              Projetos colaborativos com tarefas, due dates e visão geral unificada.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-amber-400" />
              Chat interno + canal dedicado para o agente de IA assistir o time.
            </li>
          </ul>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100">
            <h2 className="text-base font-semibold text-white">
              Já possui um workspace?
            </h2>
            <p className="mt-2 text-sm text-slate-200">
              Acesse com suas credenciais ou peça um convite ao administrador.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Ir para login
            </Link>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white p-12 text-slate-900 md:border-l md:border-t-0">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Crie seu workspace
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Dados seguros e isolados por tenant, com onboarding rápido.
              </p>
            </div>
            <RegisterForm />
            <p className="text-center text-xs text-slate-500">
              Ao continuar, você declara que está de acordo com nossos termos e política.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
