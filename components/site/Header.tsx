"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string };

export default function Header({
  siteName,
  logoUrl,
  nav,
}: {
  siteName: string;
  logoUrl: string | null;
  nav: NavItem[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-smooth",
        scrolled
          ? "bg-ivory/85 backdrop-blur-md shadow-soft border-b border-ink/[0.06]"
          : "bg-transparent"
      )}
    >
      <div className="container-x flex h-20 items-center justify-between">
        <a href="#inicio" className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-9 w-auto" />
          ) : (
            <span className="font-serif text-xl">{siteName}</span>
          )}
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative text-sm text-graphite/80 transition-colors hover:text-ink"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="/paciente" className="hidden text-sm text-graphite transition-colors hover:text-brand lg:inline">
            Área do paciente
          </a>
          <a href="/agendar" className="btn-primary hidden sm:inline-flex">
            <CalendarCheck className="h-4 w-4" />
            Agendar consulta
          </a>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ink/[0.06] bg-ivory/95 backdrop-blur-md md:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-graphite hover:bg-ink/[0.03]"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/paciente"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-graphite hover:bg-ink/[0.03]"
              >
                Área do paciente
              </a>
              <a href="/agendar" className="btn-primary mt-2 w-full">
                <CalendarCheck className="h-4 w-4" />
                Agendar consulta
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
