'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
/**
 * Origin-faithful 2:3 Lissajous line field, cream/salmon on After Class maroon.
 */

const LISSAJOUS = {
  freqX: 2,
  freqY: 3,
  radiusX: 3,
  radiusY: 2,
  segments: 1200,
  phase: 3 * Math.PI,
  scale: 1,
  solidFraction: 0.25,
  dash: [5, 7] as [number, number],
  dashSpeed: 12,
  lineWidth: 1,
  intro: {
    drawOnMs: 4400,
    dashDrawOnMs: 4400,
    dashOffscreenMs: 2400,
    dashOvershoot: 0.064,
    expandMs: 1600,
    expandDelayMs: 500,
    centerHeightFraction: 0.5,
  },
  anchor: { fromLeft: 0.1, fromBottom: 0.06 },
  mobile: {
    scale: 1.25,
    anchor: { fromLeft: -0.5, fromBottom: 0.1 },
    solidOnly: true,
  },
} as const

const TAU = 2 * Math.PI
const CFG = LISSAJOUS

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

type Bounds = { minX: number; maxX: number; minY: number; maxY: number }

function computeBounds(): Bounds {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i <= CFG.segments; i++) {
    const t = (i / CFG.segments) * TAU
    const x = CFG.radiusX * Math.sin(CFG.freqX * t)
    const y = CFG.radiusY * Math.sin(CFG.freqY * t)
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return { minX, maxX, minY, maxY }
}

const BOUNDS = computeBounds()

export function FieldLoops({
  className = '',
  active = true,
}: {
  className?: string
  /** When false, canvas stays blank (field not yet revealed). */
  active?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let start = 0
    let disposed = false
    let complete = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { clientWidth: w, clientHeight: h } = canvas
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const solidEnd = Math.ceil(CFG.segments * CFG.solidFraction)
    const overshootEnd =
      CFG.segments + Math.round(CFG.segments * CFG.intro.dashOvershoot)

    const point = (
      i: number,
      cx: number,
      cy: number,
      amp: number,
      ox: number,
      oy: number,
    ): [number, number] => {
      const t = (i / CFG.segments) * TAU
      return [
        cx + CFG.radiusX * Math.sin(CFG.freqX * t + CFG.phase) * amp + ox,
        cy + CFG.radiusY * Math.sin(CFG.freqY * t) * amp + oy,
      ]
    }

    const strokeRange = (
      from: number,
      to: number,
      cx: number,
      cy: number,
      amp: number,
      ox: number,
      oy: number,
    ) => {
      if (to <= from) return
      ctx.beginPath()
      const [x0, y0] = point(from, cx, cy, amp, ox, oy)
      ctx.moveTo(x0, y0)
      const last = Math.floor(to)
      for (let i = Math.floor(from) + 1; i <= last; i++) {
        const [x, y] = point(i, cx, cy, amp, ox, oy)
        ctx.lineTo(x, y)
      }
      if (to > last) {
        const [x, y] = point(to, cx, cy, amp, ox, oy)
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    const anchorOffset = (
      scale: number,
      cx: number,
      cy: number,
      width: number,
      height: number,
      anchor: { fromLeft: number; fromBottom: number },
    ): [number, number] => {
      const targetX = anchor.fromLeft * width
      const targetY = (1 - anchor.fromBottom) * height
      return [
        targetX - (cx + BOUNDS.minX * scale),
        targetY - (cy + BOUNDS.maxY * scale),
      ]
    }

    const render = (now: number) => {
      if (disposed) return
      if (start === 0) start = now
      const elapsed = now - start

      const width = canvas.width
      const height = canvas.height
      const dpr = canvas.clientWidth ? width / canvas.clientWidth : 1
      const mobile = window.matchMedia('(max-width: 767px)').matches
      const solidOnly = mobile
      const scale = mobile ? CFG.mobile.scale : CFG.scale
      const anchor = mobile ? CFG.mobile.anchor : CFG.anchor

      const solidDrawMs = CFG.intro.drawOnMs * CFG.solidFraction
      const fullProgress = solidOnly
        ? CFG.solidFraction
        : overshootEnd / CFG.segments

      let progress: number
      if (reduceMotion || complete) {
        progress = fullProgress
      } else if (elapsed < solidDrawMs) {
        progress = CFG.solidFraction * (elapsed / solidDrawMs)
      } else if (solidOnly) {
        progress = CFG.solidFraction
      } else {
        const dashElapsed = elapsed - solidDrawMs
        const dashBudget = CFG.intro.dashDrawOnMs + CFG.intro.dashOffscreenMs
        const dashT = Math.min(dashElapsed / dashBudget, 1)
        progress =
          CFG.solidFraction +
          (fullProgress - CFG.solidFraction) * easeOutExpo(dashT)
      }

      const expandT = reduceMotion
        ? 1
        : Math.min(
            Math.max(elapsed - CFG.intro.expandDelayMs, 0) /
              CFG.intro.expandMs,
            1,
          )
      const expand = easeOutExpo(expandT)

      const midX = (BOUNDS.minX + BOUNDS.maxX) / 2
      const midY = (BOUNDS.minY + BOUNDS.maxY) / 2
      const centerAmp =
        (CFG.intro.centerHeightFraction * height) /
        (BOUNDS.maxY - BOUNDS.minY)
      const finalAmp = Math.min(width, height) * scale
      const cx = 0.5 * width
      const cy = 0.5 * height
      const [finalOx, finalOy] = anchorOffset(
        finalAmp,
        cx,
        cy,
        width,
        height,
        anchor,
      )
      const startOx = -midX * centerAmp
      const startOy = -midY * centerAmp
      const ox = startOx + (finalOx - startOx) * expand
      const oy = startOy + (finalOy - startOy) * expand
      const amp = centerAmp + (finalAmp - centerAmp) * expand
      const dashOffset = (elapsed / 1000) * CFG.dashSpeed * dpr

      const solidCap = CFG.segments * CFG.solidFraction
      const end = progress * CFG.segments

      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = CFG.lineWidth * dpr
      ctx.strokeStyle = 'oklch(0.98 0.03 95 / 0.85)'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.setLineDash([])
      strokeRange(0, Math.min(end, solidCap), cx, cy, amp, ox, oy)

      if (end > solidCap && !solidOnly) {
        ctx.strokeStyle = 'oklch(0.98 0.03 95 / 0.55)'
        ctx.setLineDash([CFG.dash[0] * dpr, CFG.dash[1] * dpr])
        ctx.lineDashOffset = -dashOffset
        strokeRange(solidCap, end, cx, cy, amp, ox, oy)
        ctx.setLineDash([])
      }

      const doneAt = Math.max(
        solidOnly
          ? solidDrawMs
          : solidDrawMs + CFG.intro.dashDrawOnMs + CFG.intro.dashOffscreenMs,
        CFG.intro.expandDelayMs + CFG.intro.expandMs,
      )
      if (elapsed >= doneAt) complete = true

      if (!reduceMotion && !complete) {
        raf = requestAnimationFrame(render)
      }
    }

    raf = requestAnimationFrame(render)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [active, reduceMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={['absolute inset-0 h-full w-full', className].join(' ')}
    />
  )
}
