# After Class Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a complete After Class marketing website (Home, Partners, Contact, Privacy) on `afterclassapp.com` plus a dedicated waitlist experience on `join.afterclassapp.com`, serving two audiences (students and local business partners) with forms backed by Supabase.

**Architecture:** Single Next.js 15 App Router project. Marketing pages live under `app/(marketing)/`. The waitlist page lives at `app/(waitlist)/waitlist/page.tsx` and is served on the `join.*` subdomain via `middleware.ts` hostname rewrite. Shared design tokens, SN Pro + Open Sauce Two fonts, and background-layer visuals unify both surfaces. Home uses an asymmetric nextdecade-inspired layout (type left, visuals right). Server Actions + Zod validate and persist waitlist, partner, and contact submissions to Supabase.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, OKLCH CSS variables, SN Pro + Open Sauce Two (self-hosted), Framer Motion, Zod, Supabase (Postgres), Vitest, Vercel

## Global Constraints

- **Tagline:** `"The first move is showing up"` — exact string; always paired with **After Class** wordmark in the official lockup (never standalone as sole hero identity)
- **Logo mark:** butterfly icon — salmon fill `#F39394`, white outline + wing spots; see Design Preferences
- **Wordmark lockup:** salmon `#F39394` rounded container, white wordmark + white tagline stacked — see Design Preferences
- **Fonts:** SN Pro + Open Sauce Two — self-host all weights via `next/font/local`; no Google Fonts substitute
- **Public copy location:** all marketing strings in `lib/content.ts` or `lib/*-content.ts` — never in gitignored `company/`
- **UX copy:** no em dashes in user-facing text
- **Colors:** locked hex palette in `lib/brand-tokens.ts`, converted to OKLCH for CSS; body text contrast ≥ 4.5:1
- **Anti-slop:** no side-stripe borders, gradient text, ghost-card shadows; cream (`#FEF9E6`) is an intentional brand text color on maroon, not a generic body default
- **Layout reference:** nextdecade.com — asymmetric left-type / right-visual; do NOT use ASCII art; keep mood-board layers (arcs, grain, map pins, phone)
- **Waitlist fields:** email only (required) — no campus/school input on the site
- **Partner form fields:** business name, location/campus area, contact email, optional message
- **Contact form fields:** name, email, subject, message
- **Domains:** `afterclassapp.com` (marketing) · `join.afterclassapp.com` (waitlist)
- **Contact/privacy email:** `info@afterclassapp.com`
- **Pages (main domain):** Home, For Partners, Contact, Privacy — each its own route, no long-scroll mega-page
- **Waitlist domain:** `join.afterclassapp.com` → waitlist page only; Home links out via CTA button
- **Launch mode:** ship all pages at once
- **Secrets:** no `.env` values committed; use `.env.local` for Supabase keys

---

## Design Preferences (locked)

### Layout reference: nextdecade (layout only)

