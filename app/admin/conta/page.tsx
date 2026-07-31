import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { PageHeader, Card, Field, Grid2 } from "@/components/admin/ui";
import ActionForm from "@/components/admin/ActionForm";
import { changePassword, createAdmin, deleteAdmin } from "../actions";
import { Trash2, UserRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const me = await getSession();
  const users = await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));

  return (
    <div>
      <PageHeader title="Conta" subtitle="Sua senha e os administradores do painel" />

      <Card title="Trocar minha senha">
        <ActionForm action={changePassword} submitLabel="Atualizar senha" resetOnSuccess>
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

      <Card title="Administradores">
        <div className="mb-6 space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl border border-ink/[0.08] bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="text-sm">
                  <p className="font-medium text-ink">
                    {u.name || "Admin"}
                    {u.id === me?.id && <span className="ml-2 text-xs text-brand">(você)</span>}
                  </p>
                  <p className="text-muted">{u.email}</p>
                </div>
              </div>
              {u.id !== me?.id && users.length > 1 && (
                <form action={deleteAdmin}>
                  <input type="hidden" name="id" value={u.id} />
                  <button className="text-muted hover:text-red-600" aria-label="Remover">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-ink/[0.06] pt-5">
          <h3 className="mb-3 text-sm font-medium text-graphite">Adicionar administrador</h3>
          <ActionForm action={createAdmin} submitLabel="Criar" resetOnSuccess>
            <Grid2>
              <Field label="Nome">
                <input name="name" className="fld" />
              </Field>
              <Field label="E-mail">
                <input type="email" name="email" className="fld" />
              </Field>
            </Grid2>
            <Field label="Senha (mín. 6 caracteres)">
              <input type="password" name="password" className="fld" />
            </Field>
          </ActionForm>
        </div>
      </Card>
    </div>
  );
}
