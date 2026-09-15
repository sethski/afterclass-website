---
description: "Force a full reference-system rescan of the repo. Rebuilds CODEBASE.md and CONTEXT.md regardless of prompt count."
---

Force a **full context refresh** now.

Follow `reference/AGENT.md` mode `refresh_due` using the **full scan** procedure (not delta). Ignore the refresh-interval counter.

After the scan:
1. Write or update `reference/steering/CODEBASE.md` and `CONTEXT.md`
2. Append `reference/metrics/sessions.jsonl` with `trigger: manual`, `since_refresh: 0`
3. Rewrite `reference/metrics/state.md`
4. Proceed with normal routing for anything else in the user's message
