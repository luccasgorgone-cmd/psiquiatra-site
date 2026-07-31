import { NextRequest, NextResponse } from "next/server";
import { generateReply } from "@/lib/agent";
import { getAgentConfig } from "@/lib/queries";
import { sendWhatsappText } from "@/lib/evolution";

export const runtime = "nodejs";

/**
 * Webhook da Evolution API. A instância deve enviar o header
 * `x-webhook-token` igual a EVOLUTION_WEBHOOK_TOKEN.
 * Extrai a mensagem recebida, gera resposta pelo agente e responde no WhatsApp.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.EVOLUTION_WEBHOOK_TOKEN || "";
  const token = req.headers.get("x-webhook-token") || "";
  if (expected && token !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Ignora mensagens enviadas por nós mesmos
  const data = payload?.data ?? payload;
  const key = data?.key ?? {};
  if (key?.fromMe) return NextResponse.json({ ok: true, skipped: "fromMe" });

  const remoteJid: string = key?.remoteJid || data?.from || "";
  const text: string =
    data?.message?.conversation ||
    data?.message?.extendedTextMessage?.text ||
    data?.body ||
    "";

  if (!remoteJid || !text) {
    return NextResponse.json({ ok: true, skipped: "no-text" });
  }

  const cfg = await getAgentConfig();
  if (!cfg?.enabled || !cfg?.channelWhats) {
    return NextResponse.json({ ok: true, skipped: "agent-off" });
  }

  const number = remoteJid.replace(/@.*$/, "");
  const { reply } = await generateReply(text.slice(0, 800), "whatsapp", number);
  if (reply) {
    await sendWhatsappText(number, reply);
  }

  return NextResponse.json({ ok: true });
}

// Alguns provedores validam o webhook com um GET
export async function GET() {
  return NextResponse.json({ ok: true, service: "whatsapp-webhook" });
}
