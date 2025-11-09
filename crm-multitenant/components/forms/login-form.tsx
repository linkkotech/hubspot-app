"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [tenant, setTenant] = useState(params.get("workspace") ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!tenant || !email || !password) {
      setError("Preencha todos os campos para entrar.");
      return;
    }

    setIsLoading(true);

    const response = await signIn("credentials", {
      redirect: false,
      tenant,
      email,
      password,
    });

    setIsLoading(false);

    if (response?.error) {
      setError("Credenciais inválidas ou workspace inexistente.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-900" htmlFor="tenant">
          Workspace
        </label>
        <input
          id="tenant"
          name="tenant"
          value={tenant}
          onChange={(event) => setTenant(event.currentTarget.value)}
          placeholder="sua-empresa"
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-900" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          placeholder="voce@empresa.com"
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="space-y-1.5">
        <label
          className="text-sm font-medium text-slate-900"
          htmlFor="password"
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          placeholder="********"
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Autenticando..." : "Entrar"}
      </button>
    </form>
  );
}
