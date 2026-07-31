"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { patients, appointments, patientMessages } from "@/lib/db/schema";
import {
  createPatientSession,
  destroyPatientSession,
  verifyPatientCredentials,
  hashPatientPassword,
  requirePatient,
} from "@/lib/patient-auth";
import { isSlotAvailable } from "@/lib/availability";

type State = { ok?: boolean; message?: string; error?: string } | null;
const S = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// vincula agendamentos avulsos (mesmo e-mail) a este paciente
async function linkAppointmentsByEmail(patientId: string, email: string) {
  await db
    .update(appointments)
    .set({ patientId })
    .where(and(eq(appointments.email, email), isNull(appointments.patientId)));
}

export async function patientRegister(_p: State, fd: FormData): Promise<State> {
  const name = S(fd, "name");
  const email = S(fd, "email").toLowerCase();
  const phone = S(fd, "phone");
  const password = S(fd, "password");
  const confirm = S(fd, "confirm");
  if (!name || !email) return { error: "Informe nome e e-mail" };
  if (password.length < 6) return { error: "A senha deve ter ao menos 6 caracteres" };
  if (password !== confirm) return { error: "As senhas não coincidem" };

  const existing = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
  if (existing.length) {
    if (existing[0].password) return { error: "Já existe uma conta com esse e-mail. Faça login." };
    // paciente pré-cadastrado pelo médico sem senha → define agora
    await db
      .update(patients)
      .set({ name, phone: phone || existing[0].phone, password: await hashPatientPassword(password), active: true, updatedAt: new Date() })
      .where(eq(patients.id, existing[0].id));
    await linkAppointmentsByEmail(existing[0].id, email);
    await createPatientSession({ id: existing[0].id, name, email });
    redirect("/paciente");
  }

  const [row] = await db
    .insert(patients)
    .values({ name, email, phone, password: await hashPatientPassword(password) })
    .returning({ id: patients.id });
  await linkAppointmentsByEmail(row.id, email);
  await createPatientSession({ id: row.id, name, email });
  redirect("/paciente");
}

export async function patientLogin(_p: State, fd: FormData): Promise<State> {
  const email = S(fd, "email").toLowerCase();
  const password = S(fd, "password");
  const user = await verifyPatientCredentials(email, password);
  if (!user) return { error: "E-mail ou senha incorretos." };
  await linkAppointmentsByEmail(user.id, email);
  await createPatientSession(user);
  redirect("/paciente");
}

export async function patientLogout() {
  await destroyPatientSession();
  redirect("/paciente/login");
}

export async function cancelMyAppointment(fd: FormData): Promise<void> {
  const me = await requirePatient();
  const id = S(fd, "id");
  await db
    .update(appointments)
    .set({ status: "CANCELADO" })
    .where(and(eq(appointments.id, id), eq(appointments.patientId, me.id)));
  revalidatePath("/paciente/agendamentos");
  revalidatePath("/paciente");
}

export async function rescheduleMyAppointment(_prev: State, fd: FormData): Promise<State> {
  const me = await requirePatient();
  const id = S(fd, "id");
  const startISO = S(fd, "startISO");
  // confirma que o agendamento é do paciente
  const [appt] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.patientId, me.id)))
    .limit(1);
  if (!appt) return { error: "Agendamento não encontrado" };
  const avail = await isSlotAvailable(startISO);
  if (!avail.ok || !avail.end) return { error: avail.reason || "Horário indisponível" };
  await db
    .update(appointments)
    .set({ start: new Date(startISO), end: avail.end, status: "PENDENTE" })
    .where(eq(appointments.id, id));
  revalidatePath("/paciente/agendamentos");
  redirect("/paciente/agendamentos?reagendado=1");
}

export async function sendPatientMessage(_p: State, fd: FormData): Promise<State> {
  const me = await requirePatient();
  const body = S(fd, "body");
  if (!body) return { error: "Mensagem vazia" };
  await db.insert(patientMessages).values({
    patientId: me.id,
    sender: "patient",
    body,
    readByPatient: true,
    readByDoctor: false,
  });
  revalidatePath("/paciente/mensagens");
  return { ok: true, message: "Mensagem enviada" };
}

export async function updateMyProfile(_p: State, fd: FormData): Promise<State> {
  const me = await requirePatient();
  await db
    .update(patients)
    .set({
      name: S(fd, "name"),
      phone: S(fd, "phone"),
      birthDate: S(fd, "birthDate"),
      address: S(fd, "address"),
      updatedAt: new Date(),
    })
    .where(eq(patients.id, me.id));
  revalidatePath("/paciente/perfil");
  return { ok: true, message: "Dados atualizados" };
}

export async function changeMyPassword(_p: State, fd: FormData): Promise<State> {
  const me = await requirePatient();
  const password = S(fd, "password");
  const confirm = S(fd, "confirm");
  if (password.length < 6) return { error: "A senha deve ter ao menos 6 caracteres" };
  if (password !== confirm) return { error: "As senhas não coincidem" };
  await db.update(patients).set({ password: await hashPatientPassword(password), updatedAt: new Date() }).where(eq(patients.id, me.id));
  return { ok: true, message: "Senha atualizada" };
}
