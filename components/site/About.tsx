import Reveal from "@/components/Reveal";
import RichText from "@/components/RichText";
import { GraduationCap, Video } from "lucide-react";

export default function About({
  name,
  title,
  bioLong,
  approach,
  formation,
  photoUrl,
}: {
  name: string;
  title: string;
  bioLong: string;
  approach: string;
  formation: string;
  photoUrl: string | null;
}) {
  return (
    <section id="sobre" className="relative py-24 sm:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal className="order-2 lg:order-1">
          <div className="relative mx-auto max-w-sm">
            <div className="absolute -left-5 -top-5 h-24 w-24 rounded-tl-[2rem] border-l-2 border-t-2 border-brand/40" />
            <div className="overflow-hidden rounded-[1.5rem] shadow-lift">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={name} className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-sand text-muted">
                  Foto
                </div>
              )}
            </div>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-br-[2rem] border-b-2 border-r-2 border-brand/40" />
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="kicker eyebrow-line">Sobre</p>
            <h2 className="mt-5 text-3xl font-light leading-tight text-ink sm:text-4xl">
              {name}
            </h2>
            <p className="mt-2 text-brand">{title}</p>
            <RichText text={bioLong} className="mt-6 text-lg leading-relaxed text-muted" />
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Reveal delay={0.05} className="card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <GraduationCap className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-serif text-lg">Formação</h3>
              <RichText text={formation} className="mt-2 text-sm leading-relaxed text-muted" />
            </Reveal>
            <Reveal delay={0.12} className="card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-warm/15 text-warm">
                <Video className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-serif text-lg">Atendimento</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Consultas presenciais em Araçatuba e online (teleconsulta), com sigilo e
                acompanhamento próximo em cada etapa.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
