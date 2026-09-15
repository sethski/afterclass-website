import { ImageResponse } from 'next/og'

export const alt = 'After Class — The first move is showing up'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#4A1525',
          color: '#FEF9E6',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>After Class</div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.8 }}>
          The first move is showing up
        </div>
      </div>
    ),
    { ...size }
  )
}
