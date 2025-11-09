import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-lg font-semibold text-indigo-200">
            N
          </span>
          <div>
            <p className="text-sm font-semibold text-indigo-200">NovaCRM</p>
            <p className="text-xs text-slate-400">
              Multi-tenant CRM com agente de IA integrado
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/login"
            className="rounded-lg border border-white/10 px-4 py-2 text-slate-100 transition hover:border-indigo-400 hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400"
          >
            Criar workspace
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center gap-12 px-6 pb-24 pt-10 text-slate-100">
        <div className="max-w-3xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-100">
            CRM · Projetos · Chat · IA
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Relacionamento, entrega e comunicação em um único workspace inteligente.
          </h1>
          <p className="text-lg text-slate-300">
            Automatize follow-ups, receba recomendações do agente de IA e mantenha equipes
            alinhadas entre CRM, projetos e chat — com segurança multi-tenant nativa.
          </p>
        </div>

        <div className="grid w-full gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">
              Inteligência em cada pipeline
            </h2>
            <p className="text-sm text-slate-200">
              Análises de deals, alertas de churn e sugestões de próximos passos com base nas
              interações dos seus contatos.
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">
              Projetos conectados ao CRM
            </h2>
            <p className="text-sm text-slate-200">
              Converta oportunidades em entregas, monitore tarefas e milestones em tempo real
              para cada cliente.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
