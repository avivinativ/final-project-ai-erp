import { callN8nAction } from "@/lib/n8n";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";

  if (!message || !sessionId) {
    return Response.json({ error: "message ו-sessionId נדרשים" }, { status: 400 });
  }

  try {
    const result = await callN8nAction<{ reply: string }>({ action: "chat", message, sessionId });
    if (typeof result?.reply !== "string") {
      return Response.json({ error: "תגובה לא תקינה מהסוכן" }, { status: 502 });
    }
    return Response.json(result);
  } catch (err) {
    const error = err instanceof Error ? err.message : "שגיאה לא ידועה";
    return Response.json({ error }, { status: 502 });
  }
}
