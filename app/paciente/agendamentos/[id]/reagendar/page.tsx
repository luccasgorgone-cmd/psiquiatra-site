import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { getPatientSession } from "@/lib/patient-auth";
import { getAvailableDays, CLINIC_TZ } from "@/lib/availability";
import ReschedulePicker from "@/components/patient/ReschedulePicker";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TZ, weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit",
  }).format(d);

export default async function ReagendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = (await getPatientSession())!;
  const [appt] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.patientId, me.id)))
    .limit(1);
  if (!appt) notFound();

  const days = await getAvailableDays({ daysAhead: 45, leadHours: 3 });

  return (
    <div>
      <Link href="/paciente/agendamentos" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Voltar aos agendamentos
      </Link>
      <h1 className="font-serif text-3xl text-ink">Reagendar consulta</h1>
      <p className="mt-2 text-muted">
        Consulta atual: <span className="capitalize text-graphite">{fmt(new Date(appt.start))}</span>. Escolha um novo horário abaixo.
      </p>
      <div className="mt-8">
        <ReschedulePicker appointmentId={appt.id} days={days} />
      </div>
    </div>
  );
}
