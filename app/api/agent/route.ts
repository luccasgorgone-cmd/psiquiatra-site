import { NextRequest, NextResponse } from "next/server";
import { generateReply } from "@/lib/agent";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ reply: "Como posso ajudar?" });
    }
    const { reply } = await generateReply(text.slice(0, 500), "site");
    return NextResponse.json({ reply: reply || "Como posso ajudar?" });
  } catch {
    return NextResponse.json({ reply: "Tive um problema para responder agora." }, { status: 200 });
  }
}
