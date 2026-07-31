import { getSettings } from "@/lib/queries";
import { PageHeader, Card, Field, Grid2 } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import { saveBranding, saveNav, saveSocialContact, saveLocation } from "../actions";

export const dynamic = "force-dynamic";

function rgbToHex(rgb?: string): string {
  const parts = (rgb || "").split(" ").map((n) => parseInt(n, 10));
  if (parts.length !== 3 || parts.some(isNaN)) return "#465a52";
  return "#" + parts.map((n) => n.toString(16).padStart(2, "0")).join("");
}

export default async function AparenciaPage() {
  const s = await getSettings();
  const nav = (s?.navItems as { label: string; href: string }[]) || [];
  const navText = nav.map((n) => `${n.label} :: ${n.href}`).join("\n");

  return (
    <div>
      <PageHeader title="Aparência & Site" subtitle="Cores, menu, redes sociais e localização" />

      <Card title="Cores da marca" description="A cor principal é aplicada em botões, destaques e ícones">
        <ActionForm action={saveBranding}>
          <Grid2>
            <Field label="Cor principal">
              <input type="color" name="brand" defaultValue={rgbToHex(s?.brandRgb)} className="h-11 w-full rounded-lg border border-ink/12 bg-white p-1" />
            </Field>
            <Field label="Cor suave">
              <input type="color" name="brandSoft" defaultValue={rgbToHex(s?.brandSoftRgb)} className="h-11 w-full rounded-lg border border-ink/12 bg-white p-1" />
            </Field>
            <Field label="Cor profunda (seções escuras)">
              <input type="color" name="brandDeep" defaultValue={rgbToHex(s?.brandDeepRgb)} className="h-11 w-full rounded-lg border border-ink/12 bg-white p-1" />
            </Field>
          </Grid2>
        </ActionForm>
      </Card>

      <Card title="Menu do topo" description="Um item por linha, no formato: Rótulo :: #ancora">
        <ActionForm action={saveNav}>
          <Field label="Itens de navegação">
            <textarea name="nav" defaultValue={navText} className="fld min-h-[140px] font-mono text-sm" />
          </Field>
        </ActionForm>
      </Card>

      <Card title="Redes sociais e contato">
        <ActionForm action={saveSocialContact}>
          <Grid2>
            <Field label="Instagram (URL)">
              <input name="instagram" defaultValue={s?.instagram} className="fld" placeholder="https://instagram.com/..." />
            </Field>
            <Field label="Facebook (URL)">
              <input name="facebook" defaultValue={s?.facebook} className="fld" placeholder="https://facebook.com/..." />
            </Field>
            <Field label="WhatsApp" hint="Só números, com DDI e DDD. Ex.: 5511987654321">
              <input name="whatsapp" defaultValue={s?.whatsapp} className="fld" />
            </Field>
            <Field label="Telefone (exibição)">
              <input name="phone" defaultValue={s?.phone} className="fld" placeholder="(11) 3333-4444" />
            </Field>
            <Field label="E-mail">
              <input name="email" defaultValue={s?.email} className="fld" />
            </Field>
          </Grid2>
        </ActionForm>
      </Card>

      <Card title="Localização" description="Endereço exibido e mapa incorporado do Google">
        <ActionForm action={saveLocation}>
          <Field label="Endereço">
            <input name="addressLine" defaultValue={s?.addressLine} className="fld" />
          </Field>
          <Field
            label="URL do mapa (embed)"
            hint="No Google Maps: Compartilhar → Incorporar um mapa → copie o link do src do iframe"
          >
            <input name="mapsEmbed" defaultValue={s?.mapsEmbed} className="fld" />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
