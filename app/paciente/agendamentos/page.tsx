import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { getPatientSession } from "@/lib/patient-auth";
import { cancelMyAppointment } from "../actions";
import { CLINIC_TZ } from "@/lib/availability";
import { CalendarPlus, CalendarClock, RefreshCw, X, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TZ, weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit",
  }).format(d);

const badge: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-700",
  CONFIRMADO: "bg-brand/12 text-brand",
  CANCELADO: "bg-red-100 text-red-600",
  CONCLUIDO: "bg-ink/[0.06] text-muted",
};

export default async function MeusAgendamentos({
  searchParams,
}: {
  searchParams: Promise<{ reagendado?: string }>;
}) {
  const me = (await getPatientSession())!;
  const { reagendado } = await searchParams;
  const now = new Date();
  const all = await db
    .select()
    .from(appointments)
    .where(eq(appointments.patientId, me.id))
    .orderBy(desc(appointments.start));

  const upcoming = all.filter((a) => new Date(a.start) >= now && a.status !== "CANCELADO");
  const past = all.filter((a) => new Date(a.start) < now || a.status === "CANCELADO");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Meus agendamentos</h1>
          <p className="mt-2 text-muted">Veja, reagende ou cancele suas consultas.</p>
        </div>
        <Link href="/agendar" className="btn-primary">
          <CalendarPlus className="h-4 w-4" /> Nova consulta
        </Link>
      </div>

      {reagendado && (
        <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand">
          <CheckCircle2 className="h-4 w-4" /> Consulta reagendada com sucesso.
        </p>
      )}

      <h2 className="mb-3 mt-8 font-serif text-lg text-ink">Próximas</h2>
      {upcoming.length === 0 ? (
        <p className="rounded-xl border border-ink/[0.07] bg-white p-6 text-sm text-muted">
          Você não tem consultas marcadas.
        </p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl2 border border-ink/[0.07] bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <CalendarClock className="h-5 w-5" />
                </span>
                <div>
                  <p className="capitalize text-ink">{fmt(new Date(a.start))}</p>
                  <p className="text-sm capitalize text-muted">{a.mode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge[a.status]}`}>{a.status}</span>
                <Link
                  href={`/paciente/agendamentos/${a.id}/reagendar`}
                  className="inline-flex items-center gap-1 rounded-lg border border-ink/10 px-3 py-2 text-sm text-graphite hover:bg-ink/[0.04]"
                >
                  <RefreshCw className="h-4 w-4" /> Reagendar
                </Link>
                <form action={cancelMyAppointment}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    <X className="h-4 w-4" /> Cancelar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 font-serif text-lg text-ink">Histórico</h2>
          <div className="space-y-2">
            {past.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-ink/[0.06] bg-white/60 px-4 py-3 text-sm">
                <span className="capitalize text-graphite">{fmt(new Date(a.start))} · {a.mode}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${badge[a.status]}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
