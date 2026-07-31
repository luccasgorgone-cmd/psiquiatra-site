import { Fragment, type ReactNode } from "react";

/**
 * Renderiza texto editável com formatação simples e segura (sem HTML cru):
 *  - Linha em branco  → novo parágrafo
 *  - Quebra de linha   → nova linha
 *  - **texto**         → negrito
 *  - *texto* ou _texto_ → itálico
 * Só o admin edita esse conteúdo; a saída são elementos React (sem risco de XSS).
 */
function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] != null) nodes.push(<strong key={key++} className="font-semibold text-ink">{m[2]}</strong>);
    else if (m[3] != null) nodes.push(<em key={key++}>{m[3]}</em>);
    else if (m[4] != null) nodes.push(<em key={key++}>{m[4]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function RichText({
  text,
  className = "",
  paragraphClassName = "",
}: {
  text: string;
  className?: string;
  paragraphClassName?: string;
}) {
  if (!text) return null;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim() !== "");

  return (
    <div className={className}>
      {paragraphs.map((para, i) => {
        const lines = para.split("\n");
        return (
          <p key={i} className={`${i > 0 ? "mt-4" : ""} ${paragraphClassName}`}>
            {lines.map((line, j) => (
              <Fragment key={j}>
                {parseInline(line)}
                {j < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
