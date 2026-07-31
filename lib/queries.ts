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
  credentials,
} from "./db/schema";
import { asc, eq } from "drizzle-orm";

export const mediaUrl = (id?: string | null) =>
  id ? `/api/media/${id}` : null;

// Nunca deixa o banco quebrar o build/render — em caso de erro, usa o fallback.
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("[queries] erro de banco:", (e as Error).message);
    return fallback;
  }
}

export const getSettings = cache(async () =>
  safe(async () => {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, "main")).limit(1);
    return row ?? null;
  }, null)
);

export const getDoctor = cache(async () =>
  safe(async () => {
    const [row] = await db.select().from(doctor).where(eq(doctor.id, "main")).limit(1);
    return row ?? null;
  }, null)
);

export const getClinic = cache(async () =>
  safe(
    async () => {
      const [info] = await db.select().from(clinicInfo).where(eq(clinicInfo.id, "main")).limit(1);
      const photos = await db.select().from(clinicPhotos).orderBy(asc(clinicPhotos.order));
      return { info: info ?? null, photos };
    },
    {
      info: null as typeof clinicInfo.$inferSelect | null,
      photos: [] as (typeof clinicPhotos.$inferSelect)[],
    }
  )
);

export const getSpecialties = cache(async () =>
  safe(
    async () =>
      db.select().from(specialties).where(eq(specialties.active, true)).orderBy(asc(specialties.order)),
    [] as (typeof specialties.$inferSelect)[]
  )
);

export const getCredentials = cache(async () =>
  safe(
    async () =>
      db.select().from(credentials).where(eq(credentials.active, true)).orderBy(asc(credentials.order)),
    [] as (typeof credentials.$inferSelect)[]
  )
);

export const getHelpSigns = cache(async () =>
  safe(
    async () =>
      db.select().from(helpSigns).where(eq(helpSigns.active, true)).orderBy(asc(helpSigns.order)),
    [] as (typeof helpSigns.$inferSelect)[]
  )
);

export const getAgentConfig = cache(async () =>
  safe(async () => {
    const [row] = await db.select().from(agentConfig).where(eq(agentConfig.id, "main")).limit(1);
    return row ?? null;
  }, null)
);

export const getAvailabilityRules = cache(async () =>
  safe(
    async () =>
      db.select().from(availabilityRules).where(eq(availabilityRules.active, true)).orderBy(asc(availabilityRules.weekday)),
    [] as (typeof availabilityRules.$inferSelect)[]
  )
);
