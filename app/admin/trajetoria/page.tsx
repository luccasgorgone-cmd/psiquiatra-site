import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { credentials } from "@/lib/db/schema";
import { PageHeader, Card, Field, Grid2 } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import { createCredential, updateCredential, deleteCredential } from "../actions";
import { Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

const ICONS = ["graduation", "globe", "award", "stethoscope"];

function IconSelect({ name, value }: { name: string; value?: string }) {
  return (
    <select name={name} defaultValue={value || "award"} className="fld">
      {ICONS.map((i) => (
        <option key={i} value={i}>
          {i}
        </option>
      ))}
    </select>
  );
}

export default async function TrajetoriaPage() {
  const items = await db.select().from(credentials).orderBy(asc(credentials.order));

  return (
    <div>
      <PageHeader title="Formação & Trajetória" subtitle="Credenciais exibidas na seção de validação do site" />

      <Card title="Adicionar item">
        <ActionForm action={createCredential} submitLabel="Adicionar" resetOnSuccess>
          <Grid2>
            <Field label="Título">
              <input name="title" className="fld" placeholder="Ex.: Residência em Psiquiatria" />
            </Field>
            <Field label="Instituição">
              <input name="org" className="fld" placeholder="Ex.: University of Iowa (EUA)" />
            </Field>
            <Field label="Período / rótulo">
              <input name="period" className="fld" placeholder="Ex.: Especialização internacional" />
            </Field>
            <Field label="Ícone">
              <IconSelect name="icon" />
            </Field>
          </Grid2>
          <Field label="Detalhe">
            <textarea name="detail" className="fld min-h-[70px]" />
          </Field>
        </ActionForm>
      </Card>

      {items.map((c) => (
        <Card key={c.id}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted">Editar</span>
            <form action={deleteCredential}>
              <input type="hidden" name="id" value={c.id} />
              <button className="inline-flex items-center gap-1 text-sm text-muted hover:text-red-600">
                <Trash2 className="h-4 w-4" /> Remover
              </button>
            </form>
          </div>
          <ActionForm action={updateCredential}>
            <input type="hidden" name="id" value={c.id} />
            <Grid2>
              <Field label="Título">
                <input name="title" defaultValue={c.title} className="fld" />
              </Field>
              <Field label="Instituição">
                <input name="org" defaultValue={c.org} className="fld" />
              </Field>
              <Field label="Período / rótulo">
                <input name="period" defaultValue={c.period} className="fld" />
              </Field>
              <Field label="Ícone">
                <IconSelect name="icon" value={c.icon} />
              </Field>
            </Grid2>
            <Field label="Detalhe">
              <textarea name="detail" defaultValue={c.detail} className="fld min-h-[70px]" />
            </Field>
          </ActionForm>
        </Card>
      ))}
    </div>
  );
}
