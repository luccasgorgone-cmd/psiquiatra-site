import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { clinicPhotos } from "@/lib/db/schema";
import { getSettings, getDoctor, mediaUrl } from "@/lib/queries";
import { PageHeader, Card, Field } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import {
  uploadLogo,
  uploadHero,
  uploadDoctorPhoto,
  uploadClinicImage,
  uploadApproachImage,
  uploadLocationImage,
  addClinicPhoto,
  deleteClinicPhoto,
} from "../actions";
import { Trash2, ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

function Preview({ url, ratio = "aspect-video" }: { url: string | null; ratio?: string }) {
  return (
    <div className={`${ratio} overflow-hidden rounded-xl border border-ink/[0.07] bg-sand/50`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Prévia" className="h-full w-full object-contain" />
      ) : (
        <div className="flex h-full items-center justify-center text-muted">
          <ImageIcon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}

export default async function MidiaPage() {
  const [s, doc, photos] = await Promise.all([
    getSettings(),
    getDoctor(),
    db.select().from(clinicPhotos).orderBy(asc(clinicPhotos.order)),
  ]);

  const hint = "PNG, JPG, WEBP ou SVG · até 15MB · otimizamos automaticamente";

  return (
    <div>
      <PageHeader title="Mídia & Logo" subtitle="Troque a logo e as fotos do site" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Logo">
          <div className="mb-4 max-w-[220px]">
            <Preview url={mediaUrl(s?.logoId)} ratio="aspect-[3/1]" />
          </div>
          <ActionForm action={uploadLogo} submitLabel="Enviar logo">
            <Field label="Novo arquivo" hint={hint}>
              <input type="file" name="file" accept="image/*" className="fld" />
            </Field>
          </ActionForm>
        </Card>

        <Card title="Foto da médica">
          <div className="mb-4 max-w-[180px]">
            <Preview url={mediaUrl(doc?.photoId)} ratio="aspect-[4/5]" />
          </div>
          <ActionForm action={uploadDoctorPhoto} submitLabel="Enviar foto">
            <Field label="Novo arquivo" hint={hint}>
              <input type="file" name="file" accept="image/*" className="fld" />
            </Field>
          </ActionForm>
        </Card>
      </div>

      <Card title="Imagem do topo (Hero)" description="Opcional — usada no compartilhamento e no topo">
        <div className="mb-4 max-w-[320px]">
          <Preview url={mediaUrl(s?.heroImageId)} />
        </div>
        <ActionForm action={uploadHero} submitLabel="Enviar imagem">
          <Field label="Novo arquivo" hint={hint}>
            <input type="file" name="file" accept="image/*" className="fld" />
          </Field>
        </ActionForm>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Destaque — Abordagem" description="Foto grande na faixa 'A abordagem'">
          <div className="mb-4">
            <Preview url={mediaUrl(s?.approachImageId)} ratio="aspect-[4/5]" />
          </div>
          <ActionForm action={uploadApproachImage} submitLabel="Enviar">
            <Field label="Arquivo" hint={hint}>
              <input type="file" name="file" accept="image/*" className="fld" />
            </Field>
          </ActionForm>
        </Card>

        <Card title="Destaque — A Clínica" description="Foto grande na seção 'A Clínica'">
          <div className="mb-4">
            <Preview url={mediaUrl(s?.clinicImageId)} ratio="aspect-[4/5]" />
          </div>
          <ActionForm action={uploadClinicImage} submitLabel="Enviar">
            <Field label="Arquivo" hint={hint}>
              <input type="file" name="file" accept="image/*" className="fld" />
            </Field>
          </ActionForm>
        </Card>

        <Card title="Localização — Fachada" description="Foto ao lado do mapa">
          <div className="mb-4">
            <Preview url={mediaUrl(s?.locationImageId)} ratio="aspect-[4/3]" />
          </div>
          <ActionForm action={uploadLocationImage} submitLabel="Enviar">
            <Field label="Arquivo" hint={hint}>
              <input type="file" name="file" accept="image/*" className="fld" />
            </Field>
          </ActionForm>
        </Card>
      </div>

      <Card title="Galeria da clínica (opcional)">
        {photos.length > 0 && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {photos.map((p) => (
              <div key={p.id} className="group relative">
                <Preview url={mediaUrl(p.mediaId)} ratio="aspect-[4/3]" />
                <p className="mt-1.5 text-xs text-muted">{p.caption || "Sem legenda"}</p>
                <form action={deleteClinicPhoto} className="absolute right-2 top-2">
                  <input type="hidden" name="id" value={p.id} />
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted shadow-soft hover:text-red-600" aria-label="Remover">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
        <ActionForm action={addClinicPhoto} submitLabel="Adicionar foto" resetOnSuccess>
          <Field label="Nova foto" hint={hint}>
            <input type="file" name="file" accept="image/*" className="fld" />
          </Field>
          <Field label="Legenda (opcional)">
            <input name="caption" className="fld" placeholder="Ex.: Recepção" />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
