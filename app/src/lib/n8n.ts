import "server-only";

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!;

export type N8nActionBody =
  | { action: "chat"; message: string; sessionId: string }
  | { action: "createLead"; name: string; email: string; company: string }
  | { action: "createTask"; title: string }
  | { action: "createInvoice"; customerId: string; amount: number };

export async function callN8nAction<T = unknown>(body: N8nActionBody): Promise<T> {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error ?? `n8n webhook failed with status ${res.status}`;
    throw new Error(message);
  }

  if (!data) {
    throw new Error("n8n webhook returned an empty response — check the workflow execution log");
  }

  return data as T;
}
