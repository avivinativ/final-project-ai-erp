#!/usr/bin/env node
// End-to-end health check: Airtable reachability + the n8n webhook (WF13) chat action.
// Run from the repo root: node scripts/smoke-test.mjs
// Reads env vars from app/.env.local (falls back to process.env).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", "app", ".env.local");

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const fileEnv = loadEnv(envPath);
const env = (key) => process.env[key] || fileEnv[key];

const AIRTABLE_PAT = env("AIRTABLE_PAT");
const AIRTABLE_BASE_ID = env("AIRTABLE_BASE_ID");
const N8N_WEBHOOK_URL = env("N8N_WEBHOOK_URL");

let failures = 0;

function report(name, ok, detail) {
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${detail ? " - " + detail : ""}`);
  if (!ok) failures++;
}

async function checkAirtable() {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    report("Airtable", false, "AIRTABLE_PAT / AIRTABLE_BASE_ID missing from app/.env.local");
    return;
  }
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Products?maxRecords=1`,
      { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } }
    );
    report("Airtable Products read", res.ok, `HTTP ${res.status}`);
  } catch (e) {
    report("Airtable Products read", false, e.message);
  }
}

async function checkN8nWebhookChat() {
  if (!N8N_WEBHOOK_URL) {
    report("n8n webhook", false, "N8N_WEBHOOK_URL missing from app/.env.local");
    return;
  }
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "chat", sessionId: "smoke-test", message: "מה שעות הפעילות שלכם?" }),
    });
    const body = await res.json().catch(() => null);
    const ok = res.ok && body && typeof body.reply === "string" && body.reply.length > 0;
    report("n8n webhook (WF13, action=chat)", ok, ok ? `reply: "${body.reply.slice(0, 60)}..."` : `HTTP ${res.status}`);
  } catch (e) {
    report("n8n webhook (WF13, action=chat)", false, e.message);
  }
}

await checkAirtable();
await checkN8nWebhookChat();

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exitCode = failures === 0 ? 0 : 1;
