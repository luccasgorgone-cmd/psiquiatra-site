"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Stethoscope,
  Milestone,
  Image as ImageIcon,
  Palette,
  CalendarRange,
  CalendarCheck,
  Users,
  ClipboardList,
  Bot,
  Plug,
  UserCog,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { logoutAction } from "@/app/admin/auth-actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/conteudo", label: "Conteúdo", icon: FileText },
  { href: "/admin/especialidades", label: "Especialidades", icon: Stethoscope },
  { href: "/admin/trajetoria", label: "Trajetória", icon: Milestone },
  { href: "/admin/midia", label: "Mídia & Logo", icon: ImageIcon },
  { href: "/admin/aparencia", label: "Aparência & Site", icon: Palette },
  { href: "/admin/disponibilidade", label: "Disponibilidade", icon: CalendarRange },
  { href: "/admin/consultas", label: "Consultas", icon: CalendarCheck },
  { href: "/admin/pacientes", label: "Pacientes", icon: Users },
  { href: "/admin/sessoes", label: "Sessões", icon: ClipboardList },
  { href: "/admin/agente", label: "Agente", icon: Bot },
  { href: "/admin/integracoes", label: "Integrações", icon: Plug },
  { href: "/admin/conta", label: "Conta", icon: UserCog },
];

export default function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-2 px-6">
        <span className="font-serif text-lg text-ink">Painel</span>
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand">
          Admin
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "bg-brand text-ivory" : "text-graphite hover:bg-ink/[0.04]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ink/[0.06] p-3">
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL || "/"}
          target="_blank"
          rel="noopener"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-graphite hover:bg-ink/[0.04]"
        >
          <ExternalLink className="h-4 w-4" /> Ver site
        </a>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-ink/[0.03] px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">{user.name || "Admin"}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <button aria-label="Sair" className="text-muted hover:text-red-600">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand/40">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink/[0.06] bg-ivory lg:block">
        {Sidebar}
      </aside>

      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink/[0.06] bg-ivory px-4 lg:hidden">
        <span className="font-serif text-lg">Painel</span>
        <button onClick={() => setOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink/10">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-ivory shadow-lift">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-5 inline-flex h-9 w-9 items-center justify-center rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            {Sidebar}
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
