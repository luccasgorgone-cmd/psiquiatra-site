import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clinicalSessions, patients } from "@/lib/db/schema";
import { PageHeader, Card, Field, Grid2 } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import RichText from "@/components/RichText";
import { createSession } from "../actions";
import { CLINIC_TZ } from "@/lib/availability";
import { CalendarClock, Plus, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: CLINIC_TZ, day: "2-digit", month: "long", year: "numeric" }).format(d);
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TZ }).format(new Date());

export default async function SessoesPage() {
  const rows = await db
    .select({
      id: clinicalSessions.id,
      date: clinicalSessions.date,
      title: clinicalSessions.title,
      content: clinicalSessions.content,
      patientId: clinicalSessions.patientId,
      patientName: patients.name,
    })
    .from(clinicalSessions)
    .leftJoin(patients, eq(patients.id, clinicalSessions.patientId))
    .orderBy(desc(clinicalSessions.date));

  const pts = await db.select({ id: patients.id, name: patients.name }).from(patients).orderBy(patients.name);

  return (
    <div>
      <PageHeader title="Sessões" subtitle="Histórico de sessões de todos os pacientes (prontuário confidencial)" />

      <Card title="Registrar nova sessão">
        {pts.length === 0 ? (
          <p className="text-sm text-muted">
            Cadastre um paciente primeiro em <Link href="/admin/pacientes" className="text-brand hover:underline">Pacientes</Link>.
          </p>
        ) : (
          <ActionForm action={createSession} submitLabel="Registrar sessão" resetOnSuccess>
            <Grid2>
              <Field label="Paciente *">
                <select name="patientId" className="fld" defaultValue="">
                  <option value="" disabled>Selecione o paciente…</option>
                  {pts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Data da sessão">
                <input type="date" name="date" defaultValue={today()} className="fld" />
              </Field>
            </Grid2>
            <Field label="Título (opcional)">
              <input name="title" className="fld" placeholder="Ex.: Primeira consulta" />
            </Field>
            <Field label="Anotações da sessão">
              <textarea name="content" className="fld min-h-[120px]" placeholder="Queixas, evolução, conduta…" />
            </Field>
          </ActionForm>
        )}
      </Card>

      <Card title={`Histórico (${rows.length})`}>
        {rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Nenhuma sessão registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((s) => (
              <details key={s.id} className="group rounded-xl border border-ink/[0.08] bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-brand" />
                    <span className="font-medium text-ink">{s.patientName || "Paciente removido"}</span>
                    <span className="text-sm text-muted">· {fmtDate(new Date(s.date))}</span>
                    {s.title && <span className="text-sm text-muted">· {s.title}</span>}
                  </span>
                  <Plus className="h-4 w-4 text-muted transition-transform group-open:rotate-45" />
                </summary>
                <div className="border-t border-ink/[0.06] px-4 py-4">
                  <RichText text={s.content} className="text-sm leading-relaxed text-graphite" />
                  {s.patientId && (
                    <Link
                      href={`/admin/pacientes/${s.patientId}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-brand hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Abrir prontuário do paciente
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
