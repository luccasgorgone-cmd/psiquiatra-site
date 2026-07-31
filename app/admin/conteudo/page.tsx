import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { helpSigns } from "@/lib/db/schema";
import { getSettings, getDoctor, getClinic } from "@/lib/queries";
import { PageHeader, Card, Field, Grid2 } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import {
  saveGeneral,
  saveDoctor,
  saveClinic,
  createHelpSign,
  deleteHelpSign,
} from "../actions";
import { Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConteudoPage() {
  const [s, doc, clinic, signs] = await Promise.all([
    getSettings(),
    getDoctor(),
    getClinic(),
    db.select().from(helpSigns).orderBy(asc(helpSigns.order)),
  ]);

  return (
    <div>
      <PageHeader title="Conteúdo do site" subtitle="Textos da página inicial, da médica e da clínica" />

      <Card title="Topo / Hero e SEO" description="A primeira dobra do site e os dados de busca">
        <ActionForm action={saveGeneral}>
          <Grid2>
            <Field label="Nome do site">
              <input name="siteName" defaultValue={s?.siteName} className="fld" />
            </Field>
            <Field label="Tagline">
              <input name="tagline" defaultValue={s?.tagline} className="fld" />
            </Field>
          </Grid2>
          <Field label="Kicker (linha acima do título)">
            <input name="heroKicker" defaultValue={s?.heroKicker} className="fld" />
          </Field>
          <Field label="Título principal">
            <input name="heroTitle" defaultValue={s?.heroTitle} className="fld" />
          </Field>
          <Field label="Subtítulo">
            <textarea name="heroSubtitle" defaultValue={s?.heroSubtitle} className="fld min-h-[80px]" />
          </Field>
          <Grid2>
            <Field label="Rodapé — texto">
              <textarea name="footerText" defaultValue={s?.footerText} className="fld min-h-[80px]" />
            </Field>
            <Field label="Rodapé — nota">
              <textarea name="footerNote" defaultValue={s?.footerNote} className="fld min-h-[80px]" />
            </Field>
          </Grid2>
          <Grid2>
            <Field label="SEO — título">
              <input name="metaTitle" defaultValue={s?.metaTitle} className="fld" />
            </Field>
            <Field label="SEO — descrição">
              <input name="metaDescription" defaultValue={s?.metaDescription} className="fld" />
            </Field>
          </Grid2>
        </ActionForm>
      </Card>

      <Card title="Sobre a médica">
        <ActionForm action={saveDoctor}>
          <Grid2>
            <Field label="Nome">
              <input name="name" defaultValue={doc?.name} className="fld" />
            </Field>
            <Field label="Título / especialidade">
              <input name="title" defaultValue={doc?.title} className="fld" />
            </Field>
            <Field label="CRM">
              <input name="crm" defaultValue={doc?.crm} className="fld" />
            </Field>
            <Field label="RQE">
              <input name="rqe" defaultValue={doc?.rqe} className="fld" />
            </Field>
          </Grid2>
          <Field label="Biografia">
            <textarea name="bioLong" defaultValue={doc?.bioLong} className="fld min-h-[120px]" />
          </Field>
          <Grid2>
            <Field label="Abordagem">
              <textarea name="approach" defaultValue={doc?.approach} className="fld min-h-[100px]" />
            </Field>
            <Field label="Formação">
              <textarea name="formation" defaultValue={doc?.formation} className="fld min-h-[100px]" />
            </Field>
          </Grid2>
        </ActionForm>
      </Card>

      <Card title="A Clínica">
        <ActionForm action={saveClinic}>
          <Field label="Título">
            <input name="title" defaultValue={clinic.info?.title} className="fld" />
          </Field>
          <Field label="Descrição">
            <textarea name="description" defaultValue={clinic.info?.description} className="fld min-h-[100px]" />
          </Field>
          <Grid2>
            <Field label="Comodidades" hint="Uma por linha">
              <textarea
                name="amenities"
                defaultValue={((clinic.info?.amenities as string[]) || []).join("\n")}
                className="fld min-h-[110px]"
              />
            </Field>
            <Field label="Horário de atendimento">
              <input name="hours" defaultValue={clinic.info?.hours} className="fld" />
            </Field>
          </Grid2>
        </ActionForm>
      </Card>

      <Card title="Quando buscar ajuda" description="Lista de sinais exibida no site">
        <div className="mb-4 flex flex-wrap gap-2">
          {signs.map((sg) => (
            <span key={sg.id} className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-sm">
              {sg.label}
              <form action={deleteHelpSign}>
                <input type="hidden" name="id" value={sg.id} />
                <button className="text-muted hover:text-red-600" aria-label="Remover">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </span>
          ))}
          {signs.length === 0 && <p className="text-sm text-muted">Nenhum sinal cadastrado.</p>}
        </div>
        <ActionForm action={createHelpSign} submitLabel="Adicionar" resetOnSuccess compact>
          <Field label="Novo sinal">
            <input name="label" className="fld" placeholder="Ex.: Dificuldade para dormir" />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
