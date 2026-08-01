"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  siteSettings,
  doctor,
  clinicInfo,
  clinicPhotos,
  specialties,
  credentials,
  helpSigns,
  availabilityRules,
  blockedSlots,
  appointments,
  agentConfig,
  adminUsers,
  patients,
  clinicalSessions,
  patientMessages,
  appointmentLabels,
} from "@/lib/db/schema";
import { saveMedia, deleteMedia } from "@/lib/storage";
import { getSession, hashPassword } from "@/lib/auth";

type State = { ok?: boolean; message?: string } | null;
const ok = (message = "Salvo com sucesso"): State => ({ ok: true, message });
const fail = (message: string): State => ({ ok: false, message });

async function guard() {
  const s = await getSession();
  if (!s) throw new Error("Não autorizado");
  return s;
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/agendar");
}

function hexToRgb(hex: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
const S = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// ─── Conteúdo geral / hero / SEO ──────────────────────────────
export async function saveGeneral(_p: State, fd: FormData): Promise<State> {
  await guard();
  await db
    .update(siteSettings)
    .set({
      siteName: S(fd, "siteName"),
      tagline: S(fd, "tagline"),
      heroKicker: S(fd, "heroKicker"),
      heroTitle: S(fd, "heroTitle"),
      heroSubtitle: S(fd, "heroSubtitle"),
      footerText: S(fd, "footerText"),
      footerNote: S(fd, "footerNote"),
      metaTitle: S(fd, "metaTitle"),
      metaDescription: S(fd, "metaDescription"),
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, "main"));
  refresh();
  return ok();
}

// ─── Marca (cores) ────────────────────────────────────────────
export async function saveBranding(_p: State, fd: FormData): Promise<State> {
  await guard();
  const brand = hexToRgb(S(fd, "brand"));
  const soft = hexToRgb(S(fd, "brandSoft"));
  const deep = hexToRgb(S(fd, "brandDeep"));
  if (!brand || !soft || !deep) return fail("Cores inválidas");
  await db
    .update(siteSettings)
    .set({ brandRgb: brand, brandSoftRgb: soft, brandDeepRgb: deep, updatedAt: new Date() })
    .where(eq(siteSettings.id, "main"));
  refresh();
  return ok();
}

// ─── Tipografia (fontes) ──────────────────────────────────────
export async function saveFonts(_p: State, fd: FormData): Promise<State> {
  await guard();
  await db
    .update(siteSettings)
    .set({ fontHeading: S(fd, "fontHeading"), fontBody: S(fd, "fontBody"), updatedAt: new Date() })
    .where(eq(siteSettings.id, "main"));
  refresh();
  return ok();
}

// ─── Navegação do topo ────────────────────────────────────────
export async function saveNav(_p: State, fd: FormData): Promise<State> {
  await guard();
  const raw = S(fd, "nav");
  const items = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [label, href] = l.split("::").map((x) => x.trim());
      return { label: label || "", href: href || "#" };
    })
    .filter((i) => i.label);
  await db
    .update(siteSettings)
    .set({ navItems: items, updatedAt: new Date() })
    .where(eq(siteSettings.id, "main"));
  refresh();
  return ok();
}

// ─── Redes sociais + contato ──────────────────────────────────
export async function saveSocialContact(_p: State, fd: FormData): Promise<State> {
  await guard();
  await db
    .update(siteSettings)
    .set({
      instagram: S(fd, "instagram"),
      facebook: S(fd, "facebook"),
      whatsapp: S(fd, "whatsapp").replace(/\D/g, ""),
      phone: S(fd, "phone"),
      email: S(fd, "email"),
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, "main"));
  refresh();
  return ok();
}

// ─── Localização ──────────────────────────────────────────────
export async function saveLocation(_p: State, fd: FormData): Promise<State> {
  await guard();
  await db
    .update(siteSettings)
    .set({ addressLine: S(fd, "addressLine"), mapsEmbed: S(fd, "mapsEmbed"), updatedAt: new Date() })
    .where(eq(siteSettings.id, "main"));
  refresh();
  return ok();
}

// ─── Médica ───────────────────────────────────────────────────
export async function saveDoctor(_p: State, fd: FormData): Promise<State> {
  await guard();
  await db
    .update(doctor)
    .set({
      name: S(fd, "name"),
      crm: S(fd, "crm"),
      rqe: S(fd, "rqe"),
      title: S(fd, "title"),
      bioLong: S(fd, "bioLong"),
      approach: S(fd, "approach"),
      formation: S(fd, "formation"),
      updatedAt: new Date(),
    })
    .where(eq(doctor.id, "main"));
  refresh();
  return ok();
}

