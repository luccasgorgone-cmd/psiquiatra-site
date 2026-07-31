import Reveal from "@/components/Reveal";
import { CalendarCheck, AlertCircle } from "lucide-react";

export default function HelpSigns({ signs }: { signs: string[] }) {
  return (
    <section className="relative overflow-hidden bg-brand-deep py-24 text-ivory sm:py-32">
      <div className="noise pointer-events-none absolute inset-0 opacity-30" />
      <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Reveal>
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-ivory/70">
            <AlertCircle className="h-4 w-4" />
            Quando buscar ajuda
          </p>
          <h2 className="mt-5 text-3xl font-light leading-tight sm:text-4xl">
            Reconhecer os sinais é o primeiro passo do cuidado
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-ivory/75">
            Se você se identifica com alguns destes sinais, procurar apoio profissional
            faz diferença. Buscar ajuda é um ato de coragem e autocuidado.
          </p>
          <a href="/agendar" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ivory px-6 py-3 text-sm font-medium text-brand-deep transition-all hover:shadow-lift">
            <CalendarCheck className="h-4 w-4" />
            Agendar uma conversa
          </a>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2">
          {signs.map((s, i) => (
            <Reveal
              key={i}
              delay={(i % 2) * 0.06}
              className="rounded-xl border border-ivory/12 bg-ivory/[0.04] px-5 py-4 text-sm text-ivory/90 backdrop-blur-sm"
            >
              {s}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
