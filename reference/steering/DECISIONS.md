# Decision log

Append-only. Agent adds entries when significant architectural or tooling choices are made.

_Format: see `reference/AGENT.md` § Decision logging._

## 2026-08-06 — Counterpoint harness installed

Reason: User requested [sethski/counterpoint](https://github.com/sethski/counterpoint) for adversarial reasoning on high-stakes build decisions.
Alternatives considered: Plain Cursor rules only (rejected — no tiered routing or tension logging).

## 2026-09-19 — Apex /enlistment is an iframe, not a Tailwind port
Reason: Origin-replica `/join` uses CSS modules. Copying the enlistment wizard into that app would run Tailwind preflight over `/join`. The `/enlistment` route on origin-replica iframes `https://afterclass-website.vercel.app/enlistment`.
Alternatives considered: Native port into origin-replica (rejected — breaks `/join`). Attach `afterclassapp.com` to `afterclass-website` (rejected — this login does not own the domain; team `afterclass1` does).

## 2026-09-19 — Public funnel lives at /enlistment

Reason: User asked to name the live path enlistment instead of testrun. Middleware keeps `/TestRun`, `/testrun`, and `/test-run` as redirects.
Alternatives considered: Rename internal tables and env vars too (rejected — would churn the isolated DB for a public slug).

## 2026-09-19 — Test Run gets its own Supabase project

Reason: Signups, ID photos, matches, and dates should not live beside waitlist tables. User asked for a new database, not shared with waitlist.
Alternatives considered: Keep Test Run on `cstufvjugkilypfrcfym` (rejected — waitlist already lives there). Separate schema on the same project (rejected — still one database).

## 2026-09-19 — Test Run target is ufuwiimfcfixxeoumrmh, not afterclass-testrun

Reason: User asked for a new org/project and not the previous afterclass-testrun ref. Local and Vercel TEST_RUN_SUPABASE_URL now point at that project.
Alternatives considered: Keep writing to zxceirdaszrntpkdyflb (rejected).

## 2026-09-19 — Ops admin uses a shared password cookie, not Supabase Auth
Reason: Founders asked for password-only. A signed httpOnly cookie plus ADMIN_DASHBOARD_PASSWORD is enough for a two-person internal tool; table access still goes through the service-role server client.
Alternatives considered: Supabase Auth email allowlist (rejected this turn). Per-founder accounts (revisit when more than a couple of people need access).

## 2026-09-19 — Test Run ops lives in apps/admin with service-role data access
Reason: Founders need a separate app to review photos, pair people, pick cafes, and log dates. Public site stays at repo root. Admin authenticates with Supabase Auth and an email allowlist; table access stays on the service-role server client so RLS can keep anon/authenticated locked out.
Alternatives considered: /admin route on the marketing app (rejected — user asked for a separate app). Client-side RLS for authenticated founders (rejected — would reopen PII tables to the Data API).

## 2026-09-15 — Early testing lives at /TestRun, not Typeform.com or the waitlist
Reason: The brief pinned After Class type, hex, logo, cover line, and a route on this domain. Typeform cannot lock Open Sauce Two or the coral poster. Waitlist is email-only on join.afterclassapp.com.
Alternatives considered: Typeform embed (rejected — theme and font lock). Airtable as the primary store (rejected — this repo already writes through Supabase; founders can export).