// ─── Clínica ──────────────────────────────────────────────────
export async function saveClinic(_p: State, fd: FormData): Promise<State> {
  await guard();
  const amenities = S(fd, "amenities")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  await db
    .update(clinicInfo)
    .set({
      title: S(fd, "title"),
      description: S(fd, "description"),
      hours: S(fd, "hours"),
      amenities,
      updatedAt: new Date(),
    })
    .where(eq(clinicInfo.id, "main"));
  refresh();
  return ok();
}

// ─── Especialidades ───────────────────────────────────────────
export async function createSpecialty(_p: State, fd: FormData): Promise<State> {
  await guard();
  const title = S(fd, "title");
  if (!title) return fail("Informe o título");
  const count = (await db.select().from(specialties)).length;
  await db.insert(specialties).values({
    title,
    description: S(fd, "description"),
    symptoms: S(fd, "symptoms"),
    icon: S(fd, "icon") || "brain",
    order: count,
  });
  refresh();
  return ok("Especialidade adicionada");
}

export async function updateSpecialty(_p: State, fd: FormData): Promise<State> {
  await guard();
  const id = S(fd, "id");
  await db
    .update(specialties)
    .set({
      title: S(fd, "title"),
      description: S(fd, "description"),
      symptoms: S(fd, "symptoms"),
      icon: S(fd, "icon") || "brain",
    })
    .where(eq(specialties.id, id));
  refresh();
  return ok();
}

export async function deleteSpecialty(fd: FormData): Promise<void> {
  await guard();
  await db.delete(specialties).where(eq(specialties.id, S(fd, "id")));
  refresh();
}

// ─── Formação & Trajetória ────────────────────────────────────
export async function createCredential(_p: State, fd: FormData): Promise<State> {
  await guard();
  const title = S(fd, "title");
  const org = S(fd, "org");
  if (!title || !org) return fail("Informe título e instituição");
  const count = (await db.select().from(credentials)).length;
  await db.insert(credentials).values({
    title,
    org,
    period: S(fd, "period"),
    detail: S(fd, "detail"),
    icon: S(fd, "icon") || "award",
    order: count,
  });
  refresh();
  return ok("Item adicionado");
}

export async function updateCredential(_p: State, fd: FormData): Promise<State> {
  await guard();
  await db
    .update(credentials)
    .set({
      title: S(fd, "title"),
      org: S(fd, "org"),
      period: S(fd, "period"),
      detail: S(fd, "detail"),
      icon: S(fd, "icon") || "award",
    })
    .where(eq(credentials.id, S(fd, "id")));
  refresh();
  return ok();
}

export async function deleteCredential(fd: FormData): Promise<void> {
  await guard();
  await db.delete(credentials).where(eq(credentials.id, S(fd, "id")));
  refresh();
}

// ─── Sinais (quando buscar ajuda) ─────────────────────────────
export async function createHelpSign(_p: State, fd: FormData): Promise<State> {
  await guard();
  const label = S(fd, "label");
  if (!label) return fail("Informe o texto");
  const count = (await db.select().from(helpSigns)).length;
  await db.insert(helpSigns).values({ label, order: count });
  refresh();
  return ok("Adicionado");
}

export async function deleteHelpSign(fd: FormData): Promise<void> {
  await guard();
  await db.delete(helpSigns).where(eq(helpSigns.id, S(fd, "id")));
  refresh();
}

// ─── Mídia ────────────────────────────────────────────────────
async function setSettingsMedia(
  field:
    | "logoId"
    | "heroImageId"
    | "ogImageId"
    | "clinicImageId"
    | "approachImageId"
    | "locationImageId"
    | "faviconId",
  file: File
) {
  const id = await saveMedia(file, field);
  const [prev] = await db
    .select({ old: siteSettings[field] })
    .from(siteSettings)
    .where(eq(siteSettings.id, "main"));
  await db.update(siteSettings).set({ [field]: id, updatedAt: new Date() }).where(eq(siteSettings.id, "main"));
  if (prev?.old) await deleteMedia(prev.old).catch(() => {});
}

