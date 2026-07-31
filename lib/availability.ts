import "server-only";
import { db } from "./db";
import { availabilityRules, blockedSlots, appointments } from "./db/schema";
import { and, eq, gte, ne } from "drizzle-orm";

// Brasil (America/Sao_Paulo) não observa horário de verão desde 2019 → offset fixo.
export const CLINIC_TZ = "America/Sao_Paulo";
const CLINIC_OFFSET = "-03:00";

export type Slot = { startISO: string; endISO: string; time: string };
export type Day = { dateKey: string; label: string; weekday: number; slots: Slot[] };

function todayClinicISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TZ }).format(new Date());
}
function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
function weekdayOfISO(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=dom..6=sáb
}
function slotInstant(iso: string, time: string): Date {
  return new Date(`${iso}T${time}:00${CLINIC_OFFSET}`);
}
function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function dayLabel(iso: string): string {
  const d = slotInstant(iso, "12:00");
  const s = new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TZ,
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Gera os dias com horários livres para os próximos `daysAhead` dias.
 * Exclui: horários passados (com antecedência mínima), bloqueios e consultas já marcadas.
 */
export async function getAvailableDays(opts?: {
  daysAhead?: number;
  leadHours?: number;
}): Promise<Day[]> {
  const daysAhead = opts?.daysAhead ?? 45;
  const leadHours = opts?.leadHours ?? 3;
  const now = new Date();
  const minStart = new Date(now.getTime() + leadHours * 3600 * 1000);

  let rules: (typeof availabilityRules.$inferSelect)[] = [];
  let blocks: { start: Date; end: Date }[] = [];
  let booked: { start: Date; end: Date }[] = [];
  try {
    rules = await db.select().from(availabilityRules).where(eq(availabilityRules.active, true));
    if (rules.length === 0) return [];
    blocks = await db.select().from(blockedSlots).where(gte(blockedSlots.end, now));
    booked = await db
      .select({ start: appointments.start, end: appointments.end })
      .from(appointments)
      .where(and(gte(appointments.start, now), ne(appointments.status, "CANCELADO")));
  } catch (e) {
    console.error("[availability] erro de banco:", (e as Error).message);
    return [];
  }

  const overlaps = (s: Date, e: Date, xs: { start: Date; end: Date }[]) =>
    xs.some((x) => s < new Date(x.end) && e > new Date(x.start));

  const days: Day[] = [];
  const startISO = todayClinicISO();

  for (let i = 0; i < daysAhead; i++) {
    const iso = addDaysISO(startISO, i);
    const wd = weekdayOfISO(iso);
    const dayRules = rules.filter((r) => r.weekday === wd);
    if (dayRules.length === 0) continue;

    const slots: Slot[] = [];
    for (const r of dayRules) {
      const start = toMinutes(r.startTime);
      const end = toMinutes(r.endTime);
      for (let mins = start; mins + r.slotMin <= end; mins += r.slotMin) {
        const time = minutesToTime(mins);
        const s = slotInstant(iso, time);
        const e = new Date(s.getTime() + r.slotMin * 60 * 1000);
        if (s < minStart) continue;
        if (overlaps(s, e, blocks)) continue;
        if (overlaps(s, e, booked)) continue;
        slots.push({ startISO: s.toISOString(), endISO: e.toISOString(), time });
      }
    }
    if (slots.length > 0) {
      slots.sort((a, b) => a.startISO.localeCompare(b.startISO));
      days.push({ dateKey: iso, label: dayLabel(iso), weekday: wd, slots });
    }
  }
  return days;
}

/** Valida no servidor se um horário específico ainda está livre e é válido. */
export async function isSlotAvailable(startISO: string): Promise<{ ok: boolean; end?: Date; reason?: string }> {
  const start = new Date(startISO);
  if (isNaN(start.getTime())) return { ok: false, reason: "Horário inválido" };
  if (start.getTime() < Date.now() + 3600 * 1000) return { ok: false, reason: "Horário no passado" };

  // Reconstrói a partir das regras para achar a duração e confirmar que pertence à grade
  const days = await getAvailableDays({ daysAhead: 60, leadHours: 1 });
  for (const d of days) {
    const slot = d.slots.find((s) => s.startISO === startISO);
    if (slot) return { ok: true, end: new Date(slot.endISO) };
  }
  return { ok: false, reason: "Horário não está mais disponível" };
}
