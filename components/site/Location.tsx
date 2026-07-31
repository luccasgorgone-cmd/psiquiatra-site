import Reveal from "@/components/Reveal";
import ParallaxImage from "@/components/ParallaxImage";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Location({
  address,
  mapsEmbed,
  phone,
  email,
  hours,
  imageUrl,
}: {
  address: string;
  mapsEmbed: string;
  phone: string;
  email: string;
  hours: string;
  imageUrl: string | null;
}) {
  const cards = [
    { icon: MapPin, label: "Endereço", value: address },
    { icon: Clock, label: "Horário", value: hours },
    { icon: Phone, label: "Telefone", value: phone, href: `tel:${phone.replace(/\D/g, "")}` },
    { icon: Mail, label: "E-mail", value: email, href: `mailto:${email}` },
  ].filter((r) => r.value);

  return (
    <section id="localizacao" className="py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <p className="kicker eyebrow-line">Localização</p>
          <h2 className="mt-5 max-w-xl text-3xl font-light leading-tight text-ink sm:text-4xl">
            Instituto Del Nery, em Araçatuba
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {imageUrl && (
            <Reveal>
              <ParallaxImage
                src={imageUrl}
                alt="Fachada do Instituto Del Nery"
                className="h-[380px] w-full shadow-soft lg:h-[440px]"
                rounded="rounded-xl2"
                amount={30}
              />
            </Reveal>
          )}

          <Reveal delay={0.08} className="overflow-hidden rounded-xl2 border border-ink/[0.07] shadow-soft">
            {mapsEmbed ? (
              <iframe
                src={mapsEmbed}
                className="h-[380px] w-full lg:h-[440px]"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa da localização"
              />
            ) : (
              <div className="flex h-[380px] items-center justify-center bg-sand text-muted">
                Mapa não configurado
              </div>
            )}
          </Reveal>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((r, i) => (
            <Reveal key={i} delay={i * 0.06} className="card flex min-w-0 items-start gap-4 p-5">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warm/15 text-warm">
                <r.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted">{r.label}</p>
                {r.href ? (
                  <a href={r.href} className="mt-1 block [overflow-wrap:anywhere] text-graphite hover:text-brand">
                    {r.value}
                  </a>
                ) : (
                  <p className="mt-1 [overflow-wrap:anywhere] text-graphite">{r.value}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
