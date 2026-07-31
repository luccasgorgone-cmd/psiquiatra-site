import "server-only";
import { cache } from "react";
import { db } from "./db";
import {
  siteSettings,
  doctor,
  clinicInfo,
  clinicPhotos,
  specialties,
  helpSigns,
  agentConfig,
  availabilityRules,
} from "./db/schema";
import { asc, eq } from "drizzle-orm";

export const mediaUrl = (id?: string | null) =>
  id ? `/api/media/${id}` : null;

export const getSettings = cache(async () => {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, "main")).limit(1);
  return row ?? null;
});

export const getDoctor = cache(async () => {
  const [row] = await db.select().from(doctor).where(eq(doctor.id, "main")).limit(1);
  return row ?? null;
});

export const getClinic = cache(async () => {
  const [info] = await db.select().from(clinicInfo).where(eq(clinicInfo.id, "main")).limit(1);
  const photos = await db
    .select()
    .from(clinicPhotos)
    .orderBy(asc(clinicPhotos.order));
  return { info: info ?? null, photos };
});

export const getSpecialties = cache(async () => {
  return db
    .select()
    .from(specialties)
    .where(eq(specialties.active, true))
    .orderBy(asc(specialties.order));
});

export const getHelpSigns = cache(async () => {
  return db
    .select()
    .from(helpSigns)
    .where(eq(helpSigns.active, true))
    .orderBy(asc(helpSigns.order));
});

export const getAgentConfig = cache(async () => {
  const [row] = await db.select().from(agentConfig).where(eq(agentConfig.id, "main")).limit(1);
  return row ?? null;
});

export const getAvailabilityRules = cache(async () => {
  return db
    .select()
    .from(availabilityRules)
    .where(eq(availabilityRules.active, true))
    .orderBy(asc(availabilityRules.weekday));
});
