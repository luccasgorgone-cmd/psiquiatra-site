"use client";

import { useState, useEffect, useMemo } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Plus, Tag, X, Trash2, Loader2, Check,
  CalendarDays, User, Clock,
} from "lucide-react";
import {
  createManualAppointment, updateAppointmentMeta, deleteAppointment, createLabel, deleteLabel,
} from "@/app/admin/actions";

type Ev = {
  id: string; startISO: string; endISO: string; name: string; title: string;
  mode: string; status: string; kind: string; labelId: string | null;
  patientId: string | null; patientName: string | null; notes: string;
};
type Label = { id: string; name: string; color: string };
type PatientOpt = { id: string; name: string };
type State = { ok?: boolean; message?: string } | null;

const TZ = "America/Sao_Paulo";
const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const STATUS = ["PENDENTE", "CONFIRMADO", "CANCELADO", "CONCLUIDO"];
const STATUS_COLOR: Record<string, string> = { PENDENTE: "#B45309", CONFIRMADO: "#465a52", CANCELADO: "#DC2626", CONCLUIDO: "#6B6760" };

const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
const kp = (k: string) => { const [y, m, d] = k.split("-").map(Number); return { y, m: m - 1, d }; };
const addDaysKey = (k: string, n: number) => { const { y, m, d } = kp(k); const dt = new Date(Date.UTC(y, m, d)); dt.setUTCDate(dt.getUTCDate() + n); return dt.toISOString().slice(0, 10); };
const addMonthsKey = (k: string, n: number) => { const { y, m } = kp(k); return new Date(Date.UTC(y, m + n, 1)).toISOString().slice(0, 10); };
const weekdayOfKey = (k: string) => { const { y, m, d } = kp(k); return new Date(Date.UTC(y, m, d)).getUTCDay(); };
const evDateKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const evTime = (iso: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const fmtDayLong = (k: string) => { const { y, m, d } = kp(k); const s = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "long" }).format(new Date(Date.UTC(y, m, d, 12))); return s.charAt(0).toUpperCase() + s.slice(1); };
const fmtDayShort = (k: string) => { const { d, m } = kp(k); return `${String(d).padStart(2, "0")}/${String(m + 1).padStart(2, "0")}`; };

