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

export default function BookingFlow({
  days,
  whatsapp,
}: {
  days: Day[];
  whatsapp: string;
}) {
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<"presencial" | "online">("presencial");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);

  const day = days[dayIdx];
  const waHref = useMemo(
    () =>
      whatsapp
        ? whatsappLink(whatsapp, "Olá! Gostaria de agendar uma consulta.")
        : "#",
    [whatsapp]
  );

  if (days.length === 0) {
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
            <MessageCircle className="h-4 w-4" />
            Agendar pelo WhatsApp
          </a>
        )}
      </div>
    );
  }

  async function submit() {
    if (!slot) return;
    setLoading(true);
    const res = await createAppointment({
      ...form,
      mode,
      startISO: slot.startISO,
    });
    setResult(res);
    setLoading(false);
    if (res.ok) setStep(3);
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Passos */}
      <div className="mb-8 flex items-center justify-center gap-2 text-sm">
        {[
          { n: 1, label: "Data e horário" },
          { n: 2, label: "Seus dados" },
          { n: 3, label: "Confirmação" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                step >= (s.n as 1 | 2 | 3)
                  ? "bg-brand text-ivory"
                  : "bg-ink/[0.06] text-muted"
              }`}
            >
              {step > s.n ? <Check className="h-4 w-4" /> : s.n}
            </span>
            <span className={`hidden sm:inline ${step >= s.n ? "text-ink" : "text-muted"}`}>
              {s.label}
            </span>
            {i < 2 && <span className="mx-1 h-px w-6 bg-ink/15 sm:w-10" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="card p-6 sm:p-8">
              {/* Seletor de dias */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand">
                  <Calendar className="h-5 w-5" />
                  <span className="font-serif text-lg text-ink">Escolha o dia</span>
                </div>
                <div className="flex gap-2">
                  <button
                    aria-label="Anterior"
                    onClick={() => {
                      setDayIdx((i) => Math.max(0, i - 1));
                      setSlot(null);
                    }}
                    disabled={dayIdx === 0}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Próximo"
                    onClick={() => {
                      setDayIdx((i) => Math.min(days.length - 1, i + 1));
                      setSlot(null);
                    }}
                    disabled={dayIdx === days.length - 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {days.slice(0, 21).map((d, i) => {
                  const [, m, dd] = d.dateKey.split("-");
                  const wdShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.weekday];
                  return (
                    <button
                      key={d.dateKey}
                      onClick={() => {
                        setDayIdx(i);
                        setSlot(null);
                      }}
                      className={`flex min-w-[4.5rem] flex-col items-center rounded-xl border px-3 py-3 transition-all ${
                        i === dayIdx
                          ? "border-brand bg-brand text-ivory shadow-soft"
                          : "border-ink/10 bg-white/60 text-graphite hover:border-brand/40"
                      }`}
                    >
                      <span className="text-xs uppercase opacity-80">{wdShort}</span>
                      <span className="mt-1 text-lg font-medium">{dd}</span>
                      <span className="text-[10px] opacity-70">/{m}</span>
                    </button>
                  );
                })}
              </div>

              {/* Horários */}
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-2 text-brand">
                  <Clock className="h-5 w-5" />
                  <span className="font-serif text-lg text-ink">
                    Horários — {day.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {day.slots.map((s) => (
                    <button
                      key={s.startISO}
                      onClick={() => setSlot(s)}
                      className={`rounded-lg border py-2.5 text-sm transition-all ${
                        slot?.startISO === s.startISO
                          ? "border-brand bg-brand text-ivory"
                          : "border-ink/10 bg-white/60 text-graphite hover:border-brand/50"
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
                {waHref !== "#" ? (
                  <a href={waHref} target="_blank" rel="noopener" className="btn-ghost">
                    <MessageCircle className="h-4 w-4" />
                    Prefiro pelo WhatsApp
                  </a>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => slot && setStep(2)}
                  disabled={!slot}
                  className="btn-primary w-full sm:w-auto disabled:opacity-40"
                >
                  Continuar
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && slot && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="card p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand/8 px-4 py-3 text-sm">
                <Calendar className="h-4 w-4 text-brand" />
                <span className="text-graphite">
                  {day.label} · <strong>{slot.time}</strong>
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo *">
                  <input
                    className="fld"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Seu nome"
                  />
                </Field>
                <Field label="Telefone / WhatsApp *">
                  <input
                    className="fld"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </Field>
                <Field label="E-mail">
                  <input
                    className="fld"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="voce@email.com"
                  />
                </Field>
                <Field label="Modalidade">
                  <div className="flex gap-2">
                    {(["presencial", "online"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`flex-1 rounded-lg border py-2.5 text-sm capitalize transition-all ${
                          mode === m
                            ? "border-brand bg-brand text-ivory"
                            : "border-ink/10 bg-white/60 text-graphite"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="Observação (opcional)">
                <textarea
                  className="fld min-h-[90px] resize-y"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Algo que queira nos contar antes da consulta"
                />
              </Field>

              {result && !result.ok && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {result.error}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between gap-4">
                <button onClick={() => setStep(1)} className="btn-ghost">
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </button>
                <button
                  onClick={submit}
                  disabled={loading || !form.name || !form.phone}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                    </>
                  ) : (
                    <>
                      Confirmar agendamento <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && result?.ok && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="card p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand text-ivory"
              >
                <Check className="h-8 w-8" />
              </motion.div>
              <h3 className="mt-6 font-serif text-3xl">Solicitação enviada!</h3>
              <p className="mx-auto mt-3 max-w-md text-muted">
                Recebemos seu pedido para <strong>{result.when}</strong>. Em breve
                confirmaremos com você. Se enviou WhatsApp, você receberá uma mensagem. 💚
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href="/" className="btn-ghost">
                  Voltar ao início
                </a>
                {waHref !== "#" && (
                  <a href={waHref} target="_blank" rel="noopener" className="btn-primary">
                    <MessageCircle className="h-4 w-4" />
                    Falar no WhatsApp
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
