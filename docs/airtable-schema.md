# סכימת Airtable

Base: `AI-ERP פרוייקט גמר` (`app8cwZVO7nUF6ErS`) — נמשך ישירות מה-API ב-2026-09-22.

## Invoices (`tbliF2WhmHvgKHlMg`)

| שדה | סוג | נכתב על ידי |
|---|---|---|
| InvoiceNumber | טקסט (`INV-YYYYMMDDHHmm`) | WF1 |
| CustomerId | טקסט חופשי | האפליקציה (WF13) |
| Amount | מספר | האפליקציה (WF13) |
| VatAmount | מספר | WF1 |
| Total | מספר | WF1 |
| Status | טקסט (ריק → ValidatedQueued → Invoiced) | WF1, WF8 |
| PdfUrl | URL | WF8 |
| Created | Created time | אוטומטי — משמש כטריגר ל-WF1 |

## Leads (`tbl5JEP9PGG8aYuHx`)

| שדה | סוג | נכתב על ידי |
|---|---|---|
| Name | טקסט | האפליקציה (WF13) |
| Email | Email | האפליקציה (WF13) |
| Company | טקסט | האפליקציה (WF13) |
| Status | טקסט (New / Duplicate / Contacted / Interested / Not Interested / Question / Needs Review) | WF3, WF4a, WF4b |
| Created | Created time | אוטומטי — משמש כטריגר ל-WF3 |

## Products (`tblVjWivxnLAsVvEc`)

| שדה | סוג |
|---|---|
| Name | טקסט |
| Category | טקסט |
| Price | מספר |
| Description | טקסט ארוך |
| InStock | Checkbox |

מקור האמת למוצרים — WF7 שולף אותם משם ומטמיע למאגר הווקטורי בכל הרצה ידנית.
[`data/products.csv`](../data/products.csv) הוא תמונת מצב (snapshot) מתועדת של הטבלה, לא המקור החי.

## Tasks (`tblTDaEyaCVsg4Iul`)

| שדה | סוג |
|---|---|
| Title | טקסט |
| Status | טקסט (Open / Done) |

## הערות מבניות

- כל שדות ה-`Status` הם טקסט חופשי (לא Single Select) כדי שה-workflows יוכלו לכתוב ערכים חדשים בלי
  להגדיר אותם מראש ב-Airtable.
- `Created` בכל טבלה חייב להישאר משדה מסוג *Created time* — WF1 ו-WF3 מאזינים לו כטריגר polling.
- אין שדה מקשר (linked record) בין הטבלאות — הקישור נעשה בטקסט חופשי (`CustomerId`), כמו בבריף המקורי.
