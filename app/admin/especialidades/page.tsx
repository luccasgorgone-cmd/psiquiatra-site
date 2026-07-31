import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { specialties } from "@/lib/db/schema";
import { PageHeader, Card, Field, Grid2 } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import { createSpecialty, updateSpecialty, deleteSpecialty } from "../actions";
import { Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

const ICONS = ["brain", "wind", "cloud-rain", "activity", "moon", "heart-pulse", "zap", "battery-low", "leaf"];

function IconSelect({ name, value }: { name: string; value?: string }) {
  return (
    <select name={name} defaultValue={value || "brain"} className="fld">
      {ICONS.map((i) => (
        <option key={i} value={i}>
          {i}
        </option>
      ))}
    </select>
  );
}

export default async function EspecialidadesPage() {
  const items = await db.select().from(specialties).orderBy(asc(specialties.order));

  return (
    <div>
      <PageHeader title="Especialidades" subtitle="Áreas de cuidado exibidas no site" />

      <Card title="Adicionar especialidade">
        <ActionForm action={createSpecialty} submitLabel="Adicionar" resetOnSuccess>
          <Grid2>
            <Field label="Título">
              <input name="title" className="fld" placeholder="Ex.: Ansiedade" />
            </Field>
            <Field label="Ícone">
              <IconSelect name="icon" />
            </Field>
          </Grid2>
          <Field label="Descrição">
            <textarea name="description" className="fld min-h-[80px]" />
          </Field>
        </ActionForm>
      </Card>

      {items.map((sp) => (
        <Card key={sp.id}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted">Editar</span>
            <form action={deleteSpecialty}>
              <input type="hidden" name="id" value={sp.id} />
              <button className="inline-flex items-center gap-1 text-sm text-muted hover:text-red-600">
                <Trash2 className="h-4 w-4" /> Remover
              </button>
            </form>
          </div>
          <ActionForm action={updateSpecialty}>
            <input type="hidden" name="id" value={sp.id} />
            <Grid2>
              <Field label="Título">
                <input name="title" defaultValue={sp.title} className="fld" />
              </Field>
              <Field label="Ícone">
                <IconSelect name="icon" value={sp.icon} />
              </Field>
            </Grid2>
            <Field label="Descrição">
              <textarea name="description" defaultValue={sp.description} className="fld min-h-[80px]" />
            </Field>
          </ActionForm>
        </Card>
      ))}
    </div>
  );
}
