import Reveal from "@/components/Reveal";
import ParallaxImage from "@/components/ParallaxImage";
import { Check, Clock } from "lucide-react";

export default function Clinic({
  title,
  description,
  amenities,
  hours,
  imageUrl,
  photos,
}: {
  title: string;
  description: string;
  amenities: string[];
  hours: string;
  imageUrl: string | null;
  photos: { url: string; caption: string }[];
}) {
  return (
    <section id="clinica" className="relative overflow-hidden bg-sand/60 py-24 sm:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        {imageUrl && (
          <Reveal className="relative">
            <div className="absolute -left-4 -top-4 hidden h-28 w-28 rounded-tl-[2rem] border-l-2 border-t-2 border-warm/50 sm:block" />
            <ParallaxImage
              src={imageUrl}
              alt="Consultório"
              className="aspect-[4/5] w-full shadow-lift"
              amount={44}
            />
            <div className="absolute -bottom-5 -right-5 rounded-2xl bg-brand px-5 py-4 text-ivory shadow-lift">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {hours}
              </div>
            </div>
          </Reveal>
        )}

        <div>
          <Reveal>
            <p className="kicker eyebrow-line">A Clínica</p>
            <h2 className="mt-5 max-w-lg text-3xl font-light leading-tight text-ink sm:text-4xl">
              {title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{description}</p>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {amenities.map((a, i) => (
              <Reveal
                key={a}
                delay={i * 0.06}
                className="flex items-center gap-3 rounded-xl border border-ink/[0.06] bg-white/70 px-4 py-3 text-sm text-graphite"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-warm/15 text-warm">
                  <Check className="h-4 w-4" />
                </span>
                {a}
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="container-x mt-14 grid gap-4 sm:grid-cols-3">
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
    </section>
  );
}
