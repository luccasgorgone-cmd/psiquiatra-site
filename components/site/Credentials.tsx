import Reveal from "@/components/Reveal";
import RichText from "@/components/RichText";
import {
  GraduationCap,
  Globe2,
  Award,
  Stethoscope,
  ShieldCheck,
  BadgeCheck,
  Microscope,
  type LucideProps,
} from "lucide-react";

type Cred = { id: string; title: string; org: string; period: string; detail: string; icon: string };

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  graduation: GraduationCap,
  globe: Globe2,
  award: Award,
  stethoscope: Stethoscope,
};

const TRUST = [
  { icon: Globe2, label: "Formação internacional" },
  { icon: Microscope, label: "Prática baseada em evidências" },
  { icon: ShieldCheck, label: "Sigilo e ética" },
  { icon: BadgeCheck, label: "Especialista (RQE)" },
];

export default function Credentials({ items }: { items: Cred[] }) {
  if (items.length === 0) return null;

  return (
    <section id="trajetoria" className="relative overflow-hidden py-24 sm:py-32">
      <div className="noise pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-brand/8 blur-3xl" />

      <div className="container-x relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p className="kicker eyebrow-line">Formação & Trajetória</p>
            <h2 className="mt-5 text-3xl font-light leading-tight text-ink sm:text-4xl">
              Uma trajetória construída com rigor e dedicação
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Formação médica sólida e especialização internacional se traduzem em um
              atendimento seguro, atualizado e centrado em você.
            </p>
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {TRUST.map((t, i) => (
              <Reveal
                key={t.label}
                delay={i * 0.06}
                className="flex items-center gap-3 rounded-xl border border-ink/[0.07] bg-white/60 px-4 py-3"
              >
                <t.icon className="h-5 w-5 shrink-0 text-brand" />
                <span className="text-sm text-graphite">{t.label}</span>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-brand/40 via-brand/20 to-transparent" />
          <div className="space-y-5">
            {items.map((c, i) => {
              const Ico = ICONS[c.icon] || Award;
              return (
                <Reveal key={c.id} delay={i * 0.08} className="relative flex gap-5">
                  <span className="relative z-10 mt-1 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand/20 bg-white text-brand shadow-soft">
                    <Ico className="h-6 w-6" />
                  </span>
                  <div className="card flex-1 p-5">
                    {c.period && (
                      <span className="text-xs font-medium uppercase tracking-wider text-brand">
                        {c.period}
                      </span>
                    )}
                    <h3 className="mt-1 font-serif text-xl text-ink">{c.title}</h3>
                    <p className="mt-0.5 text-sm font-medium text-graphite">{c.org}</p>
                    {c.detail && (
                      <RichText text={c.detail} className="mt-2 text-sm leading-relaxed text-muted" />
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
