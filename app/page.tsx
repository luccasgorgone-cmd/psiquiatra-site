import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Approach from "@/components/site/Approach";
import Credentials from "@/components/site/Credentials";
import Clinic from "@/components/site/Clinic";
import Specialties from "@/components/site/Specialties";
import HelpSigns from "@/components/site/HelpSigns";
import Location from "@/components/site/Location";
import Footer from "@/components/site/Footer";
import FloatingWhats from "@/components/site/FloatingWhats";
import AgentWidget from "@/components/site/AgentWidget";
import { whatsappLink } from "@/lib/utils";
import {
  getSettings,
  getDoctor,
  getClinic,
  getSpecialties,
  getHelpSigns,
  getAgentConfig,
  getCredentials,
  mediaUrl,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, doctor, clinic, specialties, helpSigns, agent, credentials] = await Promise.all([
    getSettings(),
    getDoctor(),
    getClinic(),
    getSpecialties(),
    getHelpSigns(),
    getAgentConfig(),
    getCredentials(),
  ]);

  // Banco ainda não configurado/populado: mostra aviso elegante em vez de erro.
  if (!settings) return <SetupNotice />;

  const s = settings;
  const nav = (s.navItems as { label: string; href: string }[]) || [];
  const waHref = s.whatsapp
    ? whatsappLink(s.whatsapp, "Olá! Gostaria de agendar uma consulta.")
    : "#";

  const quickReplies = ((agent?.faq as { q: string }[]) || []).slice(0, 4).map((f) => f.q);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor?.name || s.siteName,
    medicalSpecialty: "Psychiatric",
    description: s.metaDescription || undefined,
    url: siteUrl || undefined,
    image: siteUrl && s.heroImageId ? `${siteUrl}/api/media/${s.heroImageId}` : undefined,
    telephone: s.phone || undefined,
    email: s.email || undefined,
    address: s.addressLine
      ? { "@type": "PostalAddress", streetAddress: s.addressLine, addressCountry: "BR" }
      : undefined,
    sameAs: [s.instagram, s.facebook].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmoothScroll />
      <ScrollProgress />
      <Header siteName={s.siteName} logoUrl={mediaUrl(s.logoId)} nav={nav} />

      <main>
        <Hero
          kicker={s.heroKicker}
          title={s.heroTitle}
          subtitle={s.heroSubtitle}
          doctorName={doctor?.name || s.siteName}
          crm={doctor?.crm || ""}
          rqe={doctor?.rqe || ""}
          photoUrl={mediaUrl(s.heroImageId) || mediaUrl(doctor?.photoId)}
          whatsappHref={waHref}
        />

        {doctor && (
          <About
            name={doctor.name}
            title={doctor.title}
            bioLong={doctor.bioLong}
            approach={doctor.approach}
            formation={doctor.formation}
            photoUrl={mediaUrl(doctor.photoId)}
          />
        )}

        {doctor?.approach && (
          <Approach approach={doctor.approach} doctorName={doctor.name} title={doctor.title} />
        )}

        {credentials.length > 0 && <Credentials items={credentials} />}

        {clinic.info && (
          <Clinic
            title={clinic.info.title}
            description={clinic.info.description}
            amenities={(clinic.info.amenities as string[]) || []}
            hours={clinic.info.hours}
          />
        )}

        {specialties.length > 0 && <Specialties items={specialties} />}

        {helpSigns.length > 0 && <HelpSigns signs={helpSigns.map((h) => h.label)} />}

        <Location
          address={s.addressLine}
          mapsEmbed={s.mapsEmbed}
          phone={s.phone}
          email={s.email}
          hours={clinic.info?.hours || ""}
          imageUrl={mediaUrl(s.locationImageId)}
        />
      </main>

      <Footer
        siteName={s.siteName}
        logoUrl={mediaUrl(s.logoId)}
        footerText={s.footerText}
        footerNote={s.footerNote}
        nav={nav}
        instagram={s.instagram}
        facebook={s.facebook}
        whatsapp={s.whatsapp}
        phone={s.phone}
        email={s.email}
        address={s.addressLine}
      />

      <FloatingWhats href={waHref} />
      {agent?.enabled && agent.channelSite && (
        <AgentWidget
          greeting={agent.greeting}
          quickReplies={quickReplies}
          whatsappHref={waHref}
        />
      )}
    </>
  );
}

function SetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-pulse rounded-2xl bg-brand/15" />
        <h1 className="font-serif text-2xl text-ink">Site em configuração</h1>
        <p className="mt-3 text-muted">
          Estamos preparando tudo. Assim que o banco de dados for conectado e
          populado, o conteúdo aparecerá aqui automaticamente.
        </p>
      </div>
    </main>
  );
}
