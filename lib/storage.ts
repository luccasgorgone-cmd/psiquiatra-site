import "server-only";
import sharp from "sharp";
import { db } from "./db";
import { mediaAssets } from "./db/schema";
import { eq } from "drizzle-orm";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB (comprimimos depois)
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];
const MAX_DIM = 1600; // maior lado após otimização

/**
 * Salva uma imagem no Postgres (base64) e retorna o id.
 * Otimização automática: PNG/JPEG/WEBP são redimensionados (máx 1600px) e
 * convertidos para WebP de alta qualidade — mantém o banco leve e o site rápido.
 * SVG e GIF (possível animação) são guardados como estão.
 */
export async function saveMedia(file: File, alt = ""): Promise<string> {
  if (!file || file.size === 0) throw new Error("Arquivo vazio");
  if (file.size > MAX_BYTES) throw new Error("Imagem acima de 15MB");
  if (!ALLOWED.includes(file.type)) throw new Error("Formato não suportado");

  const input = Buffer.from(await file.arrayBuffer());
  let mime = file.type;
  let out = input;

  const rasterizable = ["image/png", "image/jpeg", "image/webp"].includes(file.type);
  if (rasterizable) {
    try {
      out = await sharp(input)
        .rotate() // respeita orientação EXIF (fotos de celular)
        .resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      mime = "image/webp";
    } catch (e) {
      console.warn("[storage] otimização falhou, salvando original:", (e as Error).message);
      out = input;
      mime = file.type;
    }
  }

  const [row] = await db
    .insert(mediaAssets)
    .values({ mime, data: out.toString("base64"), alt })
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