export async function uploadLogo(_p: State, fd: FormData): Promise<State> {
  await guard();
  const file = fd.get("file") as File;
  if (!file || file.size === 0) return fail("Selecione um arquivo");
  try {
    await setSettingsMedia("logoId", file);
  } catch (e) {
    return fail((e as Error).message);
  }
  refresh();
  return ok("Logo atualizada");
}

export async function uploadFavicon(_p: State, fd: FormData): Promise<State> {
  await guard();
  const file = fd.get("file") as File;
  if (!file || file.size === 0) return fail("Selecione um arquivo");
  try {
    await setSettingsMedia("faviconId", file);
  } catch (e) {
    return fail((e as Error).message);
  }
  refresh();
  return ok("Favicon atualizado");
}

export async function uploadHero(_p: State, fd: FormData): Promise<State> {
  await guard();
  const file = fd.get("file") as File;
  if (!file || file.size === 0) return fail("Selecione um arquivo");
  try {
    await setSettingsMedia("heroImageId", file);
  } catch (e) {
    return fail((e as Error).message);
  }
  refresh();
  return ok("Imagem atualizada");
}

async function uploadSettingsImage(
  field: "clinicImageId" | "approachImageId" | "locationImageId",
  fd: FormData
): Promise<State> {
  await guard();
  const file = fd.get("file") as File;
  if (!file || file.size === 0) return fail("Selecione um arquivo");
  try {
    await setSettingsMedia(field, file);
  } catch (e) {
    return fail((e as Error).message);
  }
  refresh();
  return ok("Imagem atualizada");
}

export async function uploadClinicImage(_p: State, fd: FormData) {
  return uploadSettingsImage("clinicImageId", fd);
}
export async function uploadApproachImage(_p: State, fd: FormData) {
  return uploadSettingsImage("approachImageId", fd);
}
export async function uploadLocationImage(_p: State, fd: FormData) {
  return uploadSettingsImage("locationImageId", fd);
}

export async function uploadDoctorPhoto(_p: State, fd: FormData): Promise<State> {
  await guard();
  const file = fd.get("file") as File;
  if (!file || file.size === 0) return fail("Selecione um arquivo");
  try {
    const id = await saveMedia(file, "Foto da médica");
    const [prev] = await db.select({ old: doctor.photoId }).from(doctor).where(eq(doctor.id, "main"));
    await db.update(doctor).set({ photoId: id, updatedAt: new Date() }).where(eq(doctor.id, "main"));
    if (prev?.old) await deleteMedia(prev.old).catch(() => {});
  } catch (e) {
    return fail((e as Error).message);
  }
  refresh();
  return ok("Foto atualizada");
}

export async function addClinicPhoto(_p: State, fd: FormData): Promise<State> {
  await guard();
  const file = fd.get("file") as File;
  if (!file || file.size === 0) return fail("Selecione um arquivo");
  try {
    const mediaId = await saveMedia(file, "Foto da clínica");
    const count = (await db.select().from(clinicPhotos)).length;
    await db.insert(clinicPhotos).values({ mediaId, caption: S(fd, "caption"), order: count });
  } catch (e) {
    return fail((e as Error).message);
  }
  refresh();
  return ok("Foto adicionada");
}

export async function deleteClinicPhoto(fd: FormData): Promise<void> {
  await guard();
  const id = S(fd, "id");
  const [row] = await db.select().from(clinicPhotos).where(eq(clinicPhotos.id, id));
  await db.delete(clinicPhotos).where(eq(clinicPhotos.id, id));
  if (row?.mediaId) await deleteMedia(row.mediaId).catch(() => {});
  refresh();
}

// ─── Disponibilidade ──────────────────────────────────────────
export async function createRule(_p: State, fd: FormData): Promise<State> {
  await guard();
  const weekday = Number(fd.get("weekday"));
  const startTime = S(fd, "startTime");
  const endTime = S(fd, "endTime");
  const slotMin = Number(fd.get("slotMin")) || 50;
  if (isNaN(weekday) || !startTime || !endTime) return fail("Preencha os campos");
  if (startTime >= endTime) return fail("Horário final deve ser após o inicial");
  await db.insert(availabilityRules).values({ weekday, startTime, endTime, slotMin, active: true });
  refresh();
  return ok("Regra adicionada");
}

export async function deleteRule(fd: FormData): Promise<void> {
  await guard();
  await db.delete(availabilityRules).where(eq(availabilityRules.id, S(fd, "id")));
  refresh();
}

