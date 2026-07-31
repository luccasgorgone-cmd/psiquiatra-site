import "server-only";
import { db } from "./db";
import { mediaAssets } from "./db/schema";
import { eq } from "drizzle-orm";

const MAX_BYTES = 6 * 1024 * 1024; // 6MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

/**
 * Salva um arquivo de imagem no Postgres (base64) e retorna o id.
 * Abstração de storage — trocável por S3/Cloudinary depois sem mudar chamadas.
 */
export async function saveMedia(file: File, alt = ""): Promise<string> {
  if (!file || file.size === 0) throw new Error("Arquivo vazio");
  if (file.size > MAX_BYTES) throw new Error("Imagem acima de 6MB");
  if (!ALLOWED.includes(file.type)) throw new Error("Formato não suportado");

  const buf = Buffer.from(await file.arrayBuffer());
  const data = buf.toString("base64");
  const [row] = await db
    .insert(mediaAssets)
    .values({ mime: file.type, data, alt })
    .returning({ id: mediaAssets.id });
  return row.id;
}

export async function getMedia(id: string) {
  const [row] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  return row ?? null;
}

export async function deleteMedia(id: string) {
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
}
