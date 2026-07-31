import Reveal from "@/components/Reveal";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Location({
  address,
  mapsEmbed,
  phone,
  email,
  hours,
}: {
  address: string;
  mapsEmbed: string;
  phone: string;
  email: string;
  hours: string;
}) {
  return (
    <section id="localizacao" className="py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <p className="kicker eyebrow-line">Localização</p>
          <h2 className="mt-5 text-3xl font-light leading-tight text-ink sm:text-4xl">
            Como chegar
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="overflow-hidden rounded-xl2 border border-ink/[0.07] shadow-soft">
            {mapsEmbed ? (
              <iframe
                src={mapsEmbed}
                className="h-[380px] w-full lg:h-full"
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

          <div className="flex flex-col gap-4">
            {[
              { icon: MapPin, label: "Endereço", value: address },
              { icon: Clock, label: "Horário", value: hours },
              { icon: Phone, label: "Telefone", value: phone, href: `tel:${phone.replace(/\D/g, "")}` },
              { icon: Mail, label: "E-mail", value: email, href: `mailto:${email}` },
            ]
              .filter((r) => r.value)
              .map((r, i) => (
                <Reveal key={i} delay={i * 0.06} className="card flex items-start gap-4 p-5">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">{r.label}</p>
                    {r.href ? (
                      <a href={r.href} className="mt-1 block text-graphite hover:text-brand">
                        {r.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-graphite">{r.value}</p>
                    )}
                  </div>
                </Reveal>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
