"use client";

import { useEffect, useRef, useState } from "react";
import Card from "@/components/Card";
import { SendIcon, SparkleIcon } from "@/components/icons";

type Message = { role: "user" | "assistant"; text: string };

function getSessionId() {
  const key = "ai-erp-chat-session";
  let id = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (!id) {
    id = crypto.randomUUID();
    if (typeof window !== "undefined") localStorage.setItem(key, id);
  }
  return id;
}

export default function ChatPage() {
  const [sessionId] = useState<string>(() => getSessionId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה לא ידועה");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card title="צ׳אט עם הסוכן">
      <div className="flex flex-col gap-3 h-[55vh] overflow-y-auto mb-4 p-1">
        {messages.length === 0 && (
          <div className="m-auto flex flex-col items-center gap-2 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-indigo-50 text-indigo-500">
              <SparkleIcon className="h-5 w-5" />
            </span>
            <p className="text-sm text-slate-500">שאל שאלה, למשל: &quot;מה מדיניות ההחזרות?&quot;</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${m.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                m.role === "user" ? "bg-slate-900 text-white" : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {m.role === "user" ? "את" : "AI"}
            </span>
            <div
              className={`max-w-[75vw] sm:max-w-[26rem] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-ee-sm bg-slate-900 text-white"
                  : "rounded-es-sm bg-slate-100 text-slate-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-2 self-start text-sm text-slate-400">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
            </span>
            כותב תשובה...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {error && <p className="mb-2 text-sm text-rose-600">{error}</p>}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="הקלד הודעה..."
          className="field-input flex-1 rounded-full px-4"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary rounded-full px-4"
          aria-label="שליחה"
        >
          <SendIcon className="h-4 w-4 -scale-x-100" />
        </button>
      </form>
    </Card>
  );
}
