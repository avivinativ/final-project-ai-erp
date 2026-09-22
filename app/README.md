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
- Google Drive's own preview never renders uploaded `.html` files inline — clicking a `PdfUrl` link shows raw source, regardless of the file's declared MIME type (verified live: the uploaded file is valid HTML with `mimeType: text/html` correctly set, and downloading it and opening it locally renders fine). This is a Drive platform restriction, not a workflow bug — use "Open with Google Docs" from the Drive file page, or download the file, to see it rendered.
- Airtable triggers poll at minimum 1-minute resolution; two invoices created in the same minute can race on invoice numbering.
- No retries/error handling in the workflows — a red execution in n8n's Executions tab is expected behavior on failure, not a bug to silently swallow.
- Single-user app, no auth, no cache — Airtable's API rate limit (~5 req/s) is the practical ceiling for a heavier dashboard.
- `npm run dev` runs `next dev --webpack` on purpose — Turbopack (Next.js 16's default) crashes on at least one Windows setup with `0xc0000142` while spawning the Node worker that evaluates `@tailwindcss/postcss`. Webpack mode avoids that code path entirely; no functional difference for this app.

## Status

**2026-09-22 (later same day) — submission hardening pass:**
- **Activated the workflows that were silently inactive** — WF1, WF3, WF4b, WF5, WF8, WF9, WF13
  were all `active: false` on the live instance despite the earlier note below claiming they'd
  been turned on; the production webhook (`WF13`) was therefore not actually responding. All
  seven are active now (WF4a stays off by design). WF6/WF7 have no trigger (manual-only), so
  activation doesn't apply to them.
- **Added WF0 (error handler)** and wired it as the Error Workflow on all 10 other workflows —
  any node failure anywhere now sends a Telegram alert to the owner with the workflow, node,
  error message and execution link.
- **Added a Hebrew sticky note to every workflow** describing its trigger and logic — the n8n
  canvas is now self-documenting, matching what a grader would expect to see.
- **Seeded real demo data** in Airtable: 10 more products (13 total, was 3), 6 leads (including
  one deliberate duplicate email to exercise WF3's dedup path), 2 invoices (to exercise WF1→WF8
  live), and 3 tasks. Leads/Invoices tables were completely empty before this.
- Re-exported all 11 workflows from the live instance into `workflows/` so the repo matches
  production exactly, and added `docs/`, `policies/`, `data/`, `scripts/smoke-test.mjs`.
- Ran `node scripts/smoke-test.mjs`: Airtable reachable, and the WF13 webhook's `chat` action
  returned a real RAG-backed answer end-to-end.
- **Found and fixed a real WF3 bug while live-testing with seeded data**: the dedup-counting
  node was a Summarize node with `outputFormat: singleItem`, which collapses every item in an
  Airtable-trigger poll batch into one summary row. With exactly one new lead per poll (the only
  case anyone had tested) this happened to work; with 2+ leads landing in the same polling minute
  it failed with `pairedItemMultipleMatches` and left every lead in that batch with no Status.
  Reproduced live with 5 simultaneous leads, replaced the Summarize node with a Code node that
  counts matches per originating item via `pairedItem`, redeployed to the live workflow, and
  re-seeded the same 5 leads — all correctly marked `New`, and a 6th duplicate-email lead
  correctly marked `Duplicate`.
- **Found WF8's Google Drive credential has expired** (OAuth needs reconnecting) — it was
  erroring on every 1-minute run since the workflow was activated, and WF0 correctly fired a
  Telegram alert each time (~13 alerts landed on the manager bot — expected proof the error
  handler works, but worth clearing before a demo). **Deactivated WF8** to stop the error loop
  until the credential is reconnected by hand in the n8n UI (OAuth requires interactive login,
  which this session can't do) — see the root [README's known-limitations section](../README.md).
  The 2 seeded invoices are sitting in `ValidatedQueued`, ready to be picked up the moment WF8
  is reactivated.
- **User reconnected the Google Drive credential and reactivated WF8 manually** — the resulting
  file was raw HTML markup displayed as plain text instead of a rendered page. Root cause
  investigated: the Google Drive node used `createFromText`, which always uploads as
  `text/plain` regardless of the `.html` filename. Fixed by inserting a **Convert to File** node
  (`toText`, explicit `options.mimeType: "text/html"`) before the Drive node and switching it
  from `createFromText` to `upload` (binary) — this part of the fix is real and live (verified:
  downloading a newly-generated file and opening it locally renders correctly as formatted RTL
  Hebrew HTML).
- **2026-09-22, later still — corrected an inaccurate claim above**: re-tested live and found
  Drive's own in-browser preview *still* shows raw source for the regenerated files too — turns
  out Google Drive does not render arbitrary uploaded `.html` files inline in its preview **at
  all**, independent of the declared MIME type. That's a Drive platform restriction (a phishing/
  XSS protection), not something WF8 can fix. The earlier claim that this was "fixed and
  verified live" was wrong about the visible symptom — it verified the file content and MIME
  type, not what Drive's preview pane actually renders. Requeued the 2 seeded invoices to
  `ValidatedQueued` again; WF8 regenerated them with new file IDs (old broken-preview files are
  still in Drive and safe to delete). Updated the root README's known-limitations section with
  the accurate explanation and the workaround (download the file, or "Open with Google Docs").

Last verified end-to-end 2026-09-22 (earlier pass): full chain re-tested live (not just read from code) —
- **n8n**: found and fixed two real bugs — WF3's duplicate-check counted the new lead against itself, so every lead (including the first ever) was wrongly marked `Duplicate` and never reached the sales pipeline (now requires >1 match); WF8's Google Drive upload node had an empty `folderId`, causing every invoice upload to 404 (now points at Drive root). Activated WF1, WF3, WF4b, WF5, WF8, WF9, WF13 (WF4a intentionally left off — it emails real leads on a schedule, pending a decision to enable it; WF6/WF7 correctly stay manual-only).
- **RAG**: confirmed live via a real chat query — the policy and product vector stores are both populated and answering correctly right now. Still re-run WF6 then WF7 manually right before any demo, since a restart wipes them silently.
- **App**: fixed two local setup bugs — `.env.local` was sitting one directory up from where Next.js actually reads it (`app/.env.local` was missing entirely), and `app/node_modules` didn't exist (only the wrong directory had one, from an earlier incomplete restructure). Both fixed; `npm install` now works from `app/` as documented above.
- **End-to-end through the actual UI**: dashboard loads real Airtable data, and the chat page got a real RAG-backed answer through the full path (browser → this app → WF13 webhook → agent → reply rendered on screen).

Previous note (2026-09-17): migrated n8n from n8n Cloud to a self-hosted Docker instance, webhook URL updated. See the project checklist artifact for the full build log.
