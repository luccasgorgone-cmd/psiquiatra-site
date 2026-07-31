"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { isSlotAvailable, CLINIC_TZ } from "@/lib/availability";
import { sendWhatsappText } from "@/lib/evolution";
import { getSettings } from "@/lib/queries";

const schema = z.object({
  name: z.string().min(2, "Informe seu nome").max(120),
  phone: z.string().min(8, "Informe um telefone válido").max(30),
  email: z.string().email("E-mail inválido").or(z.literal("")).optional(),
  startISO: z.string().min(10),
  mode: z.enum(["presencial", "online"]).default("presencial"),
  notes: z.string().max(600).optional(),
});

export type BookingResult =
  | { ok: true; when: string }
  | { ok: false; error: string };

function fmt(d: Date) {
  const date = new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TZ,
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(d);
  const time = new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return { date: date.charAt(0).toUpperCase() + date.slice(1), time };
}

export async function createAppointment(input: unknown): Promise<BookingResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Dados inválidos" };
  }
  const data = parsed.data;

  const avail = await isSlotAvailable(data.startISO);
  if (!avail.ok || !avail.end) {
    return { ok: false, error: avail.reason || "Horário indisponível" };
  }

  const start = new Date(data.startISO);
  const end = avail.end;

  try {
    await db.insert(appointments).values({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: (data.email || "").trim(),
      start,
      end,
      mode: data.mode,
      notes: (data.notes || "").trim(),
      channel: "SITE",
      status: "PENDENTE",
    });
  } catch (e) {
    console.error("[booking] erro ao gravar:", (e as Error).message);
    return { ok: false, error: "Não foi possível concluir o agendamento. Tente novamente." };
  }

  const { date, time } = fmt(start);

  // Confirmação por WhatsApp (não bloqueia o sucesso do agendamento)
  const settings = await getSettings();
  const clinicName = settings?.siteName || "a clínica";
  const patientMsg =
    `Olá, ${data.name}! ✅ Seu pedido de consulta foi registrado.\n\n` +
    `🗓️ ${date}\n⏰ ${time}\n📍 ${data.mode === "online" ? "Online (teleconsulta)" : "Presencial"}\n\n` +
    `Em breve confirmaremos com você. Obrigado por escolher ${clinicName}.`;

  try {
    await sendWhatsappText(data.phone, patientMsg);
    if (settings?.whatsapp) {
      await sendWhatsappText(
        settings.whatsapp,
        `🔔 Nova solicitação de consulta\n\n👤 ${data.name}\n📞 ${data.phone}\n🗓️ ${date} às ${time}\n📍 ${data.mode}`
      );
    }
  } catch {
    /* envio é best-effort */
  }

  return { ok: true, when: `${date} às ${time}` };
}
