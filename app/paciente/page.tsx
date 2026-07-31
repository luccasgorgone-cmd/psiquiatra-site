import Link from "next/link";
import { and, desc, eq, gte, ne, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments, patientMessages } from "@/lib/db/schema";
import { getPatientSession } from "@/lib/patient-auth";
import { getSettings } from "@/lib/queries";
import { whatsappLink } from "@/lib/utils";
import { CLINIC_TZ } from "@/lib/availability";
import { CalendarPlus, CalendarDays, MessageSquare, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TZ, weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit",
  }).format(d);

export default async function PatientHome() {
  const me = (await getPatientSession())!;
  const now = new Date();
  const [upcoming, unread, settings] = await Promise.all([
    db
      .select()
      .from(appointments)
      .where(and(eq(appointments.patientId, me.id), gte(appointments.start, now), ne(appointments.status, "CANCELADO")))
      .orderBy(appointments.start),
    db
      .select({ n: count() })
      .from(patientMessages)
      .where(and(eq(patientMessages.patientId, me.id), eq(patientMessages.sender, "doctor"), eq(patientMessages.readByPatient, false))),
    getSettings(),
  ]);
  const next = upcoming[0];
  const unreadN = Number(unread[0]?.n || 0);
  const waHref = settings?.whatsapp ? whatsappLink(settings.whatsapp, "Olá! Sou paciente e gostaria de ajuda.") : "#";

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Olá, {me.name.split(" ")[0]} 👋</h1>
      <p className="mt-2 text-muted">Aqui você acompanha suas consultas e conversa com o médico.</p>

      <div className="mt-8 rounded-xl2 border border-ink/[0.07] bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2 text-brand">
          <Clock className="h-5 w-5" />
          <span className="font-serif text-lg text-ink">Sua próxima consulta</span>
        </div>
        {next ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg capitalize text-ink">{fmt(new Date(next.start))}</p>
              <p className="text-sm capitalize text-muted">
                {next.mode} ·{" "}
                <span className={next.status === "CONFIRMADO" ? "text-brand" : "text-amber-700"}>
                  {next.status.toLowerCase()}
                </span>
              </p>
            </div>
            <Link href="/paciente/agendamentos" className="btn-ghost">Gerenciar</Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-muted">Você não tem consultas marcadas.</p>
            <Link href="/agendar" className="btn-primary">
              <CalendarPlus className="h-4 w-4" /> Agendar consulta
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/agendar" className="group rounded-xl2 border border-ink/[0.07] bg-white p-5 shadow-soft transition-colors hover:border-brand/30">
          <CalendarPlus className="h-6 w-6 text-brand" />
          <p className="mt-3 font-medium text-ink">Agendar consulta</p>
          <p className="text-sm text-muted">Escolha um novo horário</p>
        </Link>
        <Link href="/paciente/agendamentos" className="group rounded-xl2 border border-ink/[0.07] bg-white p-5 shadow-soft transition-colors hover:border-brand/30">
          <CalendarDays className="h-6 w-6 text-brand" />
          <p className="mt-3 font-medium text-ink">Meus agendamentos</p>
          <p className="text-sm text-muted">Ver, reagendar ou cancelar</p>
        </Link>
        <Link href="/paciente/mensagens" className="group relative rounded-xl2 border border-ink/[0.07] bg-white p-5 shadow-soft transition-colors hover:border-brand/30">
          <MessageSquare className="h-6 w-6 text-brand" />
          <p className="mt-3 font-medium text-ink">Mensagens</p>
          <p className="text-sm text-muted">Fale com o médico</p>
          {unreadN > 0 && (
            <span className="absolute right-4 top-4 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-medium text-ivory">
              {unreadN}
            </span>
          )}
        </Link>
      </div>

      {waHref !== "#" && (
        <p className="mt-6 text-sm text-muted">
          Precisa de ajuda rápida?{" "}
          <a href={waHref} target="_blank" rel="noopener" className="text-brand hover:underline">
            Fale no WhatsApp
          </a>
        </p>
      )}
    </div>
  );
}
