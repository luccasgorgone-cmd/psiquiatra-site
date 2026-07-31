"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
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
async function setSettingsMedia(field: "logoId" | "heroImageId" | "ogImageId", file: File) {
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
