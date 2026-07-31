// Opções de fonte disponíveis no painel (Aparência → Tipografia).

export const HEADING_FONTS: Record<string, { label: string; stack: string }> = {
  fraunces: { label: "Fraunces — elegante (padrão)", stack: '"Fraunces Variable", Georgia, serif' },
  playfair: { label: "Playfair Display — clássica", stack: '"Playfair Display Variable", Georgia, serif' },
  cormorant: { label: "Cormorant — fina e sofisticada", stack: '"Cormorant Variable", Georgia, serif' },
  lora: { label: "Lora — serifada suave", stack: '"Lora Variable", Georgia, serif' },
  manrope: { label: "Manrope — sem serifa, moderna", stack: '"Manrope Variable", system-ui, sans-serif' },
  worksans: { label: "Work Sans — sem serifa, limpa", stack: '"Work Sans Variable", system-ui, sans-serif' },
};

export const BODY_FONTS: Record<string, { label: string; stack: string }> = {
  inter: { label: "Inter — moderna (padrão)", stack: '"Inter Variable", system-ui, sans-serif' },
  manrope: { label: "Manrope — geométrica", stack: '"Manrope Variable", system-ui, sans-serif' },
  worksans: { label: "Work Sans — limpa", stack: '"Work Sans Variable", system-ui, sans-serif' },
  dmsans: { label: "DM Sans — amigável", stack: '"DM Sans Variable", system-ui, sans-serif' },
  lora: { label: "Lora — serifada (leitura)", stack: '"Lora Variable", Georgia, serif' },
};

export function headingStack(key?: string | null): string {
  return (HEADING_FONTS[key || "fraunces"] || HEADING_FONTS.fraunces).stack;
}
export function bodyStack(key?: string | null): string {
  return (BODY_FONTS[key || "inter"] || BODY_FONTS.inter).stack;
}
