"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote, Ear, FlaskConical, ShieldCheck, Route } from "lucide-react";
import RichText from "@/components/RichText";

const PILLARS = [
  { icon: Ear, title: "Escuta atenta", text: "Cada história é ouvida em sua singularidade, sem pressa." },
  { icon: FlaskConical, title: "Base em evidências", text: "Condutas atualizadas e cientificamente embasadas." },
  { icon: ShieldCheck, title: "Sigilo e ética", text: "Confidencialidade e respeito em cada etapa." },
  { icon: Route, title: "Plano individual", text: "Um tratamento desenhado para a sua rotina e o seu tempo." },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Approach({
  approach,
  doctorName,
  title,
}: {
  approach: string;
  doctorName: string;
  title: string;
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-warm-tint py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-warm/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <div className="container-x relative">
        {/* Citação */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warm/15 text-warm"
            >
              <Quote className="h-7 w-7" />
            </motion.div>
          </div>
          <p className="mt-6 flex justify-center text-xs font-medium uppercase tracking-[0.2em] text-warm">
            A abordagem
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease }}
          >
            <RichText
              text={approach}
              className="mt-4 font-serif text-2xl font-light italic leading-snug text-ink sm:text-[2.1rem]"
            />
          </motion.div>
          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-warm" />
            <span className="text-sm font-medium text-graphite">{doctorName}</span>
            <span className="hidden text-sm text-muted sm:inline">· {title}</span>
          </div>
        </div>

        {/* Pilares do cuidado */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
              className="group rounded-xl2 border border-ink/[0.06] bg-white/70 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
            >
              <motion.span
                animate={reduce ? undefined : { y: [0, -5, 0] }}
                transition={{ duration: 3.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-ivory"
              >
                <p.icon className="h-6 w-6" />
              </motion.span>
              <h3 className="mt-4 font-serif text-lg text-ink">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
