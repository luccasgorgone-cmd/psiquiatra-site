import { randomUUID } from "crypto";
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  json,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

const id = () => text("id").primaryKey().$defaultFn(() => randomUUID());

// ── Mídia (imagens em base64 no Postgres) ─────────────────────
export const mediaAssets = pgTable("media_assets", {
  id: id(),
  mime: text("mime").notNull(),
  data: text("data").notNull(), // base64
  alt: text("alt").notNull().default(""),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Configurações globais (singleton id="main") ───────────────
export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("main"),
  siteName: text("site_name").notNull().default("Clínica"),
  tagline: text("tagline").notNull().default(""),

  logoId: text("logo_id"),
  brandRgb: text("brand_rgb").notNull().default("70 90 82"),
  brandSoftRgb: text("brand_soft_rgb").notNull().default("120 140 130"),
  brandDeepRgb: text("brand_deep_rgb").notNull().default("40 54 48"),

  // Tipografia (chaves das fontes escolhidas no painel)
  fontHeading: text("font_heading").notNull().default("fraunces"),
  fontBody: text("font_body").notNull().default("inter"),

  heroImageId: text("hero_image_id"),
  heroKicker: text("hero_kicker").notNull().default("Psiquiatria"),
  heroTitle: text("hero_title").notNull().default("Cuide sempre da sua saúde mental"),
  heroSubtitle: text("hero_subtitle").notNull().default(""),

  navItems: json("nav_items").notNull().$type<{ label: string; href: string }[]>().default([]),

  footerText: text("footer_text").notNull().default(""),
  footerNote: text("footer_note").notNull().default(""),

  instagram: text("instagram").notNull().default(""),
  facebook: text("facebook").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),

  addressLine: text("address_line").notNull().default(""),
  mapsEmbed: text("maps_embed").notNull().default(""),

  metaTitle: text("meta_title").notNull().default(""),
  metaDescription: text("meta_description").notNull().default(""),
  ogImageId: text("og_image_id"),

  // Imagens editoriais espalhadas pelo site
  clinicImageId: text("clinic_image_id"),
  approachImageId: text("approach_image_id"),
  locationImageId: text("location_image_id"),
  faviconId: text("favicon_id"),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Médica ────────────────────────────────────────────────────
export const doctor = pgTable("doctor", {
  id: text("id").primaryKey().default("main"),
  name: text("name").notNull().default("Dra. Nome Sobrenome"),
  crm: text("crm").notNull().default("CRM/UF 000000"),
  rqe: text("rqe").notNull().default("RQE 00000"),
  title: text("title").notNull().default("Médica Psiquiatra"),
  bioLong: text("bio_long").notNull().default(""),
  approach: text("approach").notNull().default(""),
  formation: text("formation").notNull().default(""),
  photoId: text("photo_id"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Especialidades ────────────────────────────────────────────
export const specialties = pgTable("specialties", {
  id: id(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("brain"),
  order: integer("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

// ── Clínica ───────────────────────────────────────────────────
export const clinicInfo = pgTable("clinic_info", {
  id: text("id").primaryKey().default("main"),
  title: text("title").notNull().default("A Clínica"),
  description: text("description").notNull().default(""),
  amenities: json("amenities").notNull().$type<string[]>().default([]),
  hours: text("hours").notNull().default("Segunda a sexta, 9h às 18h"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const clinicPhotos = pgTable("clinic_photos", {
  id: id(),
  mediaId: text("media_id").notNull(),
  caption: text("caption").notNull().default(""),
  order: integer("order").notNull().default(0),
});

// ── Formação & Trajetória (credenciais) ───────────────────────
export const credentials = pgTable("credentials", {
  id: id(),
  title: text("title").notNull(), // ex.: "Residência em Psiquiatria"
  org: text("org").notNull(), // ex.: "University of Iowa (EUA)"
  period: text("period").notNull().default(""), // ex.: "2019 – 2023"
  detail: text("detail").notNull().default(""),
  icon: text("icon").notNull().default("graduation"), // graduation | globe | award | stethoscope
  order: integer("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

// ── "Quando buscar ajuda" ─────────────────────────────────────
export const helpSigns = pgTable("help_signs", {
  id: id(),
  label: text("label").notNull(),
  order: integer("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

// ── Disponibilidade ───────────────────────────────────────────
export const availabilityRules = pgTable("availability_rules", {
  id: id(),
  weekday: integer("weekday").notNull(), // 0=dom ... 6=sáb
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "18:00"
  slotMin: integer("slot_min").notNull().default(50),
  active: boolean("active").notNull().default(true),
});

export const blockedSlots = pgTable("blocked_slots", {
  id: id(),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  reason: text("reason").notNull().default(""),
});

// ── Consultas ─────────────────────────────────────────────────
export const appointmentStatus = pgEnum("appointment_status", [
  "PENDENTE",
  "CONFIRMADO",
  "CANCELADO",
  "CONCLUIDO",
]);
export const appointmentChannel = pgEnum("appointment_channel", ["SITE", "WHATSAPP"]);

export const appointments = pgTable(
  "appointments",
  {
    id: id(),
    patientId: text("patient_id"), // vínculo opcional com o cadastro do paciente
    labelId: text("label_id"), // etiqueta colorida (opcional)
    kind: text("kind").notNull().default("consulta"), // consulta | marcacao
    title: text("title").notNull().default(""), // título livre para marcações manuais
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().default(""),
    start: timestamp("start").notNull(),
    end: timestamp("end").notNull(),
    status: appointmentStatus("status").notNull().default("PENDENTE"),
    channel: appointmentChannel("channel").notNull().default("SITE"),
    mode: text("mode").notNull().default("presencial"),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    startIdx: index("appointments_start_idx").on(t.start),
    patientIdx: index("appointments_patient_idx").on(t.patientId),
  })
);

// ── Etiquetas coloridas para a agenda ─────────────────────────
export const appointmentLabels = pgTable("appointment_labels", {
  id: id(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#A9814E"), // hex
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Admin ─────────────────────────────────────────────────────
export const adminUsers = pgTable("admin_users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Agente ────────────────────────────────────────────────────
export const agentConfig = pgTable("agent_config", {
  id: text("id").primaryKey().default("main"),
  enabled: boolean("enabled").notNull().default(true),
  channelSite: boolean("channel_site").notNull().default(true),
  channelWhats: boolean("channel_whats").notNull().default(false),
  greeting: text("greeting").notNull().default("Olá! 👋 Como posso ajudar você hoje?"),
  fallback: text("fallback").notNull().default(""),
  faq: json("faq").notNull().$type<{ q: string; a: string; keywords: string[] }[]>().default([]),
  aiEnabled: boolean("ai_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const agentMessages = pgTable("agent_messages", {
  id: id(),
  channel: text("channel").notNull(),
  from: text("from").notNull().default(""),
  text: text("text").notNull(),
  reply: text("reply").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Pacientes (cadastro + portal do paciente) ─────────────────
export const patients = pgTable("patients", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  birthDate: text("birth_date").notNull().default(""), // "YYYY-MM-DD"
  cpf: text("cpf").notNull().default(""),
  address: text("address").notNull().default(""),
  password: text("password"), // hash bcrypt; null = sem acesso ao portal ainda
  notes: text("notes").notNull().default(""), // observações administrativas (só médico)
  summary: text("summary").notNull().default(""), // resumo do caso, evolui no tempo (só médico)
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Sessões clínicas (prontuário) — confidencial, só o médico ──
export const clinicalSessions = pgTable(
  "clinical_sessions",
  {
    id: id(),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull().defaultNow(),
    title: text("title").notNull().default(""),
    content: text("content").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({ patientIdx: index("clinical_sessions_patient_idx").on(t.patientId) })
);

// ── Mensagens médico ↔ paciente ───────────────────────────────
export const patientMessages = pgTable(
  "patient_messages",
  {
    id: id(),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    sender: text("sender").notNull().default("doctor"), // doctor | patient
    body: text("body").notNull(),
    readByPatient: boolean("read_by_patient").notNull().default(false),
    readByDoctor: boolean("read_by_doctor").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ patientIdx: index("patient_messages_patient_idx").on(t.patientId) })
);

// tipos convenientes
export type SiteSettings = typeof siteSettings.$inferSelect;
export type Doctor = typeof doctor.$inferSelect;
export type Specialty = typeof specialties.$inferSelect;
export type ClinicInfoRow = typeof clinicInfo.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type AgentConfigRow = typeof agentConfig.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type ClinicalSession = typeof clinicalSessions.$inferSelect;
export type PatientMessage = typeof patientMessages.$inferSelect;
export type AppointmentLabel = typeof appointmentLabels.$inferSelect;
