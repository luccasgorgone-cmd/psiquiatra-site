"use client";

import { useActionState } from "react";
import { loginAction } from "../auth-actions";
import { Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null as { error?: string } | null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand/50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-ivory">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-serif text-2xl text-ink">Painel administrativo</h1>
          <p className="mt-2 text-sm text-muted">Acesse para gerenciar o site</p>
        </div>

        <form action={action} className="card space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm text-graphite">Usuário ou e-mail</span>
            <input name="email" type="text" autoCapitalize="none" autoComplete="username" required className="fld" placeholder="guilhermedelnery" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-graphite">Senha</span>
            <input name="password" type="password" required className="fld" placeholder="••••••••" />
          </label>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>
          )}

          <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
