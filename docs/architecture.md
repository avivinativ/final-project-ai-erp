# ארכיטקטורה

## שכבות

| שכבה | היכן | תפקיד |
|---|---|---|
| נתונים | Airtable | 4 טבלאות (`Invoices`, `Leads`, `Products`, `Tasks`) — מקור אמת יחיד |
| לוגיקה | n8n (self-hosted, `n8n.nativ-ai.co.il`) | 10 workflows + WF0 (מטפל שגיאות), 3 סוכני AI, מאגר וקטורי בזיכרון (RAG) |
| ממשק | Next.js (`app/`) | דשבורד ניהול: דף בית, לידים, משימות, חשבוניות, צ'אט — מדבר עם n8n דרך webhook יחיד |

## זרימה

```
 דשבורד (Next.js) ──POST /webhook/ai-erp-app──▶ WF13 ──▶ ניתוב לפי action
                                                    │
        ┌───────────────────────────────────────────┼──────────────────────────┐
        ▼                                            ▼                          ▼
   action=chat                              action=createLead/Task      action=createInvoice
   סוכן AI + RAG (מדיניות/מוצרים)             Airtable.Leads/Tasks         Airtable.Invoices (Amount בלבד)
        │                                            │                          │
        ▼                                            ▼                          ▼
  תשובת JSON לדשבורד                    WF3 (טריגר Created, כל דקה)      WF1 (טריגר Created, כל דקה)
                                          מסמן New / Duplicate            מחשב מע"מ+סה"כ+מספר חשבונית
                                                    │                     Status=ValidatedQueued
                                                    ▼                          │
                                     WF4a (כל 3 שעות, New בלבד)                ▼
                                     מייל קר → Contacted                  WF8 (כל דקה)
                                                    │                     HTML → Google Drive
                                                    ▼                     Status=Invoiced
                                     WF4b (Gmail, כל 30 דק')
                                     מסווג תגובה → Interested/
                                     Not Interested/Question/Needs Review

 לקוח ──Telegram (בוט לקוחות)──▶ WF5 ◀── RAG: SearchPolicies (WF6) + SearchProducts (WF7)
 מנהל ──Telegram (בוט מנהל)────▶ WF9 (chat id מאומת) ◀── עד 100 חשבוניות אחרונות

 כל כשל בכל workflow ──▶ WF0 (Error Workflow) ──▶ הודעת Telegram לבעל העסק
```

## RAG — מאגר וקטורי בזיכרון

- **WF6** (הפעלה ידנית): טוען את [`policies/company-policies.md`](../policies/company-policies.md)
  (בפועל: טקסט מוטמע ב-node) ← embeddings (OpenAI) ← מאגר וקטורי בזיכרון, key `policies`.
- **WF7** (הפעלה ידנית): שולף בזמן ריצה את כל הרשומות מטבלת `Products` ← בונה טקסט לכל מוצר ←
  embeddings ← מאגר וקטורי בזיכרון, key `products`. תמונת מצב מתועדת: [`data/products.csv`](../data/products.csv).
- שני המאגרים חיים **בזיכרון של תהליך n8n** — הפעלה מחדש של המכולה (Docker) מאפסת אותם. יש להריץ
  שוב WF6 ואז WF7 (Execute workflow) אחרי כל הפעלה מחדש/דמו.
- WF5, WF9 ו-WF13 כולם משתמשים באותם שני key-ים (`policies`, `products`), כך שמילוי חד-פעמי מספיק
  לכל שלושת הסוכנים.

## טיפול בשגיאות (WF0)

כל 10 ה-workflows (WF1, WF3, WF4a, WF4b, WF5, WF6, WF7, WF8, WF9, WF13) מוגדרים עם
`settings.errorWorkflow = WF0`. בכל כשל — Error Trigger ב-WF0 קולט את שם ה-workflow, שם ה-node
שנכשל, הודעת השגיאה וקישור להרצה, ושולח הכל כהודעת Telegram לבעל העסק (בוט המנהל).

## מספור חשבוניות

בניגוד לגישת "מספר רץ" (running number), WF1 מייצר `InvoiceNumber` מבוסס timestamp
(`INV-YYYYMMDDHHmm`) — נמנע לחלוטין מהתנגשויות בין חשבוניות שנוצרות באותה דקה, במחיר של
מספור לא רציף לחלוטין (מקובל לעסק קטן, לא נדרשת רציפות ע"פ הבריף).