export async function toggleRule(fd: FormData): Promise<void> {
  await guard();
  const id = S(fd, "id");
  const [r] = await db.select().from(availabilityRules).where(eq(availabilityRules.id, id));
  if (r) await db.update(availabilityRules).set({ active: !r.active }).where(eq(availabilityRules.id, id));
  refresh();
}

// datetime-local não tem fuso: interpretamos como horário do Brasil (-03:00)
function parseClinicLocal(v: string): Date {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return new Date(`${v}:00-03:00`);
  return new Date(v);
}

export async function createBlock(_p: State, fd: FormData): Promise<State> {
  await guard();
  const start = parseClinicLocal(S(fd, "start"));
  const end = parseClinicLocal(S(fd, "end"));
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return fail("Datas inválidas");
  if (start >= end) return fail("Fim deve ser após o início");
  await db.insert(blockedSlots).values({ start, end, reason: S(fd, "reason") });
  refresh();
  return ok("Bloqueio adicionado");
}

export async function deleteBlock(fd: FormData): Promise<void> {
  await guard();
  await db.delete(blockedSlots).where(eq(blockedSlots.id, S(fd, "id")));
  refresh();
}

// ─── Consultas ────────────────────────────────────────────────
export async function setAppointmentStatus(fd: FormData): Promise<void> {
  await guard();
  const id = S(fd, "id");
  const status = S(fd, "status") as "PENDENTE" | "CONFIRMADO" | "CANCELADO" | "CONCLUIDO";
  await db.update(appointments).set({ status }).where(eq(appointments.id, id));
  revalidatePath("/admin/consultas");
  refresh();
}

export async function deleteAppointment(fd: FormData): Promise<void> {
  await guard();
  await db.delete(appointments).where(eq(appointments.id, S(fd, "id")));
  revalidatePath("/admin/consultas");
  refresh();
}

// ─── Agente ───────────────────────────────────────────────────
export async function saveAgent(_p: State, fd: FormData): Promise<State> {
  await guard();
  const faq = S(fd, "faq")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [q, a, kw] = l.split("::").map((x) => (x || "").trim());
      return { q: q || "", a: a || "", keywords: (kw || "").split(",").map((k) => k.trim()).filter(Boolean) };
    })
    .filter((i) => i.q && i.a);
  await db
    .update(agentConfig)
    .set({
      enabled: fd.get("enabled") === "on",
      channelSite: fd.get("channelSite") === "on",
      channelWhats: fd.get("channelWhats") === "on",
      greeting: S(fd, "greeting"),
      fallback: S(fd, "fallback"),
      faq,
      updatedAt: new Date(),
    })
    .where(eq(agentConfig.id, "main"));
  refresh();
  return ok();
}

// ─── Conta ────────────────────────────────────────────────────
export async function changePassword(_p: State, fd: FormData): Promise<State> {
  const me = await guard();
  const pass = S(fd, "password");
  const confirm = S(fd, "confirm");
  if (pass.length < 6) return fail("A senha deve ter ao menos 6 caracteres");
  if (pass !== confirm) return fail("As senhas não coincidem");
  const hash = await hashPassword(pass);
  await db.update(adminUsers).set({ password: hash }).where(eq(adminUsers.id, me.id));
  return ok("Senha atualizada");
}

export async function createAdmin(_p: State, fd: FormData): Promise<State> {
  await guard();
  const email = S(fd, "email").toLowerCase();
  const name = S(fd, "name");
  const pass = S(fd, "password");
  if (!email || pass.length < 6) return fail("E-mail válido e senha (6+) obrigatórios");
  const exists = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
  if (exists.length) return fail("Já existe um admin com esse e-mail");
  await db.insert(adminUsers).values({ email, name, password: await hashPassword(pass) });
  revalidatePath("/admin/conta");
  return ok("Administrador criado");
}

export async function deleteAdmin(fd: FormData): Promise<void> {
  const me = await guard();
  const id = S(fd, "id");
  if (id === me.id) return; // não deleta a si mesmo
  const all = await db.select().from(adminUsers);
  if (all.length <= 1) return; // mantém ao menos um
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  revalidatePath("/admin/conta");
}

// ─── Pacientes ────────────────────────────────────────────────
function refreshPatient(id: string) {
  revalidatePath("/admin/pacientes");
  revalidatePath(`/admin/pacientes/${id}`);
}

