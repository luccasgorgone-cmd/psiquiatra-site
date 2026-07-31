"use client";

import Link from "next/link";
import { useActionState } from "react";
import { patientRegister } from "../actions";
import { UserPlus, Loader2, ArrowLeft } from "lucide-react";

export default function PatientRegister() {
  const [state, action, pending] = useActionState(patientRegister, null as { error?: string } | null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand/50 px-6 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-ivory">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-serif text-2xl text-ink">Criar conta de paciente</h1>
          <p className="mt-2 text-sm text-muted">Acompanhe seus agendamentos e converse com o médico</p>
        </div>

        <form action={action} className="card space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm text-graphite">Nome completo</span>
            <input name="name" required className="fld" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-graphite">E-mail</span>
              <input name="email" type="email" required className="fld" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-graphite">Telefone / WhatsApp</span>
              <input name="phone" className="fld" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-graphite">Senha</span>
              <input name="password" type="password" required className="fld" placeholder="mín. 6 caracteres" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-graphite">Confirmar senha</span>
              <input name="confirm" type="password" required className="fld" />
            </label>
          </div>
          {state?.error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Criar conta
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/paciente/login" className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
