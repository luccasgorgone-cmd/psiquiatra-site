import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { availabilityRules, blockedSlots } from "@/lib/db/schema";
import { PageHeader, Card, Field, Grid2 } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import { createRule, deleteRule, toggleRule, createBlock, deleteBlock } from "../actions";
import { CLINIC_TZ } from "@/lib/availability";
import { Trash2, Power } from "lucide-react";

export const dynamic = "force-dynamic";

const WD = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function fmt(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TZ,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function DisponibilidadePage() {
  const [rules, blocks] = await Promise.all([
    db.select().from(availabilityRules).orderBy(asc(availabilityRules.weekday)),
    db.select().from(blockedSlots).orderBy(asc(blockedSlots.start)),
  ]);

  return (
    <div>
      <PageHeader title="Disponibilidade" subtitle="Horários de atendimento e bloqueios de agenda" />

      <Card title="Regras semanais" description="Cada regra gera os horários livres para agendamento no site">
        {rules.length > 0 && (
          <div className="mb-6 space-y-2">
            {rules.map((r) => (
              <div
                key={r.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  r.active ? "border-ink/[0.08] bg-white" : "border-ink/[0.06] bg-ink/[0.02] opacity-60"
                }`}
              >
                <div className="text-sm">
                  <span className="font-medium text-ink">{WD[r.weekday]}</span>
                  <span className="text-muted">
                    {" "}
                    · {r.startTime}–{r.endTime} · slots de {r.slotMin}min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleRule}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-ink/[0.04]" title={r.active ? "Desativar" : "Ativar"}>
                      <Power className={`h-4 w-4 ${r.active ? "text-brand" : ""}`} />
                    </button>
                  </form>
                  <form action={deleteRule}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-red-600" aria-label="Remover">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        <ActionForm action={createRule} submitLabel="Adicionar regra" resetOnSuccess>
          <Grid2>
            <Field label="Dia da semana">
              <select name="weekday" className="fld" defaultValue="1">
                {WD.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Duração do slot (min)">
              <input type="number" name="slotMin" defaultValue={50} min={10} step={5} className="fld" />
            </Field>
            <Field label="Início">
              <input type="time" name="startTime" defaultValue="09:00" className="fld" />
            </Field>
            <Field label="Fim">
              <input type="time" name="endTime" defaultValue="18:00" className="fld" />
            </Field>
          </Grid2>
        </ActionForm>
      </Card>

      <Card title="Bloqueios" description="Férias, feriados ou intervalos indisponíveis">
        {blocks.length > 0 && (
          <div className="mb-6 space-y-2">
            {blocks.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-ink/[0.08] bg-white px-4 py-3 text-sm">
                <span>
                  <span className="font-medium text-ink">
                    {fmt(new Date(b.start))} → {fmt(new Date(b.end))}
                  </span>
                  {b.reason && <span className="text-muted"> · {b.reason}</span>}
                </span>
                <form action={deleteBlock}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="text-muted hover:text-red-600" aria-label="Remover">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
        <ActionForm action={createBlock} submitLabel="Adicionar bloqueio" resetOnSuccess>
          <Grid2>
            <Field label="Início">
              <input type="datetime-local" name="start" className="fld" />
            </Field>
            <Field label="Fim">
              <input type="datetime-local" name="end" className="fld" />
            </Field>
          </Grid2>
          <Field label="Motivo (opcional)">
            <input name="reason" className="fld" placeholder="Ex.: Férias" />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