export async function createPatient(_p: State, fd: FormData): Promise<State> {
  await guard();
  const email = S(fd, "email").toLowerCase();
  const name = S(fd, "name");
  if (!name || !email) return fail("Informe nome e e-mail");
  const exists = await db.select().from(patients).where(eq(patients.email, email));
  if (exists.length) return fail("Já existe um paciente com esse e-mail");
  const pass = S(fd, "password");
  const values = {
    name,
    email,
    phone: S(fd, "phone"),
    birthDate: S(fd, "birthDate"),
    cpf: S(fd, "cpf"),
    address: S(fd, "address"),
    notes: S(fd, "notes"),
    password: pass.length >= 6 ? await hashPassword(pass) : null,
  };
  const [row] = await db.insert(patients).values(values).returning({ id: patients.id });
  // vincula agendamentos existentes com o mesmo e-mail
  await db.update(appointments).set({ patientId: row.id }).where(eq(appointments.email, email));
  revalidatePath("/admin/pacientes");
  return ok("Paciente criado");
}

export async function updatePatient(_p: State, fd: FormData): Promise<State> {
  await guard();
  const id = S(fd, "id");
  await db
    .update(patients)
    .set({
      name: S(fd, "name"),
      phone: S(fd, "phone"),
      birthDate: S(fd, "birthDate"),
      cpf: S(fd, "cpf"),
      address: S(fd, "address"),
      updatedAt: new Date(),
    })
    .where(eq(patients.id, id));
  refreshPatient(id);
  return ok();
}

export async function updatePatientCase(_p: State, fd: FormData): Promise<State> {
  await guard();
  const id = S(fd, "id");
  await db
    .update(patients)
    .set({ summary: S(fd, "summary"), notes: S(fd, "notes"), updatedAt: new Date() })
    .where(eq(patients.id, id));
  refreshPatient(id);
  return ok("Resumo atualizado");
}

export async function setPatientPassword(_p: State, fd: FormData): Promise<State> {
  await guard();
  const id = S(fd, "id");
  const pass = S(fd, "password");
  if (pass.length < 6) return fail("A senha deve ter ao menos 6 caracteres");
  await db
    .update(patients)
    .set({ password: await hashPassword(pass), active: true, updatedAt: new Date() })
    .where(eq(patients.id, id));
  refreshPatient(id);
  return ok("Acesso do paciente definido");
}

export async function deletePatient(fd: FormData): Promise<void> {
  await guard();
  const id = S(fd, "id");
  // desvincula agendamentos (mantém o histórico de consultas) e remove o cadastro
  await db.update(appointments).set({ patientId: null }).where(eq(appointments.patientId, id));
  await db.delete(patients).where(eq(patients.id, id));
  revalidatePath("/admin/pacientes");
}

export async function linkAppointment(fd: FormData): Promise<void> {
  await guard();
  const apptId = S(fd, "appointmentId");
  const patientId = S(fd, "patientId") || null;
  await db.update(appointments).set({ patientId }).where(eq(appointments.id, apptId));
  revalidatePath("/admin/consultas");
  if (patientId) refreshPatient(patientId);
}

// ─── Sessões clínicas (prontuário) ────────────────────────────
export async function createSession(_p: State, fd: FormData): Promise<State> {
  await guard();
  const patientId = S(fd, "patientId");
  const content = S(fd, "content");
  if (!patientId) return fail("Selecione um paciente");
  if (!content) return fail("Escreva o conteúdo da sessão");
  const dateStr = S(fd, "date");
  const date = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(dateStr)
    ? new Date(`${dateStr.length === 10 ? dateStr + "T12:00" : dateStr}:00-03:00`)
    : new Date();
  await db.insert(clinicalSessions).values({
    patientId,
    date,
    title: S(fd, "title"),
    content,
  });
  refreshPatient(patientId);
  revalidatePath("/admin/sessoes");
  return ok("Sessão registrada");
}

export async function updateSession(_p: State, fd: FormData): Promise<State> {
  await guard();
  const id = S(fd, "id");
  const patientId = S(fd, "patientId");
  const dateStr = S(fd, "date");
  const date = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(dateStr)
    ? new Date(`${dateStr.length === 10 ? dateStr + "T12:00" : dateStr}:00-03:00`)
    : undefined;
  await db
    .update(clinicalSessions)
    .set({
      title: S(fd, "title"),
      content: S(fd, "content"),
      ...(date ? { date } : {}),
      updatedAt: new Date(),
    })
    .where(eq(clinicalSessions.id, id));
  refreshPatient(patientId);
  revalidatePath("/admin/sessoes");
  return ok();
}

