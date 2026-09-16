"use client";

import { useActionState, useRef, useEffect } from "react";
import { createInvoice, type ActionState } from "@/lib/actions";

export default function InvoiceForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createInvoice, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5">
        <span className="field-label">מזהה לקוח</span>
        <input name="customerId" placeholder="למשל CUST-0001" required className="field-input" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="field-label">סכום</span>
        <input name="amount" type="number" step="0.01" min="0" placeholder="0.00" required className="field-input" />
      </label>
      <button type="submit" disabled={pending} className="btn-primary mt-1">
        {pending ? "שולח..." : "הוספת חשבונית"}
      </button>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">החשבונית נוצרה בהצלחה</p>}
    </form>
  );
}
