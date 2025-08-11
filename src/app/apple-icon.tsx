import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F172A',
          borderRadius: '36px',
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Activity bars */}
          <rect x="6" y="18" width="3" height="6" rx="0.5" fill="#10B981"/>
          <rect x="10.5" y="14" width="3" height="10" rx="0.5" fill="#3B82F6"/>
          <rect x="15" y="10" width="3" height="14" rx="0.5" fill="#8B5CF6"/>
          <rect x="19.5" y="12" width="3" height="12" rx="0.5" fill="#EC4899"/>
          <rect x="24" y="16" width="3" height="8" rx="0.5" fill="#F59E0B"/>
          
          {/* GitHub-style dot */}
          <circle cx="16" cy="6" r="2" fill="#10B981"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}