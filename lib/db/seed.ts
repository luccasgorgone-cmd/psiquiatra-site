import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import { sslFor } from "./ssl";

const url = process.env.DATABASE_URL!;
const pool = new Pool({
  connectionString: url,
  ssl: sslFor(url),
});
const db = drizzle(pool, { schema });

const BRAND = "70 90 82"; // verde profundo, calmo

// ── Geradores de placeholder SVG (elegantes, na paleta da marca) ──
function svgToBase64(svg: string) {
  return Buffer.from(svg).toString("base64");
}

function portraitSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#46564e"/><stop offset="1" stop-color="#2b3630"/>
    </linearGradient>
  </defs>
  <rect width="900" height="1100" fill="url(#g)"/>
  <circle cx="450" cy="430" r="180" fill="#ffffff" opacity="0.12"/>
  <rect x="230" y="640" width="440" height="360" rx="220" fill="#ffffff" opacity="0.12"/>
  <text x="450" y="1050" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#ffffff" opacity="0.7">Foto da médica</text>
</svg>`;
}

function clinicSVG(label: string, seed: number) {
  const tones = ["#efe9e0", "#e4ddd2", "#d9d3c9"];
  const bg = tones[seed % tones.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="${bg}"/>
  <rect x="90" y="90" width="1020" height="720" fill="none" stroke="#46564e" stroke-opacity="0.25" stroke-width="2"/>
  <circle cx="600" cy="420" r="120" fill="#46564e" opacity="0.10"/>
  <text x="600" y="450" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="#46564e" opacity="0.55">${label}</text>
</svg>`;
}

function logoSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80">
  <circle cx="40" cy="40" r="26" fill="none" stroke="#46564e" stroke-width="3"/>
  <path d="M40 26 C30 34, 30 46, 40 54 C50 46, 50 34, 40 26 Z" fill="#46564e" opacity="0.85"/>
  <text x="82" y="38" font-family="Georgia, serif" font-size="26" fill="#1a1a17">Dra. Nome</text>
  <text x="82" y="60" font-family="Arial, sans-serif" font-size="13" letter-spacing="3" fill="#6b6760">PSIQUIATRIA</text>
