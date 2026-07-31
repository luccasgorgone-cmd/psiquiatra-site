import { desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments, appointmentLabels, patients } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/ui";
import AppointmentsCalendar from "@/components/admin/AppointmentsCalendar";

export const dynamic = "force-dynamic";

export default async function ConsultasPage() {
  // janela: dos últimos 120 dias em diante (evita carregar histórico antigo demais)
  const since = new Date(Date.now() - 120 * 24 * 3600 * 1000);

  const [rows, labels, pts] = await Promise.all([
    db
      .select({
        id: appointments.id,
        start: appointments.start,
        end: appointments.end,
        name: appointments.name,
        title: appointments.title,
        mode: appointments.mode,
        status: appointments.status,
        kind: appointments.kind,
        labelId: appointments.labelId,
        patientId: appointments.patientId,
        notes: appointments.notes,
        patientName: patients.name,
      })
      .from(appointments)
      .leftJoin(patients, eq(patients.id, appointments.patientId))
      .where(gte(appointments.start, since))
      .orderBy(desc(appointments.start)),
    db.select().from(appointmentLabels).orderBy(appointmentLabels.order),
    db.select({ id: patients.id, name: patients.name }).from(patients).orderBy(patients.name),
  ]);

  const events = rows.map((r) => ({
    id: r.id,
    startISO: new Date(r.start).toISOString(),
    endISO: new Date(r.end).toISOString(),
    name: r.name,
    title: r.title,
    mode: r.mode,
    status: r.status,
    kind: r.kind,
    labelId: r.labelId,
    patientId: r.patientId,
    patientName: r.patientName,
    notes: r.notes,
  }));

  return (
    <div>
      <PageHeader title="Consultas" subtitle="Agenda visual — dia, semana, mês e período. Crie marcações e etiquetas coloridas." />
      <AppointmentsCalendar
        events={events}
        labels={labels.map((l) => ({ id: l.id, name: l.name, color: l.color }))}
        patients={pts}
      />
    </div>
  );
}
