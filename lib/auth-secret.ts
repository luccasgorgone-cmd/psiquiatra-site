/**
 * Segredo de assinatura dos JWTs (admin e paciente).
 *
 * Fail-closed: sem AUTH_SECRET forte definido no ambiente, a aplicação NÃO sobe.
 * Não há fallback hardcoded — um deploy mal configurado precisa falhar em vez de
 * assinar tokens com um segredo publicamente conhecido.
 *
 * Compartilhado por lib/auth.ts, lib/patient-auth.ts e middleware.ts (edge),
 * por isso não importa "server-only" nem APIs de Node.
 */
function requireAuthSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET ausente ou muito curto (mínimo 32 caracteres). " +
        "Defina AUTH_SECRET no ambiente (ex.: openssl rand -base64 32)."
    );
  }
  return new TextEncoder().encode(s);
}

export const authSecret = requireAuthSecret();

/** Audiências distintas: tokens de admin e de paciente não são intercambiáveis. */
export const ADMIN_AUDIENCE = "psi-admin";
export const PATIENT_AUDIENCE = "psi-patient";