export default function AppointmentsCalendar({
  events, labels, patients,
}: { events: Ev[]; labels: Label[]; patients: PatientOpt[] }) {
  const [view, setView] = useState<"mes" | "semana" | "dia" | "custom">("mes");
  const [cursor, setCursor] = useState(todayKey());
  const [cStart, setCStart] = useState(todayKey());
  const [cEnd, setCEnd] = useState(addDaysKey(todayKey(), 14));
  const [selected, setSelected] = useState<Ev | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  const labelsMap = useMemo(() => Object.fromEntries(labels.map((l) => [l.id, l])), [labels]);
  const byDay = useMemo(() => {
    const m: Record<string, Ev[]> = {};
    for (const e of events) { const k = evDateKey(e.startISO); (m[k] ||= []).push(e); }
    for (const k in m) m[k].sort((a, b) => a.startISO.localeCompare(b.startISO));
    return m;
  }, [events]);

  const evColor = (e: Ev) => (e.labelId && labelsMap[e.labelId] ? labelsMap[e.labelId].color : STATUS_COLOR[e.status]);

  const nav = (dir: number) => {
    if (view === "mes") setCursor((c) => addMonthsKey(c, dir));
    else if (view === "semana") setCursor((c) => addDaysKey(c, dir * 7));
    else setCursor((c) => addDaysKey(c, dir));
  };

  const { y, m } = kp(cursor);
  let periodLabel = "";
  if (view === "mes") periodLabel = `${MESES[m]} ${y}`;
  else if (view === "dia") periodLabel = fmtDayLong(cursor);
  else if (view === "semana") {
    const ws = addDaysKey(cursor, -weekdayOfKey(cursor));
    periodLabel = `${fmtDayShort(ws)} – ${fmtDayShort(addDaysKey(ws, 6))}`;
  } else periodLabel = `${fmtDayShort(cStart)} – ${fmtDayShort(cEnd)}`;

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {view !== "custom" && (
            <>
              <button onClick={() => nav(-1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 hover:bg-ink/[0.04]"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setCursor(todayKey())} className="rounded-lg border border-ink/10 px-3 py-2 text-sm hover:bg-ink/[0.04]">Hoje</button>
              <button onClick={() => nav(1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 hover:bg-ink/[0.04]"><ChevronRight className="h-4 w-4" /></button>
            </>
          )}
          <span className="ml-1 font-serif text-lg capitalize text-ink">{periodLabel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-ink/10 p-0.5">
            {(["mes", "semana", "dia", "custom"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${view === v ? "bg-brand text-ivory" : "text-graphite hover:bg-ink/[0.04]"}`}>
                {v === "custom" ? "Personalizado" : v}
              </button>
            ))}
          </div>
          <button onClick={() => setShowLabels(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 px-3 py-2 text-sm hover:bg-ink/[0.04]"><Tag className="h-4 w-4" /> Etiquetas</button>
          <button onClick={() => setShowNew(true)} className="btn-primary"><Plus className="h-4 w-4" /> Nova marcação</button>
        </div>
      </div>

      {view === "custom" && (
        <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-ink/[0.08] bg-white p-4">
          <label className="text-sm"><span className="mb-1 block text-muted">De</span><input type="date" value={cStart} onChange={(e) => setCStart(e.target.value)} className="fld" /></label>
          <label className="text-sm"><span className="mb-1 block text-muted">Até</span><input type="date" value={cEnd} onChange={(e) => setCEnd(e.target.value)} className="fld" /></label>
        </div>
      )}

      <div className="rounded-xl2 border border-ink/[0.07] bg-white p-4 shadow-soft sm:p-5">
        {view === "mes" && <MonthView cursor={cursor} byDay={byDay} evColor={evColor} onDay={(k: string) => { setCursor(k); setView("dia"); }} onEvent={setSelected} />}
        {view === "semana" && <WeekView cursor={cursor} byDay={byDay} evColor={evColor} onEvent={setSelected} />}
        {view === "dia" && <DayView dayKey={cursor} byDay={byDay} evColor={evColor} onEvent={setSelected} />}
        {view === "custom" && <RangeView start={cStart} end={cEnd} byDay={byDay} evColor={evColor} onEvent={setSelected} />}
      </div>

      {selected && <EventDetail ev={selected} labels={labels} onClose={() => setSelected(null)} evColor={evColor} />}
      {showNew && <NewAppointment labels={labels} patients={patients} onClose={() => setShowNew(false)} />}
      {showLabels && <LabelsManager labels={labels} onClose={() => setShowLabels(false)} />}
    </div>
  );
}

function EventChip({ e, evColor, onClick, showDate }: { e: Ev; evColor: (e: Ev) => string; onClick: () => void; showDate?: boolean }) {
  const color = evColor(e);
  return (
    <button onClick={(ev) => { ev.stopPropagation(); onClick(); }}
      className="flex w-full items-center gap-1.5 truncate rounded px-1.5 py-1 text-left text-[11px] leading-tight hover:opacity-90"
      style={{ background: `${color}1a`, color }}>
      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="truncate font-medium">{showDate ? fmtDayShort(evDateKey(e.startISO)) + " " : ""}{evTime(e.startISO)} {e.title || e.name}</span>
    </button>
  );
}

function MonthView({ cursor, byDay, evColor, onDay, onEvent }: any) {
  const { y, m } = kp(cursor);
  const startWeekday = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const tk = todayKey();
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">{WD.map((w) => <div key={w} className="py-1">{w}</div>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="min-h-[92px] rounded-lg bg-ink/[0.01]" />;
          const k = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const evs = byDay[k] || [];
          const isToday = k === tk;
          return (
            <div key={i} onClick={() => onDay(k)}
              className="min-h-[92px] cursor-pointer rounded-lg border border-ink/[0.06] p-1 transition-colors hover:border-brand/30">
              <div className={`mb-1 text-right text-xs ${isToday ? "font-semibold text-brand" : "text-muted"}`}>{d}</div>
              <div className="space-y-1">
                {evs.slice(0, 3).map((e: Ev) => <EventChip key={e.id} e={e} evColor={evColor} onClick={() => onEvent(e)} />)}
                {evs.length > 3 && <div className="px-1 text-[10px] text-muted">+{evs.length - 3} mais</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ cursor, byDay, evColor, onEvent }: any) {
  const ws = addDaysKey(cursor, -weekdayOfKey(cursor));
  const days = Array.from({ length: 7 }, (_, i) => addDaysKey(ws, i));
  const tk = todayKey();
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7 sm:gap-2">
      {days.map((k) => {
        const evs = byDay[k] || [];
        const { d } = kp(k);
        return (
          <div key={k} className="rounded-lg border border-ink/[0.06]">
            <div className={`border-b border-ink/[0.06] px-2 py-1.5 text-center text-xs ${k === tk ? "font-semibold text-brand" : "text-muted"}`}>
              {WD[weekdayOfKey(k)]} {d}
            </div>
            <div className="min-h-[80px] space-y-1 p-1.5">
              {evs.length === 0 ? <div className="py-2 text-center text-[10px] text-ink/20">—</div> : evs.map((e: Ev) => <EventChip key={e.id} e={e} evColor={evColor} onClick={() => onEvent(e)} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ dayKey, byDay, evColor, onEvent }: any) {
  const evs: Ev[] = byDay[dayKey] || [];
  return (
    <div>
      <h3 className="mb-4 font-serif text-lg text-ink">{fmtDayLong(dayKey)}</h3>
      {evs.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Nenhuma consulta ou marcação neste dia.</p>
      ) : (
        <div className="space-y-2">
          {evs.map((e) => {
            const color = evColor(e);
            return (
              <button key={e.id} onClick={() => onEvent(e)}
                className="flex w-full items-center gap-4 rounded-xl border border-ink/[0.07] bg-white p-4 text-left transition-colors hover:border-brand/30">
                <div className="w-16 shrink-0 text-center">
                  <p className="font-serif text-lg text-ink">{evTime(e.startISO)}</p>
                  <p className="text-[11px] text-muted">{evTime(e.endISO)}</p>
                </div>
                <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{e.title || e.name}</p>
                  <p className="truncate text-sm text-muted">{e.kind === "marcacao" ? "Marcação" : "Consulta"} · {e.mode}{e.patientName ? ` · ${e.patientName}` : ""}</p>
                </div>
                <span className="shrink-0 rounded-full px-2.5 py-1 text-xs" style={{ background: `${color}1a`, color }}>{e.status}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RangeView({ start, end, byDay, evColor, onEvent }: any) {
  const days: string[] = [];
  let k = start;
  let guard = 0;
  while (k <= end && guard < 400) { days.push(k); k = addDaysKey(k, 1); guard++; }
  const withEvents = days.filter((d) => (byDay[d] || []).length > 0);
  if (withEvents.length === 0) return <p className="py-10 text-center text-sm text-muted">Nenhuma consulta no período selecionado.</p>;
  return (
    <div className="space-y-5">
      {withEvents.map((d) => (
        <div key={d}>
          <h4 className="mb-2 text-sm font-medium text-graphite">{fmtDayLong(d)}</h4>
          <div className="space-y-1.5">
            {(byDay[d] as Ev[]).map((e) => {
              const color = evColor(e);
              return (
                <button key={e.id} onClick={() => onEvent(e)} className="flex w-full items-center gap-3 rounded-lg border border-ink/[0.07] px-3 py-2 text-left hover:border-brand/30">
                  <span className="h-6 w-1 rounded-full" style={{ background: color }} />
                  <span className="w-12 text-sm text-ink">{evTime(e.startISO)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-graphite">{e.title || e.name}</span>
                  <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: `${color}1a`, color }}>{e.status}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Modais ────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-ivory p-6 shadow-lift sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl text-ink">{title}</h3>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-ink/[0.05]"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SaveBtn({ pending, label }: { pending: boolean; label: string }) {
  return <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{label}</button>;
}

function EventDetail({ ev, labels, onClose, evColor }: { ev: Ev; labels: Label[]; onClose: () => void; evColor: (e: Ev) => string }) {
  const [state, action, pending] = useActionState<State, FormData>(updateAppointmentMeta, null);
  useEffect(() => { if (state?.ok) onClose(); }, [state]); // eslint-disable-line
  return (
    <Modal title={ev.title || ev.name} onClose={onClose}>
      <div className="mb-4 space-y-1 text-sm text-graphite">
        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted" /> {fmtDayLong(evDateKey(ev.startISO))} · {evTime(ev.startISO)}–{evTime(ev.endISO)}</p>
        <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted" /> {ev.kind === "marcacao" ? "Marcação" : "Consulta"} · {ev.mode}</p>
        {ev.patientId ? (
          <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted" /> <Link href={`/admin/pacientes/${ev.patientId}`} className="text-brand hover:underline">{ev.patientName || "Ver paciente"}</Link></p>
        ) : ev.name ? <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted" /> {ev.name}</p> : null}
        {ev.notes && <p className="rounded-lg bg-ink/[0.03] px-3 py-2 text-muted">{ev.notes}</p>}
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={ev.id} />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm"><span className="mb-1 block text-muted">Status</span>
            <select name="status" defaultValue={ev.status} className="fld">{STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          </label>
          <label className="text-sm"><span className="mb-1 block text-muted">Etiqueta</span>
            <select name="labelId" defaultValue={ev.labelId || ""} className="fld"><option value="">— sem etiqueta —</option>{labels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
          </label>
        </div>
        <SaveBtn pending={pending} label="Salvar" />
      </form>
      <form action={deleteAppointment} className="mt-3 border-t border-ink/[0.06] pt-3">
        <input type="hidden" name="id" value={ev.id} />
        <button className="inline-flex items-center gap-1 text-sm text-muted hover:text-red-600"><Trash2 className="h-4 w-4" /> Excluir</button>
      </form>
    </Modal>
  );
}

function NewAppointment({ labels, patients, onClose }: { labels: Label[]; patients: PatientOpt[]; onClose: () => void }) {
  const [state, action, pending] = useActionState<State, FormData>(createManualAppointment, null);
  useEffect(() => { if (state?.ok) onClose(); }, [state]); // eslint-disable-line
  return (
    <Modal title="Nova marcação" onClose={onClose}>
      <form action={action} className="space-y-3">
        <label className="block text-sm"><span className="mb-1 block text-muted">Título *</span><input name="title" className="fld" placeholder="Ex.: Consulta, Retorno, Bloqueio…" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm"><span className="mb-1 block text-muted">Data *</span><input type="date" name="date" defaultValue={todayKey()} className="fld" /></label>
          <label className="text-sm"><span className="mb-1 block text-muted">Horário *</span><input type="time" name="time" defaultValue="09:00" className="fld" /></label>
          <label className="text-sm"><span className="mb-1 block text-muted">Duração (min)</span><input type="number" name="durationMin" defaultValue={50} min={10} step={5} className="fld" /></label>
          <label className="text-sm"><span className="mb-1 block text-muted">Modalidade</span><select name="mode" className="fld"><option value="presencial">Presencial</option><option value="online">Online</option></select></label>
          <label className="text-sm"><span className="mb-1 block text-muted">Paciente (opcional)</span><select name="patientId" className="fld"><option value="">—</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="text-sm"><span className="mb-1 block text-muted">Etiqueta</span><select name="labelId" className="fld"><option value="">—</option>{labels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
        </div>
        <label className="block text-sm"><span className="mb-1 block text-muted">Observação</span><textarea name="notes" className="fld min-h-[70px]" /></label>
        {state && !state.ok && state.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}
        <div className="pt-1"><SaveBtn pending={pending} label="Adicionar" /></div>
      </form>
    </Modal>
  );
}

function LabelsManager({ labels, onClose }: { labels: Label[]; onClose: () => void }) {
  const [state, action, pending] = useActionState<State, FormData>(createLabel, null);
  return (
    <Modal title="Etiquetas" onClose={onClose}>
      <div className="mb-5 space-y-2">
        {labels.length === 0 ? <p className="text-sm text-muted">Nenhuma etiqueta ainda. Crie a primeira abaixo.</p> : labels.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-lg border border-ink/[0.08] px-3 py-2">
            <span className="flex items-center gap-2 text-sm"><span className="inline-block h-4 w-4 rounded-full" style={{ background: l.color }} />{l.name}</span>
            <form action={deleteLabel}><input type="hidden" name="id" value={l.id} /><button className="text-muted hover:text-red-600"><Trash2 className="h-4 w-4" /></button></form>
          </div>
        ))}
      </div>
      <form action={action} className="flex items-end gap-2 border-t border-ink/[0.06] pt-4">
        <label className="flex-1 text-sm"><span className="mb-1 block text-muted">Nova etiqueta</span><input name="name" className="fld" placeholder="Ex.: Primeira consulta" /></label>
        <label className="text-sm"><span className="mb-1 block text-muted">Cor</span><input type="color" name="color" defaultValue="#A9814E" className="h-11 w-14 rounded-lg border border-ink/12 bg-white p-1" /></label>
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Criar</button>
      </form>
      {state?.message && <p className="mt-2 text-sm text-brand">{state.message}</p>}
    </Modal>
  );
}
