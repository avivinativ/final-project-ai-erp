"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTask, type ActionState } from "@/lib/actions";

export default function TaskForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createTask, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5">
        <span className="field-label">כותרת המשימה</span>
        <input name="title" placeholder="למשל: לעדכן חוזה ללקוח X" required className="field-input" />
      </label>
      <button type="submit" disabled={pending} className="btn-primary mt-1">
        {pending ? "שולח..." : "הוספת משימה"}
      </button>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">המשימה נוספה בהצלחה</p>}
    </form>
  );
}
