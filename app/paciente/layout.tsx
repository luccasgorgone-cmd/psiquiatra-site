import { getPatientSession } from "@/lib/patient-auth";
import { getSettings, mediaUrl } from "@/lib/queries";
import PatientShell from "@/components/patient/PatientShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Área do paciente",
  robots: { index: false, follow: false },
};

export default async function PacienteLayout({ children }: { children: React.ReactNode }) {
  const me = await getPatientSession();
  if (!me) return <>{children}</>; // login / cadastro

  const s = await getSettings();
  return (
    <PatientShell name={me.name} logoUrl={mediaUrl(s?.logoId)} siteName={s?.siteName || "Clínica"}>
      {children}
    </PatientShell>
  );
}
