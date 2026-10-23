/**
 * Decide se a conexão Postgres deve usar SSL.
 * - Local (localhost/127.0.0.1) → sem SSL
 * - Railway rede interna (*.railway.internal) → sem SSL
 * - Qualquer outro host (proxy público / provedores externos) → SSL COM
 *   validação de certificado (rejectUnauthorized: true).
 * Também respeita sslmode=disable explícito na própria URL.
 *
 * Validação do certificado (fail-closed em produção):
 *  - Defina DATABASE_CA_CERT com o PEM da CA do endpoint (valor fornecido pelo
 *    dono da infra). Com ele, usamos rejectUnauthorized:true + ca.
 *  - Sem DATABASE_CA_CERT: em produção lançamos erro (não aceitamos certificado
 *    não verificado); fora de produção caímos para conexão de desenvolvimento
 *    sem validação, para não travar o fluxo local.
 */
export function sslFor(
  url?: string
): false | { rejectUnauthorized: boolean; ca?: string } {
  if (!url) return false;
  if (/sslmode=disable/i.test(url)) return false;
  if (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes(".railway.internal")
  ) {
    return false;
  }

  // Host remoto/público: TLS obrigatório.
  const ca = process.env.DATABASE_CA_CERT?.trim();
  if (ca) {
    return { rejectUnauthorized: true, ca };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "TLS do Postgres: certificado não validável. Defina DATABASE_CA_CERT " +
        "(PEM da CA do endpoint) ou use o host interno *.railway.internal. " +
        "Conexão sem validação de certificado é recusada em produção."
    );
  }

  // Desenvolvimento: permite TLS sem validação apenas fora de produção.
  return { rejectUnauthorized: false };
}
