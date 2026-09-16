"use client";

import { useActionState, useRef, useEffect } from "react";
import { createLead, type ActionState } from "@/lib/actions";

export default function LeadForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createLead, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5">
        <span className="field-label">שם</span>
        <input name="name" placeholder="ישראל ישראלי" required className="field-input" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="field-label">אימייל</span>
        <input name="email" type="email" placeholder="name@company.com" required className="field-input" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="field-label">חברה</span>
        <input name="company" placeholder="שם החברה" className="field-input" />
      </label>
      <button type="submit" disabled={pending} className="btn-primary mt-1">
        {pending ? "שולח..." : "הוספת ליד"}
      </button>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">הליד נוסף בהצלחה</p>}
    </form>
  );
}
