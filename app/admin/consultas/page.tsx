import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { PageHeader, Card } from "@/components/admin/ui";
import { setAppointmentStatus, deleteAppointment } from "../actions";
import { CLINIC_TZ } from "@/lib/availability";
import { whatsappLink } from "@/lib/utils";
import { MessageCircle, Trash2, Check, X, CheckCheck } from "lucide-react";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TZ,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const badge: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-700",
  CONFIRMADO: "bg-brand/12 text-brand",
  CANCELADO: "bg-red-100 text-red-600",
  CONCLUIDO: "bg-ink/[0.06] text-muted",
};

function StatusBtn({ id, status, children, title }: { id: string; status: string; children: React.ReactNode; title: string }) {
  return (
    <form action={setAppointmentStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button title={title} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-ink/[0.05] hover:text-ink">
        {children}
      </button>
    </form>
  );
}

export default async function ConsultasPage() {
  const rows = await db.select().from(appointments).orderBy(desc(appointments.start));

  return (
    <div>
      <PageHeader title="Consultas" subtitle="Solicitações e agendamentos recebidos" />

      <Card>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nenhuma consulta ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ink/[0.08] text-left text-xs uppercase tracking-wider text-muted">
                  <th className="pb-3 pr-4 font-medium">Paciente</th>
                  <th className="pb-3 pr-4 font-medium">Quando</th>
                  <th className="pb-3 pr-4 font-medium">Modo</th>
                  <th className="pb-3 pr-4 font-medium">Origem</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.05]">
                {rows.map((a) => (
                  <tr key={a.id} className="align-middle">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink">{a.name}</p>
                      <a
                        href={whatsappLink(a.phone)}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                      >
                        <MessageCircle className="h-3 w-3" /> {a.phone}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-graphite">{fmt(new Date(a.start))}</td>
                    <td className="py-3 pr-4 capitalize text-graphite">{a.mode}</td>
                    <td className="py-3 pr-4 text-muted">{a.channel}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <StatusBtn id={a.id} status="CONFIRMADO" title="Confirmar">
                          <Check className="h-4 w-4" />
                        </StatusBtn>
                        <StatusBtn id={a.id} status="CONCLUIDO" title="Concluir">
                          <CheckCheck className="h-4 w-4" />
                        </StatusBtn>
                        <StatusBtn id={a.id} status="CANCELADO" title="Cancelar">
                          <X className="h-4 w-4" />
                        </StatusBtn>
                        <form action={deleteAppointment}>
                          <input type="hidden" name="id" value={a.id} />
                          <button title="Excluir" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
