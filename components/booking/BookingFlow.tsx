"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  MessageCircle,
  Loader2,
  CalendarX,
} from "lucide-react";
import { createAppointment, type BookingResult } from "@/app/agendar/actions";
import { whatsappLink } from "@/lib/utils";

type Slot = { startISO: string; endISO: string; time: string };
type Day = { dateKey: string; label: string; weekday: number; slots: Slot[] };

const ease = [0.22, 1, 0.36, 1] as const;
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function monthCells(year: number, month: number): (number | null)[] {
  const startWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}
const key = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function BookingFlow({ days, whatsapp }: { days: Day[]; whatsapp: string }) {
  const map = useMemo(() => new Map(days.map((d) => [d.dateKey, d])), [days]);
  const months = useMemo(() => {
    // meses que têm pelo menos um dia disponível, em ordem
    const set = new Set(days.map((d) => d.dateKey.slice(0, 7)));
    return Array.from(set).sort();
  }, [days]);

  const [monthIdx, setMonthIdx] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(days[0]?.dateKey ?? null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<"presencial" | "online">("presencial");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);

  const day = selectedKey ? map.get(selectedKey) ?? null : null;
  const waHref = useMemo(
    () => (whatsapp ? whatsappLink(whatsapp, "Olá! Gostaria de agendar uma consulta.") : "#"),
    [whatsapp]
  );

  if (days.length === 0 || months.length === 0) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <CalendarX className="mx-auto h-10 w-10 text-brand" />
        <h3 className="mt-4 font-serif text-2xl">Agenda em atualização</h3>
        <p className="mt-3 text-muted">
          No momento não há horários abertos no site. Fale com a gente pelo WhatsApp que
          encontramos o melhor horário para você.
        </p>
        {waHref !== "#" && (
          <a href={waHref} target="_blank" rel="noopener" className="btn-primary mt-6">
            <MessageCircle className="h-4 w-4" /> Agendar pelo WhatsApp
          </a>
        )}
      </div>
    );
  }

  const [yStr, mStr] = months[monthIdx].split("-");
  const year = Number(yStr);
  const month = Number(mStr) - 1;
  const cells = monthCells(year, month);

  async function submit() {
    if (!day || !selectedSlot) return;
    setLoading(true);
    const res = await createAppointment({ ...form, mode, startISO: selectedSlot.startISO });
    setResult(res);
    setLoading(false);
    if (res.ok) setStep(3);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-center gap-2 text-sm">
        {[
          { n: 1, label: "Data e horário" },
          { n: 2, label: "Seus dados" },
          { n: 3, label: "Confirmação" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                step >= (s.n as 1 | 2 | 3) ? "bg-brand text-ivory" : "bg-ink/[0.06] text-muted"
              }`}
            >
              {step > s.n ? <Check className="h-4 w-4" /> : s.n}
            </span>
            <span className={`hidden sm:inline ${step >= s.n ? "text-ink" : "text-muted"}`}>{s.label}</span>
            {i < 2 && <span className="mx-1 h-px w-6 bg-ink/15 sm:w-10" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease }}>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Calendário do mês */}
              <div className="card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <button
                    aria-label="Mês anterior"
                    onClick={() => { setMonthIdx((i) => Math.max(0, i - 1)); setSelectedSlot(null); }}
                    disabled={monthIdx === 0}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-serif text-lg capitalize text-ink">
                    {MESES[month]} {year}
                  </span>
                  <button
                    aria-label="Próximo mês"
                    onClick={() => { setMonthIdx((i) => Math.min(months.length - 1, i + 1)); setSelectedSlot(null); }}
                    disabled={monthIdx === months.length - 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
                  {WD.map((w) => (
                    <div key={w} className="py-1">{w}</div>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {cells.map((d, i) => {
                    if (d === null) return <div key={i} />;
                    const k = key(year, month, d);
                    const avail = map.has(k);
                    const selected = selectedKey === k;
                    return (
                      <button
                        key={i}
                        disabled={!avail}
                        onClick={() => { setSelectedKey(k); setSelectedSlot(null); }}
                        className={`aspect-square rounded-lg text-sm transition-all ${
                          selected
                            ? "bg-brand font-medium text-ivory"
                            : avail
                            ? "bg-brand/8 text-ink hover:bg-brand/20"
                            : "text-ink/25"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                  <span className="inline-block h-3 w-3 rounded bg-brand/20" /> dias com horário livre
                </p>
              </div>

              {/* Horários do dia */}
              <div className="card p-6">
                <div className="mb-4 flex items-center gap-2 text-brand">
                  <Clock className="h-5 w-5" />
                  <span className="font-serif text-lg capitalize text-ink">
                    {day ? day.label : "Escolha um dia"}
                  </span>
                </div>
                {day ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {day.slots.map((s) => (
                      <button
                        key={s.startISO}
                        onClick={() => setSelectedSlot(s)}
                        className={`rounded-lg border py-2.5 text-sm transition-all ${
                          selectedSlot?.startISO === s.startISO
                            ? "border-brand bg-brand text-ivory"
                            : "border-ink/10 bg-white/60 text-graphite hover:border-brand/50"
                        }`}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted">
                    Selecione um dia no calendário para ver os horários.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
              {waHref !== "#" ? (
                <a href={waHref} target="_blank" rel="noopener" className="btn-ghost">
                  <MessageCircle className="h-4 w-4" /> Prefiro pelo WhatsApp
                </a>
              ) : (
                <span />
              )}
              <button onClick={() => selectedSlot && setStep(2)} disabled={!selectedSlot} className="btn-primary w-full sm:w-auto disabled:opacity-40">
                Continuar <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && day && selectedSlot && (
          <motion.div key="s2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease }}>
            <div className="card p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand/8 px-4 py-3 text-sm">
                <Calendar className="h-4 w-4 text-brand" />
                <span className="text-graphite">{day.label} · <strong>{selectedSlot.time}</strong></span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo *">
                  <input className="fld" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" />
                </Field>
                <Field label="Telefone / WhatsApp *">
                  <input className="fld" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
                </Field>
                <Field label="E-mail">
                  <input className="fld" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" />
                </Field>
                <Field label="Modalidade">
                  <div className="flex gap-2">
                    {(["presencial", "online"] as const).map((m) => (
                      <button key={m} type="button" onClick={() => setMode(m)}
                        className={`flex-1 rounded-lg border py-2.5 text-sm capitalize transition-all ${
                          mode === m ? "border-brand bg-brand text-ivory" : "border-ink/10 bg-white/60 text-graphite"
                        }`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="Observação (opcional)">
                <textarea className="fld min-h-[90px] resize-y" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Algo que queira nos contar antes da consulta" />
              </Field>
              {result && !result.ok && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{result.error}</p>
              )}
              <div className="mt-6 flex items-center justify-between gap-4">
                <button onClick={() => setStep(1)} className="btn-ghost">
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </button>
                <button onClick={submit} disabled={loading || !form.name || !form.phone} className="btn-primary disabled:opacity-50">
                  {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</>) : (<>Confirmar agendamento <Check className="h-4 w-4" /></>)}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && result?.ok && (
          <motion.div key="s3" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}>
            <div className="card p-10 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand text-ivory">
                <Check className="h-8 w-8" />
              </motion.div>
              <h3 className="mt-6 font-serif text-3xl">Solicitação enviada!</h3>
              <p className="mx-auto mt-3 max-w-md text-muted">
                Recebemos seu pedido para <strong>{result.when}</strong>. Em breve confirmaremos com você. 💚
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href="/" className="btn-ghost">Voltar ao início</a>
                {waHref !== "#" && (
                  <a href={waHref} target="_blank" rel="noopener" className="btn-primary">
                    <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block first:mt-0">
      <span className="mb-1.5 block text-sm text-graphite">{label}</span>
      {children}
    </label>
  );
}
