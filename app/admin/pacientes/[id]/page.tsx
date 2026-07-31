import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { patients, clinicalSessions, patientMessages, appointments } from "@/lib/db/schema";
import { Card, Field, Grid2 } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import RichText from "@/components/RichText";
import { CLINIC_TZ } from "@/lib/availability";
import {
  updatePatient,
  updatePatientCase,
  setPatientPassword,
  deletePatient,
  createSession,
  updateSession,
  deleteSession,
  sendDoctorMessage,
} from "../../actions";
import {
  ArrowLeft,
  KeyRound,
  Trash2,
  CalendarClock,
  Plus,
  UserRound,
  Send,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: CLINIC_TZ, day: "2-digit", month: "long", year: "numeric" }).format(d);
const fmtDateTime = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(d);
const isoDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TZ }).format(d);

export default async function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  if (!p) notFound();

  const [sessions, appts, msgs] = await Promise.all([
    db.select().from(clinicalSessions).where(eq(clinicalSessions.patientId, id)).orderBy(desc(clinicalSessions.date)),
    db.select().from(appointments).where(eq(appointments.patientId, id)).orderBy(desc(appointments.start)),
    db.select().from(patientMessages).where(eq(patientMessages.patientId, id)).orderBy(patientMessages.createdAt),
  ]);
  const today = isoDate(new Date());

  return (
    <div>
      <Link href="/admin/pacientes" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Voltar aos pacientes
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <UserRound className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-serif text-2xl text-ink">{p.name}</h1>
            <p className="text-sm text-muted">
              {p.email}
              {p.phone ? ` · ${p.phone}` : ""}
            </p>
          </div>
        </div>
        <form action={deletePatient}>
          <input type="hidden" name="id" value={p.id} />
          <button className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Excluir cadastro
          </button>
        </form>
      </div>

      {/* Resumo do caso */}
      <Card title="Resumo do caso" description="Seu resumo do estado/evolução do paciente (confidencial). Aceita **negrito**, *itálico* e parágrafos.">
        <ActionForm action={updatePatientCase} submitLabel="Salvar resumo">
          <input type="hidden" name="id" value={p.id} />
          <Field label="Resumo / evolução">
            <textarea name="summary" defaultValue={p.summary} className="fld min-h-[140px]" />
          </Field>
          <Field label="Observações internas">
            <textarea name="notes" defaultValue={p.notes} className="fld min-h-[80px]" />
          </Field>
        </ActionForm>
      </Card>

      {/* Sessões */}
      <Card title={`Sessões — prontuário (${sessions.length})`} description="Clique em uma sessão para expandir. Confidencial — o paciente não vê isto.">
        <div className="mb-6 rounded-xl border border-ink/[0.08] bg-sand/30 p-5">
          <p className="mb-3 text-sm font-medium text-graphite">
            <Plus className="mr-1 inline h-4 w-4 text-brand" /> Nova sessão
          </p>
          <ActionForm action={createSession} submitLabel="Registrar sessão" resetOnSuccess>
            <input type="hidden" name="patientId" value={p.id} />
            <Grid2>
              <Field label="Data da sessão">
                <input type="date" name="date" defaultValue={today} className="fld" />
              </Field>
              <Field label="Título (opcional)">
                <input name="title" className="fld" placeholder="Ex.: Consulta de retorno" />
              </Field>
            </Grid2>
            <Field label="Anotações da sessão">
              <textarea name="content" className="fld min-h-[120px]" placeholder="Queixas, evolução, conduta, prescrições…" />
            </Field>
          </ActionForm>
        </div>

        {sessions.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted">Nenhuma sessão registrada.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <details key={s.id} className="group rounded-xl border border-ink/[0.08] bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <span className="flex items-center gap-3">
                    <CalendarClock className="h-4 w-4 text-brand" />
                    <span className="font-medium text-ink">{fmtDate(new Date(s.date))}</span>
                    {s.title && <span className="text-sm text-muted">· {s.title}</span>}
                  </span>
                  <Plus className="h-4 w-4 text-muted transition-transform group-open:rotate-45" />
                </summary>
                <div className="border-t border-ink/[0.06] px-4 py-4">
                  <RichText text={s.content} className="text-sm leading-relaxed text-graphite" />
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-muted hover:text-ink">Editar sessão</summary>
                    <div className="mt-3">
                      <ActionForm action={updateSession} submitLabel="Salvar alterações" compact>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="patientId" value={p.id} />
                        <Grid2>
                          <Field label="Data">
                            <input type="date" name="date" defaultValue={isoDate(new Date(s.date))} className="fld" />
                          </Field>
                          <Field label="Título">
                            <input name="title" defaultValue={s.title} className="fld" />
                          </Field>
                        </Grid2>
                        <Field label="Anotações">
                          <textarea name="content" defaultValue={s.content} className="fld min-h-[100px]" />
                        </Field>
                      </ActionForm>
                      <form action={deleteSession} className="mt-2">
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="patientId" value={p.id} />
                        <button className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" /> Excluir sessão
                        </button>
                      </form>
                    </div>
                  </details>
                </div>
              </details>
            ))}
          </div>
        )}
      </Card>

      <Grid2>
        {/* Agendamentos */}
        <Card title={`Agendamentos (${appts.length})`}>
          {appts.length === 0 ? (
            <p className="py-2 text-sm text-muted">Nenhum agendamento vinculado.</p>
          ) : (
            <ul className="space-y-2">
              {appts.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-ink/[0.07] px-3 py-2 text-sm">
                  <span className="text-graphite">{fmtDateTime(new Date(a.start))} · {a.mode}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      a.status === "CONFIRMADO" ? "bg-brand/12 text-brand"
                      : a.status === "PENDENTE" ? "bg-amber-100 text-amber-700"
                      : "bg-ink/[0.06] text-muted"
                    }`}
                  >
                    {a.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Dados do paciente */}
        <Card title="Dados do paciente">
          <ActionForm action={updatePatient} submitLabel="Salvar dados" compact>
            <input type="hidden" name="id" value={p.id} />
            <Field label="Nome"><input name="name" defaultValue={p.name} className="fld" /></Field>
            <Grid2>
              <Field label="Telefone"><input name="phone" defaultValue={p.phone} className="fld" /></Field>
              <Field label="Nascimento"><input type="date" name="birthDate" defaultValue={p.birthDate} className="fld" /></Field>
              <Field label="CPF"><input name="cpf" defaultValue={p.cpf} className="fld" /></Field>
              <Field label="Endereço"><input name="address" defaultValue={p.address} className="fld" /></Field>
            </Grid2>
          </ActionForm>
        </Card>
      </Grid2>

      {/* Acesso ao portal */}
      <Card title="Acesso ao portal do paciente" description={p.password ? "O paciente já tem acesso. Defina uma nova senha para redefinir." : "Defina uma senha para liberar o acesso do paciente ao portal."}>
        <ActionForm action={setPatientPassword} submitLabel={p.password ? "Redefinir senha" : "Liberar acesso"} resetOnSuccess compact>
          <input type="hidden" name="id" value={p.id} />
          <Field label="Senha do paciente" hint="Combine essa senha com o paciente; ele acessa em /paciente com o e-mail dele">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted" />
              <input type="text" name="password" className="fld" placeholder="mín. 6 caracteres" />
            </div>
          </Field>
        </ActionForm>
      </Card>

      {/* Mensagens */}
      <Card title="Mensagens com o paciente">
        <div className="mb-4 max-h-80 space-y-2 overflow-y-auto rounded-xl bg-sand/30 p-4">
          {msgs.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">Nenhuma mensagem ainda.</p>
          ) : (
            msgs.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.sender === "doctor" ? "ml-auto bg-brand text-ivory" : "bg-white text-graphite shadow-soft"
                }`}
              >
                {m.body}
                <span className={`mt-1 block text-[10px] ${m.sender === "doctor" ? "text-ivory/70" : "text-muted"}`}>
                  {fmtDateTime(new Date(m.createdAt))}
                </span>
              </div>
            ))
          )}
        </div>
        <ActionForm action={sendDoctorMessage} submitLabel="Enviar" resetOnSuccess compact>
          <input type="hidden" name="patientId" value={p.id} />
          <Field label="Nova mensagem para o paciente">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-muted" />
              <input name="body" className="fld" placeholder="Escreva uma mensagem…" />
            </div>
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
