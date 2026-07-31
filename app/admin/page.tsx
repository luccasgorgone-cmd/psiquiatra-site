import Link from "next/link";
import { and, gte, eq, desc, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/ui";
import { CLINIC_TZ } from "@/lib/availability";
import {
  CalendarClock,
  Clock3,
  CheckCircle2,
  ArrowRight,
  FileText,
  ImageIcon,
  CalendarRange,
} from "lucide-react";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TZ,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function Dashboard() {
  const now = new Date();
  const upcoming = await db
    .select()
    .from(appointments)
    .where(and(gte(appointments.start, now)))
    .orderBy(asc(appointments.start))
    .limit(6);

  const all = await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  const pending = all.filter((a) => a.status === "PENDENTE").length;
  const confirmed = all.filter((a) => a.status === "CONFIRMADO").length;

  const stats = [
    { label: "Próximas consultas", value: upcoming.length, icon: CalendarClock },
    { label: "Pendentes", value: pending, icon: Clock3 },
    { label: "Confirmadas", value: confirmed, icon: CheckCircle2 },
  ];

  return (
    <div>
      <PageHeader title="Visão geral" subtitle="Resumo do que está acontecendo na clínica" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl2 border border-ink/[0.07] bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{s.label}</span>
              <s.icon className="h-5 w-5 text-brand" />
            </div>
            <p className="mt-3 font-serif text-4xl text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-xl2 border border-ink/[0.07] bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-ink/[0.06] px-6 py-4">
          <h2 className="font-serif text-lg">Próximas consultas</h2>
          <Link href="/admin/consultas" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted">Nenhuma consulta agendada.</p>
        ) : (
          <ul className="divide-y divide-ink/[0.05]">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-ink">{a.name}</p>
                  <p className="text-sm text-muted">
                    {fmt(new Date(a.start))} · {a.mode}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    a.status === "CONFIRMADO"
                      ? "bg-brand/12 text-brand"
                      : a.status === "PENDENTE"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-ink/[0.06] text-muted"
                  }`}
                >
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/conteudo", label: "Editar conteúdo", icon: FileText },
          { href: "/admin/midia", label: "Trocar imagens", icon: ImageIcon },
          { href: "/admin/disponibilidade", label: "Ajustar agenda", icon: CalendarRange },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex items-center gap-3 rounded-xl2 border border-ink/[0.07] bg-white p-5 shadow-soft transition-colors hover:border-brand/30"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <q.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink">{q.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
