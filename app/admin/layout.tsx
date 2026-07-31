import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Painel administrativo",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  // A tela de login não tem sessão — renderiza sem shell.
  if (!user) {
    return <>{children}</>;
  }

  return <AdminShell user={{ name: user.name, email: user.email }}>{children}</AdminShell>;
}
