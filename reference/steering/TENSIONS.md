# Tensions log

Append-only record of unresolved trade-offs surfaced by counterpoint-tier sessions.

Each entry documents a decision made DESPITE genuine tension — preserving the reasoning for future revisitation.

_Format: see `reference/AGENT.md` § Tension logging and `.cursor/harness/counterpoint.md` Stage 4._

---

## 2026-09-15 — Store face and school ID photos for a dry run
Tension: verification vs data minimization
Chose: collect both into a private Supabase bucket, paths only in `test_run_signups`, because the brief requires school-verified real people
Risk accepted: founders hold sensitive ID images for the testing period
Revisit when: testing ends, or a lighter verification method (school-domain email plus live check-in) is enough

