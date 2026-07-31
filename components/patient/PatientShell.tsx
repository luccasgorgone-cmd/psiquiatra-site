"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, MessageSquare, UserRound, Home, LogOut, Menu, X } from "lucide-react";
import { patientLogout } from "@/app/paciente/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/paciente", label: "Início", icon: Home },
  { href: "/paciente/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { href: "/paciente/mensagens", label: "Mensagens", icon: MessageSquare },
  { href: "/paciente/perfil", label: "Perfil", icon: UserRound },
];

export default function PatientShell({
  name,
  logoUrl,
  siteName,
  children,
}: {
  name: string;
  logoUrl: string | null;
  siteName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      {NAV.map((item) => {
        const active = item.href === "/paciente" ? pathname === "/paciente" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
              active ? "bg-brand text-ivory" : "text-graphite hover:bg-ink/[0.05]"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-sand/40">
      <header className="sticky top-0 z-30 border-b border-ink/[0.06] bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/paciente" className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
            ) : (
              <span className="font-serif text-lg">{siteName}</span>
            )}
            <span className="hidden rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand sm:inline">
              Paciente
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">{links}</nav>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted lg:inline">Olá, {name.split(" ")[0]}</span>
            <form action={patientLogout}>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/10 px-3 text-sm text-graphite hover:bg-ink/[0.04]">
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
            <button onClick={() => setOpen((v) => !v)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 md:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="flex flex-col gap-1 border-t border-ink/[0.06] px-5 py-3 md:hidden">{links}</div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
