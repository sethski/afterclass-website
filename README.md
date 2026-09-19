# After Class Website

Marketing site for [After Class](https://afterclassapp.com).

**Tagline:** The first move is showing up

## Domains

| Host | Surface |
|------|---------|
| `afterclassapp.com` | Home, Partners, Contact, Privacy, `/enlistment` |
| `join.afterclassapp.com` | Waitlist — separate repo: [afterclass-waitlist](https://github.com/sethski/afterclass-waitlist) |

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS 4, Motion, Zod, Supabase (partner + contact on the marketing project; enlistment on its own project)

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

Waitlist lives on `join.afterclassapp.com` (separate repo and database). Do not put enlistment tables there.

| Project | Used for |
|---------|----------|
| Marketing (`NEXT_PUBLIC_SUPABASE_URL`) | Partner + contact forms |
| Enlistment (`TEST_RUN_SUPABASE_URL`) | `/enlistment` signups, ID photos, admin matching |

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TEST_RUN_SUPABASE_URL=https://ufuwiimfcfixxeoumrmh.supabase.co
TEST_RUN_SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WAITLIST_URL=https://join.afterclassapp.com
```

Paste the Test Run **service_role** key from the [Test Run API settings](https://supabase.com/dashboard/project/ufuwiimfcfixxeoumrmh/settings/api). Also set those two `TEST_RUN_*` vars on Vercel for the website and the admin app.

## Brand

See `PRODUCT.md` and `DESIGN.md`. Fonts: Open Sauce Two + SN Pro (self-hosted in `public/fonts/`).
