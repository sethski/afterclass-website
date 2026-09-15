# After Class Design System

## Scene

Evening campus walk to a meetup: phone glow, lit storefronts, maroon night. Committed color field.

## References (spirit, not clones)

- **nextdecade:** one viewport, left type stack, right graphic identity, enter-key CTA, textured depth
- **Cursor Origin:** atmospheric streak + arcs, sparse waitlist hero, no clutter in first frame

## Color strategy: Committed

Maroon carries the surface. Salmon accents CTAs and brand. Cream for text on dark. OKLCH tokens in `app/globals.css`.

| Token | Hex | Role |
|-------|-----|------|
| primary-maroon | #4A1525 | Field background |
| primary-salmon | #F39394 | CTAs, logo fill |
| cream | #FEF9E6 | Text on maroon |
| charcoal | #2E2E2E | Text on light forms |
| dusty-rose | #B07386 | Soft streak hues |
| grey | #757575 | Placeholders |
| olive | #5F8651 | Success |
| white | #FFFFFF | Form surfaces |

## Typography

- **SN Pro:** Display headlines, section titles
- **Open Sauce Two:** Body, nav, CTAs

## Layout

- Home: asymmetric split (copy left, butterfly mark right), full-bleed `HeroField`
- Waitlist: Origin-style centered headline + form on the same field
- Inner routes: same field language, one job per page, no mega-scroll
- Header/footer float over the field (transparent)
- No cards in hero; no fake product UI; no ASCII maps

## Motion

- Field streak ease-in, arcs fade, mark scale-in
- Honor `prefers-reduced-motion`

## Shape scale

- Inputs / buttons: rounded-xl
- Enter-key CTA: small square key + underline text (nextdecade cue)
