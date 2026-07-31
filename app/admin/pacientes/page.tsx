import Link from "next/link";
import { desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { patients, clinicalSessions } from "@/lib/db/schema";
import { PageHeader, Card, Field, Grid2 } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import { createPatient } from "../actions";
import { UserRound, KeyRound, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const [list, sessCounts] = await Promise.all([
    db.select().from(patients).orderBy(desc(patients.createdAt)),
    db
      .select({ patientId: clinicalSessions.patientId, n: count() })
      .from(clinicalSessions)
      .groupBy(clinicalSessions.patientId),
  ]);
  const sessMap = Object.fromEntries(sessCounts.map((s) => [s.patientId, Number(s.n)]));

  return (
    <div>
      <PageHeader title="Pacientes" subtitle="Cadastro, histórico e acesso ao portal do paciente" />

      <Card title="Novo paciente">
        <ActionForm action={createPatient} submitLabel="Cadastrar paciente" resetOnSuccess>
          <Grid2>
            <Field label="Nome completo *">
              <input name="name" className="fld" />
            </Field>
            <Field label="E-mail *" hint="Usado também para o acesso do paciente ao portal">
              <input type="email" name="email" className="fld" />
            </Field>
            <Field label="Telefone / WhatsApp">
              <input name="phone" className="fld" />
            </Field>
            <Field label="Data de nascimento">
              <input type="date" name="birthDate" className="fld" />
            </Field>
            <Field label="CPF">
              <input name="cpf" className="fld" />
            </Field>
            <Field label="Endereço">
              <input name="address" className="fld" />
            </Field>
          </Grid2>
          <Field label="Senha de acesso ao portal (opcional)" hint="Deixe em branco para cadastrar sem acesso agora; você pode liberar depois">
            <input type="text" name="password" className="fld" placeholder="mín. 6 caracteres" />
          </Field>
          <Field label="Observações internas (só você vê)">
            <textarea name="notes" className="fld min-h-[70px]" />
          </Field>
        </ActionForm>
      </Card>

      <Card title={`Pacientes cadastrados (${list.length})`}>
        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Nenhum paciente cadastrado ainda.</p>
        ) : (
          <div className="divide-y divide-ink/[0.05]">
            {list.map((p) => (
              <Link
                key={p.id}
                href={`/admin/pacientes/${p.id}`}
                className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-ink/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="truncate text-sm text-muted">
                      {p.email}
                      {p.phone ? ` · ${p.phone}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="hidden text-muted sm:inline">{sessMap[p.id] || 0} sessão(ões)</span>
                  {p.password ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand/12 px-2 py-1 text-brand">
                      <KeyRound className="h-3 w-3" /> acesso
                    </span>
                  ) : (
                    <span className="rounded-full bg-ink/[0.06] px-2 py-1 text-muted">sem acesso</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
