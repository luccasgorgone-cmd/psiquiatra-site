"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CalendarCheck, MessageCircle, ShieldCheck } from "lucide-react";

export default function Hero({
  kicker,
  title,
  subtitle,
  doctorName,
  crm,
  rqe,
  photoUrl,
  whatsappHref,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  doctorName: string;
  crm: string;
  rqe: string;
  photoUrl: string | null;
  whatsappHref: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section id="inicio" ref={ref} className="relative overflow-hidden pt-28 pb-20 sm:pt-36">
      <div className="noise pointer-events-none absolute inset-0 opacity-70" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-brand/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1], x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-brand-soft/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="kicker eyebrow-line"
          >
            {kicker}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease }}
            className="mt-6 text-balance text-4xl font-light leading-[1.05] text-ink sm:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a href="/agendar" className="btn-primary">
              <CalendarCheck className="h-4 w-4" />
              Agendar consulta
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener" className="btn-ghost">
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-10 flex items-center gap-6 text-sm text-muted"
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" /> Sigilo e ética
            </span>
            <span className="h-4 w-px bg-ink/15" />
            <span>Presencial e online</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand/15 to-transparent" />
          <div className="relative overflow-hidden rounded-[1.75rem] shadow-lift">
            <motion.div style={{ y, scale }} className="aspect-[4/5] w-full">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={doctorName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-deep text-ivory/70">
                  Foto do médico
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease }}
            className="absolute -bottom-6 -left-6 rounded-2xl border border-ink/[0.06] bg-ivory/95 px-5 py-4 shadow-soft backdrop-blur"
          >
            <p className="font-serif text-lg leading-tight text-ink">{doctorName}</p>
            <p className="mt-1 text-xs text-muted">
              {crm} · {rqe}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
