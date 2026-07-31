/**
 * Decide se a conexão Postgres deve usar SSL.
 * - Local (localhost/127.0.0.1) → sem SSL
 * - Railway rede interna (*.railway.internal) → sem SSL
 * - Qualquer outro host (proxy público / provedores externos) → SSL
 * Também respeita sslmode=disable/require explícito na própria URL.
 */
export function sslFor(url?: string): false | { rejectUnauthorized: boolean } {
  if (!url) return false;
  if (/sslmode=disable/i.test(url)) return false;
  if (/sslmode=require/i.test(url)) return { rejectUnauthorized: false };
  if (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes(".railway.internal")
  ) {
    return false;
  }
  return { rejectUnauthorized: false };
}
