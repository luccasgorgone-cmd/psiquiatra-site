"use client";

import Link from "next/link";
import { useActionState } from "react";
import { patientLogin } from "../actions";
import { HeartPulse, Loader2, ArrowLeft } from "lucide-react";

export default function PatientLogin() {
  const [state, action, pending] = useActionState(patientLogin, null as { error?: string } | null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand/50 px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-ivory">
            <HeartPulse className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-serif text-2xl text-ink">Área do paciente</h1>
          <p className="mt-2 text-sm text-muted">Acesse para ver seus agendamentos e mensagens</p>
        </div>

        <form action={action} className="card space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm text-graphite">E-mail</span>
            <input name="email" type="email" required className="fld" placeholder="voce@email.com" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-graphite">Senha</span>
            <input name="password" type="password" required className="fld" placeholder="••••••••" />
          </label>
          {state?.error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Ainda não tem conta?{" "}
          <Link href="/paciente/cadastro" className="font-medium text-brand hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
