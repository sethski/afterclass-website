# After Class Website

Marketing site for [After Class](https://afterclassapp.com).

**Tagline:** The first move is showing up

## Domains

| Host | Surface |
|------|---------|
| `afterclassapp.com` | Home, Partners, Contact, Privacy |
| `join.afterclassapp.com` | Waitlist — separate repo: [afterclass-waitlist](https://github.com/sethski/afterclass-waitlist) |

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS 4, Motion, Zod, Supabase (partner + contact forms)

## Local development

```bash
npm install
cp .env.example .env.local
# Add Supabase keys to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Waitlist CTAs link to `NEXT_PUBLIC_WAITLIST_URL` (default `https://join.afterclassapp.com`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

## Supabase

Apply [`supabase/migrations/20260806120000_create_submissions.sql`](supabase/migrations/20260806120000_create_submissions.sql) to your marketing Supabase project (partner + contact tables only). Waitlist uses a separate Supabase project — see the waitlist repo.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WAITLIST_URL=https://join.afterclassapp.com
```

## Brand

See `PRODUCT.md` and `DESIGN.md`. Fonts: Open Sauce Two + SN Pro (self-hosted in `public/fonts/`).
