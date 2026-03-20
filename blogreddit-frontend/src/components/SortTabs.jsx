import { useState } from 'react'

const TABS = ['NUEVO', 'TOP', 'HOT']

export default function SortTabs({ count }) {
  const [active, setActive] = useState(0)

  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
      <div style={{ display:'flex' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            style={{
              padding: '7px 16px',
              border: '2px solid #111008',
              borderLeft: i === 0 ? '2px solid #111008' : 'none',
              background: active === i ? '#111008' : '#FDFCF8',
              color: active === i ? '#6DC800' : '#6A6258',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'all .15s',
              borderRadius: i === 0 ? '2px 0 0 2px' : i === TABS.length-1 ? '0 2px 2px 0' : 0,
            }}
          >{tab}</button>
        ))}
      </div>
      {count != null && (
        <span style={{
          padding: '5px 12px',
          background: '#E8E4DC',
          border: '2px solid #C8C2B6',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, fontWeight: 700, color: '#6A6258',
          borderRadius: 2,
        }}>
          {count} posts
        </span>
      )}
    </div>
  )
}
