interface TestRunMarkProps {
  variant?: 'brand' | 'white'
  knockout?: string
  className?: string
}

export function TestRunMark({
  variant = 'brand',
  knockout = '#F39394',
  className = 'h-8 w-8',
}: TestRunMarkProps) {
  const fill = variant === 'white' ? '#FFFFFF' : '#F39394'
  const stroke = '#FFFFFF'
  const spots = variant === 'white' ? knockout : '#FFFFFF'
  const strokeWidth = variant === 'white' ? 4 : 6
  const upperSpot = variant === 'white' ? 11 : 8
  const lowerSpot = variant === 'white' ? 8 : 5.5

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      fill="none"
      role="img"
      aria-label="After Class"
      className={className}
    >
      <path
        d="M64 56
       C58 22 28 14 18 28
       C10 40 18 58 42 66
       C50 69 58 66 64 56Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M64 56
       C70 22 100 14 110 28
       C118 40 110 58 86 66
       C78 69 70 66 64 56Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M64 62
       C50 78 30 96 28 106
       C26 116 44 118 56 100
       C60 92 62 78 64 62Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M64 62
       C78 78 98 96 100 106
       C102 116 84 118 72 100
       C68 92 66 78 64 62Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <circle cx="38" cy="40" r={upperSpot} fill={spots} />
      <circle cx="90" cy="40" r={upperSpot} fill={spots} />
      <circle cx="44" cy="92" r={lowerSpot} fill={spots} />
      <circle cx="84" cy="92" r={lowerSpot} fill={spots} />
    </svg>
  )
}
