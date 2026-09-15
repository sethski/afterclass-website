'use client'

import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { FlappingLogo } from '@/components/flapping-logo'

/**
 * home: S-curve through the open right field (stays clear of left copy).
 * waitlist: same flyer, upper-right arc (Origin dotted-corner spot).
 */
const PATHS = {
  home: 'M 96 82 C 88 92 78 88 72 78 C 64 64 70 48 78 38 C 86 26 72 16 58 12 C 48 9 40 8 34 6',
  // Upper-right diagonal: top-left → bottom-right (user's marked path)
  waitlist: 'M 52 6 C 64 14 78 28 92 44 C 96 50 100 56 104 62',
} as const

const DOT_COUNT = 72
const WAKE_LENGTH = 0.11

type Sample = { x: number; y: number; t: number }

function samplePath(path: SVGPathElement, count: number): Sample[] {
  const length = path.getTotalLength()
  const pts: Sample[] = []
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const dist = t * length
    const p = path.getPointAtLength(dist)
    pts.push({ x: p.x, y: p.y, t })
  }
  return pts
}

function DestinationDot({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        stroke="oklch(0.98 0.03 95 / 0.55)"
        strokeWidth="1.5"
      />
      <circle cx="8" cy="8" r="3.2" fill="oklch(0.98 0.03 95 / 0.9)" />
    </svg>
  )
}

interface HeroFlightProps {
  variant?: keyof typeof PATHS
  /** When false, layer stays hidden. Default true for home. */
  visible?: boolean
}

export function HeroFlight({
  variant = 'home',
  visible = true,
}: HeroFlightProps) {
  const reduceMotion = useReducedMotion()
  const pathRef = useRef<SVGPathElement>(null)
  const flyerRef = useRef<HTMLDivElement>(null)
  const pinsRef = useRef<(HTMLSpanElement | null)[]>([])
  const pathD = PATHS[variant]
  const logoSize = variant === 'waitlist' ? { w: 96, h: 69 } : { w: 128, h: 92 }

  useEffect(() => {
    if (!visible) return
    const path = pathRef.current
    const flyer = flyerRef.current
    if (!path || !flyer) return

    const length = path.getTotalLength()
    const sampled = samplePath(path, DOT_COUNT)

    sampled.forEach((s, i) => {
      const el = pinsRef.current[i]
      if (!el) return
      el.style.left = `${s.x}%`
      el.style.top = `${s.y}%`
      el.style.opacity = '0'
      el.style.transform = 'translate(-50%, -50%)'
    })

    const place = (t: number) => {
      const dist = Math.min(length, Math.max(0, t * length))
      const p = path.getPointAtLength(dist)
      const look = path.getPointAtLength(Math.min(length, dist + 2))
      const angle =
        (Math.atan2(look.y - p.y, look.x - p.x) * 180) / Math.PI + 90
      const opacity = t < 0.03 ? t / 0.03 : t > 0.96 ? (1 - t) / 0.04 : 1

      flyer.style.left = `${p.x}%`
      flyer.style.top = `${p.y}%`
      flyer.style.opacity = String(opacity)
      flyer.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`

      for (let i = 0; i < sampled.length; i++) {
        const el = pinsRef.current[i]
        if (!el) continue
        const pinT = sampled[i].t
        const behind = pinT <= t
        const inWake = behind && t - pinT <= WAKE_LENGTH
        let wakeOpacity = 0
        if (inWake) {
          const age = (t - pinT) / WAKE_LENGTH
          wakeOpacity = 0.75 * (1 - age)
        }
        el.style.opacity = String(wakeOpacity)
      }
    }

    if (reduceMotion) {
      place(0.45)
      return
    }

    place(0)
    const controls = animate(0, 1, {
      duration: 16,
      ease: 'linear',
      repeat: Infinity,
      repeatDelay: 1.6,
      onUpdate: place,
      onRepeat: () => {
        for (const el of pinsRef.current) {
          if (el) el.style.opacity = '0'
        }
      },
    })

    return () => controls.stop()
  }, [reduceMotion, visible, pathD])

  return (
    <div
      className={[
        'pointer-events-none absolute inset-0 z-[5] overflow-hidden transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        visible ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path ref={pathRef} d={pathD} fill="none" stroke="none" />
      </svg>

      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            pinsRef.current[i] = el
          }}
          className="absolute opacity-0"
        >
          <DestinationDot className="h-3 w-3 md:h-3.5 md:w-3.5" />
        </span>
      ))}

      <div
        ref={flyerRef}
        className="absolute will-change-transform"
        style={{
          left: variant === 'waitlist' ? '52%' : '96%',
          top: variant === 'waitlist' ? '6%' : '82%',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="drop-shadow-[0_12px_28px_oklch(0.22_0.06_15_/0.45)]">
          <FlappingLogo
            width={logoSize.w}
            height={logoSize.h}
            priority
          />
        </div>
      </div>
    </div>
  )
}
