# פרויקט גמר - AI ERP (No-Code)

פרויקט גמר בקורס John Bryce: מערכת ERP קטנה מבוססת AI לעסק אלקטרוניקה פיקטיבי, בנויה על Airtable (נתונים) + n8n (אוטומציות וסוכני AI) + Next.js (דשבורד ניהול).

## מבנה הריפו

- `workflows/` - 10 אוטומציות n8n (ייצוא מדויק מתיקיית "פרוייקט גמר" ב-n8n), ניתנות לייבוא ישיר ל-n8n (Import from File / Import from URL).
- `app/` - דשבורד הניהול (Next.js), כולל צאט AI, ניהול לידים, משימות וחשבוניות.

## האוטומציות (workflows/)

| קובץ | תיאור |
|---|---|
| WF1-verify-tax-documents.json | אימות מסמכי מס והכנסתם לתור הפקה (חישוב מע"מ וסה"כ) |
| WF3-intake-contacts-dedupe.json | קליטת אנשי קשר וסינון כפילויות לפי אימייל |
| WF4a-sales-cold-emails.json | סוכן מכירות - ניסוח ושליחת מיילים קרים ללידים חדשים |
| WF4b-sales-reply-triage.json | סוכן מכירות - סיווג תשובות לידים (מעוניין/לא מעוניין/שאלה) |
| WF5-customer-service-agent.json | סוכן שירות לקוחות בטלגרם, עם חיפוש במדיניות ובמוצרים (RAG) |
| WF6-policies-to-vector-store.json | טעינת מדיניות החברה למאגר וקטורי |
| WF7-products-to-vector-store.json | טעינת קטלוג המוצרים ממ-Airtable למאגר וקטורי |
| WF8-invoice-generation-drive-upload.json | הפקת מסמך חשבונית והעלאה ל-Google Drive |
| WF9-admin-agent.json | סוכן AI למנהל העסק בטלגרם - שאלות על חשבוניות והכנסות |
| WF13-app-request-intake.json | Webhook שמקבל בקשות מהדשבורד (צ'אט, יצירת ליד/משימה/חשבונית) |

כל הקבצים מכילים את ה-`nodeId`-ים, ה-`credentials` references (שמות בלבד, לא ערכים) וה-expressions המקוריים של n8n. כדי לייבא: n8n → Workflows → Import from File, ולחבר מחדש את ה-credentials המתאימים (Airtable PAT, OpenAI, Google Service Account, Telegram bots).

## דשבורד (app/)

Next.js app עם Airtable כמקור נתונים ו-n8n webhook לצ'אט/יצירת רשומות. ראו `app/README.md` להרצה מקומית. יש להעתיק `.env.local.example` ל-`.env.local` ולמלא `AIRTABLE_PAT` ו-`N8N_WEBHOOK_URL` בפועל (לא נכללים בריפו).
