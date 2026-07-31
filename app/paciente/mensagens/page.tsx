import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { patientMessages } from "@/lib/db/schema";
import { getPatientSession } from "@/lib/patient-auth";
import ActionForm from "@/components/admin/ActionForm";
import { sendPatientMessage } from "../actions";
import { CLINIC_TZ } from "@/lib/availability";

export const dynamic = "force-dynamic";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: CLINIC_TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);

export default async function MinhasMensagens() {
  const me = (await getPatientSession())!;

  // marca como lidas as mensagens do médico
  await db
    .update(patientMessages)
    .set({ readByPatient: true })
    .where(and(eq(patientMessages.patientId, me.id), eq(patientMessages.sender, "doctor"), eq(patientMessages.readByPatient, false)));

  const msgs = await db
    .select()
    .from(patientMessages)
    .where(eq(patientMessages.patientId, me.id))
    .orderBy(patientMessages.createdAt);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl text-ink">Mensagens</h1>
      <p className="mt-2 text-muted">Converse com o médico. As respostas aparecem aqui.</p>

      <div className="mt-6 min-h-[16rem] space-y-3 rounded-xl2 border border-ink/[0.07] bg-white p-5 shadow-soft">
        {msgs.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Nenhuma mensagem ainda. Envie a primeira abaixo.</p>
        ) : (
          msgs.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.sender === "patient" ? "ml-auto bg-brand text-ivory" : "bg-sand/70 text-graphite"
              }`}
            >
              {m.body}
              <span className={`mt-1 block text-[10px] ${m.sender === "patient" ? "text-ivory/70" : "text-muted"}`}>
                {m.sender === "doctor" ? "Médico · " : ""}{fmt(new Date(m.createdAt))}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <ActionForm action={sendPatientMessage} submitLabel="Enviar mensagem" resetOnSuccess compact>
          <textarea name="body" className="fld min-h-[80px]" placeholder="Escreva sua mensagem…" />
        </ActionForm>
      </div>
    </div>
  );
}
