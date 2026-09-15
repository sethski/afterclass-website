'use client'

import Image from 'next/image'
import { useReducedMotion } from 'motion/react'

interface FlappingLogoProps {
  src?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

const TIMING = '0.72s cubic-bezier(0.32, 0.72, 0, 1) infinite'

/** Home page logo — rotateY wing beat (not used on waitlist flight). */
export function FlappingLogo({
  src = '/logo-mark.png',
  width = 128,
  height = 92,
  className = '',
  priority = false,
}: FlappingLogoProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: `min(28vw, ${width}px)`,
        aspectRatio: `${width} / ${height}`,
        perspective: '640px',
        animation: reduceMotion ? undefined : `ac-flap-body ${TIMING}`,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: 'inset(0 50% 0 0)',
          transformOrigin: '100% 50%',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          animation: reduceMotion ? undefined : `ac-flap-left ${TIMING}`,
        }}
      >
        <Image
          src={src}
          alt=""
          width={width}
          height={height}
          className="h-full w-full object-contain"
          priority={priority}
          unoptimized={src.endsWith('.png')}
        />
      </div>

      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: 'inset(0 0 0 50%)',
          transformOrigin: '0% 50%',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          animation: reduceMotion ? undefined : `ac-flap-right ${TIMING}`,
        }}
      >
        <Image
          src={src}
          alt=""
          width={width}
          height={height}
          className="h-full w-full object-contain"
          priority={priority}
          unoptimized={src.endsWith('.png')}
        />
      </div>
    </div>
  )
}
