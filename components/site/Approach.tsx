import Reveal from "@/components/Reveal";
import ParallaxImage from "@/components/ParallaxImage";
import { Quote } from "lucide-react";

export default function Approach({
  approach,
  imageUrl,
  doctorName,
  title,
}: {
  approach: string;
  imageUrl: string | null;
  doctorName: string;
  title: string;
}) {
  return (
    <section className="relative overflow-hidden bg-warm-tint py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-warm/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        {imageUrl && (
          <Reveal className="order-2 lg:order-1">
            <ParallaxImage
              src={imageUrl}
              alt={doctorName}
              className="mx-auto aspect-[4/5] w-full max-w-sm shadow-lift"
              amount={36}
            />
          </Reveal>
        )}

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="kicker eyebrow-line" style={{ color: "#A9814E" }}>
              A abordagem
            </p>
            <Quote className="mt-6 h-10 w-10 text-warm" />
            <blockquote className="mt-4 max-w-2xl font-serif text-2xl font-light italic leading-snug text-ink sm:text-[2rem]">
              {approach}
            </blockquote>
            <div className="mt-8 flex items-center gap-3">
              <span className="h-px w-10 bg-warm" />
              <span className="text-sm font-medium text-graphite">{doctorName}</span>
              <span className="text-sm text-muted">· {title}</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
