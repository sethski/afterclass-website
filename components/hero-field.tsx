'use client'

import { motion, useReducedMotion } from 'motion/react'

/** Full-bleed field: Origin light streak + arcs, nextdecade depth via texture */
export function HeroField() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[var(--color-primary-maroon)]" />

      <motion.div
        className="absolute -left-1/4 top-[-20%] h-[90%] w-[90%] rotate-[-18deg]"
        style={{
          background:
            'linear-gradient(105deg, transparent 20%, oklch(0.55 0.12 20 / 0.35) 42%, oklch(0.72 0.12 25 / 0.45) 52%, oklch(0.45 0.08 350 / 0.25) 62%, transparent 78%)',
          filter: 'blur(40px)',
        }}
        initial={reduceMotion ? false : { opacity: 0.45, x: -40 }}
        animate={{ opacity: 0.7, x: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />

      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'radial-gradient(circle, oklch(0.98 0.03 95 / 0.9) 0.7px, transparent 0.8px)',
          backgroundSize: '16px 16px',
        }}
      />

      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <path
          d="M-80 720 C280 420 520 280 980 160"
          stroke="oklch(0.98 0.03 95 / 0.35)"
          strokeWidth="1.25"
        />
        <path
          d="M120 860 C420 560 720 360 1320 220"
          stroke="oklch(0.78 0.10 20 / 0.45)"
          strokeWidth="1"
        />
        <path
          d="M-40 200 C360 120 720 80 1500 40"
          stroke="oklch(0.98 0.03 95 / 0.18)"
          strokeWidth="1"
        />
      </motion.svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,oklch(0.22_0.06_15_/0.55)_100%)]" />
    </div>
  )
}
