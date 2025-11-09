"use client";

import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { useState } from "react";

type UserMenuProps = {
  user: User;
};

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((state) => !state)}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-sm font-medium text-slate-900 shadow-sm transition hover:border-indigo-200"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-600">
          {user.name?.charAt(0)?.toUpperCase() ?? "?"}
        </span>
        <div className="hidden text-xs text-slate-500 sm:flex sm:flex-col">
          <span className="font-semibold text-slate-900">{user.name ?? "Usuário"}</span>
          <span>{user.email}</span>
        </div>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-lg">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Workspace
            </p>
            <p className="text-sm font-medium text-slate-900">
              {user.role === "ADMIN" ? "Administrador" : "Colaborador"}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl: "/login",
              })
            }
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
