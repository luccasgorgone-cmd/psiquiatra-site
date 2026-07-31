import { NextRequest } from "next/server";
import { getMedia } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const asset = await getMedia(id);
  if (!asset) {
    return new Response("Não encontrado", { status: 404 });
  }
  const bytes = Buffer.from(asset.data, "base64");
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": asset.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(bytes.length),
    },
  });
}
