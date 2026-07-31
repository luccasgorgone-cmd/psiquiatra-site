import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { patients } from "@/lib/db/schema";
import { getPatientSession } from "@/lib/patient-auth";
import { Card, Field, Grid2 } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import { updateMyProfile, changeMyPassword } from "../actions";

export const dynamic = "force-dynamic";

export default async function MeuPerfil() {
  const me = (await getPatientSession())!;
  const [p] = await db.select().from(patients).where(eq(patients.id, me.id)).limit(1);
  if (!p) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl text-ink">Meu perfil</h1>
      <p className="mt-2 text-muted">Mantenha seus dados atualizados.</p>

      <div className="mt-6">
        <Card title="Meus dados">
          <ActionForm action={updateMyProfile} submitLabel="Salvar dados">
            <Field label="Nome completo">
              <input name="name" defaultValue={p.name} className="fld" />
            </Field>
            <Grid2>
              <Field label="Telefone / WhatsApp">
                <input name="phone" defaultValue={p.phone} className="fld" />
              </Field>
              <Field label="Data de nascimento">
                <input type="date" name="birthDate" defaultValue={p.birthDate} className="fld" />
              </Field>
            </Grid2>
            <Field label="Endereço">
              <input name="address" defaultValue={p.address} className="fld" />
            </Field>
            <Field label="E-mail (não editável)">
              <input value={p.email} disabled className="fld opacity-60" />
            </Field>
          </ActionForm>
        </Card>

        <Card title="Alterar senha">
          <ActionForm action={changeMyPassword} submitLabel="Atualizar senha" resetOnSuccess>
            <Grid2>
              <Field label="Nova senha">
                <input type="password" name="password" className="fld" />
              </Field>
              <Field label="Confirmar senha">
                <input type="password" name="confirm" className="fld" />
              </Field>
            </Grid2>
          </ActionForm>
        </Card>
      </div>
    </div>
  );
}
