import { getAgentConfig } from "@/lib/queries";
import { PageHeader, Card, Field } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import { saveAgent } from "../actions";

export const dynamic = "force-dynamic";

function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-ink/[0.08] bg-white p-4">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 accent-[rgb(var(--brand))]" />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export default async function AgentePage() {
  const cfg = await getAgentConfig();
  const faq = (cfg?.faq as { q: string; a: string; keywords: string[] }[]) || [];
  const faqText = faq.map((f) => `${f.q} :: ${f.a} :: ${(f.keywords || []).join(", ")}`).join("\n");

  return (
    <div>
      <PageHeader title="Agente virtual" subtitle="Assistente do site e do WhatsApp (Evolution API)" />

      <Card title="Configuração">
        <ActionForm action={saveAgent}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle name="enabled" label="Ativar agente" defaultChecked={cfg?.enabled} />
            <Toggle name="channelSite" label="Mostrar no site" defaultChecked={cfg?.channelSite} hint="Widget de chat na página" />
            <Toggle name="channelWhats" label="Responder no WhatsApp" defaultChecked={cfg?.channelWhats} hint="Via webhook da Evolution" />
          </div>

          <Field label="Mensagem de saudação">
            <input name="greeting" defaultValue={cfg?.greeting} className="fld" />
          </Field>

          <Field label="Mensagem de fallback" hint="Enviada quando o agente não encontra resposta">
            <textarea name="fallback" defaultValue={cfg?.fallback} className="fld min-h-[70px]" />
          </Field>

          <Field
            label="Base de conhecimento (FAQ)"
            hint="Uma por linha, no formato:  Pergunta :: Resposta :: palavra1, palavra2"
          >
            <textarea name="faq" defaultValue={faqText} className="fld min-h-[200px] font-mono text-xs" />
          </Field>
        </ActionForm>
      </Card>

      <Card title="Como conectar o WhatsApp">
        <div className="space-y-2 text-sm text-muted">
          <p>
            1. Configure a Evolution API nas variáveis de ambiente (<code className="rounded bg-ink/[0.05] px-1">EVOLUTION_API_URL</code>,{" "}
            <code className="rounded bg-ink/[0.05] px-1">EVOLUTION_API_KEY</code>,{" "}
            <code className="rounded bg-ink/[0.05] px-1">EVOLUTION_INSTANCE</code>).
          </p>
          <p>
            2. Aponte o webhook da sua instância para{" "}
            <code className="rounded bg-ink/[0.05] px-1">/api/whatsapp/webhook</code> e defina o token em{" "}
            <code className="rounded bg-ink/[0.05] px-1">EVOLUTION_WEBHOOK_TOKEN</code>.
          </p>
          <p>3. Ative &quot;Responder no WhatsApp&quot; acima. Veja mais na aba Integrações.</p>
        </div>
      </Card>
    </div>
  );
}
