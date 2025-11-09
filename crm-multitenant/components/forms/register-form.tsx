"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RegisterResponse = {
  tenant: {
    slug: string;
  };
};

export function RegisterForm() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!tenantName || !tenantSlug || !name || !email || !password) {
      setError("Preencha todos os campos para criar seu workspace.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantName,
          tenantSlug,
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.message ?? "Não foi possível criar o workspace.");
      }

      const payload = (await response.json()) as RegisterResponse;
      setSuccess("Workspace criado com sucesso! Redirecionando...");

      const login = await signIn("credentials", {
        redirect: false,
        tenant: payload.tenant.slug,
        email,
        password,
      });

      if (login?.error) {
        setError("Workspace criado, mas não foi possível autenticar automaticamente.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Erro inesperado.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="tenantName"
            className="text-sm font-medium text-slate-900"
          >
            Nome da empresa
          </label>
          <input
            id="tenantName"
            value={tenantName}
            onChange={(event) => setTenantName(event.currentTarget.value)}
            placeholder="Minha Empresa"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="tenantSlug"
            className="text-sm font-medium text-slate-900"
          >
            URL do workspace
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
            <span className="text-slate-400">nova.crm/</span>
            <input
              id="tenantSlug"
              value={tenantSlug}
              onChange={(event) =>
                setTenantSlug(event.currentTarget.value.trim().toLowerCase())
              }
              placeholder="minha-empresa"
              className="w-full border-none bg-transparent text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-slate-900">
            Seu nome
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            placeholder="João Silva"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-900">
            Email corporativo
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            placeholder="voce@empresa.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-900"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            placeholder="********"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-slate-900"
          >
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
            placeholder="********"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Criando workspace..." : "Criar workspace"}
      </button>
    </form>
  );
}
