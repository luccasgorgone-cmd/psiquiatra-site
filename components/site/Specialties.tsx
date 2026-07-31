"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Icon from "./Icon";
import Reveal from "@/components/Reveal";

type Spec = { id: string; title: string; description: string; icon: string };

export default function Specialties({ items }: { items: Spec[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section id="especialidades" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <Reveal>
            <p className="kicker eyebrow-line">Especialidades</p>
            <h2 className="mt-5 text-3xl font-light leading-tight text-ink sm:text-4xl">
              Áreas de cuidado
            </h2>
            <p className="mt-4 text-lg text-muted">
              Um acompanhamento próximo para diferentes momentos da sua saúde mental.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {items.map((s, i) => {
            const open = openId === s.id;
            return (
              <Reveal key={s.id} delay={(i % 2) * 0.06}>
                <button
                  onClick={() => setOpenId(open ? null : s.id)}
                  className={`group w-full rounded-xl2 border p-6 text-left transition-all duration-500 ease-smooth ${
                    open
                      ? "border-brand/30 bg-white shadow-lift"
                      : "border-ink/[0.07] bg-white/50 hover:border-brand/20 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                          open ? "bg-brand text-ivory" : "bg-brand/10 text-brand"
                        }`}
                      >
                        <Icon name={s.icon} className="h-5 w-5" />
                      </span>
                      <h3 className="font-serif text-lg text-ink">{s.title}</h3>
                    </div>
                    <Plus
                      className={`mt-1 h-5 w-5 shrink-0 text-muted transition-transform duration-500 ${
                        open ? "rotate-45 text-brand" : ""
                      }`}
                    />
                  </div>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pl-16 pr-2 pt-4 text-sm leading-relaxed text-muted">
                          {s.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
