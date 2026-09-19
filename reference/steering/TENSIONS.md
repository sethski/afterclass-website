# Tensions log

Append-only record of unresolved trade-offs surfaced by counterpoint-tier sessions.

Each entry documents a decision made DESPITE genuine tension — preserving the reasoning for future revisitation.

_Format: see `reference/AGENT.md` § Tension logging and `.cursor/harness/counterpoint.md` Stage 4._

---

## 2026-09-19 — Shared ops password instead of per-founder Supabase logins
Tension: accountability vs operational simplicity
Chose: one env password and a signed session cookie because only founders use this app
Risk accepted: anyone with the password is indistinguishable in reviewed_by / created_by
Revisit when: more than two people need access, or you need an audit trail of who changed a signup

## 2026-09-19 — Keep the public site at repo root instead of moving it to apps/web
Tension: monorepo purity vs blast radius
Chose: workspaces add apps/admin and packages/db beside the existing Next app because relocating every import would stall the ops backend
Risk accepted: two Next configs and a slightly unusual workspace layout
Revisit when: a second public app appears, or deploy tooling needs every app under apps/

## 2026-09-19 — Hash feedback tokens instead of storing the raw link
Tension: recoverability vs leak resistance
Chose: store sha256 hashes and let founders regenerate unused links, because the table already holds ID photos
Risk accepted: a lost unused link cannot be re-displayed, only replaced
Revisit when: founders need an audit log of every URL that was ever sent

## 2026-09-15 — Store face and school ID photos for a dry run
Tension: verification vs data minimization
Chose: collect both into a private Supabase bucket, paths only in `test_run_signups`, because the brief requires school-verified real people
Risk accepted: founders hold sensitive ID images for the testing period
Revisit when: testing ends, or a lighter verification method (school-domain email plus live check-in) is enough