Adapt the [nextdecade](https://nextdecade.com) landing structure — not its content or ASCII map:

| Element | nextdecade | After Class adaptation |
|---------|------------|------------------------|
| Grid | Asymmetric: copy left, graphic right | WordmarkLockup + subline + CTA left; mood-board layers right |
| Background | Solid committed color field | Primary maroon `#4A1525` full bleed |
| Type | Large left-aligned headline | Salmon pill lockup: "After Class" + tagline |
| Body | Smaller paragraph under headline | Subline + proof lines |
| CTA | Underlined text link | Standard button to `join.afterclassapp.com` (not terminal-style) |
| Right visual | ASCII character art | Arcs, grain, dashed pin path, phone mockup (mood board) |
| Logo | Small, top-left | Butterfly mark + "After Class" cream wordmark (no pill) |
| Hero identity | Butterfly + WordmarkLockup stack | Mark above salmon pill, left column |

### Wordmark + tagline lockup (locked)

Official brand unit from user asset — implement as `WordmarkLockup` component:

```
┌─────────────────────────────────────┐
│  rounded-2xl bg primary-salmon      │
│                                     │
│         After Class                 │  ← SN Pro Bold or Open Sauce Two Bold, white, ~28–32px
│   The first move is showing up      │  ← Open Sauce Two Regular, white, ~16–19px
│                                     │
└─────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Container | `background: #F39394`, `border-radius: 1rem–1.5rem`, generous padding |
| Wordmark text | `"After Class"` — Title Case, white, bold sans |
| Tagline text | `"The first move is showing up"` — sentence case, Open Sauce Two Regular, white |
| Alignment | Centered within container |
| Variants | `hero` (large), `header` (compact, wordmark only or smaller lockup), `og` (static export) |

Reference asset path: `assets/.../image-b90f8075-9dfd-40cc-8af3-b87b0f1729da.png`

Build lockup in HTML/CSS + brand fonts (not a raster image) so it scales cleanly. Export static PNG from same component for OG/favicon if needed.

### Logo mark — butterfly (locked)

Official icon from user asset — stylized butterfly / bow shape:

| Property | Value |
|----------|-------|
| Fill | `#F39394` (primary salmon) |
| Stroke | White, thick rounded outline |
| Wing spots | 4 white circles (2 large upper, 2 small lower) |
| Style | Symmetrical, soft/bubbly, no sharp corners |
| Source asset | `assets/.../Group_136-2f2596c0-9fbe-47bd-8677-0c0316c0e084.png` |

Implement as `components/logo-mark.tsx` — recreate as inline SVG (preferred) or optimized `public/logo-mark.svg` traced from asset. Do not stretch raster PNG in production.

**Placement (locked — design recommendation):**

| Surface | Treatment |
|---------|-----------|
| **Header** | Butterfly (32px) + "After Class" cream wordmark, horizontal row, left-aligned |
| **Home hero** | Butterfly (64–80px) centered above `WordmarkLockup` pill — adds personality without altering approved lockup |
| **Waitlist** | Same stack as hero: butterfly → lockup → form |
| **Favicon** | Butterfly mark only (`app/icon.png` 32×32 and 180×180 apple-touch) |
| **OG image** | Butterfly + WordmarkLockup on maroon background |
| **Inside salmon pill** | No — keep pill text-only per wordmark+tagline asset |

---

| Token | Hex | Role |
|-------|-----|------|
| `primary-maroon` | `#4A1525` | Page background, dominant surface |
| `primary-salmon` | `#F39394` | CTA buttons, accents, focus rings |
| `cream` | `#FEF9E6` | Primary text on dark backgrounds |
| `charcoal` | `#2E2E2E` | Dark text on light surfaces (forms, cards) |
| `dusty-rose` | `#B07386` | Secondary accents, pin icons, decorative strokes |
| `grey` | `#757575` | Muted text, placeholders |
| `olive` | `#5F8651` | Success states, optional trust badges |
| `white` | `#FFFFFF` | Form inputs, high-contrast UI surfaces |

**Default page pairing:** maroon background + cream foreground. Form fields use white backgrounds with charcoal text.

### Typography (locked)

| Role | Font | Size / Weight | Usage |
|------|------|---------------|-------|
| Hero lockup | Open Sauce Two + SN Pro | Wordmark bold ~28–32px; tagline Regular ~16–19px inside salmon pill |
| Title 1 | SN Pro | 32px Bold | Page titles (Partners, Contact, Privacy) |
| Title 2 | SN Pro | 24px Semibold | Section headers |
| Header | Open Sauce Two | 28px Bold | Nav, card headers |
| Body | Open Sauce Two | 19px Regular | Paragraphs, descriptions |
| Body 2 | Open Sauce Two | 15px Bold | Labels, emphasis |
| Subtext | SN Pro | 22px Regular | Large supporting lines under hero |
| Subtext 2 | Open Sauce Two | 16px Bold | Footer, small CTAs |
| Muted | Open Sauce Two | 19px Regular at `grey` color | Secondary copy |

Font files required in `public/fonts/`:
- `sn-pro/SNPro-Regular.woff2`, `SNPro-Semibold.woff2`, `SNPro-Bold.woff2`
- `open-sauce-two/OpenSauceTwo-Regular.woff2`, `OpenSauceTwo-Bold.woff2`

---

## File Structure

```
app/
  layout.tsx                         # Root: fonts, metadata defaults, providers
  globals.css                        # OKLCH token CSS variables
  (marketing)/
    layout.tsx                       # SiteHeader + SiteFooter wrapper
    page.tsx                         # Home
    partners/page.tsx                # For Partners + form
    contact/page.tsx                 # Contact + form
    privacy/page.tsx                 # Privacy policy
  (waitlist)/
    layout.tsx                       # Minimal chrome for join subdomain
    waitlist/page.tsx                # Waitlist hero + form
  actions/
    waitlist.ts                      # submitWaitlist Server Action
    partner.ts                       # submitPartnerInterest Server Action
    contact.ts                       # submitContact Server Action
components/
  site-header.tsx                    # Logo, nav links, Join waitlist CTA → join subdomain
  site-footer.tsx                    # Privacy link, copyright
  background-layers.tsx              # Arcs, grain, pins, phone (shared visual)
  logo-mark.tsx                      # Butterfly SVG icon (sm/md/lg sizes)
  wordmark-lockup.tsx                # After Class + tagline in salmon pill (hero/header variants)
  hero-intro.tsx                     # LogoMark + lockup + subline + CTAs
  proof-lines.tsx                    # Verified / Planned / Local
  forms/
    waitlist-form.tsx
    partner-form.tsx
    contact-form.tsx
    form-field.tsx                   # Shared label + error wrapper
  ui/
    button.tsx
    input.tsx
lib/
  content.ts                         # All public marketing copy
  brand-tokens.ts                    # OKLCH color constants + CSS var map
  validations/
    waitlist.ts
    partner.ts
    contact.ts
  supabase/
    server.ts                        # createServerClient for Server Actions
  utils/
    get-site-url.ts                  # Returns marketing vs waitlist base URL
middleware.ts                        # join.* → /waitlist rewrite
public/
  fonts/sn-pro/SNPro-Regular.woff2
  fonts/sn-pro/SNPro-Semibold.woff2
  fonts/sn-pro/SNPro-Bold.woff2
  fonts/open-sauce-two/OpenSauceTwo-Regular.woff2
  fonts/open-sauce-two/OpenSauceTwo-Bold.woff2
  logo-mark.svg                      # Butterfly icon (from user asset)
  favicon/                           # Generated from logo mark
tests/
  lib/validations/waitlist.test.ts
  lib/validations/partner.test.ts
  lib/validations/contact.test.ts
  lib/utils/get-site-url.test.ts
DESIGN.md                            # Tokens, spacing, motion rules
PRODUCT.md                           # Brand register, tone, anti-references
supabase/migrations/
  20260806120000_create_submissions.sql
```

---

### Task 1: Project Scaffold and Tooling

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`
- Create: `.env.example`
- Create: `.gitignore` (merge with existing)

**Interfaces:**
- Produces: runnable `npm run dev`, `npm test`, `npm run build`

- [ ] **Step 1: Initialize Next.js 15 with TypeScript and Tailwind**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

When prompted about existing files, allow merge; preserve `.cursor/` and `reference/`.

- [ ] **Step 2: Add dependencies**

Run:
```bash
npm install zod framer-motion @supabase/supabase-js
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create `.env.example`**

```bash
NEXT_PUBLIC_SITE_URL=https://afterclassapp.com
NEXT_PUBLIC_WAITLIST_URL=https://join.afterclassapp.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 5: Verify scaffold**

Run: `npm run build`
Expected: PASS (empty Next.js app builds)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs vitest.config.ts .env.example
git commit -m "chore: scaffold Next.js 15 with Vitest and core deps"
```

---

### Task 2: Brand Tokens, Fonts, and Global Styles

**Files:**
- Create: `lib/brand-tokens.ts`
- Create: `lib/typography.ts`
- Create: `app/globals.css`
- Create: `app/fonts.ts`
- Create: `public/fonts/sn-pro/` and `public/fonts/open-sauce-two/` (all weights from brand kit)
- Create: `public/logo-mark.svg` (trace from user PNG asset)
- Create: `components/logo-mark.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `brandTokens`, `typographyScale`, `snPro` + `openSauceTwo` font variables
- CSS vars: `--color-primary-maroon`, `--color-primary-salmon`, `--color-cream`, `--color-charcoal`, `--color-dusty-rose`, `--color-grey`, `--color-olive`, `--color-white`

- [ ] **Step 1: Add font files**

Place brand kit font files:
- `public/fonts/sn-pro/SNPro-Regular.woff2`
- `public/fonts/sn-pro/SNPro-Semibold.woff2`
- `public/fonts/sn-pro/SNPro-Bold.woff2`
- `public/fonts/open-sauce-two/OpenSauceTwo-Regular.woff2`
- `public/fonts/open-sauce-two/OpenSauceTwo-Bold.woff2`

- [ ] **Step 2: Create `app/fonts.ts`**

```typescript
import localFont from 'next/font/local'

export const snPro = localFont({
  src: [
    { path: '../public/fonts/sn-pro/SNPro-Regular.woff2', weight: '400' },
    { path: '../public/fonts/sn-pro/SNPro-Semibold.woff2', weight: '600' },
    { path: '../public/fonts/sn-pro/SNPro-Bold.woff2', weight: '700' },
  ],
  variable: '--font-sn-pro',
  display: 'swap',
})

export const openSauceTwo = localFont({
  src: [
    { path: '../public/fonts/open-sauce-two/OpenSauceTwo-Regular.woff2', weight: '400' },
    { path: '../public/fonts/open-sauce-two/OpenSauceTwo-Bold.woff2', weight: '700' },
  ],
  variable: '--font-open-sauce-two',
  display: 'swap',
})
```

- [ ] **Step 3: Create `lib/brand-tokens.ts`**

```typescript
export const brandTokens = {
  primaryMaroon: '#4A1525',
  primarySalmon: '#F39394',
  cream: '#FEF9E6',
  charcoal: '#2E2E2E',
  dustyRose: '#B07386',
  grey: '#757575',
  olive: '#5F8651',
  white: '#FFFFFF',
} as const

/** OKLCH equivalents for CSS — computed at build, hex is source of truth */
export const brandTokensOklch = {
  primaryMaroon: 'oklch(0.28 0.08 15)',
  primarySalmon: 'oklch(0.78 0.10 20)',
  cream: 'oklch(0.98 0.03 95)',
  charcoal: 'oklch(0.30 0 0)',
  dustyRose: 'oklch(0.58 0.06 5)',
  grey: 'oklch(0.55 0 0)',
  olive: 'oklch(0.55 0.10 140)',
  white: 'oklch(1 0 0)',
} as const
```

- [ ] **Step 4: Create `lib/typography.ts`**

```typescript
export const typography = {
  heroTagline: 'clamp(2.5rem, 6vw, 4rem)',
  title1: '2rem',      // 32px SN Pro Bold
  title2: '1.5rem',    // 24px SN Pro Semibold
  header: '1.75rem',   // 28px Open Sauce Two Bold
  body: '1.1875rem',   // 19px Open Sauce Two Regular
  body2: '0.9375rem',  // 15px Open Sauce Two Bold
  subtext: '1.375rem', // 22px SN Pro Regular
  subtext2: '1rem',    // 16px Open Sauce Two Bold
} as const
```

- [ ] **Step 5: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary-maroon: oklch(0.28 0.08 15);
  --color-primary-salmon: oklch(0.78 0.10 20);
  --color-cream: oklch(0.98 0.03 95);
  --color-charcoal: oklch(0.30 0 0);
  --color-dusty-rose: oklch(0.58 0.06 5);
  --color-grey: oklch(0.55 0 0);
  --color-olive: oklch(0.55 0.10 140);
  --color-white: oklch(1 0 0);
}

body {
  background: var(--color-primary-maroon);
  color: var(--color-cream);
  font-family: var(--font-open-sauce-two), system-ui, sans-serif;
  font-size: 1.1875rem;
}

.font-sn-pro { font-family: var(--font-sn-pro), system-ui, sans-serif; }
.font-open-sauce { font-family: var(--font-open-sauce-two), system-ui, sans-serif; }
```

- [ ] **Step 6: Wire fonts in `app/layout.tsx`**

```typescript
import { snPro, openSauceTwo } from './fonts'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${snPro.variable} ${openSauceTwo.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add app/fonts.ts app/globals.css app/layout.tsx lib/brand-tokens.ts lib/typography.ts public/fonts/
git commit -m "feat: add SN Pro and Open Sauce Two with locked brand palette"
```

---

### Task 3: Marketing Copy and Validation Schemas

**Files:**
- Create: `lib/content.ts`
- Create: `lib/validations/waitlist.ts`
- Create: `lib/validations/partner.ts`
- Create: `lib/validations/contact.ts`
- Create: `tests/lib/validations/waitlist.test.ts`
- Create: `tests/lib/validations/partner.test.ts`
- Create: `tests/lib/validations/contact.test.ts`

**Interfaces:**
- Produces: `siteContent`, `waitlistSchema`, `partnerSchema`, `contactSchema`
- Types: `WaitlistInput`, `PartnerInput`, `ContactInput` (inferred from Zod)

- [ ] **Step 1: Write failing waitlist validation test**

Create `tests/lib/validations/waitlist.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { waitlistSchema } from '@/lib/validations/waitlist'

describe('waitlistSchema', () => {
  it('accepts valid email', () => {
    const result = waitlistSchema.safeParse({
      email: 'student@university.edu',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = waitlistSchema.safeParse({
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty email', () => {
    const result = waitlistSchema.safeParse({
      email: '',
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/validations/waitlist.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement validations and content**

Create `lib/validations/waitlist.ts`:
```typescript
import { z } from 'zod'

export const waitlistSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export type WaitlistInput = z.infer<typeof waitlistSchema>
```

Create `lib/validations/partner.ts`:
```typescript
import { z } from 'zod'

export const partnerSchema = z.object({
  businessName: z.string().min(2, 'Enter your business name'),
  location: z.string().min(2, 'Enter your location or campus area'),
  email: z.string().email('Enter a valid email address'),
  message: z.string().max(1000).optional(),
})

export type PartnerInput = z.infer<typeof partnerSchema>
```

Create `lib/validations/contact.ts`:
```typescript
import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email address'),
  subject: z.string().min(3, 'Enter a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type ContactInput = z.infer<typeof contactSchema>
```

Create `lib/content.ts`:
```typescript
export const siteContent = {
  tagline: 'The first move is showing up',
  subline: 'Every other app gets you a match. After Class gets you a date.',
  proofLines: [
    'Real students. Verified before you meet.',
    'A meetup on the calendar, not another week of texting.',
    'Meet at coffee shops and spots we partner with near campus.',
  ],
  nav: {
    home: 'Home',
    partners: 'For Partners',
    contact: 'Contact',
    joinWaitlist: 'Join the waitlist',
  },
  waitlist: {
    title: 'Join the waitlist',
    emailPlaceholder: 'Your email',
    submit: 'Join the waitlist',
    success: "You're in. We'll email you when After Class opens.",
    duplicate: "You're already on the list.",
  },
  partners: {
    title: 'Partner with After Class',
    description:
      'We send students to real local spots near campus. Join our partner network.',
    submit: 'Submit interest',
    success: "Thanks. We'll be in touch soon.",
  },
  contact: {
    title: 'Contact us',
    submit: 'Send message',
    success: 'Message sent. We will get back to you soon.',
  },
} as const
```

- [ ] **Step 4: Add partner and contact tests**

Create `tests/lib/validations/partner.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { partnerSchema } from '@/lib/validations/partner'

describe('partnerSchema', () => {
  it('accepts valid partner submission', () => {
    const result = partnerSchema.safeParse({
      businessName: 'Campus Coffee Co',
      location: 'Austin, TX',
      email: 'owner@coffee.com',
      message: 'Interested in partnering',
    })
    expect(result.success).toBe(true)
  })
})
```

Create `tests/lib/validations/contact.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { contactSchema } from '@/lib/validations/contact'

describe('contactSchema', () => {
  it('rejects short messages', () => {
    const result = contactSchema.safeParse({
      name: 'Alex',
      email: 'alex@test.com',
      subject: 'Hello',
      message: 'Hi',
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 5: Run all validation tests**

Run: `npm test`
Expected: PASS (all validation tests)

- [ ] **Step 6: Commit**

```bash
git add lib/content.ts lib/validations/ tests/lib/validations/
git commit -m "feat: add site content and Zod validation schemas"
```

---

### Task 4: Site URL Utility and Subdomain Middleware

**Files:**
- Create: `lib/utils/get-site-url.ts`
- Create: `middleware.ts`
- Create: `tests/lib/utils/get-site-url.test.ts`

**Interfaces:**
- Produces: `getMarketingUrl()`, `getWaitlistUrl()`, `getJoinWaitlistHref()`
- Middleware rewrites `join.*` host to `/waitlist` route

- [ ] **Step 1: Write failing site URL test**

Create `tests/lib/utils/get-site-url.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getMarketingUrl, getWaitlistUrl } from '@/lib/utils/get-site-url'

describe('get-site-url', () => {
  const original = process.env

  beforeEach(() => {
    process.env = {
      ...original,
      NEXT_PUBLIC_SITE_URL: 'https://afterclassapp.com',
      NEXT_PUBLIC_WAITLIST_URL: 'https://join.afterclassapp.com',
    }
  })

  afterEach(() => {
    process.env = original
  })

  it('returns marketing URL', () => {
    expect(getMarketingUrl()).toBe('https://afterclassapp.com')
  })

  it('returns waitlist URL', () => {
    expect(getWaitlistUrl()).toBe('https://join.afterclassapp.com')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/utils/get-site-url.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement utility**

Create `lib/utils/get-site-url.ts`:
```typescript
export function getMarketingUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

export function getWaitlistUrl(): string {
  return process.env.NEXT_PUBLIC_WAITLIST_URL ?? 'http://join.localhost:3000'
}

export function getJoinWaitlistHref(): string {
  return getWaitlistUrl()
}
```

- [ ] **Step 4: Create middleware**

Create `middleware.ts`:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const isWaitlistHost = host.startsWith('join.') || host.startsWith('join.localhost')

  if (isWaitlistHost) {
    const url = request.nextUrl.clone()
    if (!url.pathname.startsWith('/waitlist')) {
      url.pathname = `/waitlist${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/utils/get-site-url.ts middleware.ts tests/lib/utils/get-site-url.test.ts
git commit -m "feat: add subdomain middleware and site URL helpers"
```

---

### Task 5: Shared Layout Components (Header, Footer, Background Layers)

**Files:**
- Create: `components/site-header.tsx`
- Create: `components/site-footer.tsx`
- Create: `components/logo-mark.tsx`
- Create: `components/wordmark-lockup.tsx`
- Create: `components/hero-intro.tsx`
- Create: `components/background-layers.tsx`
- Create: `components/proof-lines.tsx`
- Create: `app/(marketing)/layout.tsx`
- Remove: `components/hero-tagline.tsx` (superseded by wordmark lockup)

**Interfaces:**
- Consumes: `siteContent`, `getJoinWaitlistHref()`, brand tokens
- Produces: `LogoMark`, `WordmarkLockup`, `HeroIntro`, `SiteHeader`, `SiteFooter`, `BackgroundLayers`, `ProofLines`

- [ ] **Step 1: Build `LogoMark`**

Copy source PNG to repo for reference: `public/brand/logo-mark-source.png`

Create `components/logo-mark.tsx`:

```typescript
type LogoMarkSize = 'sm' | 'md' | 'lg'  // sm=32 header, md=48, lg=72-80 hero

interface LogoMarkProps {
  size?: LogoMarkSize
  className?: string
}

export function LogoMark({ size = 'md', className }: LogoMarkProps) {
  // Inline SVG or next/image src="/logo-mark.svg"
  // Fill: var(--color-primary-salmon), stroke + spots: white
}
```

Create `public/logo-mark.svg` by tracing the butterfly asset (symmetrical path, 4 white circle spots).

- [ ] **Step 2: Build `WordmarkLockup`**

Create `components/wordmark-lockup.tsx`:

```typescript
type WordmarkLockupVariant = 'hero' | 'header' | 'compact'

interface WordmarkLockupProps {
  variant?: WordmarkLockupVariant
  showTagline?: boolean  // header variant may hide tagline
}

export function WordmarkLockup({ variant = 'hero', showTagline = true }: WordmarkLockupProps) {
  // Container: bg-[var(--color-primary-salmon)] rounded-2xl px-8 py-6 text-center text-white
  // Wordmark: "After Class" — font-bold font-sn-pro (hero: text-2xl, header: text-lg)
  // Tagline: siteContent.tagline — font-open-sauce text-base (hero) / text-sm (header)
}
```

Match reference: white text on salmon pill, wordmark above tagline, centered.

- [ ] **Step 3: Build `BackgroundLayers`**

Create `components/background-layers.tsx` — positioned in the **right column** of the hero grid (not full-bleed behind text):
- SVG arc lines in `dusty-rose` at low opacity
- Subtle grain overlay
- Dashed path SVG with 3 map pin icons in `primary-salmon` / `dusty-rose`
- Phone silhouette offset right at 15% opacity
- Decorative strokes use brand palette only (no off-brand blues)

- [ ] **Step 4: Build `HeroIntro`**

Create `components/hero-intro.tsx` — left column content:
- `LogoMark size="lg"` centered above lockup
- `WordmarkLockup variant="hero"`
- Subline below lockup (SN Pro 22px, cream): `siteContent.subline`
- Primary CTA + secondary partner link

- [ ] **Step 5: Build `SiteHeader`**

Brand row: `LogoMark size="sm"` + `<span className="font-sn-pro font-bold text-cream">After Class</span>`
Nav links: Home, For Partners, Contact. CTA: Join waitlist → `getJoinWaitlistHref()`

- [ ] **Step 6: Build `SiteFooter`**

Copyright + link to `/privacy`

- [ ] **Step 7: Create marketing layout**

Create `app/(marketing)/layout.tsx` wrapping children with header + footer.

- [ ] **Step 8: Manual smoke test**

Run: `npm run dev`
Visit: `http://localhost:3000`
Expected: header/footer render without error (page may be empty)

- [ ] **Step 9: Commit**

```bash
git add components/ public/logo-mark.svg public/brand/ app/(marketing)/layout.tsx
git commit -m "feat: add butterfly LogoMark, WordmarkLockup, and hero intro"
```

---

### Task 6: Home Page

**Files:**
- Create: `app/(marketing)/page.tsx`
- Modify: `app/layout.tsx` (metadata)

**Interfaces:**
- Consumes: `HeroIntro`, `BackgroundLayers`, `ProofLines`, `WordmarkLockup`, `getJoinWaitlistHref()`, `siteContent`

- [ ] **Step 1: Implement Home page (nextdecade asymmetric layout)**

`app/(marketing)/page.tsx`:

```tsx
// Desktop: grid grid-cols-2 min-h-screen
// Left column: HeroIntro (WordmarkLockup + subline + CTAs)
// Right column: BackgroundLayers
// Mobile: stack — HeroIntro first, BackgroundLayers below
```

- Maroon full-bleed background
- Primary CTA: salmon `#F39394` button, cream text → `getJoinWaitlistHref()`
- Secondary link: "Partner with us" → `/partners`, underlined cream text
- No inline waitlist form on Home
- `ProofLines` as separate section below hero (SN Pro subtext scale)

- [ ] **Step 2: Add page metadata**

```typescript
export const metadata = {
  title: 'After Class — The first move is showing up',
  description:
    'Every other app gets you a match. After Class gets you a date. Verified students, planned meetups, local spots near campus.',
}
```

- [ ] **Step 3: Verify responsive layout**

Run: `npm run dev`
Check: mobile (375px) and desktop (1280px) — tagline readable, CTA tappable

- [ ] **Step 4: Commit**

```bash
git add app/(marketing)/page.tsx app/layout.tsx
git commit -m "feat: add Home page with layered hero and waitlist CTA"
```

---

### Task 7: Form UI Components

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/forms/form-field.tsx`

**Interfaces:**
- Produces: `Button`, `Input`, `FormField`

- [ ] **Step 1: Build base Input and Button**

Styled with Tailwind using `var(--color-surface)`, `var(--color-accent)` focus ring.

- [ ] **Step 2: Build FormField wrapper**

Renders label, child input, and error message with `role="alert"`.

- [ ] **Step 3: Commit**

```bash
git add components/ui/ components/forms/
git commit -m "feat: add form UI primitives"
```

---

### Task 8: Supabase Schema and Server Client

**Files:**
- Create: `supabase/migrations/20260806120000_create_submissions.sql`
- Create: `lib/supabase/server.ts`

**Interfaces:**
- Produces: `createSupabaseServerClient()` returning Supabase client with service role for inserts
- Tables: `waitlist_signups`, `partner_interests`, `contact_messages`

- [ ] **Step 1: Write migration SQL**

Create `supabase/migrations/20260806120000_create_submissions.sql`:
```sql
create table waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table partner_interests (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  location text not null,
  email text not null,
  message text,
  created_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 2: Apply migration via Supabase MCP or CLI**

Run migration against project. Verify tables exist.

- [ ] **Step 3: Create server client**

Create `lib/supabase/server.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key, { auth: { persistSession: false } })
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/ lib/supabase/
git commit -m "feat: add Supabase schema and server client"
```

---

### Task 9: Waitlist Server Action and Form

**Files:**
- Create: `app/actions/waitlist.ts`
- Create: `components/forms/waitlist-form.tsx`
- Create: `app/(waitlist)/layout.tsx`
- Create: `app/(waitlist)/waitlist/page.tsx`

**Interfaces:**
- Produces: `submitWaitlist(prevState, formData)` returning `{ ok: boolean; message: string }`
- Consumes: `waitlistSchema`, `createSupabaseServerClient()`, `siteContent`

- [ ] **Step 1: Implement server action**

Create `app/actions/waitlist.ts`:
```typescript
'use server'

import { waitlistSchema } from '@/lib/validations/waitlist'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type WaitlistActionState = { ok: boolean; message: string }

export async function submitWaitlist(
  _prev: WaitlistActionState,
  formData: FormData
): Promise<WaitlistActionState> {
  const parsed = waitlistSchema.safeParse({
    email: formData.get('email'),
  })
  if (!parsed.success) {
    return { ok: false, message: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('waitlist_signups').insert({
    email: parsed.data.email,
  })

  if (error?.code === '23505') {
    return { ok: true, message: "You're already on the list." }
  }
  if (error) {
    return { ok: false, message: 'Something went wrong. Try again.' }
  }

  return {
    ok: true,
    message: "You're in. We'll email you when After Class opens.",
  }
}
```

- [ ] **Step 2: Build WaitlistForm with useActionState**

Client component using `useActionState(submitWaitlist, initialState)` — email input, submit button, inline success/error.

- [ ] **Step 3: Build waitlist page**

`app/(waitlist)/waitlist/page.tsx`:
- Minimal layout: `LogoMark lg` + `WordmarkLockup hero` + `WaitlistForm`

`app/(waitlist)/layout.tsx`: minimal wrapper without marketing header.

- [ ] **Step 4: Test subdomain locally**

Add to `/etc/hosts` or use `join.localhost:3000` if supported.
Run: `npm run dev`
Visit: `http://join.localhost:3000`
Expected: waitlist page with form

- [ ] **Step 5: Commit**

```bash
git add app/actions/waitlist.ts app/(waitlist)/ components/forms/waitlist-form.tsx
git commit -m "feat: add waitlist page and server action on join subdomain"
```

---

### Task 10: Partners Page and Server Action

**Files:**
- Create: `app/actions/partner.ts`
- Create: `components/forms/partner-form.tsx`
- Create: `app/(marketing)/partners/page.tsx`

**Interfaces:**
- Produces: `submitPartnerInterest`, `PartnerForm`

- [ ] **Step 1: Implement partner server action**

Mirror waitlist pattern using `partnerSchema` and `partner_interests` table.

- [ ] **Step 2: Build PartnerForm**

Fields: businessName, location, email, message (optional textarea).

- [ ] **Step 3: Build partners page**

Title, description from `siteContent.partners`, form, success state.

- [ ] **Step 4: Manual test**

Submit form → row appears in Supabase `partner_interests`.

- [ ] **Step 5: Commit**

```bash
git add app/actions/partner.ts app/(marketing)/partners/ components/forms/partner-form.tsx
git commit -m "feat: add For Partners page and submission action"
```

---

### Task 11: Contact Page and Server Action

**Files:**
- Create: `app/actions/contact.ts`
- Create: `components/forms/contact-form.tsx`
- Create: `app/(marketing)/contact/page.tsx`

**Interfaces:**
- Produces: `submitContact`, `ContactForm`

- [ ] **Step 1: Implement contact server action**

Using `contactSchema` and `contact_messages` table.

- [ ] **Step 2: Build ContactForm**

Fields: name, email, subject, message.

- [ ] **Step 3: Build contact page**

- [ ] **Step 4: Manual test**

Submit → row in `contact_messages`.

- [ ] **Step 5: Commit**

```bash
git add app/actions/contact.ts app/(marketing)/contact/ components/forms/contact-form.tsx
git commit -m "feat: add Contact page and submission action"
```

---

### Task 12: Privacy Page

**Files:**
- Create: `app/(marketing)/privacy/page.tsx`
- Create: `lib/privacy-content.ts`

**Interfaces:**
- Produces: static privacy policy page

- [ ] **Step 1: Write privacy content**

Create `lib/privacy-content.ts` with sections: data collected (email from waitlist, partner/contact form fields), purpose, retention, contact email `info@afterclassapp.com`.

- [ ] **Step 2: Render privacy page**

Simple prose layout using Open Sauce Two, linked from footer.

- [ ] **Step 3: Commit**

```bash
git add app/(marketing)/privacy/ lib/privacy-content.ts
git commit -m "feat: add Privacy policy page"
```

---

### Task 13: Motion, Accessibility, and SEO

**Files:**
- Modify: `components/wordmark-lockup.tsx`
- Modify: `components/background-layers.tsx`
- Create: `app/opengraph-image.tsx` or `public/og.png`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add staggered lockup animation**

Framer Motion: wordmark fades in, then tagline, then subline; respect `prefers-reduced-motion`.

- [ ] **Step 2: Accessibility pass**

- All form inputs have `<label>` or `aria-label`
- Focus visible on all interactive elements
- Color contrast check on muted text

- [ ] **Step 3: Add favicon and OG metadata**

Use butterfly `LogoMark` for favicon (`app/icon.png`). OG image: LogoMark + WordmarkLockup on maroon.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS with no type errors

- [ ] **Step 5: Commit**

```bash
git add components/ app/opengraph-image.tsx public/
git commit -m "feat: add motion, a11y fixes, and SEO metadata"
```

---

### Task 14: Vercel Deploy and Domain Configuration

**Files:**
- Create: `vercel.json` (if needed for domain config)

- [ ] **Step 1: Deploy to Vercel**

Connect repo, set env vars from `.env.example`.

- [ ] **Step 2: Configure domains**

- `afterclassapp.com` → production
- `join.afterclassapp.com` → same project

- [ ] **Step 3: Verify both domains**

- `afterclassapp.com` → Home with CTA to join
- `join.afterclassapp.com` → Waitlist form
- `/partners`, `/contact`, `/privacy` all load

- [ ] **Step 4: Commit deploy docs**

Add deploy notes to README section if needed.

```bash
git commit -m "docs: add Vercel domain configuration notes"
```

---

## Self-Review Checklist

| Spec requirement | Task |
|------------------|------|
| Multi-page, no mega-scroll | Tasks 6, 10, 11, 12 |
| join.afterclassapp.com waitlist | Tasks 4, 9, 14 |
| Email-only waitlist | Tasks 3, 7, 9 |
| Partner interest form | Tasks 3, 10 |
| Contact form | Tasks 11 |
| Privacy page | Task 12 |
| Butterfly LogoMark + WordmarkLockup | Tasks 5, 6, 9, 13 |
| nextdecade asymmetric layout | Tasks 5, 6 |
| Locked brand palette | Task 2 |
| Mood-board layers (right column) | Task 5 |
| Supabase persistence | Tasks 8, 9, 10, 11 |
| Font files (SN Pro + Open Sauce Two) | Task 2 |
| WCAG / reduced motion | Task 13 |

**Placeholder scan:** No TBD steps. Brand palette and typography locked from user brand sheet.

**Type consistency:** All forms use Zod schemas → inferred types → Server Actions → Supabase inserts.

---

## Pending User Inputs

**All resolved for v1 launch:**

| Input | Value |
|-------|-------|
| Domain | `afterclassapp.com` · `join.afterclassapp.com` |
| Privacy/contact email | `info@afterclassapp.com` |
| Waitlist fields | Email only (no campus) |
| Fonts | Download Open Sauce Two + SN Pro during Task 2 |
| Brand assets | Butterfly logo, wordmark lockup, palette — received |

**Needed during execution only:** Supabase URL + keys in `.env.local` (Task 8)

---

## Counterpoint Note (scope change)

Expanding from waitlist-only to full site **accepts** higher build cost and longer ship time **in exchange for** partner recruitment surface, trust pages (Privacy, Contact), and cleaner conversion funnel (Home teases → join subdomain converts). **Risk:** splitting domains adds middleware/deploy complexity. **Revisit if:** waitlist conversion drops because Home no longer has inline form — monitor signup rate after launch.

**Confidence:** High (90%) — ready to execute; all v1 inputs locked.
