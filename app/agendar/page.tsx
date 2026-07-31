import Link from "next/link";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import BookingFlow from "@/components/booking/BookingFlow";
import { getAvailableDays } from "@/lib/availability";
import { getSettings, getDoctor, mediaUrl } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Agendar consulta",
  description: "Escolha o melhor dia e horário para a sua consulta.",
};

export default async function AgendarPage() {
  const [days, settings, doctor] = await Promise.all([
    getAvailableDays({ daysAhead: 45, leadHours: 3 }),
    getSettings(),
    getDoctor(),
  ]);

  const s = settings!;
  const logo = mediaUrl(s.logoId);

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-ink/[0.06] bg-ivory/80 backdrop-blur">
        <div className="container-x flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={s.siteName} className="h-9 w-auto" />
            ) : (
              <span className="font-serif text-xl">{s.siteName}</span>
            )}
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="container-x py-14 sm:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="kicker justify-center">
            <CalendarCheck className="h-4 w-4" />
            Agendamento
          </p>
          <h1 className="mt-4 text-3xl font-light text-ink sm:text-4xl">
            Marque sua consulta com {doctor?.name || s.siteName}
          </h1>
          <p className="mt-3 text-muted">
            Escolha um horário disponível ou fale direto no WhatsApp. É rápido e sigiloso.
          </p>
        </div>

        <BookingFlow days={days} whatsapp={s.whatsapp} />
      </main>
    </div>
  );
}
