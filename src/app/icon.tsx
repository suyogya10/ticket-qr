import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Icon generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)', // cyan gradient
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 8, // smooth rounded borders
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        🎫
      </div>
    ),
    {
      ...size,
    }
  )
}
