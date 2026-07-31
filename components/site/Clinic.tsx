import Reveal from "@/components/Reveal";
import { Check, Clock } from "lucide-react";

export default function Clinic({
  title,
  description,
  amenities,
  hours,
  photos,
}: {
  title: string;
  description: string;
  amenities: string[];
  hours: string;
  photos: { url: string; caption: string }[];
}) {
  return (
    <section id="clinica" className="relative bg-sand/60 py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <p className="kicker eyebrow-line">A Clínica</p>
            <h2 className="mt-5 max-w-lg text-3xl font-light leading-tight text-ink sm:text-4xl">
              {title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-muted">{description}</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {amenities.map((a) => (
                <div key={a} className="flex items-center gap-3 text-sm text-graphite">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand/12 text-brand">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {a}
                </div>
              ))}
            </div>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-graphite shadow-soft">
              <Clock className="h-4 w-4 text-brand" />
              {hours}
            </div>
          </Reveal>
        </div>

        {photos.length > 0 && (
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {photos.map((p, i) => (
              <Reveal key={i} delay={i * 0.08} className="group overflow-hidden rounded-xl2 shadow-soft">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.caption}
                    className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
                  />
                  {p.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-4">
                      <span className="text-sm font-medium text-ivory">{p.caption}</span>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
