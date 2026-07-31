import "server-only";
import { db } from "./db";
import { agentMessages } from "./db/schema";
import { getAgentConfig } from "./queries";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Motor de FAQ por palavras-chave. Retorna a melhor resposta ou null. */
export function matchFaq(
  text: string,
  faq: { q: string; a: string; keywords: string[] }[]
): string | null {
  const t = normalize(text);
  let best: { score: number; a: string } | null = null;
  for (const item of faq) {
    let score = 0;
    for (const kw of item.keywords || []) {
      if (t.includes(normalize(kw))) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { score, a: item.a };
  }
  return best?.a ?? null;
}

/**
 * Gera a resposta do agente. Ponto único de extensão para IA (fase 2):
 * se aiEnabled, aqui entraria a chamada ao modelo. Por ora usa FAQ + fallback.
 */
export async function generateReply(
  text: string,
  channel: "site" | "whatsapp",
  from = ""
): Promise<{ reply: string; matched: boolean }> {
  const cfg = await getAgentConfig();
  if (!cfg || !cfg.enabled) {
    return { reply: "", matched: false };
  }

  const faq = (cfg.faq as { q: string; a: string; keywords: string[] }[]) || [];
  const answer = matchFaq(text, faq);
  const reply = answer ?? cfg.fallback;

  // registra a interação (não bloqueante em caso de erro)
  try {
    await db.insert(agentMessages).values({ channel, from, text, reply });
  } catch (e) {
    console.warn("[agent] falha ao registrar mensagem:", (e as Error).message);
  }

  return { reply, matched: !!answer };
}

export async function greeting(): Promise<string> {
  const cfg = await getAgentConfig();
  return cfg?.greeting || "Olá! Como posso ajudar?";
}

/** Sugestões rápidas mostradas no widget */
export async function quickReplies(): Promise<string[]> {
  const cfg = await getAgentConfig();
  const faq = (cfg?.faq as { q: string }[]) || [];
  return faq.slice(0, 4).map((f) => f.q);
}
