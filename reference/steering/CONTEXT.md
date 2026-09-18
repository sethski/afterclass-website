# Project context

_Agent-maintained stable identity. Written on first-ever scan; patch only when wrong._

## Purpose

After Class marketing website for `afterclassapp.com`. Campus dating product positioning: verified students, planned meetups, partnered local spots. Tagline: "The first move is showing up."

Two public audiences on this deploy:

- Students (teased here; waitlist convert on `join.afterclassapp.com` in a separate repo)
- Local business partners (interest form on `/partners`)

Plus a private early-testing funnel at `/TestRun` (noindex).

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, Motion, Zod
- Supabase via service-role server client for partner, contact, and Test Run writes
- Vitest for unit tests
- Self-hosted fonts: SN Pro + Open Sauce Two

## Domains

| Host | Surface |
|------|---------|
| `afterclassapp.com` | This repo: Home, How it works, Partners, Contact, Privacy, `/TestRun` |
| `join.afterclassapp.com` | Waitlist — [afterclass-waitlist](https://github.com/sethski/afterclass-waitlist) |

## Constraints

- Counterpoint harness active (`.cursor/rules/counterpoint.mdc`)
- Public copy in `lib/content.ts` / `lib/*-content.ts` only; company strategy stays out of git
- No secrets in repo; use `.env.local`
- Design system: `PRODUCT.md` + `DESIGN.md` + `app/globals.css` (not unused `lib/brand-tokens.ts`)
- Production UI should follow Design / Impeccable guidance when shipping frontend

## Harness role

Counterpoint routes queries: ponytail (fast fixes), poteto (structured work), counterpoint (high-stakes trade-offs). Session memory lives in `reference/` (much of it gitignored).

## Working branch note

Local work branch for ongoing changes: `new-ac-form` (forked from `feat/afterclass-website` @ `56b633f`).