export async function deleteSession(fd: FormData): Promise<void> {
  await guard();
  const id = S(fd, "id");
  const patientId = S(fd, "patientId");
  await db.delete(clinicalSessions).where(eq(clinicalSessions.id, id));
  if (patientId) refreshPatient(patientId);
  revalidatePath("/admin/sessoes");
}

// ─── Mensagens (médico → paciente) ────────────────────────────
export async function sendDoctorMessage(_p: State, fd: FormData): Promise<State> {
  await guard();
  const patientId = S(fd, "patientId");
  const body = S(fd, "body");
  if (!patientId || !body) return fail("Mensagem vazia");
  await db.insert(patientMessages).values({
    patientId,
    sender: "doctor",
    body,
    readByDoctor: true,
    readByPatient: false,
  });
  // marca como lidas as mensagens do paciente ao responder
  await db
    .update(patientMessages)
    .set({ readByDoctor: true })
    .where(and(eq(patientMessages.patientId, patientId), eq(patientMessages.sender, "patient")));
  refreshPatient(patientId);
  return ok("Mensagem enviada");
}

// ─── Agenda: etiquetas coloridas ──────────────────────────────
function refreshAgenda() {
  revalidatePath("/admin/consultas");
  revalidatePath("/");
  revalidatePath("/agendar");
}

export async function createLabel(_p: State, fd: FormData): Promise<State> {
  await guard();
  const name = S(fd, "name");
  if (!name) return fail("Informe o nome da etiqueta");
  const color = /^#[0-9a-f]{6}$/i.test(S(fd, "color")) ? S(fd, "color") : "#A9814E";
  const n = (await db.select().from(appointmentLabels)).length;
  await db.insert(appointmentLabels).values({ name, color, order: n });
  refreshAgenda();
  return ok("Etiqueta criada");
}

export async function updateLabel(_p: State, fd: FormData): Promise<State> {
  await guard();
  const id = S(fd, "id");
  const color = /^#[0-9a-f]{6}$/i.test(S(fd, "color")) ? S(fd, "color") : "#A9814E";
  await db.update(appointmentLabels).set({ name: S(fd, "name"), color }).where(eq(appointmentLabels.id, id));
  refreshAgenda();
  return ok();
}

export async function deleteLabel(fd: FormData): Promise<void> {
  await guard();
  const id = S(fd, "id");
  await db.update(appointments).set({ labelId: null }).where(eq(appointments.labelId, id));
  await db.delete(appointmentLabels).where(eq(appointmentLabels.id, id));
  refreshAgenda();
}

// ─── Agenda: marcação manual (evento criado pelo médico) ──────
export async function createManualAppointment(_p: State, fd: FormData): Promise<State> {
  await guard();
  const dateStr = S(fd, "date");
  const time = S(fd, "time");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{2}:\d{2}$/.test(time)) {
    return fail("Informe data e horário válidos");
  }
  const title = S(fd, "title");
  if (!title) return fail("Informe um título para a marcação");
  const durationMin = Math.max(10, Number(fd.get("durationMin")) || 50);
  const start = new Date(`${dateStr}T${time}:00-03:00`);
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  const patientId = S(fd, "patientId") || null;
  const labelId = S(fd, "labelId") || null;
  await db.insert(appointments).values({
    patientId,
    labelId,
    kind: "marcacao",
    title,
    name: title,
    phone: S(fd, "phone"),
    email: "",
    start,
    end,
    mode: S(fd, "mode") || "presencial",
    notes: S(fd, "notes"),
    channel: "SITE",
    status: "CONFIRMADO",
  });
  refreshAgenda();
  return ok("Marcação adicionada");
}

export async function updateAppointmentMeta(_p: State, fd: FormData): Promise<State> {
  await guard();
  const id = S(fd, "id");
  const status = S(fd, "status") as "PENDENTE" | "CONFIRMADO" | "CANCELADO" | "CONCLUIDO";
  const labelId = S(fd, "labelId") || null;
  await db.update(appointments).set({ status, labelId }).where(eq(appointments.id, id));
  refreshAgenda();
  return ok("Atualizado");
}
