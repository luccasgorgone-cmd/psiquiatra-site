"use client";

import { useState } from "react";
import { useActionState } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { rescheduleMyAppointment } from "@/app/paciente/actions";

type Slot = { startISO: string; time: string };
type Day = { dateKey: string; label: string; weekday: number; slots: Slot[] };

export default function ReschedulePicker({ appointmentId, days }: { appointmentId: string; days: Day[] }) {
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [state, action, pending] = useActionState(rescheduleMyAppointment, null as { error?: string } | null);

  if (days.length === 0) {
    return (
      <div className="rounded-xl2 border border-ink/[0.07] bg-white p-8 text-center shadow-soft">
        <p className="text-muted">Não há horários abertos no momento. Fale com a clínica pelo WhatsApp.</p>
      </div>
    );
  }
  const day = days[dayIdx];

  return (
    <div className="rounded-xl2 border border-ink/[0.07] bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand">
          <Calendar className="h-5 w-5" />
          <span className="font-serif text-lg text-ink">Escolha o novo dia</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setDayIdx((i) => Math.max(0, i - 1)); setSlot(null); }} disabled={dayIdx === 0}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => { setDayIdx((i) => Math.min(days.length - 1, i + 1)); setSlot(null); }} disabled={dayIdx === days.length - 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.slice(0, 21).map((d, i) => {
          const [, m, dd] = d.dateKey.split("-");
          const wd = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.weekday];
          return (
            <button key={d.dateKey} onClick={() => { setDayIdx(i); setSlot(null); }}
              className={`flex min-w-[4.5rem] flex-col items-center rounded-xl border px-3 py-3 transition-all ${
                i === dayIdx ? "border-brand bg-brand text-ivory" : "border-ink/10 bg-white/60 text-graphite hover:border-brand/40"
              }`}>
              <span className="text-xs uppercase opacity-80">{wd}</span>
              <span className="mt-1 text-lg font-medium">{dd}</span>
              <span className="text-[10px] opacity-70">/{m}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2 text-brand">
          <Clock className="h-5 w-5" />
          <span className="font-serif text-ink">Horários — {day.label}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {day.slots.map((s) => (
            <button key={s.startISO} onClick={() => setSlot(s)}
              className={`rounded-lg border py-2.5 text-sm transition-all ${
                slot?.startISO === s.startISO ? "border-brand bg-brand text-ivory" : "border-ink/10 bg-white/60 text-graphite hover:border-brand/50"
              }`}>
              {s.time}
            </button>
          ))}
        </div>
      </div>

      {state?.error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}

      <form action={action} className="mt-6 flex justify-end">
        <input type="hidden" name="id" value={appointmentId} />
        <input type="hidden" name="startISO" value={slot?.startISO || ""} />
        <button type="submit" disabled={!slot || pending} className="btn-primary disabled:opacity-40">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Confirmar novo horário
        </button>
      </form>
    </div>
  );
}
