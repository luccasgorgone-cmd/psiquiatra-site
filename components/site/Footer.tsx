import { Instagram, Facebook, MessageCircle, CalendarCheck } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

type NavItem = { label: string; href: string };

export default function Footer({
  siteName,
  logoUrl,
  footerText,
  footerNote,
  nav,
  instagram,
  facebook,
  whatsapp,
  phone,
  email,
  address,
}: {
  siteName: string;
  logoUrl: string | null;
  footerText: string;
  footerNote: string;
  nav: NavItem[];
  instagram: string;
  facebook: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
}) {
  const year = new Date().getFullYear();
  const waHref = whatsapp
    ? whatsappLink(whatsapp, "Olá! Gostaria de agendar uma consulta.")
    : "#";

  return (
    <footer id="contato" className="border-t border-ink/[0.07] bg-ivory">
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-10 w-auto" />
            ) : (
              <span className="font-serif text-xl">{siteName}</span>
            )}
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{footerText}</p>
            <div className="mt-6 flex gap-3">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener" aria-label="Instagram" className="social-btn">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener" aria-label="Facebook" className="social-btn">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {whatsapp && (
                <a href={waHref} target="_blank" rel="noopener" aria-label="WhatsApp" className="social-btn">
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Navegação</p>
            <ul className="mt-5 space-y-3 text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-graphite transition-colors hover:text-brand">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Contato</p>
            <ul className="mt-5 space-y-3 text-sm text-graphite">
              {address && <li>{address}</li>}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\D/g, "")}`} className="hover:text-brand">
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-brand">
                    {email}
                  </a>
                </li>
              )}
            </ul>
            <a href="/agendar" className="btn-primary mt-6">
              <CalendarCheck className="h-4 w-4" />
              Agendar consulta
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ink/[0.07] pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteName}. Todos os direitos reservados.</p>
          <p className="max-w-md sm:text-right">{footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
