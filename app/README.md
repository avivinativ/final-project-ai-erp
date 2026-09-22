# AI-ERP

Next.js admin app for a small no-code AI-ERP system, built as a final project. Automations live in n8n (10 workflows + 3 AI agents + a RAG vector store), data lives in Airtable, and this app is the Lovable/Base44-style admin dashboard — built as real Next.js code instead.

## Architecture

```
this app (Next.js)  →  n8n webhook (WF13)  →  Airtable (data)
      ↑ reads directly from Airtable REST API for display
```

- **Reads** (dashboard, leads/tasks/invoices/products lists): server-side calls straight to the Airtable REST API (`src/lib/airtable.ts`), using `AIRTABLE_PAT` / `AIRTABLE_BASE_ID`.
- **Writes and chat**: always go through the single n8n webhook (`src/lib/n8n.ts` → `N8N_WEBHOOK_URL`), which is workflow **WF13 - קליטת קריאות מהאפליקציה**. It routes by an `action` field: `chat`, `createLead`, `createTask`, `createInvoice`.
- The n8n side (10 workflows, imported from the course build) also runs independently of this app: Telegram bots for the manager and for customer service, scheduled cold-email/follow-up agents, invoice VAT calculation, and PDF generation to Drive.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev
```

Environment variables (`.env.local`):

| Var | Purpose |
|---|---|
| `AIRTABLE_PAT` | Airtable Personal Access Token, read access to the base |
| `AIRTABLE_BASE_ID` | The Airtable base (`app8cwZVO7nUF6ErS`) |
| `N8N_WEBHOOK_URL` | Production URL of WF13's webhook — currently `https://n8n.nativ-ai.co.il/webhook/ai-erp-app` (self-hosted n8n on Hetzner/Docker; **not** the old n8n Cloud instance) |

## n8n workflows

All 10 live on the self-hosted n8n instance (`n8n.nativ-ai.co.il`). Numbering isn't contiguous (2, 10, 11, 12 don't exist) — inherited from the course spec.

| Workflow | Trigger | Purpose |
|---|---|---|
| WF1 | Airtable poll (Invoices, every min) | Validates a new invoice, computes VAT + total, marks `ValidatedQueued` |
| WF3 | Airtable poll (Leads, every min) | Marks a new lead `Duplicate` (by email) or `New` |
| WF4a | Schedule (every 3h) | Sends one cold sales email to a `New` lead, marks it contacted |
| WF4b | Gmail poll (every 30 min) | Classifies a lead's email reply (interested / not / question) and updates status |
| WF5 | Telegram (customer bot) | Customer-service agent, answers from the policies + products vector store |
| WF6 | Manual only | Loads the policy text into the in-memory vector store (`policies`) |
| WF7 | Manual only | Loads all Airtable products into the in-memory vector store (`products`) |
| WF8 | Schedule (every min) | Renders an HTML invoice for `ValidatedQueued` invoices, uploads to Drive, marks `Invoiced` |
| WF9 | Telegram (manager bot) | Manager Q&A agent over the last 100 invoices (owner chat ID is hardcoded in the IF node) |
| WF13 | Webhook (`ai-erp-app`) | Everything this app calls: chat, create lead/task/invoice |

### Known limitations (by design)

- **The vector store is in-memory only** — it's wiped on every n8n restart (including redeploys of the Docker container). Re-run **WF6 then WF7** manually (Execute workflow) after any restart, or the chat agents' product/policy search returns empty results.
- No PDF conversion — invoices are saved as HTML to Drive; convert manually via Google Docs → Download → PDF if a real PDF is needed.
- Airtable triggers poll at minimum 1-minute resolution; two invoices created in the same minute can race on invoice numbering.
- No retries/error handling in the workflows — a red execution in n8n's Executions tab is expected behavior on failure, not a bug to silently swallow.
- Single-user app, no auth, no cache — Airtable's API rate limit (~5 req/s) is the practical ceiling for a heavier dashboard.
- `npm run dev` runs `next dev --webpack` on purpose — Turbopack (Next.js 16's default) crashes on at least one Windows setup with `0xc0000142` while spawning the Node worker that evaluates `@tailwindcss/postcss`. Webpack mode avoids that code path entirely; no functional difference for this app.

## Status

Last verified end-to-end 2026-09-22: full chain re-tested live (not just read from code) —
- **n8n**: found and fixed two real bugs — WF3's duplicate-check counted the new lead against itself, so every lead (including the first ever) was wrongly marked `Duplicate` and never reached the sales pipeline (now requires >1 match); WF8's Google Drive upload node had an empty `folderId`, causing every invoice upload to 404 (now points at Drive root). Activated WF1, WF3, WF4b, WF5, WF8, WF9, WF13 (WF4a intentionally left off — it emails real leads on a schedule, pending a decision to enable it; WF6/WF7 correctly stay manual-only).
- **RAG**: confirmed live via a real chat query — the policy and product vector stores are both populated and answering correctly right now. Still re-run WF6 then WF7 manually right before any demo, since a restart wipes them silently.
- **App**: fixed two local setup bugs — `.env.local` was sitting one directory up from where Next.js actually reads it (`app/.env.local` was missing entirely), and `app/node_modules` didn't exist (only the wrong directory had one, from an earlier incomplete restructure). Both fixed; `npm install` now works from `app/` as documented above.
- **End-to-end through the actual UI**: dashboard loads real Airtable data, and the chat page got a real RAG-backed answer through the full path (browser → this app → WF13 webhook → agent → reply rendered on screen).

Previous note (2026-09-17): migrated n8n from n8n Cloud to a self-hosted Docker instance, webhook URL updated. See the project checklist artifact for the full build log.
