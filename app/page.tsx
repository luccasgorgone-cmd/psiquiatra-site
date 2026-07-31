import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
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
  mediaUrl,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, doctor, clinic, specialties, helpSigns, agent] = await Promise.all([
    getSettings(),
    getDoctor(),
    getClinic(),
    getSpecialties(),
    getHelpSigns(),
    getAgentConfig(),
  ]);

  const s = settings!;
  const nav = (s.navItems as { label: string; href: string }[]) || [];
  const waHref = s.whatsapp
    ? whatsappLink(s.whatsapp, "Olá! Gostaria de agendar uma consulta.")
    : "#";

  const clinicPhotos = clinic.photos.map((p) => ({
    url: mediaUrl(p.mediaId)!,
    caption: p.caption,
  }));

  const quickReplies = ((agent?.faq as { q: string }[]) || []).slice(0, 4).map((f) => f.q);

  return (
    <>
      <SmoothScroll />
      <Header siteName={s.siteName} logoUrl={mediaUrl(s.logoId)} nav={nav} />

      <main>
        <Hero
          kicker={s.heroKicker}
          title={s.heroTitle}
          subtitle={s.heroSubtitle}
          doctorName={doctor?.name || s.siteName}
          crm={doctor?.crm || ""}
          rqe={doctor?.rqe || ""}
          photoUrl={mediaUrl(doctor?.photoId)}
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

        {clinic.info && (
          <Clinic
            title={clinic.info.title}
            description={clinic.info.description}
            amenities={(clinic.info.amenities as string[]) || []}
            hours={clinic.info.hours}
            photos={clinicPhotos}
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
