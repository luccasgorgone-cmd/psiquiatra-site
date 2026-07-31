import "server-only";
import { db } from "./db";
import { siteSettings } from "./db/schema";
import { eq } from "drizzle-orm";

/**
 * Integração com a Evolution API (WhatsApp).
 * Config vem do painel (site_settings/env). Degrada de forma graciosa:
 * se não houver credenciais, apenas loga e retorna {ok:false, skipped:true}.
 */

type EvolutionConfig = {
  apiUrl: string;
  apiKey: string;
  instance: string;
};

export async function getEvolutionConfig(): Promise<EvolutionConfig | null> {
  const apiUrl = process.env.EVOLUTION_API_URL || "";
  const apiKey = process.env.EVOLUTION_API_KEY || "";
  const instance = process.env.EVOLUTION_INSTANCE || "";
  if (!apiUrl || !apiKey || !instance) return null;
  return { apiUrl: apiUrl.replace(/\/$/, ""), apiKey, instance };
}

export async function getWhatsappNumber(): Promise<string> {
  const [row] = await db
    .select({ whatsapp: siteSettings.whatsapp })
    .from(siteSettings)
    .where(eq(siteSettings.id, "main"))
    .limit(1);
  return row?.whatsapp || process.env.EVOLUTION_DEFAULT_TO || "";
}

/** Envia mensagem de texto via Evolution API */
export async function sendWhatsappText(
  to: string,
  text: string
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const cfg = await getEvolutionConfig();
  const number = (to || "").replace(/\D/g, "");
  if (!cfg) {
    console.warn("[evolution] credenciais ausentes — envio ignorado:", { to: number });
    return { ok: false, skipped: true };
  }
  if (!number) return { ok: false, error: "número inválido" };

  try {
    const res = await fetch(`${cfg.apiUrl}/message/sendText/${cfg.instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.apiKey,
      },
      body: JSON.stringify({ number, text }),
      // não bloquear a resposta ao usuário por muito tempo
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status} ${body}`.slice(0, 300) };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
