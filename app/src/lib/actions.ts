"use server";

import { revalidatePath } from "next/cache";
import { callN8nAction } from "./n8n";

export type ActionState = { ok: boolean; error?: string } | null;

export async function createLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();

  if (!name || !email) {
    return { ok: false, error: "שם ואימייל הם שדות חובה" };
  }

  try {
    await callN8nAction({ action: "createLead", name, email, company });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה לא ידועה" };
  }

  revalidatePath("/leads");
  return { ok: true };
}

export async function createTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    return { ok: false, error: "כותרת המשימה היא שדה חובה" };
  }

  try {
    await callN8nAction({ action: "createTask", title });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה לא ידועה" };
  }

  revalidatePath("/tasks");
  return { ok: true };
}

export async function createInvoice(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const customerId = String(formData.get("customerId") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const amount = Number(amountRaw);

  if (!customerId || !amountRaw || Number.isNaN(amount)) {
    return { ok: false, error: "מזהה לקוח וסכום הם שדות חובה" };
  }

  try {
    await callN8nAction({ action: "createInvoice", customerId, amount });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה לא ידועה" };
  }

  revalidatePath("/invoices");
  return { ok: true };
}
