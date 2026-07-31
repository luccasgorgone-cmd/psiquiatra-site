import { PageHeader, Card } from "@/components/admin/ui";
import { CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function Status({ label, on, value }: { label: string; on: boolean; value?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink/[0.08] bg-white px-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {value && <p className="text-xs text-muted">{value}</p>}
      </div>
      {on ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-brand">
          <CheckCircle2 className="h-4 w-4" /> Configurado
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted">
          <XCircle className="h-4 w-4" /> Pendente
        </span>
      )}
    </div>
  );
}

export default async function IntegracoesPage() {
  const url = process.env.EVOLUTION_API_URL || "";
  const key = process.env.EVOLUTION_API_KEY || "";
  const instance = process.env.EVOLUTION_INSTANCE || "";
  const webhookToken = process.env.EVOLUTION_WEBHOOK_TOKEN || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://seusite.com.br";

  return (
    <div>
      <PageHeader title="Integrações" subtitle="Conexão com o WhatsApp via Evolution API" />

      <Card title="Evolution API (WhatsApp)">
        <div className="space-y-3">
          <Status label="URL da API" on={!!url} value={url || "EVOLUTION_API_URL não definida"} />
          <Status label="API Key" on={!!key} value={key ? "•••••••• definida" : "EVOLUTION_API_KEY não definida"} />
          <Status label="Instância" on={!!instance} value={instance || "EVOLUTION_INSTANCE não definida"} />
          <Status label="Token do webhook" on={!!webhookToken} value={webhookToken ? "•••••••• definido" : "EVOLUTION_WEBHOOK_TOKEN não definido"} />
        </div>
      </Card>

      <Card title="Endpoint do webhook" description="Configure este endereço na sua instância da Evolution">
        <code className="block break-all rounded-lg bg-ink/[0.04] px-4 py-3 text-sm text-graphite">
          {siteUrl}/api/whatsapp/webhook
        </code>
        <p className="mt-3 text-sm text-muted">
          A instância deve enviar o header{" "}
          <code className="rounded bg-ink/[0.05] px-1">x-webhook-token</code> com o valor de{" "}
          <code className="rounded bg-ink/[0.05] px-1">EVOLUTION_WEBHOOK_TOKEN</code> para autenticar as mensagens recebidas.
        </p>
      </Card>

      <Card title="Como configurar">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Defina as variáveis EVOLUTION_* no painel do Railway (aba Variables).</li>
          <li>No painel da Evolution, cadastre o webhook apontando para o endpoint acima.</li>
          <li>Ative &quot;Responder no WhatsApp&quot; na aba Agente.</li>
          <li>Envie uma mensagem de teste para a instância e verifique a resposta automática.</li>
        </ol>
      </Card>
    </div>
  );
}
