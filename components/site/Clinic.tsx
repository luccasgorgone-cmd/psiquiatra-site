"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Clock, Check, MapPin, ShieldCheck, Video, DoorClosed, Car, Accessibility, HeartHandshake,
  type LucideProps,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

function iconFor(text: string): React.ComponentType<LucideProps> {
  const t = text.toLowerCase();
  if (/(acesso|localiz|central|estaci)/.test(t)) return /estaci/.test(t) ? Car : MapPin;
  if (/(elevador|acessib|rampa)/.test(t)) return Accessibility;
  if (/(reservad|silenci|privaci|discret)/.test(t)) return DoorClosed;
  if (/(online|presencial|teleconsulta|v[ií]deo)/.test(t)) return Video;
  if (/(sigilo|confidenc|seguran)/.test(t)) return ShieldCheck;
  if (/(conforto|acolh|bem-estar)/.test(t)) return HeartHandshake;
  return Check;
}

export default function Clinic({
  title,
  description,
  amenities,
  hours,
}: {
  title: string;
  description: string;
  amenities: string[];
  hours: string;
}) {
  const reduce = useReducedMotion();

  return (
    <section id="clinica" className="relative overflow-hidden bg-sand/60 py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-brand/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-warm/10 blur-3xl" />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-2">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="kicker eyebrow-line"
          >
            A Clínica
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease }}
            className="mt-5 max-w-lg text-3xl font-light leading-tight text-ink sm:text-4xl"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className="mt-6 max-w-xl whitespace-pre-line text-lg leading-relaxed text-muted"
          >
            {description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm text-ivory shadow-soft"
          >
            <Clock className="h-4 w-4" />
            {hours}
          </motion.div>
        </div>

        {/* Comodidades com ícones animados */}
        <div className="grid gap-4 sm:grid-cols-2">
          {amenities.map((a, i) => {
            const Icon = iconFor(a);
            return (
              <motion.div
                key={a}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (i % 2) * 0.08 + Math.floor(i / 2) * 0.06, ease }}
                className="group flex items-start gap-4 rounded-xl2 border border-ink/[0.06] bg-white/70 p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
              >
                <motion.span
                  animate={reduce ? undefined : { y: [0, -4, 0] }}
                  transition={{ duration: 3.4 + i * 0.25, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warm/15 text-warm transition-colors group-hover:bg-warm group-hover:text-ivory"
                >
                  <Icon className="h-5 w-5" />
                </motion.span>
                <p className="pt-1.5 text-sm leading-relaxed text-graphite">{a}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