</svg>`;
}

async function insertMedia(svg: string, alt: string) {
  const [row] = await db
    .insert(schema.mediaAssets)
    .values({ mime: "image/svg+xml", data: svgToBase64(svg), alt })
    .returning();
  return row.id;
}

async function main() {
  console.log("Semeando banco...");

  // Limpa listas para re-seed idempotente
  await db.delete(schema.clinicPhotos);
  await db.delete(schema.specialties);
  await db.delete(schema.helpSigns);
  await db.delete(schema.availabilityRules);

  // Mídia
  const logoId = await insertMedia(logoSVG(), "Logo da clínica");
  const photoId = await insertMedia(portraitSVG(), "Retrato da médica");
  const clinic1 = await insertMedia(clinicSVG("Recepção", 0), "Recepção da clínica");
  const clinic2 = await insertMedia(clinicSVG("Consultório", 1), "Consultório");
  const clinic3 = await insertMedia(clinicSVG("Sala de espera", 2), "Sala de espera");

  // Configurações do site
  await db
    .insert(schema.siteSettings)
    .values({
      id: "main",
      siteName: "Dra. Nome Sobrenome",
      tagline: "Psiquiatria • Saúde mental com escuta e ciência",
      logoId,
      brandRgb: BRAND,
      brandSoftRgb: "120 140 130",
      brandDeepRgb: "40 54 48",
      heroKicker: "Psiquiatria • Atendimento humanizado",
      heroTitle: "Cuidar da mente é cuidar da sua vida inteira",
      heroSubtitle:
        "Atendimento psiquiátrico presencial e online, com escuta atenta, sigilo e tratamento baseado em evidências.",
      navItems: [
        { label: "Início", href: "#inicio" },
        { label: "Sobre", href: "#sobre" },
        { label: "A Clínica", href: "#clinica" },
        { label: "Especialidades", href: "#especialidades" },
        { label: "Localização", href: "#localizacao" },
        { label: "Contato", href: "#contato" },
      ],
      footerText:
        "Atendimento psiquiátrico com acolhimento, ética e confidencialidade.",
      footerNote: "Este site tem caráter informativo e não substitui uma consulta médica.",
      instagram: "https://instagram.com/",
      facebook: "https://facebook.com/",
      whatsapp: "5599999999999",
      phone: "(00) 0000-0000",
      email: "contato@clinica.com.br",
      addressLine: "Av. Exemplo, 1000 — Sala 101, Centro, Cidade — UF",
      mapsEmbed:
        "https://www.google.com/maps?q=Avenida+Paulista,+São+Paulo&output=embed",
      metaTitle: "Dra. Nome Sobrenome — Psiquiatra",
      metaDescription:
        "Psiquiatria com atendimento humanizado, presencial e online. Agende sua consulta.",
    })
    .onConflictDoUpdate({
      target: schema.siteSettings.id,
      set: { logoId },
    });

  // Médica
  await db
    .insert(schema.doctor)
    .values({
      id: "main",
      name: "Dra. Nome Sobrenome",
      crm: "CRM/UF 000000",
      rqe: "RQE 00000",
      title: "Médica Psiquiatra",
      photoId,
      bioLong:
        "Médica psiquiatra com atuação clínica dedicada ao cuidado integral da saúde mental. Acredita em um acompanhamento próximo, respeitoso e livre de julgamentos, no qual cada pessoa é ouvida em sua singularidade. O tratamento une base científica atualizada e um olhar humano para o momento de vida de cada paciente.",
      approach:
        "Uma escuta cuidadosa é o ponto de partida. A partir dela, construímos juntos um plano de tratamento claro, seguro e adaptado à sua rotina — sempre com transparência sobre cada etapa.",
      formation:
        "Graduação em Medicina e Residência em Psiquiatria por instituição de referência. Formação continuada em saúde mental, com atualização constante em condutas baseadas em evidências.",
    })
    .onConflictDoUpdate({ target: schema.doctor.id, set: { photoId } });

  // Clínica
  await db
    .insert(schema.clinicInfo)
    .values({
      id: "main",
      title: "Um espaço pensado para o seu bem-estar",
      description:
        "Ambiente acolhedor, reservado e confortável, projetado para que você se sinta seguro desde a chegada. Localização central, de fácil acesso, com toda a estrutura para um atendimento tranquilo.",
      amenities: [
        "Estacionamento no local",
        "Acesso por elevador",
        "Ambiente reservado e silencioso",
        "Atendimento presencial e online",
      ],
      hours: "Segunda a sexta, das 9h às 18h",
    })
    .onConflictDoUpdate({
      target: schema.clinicInfo.id,
      set: { updatedAt: new Date() },
    });

  await db.insert(schema.clinicPhotos).values([
    { mediaId: clinic1, caption: "Recepção", order: 0 },
    { mediaId: clinic2, caption: "Consultório", order: 1 },
    { mediaId: clinic3, caption: "Sala de espera", order: 2 },
  ]);

  // Especialidades
  const specs = [
    ["Transtornos de ansiedade", "Preocupação excessiva, inquietação e dificuldade de concentração que impactam o dia a dia.", "wind"],
    ["Depressão", "Perda de interesse, tristeza persistente e mudanças no sono e apetite — com tratamento e acolhimento.", "cloud-rain"],
    ["Transtorno bipolar", "Oscilações de humor entre fases depressivas e de euforia, com acompanhamento contínuo.", "activity"],
    ["Transtornos do sono", "Insônia e alterações do sono que afetam a energia, o humor e a saúde como um todo.", "moon"],
    ["Síndrome do pânico", "Crises intensas de medo e sintomas físicos, tratadas com abordagem segura e gradual.", "heart-pulse"],
    ["TDAH", "Dificuldade de atenção, impulsividade e organização — avaliação e manejo individualizado.", "zap"],
    ["Estresse e burnout", "Esgotamento físico e mental ligado ao trabalho e à rotina, com estratégias de cuidado.", "battery-low"],
    ["Psiquiatria integrativa", "Tratamento convencional combinado a práticas complementares, quando indicado.", "leaf"],
  ];
  await db.insert(schema.specialties).values(
    specs.map(([title, description, icon], i) => ({
      title,
      description,
      icon,
      order: i,
    }))
  );

  // Quando buscar ajuda
  const signs = [
    "Tristeza profunda ou vazio que não passa",
    "Ansiedade e preocupação constantes",
    "Alterações no sono ou no apetite",
    "Irritabilidade ou mudanças bruscas de humor",
    "Dificuldade de concentração e memória",
    "Perda de interesse por atividades que gostava",
    "Sensação de esgotamento físico e mental",
    "Prejuízo nas atividades do dia a dia",
  ];
  await db.insert(schema.helpSigns).values(
    signs.map((label, i) => ({ label, order: i }))
  );

  // Disponibilidade — seg a sex, 9h às 18h, slots de 50min
  await db.insert(schema.availabilityRules).values(
    [1, 2, 3, 4, 5].map((weekday) => ({
      weekday,
      startTime: "09:00",
      endTime: "18:00",
      slotMin: 50,
      active: true,
    }))
  );

  // Agente
  await db
    .insert(schema.agentConfig)
    .values({
      id: "main",
      enabled: true,
      channelSite: true,
      channelWhats: false,
      greeting: "Olá! 👋 Sou o assistente virtual da clínica. Como posso ajudar?",
      fallback:
        "Para essa dúvida, o melhor é falar com nossa equipe. Posso te levar ao WhatsApp agora mesmo. 😊",
      faq: [
        { q: "Como agendar?", a: "Você pode agendar direto pelo site, escolhendo uma data e horário disponíveis, ou pelo nosso WhatsApp.", keywords: ["agendar", "marcar", "consulta", "horário", "agenda"] },
        { q: "Atende online?", a: "Sim! Oferecemos atendimento presencial e online (teleconsulta).", keywords: ["online", "teleconsulta", "remoto", "vídeo"] },
        { q: "Onde fica?", a: "Estamos em endereço central e de fácil acesso. Veja o mapa na seção Localização do site.", keywords: ["onde", "endereço", "local", "localização", "mapa"] },
        { q: "Valores e convênios", a: "Para informações sobre valores e formas de pagamento, fale com nossa equipe pelo WhatsApp.", keywords: ["valor", "preço", "convênio", "plano", "pagamento"] },
        { q: "Horário de atendimento", a: "Atendemos de segunda a sexta, das 9h às 18h.", keywords: ["horário", "funcionamento", "quando", "aberto"] },
      ],
    })
    .onConflictDoUpdate({ target: schema.agentConfig.id, set: { updatedAt: new Date() } });

  // Admin inicial
  const email = process.env.ADMIN_EMAIL || "admin@clinica.com.br";
  const pass = process.env.ADMIN_PASSWORD || "Admin123!";
  const name = process.env.ADMIN_NAME || "Administrador";
  const hash = await bcrypt.hash(pass, 10);
  await db
    .insert(schema.adminUsers)
    .values({ email, name, password: hash })
    .onConflictDoUpdate({
      target: schema.adminUsers.email,
      set: { password: hash, name },
    });

  console.log(`✔ Seed concluído. Admin: ${email}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
